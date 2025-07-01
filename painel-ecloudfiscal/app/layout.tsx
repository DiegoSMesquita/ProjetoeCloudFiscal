import '../src/app/globals.css'
import { XmlsProvider } from '../context/XmlsContext'
import { Navbar } from '../components/Navbar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Detecta se está em rota do admin (server-safe)
  const isAdmin = typeof window !== 'undefined'
    ? window.location.pathname.startsWith('/admin')
    : false;

  if (isAdmin) {
    // Não aplica providers do cliente nem Navbar para o admin
    return (
      <html lang="pt-br">
        <body className="antialiased bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 animate-gradient-x min-h-screen">
          {children}
        </body>
      </html>
    )
  }

  // Layout do cliente
  return (
    <XmlsProvider>
      <html lang="pt-br">
        <body className="antialiased bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 animate-gradient-x min-h-screen">
          <Navbar />
          {children}
        </body>
      </html>
    </XmlsProvider>
  )
}
