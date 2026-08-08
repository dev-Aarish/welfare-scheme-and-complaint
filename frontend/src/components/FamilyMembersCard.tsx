import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Users, Trash2, Pencil, X, GraduationCap, Accessibility, Sprout, Briefcase, ChevronDown, UserPlus, Sparkles } from 'lucide-react'
import {
  fetchFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  type FamilyMemberData,
} from '../services/api'

const RELATIONS = [
  'Father',
  'Mother',
  'Spouse',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Dependent Senior',
  'Other',
]

const OCCUPATIONS = [
  'Farmer',
  'Daily Wage Worker',
  'Salaried',
  'Student',
  'Unemployed',
  'Retired',
  'Small Business',
  'Homemaker',
]

function calculateAgeFromDob(dobString?: string): number {
  if (!dobString) return 0
  const birthDate = new Date(dobString)
  if (isNaN(birthDate.getTime())) return 0
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return Math.max(0, age)
}

const INITIAL_FORM: FamilyMemberData = {
  fullName: '',
  relation: 'Father',
  dob: '1968-05-15',
  age: 58,
  gender: 'Male',
  occupation: 'Unemployed',
  annualIncome: 0,
  isStudent: false,
  isDisability: false,
  landAcres: 0,
  notes: '',
}

export function FamilyMembersCard({ sampleFallback = false }: { sampleFallback?: boolean }) {
  const [family, setFamily] = useState<FamilyMemberData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingMember, setEditingMember] = useState<FamilyMemberData | null>(null)
  const [formData, setFormData] = useState<FamilyMemberData>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState<boolean>(false)

  const loadFamily = async () => {
    setLoading(true)
    const members = await fetchFamilyMembers()
    if (members && members.length > 0) {
      setFamily(members)
    } else if (sampleFallback) {
      // Sample preview data for the demo/guest view when the backend is empty.
      setFamily([
        {
          id: 'sample-1',
          fullName: 'Ramesh Mukherjee',
          relation: 'Father',
          dob: '1968-05-15',
          age: 58,
          gender: 'Male',
          occupation: 'Farmer',
          annualIncome: 65000,
          isStudent: false,
          isDisability: false,
          landAcres: 1.5,
        },
        {
          id: 'sample-2',
          fullName: 'Sunita Mukherjee',
          relation: 'Mother',
          dob: '1972-08-20',
          age: 54,
          gender: 'Female',
          occupation: 'Homemaker',
          annualIncome: 0,
          isStudent: false,
          isDisability: false,
          landAcres: 0,
        },
      ])
    } else {
      // Real user with no saved family members — show the empty state.
      setFamily([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFamily()
  }, [])

  // Lock body scroll when modal is active
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showModal])

  const handleOpenAdd = () => {
    setEditingMember(null)
    setFormData(INITIAL_FORM)
    setShowModal(true)
  }

  const handleOpenEdit = (member: FamilyMemberData) => {
    setEditingMember(member)
    setFormData({
      ...member,
      dob: member.dob || '1990-01-01',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this family member?')) {
      const ok = await deleteFamilyMember(id)
      if (ok || id.startsWith('sample-')) {
        setFamily((prev) => prev.filter((m) => m.id !== id))
      }
    }
  }

  const handleDobChange = (newDob: string) => {
    const computedAge = calculateAgeFromDob(newDob)
    setFormData((prev) => ({
      ...prev,
      dob: newDob,
      age: computedAge,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fullName.trim()) return

    const computedAge = calculateAgeFromDob(formData.dob)
    const finalData = { ...formData, age: computedAge }

    setSubmitting(true)

    if (editingMember && editingMember.id) {
      const updated = await updateFamilyMember(editingMember.id, finalData)
      if (updated) {
        setFamily((prev) => prev.map((m) => (m.id === editingMember.id ? updated : m)))
      } else {
        // Fallback state update
        setFamily((prev) => prev.map((m) => (m.id === editingMember.id ? { ...finalData, id: editingMember.id } : m)))
      }
    } else {
      const created = await addFamilyMember(finalData)
      if (created) {
        setFamily((prev) => [...prev, created])
      } else {
        // Fallback state update
        const tempId = `temp-${Date.now()}`
        setFamily((prev) => [...prev, { ...finalData, id: tempId }])
      }
    }

    setSubmitting(false)
    setShowModal(false)
  }

  const liveCalculatedAge = calculateAgeFromDob(formData.dob)

  return (
    <div className="h-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft max-md:p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-ink-900">
            <Users className="h-4 w-4 text-brand-orange" />
            Family Members Profile
          </h3>
          <p className="mt-1 text-xs text-ink-400">
            Add family details (father, mother, spouse, children) for scheme qualification.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-full bg-brand-navy px-4 py-2 text-xs font-semibold text-navy-contrast transition-all duration-150 hover:bg-[#2d2839] hover:shadow-soft"
        >
          <Plus className="h-4 w-4" />
          Add Family Member
        </button>
      </div>

      {/* List */}
      <div className="mt-5 space-y-3">
        {family.map((m) => (
          <div
            key={m.id}
            className="flex flex-col gap-2.5 rounded-2xl border border-border-subtle/80 bg-canvas/40 p-4.5 transition-all duration-150 hover:bg-canvas/70 hover:shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-display text-base font-semibold text-ink-900">
                    {m.fullName}
                  </span>
                  <span className="rounded-full bg-brand-navy/15 px-2.5 py-0.5 text-xs font-bold text-ink-900 dark:bg-white/10 dark:text-white">
                    {m.relation}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-400">
                  <span className="font-semibold text-ink-700">{m.age} yrs</span> ({m.dob || 'DOB N/A'}) · {m.gender} · <span className="font-medium text-ink-700">{m.occupation}</span> · ₹{(m.annualIncome || 0).toLocaleString('en-IN')}/yr
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(m)}
                  className="rounded-full p-2 text-ink-400 transition-colors hover:bg-surface hover:text-ink-900"
                  title="Edit Member"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => m.id && handleDelete(m.id)}
                  className="rounded-full p-2 text-ink-400 transition-colors hover:bg-surface hover:text-brand-orange"
                  title="Remove Member"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Special Attributes Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {m.isStudent && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                  <GraduationCap className="h-3.5 w-3.5" /> Enrolled Student
                </span>
              )}
              {m.isDisability && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                  <Accessibility className="h-3.5 w-3.5" /> Person with Disability (PwD)
                </span>
              )}
              {m.landAcres > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mint/20 px-2.5 py-1 text-[11px] font-semibold text-[#3d7d6b] dark:text-[#7fd1bb]">
                  <Sprout className="h-3.5 w-3.5" /> {m.landAcres} Acres Agricultural Land
                </span>
              )}
              {m.occupation === 'Farmer' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  <Briefcase className="h-3.5 w-3.5" /> Agriculture Beneficiary
                </span>
              )}
            </div>
          </div>
        ))}

        {family.length === 0 && !loading && (
          <p className="py-8 text-center text-xs text-ink-400">
            No family members added yet. Click "Add Family Member" above to add parents, spouse, or children.
          </p>
        )}
      </div>

      {/* Render Full-Screen Centered Modal via React Portal on Document Body */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
            <div className="w-full max-w-[560px] overflow-hidden rounded-[28px] border border-border-subtle bg-surface shadow-2xl transition-all">
              {/* Modal Top Header Bar */}
              <div className="flex items-center justify-between border-b border-border-subtle/80 bg-canvas/40 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-navy text-navy-contrast shadow-soft">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold text-ink-900">
                      {editingMember ? 'Edit Family Member' : 'Add New Family Member'}
                    </h4>
                    <p className="text-xs text-ink-400">
                      Provide member details for scheme qualification matching.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-canvas hover:text-ink-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleSubmit} className="max-h-[82vh] overflow-y-auto p-6 space-y-5">
                {/* Section 1: Basic Identity */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter member's full name (e.g. Ramesh Mukherjee)"
                    className="mt-1.5 w-full rounded-xl border border-border-subtle bg-canvas px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Relationship
                    </label>
                    <div className="relative mt-1.5">
                      <select
                        value={formData.relation}
                        onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                        className="w-full appearance-none rounded-xl border border-border-subtle bg-canvas px-4 py-3 pr-10 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                      >
                        {RELATIONS.map((r) => (
                          <option key={r} value={r} className="bg-surface text-ink-900">
                            {r}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-ink-400" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                        Date of Birth
                      </label>
                      <span className="rounded-full bg-brand-orange/15 px-2 py-0.5 text-[10px] font-bold text-brand-orange">
                        {liveCalculatedAge} yrs old
                      </span>
                    </div>
                    <input
                      type="date"
                      required
                      value={formData.dob || ''}
                      onChange={(e) => handleDobChange(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-border-subtle bg-canvas px-4 py-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Gender
                    </label>
                    <div className="relative mt-1.5">
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full appearance-none rounded-xl border border-border-subtle bg-canvas px-4 py-3 pr-10 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                      >
                        <option value="Male" className="bg-surface text-ink-900">Male</option>
                        <option value="Female" className="bg-surface text-ink-900">Female</option>
                        <option value="Other" className="bg-surface text-ink-900">Other</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-ink-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Occupation
                    </label>
                    <div className="relative mt-1.5">
                      <select
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        className="w-full appearance-none rounded-xl border border-border-subtle bg-canvas px-4 py-3 pr-10 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                      >
                        {OCCUPATIONS.map((o) => (
                          <option key={o} value={o} className="bg-surface text-ink-900">
                            {o}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-ink-400" />
                    </div>
                  </div>
                </div>

                {/* State & Residence Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      State Residence
                    </label>
                    <div className="relative mt-1.5">
                      <select
                        value={formData.state || 'West Bengal'}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full appearance-none rounded-xl border border-border-subtle bg-canvas px-4 py-3 pr-10 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                      >
                        {['West Bengal', 'Odisha', 'Karnataka', 'Delhi', 'Bihar', 'Assam', 'Punjab', 'Haryana', 'Gujarat', 'Maharashtra', 'Kerala', 'Tamil Nadu', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh'].map((s) => (
                          <option key={s} value={s} className="bg-surface text-ink-900">
                            {s}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-ink-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Residence Type
                    </label>
                    <div className="relative mt-1.5">
                      <select
                        value={formData.residenceType || 'Rural'}
                        onChange={(e) => setFormData({ ...formData, residenceType: e.target.value })}
                        className="w-full appearance-none rounded-xl border border-border-subtle bg-canvas px-4 py-3 pr-10 text-sm font-medium text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                      >
                        <option value="Rural" className="bg-surface text-ink-900">Rural</option>
                        <option value="Urban" className="bg-surface text-ink-900">Urban</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 h-4 w-4 text-ink-400" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Financial & Asset Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Annual Income (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.annualIncome}
                      onChange={(e) => setFormData({ ...formData, annualIncome: Number(e.target.value) })}
                      placeholder="e.g. 65000"
                      className="mt-1.5 w-full rounded-xl border border-border-subtle bg-canvas px-4 py-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Land Owned (Acres)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.landAcres}
                      onChange={(e) => setFormData({ ...formData, landAcres: Number(e.target.value) })}
                      placeholder="e.g. 1.5"
                      className="mt-1.5 w-full rounded-xl border border-border-subtle bg-canvas px-4 py-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                    />
                  </div>
                </div>

                {/* Section 3: Special Qualification Cards */}
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                    Special Status Factors
                  </p>

                  <div
                    onClick={() => setFormData({ ...formData, isStudent: !formData.isStudent })}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all duration-150 ${
                      formData.isStudent
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'border-border-subtle bg-canvas/40 hover:bg-canvas/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ink-900">Enrolled Student / Scholar</p>
                        <p className="text-[11px] text-ink-400">Qualifies for education & laptop schemes</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isStudent}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-border-subtle text-brand-orange focus:ring-brand-orange"
                    />
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, isDisability: !formData.isDisability })}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition-all duration-150 ${
                      formData.isDisability
                        ? 'border-purple-500/50 bg-purple-500/10'
                        : 'border-border-subtle bg-canvas/40 hover:bg-canvas/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                        <Accessibility className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ink-900">Person with Benchmark Disability (PwD)</p>
                        <p className="text-[11px] text-ink-400">Qualifies for ADIP & disability pensions</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isDisability}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-border-subtle text-brand-orange focus:ring-brand-orange"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-border-subtle bg-canvas px-5 py-3 text-xs font-semibold text-ink-700 transition-colors hover:bg-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 py-3 text-xs font-bold uppercase tracking-wider text-navy-contrast transition-all hover:bg-[#2d2839] hover:shadow-soft"
                  >
                    <Sparkles className="h-4 w-4 text-brand-orange" />
                    {editingMember ? 'Save Member Changes' : 'Add Family Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
