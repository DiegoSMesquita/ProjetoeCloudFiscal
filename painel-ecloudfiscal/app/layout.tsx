import '../src/app/globals.css'
import { XmlsProvider } from '../context/XmlsContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <XmlsProvider>
      <html lang="pt-br">
        <body className="antialiased bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 animate-gradient-x min-h-screen">
          {children}
        </body>
      </html>
    </XmlsProvider>
  )
}
