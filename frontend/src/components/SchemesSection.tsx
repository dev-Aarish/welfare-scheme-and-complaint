import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useReveal } from '../hooks/useReveal'
import { useAuth } from '../context/AuthContext'
import {
  fetchFamilyMembers,
  matchHouseholdSchemesApi,
  type FamilyMemberData,
  type AiMatchResponse,
} from '../services/api'
import { User, Users, GraduationCap, Sprout, Heart, Sparkles, Send, HelpCircle, X } from 'lucide-react'
import type { LocalProfile } from '../context/AuthContext'

interface SchemesSectionProps {
  onOpenCatalog?: () => void
  onSelectScheme?: (schemeId: string) => void
  onMatchesChange?: (count: number) => void
}

function setDeepProperty(obj: any, path: string, value: any) {
  const root = { ...obj }
  const parts = path.split('.')
  let curr = root
  for (let i = 0; i < parts.length - 1; i++) {
    if (!curr[parts[i]]) curr[parts[i]] = {}
    curr[parts[i]] = { ...curr[parts[i]] }
    curr = curr[parts[i]]
  }
  curr[parts[parts.length - 1]] = value
  return root
}

const hasValue = (v: unknown): boolean =>
  v !== null && v !== undefined && v !== '' && !(typeof v === 'number' && v <= 0)

function upper(v?: string | null): string {
  return (v ?? '').trim().toUpperCase()
}

/** Builds the structured profile context for the backend matcher from the
 *  citizen's saved household profile (blank fields stay unknown/missing).
 *  A filled 0 for income/land is real data — a zero-income household. */
function buildProfileContext(profile: LocalProfile | null): any | null {
  if (!profile) return null
  const stateRaw = profile.state
  const person: any = {
    age: hasValue(profile.age) ? profile.age : -1,
    gender: hasValue(profile.gender) ? upper(profile.gender) : 'UNKNOWN',
    occupation: hasValue(profile.occupation) ? upper(profile.occupation) : 'UNKNOWN',
    isStudent: profile.occupation === 'Student',
  }
  const household: any = {
    annualIncome: profile.annualIncome != null ? profile.annualIncome : -1,
    landAcres: profile.landAcres != null ? profile.landAcres : 0,
  }
  const location: any = {
    state: hasValue(stateRaw)
      ? stateRaw!.trim().toUpperCase().split(/\s+/).join('_')
      : 'UNKNOWN',
  }
  const filled =
    hasValue(profile.age) ||
    hasValue(profile.gender) ||
    hasValue(profile.occupation) ||
    profile.annualIncome != null ||
    hasValue(profile.state)
  if (!filled) return null
  return { person, household, location }
}

