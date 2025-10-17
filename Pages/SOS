
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function SOSPage() {
  const [countdown, setCountdown] = React.useState(null);
  const [isActive, setIsActive] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);
  const [sosStatus, setSosStatus] = React.useState('idle'); // idle, countdown, sent

  React.useEffect(() => {
    let interval;
    if (countdown !== null && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setSosStatus('sent');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleSlideStart = () => {
    setShowDialog(true);
  };

  const handleConfirmSOS = () => {
    setCountdown(3);
    setSosStatus('countdown');
    setIsActive(true);
    setShowDialog(false);
  };

  const handleCancel = () => {
    setCountdown(null);
    setSosStatus('idle');
    setIsActive(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3e%3ctext x='15' y='50' font-size='16' font-weight='bold' fill='black' transform='rotate(-45 40 40)'%3esos%3c/text%3e%3c/svg%3e")`,
          backgroundRepeat: 'repeat',
        }}
      />

      <div className="relative">
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Экстренная помощь</h1>
              <p className="text-gray-600 text-sm">Быстрый вызов службы безопасности</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-8">
          <AnimatePresence mode="wait">
            {sosStatus === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-12">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-64 h-64 bg-red-500 rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <AlertTriangle className="w-32 h-32 text-white" strokeWidth={2.5} />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-red-400 rounded-full -z-10"
                  />
                </div>

                <h2 className="text-2xl font-bold mb-3 text-center">Экстренный вызов</h2>
                <p className="text-gray-600 text-center mb-8 max-w-sm">
                  Проведите слайдер вправо для немедленного вызова помощи
                </p>

                <div className="w-full max-w-md">
                  <button
                    onClick={handleSlideStart}
                    className="w-full h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">→</span>
                    Слайд для SOS
                    <span className="text-2xl">→</span>
                  </button>
                </div>
              </motion.div>
            )}

            {sosStatus === 'countdown' && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-64 h-64 bg-red-500 rounded-full flex items-center justify-center shadow-2xl mb-12"
                >
                  <span className="text-9xl font-bold text-white">{countdown}</span>
                </motion.div>

                <h2 className="text-2xl font-bold mb-3 text-center">Отправка SOS сигнала...</h2>
                <p className="text-gray-600 text-center mb-8">
                  Нажмите отмену для прерывания
                </p>

                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="h-14 px-8 rounded-xl font-semibold border-2"
                >
                  Отменить
                </Button>
              </motion.div>
            )}

            {sosStatus === 'sent' && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-64 h-64 bg-red-500 rounded-full flex items-center justify-center shadow-2xl mb-12"
                >
                  <span className="text-9xl font-bold text-white">!</span>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center"
                >
                  <h2 className="text-3xl font-bold mb-3">SOS сигнал отправлен!</h2>
                  <p className="text-gray-600 text-lg mb-8">Помощь уже в пути</p>

                  <div className="bg-white rounded-2xl p-4 shadow-lg inline-flex items-center gap-2 mb-8">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-gray-600">
                      Ваше местоположение будет передано СБР
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-3xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              Подтверждение действия
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-base py-4 text-gray-700">
            Вы уверены, что хотите отправить экстренный сигнал? Служба безопасности будет немедленно уведомлена.
          </DialogDescription>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="flex-1 h-12 rounded-xl"
            >
              Отмена
            </Button>
            <Button
              onClick={handleConfirmSOS}
              className="flex-1 h-12 bg-red-500 hover:bg-red-600 rounded-xl"
            >
              Подтвердить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
