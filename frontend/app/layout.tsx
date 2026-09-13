import './globals.css'
import Navbar from '@/components/Navbar'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-950">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}