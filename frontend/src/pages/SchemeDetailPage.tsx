import { useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink, ShieldCheck, FileText, CheckCircle2, Building2, Calendar, Users, Award } from 'lucide-react'
import { fetchSchemes, type BackendScheme } from '../services/api'
import { getCategoryTheme } from '../utils/themeMapper'
import { catalogSchemes } from '../data'

const CATEGORY_DOTS: Record<string, string> = {
  Housing: 'bg-card-lavender',
  Food: 'bg-card-olive',
  Health: 'bg-card-sage',
  Farmer: 'bg-card-terracotta',
  Education: 'bg-card-mauve',
  Women: 'bg-brand-orange',
  Savings: 'bg-card-khaki',
  Pension: 'bg-brand-mint',
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
      { title: 'Institute Admission Fee Receipt', desc: 'Current year admission proof & bonafide student letter' },
      { title: 'Family Income Certificate', desc: 'Income certificate issued by competent authority' },
      { title: 'Bank Account Passbook', desc: 'Single bank account in student’s name' },
    ]
  }

  if (cat.includes('women') || cat.includes('child') || t.includes('kanyashree') || t.includes('bhandar') || t.includes('matru')) {
    return [
      { title: 'Aadhaar Card & Voter ID', desc: 'Proof of identity and resident status of female applicant' },
      { title: 'Bank Account Passbook (Single Name)', desc: 'Bank account exclusively in woman’s name for DBT' },
      { title: 'Child Birth / MCP Health Card', desc: 'For maternity & child welfare benefits' },
      { title: 'Residential Domicile Certificate', desc: 'Proof of continuous residence in target state' },
      { title: 'Self-Declaration Form', desc: 'Signed declaration of income & non-taxpayer status' },
    ]
  }

  if (cat.includes('pension') || cat.includes('senior') || cat.includes('savings') || t.includes('pension') || t.includes('vaya')) {
    return [
      { title: 'Aadhaar Card & Proof of Age', desc: 'Voter ID / Birth Certificate / School Leaving Cert' },
      { title: 'Bank / Post Office Passbook', desc: 'Account details for monthly pension disbursement' },
      { title: 'Income / BPL Ration Card', desc: 'Proof of economic eligibility or widow status certificate' },
      { title: 'Life Certificate (Jeevan Pramaan)', desc: 'Annual bio-metric life verification' },
      { title: 'Passport Size Photographs', desc: '2 recent passport size photographs' },
    ]
  }

  if (cat.includes('business') || cat.includes('employ') || cat.includes('msme') || t.includes('mudra') || t.includes('vishwakarma') || t.includes('svanidhi')) {
    return [
      { title: 'Aadhaar Card & PAN Card', desc: 'Entrepreneur identity and tax PAN card' },
      { title: 'Udyam MSME Registration Certificate', desc: 'Government registered MSME / Artisan ID card' },
      { title: 'Detailed Project Report (DPR)', desc: 'Business plan, quotation & machinery cost estimate' },
      { title: 'Bank Statement (Last 6 Months)', desc: 'Active business/savings bank account statement' },
      { title: 'Trade License / Vending Certificate', desc: 'Issued by local municipality / Gram Panchayat' },
    ]
  }

  if (cat.includes('energy') || t.includes('solar') || t.includes('surya') || t.includes('kusum') || t.includes('biogas')) {
    return [
      { title: 'Aadhaar Card of Property Owner', desc: 'Identity proof of electricity connection holder' },
      { title: 'Latest Electricity Bill', desc: 'Proof of active DISCOM consumer number' },
      { title: 'Roof / Property Ownership Document', desc: 'Proof of rooftop/land availability for solar panel setup' },
      { title: 'Bank Passbook & Cancelled Cheque', desc: 'Account seeded for Central Financial Assistance subsidy' },
      { title: 'Solar Vendor Installation Quote', desc: 'Quotation from empaneled DISCOM solar vendor' },
    ]
  }

  if (cat.includes('health') || t.includes('ayushman') || t.includes('swasthya') || t.includes('aushadhi')) {
    return [
      { title: 'Ayushman / State Health Card', desc: 'PM-JAY golden card or state health card' },
      { title: 'Aadhaar Card & Ration Card', desc: 'Family ID card showing dependent names' },
      { title: 'Hospital Pre-Authorization Request', desc: 'Diagnostic report & hospital admission referral note' },
      { title: 'Income / BPL Certificate', desc: 'For full cashless medical treatment coverage' },
    ]
  }

  return [
    { title: 'Aadhaar Card', desc: 'UIDAI verified identity & address proof' },
    { title: 'Income & Domicile Certificate', desc: 'Issued by competent Tehsil/SDO authority' },
    { title: 'Bank Account Passbook', desc: 'Aadhaar-seeded bank account for direct benefit transfer' },
    { title: 'Passport Size Photographs', desc: 'Recent color passport photos' },
    { title: 'Supporting Category Proof', desc: 'Relevant trade, disability, or domain specific document' },
  ]
}

export function SchemeDetailPage({ schemeId, onBack }: SchemeDetailPageProps) {
  const [scheme, setScheme] = useState<BackendScheme | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isSubscribed = true
    async function loadSchemeDetail() {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:5000/api/schemes/${schemeId}`)
        const json = await res.json()
        if (isSubscribed && json.success && json.data) {
          setScheme(json.data)
          setLoading(false)
          return
        }
      } catch (err) {
        console.warn('Backend detail API error; using local fallback:', err)
      }

      if (isSubscribed) {
        const found = catalogSchemes.find((s) => s.id === schemeId)
        if (found) {
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
        setLoading(false)
      }
    }

    loadSchemeDetail()
    return () => {
      isSubscribed = false
    }
  }, [schemeId])

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
            Key Scheme Benefit & Financial Support
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

          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-brand-navy px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-navy-contrast shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#2d2839] focus-visible:outline-2 focus-visible:outline-brand-orange max-md:w-full"
          >
            Apply on Official Portal
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

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
              Citizens meeting the income & demographic criteria stated above.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand-mint shrink-0" />
              Must hold active Aadhaar card linked with bank account for Direct Benefit Transfer (DBT).
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand-mint shrink-0" />
              Valid domiciliary & identity proof of target state / central jurisdiction.
            </li>
          </ul>
        </div>

        {/* Right Column: Dynamic Required Documents Checklist */}
        <div className="rounded-[24px] border border-border-subtle bg-surface p-6 shadow-soft">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
            <FileText className="h-5 w-5 text-brand-mint" />
            Required Documents Checklist ({scheme.category})
          </h2>
          <p className="mt-1 text-xs text-ink-400">
            Tailored document checklist required for {scheme.title}.
          </p>

          <div className="mt-4 space-y-3">
            {requiredDocuments.map((doc, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-xl border border-border-subtle/70 bg-canvas/40 p-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-xs font-bold text-brand-navy">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink-900">{doc.title}</p>
                  <p className="text-[11px] text-ink-400">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Banner */}
      <div className="mt-6 rounded-[24px] border border-border-subtle bg-brand-navy p-6 text-navy-contrast shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold">Ready to register for {scheme.title}?</h3>
          <p className="mt-1 text-xs text-navy-contrast/80">
            Redirecting to official portal ({applyUrl}) for online application submission.
          </p>
        </div>

        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 shrink-0 rounded-[14px] bg-brand-orange px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-soft transition-all duration-150 hover:bg-[#d07e44] max-md:w-full"
        >
          Apply Now ↗
        </a>
      </div>
    </div>
  )
}
