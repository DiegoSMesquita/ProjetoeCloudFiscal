'use client'
import { Sidebar } from "../../components/Sidebar"
// import { Navbar } from "../../components/Navbar" // Removido para evitar múltiplas instâncias
import { BanknotesIcon, DocumentTextIcon } from '@heroicons/react/24/solid'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { useRef, useEffect, useState } from 'react'
import axios from 'axios'
import { Bar, Pie, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
} from 'chart.js'
import { Listbox, Transition } from '@headlessui/react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import CnpjSelector from '../../components/CnpjSelector'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title)

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'rejeitado', label: 'Rejeitado' },
]

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [status, setStatus] = useState('Carregando...')
  const [lastSync, setLastSync] = useState('')
  const [selectedCnpj, setSelectedCnpj] = useState("")
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  // Integração real: buscar XMLs do backend
  const [xmls, setXmls] = useState<any[]>([])
  const [loadingXmls, setLoadingXmls] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)

  // Estados para DatePicker
  const [periodStartDate, setPeriodStartDate] = useState<Date | null>(periodStart ? new Date(periodStart) : null)
  const [periodEndDate, setPeriodEndDate] = useState<Date | null>(periodEnd ? new Date(periodEnd) : null)

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
    axios.get('http://localhost:8080/api/health')
      .then(res => setStatus(res.data.status === 'ok' ? 'Online' : 'Offline'))
      .catch(() => setStatus('Offline'))
    setLastSync('2025-06-27 14:32')
    // Buscar XMLs reais
    fetchXmls()
  }, [])

  // Sincronizar string e objeto Date
  useEffect(() => {
    if (periodStartDate) setPeriodStart(periodStartDate.toISOString().slice(0, 10))
    if (periodEndDate) setPeriodEnd(periodEndDate.toISOString().slice(0, 10))
  }, [periodStartDate, periodEndDate])

  const fetchXmls = async () => {
    setLoadingXmls(true)
    try {
      const res = await axios.get('http://localhost:8080/api/xmls')
      setXmls(res.data)
    } catch {
      setXmls([])
    } finally {
      setLoadingXmls(false)
    }
  }

  // Filtro dos XMLs atualizado para usar apenas os filtros modernos
  const filteredXmls = xmls.filter(xml =>
    (selectedCnpjModern === '' || xml.cnpj === selectedCnpjModern) &&
    (!selectedStatus || xml.status === selectedStatus) &&
    (!periodStart || !periodEnd || (xml.data >= periodStart && xml.data <= periodEnd))
  )

  // Download XML
  const handleDownload = async (xml: any) => {
    setDownloading(xml.nome)
    try {
      const res = await axios.get(`http://localhost:8080/api/xmls/${xml.id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', xml.nome)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } finally {
      setDownloading(null)
    }
  }

  // Enviar ao contador
  const handleSend = async (xml: any) => {
    setSending(xml.nome)
    try {
      await axios.post(`http://localhost:8080/api/xmls/${xml.id}/send`)
      alert('Enviado ao contador!')
    } finally {
      setSending(null)
    }
  }

  // Atalhos de período
  const setLast30Days = () => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 29)
    setPeriodStart(start.toISOString().slice(0, 10))
    setPeriodEnd(end.toISOString().slice(0, 10))
  }
  const setThisMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setPeriodStart(start.toISOString().slice(0, 10))
    setPeriodEnd(end.toISOString().slice(0, 10))
  }
  const setLastMonth = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    setPeriodStart(start.toISOString().slice(0, 10))
    setPeriodEnd(end.toISOString().slice(0, 10))
  }

  // Filtros dinâmicos para o gráfico
  const [chartType, setChartType] = useState('pie')
  const [fieldX, setFieldX] = useState('status')
  const [fieldY, setFieldY] = useState('valor')
  const chartFields = [
    { value: 'status', label: 'Status' },
    { value: 'data', label: 'Data' },
    { value: 'nome', label: 'Nome do Arquivo' },
    { value: 'cnpj', label: 'CNPJ' }
  ]
  const chartTypes = [
    { value: 'pie', label: 'Pizza' },
    { value: 'bar', label: 'Barras' },
    { value: 'line', label: 'Linha' }
  ]

  // Geração dinâmica dos dados do gráfico
  const groupBy = (arr: any[], key: string) => {
    return arr.reduce((acc, item) => {
      const k = item[key] || 'Não informado'
      acc[k] = acc[k] || []
      acc[k].push(item)
      return acc
    }, {} as Record<string, any[]>)
  }
  const grouped = groupBy(filteredXmls, fieldX)
  const labels = Object.keys(grouped)
  const dataValues = labels.map(l =>
    fieldY === 'valor'
      ? grouped[l].reduce((acc, x) => acc + (x.valor || 0), 0)
      : grouped[l].length
  )
  const chartData = {
    labels,
    datasets: [
      {
        label: fieldY === 'valor' ? 'Valor total' : 'Quantidade',
        data: dataValues,
        backgroundColor: labels.map((_, i) => `hsl(${i * 360 / labels.length}, 80%, 60%)`),
        borderColor: labels.map((_, i) => `hsl(${i * 360 / labels.length}, 80%, 40%)`),
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  // Filtros modernos para dashboard
  const [showFilter, setShowFilter] = useState(false)
  // Para CNPJ/Loja
  const cnpjOptions = Array.from(new Set(xmls.map(x => x.cnpj))).map(cnpj => ({ cnpj, nome_loja: xLojaNome(xmls, cnpj) }))
  function xLojaNome(xmls: any[], cnpj: string) {
    const found = xmls.find(x => x.cnpj === cnpj)
    return found?.nome_loja || cnpj
  }
  const [selectedCnpjModern, setSelectedCnpjModern] = useState('')

  // Totais para cards
  const totalAutorizadas = filteredXmls.filter(x => x.status === 'aprovado').reduce((acc, x) => acc + (x.valor || 0), 0)
  const totalCanceladas = filteredXmls.filter(x => x.status === 'rejeitado').reduce((acc, x) => acc + (x.valor || 0), 0)

  // Envio em lote
  const [showSendModal, setShowSendModal] = useState(false)
  const [emailToSend, setEmailToSend] = useState('')
  const [messageToSend, setMessageToSend] = useState('')
  const [sendingBatch, setSendingBatch] = useState(false)
  const handleSendBatch = async () => {
    setSendingBatch(true)
    try {
      // Aqui você pode implementar a lógica de envio do zip por e-mail
      // Exemplo: await axios.post('/api/send-xml', { email: emailToSend, message: messageToSend, xmls: filteredXmls })
      alert('XMLs enviados!')
      setShowSendModal(false)
      setEmailToSend('')
      setMessageToSend('')
    } finally {
      setSendingBatch(false)
    }
  }

  // Função para extrair dados do XML (mock para exemplo)
  function parseXmlData(xml: any) {
    return {
      cnpj: xml.cnpj || 'Desconhecido',
      data: xml.data ? new Date(xml.data).toLocaleDateString('pt-BR') : '-',
      imposto: xml.imposto_pago || 0
    }
  }
  const dadosGrafico = filteredXmls.map(parseXmlData)
  const cnpjs = [...new Set(dadosGrafico.map(x => x.cnpj))]
  const datas = [...new Set(dadosGrafico.map(x => x.data))]
  const impostosPorCnpj = cnpjs.map(cnpj => dadosGrafico.filter(x => x.cnpj === cnpj).reduce((acc, x) => acc + x.imposto, 0))
  const impostosPorData = datas.map(data => dadosGrafico.filter(x => x.data === data).reduce((acc, x) => acc + x.imposto, 0))
  const chartDataImpostosCnpj = {
    labels: cnpjs,
    datasets: [
      {
        label: 'Impostos Pagos (por CNPJ)',
        data: impostosPorCnpj,
        backgroundColor: 'rgba(255, 159, 64, 0.7)'
      }
    ]
  }
  const chartDataImpostosData = {
    labels: datas,
    datasets: [
      {
        label: 'Impostos Pagos (por Data)',
        data: impostosPorData,
        backgroundColor: 'rgba(54, 162, 235, 0.7)'
      }
    ]
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* <Navbar /> Removido, pois já está no layout global */}
        <main className="flex-1 p-6 md:p-10 bg-gray-50 min-h-screen">
          {/* Filtros, botão e cards no topo */}
          <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4 flex-1 items-end">
              <div className="min-w-[220px]">
                <CnpjSelector cnpjs={cnpjOptions} value={selectedCnpjModern} onChange={setSelectedCnpjModern} inputClassName="bg-orange-50 border-orange-300 text-orange-900 focus:ring-2 focus:ring-orange-400/60" />
              </div>
              <div className="flex gap-2 items-end flex-1">
                <div className="relative w-full max-w-[180px]">
                  <label className="block mb-2 font-semibold text-orange-700">Período Inicial</label>
                  <span className="absolute left-2 top-9 text-orange-400 pointer-events-none">
                    <CalendarDaysIcon className="w-5 h-5" />
                  </span>
                  <DatePicker
                    selected={periodStartDate}
                    onChange={date => setPeriodStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="pl-8 p-2 border rounded w-full bg-orange-50 border-orange-300 text-orange-900 focus:ring-2 focus:ring-orange-400/60"
                    placeholderText="DD/MM/AAAA"
                    calendarClassName="z-50"
                    renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                      <div className="flex justify-between items-center px-2 py-1">
                        <button onClick={decreaseMonth} type="button">‹</button>
                        <span className="font-semibold">{date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={increaseMonth} type="button">›</button>
                      </div>
                    )}
                    customInput={<input type="text" className="pl-8 p-2 border rounded w-full bg-orange-50 border-orange-300 text-orange-900 focus:ring-2 focus:ring-orange-400/60" />}
                    popperPlacement="bottom-start"
                    calendarContainer={props => (
                      <div>
                        <div className="flex gap-2 p-2 pb-0">
                          <button type="button" onClick={() => {
                            const end = periodEndDate || new Date();
                            const start = new Date(end);
                            start.setDate(end.getDate() - 29);
                            setPeriodStartDate(start);
                            setPeriodEndDate(end);
                          }} className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200 hover:bg-orange-200 transition">Últimos 30 dias</button>
                          <button type="button" onClick={() => {
                            const end = periodEndDate || new Date();
                            const start = new Date(end);
                            start.setDate(end.getDate() - 14);
                            setPeriodStartDate(start);
                            setPeriodEndDate(end);
                          }} className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200 hover:bg-orange-200 transition">Últimos 15 dias</button>
                        </div>
                        {props.children}
                      </div>
                    )}
                  />
                </div>
                <div className="relative w-full max-w-[180px]">
                  <label className="block mb-2 font-semibold text-orange-700">Período Final</label>
                  <span className="absolute left-2 top-9 text-orange-400 pointer-events-none">
                    <CalendarDaysIcon className="w-5 h-5" />
                  </span>
                  <DatePicker
                    selected={periodEndDate}
                    onChange={date => setPeriodEndDate(date)}
                    dateFormat="dd/MM/yyyy"
                    className="pl-8 p-2 border rounded w-full bg-orange-50 border-orange-300 text-orange-900 focus:ring-2 focus:ring-orange-400/60"
                    placeholderText="DD/MM/AAAA"
                    calendarClassName="z-50"
                    renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
                      <div className="flex justify-between items-center px-2 py-1">
                        <button onClick={decreaseMonth} type="button">‹</button>
                        <span className="font-semibold">{date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={increaseMonth} type="button">›</button>
                      </div>
                    )}
                    customInput={<input type="text" className="pl-8 p-2 border rounded w-full bg-orange-50 border-orange-300 text-orange-900 focus:ring-2 focus:ring-orange-400/60" />}
                    popperPlacement="bottom-start"
                    calendarContainer={props => (
                      <div>
                        <div className="flex gap-2 p-2 pb-0">
                          <button type="button" onClick={() => {
                            const end = new Date();
                            const start = new Date(end);
                            start.setDate(end.getDate() - 29);
                            setPeriodStartDate(start);
                            setPeriodEndDate(end);
                          }} className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200 hover:bg-orange-200 transition">Últimos 30 dias</button>
                          <button type="button" onClick={() => {
                            const end = new Date();
                            const start = new Date(end);
                            start.setDate(end.getDate() - 14);
                            setPeriodStartDate(start);
                            setPeriodEndDate(end);
                          }} className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold border border-orange-200 hover:bg-orange-200 transition">Últimos 15 dias</button>
                        </div>
                        {props.children}
                      </div>
                    )}
                  />
                </div>
                <button
                  onClick={() => setShowSendModal(true)}
                  disabled={filteredXmls.length === 0}
                  className="h-10 px-5 rounded bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold shadow disabled:opacity-60 ml-2"
                >
                  Enviar XML
                </button>
              </div>
            </div>
            {/* Cards de totais */}
            <div className="flex gap-4">
              <div className="bg-white rounded-2xl shadow border border-orange-100 p-4 flex flex-col items-center min-w-[160px]">
                <span className="text-xs text-gray-500 font-semibold mb-1">Notas Autorizadas</span>
                <span className="text-2xl font-bold text-green-600">R$ {totalAutorizadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-white rounded-2xl shadow border border-orange-100 p-4 flex flex-col items-center min-w-[160px]">
                <span className="text-xs text-gray-500 font-semibold mb-1">Notas Canceladas</span>
                <span className="text-2xl font-bold text-red-600">R$ {totalCanceladas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Gráfico dinâmico e moderno de notas fiscais */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 w-full mb-8 flex flex-col gap-4" style={{minHeight: 400}}>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h2 className="text-lg font-bold text-orange-700 flex-1">Visualização de Notas Fiscais</h2>
              <select className="p-2 rounded-xl border border-orange-200 bg-orange-50 text-gray-800 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition" value={chartType} onChange={e => setChartType(e.target.value)}>
                {chartTypes.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select className="p-2 rounded-xl border border-orange-200 bg-orange-50 text-gray-800 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition" value={fieldX} onChange={e => setFieldX(e.target.value)}>
                {chartFields.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select className="p-2 rounded-xl border border-orange-200 bg-orange-50 text-gray-800 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition" value={fieldY} onChange={e => setFieldY(e.target.value)}>
                <option value="valor">Valor total</option>
                <option value="quantidade">Quantidade</option>
              </select>
            </div>
            <div className="flex-1 flex items-center justify-center w-full min-h-[320px]">
              {chartType === 'pie' && <Pie data={chartData} options={{ plugins: { legend: { position: 'bottom' } }, responsive: true, maintainAspectRatio: false }} />}
              {chartType === 'bar' && <Bar data={chartData} options={{ plugins: { legend: { display: false }, title: { display: true, text: 'Notas Fiscais' } }, responsive: true, maintainAspectRatio: false }} />}
              {chartType === 'line' && <Line data={chartData} options={{ plugins: { legend: { display: true }, title: { display: true, text: 'Notas Fiscais' } }, responsive: true, maintainAspectRatio: false, scales: { x: { title: { display: true, text: chartFields.find(f => f.value === fieldX)?.label } }, y: { title: { display: true, text: fieldY === 'valor' ? 'Valor (R$)' : 'Quantidade' } } } }} />}
            </div>
          </div>

          {/* Gráfico de impostos pagos por CNPJ */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 w-full mb-8 mt-4">
            <h2 className="text-lg font-bold text-orange-700 mb-4">Impostos Pagos por CNPJ</h2>
            <Bar data={chartDataImpostosCnpj} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Impostos Pagos por CNPJ' } } }} />
          </div>
          {/* Gráfico de impostos pagos por Data */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 w-full mb-8 mt-4">
            <h2 className="text-lg font-bold text-orange-700 mb-4">Impostos Pagos por Data</h2>
            <Bar data={chartDataImpostosData} options={{ responsive: true, plugins: { legend: { display: false }, title: { display: true, text: 'Impostos Pagos por Data' } } }} />
          </div>

          {/* Tabela de arquivos XML */}
          <div className="bg-white rounded-2xl p-4 shadow-lg overflow-x-auto border border-orange-100">
            {loadingXmls ? (
              <div className="text-center text-orange-600 py-8 font-bold">Carregando arquivos...</div>
            ) : (
            <table className="min-w-full text-gray-700 text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-orange-100">
                  <th className="p-2 text-left font-semibold">Arquivo</th>
                  <th className="p-2 text-left font-semibold">Data</th>
                  <th className="p-2 text-left font-semibold">Valor</th>
                  <th className="p-2 text-left font-semibold">Status</th>
                  <th className="p-2 text-left font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredXmls.map((xml, idx) => (
                  <tr key={xml.id || idx} className={idx % 2 === 0 ? "bg-orange-50 hover:bg-orange-100 transition" : "hover:bg-orange-50 transition"}>
                    <td className="p-2 font-medium">{xml.nome}</td>
                    <td className="p-2">{xml.data}</td>
                    <td className="p-2">R$ {xml.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-2 capitalize">
                      <span className={
                        xml.status === 'aprovado' ? 'text-green-500 font-bold' :
                        xml.status === 'pendente' ? 'text-yellow-500 font-bold' :
                        'text-red-500 font-bold'
                      }>
                        {xml.status}
                      </span>
                    </td>
                    <td className="p-2 flex gap-2">
                      <button onClick={() => handleDownload(xml)} disabled={downloading === xml.nome} className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-3 py-1 rounded shadow disabled:opacity-60 font-semibold">
                        {downloading === xml.nome ? 'Baixando...' : 'Download'}
                      </button>
                      <button onClick={() => handleSend(xml)} disabled={sending === xml.nome} className="bg-gradient-to-r from-green-500 to-green-700 text-white px-3 py-1 rounded shadow disabled:opacity-60 font-semibold">
                        {sending === xml.nome ? 'Enviando...' : 'Enviar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
          {/* Modal de envio de XMLs */}
          {showSendModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-4">
                <h2 className="text-lg font-bold text-orange-700 mb-2">Enviar XMLs Zipados</h2>
                <label className="font-semibold text-orange-700">E-mail do destinatário</label>
                <input type="email" className="p-2 border rounded w-full border-orange-300 bg-orange-50 text-orange-900" value={emailToSend} onChange={e => setEmailToSend(e.target.value)} placeholder="exemplo@email.com" />
                <label className="font-semibold text-orange-700">Mensagem</label>
                <textarea className="p-2 border rounded w-full border-orange-300 bg-orange-50 text-orange-900" value={messageToSend} onChange={e => setMessageToSend(e.target.value)} placeholder="Digite uma mensagem opcional..." />
                <div className="flex gap-2 justify-end mt-2">
                  <button onClick={() => setShowSendModal(false)} className="px-4 py-2 rounded border border-orange-400 text-orange-700 font-semibold bg-white hover:bg-orange-50 transition">Cancelar</button>
                  <button onClick={handleSendBatch} disabled={sendingBatch || !emailToSend} className="px-4 py-2 rounded bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold shadow disabled:opacity-60">
                    {sendingBatch ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
