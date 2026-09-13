import Link from 'next/link'

export default function HomePage() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-20">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-sky-200 via-white to-transparent opacity-70" />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-12 rounded-[2rem] border border-slate-200 bg-white/95 p-10 shadow-xl sm:p-14 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">AI-powered storefront</span>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl">Shopping with intelligence, speed, and style.</h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-700">Explore curated products, chat with an AI assistant, and checkout smoothly in a polished modern interface.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="inline-flex items-center justify-center rounded-full bg-slate-950 px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Browse Products</Link>
              <Link href="/chatbot" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">AI Shopping Assistant</Link>
            </div>
          </div>
          <div className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl">
            <div className="rounded-[1.5rem] bg-slate-900 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-400">Instant shopping confidence</p>
              <h2 className="mt-4 text-3xl font-semibold">Smarter browsing, faster decisions.</h2>
              <p className="mt-4 text-slate-300">Use search and conversation together to discover what you really need.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Fast discovery</p>
                <p className="mt-3 text-lg font-semibold">Find products instantly.</p>
              </div>
              <div className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Helpful assistant</p>
                <p className="mt-3 text-lg font-semibold">Ask product questions with ease.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
