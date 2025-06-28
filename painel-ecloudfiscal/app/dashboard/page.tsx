'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [status, setStatus] = useState('Carregando...')
  const [lastSync, setLastSync] = useState('')

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
    // Exemplo: buscar status do app desktop
    axios.get('http://localhost:8080/api/health')
      .then(res => setStatus(res.data.status === 'ok' ? 'Online' : 'Offline'))
      .catch(() => setStatus('Offline'))
    // Exemplo: buscar última sincronização (mock)
    setLastSync('2025-06-27 14:32')
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6">
          <h2 className="font-semibold mb-2">Status do App Desktop</h2>
          <div className={status === 'Online' ? 'text-green-600' : 'text-red-600'}>{status}</div>
          <div className="text-sm text-gray-500 mt-2">Última sincronização: {lastSync}</div>
        </div>
        <div className="bg-white rounded shadow p-6">
          <h2 className="font-semibold mb-2">Bem-vindo, {user?.email || 'Usuário'}</h2>
          <div className="text-gray-700">CNPJ ativo: {user?.selectedCnpj || 'Nenhum selecionado'}</div>
        </div>
      </div>
    </div>
  )
}
