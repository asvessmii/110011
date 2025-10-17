import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../utils";
import { MessageCircle, CheckSquare, FileText, User, AlertTriangle } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { name: "Chats", label: "Чаты", icon: MessageCircle, page: "Chats" },
    { name: "Tasks", label: "Задачи", icon: CheckSquare, page: "Tasks" },
    { name: "Orders", label: "Заявка", icon: FileText, page: "Orders" },
    { name: "Profile", label: "Профиль", icon: User, page: "Profile" },
    { name: "SOS", label: "SOS", icon: AlertTriangle, page: "SOS" }
  ];

  const isActive = (pageName) => {
    return location.pathname === createPageUrl(pageName);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>
        {`
          .nav-active {
            color: #000000;
          }
          .nav-inactive {
            color: #9E9E9E;
          }
        `}
      </style>

      <main className="flex-1 pb-20 overflow-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex justify-around items-center h-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.page);
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className="flex flex-col items-center gap-1 py-2 px-3 transition-colors"
                >
                  <Icon 
                    className={`w-6 h-6 ${active ? 'nav-active' : 'nav-inactive'}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className={`text-xs font-medium ${active ? 'nav-active' : 'nav-inactive'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}