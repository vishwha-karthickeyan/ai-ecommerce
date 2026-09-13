'use client'

import Link from 'next/link'

interface ProductProps {
  id: number
  name: string
  price: number
}

export default function ProductCard({
  id,
  name,
  price,
}: ProductProps) {
  return (
    <div className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="overflow-hidden rounded-[1.5rem] bg-slate-100">
        <img
          src={`https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=640&q=80`}
          alt={name}
          className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Popular choice</p>
          <h2 className="text-xl font-semibold text-slate-950">{name}</h2>
        </div>

        <p className="text-lg font-bold text-slate-950">{price}</p>
      </div>

      <Link href={`/products/${id}`} className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
        View Product
      </Link>
    </div>
  )
}
