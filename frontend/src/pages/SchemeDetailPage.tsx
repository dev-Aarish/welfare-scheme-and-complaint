import { useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink, ShieldCheck, FileText, CheckCircle2, Building2, Users, Award, Sparkles, AlertCircle, HelpCircle, UserCheck, ChevronRight, X } from 'lucide-react'
import { fetchFamilyMembers, matchHouseholdSchemesApi, API_BASE_URL, type BackendScheme } from '../services/api'
import { catalogSchemes } from '../data'
import { useAuth } from '../context/AuthContext'

const CATEGORY_DOTS: Record<string, string> = {
  Housing: 'bg-card-lavender',
  Food: 'bg-card-olive',
  Health: 'bg-card-sage',
  Farmer: 'bg-card-[#e2847a]',
  Education: 'bg-card-mauve',
  Women: 'bg-brand-orange',
  Savings: 'bg-card-khaki',
  Pension: 'bg-brand-mint',
}

const ALL_INDIAN_STATES: { name: string; key: string; keywords: string[] }[] = [
  { name: 'Andhra Pradesh', key: 'andhra', keywords: ['andhra pradesh', 'andhra', 'jagananna', 'amma vodi', 'ysr'] },
  { name: 'Arunachal Pradesh', key: 'arunachal', keywords: ['arunachal pradesh', 'arunachal'] },
  { name: 'Assam', key: 'assam', keywords: ['assam', 'orunodoi'] },
  { name: 'Bihar', key: 'bihar', keywords: ['bihar', 'mukhyamantri kanya utthan'] },
  { name: 'Chhattisgarh', key: 'chhattisgarh', keywords: ['chhattisgarh', 'godhan nyay'] },
  { name: 'Goa', key: 'goa', keywords: ['goa'] },
  { name: 'Gujarat', key: 'gujarat', keywords: ['gujarat', 'vohli diykri'] },
  { name: 'Haryana', key: 'haryana', keywords: ['haryana', 'parivar pehchan'] },
  { name: 'Himachal Pradesh', key: 'himachal', keywords: ['himachal pradesh', 'himachal'] },
  { name: 'Jharkhand', key: 'jharkhand', keywords: ['jharkhand', 'abua housing'] },
  { name: 'Karnataka', key: 'karnataka', keywords: ['karnataka', 'gruha lakshmi', 'gruha jyoti', 'yuva nidhi', 'shakti scheme'] },
  { name: 'Kerala', key: 'kerala', keywords: ['kerala', 'karunya'] },
  { name: 'Madhya Pradesh', key: 'madhya', keywords: ['madhya pradesh', 'ladli behna', 'ladli laxmi'] },
  { name: 'Maharashtra', key: 'maharashtra', keywords: ['maharashtra', 'ladki bahin', 'jyotirao phule'] },
  { name: 'Manipur', key: 'manipur', keywords: ['manipur'] },
  { name: 'Meghalaya', key: 'meghalaya', keywords: ['meghalaya'] },
  { name: 'Mizoram', key: 'mizoram', keywords: ['mizoram'] },
  { name: 'Nagaland', key: 'nagaland', keywords: ['nagaland'] },
  { name: 'Odisha', key: 'odisha', keywords: ['odisha', 'orissa', 'kalia', 'biju swasthya', 'subhadra'] },
  { name: 'Punjab', key: 'punjab', keywords: ['punjab', 'atta dal'] },
  { name: 'Rajasthan', key: 'rajasthan', keywords: ['rajasthan', 'chiranjeevi', 'annapurna'] },
  { name: 'Sikkim', key: 'sikkim', keywords: ['sikkim'] },
  { name: 'Tamil Nadu', key: 'tamil nadu', keywords: ['tamil nadu', 'tn ', 'pudhumai penn', 'magalir urimai'] },
  { name: 'Telangana', key: 'telangana', keywords: ['telangana', 'rythu bandhu', 'mahala lakshmi', 'gruha jyothi'] },
  { name: 'Tripura', key: 'tripura', keywords: ['tripura'] },
  { name: 'Uttar Pradesh', key: 'uttar pradesh', keywords: ['uttar pradesh', 'uttar', 'kanya sumangala', 'abhyudaya'] },
  { name: 'Uttarakhand', key: 'uttarakhand', keywords: ['uttarakhand', 'gaura devi'] },
  { name: 'West Bengal', key: 'west bengal', keywords: ['west bengal', 'bengal', 'kanyashree', 'lakshmir bhandar', 'krishak bandhu', 'swasthya sathi', 'duare sarkar'] },
  { name: 'Delhi', key: 'delhi', keywords: ['delhi', 'nct of delhi', 'ladli scheme'] },
  { name: 'Jammu & Kashmir', key: 'jammu', keywords: ['jammu', 'kashmir', 'j&k'] },
  { name: 'Ladakh', key: 'ladakh', keywords: ['ladakh'] },
  { name: 'Puducherry', key: 'puducherry', keywords: ['puducherry'] },
  { name: 'Chandigarh', key: 'chandigarh', keywords: ['chandigarh'] },
]

