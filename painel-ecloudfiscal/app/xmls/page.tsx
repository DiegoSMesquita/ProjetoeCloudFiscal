'use client'
import { Sidebar } from "../../components/Sidebar"
// import { Navbar } from "../../components/Navbar" // Removido para evitar múltiplas instâncias
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid'
import { Dialog } from '@headlessui/react'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useXmls } from '../../context/XmlsContext'

export default function ArquivosPage() {
  // Substituir xmls, loading, error, fetchXmls pelo contexto
  const { xmls, loading, error, refetch } = useXmls();
  const [downloading, setDownloading] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [showSendModal, setShowSendModal] = useState(false)
  const [emailToSend, setEmailToSend] = useState('')
  const [messageToSend, setMessageToSend] = useState('')
  const [sendingBatch, setSendingBatch] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadStatus, setUploadStatus] = useState<{ name: string, status: string }[]>([])
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState<number[]>([])
  const [errorLocal, setErrorLocal] = useState('')
  const [errorFileName, setErrorFileName] = useState('')

  // Colunas dinâmicas disponíveis
  const allColumns = [
    { key: 'fileName', label: 'Arquivo' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'numero', label: 'Número' },
    { key: 'serie', label: 'Série' },
    { key: 'cnpj', label: 'CNPJ Emitente' },
    { key: 'emitente', label: 'Emitente' },
    { key: 'destinatario', label: 'Destinatário' },
    { key: 'dataEmissao', label: 'Data Emissão' },
    { key: 'valor', label: 'Valor Total' },
  ]
  const [selectedColumns, setSelectedColumns] = useState<string[]>(allColumns.map(c => c.key))

  const handleDownload = async (xml: any) => {
    setDownloading(xml.nome_arquivo || xml.nome || xml.id)
    try {
      const res = await axios.get(`http://localhost:8080/api/xmls/${xml.id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', xml.nome_arquivo || xml.nome || xml.id)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } finally {
      setDownloading(null)
    }
  }

  const handleSend = async (xml: any) => {
    if (!window.confirm('Deseja realmente enviar este XML ao contador?')) return
    setSending(xml.nome_arquivo || xml.nome || xml.id)
    try {
      await axios.post(`http://localhost:8080/api/xmls/${xml.id}/send`)
      setSuccessMsg('Enviado ao contador!')
      setTimeout(() => setSuccessMsg(''), 2000)
    } finally {
      setSending(null)
    }
  }

  // 1. Função para formatar data dd/mm/aaaa, aceitando string ou Date
  function formatarData(data: string) {
    if (!data) return '-';
    // Aceita datas tipo 20230825 (CF-e) ou ISO
    if (/^\d{8}$/.test(data)) {
      return `${data.slice(6,8)}/${data.slice(4,6)}/${data.slice(0,4)}`;
    }
    const d = new Date(data)
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR')
  }

  // Upload XML (multipart)
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    setSuccessMsg('')
    setErrorLocal('')
    setErrorFileName('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      await axios.post('http://localhost:8080/api/xmls/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccessMsg('Upload realizado com sucesso!')
      setFile(null)
      setErrorLocal('')
      setErrorFileName('')
      refetch()
    } catch (err: any) {
      let msg = 'Erro ao fazer upload'
      let fileName = file?.name || ''
      // LOG DETALHADO PARA DEBUG
      console.log('Erro no upload:', err)
      if (err?.response) {
        let data = err.response.data
        if (typeof data === 'string') {
          try { data = JSON.parse(data) } catch {}
        }
        if (err.response.status === 409) {
          if (data && typeof data === 'object' && data.error) {
            msg = data.error
          } else if (typeof data === 'string' && data.includes('importado')) {
            msg = data
          } else {
            msg = `O arquivo ${fileName} já foi importado anteriormente!`
          }
          // Exibe erro local na tela
          setErrorLocal(msg)
        }
        // ...restante igual...
      }
      // Sempre exibe a notificação, mesmo se msg for padrão
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('addNotification', {
          detail: {
            id: Date.now().toString(),
            message: msg,
            type: 'error',
            createdAt: new Date().toLocaleString(),
            read: false
          }
        }))
        if (window.top && window.top !== window) {
          window.top.dispatchEvent(new CustomEvent('addNotification', {
            detail: {
              id: Date.now().toString(),
              message: msg,
              type: 'error',
              createdAt: new Date().toLocaleString(),
              read: false
            }
          }))
        }
      } else {
        console.log('window não está definido!')
      }
    } finally {
      setUploading(false)
      setTimeout(() => setSuccessMsg(''), 2000)
    }
  }

  const handleExport = async (type: 'excel' | 'pdf') => {
    // Exemplo: endpoint para exportação
    const res = await axios.get(`http://localhost:8080/api/xmls/export?type=${type}`, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `xmls.${type === 'excel' ? 'xlsx' : 'pdf'}`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // --- Filtros de data do dashboard ---
  const [periodStart, setPeriodStart] = useState("")
  const [periodEnd, setPeriodEnd] = useState("")
  const [periodStartDate, setPeriodStartDate] = useState<Date | null>(null)
  const [periodEndDate, setPeriodEndDate] = useState<Date | null>(null)

  useEffect(() => {
    if (periodStartDate) setPeriodStart(periodStartDate.toISOString().slice(0, 10))
    else setPeriodStart("")
    if (periodEndDate) setPeriodEnd(periodEndDate.toISOString().slice(0, 10))
    else setPeriodEnd("")
  }, [periodStartDate, periodEndDate])

  // Filtro de XMLs por data
  const filteredXmls = xmls.filter(xml => {
    return (!periodStart || !periodEnd || (xml.dataEmissao >= periodStart && xml.dataEmissao <= periodEnd))
  })

  // Envio de e-mail com zip
  const handleSendBatch = async () => {
    setSendingBatch(true)
    try {
      await axios.post('http://localhost:8080/api/xmls/send', {
        email: emailToSend,
        message: messageToSend,
        ids: filteredXmls.map(x => x.id)
      })
      setShowSendModal(false)
      setEmailToSend('')
      setMessageToSend('')
      setSuccessMsg('E-mail enviado com sucesso!')
      setTimeout(() => setSuccessMsg(''), 2000)
    } catch {
      setError('Erro ao enviar e-mail')
    } finally {
      setSendingBatch(false)
    }
  }

  const handleExportFiltered = async (type: 'excel' | 'pdf') => {
    // Exemplo: endpoint para exportação filtrada
    try {
      const res = await axios.post(`http://localhost:8080/api/xmls/export/${type}`, {
        ids: filteredXmls.map(x => x.id)
      }, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `xmls.${type === 'excel' ? 'xlsx' : 'pdf'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      setError('Erro ao exportar arquivo')
    }
  }

  // 2. Dashboard e gráficos alimentados corretamente
  // Exemplo de contagem de status
  const notasAutorizadas = filteredXmls.filter(x => x.status?.toLowerCase() === 'autorizado').length;
  const notasCanceladas = filteredXmls.filter(x => x.status?.toLowerCase() === 'cancelado').length;
  const dadosGrafico = filteredXmls.map(xml => ({
    cnpj: xml.cnpj || 'Desconhecido',
    data: formatarData(xml.dataEmissao),
    valor: xml.valor ? Number(xml.valor) : 0,
    status: xml.status || '-'
  }))
  const cnpjs = [...new Set(dadosGrafico.map(x => x.cnpj))]
  const datas = [...new Set(dadosGrafico.map(x => x.data))]
  const valoresPorCnpj = cnpjs.map(cnpj => dadosGrafico.filter(x => x.cnpj === cnpj).reduce((acc, x) => acc + x.valor, 0))
  const valoresPorData = datas.map(data => dadosGrafico.filter(x => x.data === data).reduce((acc, x) => acc + x.valor, 0))
  const chartData = {
    labels: cnpjs,
    datasets: [
      {
        label: 'Valor Total (por CNPJ)',
        data: valoresPorCnpj,
        backgroundColor: 'rgba(255, 159, 64, 0.7)'
      }
    ]
  }
  const chartDataData = {
    labels: datas,
    datasets: [
      {
        label: 'Valor Total (por Data)',
        data: valoresPorData,
        backgroundColor: 'rgba(54, 162, 235, 0.7)'
      }
    ]
  }

  // Função para identificar modelo do XML
  function getModeloXml(xml: any) {
    // Exemplo: backend já retorna xml.modelo, senão tenta deduzir pelo nome ou campo
    if (xml.modelo) return xml.modelo
    if (xml.nome_arquivo?.includes('NFE') || xml.tipo === 'NFE') return 'NFE'
    if (xml.nome_arquivo?.includes('NFC') || xml.tipo === 'NFC-e') return 'NFC-e'
    if (xml.nome_arquivo?.includes('CFE') || xml.tipo === 'CF-e') return 'CF-e'
    if (xml.nome_arquivo?.includes('NFS') || xml.tipo === 'NFS-e') return 'NFS-e'
    return 'Desconhecido'
  }

  // Função para filtrar arquivos duplicados
  function handleFileSelect(files: File[]) {
    const nomesExistentes = new Set(selectedFiles.map(f => f.name))
    const novos = files.filter(f => !nomesExistentes.has(f.name))
    setSelectedFiles(prev => [...prev, ...novos])
  }

  // Função de upload com progresso
  async function uploadFiles() {
    setUploadStatus(selectedFiles.map(f => ({ name: f.name, status: 'Enviando...' })))
    setUploadProgress(selectedFiles.map(() => 0))
    for (let i = 0; i < selectedFiles.length; i++) {
      const formData = new FormData()
      formData.append('file', selectedFiles[i])
      try {
        await axios.post('http://localhost:8080/api/xmls/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
            setUploadProgress(p => p.map((val, idx) => idx === i ? percent : val))
          }
        })
        setUploadStatus(s => s.map((u, idx) => idx === i ? { ...u, status: 'Enviado!' } : u))
      } catch {
        setUploadStatus(s => s.map((u, idx) => idx === i ? { ...u, status: 'Erro' } : u))
      }
    }
    setTimeout(() => {
      setShowUploadModal(false)
      setSelectedFiles([])
      setUploadStatus([])
      setUploadProgress([])
      refetch()
    }, 1200)
  }

  // Função para deletar arquivos selecionados
  async function handleDeleteSelected() {
    if (!window.confirm('Deseja realmente excluir os arquivos selecionados?')) return
    try {
      await axios.post('http://localhost:8080/api/xmls/delete', { ids: selectedRows })
      setSelectedRows([])
      refetch()
    } catch {
      setError('Erro ao excluir arquivos')
    }
  }

  const botaoPadrao = "px-4 py-2 rounded-lg font-bold shadow flex items-center gap-2 hover:scale-105 transition-all min-w-[120px] text-base justify-center text-center"

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* <Navbar /> Removido, pois já está no layout global */}
        <main className="flex-1 p-6 md:p-10 bg-gray-50 min-h-screen">
          {errorLocal && (
            <div className="mb-4 text-red-600 font-bold text-center animate-pulse bg-red-50 border border-red-200 rounded p-2 z-50">{errorLocal}</div>
          )}
          {error && (
            <div className="mb-4 text-red-600 font-bold text-center animate-pulse bg-red-50 border border-red-200 rounded p-2 z-50">{error}</div>
          )}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold text-orange-700">Arquivos Fiscais</h1>
            <div className="flex gap-2 items-end">
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
              {/* Botão de envio e exclusão em massa no topo */}
              <div className="flex gap-2 mb-4 items-center">
                <button
                  onClick={handleSendBatch}
                  disabled={selectedRows.length === 0 || sendingBatch}
                  className="h-10 px-5 rounded bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold shadow disabled:opacity-60"
                >
                  {sendingBatch ? 'Enviando...' : 'Enviar selecionados ao contador'}
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedRows.length === 0}
                  className="h-10 px-5 rounded bg-gradient-to-r from-red-600 to-red-500 text-white font-bold shadow disabled:opacity-60"
                >
                  Excluir selecionados
                </button>
              </div>
              <button
                onClick={() => setShowSendModal(true)}
                disabled={filteredXmls.length === 0}
                className="h-10 px-5 rounded bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold shadow disabled:opacity-60 ml-2"
              >
                Enviar XML
              </button>
              <button onClick={() => handleExportFiltered('excel')} className={`bg-gradient-to-r from-orange-600 to-orange-500 text-white ${botaoPadrao} min-w-[120px] justify-center`}>
                <ArrowDownTrayIcon className="h-5 w-5" /> Exportar Excel
              </button>
              <button onClick={() => handleExportFiltered('pdf')} className={`bg-gradient-to-r from-orange-600 to-orange-500 text-white ${botaoPadrao} min-w-[120px] justify-center`}>
                <ArrowDownTrayIcon className="h-5 w-5" /> Exportar PDF
              </button>
              <button type="button" onClick={() => setShowUploadModal(true)} className="bg-gradient-to-r from-green-500 to-green-700 text-white px-4 py-2 rounded-lg font-bold shadow flex items-center gap-2 cursor-pointer hover:scale-105 transition-all min-w-[120px] justify-center">
                <ArrowUpTrayIcon className="h-5 w-5" /> Upload XML
              </button>
            </div>
          </div>
          {successMsg && <div className="mb-4 text-green-600 font-bold text-center animate-pulse">{successMsg}</div>}
          {/* 2. Mensagem de erro duplicado visível após upload */}
          {error && (
            <div className="mb-4 text-red-600 font-bold text-center animate-pulse bg-red-50 border border-red-200 rounded p-2 z-50">{error}</div>
          )}
          <div className="bg-white rounded-2xl p-4 shadow-lg overflow-x-auto border border-orange-100">
            {loading ? (
              <div className="text-center text-orange-600 py-8 font-bold">Carregando arquivos...</div>
            ) : (
              <>
                {/* Seletor de colunas */}
                <div className="mb-4 flex flex-wrap gap-2 items-center">
                  <span className="text-orange-700 font-bold mr-2">Colunas:</span>
                  {allColumns.map(col => (
                    <button
                      key={col.key}
                      className={`px-3 py-1 rounded-full border text-sm font-semibold transition-all ${selectedColumns.includes(col.key) ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white border-orange-400 shadow' : 'bg-white border-orange-200 text-orange-700 hover:bg-orange-50'}`}
                      onClick={() => setSelectedColumns(cols => cols.includes(col.key) ? cols.filter(k => k !== col.key) : [...cols, col.key])}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
                <table className="min-w-full text-gray-700 text-sm">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-orange-100">
                      <th className="p-2"></th>
                      {allColumns.filter(col => selectedColumns.includes(col.key)).map(col => (
                        <th key={col.key} className="p-2 text-left font-semibold">{col.label}</th>
                      ))}
                      <th className="p-2 text-left font-semibold">Status</th>
                      <th className="p-2 text-left font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredXmls.map((xml: any, idx: number) => {
                      // Fallback seguro para key e id
                      const uniqueKey = xml?.id ? String(xml.id) : xml?.fileName || xml?.nome_arquivo || `idx-${idx}`
                      // Remover log de undefined
                      // console.log('xml.id', xml.id, typeof xml.id)
                      return (
                        <tr key={uniqueKey} className={idx % 2 === 0 ? "bg-orange-50 hover:bg-orange-100 transition" : "hover:bg-orange-50 transition"}>
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(uniqueKey)}
                              onChange={e => {
                                setSelectedRows(prev => {
                                  if (e.target.checked) return [...prev, uniqueKey]
                                  return prev.filter(k => k !== uniqueKey)
                                })
                              }}
                              className="accent-orange-500 w-5 h-5 rounded border-2 border-orange-400 focus:ring-2 focus:ring-orange-400 transition shadow-sm"
                            />
                          </td>
                          {allColumns.filter(col => selectedColumns.includes(col.key)).map(col => (
                            <td key={col.key} className="p-2">
                              {col.key === 'dataEmissao' ? formatarData(xml[col.key]) : col.key === 'valor' ? (xml.valor ? Number(xml.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-') : xml[col.key] || '-'}
                            </td>
                          ))}
                          <td className="p-2 font-semibold text-xs text-orange-700 uppercase">{xml.status || '-'}</td>
                          <td className="p-2 flex gap-2">
                            <button onClick={() => handleDownload(xml)} disabled={downloading === (xml.nome_arquivo || xml.nome || xml.id)} className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-3 py-1 rounded shadow font-semibold hover:scale-105 transition-all disabled:opacity-60 min-w-[90px]">{downloading === (xml.nome_arquivo || xml.nome || xml.id) ? 'Baixando...' : 'Baixar'}</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
          {/* Modal de envio de XMLs */}
          {showSendModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
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
          {/* Modal de upload em lote */}
          <Dialog open={showUploadModal} onClose={() => setShowUploadModal(false)}>
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="relative bg-white rounded-xl shadow-lg p-8 w-full max-w-lg flex flex-col gap-4 z-10">
                <Dialog.Title className="text-lg font-bold text-orange-700 mb-2">Upload de XMLs</Dialog.Title>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById('xml-upload-input')?.click()}
                    className="bg-orange-100 hover:bg-orange-200 p-2 rounded-full border border-orange-300 text-orange-700 flex items-center justify-center"
                    title="Selecionar arquivos XML"
                  >
                    {/* Ícone de pasta */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75A2.25 2.25 0 014.5 4.5h3.379c.414 0 .81.172 1.098.477l1.646 1.746c.288.305.684.477 1.098.477H19.5a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 16.5v-9.75z" />
                    </svg>
                  </button>
                  <span className="text-orange-700 text-sm">Clique para selecionar arquivos XML</span>
                </div>
                <input
                  id="xml-upload-input"
                  type="file"
                  accept=".xml"
                  multiple
                  onChange={e => handleFileSelect(Array.from(e.target.files || []))}
                  className="hidden"
                />
                {selectedFiles.length > 0 && (
                  <div className="mb-2 max-h-40 overflow-y-auto border rounded p-2 bg-orange-50">
                    {selectedFiles.map((f, i) => (
                      <div key={f.name} className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-orange-700">{f.name}</span>
                        <span className="text-xs text-gray-500">{uploadStatus[i]?.status || 'Aguardando'}</span>
                        {uploadProgress[i] !== undefined && (
                          <div className="flex-1 h-2 bg-orange-200 rounded overflow-hidden">
                            <div className="h-2 bg-orange-500" style={{ width: `${uploadProgress[i]}%` }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded border border-orange-400 text-orange-700 font-semibold bg-white hover:bg-orange-50 transition">Cancelar</button>
                  <button
                    onClick={uploadFiles}
                    disabled={selectedFiles.length === 0}
                    className="px-4 py-2 rounded bg-gradient-to-r from-green-500 to-green-700 text-white font-bold shadow disabled:opacity-60"
                  >
                    Enviar arquivos
                  </button>
                </div>
              </div>
            </div>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
