import React from "react";
import { base44 } from "../api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, Send, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";

export default function ChatRoomPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = React.useState("");
  const [imageFile, setImageFile] = React.useState(null);
  const messagesEndRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const chatId = urlParams.get('chatId');
  const contactName = urlParams.get('contactName') || 'Контакт';

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => base44.entities.Message.filter({ chat_id: chatId }, "created_date"),
    initialData: [],
    enabled: !!chatId,
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => base44.entities.Message.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      setMessage("");
    },
  });

  const updateChatMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Chat.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !chatId) return;

    const now = new Date();
    sendMessageMutation.mutate({
      chat_id: chatId,
      sender_name: user?.full_name || "Вы",
      text: message,
      is_outgoing: true,
      timestamp: now.toISOString()
    });

    updateChatMutation.mutate({
      id: chatId,
      data: {
        last_message: message,
        time: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        unread_count: 0
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartCall = (callType) => {
    navigate(createPageUrl("CallScreen") + `?contactName=${encodeURIComponent(contactName)}&callType=${callType}`);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.timestamp || msg.created_date).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl("Chats"))}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {contactName.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h2 className="font-semibold">{contactName}</h2>
              <p className="text-xs text-green-600">онлайн</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleStartCall('audio')}>
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleStartCall('video')}>
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1 max-w-xs">
                  <div className="h-16 bg-gray-200 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date}>
                <div className="flex justify-center mb-4">
                  <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 shadow-sm">
                    {date}
                  </span>
                </div>

                <AnimatePresence>
                  {msgs.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex gap-3 mb-4 ${msg.is_outgoing ? 'flex-row-reverse' : ''}`}
                    >
                      {!msg.is_outgoing && (
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">
                            {msg.sender_name?.substring(0, 2).toUpperCase() || "НА"}
                          </span>
                        </div>
                      )}

                      <div className={`max-w-[70%] ${msg.is_outgoing ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            msg.is_outgoing
                              ? 'bg-black text-white rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 px-2 block">
                          {formatMessageTime(msg.timestamp || msg.created_date)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-end gap-3 max-w-screen-xl mx-auto">
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Сообщение..."
              className="h-12 pr-12 rounded-2xl bg-gray-50 border-none text-base"
              disabled={sendMessageMutation.isPending}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="icon"
            className="h-12 w-12 rounded-full bg-black hover:bg-gray-800 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
