'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { placeOrder } from '@/services/api'

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    if (!token) {
      router.push('/login')
      return
    }

    const saved = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(Array.isArray(saved) ? saved : [])
  }, [router])

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
    [cart]
  )

  const removeItem = (index: number) => {
    const nextCart = cart.filter((_, i) => i !== index)
    setCart(nextCart)
    localStorage.setItem('cart', JSON.stringify(nextCart))
  }

  const handleCheckout = async () => {
    const userEmail = localStorage.getItem('userEmail')

    if (!userEmail) {
      setCheckoutMessage('Please login or signup before checking out.')
      return
    }

    if (!cart.length) {
      setCheckoutMessage('Your cart is empty.')
      return
    }

    setLoading(true)
    const result = await placeOrder({
      user_email: userEmail,
      products: cart,
      total,
    })

    setLoading(false)
    if (result?.message) {
      setCheckoutMessage('Order placed successfully!')
      setCart([])
      localStorage.removeItem('cart')
    } else {
      setCheckoutMessage('Unable to place order. Please try again.')
    }
  }

  return (
    <div className="relative overflow-hidden bg-slate-50 py-16">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-200 via-white to-transparent" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Shopping Bag</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-950">Your cart overview</h1>
              <p className="mt-2 text-slate-600">Review items, adjust quantities, and checkout with confidence.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700">
              {cart.length} item{cart.length === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-sm">
            <p className="text-xl font-semibold text-slate-950">Your cart is empty.</p>
            <p className="mt-3 text-slate-600">Browse our catalog and add your favorite products to continue.</p>
            <Link href="/products" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-950">{item.name}</h2>
                      <p className="mt-2 text-slate-600">Qty: {item.quantity || 1}</p>
                      <p className="mt-2 text-sm text-slate-500">₹{item.price} each</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-950">₹{item.price * (item.quantity || 1)}</p>
                      <button
                        onClick={() => removeItem(index)}
                        className="mt-3 text-sm font-semibold text-sky-700 transition hover:text-sky-900"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Order summary</p>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex items-center justify-between text-lg font-semibold text-slate-950">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="mt-8 w-full rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Placing order...' : 'Checkout now'}
              </button>
              {checkoutMessage ? <p className="mt-4 text-sm text-slate-700">{checkoutMessage}</p> : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