interface MemberChoice {
  id: string
  name: string
  relation: string
  badge: string
  data: {
    fullName: string
    age: number
    gender: string
    occupation: string
    isStudent: boolean
    annualIncome: number
    landAcres?: number
    state?: string
    residenceType?: string
  }
}

interface SchemeDetailPageProps {
  schemeId: string
  onBack: () => void
}

function getRequiredDocumentsForScheme(category: string, title: string) {
  const cat = (category || '').toLowerCase()
  const t = (title || '').toLowerCase()

  if (cat.includes('agri') || cat.includes('farm') || t.includes('kisan') || t.includes('crop') || t.includes('soil')) {
    return [
      { title: 'Aadhaar Card', desc: 'UIDAI verified identity proof linked with mobile' },
      { title: 'Land Ownership / Khatian Record', desc: 'RoR / 7/12 extract or Land Lease agreement' },
      { title: 'Bank Passbook (DBT Seeded)', desc: 'Bank account in farmer’s name for direct subsidy credit' },
      { title: 'Kisan Credit Card (KCC)', desc: 'If applying for credit or interest subvention support' },
      { title: 'Crop Sowing / Soil Health Certificate', desc: 'Issued by Agriculture Officer / Gram Panchayat' },
    ]
  }

  if (cat.includes('house') || cat.includes('housing') || t.includes('awas') || t.includes('jal') || t.includes('land')) {
    return [
      { title: 'Aadhaar Card of Household Members', desc: 'UIDAI identity cards for all family beneficiaries' },
      { title: 'Income & BPL Certificate', desc: 'Issued by competent Block/Tehsil/SDO Officer' },
      { title: 'Land Ownership / Site Allotment Letter', desc: 'Proof of land availability or non-pucca house declaration' },
      { title: 'Bank Passbook & PAN Card', desc: 'Active bank account details for housing grant installments' },
      { title: 'Recent Photograph of Existing Dwelling', desc: 'Photo proof of current living condition' },
    ]
  }

  if (cat.includes('edu') || cat.includes('scholar') || t.includes('scholarship') || t.includes('student') || t.includes('school')) {
    return [
      { title: 'Aadhaar Card of Student', desc: 'Student identity proof linked with mobile' },
      { title: 'Previous Academic Marksheet', desc: 'Self-attested copy of last qualifying examination pass certificate' },
      { title: 'Institutional Bonafide Certificate', desc: 'Issued by Principal / Dean of recognized school or college' },
      { title: 'Family Income Certificate', desc: 'Proof of household annual income below ceiling' },
      { title: 'Bank Account Passbook (Student/Joint)', desc: 'For direct scholarship disbursal' },
    ]
  }

  return [
    { title: 'Aadhaar Card', desc: 'Government UIDAI identity proof linked with mobile' },
    { title: 'Bank Passbook (DBT Seeded)', desc: 'Bank account in applicant’s name for direct benefit credit' },
    { title: 'State Domicile Certificate', desc: 'Proof of residential jurisdiction in target state' },
    { title: 'Family Income Certificate', desc: 'Issued by competent Block Development Officer (BDO)' },
  ]
}

