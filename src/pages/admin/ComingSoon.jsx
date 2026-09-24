// src/pages/admin/ComingSoon.jsx
export default function ComingSoon({ title }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-500">This section isn't built yet — check back once it's ready.</p>
    </main>
  )
}