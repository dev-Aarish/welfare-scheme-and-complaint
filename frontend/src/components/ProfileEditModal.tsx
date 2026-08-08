import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Pencil, X } from 'lucide-react'
import type { LocalProfile } from '../context/AuthContext'

export type EditFieldType = 'text' | 'number' | 'select'

export interface EditField {
  key: keyof LocalProfile
  label: string
  type: EditFieldType
  options?: string[]
  placeholder?: string
  hint?: string
}

interface ProfileEditModalProps {
  title: string
  subtitle: string
  fields: EditField[]
  values: Partial<LocalProfile>
  onSave: (values: Partial<LocalProfile>) => void | Promise<void>
  onClose: () => void
}

function toNumber(value: string): number | undefined {
  if (value === '' || value == null) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

export function ProfileEditModal({
  title,
  subtitle,
  fields,
  values,
  onSave,
  onClose,
}: ProfileEditModalProps) {
  const [form, setForm] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const f of fields) {
      const raw = values[f.key]
      initial[f.key as string] =
        raw === null || raw === undefined
          ? ''
          : f.type === 'select'
            ? String(raw)
            : String(raw)
    }
    return initial
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Record<string, string | number | null | undefined> = {}
    for (const f of fields) {
      const raw = form[f.key as string]
      if (raw === '' || raw == null) {
        payload[f.key as string] = null
        continue
      }
      payload[f.key as string] = f.type === 'number' ? toNumber(raw) : raw
    }
    setSaving(true)
    setError(null)
    try {
      await onSave(payload as Partial<LocalProfile>)
      onClose()
    } catch {
      setError('Something went wrong while saving. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
      <div className="w-full max-w-[560px] overflow-hidden rounded-[28px] border border-border-subtle bg-surface shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-border-subtle/80 bg-canvas/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-navy text-navy-contrast shadow-soft">
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display text-lg font-bold text-ink-900">{title}</h4>
              <p className="text-xs text-ink-400">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-canvas hover:text-ink-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[82vh] overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            {fields.map((f) => {
              const value = form[f.key as string] ?? ''
              const label = (
                <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                  {f.label}
                </label>
              )
              let control: React.ReactNode
              if (f.type === 'select' && f.options) {
                control = (
                  <div className="relative mt-1.5">
                    <select
                      value={value}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, [f.key as string]: e.target.value }))
                      }
                      className="w-full appearance-none rounded-xl border border-border-subtle bg-canvas px-4 py-3 pr-10 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    >
                      <option value="">Select {f.label.toLowerCase()}</option>
                      {f.options.map((o) => (
                        <option key={o} value={o} className="bg-surface text-ink-900">
                          {o}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-ink-400" />
                  </div>
                )
              } else if (f.type === 'number') {
                control = (
                  <input
                    type="number"
                    min="0"
                    step={f.key === 'landAcres' ? '0.1' : '1'}
                    value={value}
                    placeholder={f.placeholder}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [f.key as string]: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-border-subtle bg-canvas px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                )
              } else {
                control = (
                  <input
                    type="text"
                    value={value}
                    placeholder={f.placeholder}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [f.key as string]: e.target.value }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-border-subtle bg-canvas px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                )
              }

              return (
                <div key={f.key as string} className={f.key === 'incomeSource' ? 'col-span-2' : ''}>
                  {label}
                  {control}
                  {f.hint && <p className="mt-1.5 text-[11px] text-ink-400">{f.hint}</p>}
                </div>
              )
            })}
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-brand-orange/15 px-4 py-2.5 text-xs font-semibold text-brand-orange">
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border-subtle pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border-subtle bg-canvas px-5 py-3 text-xs font-semibold text-ink-700 transition-colors hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 py-3 text-xs font-bold uppercase tracking-wider text-navy-contrast transition-all hover:bg-[#2d2839] hover:shadow-soft disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