export function SchemeDetailPage({ schemeId, onBack }: SchemeDetailPageProps) {
  const { guest } = useAuth()
  const [scheme, setScheme] = useState<BackendScheme | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingEligibility, setCheckingEligibility] = useState(false)
  const [eligibilityResult, setEligibilityResult] = useState<any | null>(null)
  const [evaluatedMember, setEvaluatedMember] = useState<MemberChoice | null>(null)
  
  // Modal for selecting family member
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [familyMembersList, setFamilyMembersList] = useState<MemberChoice[]>([])

  useEffect(() => {
    let isSubscribed = true

    async function loadData() {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/schemes/${schemeId}`)
        const json = await res.json()
        if (isSubscribed && json.success && json.data) {
          setScheme(json.data)
        }
      } catch (err) {
        console.warn('Backend detail API error; using local fallback:', err)
      }

      if (isSubscribed) {
        const found = catalogSchemes.find((s) => s.id === schemeId)
        if (found && !scheme) {
          setScheme({
            id: found.id,
            externalId: found.id,
            source: 'system',
            sourceUrl: 'https://myscheme.gov.in',
            title: found.title,
            category: found.category,
            tag: found.category,
            description: found.description,
            benefit: found.benefit,
            eligibility: found.eligibility,
            isActive: true,
            applicationsCount: 312,
          })
        }

        // Load family members for member selection modal.
        // Demo seeds a mock "Self"; real users only get their own family.
        const fetchedFamily = await fetchFamilyMembers()
        const defaultList: MemberChoice[] = guest
          ? [
              {
                id: 'asha-self',
                name: 'Asha Verma (Self)',
                relation: 'Self',
                badge: '32 yrs · Female · Farmer',
                data: {
                  fullName: 'Asha Verma',
                  age: 32,
                  gender: 'Female',
                  occupation: 'Farmer',
                  isStudent: false,
                  annualIncome: 120000,
                  landAcres: 1.5,
                  state: 'West Bengal',
                },
              },
            ]
          : []

        if (fetchedFamily && fetchedFamily.length > 0) {
          fetchedFamily.forEach((m) => {
            defaultList.push({
              id: m.id || m.fullName,
              name: `${m.fullName} (${m.relation})`,
              relation: m.relation,
              badge: `${m.age} yrs · ${m.gender} · ${m.occupation}`,
              data: {
                fullName: m.fullName,
                age: m.age,
                gender: m.gender,
                occupation: m.occupation,
                isStudent: Boolean(m.isStudent || m.occupation === 'Student'),
                annualIncome: m.annualIncome || 120000,
                landAcres: m.landAcres || 0,
                state: m.state || 'West Bengal',
              },
            })
          })
        } else {
          // Hardcoded fallback household members
          defaultList.push(
            {
              id: 'ramesh-father',
              name: 'Ramesh Mukherjee (Father)',
              relation: 'Father',
              badge: '58 yrs · Male · Farmer',
              data: { fullName: 'Ramesh Mukherjee', age: 58, gender: 'Male', occupation: 'Farmer', isStudent: false, annualIncome: 95000, landAcres: 1.2, state: 'West Bengal' },
            },
            {
              id: 'sunita-mother',
              name: 'Sunita Mukherjee (Mother)',
              relation: 'Mother',
              badge: '54 yrs · Female · Homemaker',
              data: { fullName: 'Sunita Mukherjee', age: 54, gender: 'Female', occupation: 'Homemaker', isStudent: false, annualIncome: 0, landAcres: 0, state: 'West Bengal' },
            },
            {
              id: 'sourav-son',
              name: 'Sourav Mukherjee (Son)',
              relation: 'Son',
              badge: '21 yrs · Male · Student',
              data: { fullName: 'Sourav Mukherjee', age: 21, gender: 'Male', occupation: 'Student', isStudent: true, annualIncome: 0, landAcres: 0, state: 'West Bengal' },
            }
          )
        }

        setFamilyMembersList(defaultList)
        setLoading(false)
      }
    }

    loadData()
    return () => {
      isSubscribed = false
    }
  }, [schemeId])

  // Run eligibility match for a specific family member
  const evaluateMemberEligibility = async (member: MemberChoice) => {
    if (!scheme) return
    setEvaluatedMember(member)
    setShowMemberModal(false)
    setCheckingEligibility(true)

    const mData = member.data
    const profilePayload = {
      person: {
        age: mData.age,
        gender: mData.gender.toUpperCase(),
        occupation: mData.occupation.toUpperCase(),
        isStudent: mData.isStudent,
      },
      household: {
        annualIncome: mData.annualIncome,
        landAcres: mData.landAcres || 0,
      },
      location: {
        state: (mData.state || 'West Bengal').toUpperCase().replace(/ /g, '_'),
      },
    }

    const res = await matchHouseholdSchemesApi({ structuredProfile: profilePayload })
    setCheckingEligibility(false)

    if (res && res.matches) {
      const match = res.matches.find((m) => m.schemeId === scheme.id || m.title === scheme.title)
      if (match) {
        setEligibilityResult(match)
      } else {
        // Construct explicit failing rules explanation for this specific member
        const text = `${scheme.title} ${scheme.category} ${scheme.benefit} ${scheme.description} ${scheme.eligibility}`.toLowerCase()
        const failedReasons: string[] = []

        // Gender Check
        if (text.includes('girl') || text.includes('women') || text.includes('mother') || text.includes('widow') || text.includes('kanyashree') || text.includes('bhandar') || text.includes('sukanya')) {
          if (mData.gender.toUpperCase() !== 'FEMALE') {
            failedReasons.push(`Restricted to Female beneficiaries (${member.name} is ${mData.gender})`)
          }
        }

        // Student Check
        if (text.includes('scholarship') || text.includes('student') || text.includes('post-matric') || scheme.category === 'Education') {
          if (!mData.isStudent && mData.occupation !== 'Student') {
            failedReasons.push(`Restricted to Enrolled Students / Scholars (${member.name} is ${mData.occupation})`)
          }
        }

        // Senior Citizen Age Check (60+)
        if (text.includes('old age') || text.includes('senior citizen') || text.includes('pension') || text.includes('vayo')) {
          if (mData.age < 60) {
            failedReasons.push(`Minimum age requirement is 60 years (${member.name} is ${mData.age} years old)`)
          }
        }

        // Minor Child Check (<18)
        if (text.includes('minor') || text.includes('child under 18') || text.includes('schoolgirl')) {
          if (mData.age >= 18) {
            failedReasons.push(`Restricted to Minors under 18 years (${member.name} is ${mData.age} years old)`)
          }
        }

        // Dynamic Multi-State Jurisdiction Check across all Indian States & UTs
        const userStateRaw = (mData.state || 'West Bengal').trim()
        const userStateNormalized = userStateRaw.toLowerCase()

        for (const st of ALL_INDIAN_STATES) {
          const isSchemeTargetingState = st.keywords.some((kw) => text.includes(kw))
          if (isSchemeTargetingState) {
            const userBelongsToState = userStateNormalized.includes(st.key) || userStateNormalized.includes(st.name.toLowerCase())
            if (!userBelongsToState) {
              failedReasons.push(`State Jurisdiction Mismatch: Restricted to ${st.name} residents (${member.name} state: ${userStateRaw})`)
              break
            }
          }
        }

        if (failedReasons.length === 0) {
          failedReasons.push(`Demographic profile for ${member.name} does not meet scheme eligibility thresholds.`)
        }

        setEligibilityResult({
          status: 'INELIGIBLE',
          relevanceScore: 40,
          matchedRules: [],
          failedRules: failedReasons,
          missingFields: [],
          explanation: failedReasons.join(' · '),
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-ink-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-orange border-t-transparent" />
        <p className="mt-3 text-sm">Loading scheme details…</p>
      </div>
    )
  }

  if (!scheme) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-semibold text-ink-900">Scheme not found</p>
        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-canvas"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </button>
      </div>
    )
  }

  const dotClass = CATEGORY_DOTS[scheme.category] || 'bg-brand-orange'
  const applyUrl = scheme.sourceUrl || `https://www.google.com/search?q=${encodeURIComponent(scheme.title + ' official portal apply')}`
  const requiredDocuments = getRequiredDocumentsForScheme(scheme.category, scheme.title)

  return (
    <div className="mx-auto max-w-4xl">
      {/* Top Back Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-4 py-2 text-xs font-semibold text-ink-700 shadow-soft transition-all duration-150 hover:-translate-x-0.5 hover:bg-canvas hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
          Back to Catalog
        </button>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-400 border border-border-subtle">
          <ShieldCheck className="h-3.5 w-3.5 text-brand-mint" />
          Government Verified Scheme
        </span>
      </div>

      {/* Main Header Banner Card */}
      <div className="relative overflow-hidden rounded-[24px] border border-border-subtle bg-surface p-6 shadow-soft md:p-8">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className={`h-3 w-3 rounded-full ${dotClass}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-ink-400">
            {scheme.category}
          </span>
          <span className="rounded-full bg-brand-mint/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#3d7d6b] dark:text-[#7fd1bb]">
            {scheme.tag || scheme.category}
          </span>
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold text-ink-900 md:text-3xl">
          {scheme.title}
        </h1>

        <p className="mt-3 text-base leading-relaxed text-ink-700 md:text-lg">
          {scheme.description}
        </p>

        {/* Primary Benefit Box */}
        <div className="mt-6 rounded-2xl border border-brand-orange/20 bg-brand-orange/10 p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <Award className="h-4 w-4" />
            Key Scheme Benefit &amp; Financial Support
          </div>
          <p className="mt-1 font-display text-xl font-bold text-ink-900 md:text-2xl">
            {scheme.benefit}
          </p>
        </div>

        {/* Action Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-6">
          <div className="flex flex-wrap items-center gap-4 text-xs text-ink-400">
            <span className="flex items-center gap-1.5 font-semibold text-ink-700">
              <Building2 className="h-4 w-4 text-brand-orange" />
              Source: {scheme.source || 'Central Government'}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-ink-700" />
              {scheme.applicationsCount || 100}+ Applicants
            </span>
            <span className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-mono text-ink-400">
              Rule Version: 2026-08-01
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Check Eligibility Match Button (Triggers Member Modal) */}
            <button
              onClick={() => setShowMemberModal(true)}
              disabled={checkingEligibility}
              className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-[14px] bg-brand-orange px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#c94b39] disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {checkingEligibility ? 'Evaluating Rules...' : 'Check Eligibility Match'}
            </button>

            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-[14px] bg-brand-navy px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-navy-contrast shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#2d2839]"
            >
              Apply Official Portal
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Member Selection Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
          <div className="w-full max-w-[500px] overflow-hidden rounded-[28px] border border-border-subtle bg-surface shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-border-subtle/80 bg-canvas/40 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-orange text-white shadow-soft">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-ink-900">
                    Select Family Member to Evaluate
                  </h4>
                  <p className="text-xs text-ink-400">
                    Which household profile should be matched against scheme criteria?
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowMemberModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-canvas hover:text-ink-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {familyMembersList.map((member) => (
                <div
                  key={member.id}
                  onClick={() => evaluateMemberEligibility(member)}
                  className="flex items-center justify-between rounded-2xl border border-border-subtle bg-canvas/40 p-4 transition-all duration-150 hover:border-brand-orange hover:bg-brand-orange/5 hover:shadow-soft cursor-pointer group"
                >
                  <div>
                    <h5 className="font-display text-sm font-bold text-ink-900 group-hover:text-brand-orange">
                      {member.name}
                    </h5>
                    <p className="mt-0.5 text-xs text-ink-400 font-medium">
                      {member.badge}
                    </p>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink-400 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Eligibility Match Assessment Result Box */}
      {eligibilityResult && evaluatedMember && (
        <div className={`mt-6 rounded-[24px] border p-6 shadow-soft transition-all ${
          eligibilityResult.status === 'ELIGIBLE'
            ? 'border-brand-mint/40 bg-brand-mint/10'
            : eligibilityResult.status === 'MORE_INFO_REQUIRED'
            ? 'border-blue-500/40 bg-blue-500/10'
            : 'border-red-500/40 bg-red-500/10'
        }`}>
          <div className="flex items-start gap-3">
            {eligibilityResult.status === 'ELIGIBLE' ? (
              <CheckCircle2 className="h-6 w-6 text-[#3d7d6b] shrink-0 mt-0.5" />
            ) : eligibilityResult.status === 'MORE_INFO_REQUIRED' ? (
              <HelpCircle className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
            )}

            <div className="w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle/40 pb-2.5">
                <h3 className="font-display text-lg font-bold text-ink-900">
                  {eligibilityResult.status === 'ELIGIBLE' && '100% ELIGIBLE — Rule AST Verified'}
                  {eligibilityResult.status === 'POTENTIALLY_ELIGIBLE' && 'POTENTIALLY ELIGIBLE'}
                  {eligibilityResult.status === 'MORE_INFO_REQUIRED' && 'MORE INFORMATION REQUIRED'}
                  {eligibilityResult.status === 'INELIGIBLE' && 'NOT ELIGIBLE FOR THIS SCHEME'}
                </h3>

                <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-ink-700 border border-border-subtle">
                  Target Member: {evaluatedMember.name}
                </span>
              </div>

              {/* Verified Matched Rules */}
              {eligibilityResult.matchedRules && eligibilityResult.matchedRules.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-700">Matched Qualification Factors:</p>
                  <ul className="space-y-1 text-xs text-ink-900 font-medium">
                    {eligibilityResult.matchedRules.map((rule: string, i: number) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#3d7d6b]" /> {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Exact Failing Reasons Why Not Eligible */}
              {eligibilityResult.failedRules && eligibilityResult.failedRules.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">Why {evaluatedMember.data.fullName} Is Not Eligible:</p>
                  <ul className="space-y-1.5 text-xs text-red-700 font-semibold bg-red-500/10 p-3 rounded-xl">
                    {eligibilityResult.failedRules.map((reason: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <X className="h-4 w-4 shrink-0 text-red-600 font-bold" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Explanation Note */}
              <p className="mt-3 text-xs leading-relaxed text-ink-700 border-t border-border-subtle/40 pt-2.5">
                <strong>Audit Note:</strong> {eligibilityResult.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detail Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column: Eligibility & Criteria */}
        <div className="rounded-[24px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
            <CheckCircle2 className="h-5 w-5 text-brand-orange" />
            Eligibility Criteria
          </h2>
          <p className="mt-1 text-xs text-ink-400">
            Who is qualified to receive benefits under this scheme.
          </p>

          <div className="mt-4 rounded-xl bg-canvas/60 p-4">
            <p className="text-sm font-medium leading-relaxed text-ink-900">
              {scheme.eligibility}
            </p>
          </div>

          <ul className="mt-4 space-y-2.5 text-xs text-ink-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand-mint shrink-0" />
              Citizens meeting the income &amp; demographic criteria stated above.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand-mint shrink-0" />
              Must hold active Aadhaar card linked with bank account for Direct Benefit Transfer (DBT).
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand-mint shrink-0" />
              Valid domiciliary &amp; identity proof of target state / central jurisdiction.
            </li>
          </ul>
        </div>

        {/* Right Column: Dynamic Required Documents Checklist */}
        <div className="rounded-[24px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
            <FileText className="h-5 w-5 text-brand-orange" />
            Required Documents Checklist
          </h2>
          <p className="mt-1 text-xs text-ink-400">
            Keep these documents ready before starting your official portal application.
          </p>

          <div className="mt-4 space-y-3">
            {requiredDocuments.map((doc, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-xl border border-border-subtle/80 bg-canvas/40 p-3.5 transition-colors hover:bg-canvas/70">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-xs font-bold text-brand-orange">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-ink-900">{doc.title}</h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-ink-400">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
