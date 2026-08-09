import { useEffect, useState, type FormEvent } from 'react'
import {
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Map,
  MapPin,
  Navigation,
  Upload,
  Video,
} from 'lucide-react'
import { classifyComplaintWithGemini, createComplaint } from '../services/api'
import { PageHeader } from '../components/PageHeader'

type AIResult = {
  category: string
  categoryLabel: string
  evidenceRequired: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
}

type CategoryRule = Omit<AIResult, 'category' | 'categoryLabel'> & {
  category: string
  categoryLabel: string
  keywords: string[]
}

/* A local, explainable classifier. Multi-word phrases are weighted more
   strongly than one-word matches, which prevents broad words (such as
   "water" or "road") from overpowering a specific complaint description. */
const categoryRules: CategoryRule[] = [
  { category: 'pothole', categoryLabel: 'Pothole / Road Damage', keywords: ['pothole', 'road damage', 'damaged road', 'road crater', 'road is damaged', 'broken road', 'big hole in road', 'রাস্তার গর্ত', 'রাস্তা ভাঙা', 'सड़क में गड्ढा', 'टूटी सड़क'], evidenceRequired: true, priority: 'medium' },
  { category: 'online-harassment', categoryLabel: 'Online Harassment', keywords: ['online harassment', 'cyber harassment', 'cyberbullying', 'threatening message', 'online threat', 'instagram', 'facebook', 'whatsapp', 'সাইবার হয়রানি', 'অনলাইনে হুমকি', 'ऑनलाइन उत्पीड़न', 'साइबर बुलिंग'], evidenceRequired: true, priority: 'high' },
  { category: 'offline-harassment', categoryLabel: 'Offline Harassment', keywords: ['physical harassment', 'harassing me', 'verbal abuse', 'offline harassment', 'someone is harassing', 'eve teasing', 'হয়রানি করছে', 'মৌখিক নির্যাতন', 'उत्पीड़न', 'गाली गलौज'], evidenceRequired: false, priority: 'high' },
  { category: 'public-property-damage', categoryLabel: 'Public Property Damage', keywords: ['damaged public property', 'broken public property', 'damaged government property', 'broken government property', 'damaged bench', 'broken bench', 'damaged bus stop', 'broken bus stop', 'সরকারি সম্পত্তি ভাঙা', 'सार्वजनिक संपत्ति क्षतिग्रस्त'], evidenceRequired: true, priority: 'medium' },
  { category: 'public-safety', categoryLabel: 'Public Safety', keywords: ['public safety', 'unsafe area', 'dangerous', 'unsafe', 'electrical pole', 'electric pole', 'exposed wire', 'fire hazard', 'accident risk', 'বিপজ্জনক', 'খোলা বৈদ্যুতিক তার', 'खतरनाक', 'खुला बिजली का तार'], evidenceRequired: false, priority: 'critical' },
  { category: 'waste', categoryLabel: 'Waste Management', keywords: ['waste management', 'garbage pile', 'waste dumped', 'garbage collection', 'garbage', 'waste', 'trash', 'dump', 'আবর্জনা', 'ময়লা', 'कचरा', 'कूड़ा'], evidenceRequired: false, priority: 'medium' },
  { category: 'water', categoryLabel: 'Water Supply', keywords: ['water leakage', 'water leak', 'pipe leakage', 'broken pipe', 'no water supply', 'water supply', 'drinking water', 'পানির লিক', 'জল সরবরাহ নেই', 'পানীয় জল', 'पानी की लीकेज', 'पानी की सप्लाई नहीं', 'पीने का पानी'], evidenceRequired: false, priority: 'medium' },
  { category: 'street-light', categoryLabel: 'Street Lighting', keywords: ['street light', 'streetlight', 'street lamp', 'light not working', 'lamp not working', 'রাস্তার আলো', 'স্ট্রিট লাইট', 'स्ट्रीट लाइट', 'सड़क की बत्ती'], evidenceRequired: false, priority: 'medium' },
  { category: 'electricity', categoryLabel: 'Electricity', keywords: ['power cut', 'power outage', 'electric supply', 'electricity problem', 'electricity', 'বিদ্যুৎ নেই', 'কারেন্ট নেই', 'बिजली नहीं', 'बिजली कटौती'], evidenceRequired: false, priority: 'high' },
  { category: 'noise-disturbance', categoryLabel: 'Noise Disturbance', keywords: ['noise disturbance', 'noise pollution', 'loud music', 'loud sound', 'disturbing noise', 'noise', 'শব্দ দূষণ', 'জোরে গান', 'ध्वनि प्रदूषण', 'तेज आवाज'], evidenceRequired: false, priority: 'medium' },
  { category: 'stray-animals', categoryLabel: 'Stray Animals', keywords: ['stray dogs', 'stray dog', 'stray animals', 'stray animal', 'animal problem', 'কুকুরের উপদ্রব', 'বেওয়ারিশ কুকুর', 'आवारा कुत्ते', 'आवारा जानवर'], evidenceRequired: false, priority: 'medium' },
]

