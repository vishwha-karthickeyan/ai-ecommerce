'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProduct } from '@/services/api'

export default function ProductDetails({ params }: any) {
  const [product, setProduct] = useState<any>(null)
  const [added, setAdded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    if (!token) {
      router.push('/login')
      return
    }

    getProduct(params.id).then((data) => setProduct(data))
  }, [params.id, router])

  if (!product) {
    return (
      <div className="min-h-[60vh] px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">Loading product...</div>
      </div>
    )
  }

  const addToCart = () => {
    const existing = JSON.parse(localStorage.getItem('cart') || '[]')
    const updated = [...existing, { ...product, quantity: 1 }]
    localStorage.setItem('cart', JSON.stringify(updated))
    setAdded(true)
  }

  return (
    <div className="relative overflow-hidden bg-slate-50 py-16">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-sky-200 via-white to-transparent" />
      <div className="relative mx-auto max-w-6xl px-6">
        <button
          className="mb-8 inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          onClick={() => router.push('/products')}
        >
          Back to products
        </button>

        <div className="grid gap-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] overflow-hidden bg-slate-100">
            <img
              src={product.image || 'https://via.placeholder.com/700x700'}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-6 py-2">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-600">Product details</p>
              <h1 className="text-4xl font-bold text-slate-950">{product.name}</h1>
              <p className="text-3xl font-semibold text-slate-950">{product.price}</p>
            </div>

            <div className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-lg font-semibold text-slate-950">Why customers love it</h2>
              <p className="text-slate-700">{product.description || 'A premium item designed for everyday use. Enjoy reliable performance and modern style with every purchase.'}</p>
              <ul className="mt-4 space-y-3 text-slate-700">
                <li className="flex items-center gap-3"><span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">-</span>Quality built for lasting value</li>
                <li className="flex items-center gap-3"><span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">-</span>Fast delivery and easy returns</li>
                <li className="flex items-center gap-3"><span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">-</span>Perfect for gifting or daily use</li>
              </ul>
            </div>

            <button
              onClick={addToCart}
              className="w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {added ? 'Added to Cart' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
