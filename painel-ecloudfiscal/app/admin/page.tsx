export default function AdminHome() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-orange-700 mb-6">Painel Administrativo</h1>
      <p className="text-gray-700 mb-4">Bem-vindo ao painel admin! Use o menu lateral para acessar as funções administrativas.</p>
      <ul className="list-disc pl-6 text-orange-700">
        <li>Gestão de usuários (criar, editar, bloquear, liberar, associar CNPJ, liberar plano)</li>
        <li>Monitoramento de apps desktop (online/offline)</li>
        <li>Central de notificações (enviar mensagem para todos clientes)</li>
      </ul>
    </div>
  )
}
