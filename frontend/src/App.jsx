import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// App pages
import Layout from './components/Layout';
import ChatsPage from './pages/ChatsPage';
import ChatRoomPage from './pages/ChatRoomPage';
import TasksPage from './pages/TasksPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import SOSPage from './pages/SOSPage';
import SecuritySettingsPage from './pages/SecuritySettingsPage';
import AppSettingsPage from './pages/AppSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/chats" replace />;
  }
  
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            
            <Route path="/" element={<Navigate to="/chats" replace />} />
            
            <Route path="/chats" element={<PrivateRoute><Layout><ChatsPage /></Layout></PrivateRoute>} />
            <Route path="/chat" element={<PrivateRoute><ChatRoomPage /></PrivateRoute>} />
            <Route path="/tasks" element={<PrivateRoute><Layout><TasksPage /></Layout></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><Layout><OrdersPage /></Layout></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />
            <Route path="/profile/edit" element={<PrivateRoute><EditProfilePage /></PrivateRoute>} />
            <Route path="/sos" element={<PrivateRoute><Layout><SOSPage /></Layout></PrivateRoute>} />
            <Route path="/profile/security" element={<PrivateRoute><SecuritySettingsPage /></PrivateRoute>} />
            <Route path="/profile/settings" element={<PrivateRoute><AppSettingsPage /></PrivateRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;