export function SchemesSection({ onOpenCatalog, onSelectScheme, onMatchesChange }: SchemesSectionProps) {
  const [_query, _setQuery] = useState('')
  const [naturalPrompt, setNaturalPrompt] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all')
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberData[]>([])
  const [aiMatchData, setAiMatchData] = useState<AiMatchResponse | null>(null)
  const [loadingAi, setLoadingAi] = useState<boolean>(false)
  const [activeFollowupScheme, setActiveFollowupScheme] = useState<any | null>(null)
  const [_followupAnswers, setFollowupAnswers] = useState<Record<string, any>>({})
  const [numberInputValue, setNumberInputValue] = useState<string>('')
  const [showAllMatches, setShowAllMatches] = useState<boolean>(false)

  const scope = useReveal<HTMLElement>()
  const { guest: demo, profile: selfProfile } = useAuth()

  // Load family members & fetch initial AI matches
  useEffect(() => {
    async function loadData() {
      const members = await fetchFamilyMembers()
      if (members && members.length > 0) {
        setFamilyMembers(members)
      } else if (demo) {
        setFamilyMembers([
          {
            id: 'father-1',
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
            id: 'mother-1',
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
          {
            id: 'son-1',
            fullName: 'Sourav Mukherjee',
            relation: 'Son',
            dob: '2005-03-12',
            age: 21,
            gender: 'Male',
            occupation: 'Student',
            annualIncome: 0,
            isStudent: true,
            isDisability: false,
            landAcres: 0,
          },
        ])
      } else {
        setFamilyMembers([])
      }

      // Initial AI Match fetch for the signed-in household.
      // Demo mode seeds Asha's (demo) profile; real users match from the
      // household profile they saved on the "My profile" page.
      if (demo) {
        fetchAiMatches({
          person: { age: 32, gender: 'FEMALE', occupation: 'FARMER', isStudent: false },
          household: { annualIncome: 120000, landAcres: 1.5 },
          location: { state: 'WEST_BENGAL' },
        })
      } else {
        const context = buildProfileContext(selfProfile)
        if (context) {
          setSelectedMemberId('self')
          fetchAiMatches(context)
        }
      }
    }
    loadData()

    const handleFamilyUpdated = () => {
      loadData()
    }
    window.addEventListener('familyMembersUpdated', handleFamilyUpdated)
    return () => {
      window.removeEventListener('familyMembersUpdated', handleFamilyUpdated)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo, selfProfile])

  const fetchAiMatches = async (profileContext?: any, rawPromptText?: string) => {
    setLoadingAi(true)
    const res = await matchHouseholdSchemesApi({
      rawPrompt: rawPromptText,
      structuredProfile: profileContext,
    })
    if (res) {
      setAiMatchData(res)
    }
    setLoadingAi(false)
  }

  // Combine Self + Family Members
  const memberChoices = useMemo(() => {
    const choices: {
      id: string
      label: string
      icon: typeof User
      subtitle: string
      data?: FamilyMemberData
    }[] = []

// Real (non-demo) users match from the household profile they saved on
    // the "My profile" page — show it as the "Self" chip only when filled.
    if (demo) {
      const demoSelfProfile: FamilyMemberData = {
        id: 'self',
        fullName: 'Asha Verma (Self)',
        relation: 'Self',
        dob: '1994-04-10',
        age: 32,
        gender: 'Female',
        occupation: 'Farmer',
        annualIncome: 120000,
        isStudent: false,
        isDisability: false,
        landAcres: 0,
      }
      choices.push(
        { id: 'all', label: 'All Household', icon: Users, subtitle: 'Combined family profile matching' },
        { id: 'self', label: 'Asha Verma (Self)', icon: User, subtitle: '32 yrs · Female · Farmer · Income < ₹2L/yr', data: demoSelfProfile },
      )
} else if (buildProfileContext(selfProfile)) {
      const name = selfProfile?.fullName?.trim() || 'Your profile'
      const self: FamilyMemberData = {
        id: 'self',
        fullName: `${name} (Self)`,
        relation: 'Self',
        age: selfProfile?.age || 0,
        gender: selfProfile?.gender || 'Other',
        occupation: selfProfile?.occupation || 'Unemployed',
        annualIncome: selfProfile?.annualIncome || 0,
        isStudent: selfProfile?.occupation === 'Student',
        isDisability: false,
        landAcres: selfProfile?.landAcres || 0,
      }
      const bits = [
        selfProfile?.age ? `${selfProfile.age} yrs` : '',
        selfProfile?.gender || '',
        selfProfile?.occupation || '',
        selfProfile?.annualIncome != null
          ? `Income ₹${(selfProfile.annualIncome / 100000).toFixed(1)}L/yr`
          : '',
      ].filter(Boolean)
      choices.push({
        id: 'self',
        label: `${name} (Self)`,
        icon: User,
        subtitle: bits.join(' · ') || 'Your saved profile',
        data: self,
      })
    }

    choices.push(
      ...familyMembers.map((m) => {
        let Icon: typeof User = User
        if (m.isStudent || m.occupation === 'Student') Icon = GraduationCap
        else if (m.occupation === 'Farmer') Icon = Sprout
        else if (m.relation === 'Mother' || m.relation === 'Wife' || m.relation === 'Spouse') Icon = Heart

        return {
          id: m.id || m.fullName,
          label: `${m.fullName} (${m.relation})`,
          icon: Icon,
          subtitle: `${m.age} yrs · ${m.gender} · ${m.occupation}`,
          data: m,
        }
      }),
    )
    return choices
  }, [demo, familyMembers, selfProfile])

  const activeMember = useMemo(() => {
    return memberChoices.find((m) => m.id === selectedMemberId)
  }, [selectedMemberId, memberChoices])

  // Handle Tab Switch
  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId)
    setNaturalPrompt('')

    const choice = memberChoices.find((m) => m.id === memberId)
    if (choice && choice.data) {
      const m = choice.data
      fetchAiMatches({
        person: {
          age: m.age,
          gender: m.gender.toUpperCase(),
          occupation: m.occupation.toUpperCase(),
          isStudent: Boolean(m.isStudent || m.occupation === 'Student'),
          isDisability: Boolean(m.isDisability),
        },
        household: {
          annualIncome: m.annualIncome || 120000,
          landAcres: m.landAcres || 0,
        },
        location: {
          state: (m.state || 'West Bengal').toUpperCase().replace(/ /g, '_'),
        },
      })
    } else if (familyMembers.length > 0) {
      fetchAiMatches({
        members: familyMembers.map((m) => ({
          fullName: m.fullName,
          relation: m.relation,
          age: m.age,
          gender: m.gender,
          occupation: m.occupation,
          isStudent: Boolean(m.isStudent || m.occupation === 'Student'),
          isDisability: Boolean(m.isDisability),
          annualIncome: m.annualIncome,
          landAcres: m.landAcres,
          state: m.state || 'West Bengal',
        })),
        household: { annualIncome: 120000, landAcres: 1.5 },
        location: { state: 'WEST_BENGAL' },
      })
    } else {
      fetchAiMatches({
        person: { age: 32, gender: 'FEMALE', occupation: 'FARMER' },
        household: { annualIncome: 120000 },
        location: { state: 'WEST_BENGAL' },
      })
    }
  }

  // Handle Natural Language Prompt Submit
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!naturalPrompt.trim()) return
    setSelectedMemberId('nl-prompt')
    fetchAiMatches(undefined, naturalPrompt.trim())
  }

  // Handle Follow-up Question Drawer Open
  const handleFollowupSubmit = (scheme: any) => {
    setActiveFollowupScheme(scheme)
    setNumberInputValue('')
  }

  // Answer a missing rule question
  const handleAnswerQuestion = (field: string, answer: any) => {
    setFollowupAnswers((prev) => ({ ...prev, [field]: answer }))

    if (aiMatchData && aiMatchData.profile) {
      const updatedProfile = setDeepProperty(aiMatchData.profile, field, answer)
      fetchAiMatches(updatedProfile)
    }

    setActiveFollowupScheme(null)
  }

  // Filter schemes list
  const allMatches = aiMatchData?.matches || []
  const matches = showAllMatches ? allMatches : allMatches.slice(0, 11)

  // Report the real matched-scheme count so the hero stat is accurate.
  useEffect(() => {
    onMatchesChange?.(allMatches.length)
  }, [allMatches.length, onMatchesChange])

  return (
    <section ref={scope} className="mt-10 lg:mt-12 max-md:mt-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-[22px] font-semibold text-ink-900 max-md:text-base">
            Schemes matched for your household
          </h2>
          <p className="mt-1 text-sm text-ink-400 max-md:mt-0.5 max-md:text-[13px]">
            AI-powered natural language parser &amp; deterministic rule AST evaluation engine.
          </p>
        </div>
        <span className="shrink-0 self-start rounded-full bg-brand-orange/15 px-3.5 py-1.5 text-xs font-bold text-brand-orange shadow-soft md:self-auto">
          ⚡ {allMatches.length <= 11 || showAllMatches ? `${allMatches.length} verified matches` : `Showing 11 of ${allMatches.length} verified matches`}
        </span>
      </div>

      {/* AI Natural Language Input Bar */}
      <form onSubmit={handlePromptSubmit} className="mt-5">
        <div className="relative flex items-center rounded-2xl border border-border-subtle bg-surface p-1.5 shadow-soft focus-within:ring-2 focus-within:ring-brand-orange">
          <Sparkles className="ml-3.5 h-5 w-5 shrink-0 text-brand-orange" />
          <input
            type="text"
            value={naturalPrompt}
            onChange={(e) => setNaturalPrompt(e.target.value)}
            placeholder="Tell AI about yourself in plain English, Hindi, or Bengali (e.g. 'I am a 32yo female farmer in Nadia with 1.5 acres land')..."
            className="w-full min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loadingAi || !naturalPrompt.trim()}
            className="flex items-center gap-2 rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-navy-contrast transition-all hover:bg-[#2d2839] disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            Ask AI Matcher
          </button>
        </div>
      </form>

      {/* Household Member Filter Pills / Tabs */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {memberChoices.map((m) => {
          const Icon = m.icon
          const isActive = selectedMemberId === m.id
          return (
            <button
              key={m.id}
              onClick={() => handleSelectMember(m.id)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'border-brand-orange bg-brand-orange/15 text-brand-orange shadow-soft'
                  : 'border-border-subtle bg-surface text-ink-700 hover:bg-canvas'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{m.label}</span>
            </button>
          )
        })}
      </div>

      {/* Selected Member Active Subtitle */}
      {activeMember && selectedMemberId !== 'all' && (
        <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-canvas/60 px-4 py-2 text-xs text-ink-700">
          <Sparkles className="h-3.5 w-3.5 text-brand-orange shrink-0" />
          <span>
            Evaluating rules for <strong className="text-ink-900">{activeMember.label}</strong> ({activeMember.subtitle})
          </span>
        </div>
      )}

      {/* Loading Indicator */}
      {loadingAi && (
        <div className="py-12 text-center text-sm font-semibold text-ink-400">
          <Sparkles className="mx-auto mb-2 h-6 w-6 animate-spin text-brand-orange" />
          Executing 6-Stage Backend Rule Evaluation Engine...
        </div>
      )}

      {/* Cards Grid */}
      {!loadingAi && (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5 max-md:mt-4">
          {matches.map((item) => {
            const isMoreInfo = item.status === 'MORE_INFO_REQUIRED'
            const isPotential = item.status === 'POTENTIALLY_ELIGIBLE'

            let statusBadgeClass = 'bg-brand-mint/20 text-[#3d7d6b] dark:text-[#7fd1bb]'
            let statusText = 'ELIGIBLE'
            if (isMoreInfo) {
              statusBadgeClass = 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
              statusText = 'MORE INFO REQUIRED'
            } else if (isPotential) {
              statusBadgeClass = 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
              statusText = 'POTENTIALLY ELIGIBLE'
            }

            return (
              <div
                key={item.schemeId}
                className="flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface p-5 shadow-soft transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusBadgeClass}`}>
                      {statusText}
                    </span>
                    <span className="rounded-full bg-brand-orange/15 px-2.5 py-0.5 text-[10px] font-bold text-brand-orange">
                      {item.relevanceScore}% Profile Match
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-base font-bold text-ink-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-ink-400 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-brand-orange">
                    {item.benefit}
                  </p>

                  {/* Matched Family Members Badges */}
                  {(item as any).matchedMembers && (item as any).matchedMembers.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {(item as any).matchedMembers.map((m: any, idx: number) => (
                        <span key={idx} className="inline-flex items-center gap-1 rounded-md bg-brand-navy/10 px-2 py-0.5 text-[10px] font-bold text-ink-900 dark:bg-white/10 dark:text-white">
                          <User className="h-3 w-3 text-brand-orange" />
                          {m.name} ({m.relation})
                        </span>
                      ))}
                    </div>
                  )}

                  {/* AI Explanation Bullets */}
                  <div className="mt-3 rounded-xl bg-canvas/60 p-3 text-[11px] space-y-1">
                    <p className="font-semibold text-ink-900 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-brand-orange" />
                      AI Match Factors:
                    </p>
                    <p className="text-ink-700 leading-relaxed">{item.explanation}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle/80 flex items-center justify-between gap-2">
                  {isMoreInfo ? (
                    <button
                      onClick={() => handleFollowupSubmit(item)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-700 shadow-soft"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Answer Follow-up Question
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectScheme?.(item.schemeId)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-bold text-navy-contrast transition-all hover:bg-[#2d2839]"
                    >
                      View Details &amp; Apply
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {matches.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-ink-400/40 bg-surface/60 px-6 py-8 text-center text-sm text-ink-400">
              <p className="text-sm">No constituent scheme matches for this profile yet.</p>
              <button
                onClick={onOpenCatalog}
                className="mt-2 text-xs font-semibold text-brand-orange hover:underline"
              >
                Browse 160+ schemes in full catalog →
              </button>
            </div>
          )}

          <div data-reveal>
            <AddNewCard onOpenCatalog={onOpenCatalog} />
          </div>
        </div>
      )}

      {/* Expand / Collapse All Matches Button */}
      {!loadingAi && allMatches.length > 11 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAllMatches(!showAllMatches)}
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface px-6 py-3 text-xs font-bold text-ink-900 shadow-soft transition-all hover:bg-canvas hover:shadow-lift"
          >
            <Sparkles className="h-4 w-4 text-brand-orange" />
            {showAllMatches
              ? 'Show Less (Top 11 Matches)'
              : `View All ${allMatches.length} Verified Matches (${allMatches.length - 11} More)`}
          </button>
        </div>
      )}

      {/* Interactive Follow-up Question Modal Drawer rendered via React Portal */}
      {activeFollowupScheme &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 backdrop-blur-md">
            <div className="w-full max-w-[520px] overflow-hidden rounded-[28px] border border-border-subtle bg-surface shadow-2xl transition-all">
              <div className="flex items-center justify-between border-b border-border-subtle/80 bg-canvas/40 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-base font-bold text-ink-900">
                      Verification Question
                    </h4>
                    <p className="text-xs text-ink-400">
                      Required for {activeFollowupScheme.title}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveFollowupScheme(null)}
                  className="rounded-full p-1.5 text-ink-400 hover:bg-canvas hover:text-ink-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {activeFollowupScheme.followUpQuestions.map((q: any) => (
                  <div key={q.field} className="space-y-3">
                    <p className="text-sm font-bold text-ink-900 leading-snug">{q.question}</p>

                    {q.type === 'BOOLEAN' && (
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => handleAnswerQuestion(q.field, true)}
                          className="flex-1 rounded-xl border border-border-subtle bg-canvas py-3.5 text-xs font-bold text-ink-900 transition-colors hover:bg-brand-mint/20 hover:text-[#3d7d6b]"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleAnswerQuestion(q.field, false)}
                          className="flex-1 rounded-xl border border-border-subtle bg-canvas py-3.5 text-xs font-bold text-ink-900 transition-colors hover:bg-brand-orange/20 hover:text-brand-orange"
                        >
                          No
                        </button>
                      </div>
                    )}

                    {q.type === 'NUMBER' && (
                      <div className="space-y-3 pt-1">
                        <input
                          type="number"
                          value={numberInputValue}
                          onChange={(e) => setNumberInputValue(e.target.value)}
                          placeholder="Enter amount/number..."
                          className="w-full rounded-xl border border-border-subtle bg-canvas px-4 py-3 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                        />
                        <button
                          onClick={() => {
                            if (numberInputValue !== '') {
                              handleAnswerQuestion(q.field, Number(numberInputValue))
                            }
                          }}
                          className="w-full rounded-xl bg-brand-navy py-3 text-xs font-bold uppercase tracking-wider text-navy-contrast transition-colors hover:bg-[#2d2839]"
                        >
                          Submit Answer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  )
}

function AddNewCard({ onOpenCatalog }: { onOpenCatalog?: () => void }) {
  return (
    <>
      <button
        onClick={onOpenCatalog}
        className="group flex h-full w-full min-h-44 flex-col rounded-2xl border border-border-subtle bg-surface p-6 text-left transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-brand-orange max-md:hidden"
      >
        <div className="flex items-start justify-between">
          <p className="text-[15px] font-semibold text-ink-900">
            Search all schemes
          </p>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-subtle text-ink-700 transition-transform duration-150 group-hover:translate-x-1">
            →
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-400">
          Browse the full dynamic catalog of 160+ government schemes.
        </p>
        <p className="mt-auto pt-4 text-xs font-medium text-brand-orange">
          Open catalog →
        </p>
      </button>

      {/* Mobile: the same action as a compact row in the divided list. */}
      <button
        onClick={onOpenCatalog}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors duration-150 active:bg-canvas/70 focus-visible:outline-2 focus-visible:outline-brand-orange md:hidden"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink-900">
            Search all schemes
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-ink-400">
            Browse the full dynamic catalog of 160+ government schemes.
          </span>
        </span>
        <span className="text-xs font-semibold text-brand-orange">Catalog →</span>
      </button>
    </>
  )
}
