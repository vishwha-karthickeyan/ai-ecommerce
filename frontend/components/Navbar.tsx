'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/chatbot', label: 'AI Chat' },
  { href: '/cart', label: 'Cart' },
]

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null)
  const [cartCount, setCartCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    setEmail(localStorage.getItem('userEmail'))
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(Array.isArray(cart) ? cart.length : 0)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userEmail')
    setEmail(null)
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4 xl:max-w-6xl">
        <Link href="/" className="flex items-center gap-3 text-slate-950">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">AI</span>
          <div>
            <p className="text-lg font-semibold">AI Commerce</p>
            <p className="text-xs text-slate-500">Fast, friendly shopping</p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition ${pathname === item.href ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'}`}
            >
              {item.label}
              {item.href === '/cart' && cartCount > 0 ? (
                <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-slate-950 px-2 text-[0.65rem] font-semibold text-white">{cartCount}</span>
              ) : null}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {email ? (
            <>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{email}</span>
              <button
                onClick={handleLogout}
                className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-950">Login</Link>
              <Link
                href="/signup"
                className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
