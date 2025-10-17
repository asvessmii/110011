export const createPageUrl = (pageName) => {
  const routes = {
    Chats: '/chats',
    ChatRoom: '/chat',
    Tasks: '/tasks',
    Orders: '/orders',
    Profile: '/profile',
    EditProfile: '/profile/edit',
    SOS: '/sos',
    SecuritySettings: '/profile/security',
    AppSettings: '/profile/settings',
  };
  return routes[pageName] || '/';
};