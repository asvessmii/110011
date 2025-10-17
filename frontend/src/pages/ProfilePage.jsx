import React from "react";
import { base44 } from "../api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Bell, Sun, Shield, Settings, LogOut, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  const getInitials = (name) => {
    return name?.substring(0, 2).toUpperCase() || "ИИ";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 pt-12 pb-6">
        <h1 className="text-3xl font-bold mb-2">Профиль</h1>
        <p className="text-gray-600">Управление учетной записью</p>
      </div>

      <div className="px-6 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-white font-bold text-2xl">
                        {getInitials(user?.full_name)}
                    </span>
                )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">
                {user?.full_name || "Иван Иванов"}
              </h2>
              <p className="text-gray-600 mb-2">
                {user?.email || "ivan.ivanov@example.com"}
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                  Безопасность
                </span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium">
                  ID: VAS
                </span>
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={() => navigate(createPageUrl("EditProfile"))}
            className="w-full h-12 rounded-xl font-semibold"
          >
            Редактировать профиль
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <h3 className="text-xl font-bold mb-6">Настройки</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-gray-700" />
                </div>
                <span className="font-medium">Уведомления</span>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Sun className="w-5 h-5 text-gray-700" />
                </div>
                <span className="font-medium">Темная тема</span>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <button onClick={() => navigate(createPageUrl("SecuritySettings"))} className="flex items-center justify-between w-full py-3 hover:bg-gray-50 rounded-xl px-2 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-700" />
                </div>
                <span className="font-medium">Безопасность</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button onClick={() => navigate(createPageUrl("AppSettings"))} className="flex items-center justify-between w-full py-3 hover:bg-gray-50 rounded-xl px-2 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gray-700" />
                </div>
                <span className="font-medium">Настройки</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-14 rounded-2xl text-red-600 border-red-200 hover:bg-red-50 font-semibold"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Выйти из аккаунта
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
