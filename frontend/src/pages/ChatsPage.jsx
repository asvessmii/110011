import React from "react";
import { base44 } from "../api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function ChatsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => base44.entities.Chat.list("-created_date"),
    initialData: [],
  });

  const filteredChats = chats.filter(chat =>
    chat.contact_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openChat = (chat) => {
    navigate(createPageUrl("ChatRoom") + `?chatId=${chat.id}&contactName=${encodeURIComponent(chat.contact_name)}`);
  };

  const startCall = (e, chat, callType) => {
    e.stopPropagation();
    navigate(createPageUrl("CallScreen") + `?contactName=${encodeURIComponent(chat.contact_name)}&callType=${callType}`);
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
            <Button variant="ghost" size="icon" className="rounded-full bg-gray-100">
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
            {filteredChats.map((chat) => (
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
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => startCall(e, chat, 'audio')}
                      >
                        <Phone className="w-4 h-4 text-gray-400" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => startCall(e, chat, 'video')}
                      >
                        <Video className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
