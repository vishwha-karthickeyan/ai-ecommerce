'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { getProducts } from '@/services/api'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    if (!token) {
      router.push('/login')
      return
    }

    loadProducts()
  }, [router])

  const loadProducts = async (query = '') => {
    setLoading(true)
    const data = await getProducts(query)
    setProducts(data)
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Product catalog</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">Browse top products</h1>
            <p className="mt-3 max-w-2xl text-slate-600">Search, explore, and quickly access the best storefront selections.</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:w-auto">
            <label className="sr-only" htmlFor="product-search">Search products</label>
            <input
              id="product-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-sky-200 sm:w-80"
              placeholder="Search products"
            />
            <button
              onClick={() => loadProducts(search)}
              className="rounded-3xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-[1.5rem] border border-slate-200 bg-slate-50 p-10 text-center text-slate-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full rounded-[1.5rem] border border-slate-200 bg-slate-50 p-10 text-center text-slate-500">No products found.</div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
            />
          ))
        )}
      </div>
    </div>
  )
}
