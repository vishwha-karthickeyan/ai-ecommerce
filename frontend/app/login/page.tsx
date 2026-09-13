'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/services/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const login = async () => {
    const data = await loginUser(email, password)

    if (data?.token) {
      localStorage.setItem('userToken', data.token)
      localStorage.setItem('userEmail', email)
      router.push('/products')
    } else {
      setError(data?.message || 'Unable to login')
    }
  }

  return (
    <div className="relative overflow-hidden bg-slate-50 py-16">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-200 via-white to-transparent" />
      <div className="relative mx-auto max-w-md rounded-[2rem] border border-slate-200 bg-white p-10 shadow-2xl">
        <div className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-sky-600">Welcome back</p>
          <h1 className="text-3xl font-bold text-slate-950">Login to your account</h1>
          <p className="text-slate-600">Access your cart, personalized recommendations, and fast checkout.</p>
        </div>

        <div className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-sky-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-sky-200"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            onClick={login}
            className="w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Login
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          New here? <Link href="/signup" className="font-semibold text-slate-950 hover:text-sky-700">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
