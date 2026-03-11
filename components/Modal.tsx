'use client'

interface ModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  onSave: () => void
}

export function Modal({ title, children, onClose, onSave }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-espresso/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-oat rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="font-display text-xl font-semibold text-espresso mb-4">
            {title}
          </h3>
          <div>{children}</div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-mocha text-mocha hover:bg-sand transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onSave}
              className="flex-1 py-2.5 rounded-xl bg-espresso text-cream hover:bg-mocha transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
