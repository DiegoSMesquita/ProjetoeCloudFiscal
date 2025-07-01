import React, { useState } from "react";

export type Notification = {
  id: string;
  message: string;
  type?: "info" | "error" | "warning" | "success";
  read?: boolean;
  createdAt?: string;
};

export function NotificationsBell({ notifications, onMarkAllRead, onDeleteAll, onMarkRead }: {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onDeleteAll: () => void;
  onMarkRead: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-orange-100 transition"
        onClick={() => setOpen(o => !o)}
        aria-label="Notificações"
      >
        <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-pulse">{unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-xs bg-white border border-orange-200 rounded-xl shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-orange-100">
            <span className="font-bold text-orange-700">Notificações</span>
            <div className="flex gap-2">
              <button onClick={onMarkAllRead} className="text-xs text-orange-600 hover:underline">Marcar todas como lidas</button>
              <button onClick={onDeleteAll} className="text-xs text-red-500 hover:underline">Apagar todas</button>
            </div>
          </div>
          <ul className="max-h-72 overflow-y-auto divide-y divide-orange-50">
            {notifications.length === 0 && (
              <li className="p-4 text-center text-gray-400">Nenhuma notificação</li>
            )}
            {notifications.map(n => (
              <li key={n.id} className={`flex items-start gap-2 px-4 py-3 ${!n.read ? 'bg-orange-50' : ''}`}>
                <span className={`mt-1 w-2 h-2 rounded-full ${n.read ? 'bg-gray-300' : 'bg-orange-500'}`}></span>
                <div className="flex-1">
                  <div className="text-sm text-gray-800">{n.message}</div>
                  {n.createdAt && <div className="text-xs text-gray-400 mt-1">{n.createdAt}</div>}
                </div>
                {!n.read && (
                  <button onClick={() => onMarkRead(n.id)} className="text-xs text-orange-600 hover:underline ml-2">Marcar como lida</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
