import React from "react";
import { base44 } from "../api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Droplet, Cigarette, Zap, ShoppingCart, Minus, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrdersPage() {
  const [cart, setCart] = React.useState({});
  const [showSuccess, setShowSuccess] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list("-created_date"),
    initialData: [],
  });

  const createOrderMutation = useMutation({
    mutationFn: (orderData) => base44.entities.Order.create(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setCart({});
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const products = [
    { category: 'water', icon: Droplet, name: 'Вода', items: ['0.5л', '1л', '1.5л', '5л'] },
    { category: 'cigarettes', icon: Cigarette, name: 'Сигареты', items: ['Kent', 'Marlboro', 'Winston', 'Parliament'] },
    { category: 'stimulants', icon: Zap, name: 'Стимуляторы', items: ['Кофеин', 'Энергетик', 'Витамины'] }
  ];

  const updateQuantity = (item, delta) => {
    setCart(prev => ({
      ...prev,
      [item]: Math.max(0, (prev[item] || 0) + delta)
    }));
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleSubmitOrder = () => {
    const items = Object.entries(cart)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => ({ product_name: name, quantity: qty }));

    if (items.length === 0) return;

    const orderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;
    createOrderMutation.mutate({
      order_number: orderNumber,
      status: 'processing',
      items: items,
      total_items: getTotalItems()
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'processing':
        return 'Обрабатывается';
      case 'ready':
        return 'Готова';
      default:
        return 'Завершена';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-6 pt-12 pb-6">
        <h1 className="text-3xl font-bold mb-2">Заявки</h1>
        <p className="text-gray-600">Заказ необходимых товаров</p>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3 text-green-800">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Заявка успешно отправлена!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 py-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-4">Доступные товары</h2>
          
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <div key={product.category} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">{product.name}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {product.items.map((item) => {
                    const quantity = cart[item] || 0;
                    return (
                      <motion.div
                        key={item}
                        className="bg-white rounded-2xl p-4 shadow-sm relative"
                      >
                        {quantity > 0 && (
                          <div className="absolute -top-2 -right-2 w-7 h-7 bg-black rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{quantity}</span>
                          </div>
                        )}
                        
                        <p className="font-semibold mb-3">{item}</p>
                        
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item, -1)}
                            className="h-10 w-10 rounded-full"
                            disabled={quantity === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          
                          <span className="flex-1 text-center font-bold text-lg">
                            {quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item, 1)}
                            className="h-10 w-10 rounded-full"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {orders.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Мои заявки</h2>
            <div className="space-y-3">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">Заявка {order.order_number}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.created_date).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.items?.map(i => `${i.product_name} x${i.quantity}`).join(', ')}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {getTotalItems() > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-20 left-0 right-0 px-6"
          >
            <Button
              onClick={handleSubmitOrder}
              disabled={createOrderMutation.isPending}
              className="w-full h-16 bg-black hover:bg-gray-800 rounded-2xl text-white font-bold text-lg shadow-2xl"
            >
              <ShoppingCart className="w-5 h-5 mr-3" />
              Отправить заявку ({getTotalItems()} {getTotalItems() === 1 ? 'товар' : 'товаров'})
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
