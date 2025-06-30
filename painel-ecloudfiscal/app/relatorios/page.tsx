'use client'
import { Sidebar } from "../../components/Sidebar"
import { Navbar } from "../../components/Navbar"
import { BanknotesIcon, DocumentTextIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid'
import { useEffect, useState } from 'react'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'

export default function RelatoriosPage() {
  const [relatorios, setRelatorios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [periodoInicio, setPeriodoInicio] = useState<Date | null>(null)
  const [periodoFim, setPeriodoFim] = useState<Date | null>(null)
  const [gerando, setGerando] = useState(false)
  const [tipoRelatorio, setTipoRelatorio] = useState('pdf')
  const [relatorioGerado, setRelatorioGerado] = useState<any | null>(null)

  const tiposRelatorio = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'tabela', label: 'Visualizar na tela' },
  ]

  useEffect(() => {
    fetchRelatorios()
  }, [])

  const fetchRelatorios = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await axios.get('http://localhost:8080/api/relatorios')
      setRelatorios(res.data)
    } catch {
      setError('Erro ao buscar relatórios')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (relatorio: any) => {
    setDownloading(relatorio.id)
    try {
      const res = await axios.get(`http://localhost:8080/api/relatorios/${relatorio.id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', relatorio.nome || `relatorio-${relatorio.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      setSuccessMsg('Download realizado!')
      setTimeout(() => setSuccessMsg(''), 2000)
    } finally {
      setDownloading(null)
    }
  }

  const handleGerarRelatorio = async () => {
    setGerando(true)
    try {
      // Exemplo de chamada para gerar relatório
      const res = await axios.post('http://localhost:8080/api/relatorios', {
        inicio: periodoInicio?.toISOString().slice(0, 10),
        fim: periodoFim?.toISOString().slice(0, 10),
        tipo: tipoRelatorio
      })
      setRelatorioGerado(res.data)
      await fetchRelatorios()
      setShowModal(false)
      setPeriodoInicio(null)
      setPeriodoFim(null)
    } finally {
      setGerando(false)
    }
  }

  // Cálculos dos cards
  const totalNotas = relatorios.reduce((acc, r) => acc + (r.valor || 0), 0)
  const totalAprovadas = relatorios.filter(r => r.status === 'aprovado').reduce((acc, r) => acc + (r.valor || 0), 0)
  const totalRejeitadas = relatorios.filter(r => r.status === 'rejeitado').reduce((acc, r) => acc + (r.valor || 0), 0)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 md:p-10 bg-gray-50 min-h-screen">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-orange-700">Relatórios</h1>
            <button onClick={() => setShowModal(true)} className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-2 rounded-lg font-bold shadow hover:scale-105 transition-all flex items-center gap-2">
              <ArrowDownTrayIcon className="h-5 w-5" />
              Gerar Relatório
            </button>
          </div>
          {/* Modal para escolher período */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-4">
                <h2 className="text-lg font-bold text-orange-700 mb-2">Escolha o Período e Tipo de Relatório</h2>
                <div className="flex gap-4">
                  <div className="relative w-full">
                    <label className="block mb-2 font-semibold text-orange-700">Início</label>
                    <span className="absolute left-2 top-9 text-orange-400 pointer-events-none">
                      <CalendarDaysIcon className="w-5 h-5" />
                    </span>
                    <DatePicker
                      selected={periodoInicio}
                      onChange={setPeriodoInicio}
                      dateFormat="dd/MM/yyyy"
                      className="pl-8 p-2 border rounded w-full bg-orange-50 border-orange-300 text-orange-900 focus:ring-2 focus:ring-orange-400/60"
                      placeholderText="DD/MM/AAAA"
                      calendarClassName="z-50"
                      calendarContainer={props => (
                        <div>
                          <div className="flex gap-2 p-2 pb-0">
                            <button type="button" onClick={() => {
                              const end = periodoFim || new Date();
                              const start = new Date(end);
                              start.setDate(end.getDate() - 29);
                              setPeriodoInicio(start);
                              setPeriodoFim(end);
                            }} className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200 hover:bg-orange-200 transition">Últimos 30 dias</button>
                            <button type="button" onClick={() => {
                              const end = periodoFim || new Date();
                              const start = new Date(end);
                              start.setDate(end.getDate() - 14);
                              setPeriodoInicio(start);
                              setPeriodoFim(end);
                            }} className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200 hover:bg-orange-200 transition">Últimos 15 dias</button>
                          </div>
                          {props.children}
                        </div>
                      )}
                    />
                  </div>
                  <div className="relative w-full">
                    <label className="block mb-2 font-semibold text-orange-700">Fim</label>
                    <span className="absolute left-2 top-9 text-orange-400 pointer-events-none">
                      <CalendarDaysIcon className="w-5 h-5" />
                    </span>
                    <DatePicker
                      selected={periodoFim}
                      onChange={setPeriodoFim}
                      dateFormat="dd/MM/yyyy"
                      className="pl-8 p-2 border rounded w-full bg-orange-50 border-orange-300 text-orange-900 focus:ring-2 focus:ring-orange-400/60"
                      placeholderText="DD/MM/AAAA"
                      calendarClassName="z-50"
                      calendarContainer={props => (
                        <div>
                          <div className="flex gap-2 p-2 pb-0">
                            <button type="button" onClick={() => {
                              const end = new Date();
                              const start = new Date(end);
                              start.setDate(end.getDate() - 29);
                              setPeriodoInicio(start);
                              setPeriodoFim(end);
                            }} className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200 hover:bg-orange-200 transition">Últimos 30 dias</button>
                            <button type="button" onClick={() => {
                              const end = new Date();
                              const start = new Date(end);
                              start.setDate(end.getDate() - 14);
                              setPeriodoInicio(start);
                              setPeriodoFim(end);
                            }} className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200 hover:bg-orange-200 transition">Últimos 15 dias</button>
                          </div>
                          {props.children}
                        </div>
                      )}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-orange-700">Tipo de Relatório</label>
                  <select className="w-full p-2 border rounded bg-orange-50 border-orange-300 text-orange-900" value={tipoRelatorio} onChange={e => setTipoRelatorio(e.target.value)}>
                    {tiposRelatorio.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded border border-orange-400 text-orange-700 font-semibold bg-white hover:bg-orange-50 transition">Cancelar</button>
                  <button onClick={handleGerarRelatorio} disabled={gerando || !periodoInicio || !periodoFim} className="px-4 py-2 rounded bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold shadow disabled:opacity-60">
                    {gerando ? 'Gerando...' : 'Gerar'}
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 text-orange-700 shadow-lg flex flex-col items-center border border-orange-100 min-h-[120px] justify-center">
              <div className="bg-orange-100 rounded-full p-3 mb-2 flex items-center justify-center"><BanknotesIcon className="h-8 w-8 text-orange-500" /></div>
              <span className="text-2xl font-bold">R$ {totalNotas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span className="text-orange-400 mt-1 text-sm">Total de Notas</span>
            </div>
            <div className="bg-white rounded-2xl p-6 text-orange-700 shadow-lg flex flex-col items-center border border-orange-100 min-h-[120px] justify-center">
              <div className="bg-orange-100 rounded-full p-3 mb-2 flex items-center justify-center"><ArrowTrendingUpIcon className="h-8 w-8 text-orange-500" /></div>
              <span className="text-2xl font-bold">R$ {totalAprovadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span className="text-orange-400 mt-1 text-sm">Notas Aprovadas</span>
            </div>
            <div className="bg-white rounded-2xl p-6 text-orange-700 shadow-lg flex flex-col items-center border border-orange-100 min-h-[120px] justify-center">
              <div className="bg-orange-100 rounded-full p-3 mb-2 flex items-center justify-center"><ArrowTrendingDownIcon className="h-8 w-8 text-orange-500" /></div>
              <span className="text-2xl font-bold">R$ {totalRejeitadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              <span className="text-orange-400 mt-1 text-sm">Notas Rejeitadas</span>
            </div>
          </div>
          {successMsg && <div className="mb-4 text-green-600 font-bold text-center animate-pulse">{successMsg}</div>}
          <div className="bg-white rounded-2xl p-4 shadow-lg overflow-x-auto border border-orange-100">
            {loading ? (
              <div className="text-center text-orange-600 py-8 font-bold">Carregando relatórios...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8 font-bold">{error}</div>
            ) : (
              <table className="min-w-full text-gray-700 text-sm">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-orange-100">
                    <th className="p-2 text-left font-semibold">Relatório</th>
                    <th className="p-2 text-left font-semibold">Período</th>
                    <th className="p-2 text-left font-semibold">Valor</th>
                    <th className="p-2 text-left font-semibold">Status</th>
                    <th className="p-2 text-left font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorios.map((r: any, idx: number) => (
                    <tr key={r.id || idx} className={idx % 2 === 0 ? "bg-orange-50 hover:bg-orange-100 transition" : "hover:bg-orange-50 transition"}>
                      <td className="p-2 font-medium">{r.nome || r.tipo || 'Relatório'}</td>
                      <td className="p-2">{r.periodo || '-'}</td>
                      <td className="p-2">R$ {r.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="p-2">
                        <span className={
                          r.status === 'aprovado' ? 'text-green-500 font-bold' :
                          r.status === 'pendente' ? 'text-yellow-500 font-bold' :
                          'text-red-500 font-bold'
                        }>{r.status}</span>
                      </td>
                      <td className="p-2 flex gap-2">
                        <button onClick={() => handleDownload(r)} disabled={downloading === r.id} className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-3 py-1 rounded shadow font-semibold hover:scale-105 transition-all disabled:opacity-60 flex items-center gap-2">
                          <ArrowDownTrayIcon className="h-5 w-5" />
                          {downloading === r.id ? 'Baixando...' : 'PDF'}
                        </button>
                        <button onClick={() => window.open(`http://localhost:8080/api/relatorios/${r.id}/excel`, '_blank')} className="bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-1 rounded shadow font-semibold hover:scale-105 transition-all flex items-center gap-2">
                          <ArrowDownTrayIcon className="h-5 w-5" />
                          Excel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {relatorioGerado && tipoRelatorio === 'tabela' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 w-full mb-8 mt-4">
              <h2 className="text-lg font-bold text-orange-700 mb-4">Visualização do Relatório</h2>
              <table className="min-w-full text-gray-700 text-sm">
                <thead>
                  <tr>
                    {relatorioGerado.colunas?.map((col: string) => (
                      <th key={col} className="p-2 text-left font-semibold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {relatorioGerado.linhas?.map((linha: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-orange-50" : ""}>
                      {linha.map((cell: any, i: number) => (
                        <td key={i} className="p-2">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex gap-2 mt-4">
                <button onClick={() => window.open(relatorioGerado.pdf, '_blank')} className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 rounded shadow font-semibold flex items-center gap-2">
                  <ArrowDownTrayIcon className="h-5 w-5" /> PDF
                </button>
                <button onClick={() => window.open(relatorioGerado.excel, '_blank')} className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded shadow font-semibold flex items-center gap-2">
                  <ArrowDownTrayIcon className="h-5 w-5" /> Excel
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