const classifyLocally = (title: string, description: string, extra = ''): AIResult => {
  const text = `${title} ${description} ${extra}`.toLocaleLowerCase().normalize('NFKC')
  const scored = categoryRules.map((rule) => ({
    rule,
    score: rule.keywords.reduce((score, keyword) => (
      text.includes(keyword) ? score + (keyword.includes(' ') ? 3 : 1) : score
    ), 0),
  }))
  const bestMatch = scored.sort((a, b) => b.score - a.score)[0]
  if (!bestMatch || bestMatch.score === 0) return { category: 'other', categoryLabel: 'Other', evidenceRequired: false, priority: 'low' }
  const { category, categoryLabel, evidenceRequired, priority } = bestMatch.rule
  return { category, categoryLabel, evidenceRequired, priority }
}

async function classifyComplaint(title: string, description: string, extra = ''): Promise<AIResult> {
  try {
    return await classifyComplaintWithGemini({ title, description, additionalInformation: extra }) || classifyLocally(title, description, extra)
  } catch {
    return classifyLocally(title, description, extra)
  }
}

export function FileComplaintPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [result, setResult] = useState<AIResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [photo, setPhoto] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [location, setLocation] = useState<{ latitude: string; longitude: string } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [submitted, setSubmitted] = useState<{ ref: string; merged: boolean } | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!title.trim() || !description.trim()) { setResult(null); setCustomCategory(''); return }
    setAnalyzing(true)
    const timer = window.setTimeout(async () => {
      const classification = await classifyComplaint(title, description)
      if (!cancelled) { setResult(classification); setAnalyzing(false) }
    }, 500)
    let cancelled = false
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [title, description])

  useEffect(() => {
    if (!result || result.category !== 'other' || !customCategory.trim()) return
    setAnalyzing(true)
    let cancelled = false
    const timer = window.setTimeout(async () => {
      const classification = await classifyComplaint(title, description, customCategory)
      if (!cancelled) { setResult(classification); setAnalyzing(false) }
    }, 400)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [customCategory, description, result?.category, title])

  const getLocation = () => {
    if (!navigator.geolocation) { window.alert('Geolocation is not supported by this browser.'); return }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLocation({ latitude: coords.latitude.toFixed(6), longitude: coords.longitude.toFixed(6) }); setLocationLoading(false) },
      () => { window.alert('Unable to get your location. Please allow location access.'); setLocationLoading(false) },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const toDataUrl = (file: File | null) => new Promise<string | null>((resolve, reject) => {
    if (!file) return resolve(null)
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null)
    reader.onerror = () => reject(new Error(`Unable to read ${file.name}.`))
    reader.readAsDataURL(file)
  })

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!result || analyzing || submitting) return
    if (result.category === 'other' && !customCategory.trim()) { window.alert('Please provide a little more information about the issue.'); return }
    if (result.evidenceRequired && !photo && !video) { window.alert('Please upload a photo or video as evidence for this complaint.'); return }
    try {
      setSubmitting(true)
      setSubmitError(null)
      const response = await createComplaint({
        title,
        description,
        category: result.category === 'other' ? customCategory.trim() : result.category,
        priority: result.priority,
        latitude: location?.latitude,
        longitude: location?.longitude,
        photo: await toDataUrl(photo),
        video: await toDataUrl(video),
      })
      if (response) setSubmitted(response)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to file your complaint. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const evidenceLabel = result?.evidenceRequired ? 'Required' : 'Optional'
  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-8">
        <PageHeader
          title="File a Complaint"
          subtitle="Report a civic or public issue and help your community get the attention it deserves."
        />
      </div>
      {submitted && <div role="status" className="mb-6 flex items-center gap-3 rounded-2xl border border-brand-mint/30 bg-brand-mint/10 p-4 text-sm text-ink-900"><CheckCircle2 className="h-5 w-5 text-brand-mint" />{submitted.merged ? <>Your report was added to the existing complaint. Its priority has been increased. Reference: <strong>{submitted.ref}</strong>.</> : <>Complaint filed successfully. Your reference number is <strong>{submitted.ref}</strong>.</>}</div>}
      {submitError && <div role="alert" className="mb-6 rounded-2xl border border-brand-orange/30 bg-brand-orange/10 p-4 text-sm text-ink-900">{submitError}</div>}
      <form onSubmit={submit} className="space-y-6">
        <section className="rounded-[24px] border border-border-subtle bg-surface p-6 shadow-soft md:p-7">
          <SectionTitle icon={<FileText className="h-5 w-5 text-brand-orange" />} title="Complaint Details" subtitle="Tell us about the issue." />
          <div className="space-y-5">
            <Field label="Complaint Title"><input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Give your complaint a short, clear title" className={inputClass} /></Field>
            <Field label="Description"><textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Describe what happened, where it happened, and any details that may help..." className={`${inputClass} resize-none`} /></Field>
            {analyzing && <p className="text-sm text-ink-400">Analyzing your complaint…</p>}
            {result && !analyzing && result.category !== 'other' && <p className="rounded-xl bg-brand-mint/10 px-3 py-2 text-sm text-ink-700">We’ll route this as: <strong>{result.categoryLabel}</strong></p>}
            {result?.category === 'other' && <Field label="Tell us a little more about this issue"><input required value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} placeholder="For example: damaged public property, stray animals, noise disturbance..." className={inputClass} /></Field>}
          </div>
        </section>
        <section className="rounded-[24px] border border-border-subtle bg-surface p-6 shadow-soft md:p-7">
          <div className="mb-6 flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-ink-900">Supporting Evidence</h2><p className="mt-1 text-sm text-ink-400">{result?.evidenceRequired ? 'A photo or video is required for this complaint.' : 'You can upload a photo or video if it is available.'}</p></div><span className="rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange">{evidenceLabel}</span></div>
          <div className="grid gap-4 md:grid-cols-2"><UploadCard icon={<ImageIcon className="h-6 w-6 text-brand-mint" />} title="Upload Photo" detail={photo?.name ?? 'JPG, PNG or WEBP'} accept="image/png,image/jpeg,image/webp" onChange={setPhoto} /><UploadCard icon={<Video className="h-6 w-6 text-brand-orange" />} title="Upload Video" detail={video?.name ?? 'MP4, MOV or WebM'} accept="video/*" onChange={setVideo} /></div>
        </section>
        <section className="rounded-[24px] border border-border-subtle bg-surface p-6 shadow-soft md:p-7">
          <SectionTitle icon={<MapPin className="h-5 w-5 text-brand-mint" />} title="Complaint Location" subtitle="Share where the problem is located." />
          <div className="grid gap-3 md:grid-cols-2"><button type="button" onClick={getLocation} disabled={locationLoading} className="flex items-center justify-center gap-2 rounded-2xl bg-brand-mint px-5 py-3.5 text-sm font-semibold text-[#16151B] disabled:opacity-60"><Navigation className="h-4 w-4" />{locationLoading ? 'Getting your location...' : 'Use My Current Location'}</button><button type="button" onClick={() => window.alert('Map selection will be connected in the next step.')} className="flex items-center justify-center gap-2 rounded-2xl border border-border-subtle px-5 py-3.5 text-sm font-semibold text-ink-900"><Map className="h-4 w-4 text-brand-orange" />Select Location on Map</button></div>
          {location && <p className="mt-5 flex items-center gap-2 rounded-2xl bg-brand-mint/10 p-4 text-sm text-ink-700"><CheckCircle2 className="h-5 w-5 text-brand-mint" />Location captured: {location.latitude}, {location.longitude}</p>}
        </section>
        <div className="flex justify-end"><button type="submit" disabled={analyzing || submitting} className="w-full rounded-2xl bg-brand-navy px-8 py-4 text-sm font-semibold text-navy-contrast shadow-soft disabled:opacity-60 md:w-auto">{analyzing ? 'Analyzing...' : submitting ? 'Submitting...' : 'Submit Complaint'}</button></div>
      </form>
    </div>
  )
}

const inputClass = 'w-full rounded-2xl border border-border-subtle bg-surface px-4 py-3.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10'

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-ink-700"><span className="mb-2.5 block">{label}</span>{children}</label> }
function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) { return <div className="mb-7 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/10">{icon}</div><div><h2 className="text-lg font-semibold text-ink-900">{title}</h2><p className="mt-0.5 text-sm text-ink-400">{subtitle}</p></div></div> }
function UploadCard({ icon, title, detail, accept, onChange }: { icon: React.ReactNode; title: string; detail: string; accept: string; onChange: (file: File | null) => void }) { return <label className="cursor-pointer rounded-2xl border-2 border-dashed border-border-subtle p-7 text-center hover:border-brand-orange"><input type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} /><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10">{icon}</div><p className="mt-4 text-sm font-semibold text-ink-900">{title}</p><p className="mt-1 truncate text-xs text-ink-400">{detail}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-orange"><Upload className="h-4 w-4" />Choose file</span></label> }
