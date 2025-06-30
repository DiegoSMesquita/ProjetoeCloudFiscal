import React from "react"

export function Navbar({ user }: { user?: any }) {
  return (
    <nav className="w-full flex items-center justify-between bg-white border-b border-orange-100 px-8 py-4 shadow-sm sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold text-orange-700 tracking-tight">Painel do Cliente</span>
      </div>
      <div className="flex items-center gap-4">
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
