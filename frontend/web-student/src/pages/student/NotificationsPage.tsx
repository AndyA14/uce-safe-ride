import React from 'react';
import { Bell } from 'lucide-react';
const NotificationsPage = () => (
  <div className="p-10 flex flex-col items-center justify-center h-[50vh] text-gray-400">
    <Bell className="w-16 h-16 mb-4 opacity-20" />
    <h2 className="text-xl font-bold">Notificaciones</h2>
    <p>Centro de mensajes y alertas.</p>
  </div>
);
export default NotificationsPage;