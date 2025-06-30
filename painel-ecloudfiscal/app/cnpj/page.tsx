'use client'
import { Sidebar } from "../../components/Sidebar"
import { Navbar } from "../../components/Navbar"
import { BuildingStorefrontIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function CnpjPage() {
  const [cnpjs, setCnpjs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [novoCnpj, setNovoCnpj] = useState('')
  const [novoNome, setNovoNome] = useState('')
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  // Filtro visual premium para CNPJs
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' }
  ]
  // Filtro CNPJ/Loja moderno
  const cnpjOptions = Array.from(new Set(cnpjs.map(x => x.cnpj))).map(cnpj => ({ value: cnpj, label: cnpj }))
  const [selectedCnpj, setSelectedCnpj] = useState('')
  const filteredCnpjs = cnpjs.filter(c =>
    (selectedCnpj === '' || c.cnpj === selectedCnpj) &&
    (c.cnpj.toLowerCase().includes(search.toLowerCase()) ||
    c.nome_loja.toLowerCase().includes(search.toLowerCase())) &&
    (selectedStatus === '' || (c.status || 'ativo') === selectedStatus) &&
    (!periodStart || !periodEnd || (c.data >= periodStart && c.data <= periodEnd))
  )

  useEffect(() => {
    fetchCnpjs()
  }, [])

  const fetchCnpjs = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get('http://localhost:8080/api/cnpjs')
      setCnpjs(res.data)
    } catch {
      setError('Erro ao buscar CNPJs')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (cnpj: string) => {
    setSelected(cnpj)
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    user.selectedCnpj = cnpj
    localStorage.setItem('user', JSON.stringify(user))
    setSuccessMsg('CNPJ selecionado!')
    setTimeout(() => setSuccessMsg(''), 2000)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    setSuccessMsg('')
    try {
      await axios.post('http://localhost:8080/api/cnpjs', { cnpj: novoCnpj, nome_loja: novoNome })
      setNovoCnpj('')
      setNovoNome('')
      fetchCnpjs()
      setSuccessMsg('CNPJ adicionado!')
    } catch {
      setError('Erro ao adicionar CNPJ')
    } finally {
      setAdding(false)
      setTimeout(() => setSuccessMsg(''), 2000)
    }
  }

  const handleRemove = async (cnpj: string) => {
    if (!window.confirm('Remover este CNPJ?')) return
    setRemoving(cnpj)
    setSuccessMsg('')
    try {
      await axios.delete(`http://localhost:8080/api/cnpjs/${cnpj}`)
      fetchCnpjs()
      setSuccessMsg('CNPJ removido!')
    } catch {
      setError('Erro ao remover CNPJ')
    } finally {
      setRemoving(null)
      setTimeout(() => setSuccessMsg(''), 2000)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 md:p-10 bg-gray-50 min-h-screen">
          <h1 className="text-2xl md:text-3xl font-extrabold text-orange-700 mb-8 flex items-center gap-3">
            <BuildingStorefrontIcon className="h-8 w-8 text-orange-500" />
            CNPJs Vinculados
          </h1>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100 max-w-2xl mx-auto mb-8">
            <form className="flex flex-col md:flex-row gap-4 items-end" onSubmit={handleAdd}>
              <div className="flex-1">
                <label className="block text-gray-700 font-semibold mb-1">Novo CNPJ</label>
                <input className="w-full p-3 rounded-xl border border-orange-200 bg-orange-50 text-gray-800 placeholder:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition" placeholder="Digite o CNPJ" value={novoCnpj} onChange={e => setNovoCnpj(e.target.value)} required />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 font-semibold mb-1">Nome da Loja</label>
                <input className="w-full p-3 rounded-xl border border-orange-200 bg-orange-50 text-gray-800 placeholder:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition" placeholder="Nome da loja" value={novoNome} onChange={e => setNovoNome(e.target.value)} required />
              </div>
              <button type="submit" disabled={adding} className="bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-3 rounded-xl font-bold shadow flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-60">
                <PlusIcon className="h-5 w-5" /> {adding ? 'Adicionando...' : 'Adicionar'}
              </button>
            </form>
          </div>
          {successMsg && <div className="mb-4 text-green-600 font-bold text-center animate-pulse">{successMsg}</div>}
          {/* Filtros modernos (CNPJ/Loja, busca, status, período) - DEBUG VISUAL */}
          <div style={{ background: '#fffbe6', border: '2px solid #ffa500', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {/* CNPJ/Loja moderno */}
              <div style={{ minWidth: 180, flex: 1 }}>
                <label style={{ color: '#b45309', fontWeight: 600, marginBottom: 4, display: 'block' }}>CNPJ/Loja</label>
                <select
                  style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #fdba74', background: '#fff7ed', color: '#78350f' }}
                  value={selectedCnpj}
                  onChange={e => setSelectedCnpj(e.target.value)}
                >
                  <option value="">Todos</option>
                  {cnpjOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {/* Busca moderna */}
              <div style={{ minWidth: 200, flex: 1, position: 'relative' }}>
                <label style={{ color: '#b45309', fontWeight: 600, marginBottom: 4, display: 'block' }}>Buscar</label>
                <input
                  type="text"
                  style={{ padding: 12, borderRadius: 12, border: '1px solid #fdba74', background: '#fff7ed', color: '#78350f', width: '100%', paddingLeft: 36 }}
                  placeholder="Buscar CNPJ ou Loja..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <MagnifyingGlassIcon style={{ position: 'absolute', left: 8, top: 38, width: 20, height: 20, color: '#fdba74', pointerEvents: 'none' }} />
              </div>
              {/* Status moderno */}
              <div style={{ minWidth: 180, flex: 1 }}>
                <label style={{ color: '#b45309', fontWeight: 600, marginBottom: 4, display: 'block' }}>Status</label>
                <select
                  style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid #fdba74', background: '#fff7ed', color: '#78350f' }}
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {/* Período: início e fim */}
              <div style={{ minWidth: 180, flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ color: '#b45309', fontWeight: 600, marginBottom: 4 }}>Período</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="date"
                    style={{ padding: 12, borderRadius: 12, border: '1px solid #fdba74', background: '#fff7ed', color: '#78350f', flex: 1 }}
                    value={periodStart}
                    onChange={e => setPeriodStart(e.target.value)}
                  />
                  <span style={{ alignSelf: 'center', color: '#a3a3a3' }}>até</span>
                  <input
                    type="date"
                    style={{ padding: 12, borderRadius: 12, border: '1px solid #fdba74', background: '#fff7ed', color: '#78350f', flex: 1 }}
                    value={periodEnd}
                    onChange={e => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-orange-100 max-w-2xl mx-auto">
            {loading ? (
              <div className="text-center text-orange-600 py-8 font-bold">Carregando CNPJs...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8 font-bold">{error}</div>
            ) : (
              <table className="min-w-full text-gray-700 text-sm">
                <thead>
                  <tr className="border-b border-orange-100">
                    <th className="p-2 text-left font-semibold">CNPJ</th>
                    <th className="p-2 text-left font-semibold">Loja</th>
                    <th className="p-2 text-left font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCnpjs.map((c: any, idx: number) => (
                    <tr key={c.cnpj || idx} className={idx % 2 === 0 ? "bg-orange-50 hover:bg-orange-100 transition" : "hover:bg-orange-50 transition"}>
                      <td className="p-2 font-medium">{c.cnpj}</td>
                      <td className="p-2">{c.nome_loja}</td>
                      <td className="p-2 flex gap-2">
                        <button onClick={() => handleSelect(c.cnpj)} className={`bg-gradient-to-r from-orange-600 to-orange-500 text-white px-3 py-1 rounded shadow font-semibold hover:scale-105 transition-all ${selected === c.cnpj ? 'ring-2 ring-orange-400' : ''}`}>Selecionar</button>
                        <button onClick={() => handleRemove(c.cnpj)} disabled={removing === c.cnpj} className="bg-gradient-to-r from-red-500 to-red-700 text-white px-3 py-1 rounded shadow font-semibold hover:scale-105 transition-all disabled:opacity-60 flex items-center gap-1">
                          <TrashIcon className="h-4 w-4" />
                          {removing === c.cnpj ? 'Removendo...' : 'Remover'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
