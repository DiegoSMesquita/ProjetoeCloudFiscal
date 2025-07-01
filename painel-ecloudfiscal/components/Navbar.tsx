'use client'

import React, { useState, useEffect } from "react"
import { usePathname } from 'next/navigation'
import { NotificationsBell, Notification } from "./Notifications"

const NOTIFICATIONS_KEY = 'ecloudfiscal_notifications'

export function Navbar({ user }: { user?: any }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const pathname = usePathname();
  if (pathname === '/admin/login') return null;

  // Carregar notificações do localStorage ao iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(NOTIFICATIONS_KEY)
      if (saved) setNotifications(JSON.parse(saved))
    }
  }, [])

  // Salvar notificações no localStorage sempre que mudarem
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
    }
  }, [notifications])

  // Handlers
  const handleMarkAllRead = () => setNotifications(n => n.map(notif => ({ ...notif, read: true })))
  const handleDeleteAll = () => setNotifications([])
  const handleMarkRead = (id: string) => setNotifications(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif))

  // Ouvir evento global para adicionar notificações
  useEffect(() => {
    function onAddNotification(e: any) {
      setNotifications(n => [e.detail, ...n])
    }
    window.addEventListener('addNotification', onAddNotification)
    // Também ouvir no window.top se disponível (caso múltiplos roots)
    if (window.top && window.top !== window) {
      window.top.addEventListener('addNotification', onAddNotification)
    }
    return () => {
      window.removeEventListener('addNotification', onAddNotification)
      if (window.top && window.top !== window) {
        window.top.removeEventListener('addNotification', onAddNotification)
      }
    }
  }, [])

  // Botão de teste
  function addTestNotification() {
    setNotifications(n => [{
      id: Date.now().toString(),
      message: 'Notificação de teste! Se você vê isso, o sino está funcionando.',
      type: 'info',
      createdAt: new Date().toLocaleString(),
      read: false
    }, ...n])
  }

  return (
    <nav className="w-full flex items-center justify-between bg-white border-b border-orange-100 px-8 py-4 shadow-sm sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold text-orange-700 tracking-tight">Painel Administrador</span>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={addTestNotification} className="bg-orange-200 text-orange-700 px-2 py-1 rounded text-xs font-bold hover:bg-orange-300">Testar Notificação</button>
        <NotificationsBell
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onDeleteAll={handleDeleteAll}
          onMarkRead={handleMarkRead}
        />
        {user && (
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
            <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">{user.email?.[0]?.toUpperCase() || 'U'}</span>
            <span className="text-gray-700 text-sm font-medium">{user.email}</span>
          </div>
        )}
        <button className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 rounded-lg font-bold shadow hover:scale-105 transition-all">Sair</button>
      </div>
    </nav>
  )
}
