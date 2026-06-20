import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-purple-900">Link not found</h1>
      <p className="mt-3 text-slate-700">
        This TerseLink does not exist or is no longer available.
      </p>
      <Link
        className="mt-6 inline-block rounded-lg bg-purple-600 px-4 py-2 font-bold text-white"
        href="/shorten"
      >
        Create a short link
      </Link>
    </main>
  )
}
