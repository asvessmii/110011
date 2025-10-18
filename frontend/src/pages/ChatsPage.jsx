import React from "react";
import { base44 } from "../api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, X } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function ChatsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const [userCode, setUserCode] = React.useState("");
  const [searchError, setSearchError] = React.useState("");
  const [foundUser, setFoundUser] = React.useState(null);

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => base44.entities.Chat.list("-created_date"),
    initialData: [],
  });

  const searchUserMutation = useMutation({
    mutationFn: (code) => base44.auth.searchByCode(code),
    onSuccess: (data) => {
      setFoundUser(data);
      setSearchError("");
    },
    onError: (error) => {
      setFoundUser(null);
      setSearchError(error.response?.data?.detail || "Пользователь не найден");
    },
  });

  const createChatMutation = useMutation({
    mutationFn: (targetUserId) => base44.entities.Chat.createWithUser(targetUserId),
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setIsSearchModalOpen(false);
      setUserCode("");
      setFoundUser(null);
      // Open the chat
      navigate(createPageUrl("ChatRoom") + `?chatId=${chat.id}&contactName=${encodeURIComponent(chat.contact_name)}`);
    },
  });

  const filteredChats = chats.filter(chat =>
    chat.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openChat = (chat) => {
    navigate(createPageUrl("ChatRoom") + `?chatId=${chat.id}&contactName=${encodeURIComponent(chat.contact_name)}`);
  };

  const handleSearchUser = () => {
    if (!userCode.trim()) {
      setSearchError("Введите код пользователя");
      return;
    }
    searchUserMutation.mutate(userCode.trim().toUpperCase());
  };

  const handleStartChat = () => {
    if (foundUser) {
      createChatMutation.mutate(foundUser.id);
    }
  };

  const handleOpenModal = () => {
    setIsSearchModalOpen(true);
    setUserCode("");
    setFoundUser(null);
    setSearchError("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Чаты</h1>
          <div className="flex gap-3">
            <Button variant="ghost" size="icon" className="rounded-full bg-gray-100">
              <Search className="w-5 h-5" />
            </Button>
            <Button 
              onClick={handleOpenModal}
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Поиск чатов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 bg-gray-50 border-none rounded-2xl text-base"
          />
        </div>
      </div>

      <div className="px-4 py-2">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChats.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">У вас пока нет чатов</p>
                <Button onClick={handleOpenModal} className="bg-black hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Начать общение
                </Button>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => openChat(chat)}
                  className="bg-white rounded-2xl p-4 shadow-sm active:scale-98 transition-transform cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {chat.contact_name?.substring(0, 2).toUpperCase() || "НА"}
                        </span>
                      </div>
                      {chat.is_online && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-base truncate">
                          {chat.contact_name}
                        </h3>
                        <span className="text-sm text-gray-500">{chat.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{chat.last_message}</p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {chat.unread_count > 0 && (
                        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{chat.unread_count}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Search User Modal */}
      <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Найти собеседника</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Код пользователя</label>
              <div className="flex gap-2">
                <Input
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value.toUpperCase())}
                  placeholder="Введите код (например: ADMIN1)"
                  className="flex-1"
                  maxLength={6}
                />
                <Button 
                  onClick={handleSearchUser}
                  disabled={searchUserMutation.isPending}
                  className="bg-black hover:bg-gray-800"
                >
                  {searchUserMutation.isPending ? "..." : "Найти"}
                </Button>
              </div>
              {searchError && (
                <p className="text-sm text-red-500">{searchError}</p>
              )}
            </div>

            {foundUser && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-xl p-4 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {foundUser.full_name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{foundUser.full_name}</h3>
                    <p className="text-sm text-gray-500">Код: {foundUser.user_code}</p>
                  </div>
                </div>
                <Button 
                  onClick={handleStartChat}
                  disabled={createChatMutation.isPending}
                  className="w-full bg-black hover:bg-gray-800"
                >
                  {createChatMutation.isPending ? "Открытие чата..." : "Начать общение"}
                </Button>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
