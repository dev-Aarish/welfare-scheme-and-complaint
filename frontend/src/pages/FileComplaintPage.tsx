import React, { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, FileText, ImageIcon, MapPin, Navigation, ShieldCheck, Upload, Video, Map, Copy, Check, ArrowRight, Sparkles, KeyRound } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { createComplaint } from '../services/api'
import { classifyComplaint, type ClassificationResult } from '../services/complaintClassifier'

interface FileComplaintPageProps {
  anonymous?: boolean
  onNavigate?: (path: string) => void
}

export function saveComplaintToLocalStorage(item: { ref: string; trackingPin?: string; title: string; category?: string; date: string }) {
  try {
    const existing = JSON.parse(localStorage.getItem('sevanest-saved-grievances') || '[]');
    const filtered = existing.filter((c: any) => c.ref !== item.ref);
    filtered.unshift(item);
    localStorage.setItem('sevanest-saved-grievances', JSON.stringify(filtered.slice(0, 15)));
  } catch (err) {
    console.error('Failed to save grievance reference', err);
  }
}

export function FileComplaintPage({ anonymous = false, onNavigate }: FileComplaintPageProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [location, setLocation] = useState<{ latitude: string; longitude: string } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ClassificationResult | null>(null)
  const [submitted, setSubmitted] = useState<{ ref: string; trackingPin?: string; merged?: boolean } | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [copiedRef, setCopiedRef] = useState(false)
  const [copiedPin, setCopiedPin] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!title.trim() && !description.trim()) { setResult(null); setAnalyzing(false); return }
    setAnalyzing(true)
    const timer = window.setTimeout(async () => {
      try {
        const classified = await classifyComplaint({ title, description, customCategory })
        if (!cancelled) setResult(classified)
      } catch (error) {
        console.error('Failed to classify complaint:', error)
      } finally {
        if (!cancelled) setAnalyzing(false)
      }
    }, 400)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [customCategory, description, title])

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

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCustomCategory('')
    setPhoto(null)
    setVideo(null)
    setLocation(null)
    setResult(null)
    setSubmitted(null)
    setSubmitError(null)
  }

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
      }, anonymous)

      if (response) {
        setSubmitted(response)
        saveComplaintToLocalStorage({
          ref: response.ref,
          trackingPin: response.trackingPin,
          title,
          category: result?.categoryLabel || result?.category,
          date: new Date().toISOString(),
        })
        // Reset input fields completely!
        setTitle('')
        setDescription('')
        setCustomCategory('')
        setPhoto(null)
        setVideo(null)
        setLocation(null)
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to file your complaint. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const copyRef = () => {
    if (!submitted) return
    navigator.clipboard.writeText(submitted.ref)
    setCopiedRef(true)
    setTimeout(() => setCopiedRef(false), 2000)
  }

  const copyPin = () => {
    if (!submitted?.trackingPin) return
    navigator.clipboard.writeText(submitted.trackingPin)
    setCopiedPin(true)
    setTimeout(() => setCopiedPin(false), 2000)
  }

  const evidenceLabel = result?.evidenceRequired ? 'Required' : 'Optional'

  return (
    <div className={`mx-auto w-full ${anonymous ? 'max-w-[1400px]' : 'max-w-[1100px]'}`}>
      <div className="mb-8">
        <PageHeader
          title={anonymous ? 'File an Anonymous Complaint' : 'File a Complaint'}
          subtitle={anonymous
            ? 'Report a civic or public issue without an account — no name, email, or phone needed.'
            : 'Report a civic or public issue and help your community get the attention it deserves.'}
        />
      </div>

      {anonymous && (
        <div role="note" className="mb-6 flex items-start gap-3 rounded-2xl border border-brand-mint/30 bg-brand-mint/10 p-4 text-sm text-ink-900">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-mint" />
          <div>
            <p className="font-semibold">Your identity is protected</p>
            <p className="mt-0.5 leading-relaxed text-ink-700">We never ask for or store your name, email, or phone number. Your report is filed anonymously and you'll receive a Reference ID and Secret PIN to track progress.</p>
          </div>
        </div>
      )}

      {/* Success Modal / Banner */}
      {submitted && (
        <div className="mb-8 rounded-3xl border border-emerald-500/30 bg-surface p-6 shadow-soft md:p-8 animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white font-bold">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                Grievance Filed Successfully
              </span>
              <h3 className="mt-2 font-display text-xl font-bold text-ink-900">
                {submitted.merged ? 'Report Merged with Existing Issue' : 'Your Complaint Has Been Logged!'}
              </h3>
              <p className="mt-1 text-xs text-ink-400">
                Keep your Reference ID and 6-digit Secret PIN safe to track live step-by-step progress.
              </p>

              {/* Reference & PIN Box */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-lg">
                <div className="rounded-2xl border border-border-subtle bg-canvas/60 p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider">Reference ID</p>
                    <p className="font-mono text-base font-bold text-brand-orange">{submitted.ref}</p>
                  </div>
                  <button onClick={copyRef} className="p-2 text-ink-400 hover:text-ink-900 rounded-lg hover:bg-canvas">
                    {copiedRef ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                {submitted.trackingPin && (
                  <div className="rounded-2xl border border-border-subtle bg-canvas/60 p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider">Secret Tracking PIN</p>
                      <p className="font-mono text-base font-bold text-brand-mint">{submitted.trackingPin}</p>
                    </div>
                    <button onClick={copyPin} className="p-2 text-ink-400 hover:text-ink-900 rounded-lg hover:bg-canvas">
                      {copiedPin ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    const trackUrl = `/complaints/track?ref=${encodeURIComponent(submitted.ref)}&pin=${encodeURIComponent(submitted.trackingPin || '')}`
                    if (onNavigate) onNavigate(trackUrl)
                    else window.location.href = trackUrl
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-coral px-5 py-2.5 text-xs font-bold text-white shadow-soft hover:scale-[1.02] transition-transform"
                >
                  <span>Track Progress (Step-by-Step)</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border-subtle bg-canvas/60 px-5 py-2.5 text-xs font-bold text-ink-700 hover:bg-canvas transition-colors"
                >
                  <span>File Another Grievance</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div className="grid gap-3 md:grid-cols-2"><button type="button" onClick={getLocation} disabled={locationLoading} className="flex items-center justify-center gap-2 rounded-2xl bg-brand-mint px-5 py-3.5 text-sm font-semibold text-[#16151B] disabled:opacity-60"><Navigation className="h-4 w-4" />{locationLoading ? 'Getting your location...' : 'Use My Current Location'}</button><button type="button" onClick={() => window.alert('Map selection captured automatically via GPS.')} className="flex items-center justify-center gap-2 rounded-2xl border border-border-subtle px-5 py-3.5 text-sm font-semibold text-ink-900"><Map className="h-4 w-4 text-brand-orange" />Select Location on Map</button></div>
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
