import '../src/app/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body className="antialiased bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 animate-gradient-x min-h-screen">
        {children}
      </body>
    </html>
  )
}
