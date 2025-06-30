'use client'
import { Sidebar } from "../../components/Sidebar"
import { Navbar } from "../../components/Navbar"
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function PerfilPage() {
  const [user, setUser] = useState<any>(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) {
      const userObj = JSON.parse(u)
      setUser(userObj)
      setNome(userObj.nome || '')
      setEmail(userObj.email || '')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      await axios.put('http://localhost:8080/api/usuario', { nome, email, senha })
      setSuccessMsg('Perfil atualizado com sucesso!')
      setSenha('')
      // Atualiza localStorage
      const updatedUser = { ...user, nome, email }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch {
      setError('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
      setTimeout(() => setSuccessMsg(''), 2000)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 md:p-10 bg-gray-50 min-h-screen">
          <h1 className="text-2xl md:text-3xl font-extrabold text-orange-700 mb-8">Configuração do Perfil</h1>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100 max-w-xl mx-auto">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Nome</label>
                <input className="w-full p-3 rounded-xl border border-orange-200 bg-orange-50 text-gray-800 placeholder:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition" placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">E-mail</label>
                <input className="w-full p-3 rounded-xl border border-orange-200 bg-orange-50 text-gray-800 placeholder:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition" placeholder="Seu e-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Nova senha</label>
                <input className="w-full p-3 rounded-xl border border-orange-200 bg-orange-50 text-gray-800 placeholder:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition" placeholder="Nova senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} />
              </div>
              {error && <div className="text-red-500 text-center font-semibold animate-pulse text-sm mt-2">{error}</div>}
              {successMsg && <div className="text-green-600 text-center font-semibold animate-pulse text-sm mt-2">{successMsg}</div>}
              <button className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-3 rounded-xl font-bold shadow hover:scale-105 transition-all duration-200 focus:ring-2 focus:ring-orange-400/60 disabled:opacity-60 disabled:cursor-not-allowed mt-2" type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
