'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-emboss px-6 py-3 rounded-full bg-emerald text-bone font-body font-bold"
    >
      Download / Save as PDF
    </button>
  )
}
