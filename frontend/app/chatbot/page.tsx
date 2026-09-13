'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendMessage } from '@/services/api'

export default function ChatbotPage() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const handleSend = async () => {
    if (!message.trim()) return

    setLoading(true)
    const data = await sendMessage(message)
    setResponse(data.reply || 'No response received.')
    setLoading(false)
  }

  return (
    <div className="relative overflow-hidden bg-slate-50 py-16">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-200 via-white to-transparent" />
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="grid gap-10 rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-2xl lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">AI Shopping Assistant</p>
              <h1 className="text-4xl font-bold text-slate-950 sm:text-5xl">Make buying easier with smart recommendations</h1>
              <p className="max-w-2xl text-slate-600">Ask product questions, compare options, and discover top choices with a conversational shopping assistant tailored for your needs.</p>
            </div>

            <div className="space-y-4 rounded-[1.75rem] bg-slate-50 p-6 shadow-sm">
              <div className="space-y-3">
                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">You</p>
                  <p className="mt-2 text-slate-950">What is the best product for daily use under ₹5,000?</p>
                </div>
                <div className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm">
                  <p className="text-sm text-sky-200">AI</p>
                  <p className="mt-2 text-base leading-7">Choose from curated picks that balance quality, value, and customer satisfaction for everyday comfort and performance.</p>
                </div>
              </div>
              <div className="text-sm text-slate-500">Type your question in the box below and tap send to start a conversation.</div>
            </div>
          </div>

          <div className="space-y-6">
            <textarea
              rows={6}
              placeholder="Ask something about a product, recommendation or order..."
              className="w-full rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4 text-slate-950 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-sky-200"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button
              onClick={handleSend}
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send your question'}
            </button>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Quick prompts</p>
              <ul className="mt-4 space-y-3 text-slate-700">
                <li className="rounded-2xl bg-white px-4 py-3 shadow-sm">Compare two products for everyday use</li>
                <li className="rounded-2xl bg-white px-4 py-3 shadow-sm">Help me choose a gift under ₹3,000</li>
                <li className="rounded-2xl bg-white px-4 py-3 shadow-sm">Which product has the best reviews?</li>
              </ul>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 min-h-[180px] text-slate-700">
              {response ? (
                <div className="space-y-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">AI response</p>
                  <p className="text-lg leading-8 text-slate-950">{response}</p>
                </div>
              ) : (
                <p className="text-slate-500">Your AI answer will appear here after you send a message.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
