import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from 'react'
import { ChevronLeft, ChevronRight, Search, RotateCcw, ChevronDown, Plus, Minus } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import {
  Flip,
  gsap,
  pressChip,
  prefersReducedMotion,
  useGSAP,
} from '../lib/animations'
import {
  catalogCategories,
  catalogSchemes,
  officerSchemeStats,
  type CatalogScheme,
} from '../data'
import type { Role } from './auth/copy'
import { fetchCategories, fetchSchemes, type BackendScheme } from '../services/api'

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

// Single-source-of-truth Checkbox Matchers
const checkMinority = (s: BackendScheme) => {
  const text = `${s.eligibility} ${s.description} ${s.title}`.toLowerCase()
  return text.includes('minority') || text.includes('sc') || text.includes('st') || text.includes('tribal') || text.includes('obc')
}

const checkDifferentlyAbled = (s: BackendScheme) => {
  const text = `${s.title} ${s.eligibility} ${s.description} ${s.tag || ''}`.toLowerCase()
  return text.includes('disabled') || text.includes('disability') || text.includes('divyangjan') || text.includes('pwd') || text.includes('adip')
}

const checkDbt = (s: BackendScheme) => {
  const text = `${s.benefit} ${s.description} ${s.tag || ''}`.toLowerCase()
  return text.includes('dbt') || text.includes('cash') || text.includes('transfer') || text.includes('subsidy') || text.includes('financial assistance') || text.includes('₹')
}

const checkBpl = (s: BackendScheme) => {
  const text = `${s.eligibility} ${s.description} ${s.benefit} ${s.title}`.toLowerCase()
  return text.includes('bpl') || text.includes('poverty') || text.includes('low income') || text.includes('under ₹') || text.includes('under rs') || text.includes('income under') || text.includes('economically weaker') || text.includes('ebc') || text.includes('marginal') || text.includes('small farmer') || text.includes('destitute')
}

const checkEconomicDistress = (s: BackendScheme) => {
  const text = `${s.eligibility} ${s.description} ${s.title}`.toLowerCase()
  return text.includes('unemployed') || text.includes('distress') || text.includes('informal') || text.includes('daily wage') || text.includes('street vendor') || text.includes('mgnrega')
}

const checkGovtEmp = (s: BackendScheme) => {
  const text = `${s.eligibility} ${s.description}`.toLowerCase()
  return text.includes('govt employee') || text.includes('government employee')
}

const checkStudent = (s: BackendScheme) => {
  const text = `${s.title} ${s.category} ${s.eligibility} ${s.tag || ''}`.toLowerCase()
  return text.includes('student') || text.includes('scholarship') || text.includes('education') || text.includes('school') || text.includes('college')
}

interface CatalogPageProps {
  role: Role
  onSelectScheme?: (schemeId: string) => void
}

export function CatalogPage({ role, onSelectScheme }: CatalogPageProps) {
  const isOfficer = role === 'officer'
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('All')

  // Filter Panel filter states
  const [stateUt, setStateUt] = useState<string>('all')
  const [genderFilter, setGenderFilter] = useState<string>('all')
  const [ageGroup, setAgeGroup] = useState<string>('all')
  const [casteFilter, setCasteFilter] = useState<string>('all')
  const [residenceFilter, setResidenceFilter] = useState<string>('all')
  const [benefitTypeFilter, setBenefitTypeFilter] = useState<string>('all')
  const [maritalStatus, setMaritalStatus] = useState<string>('all')
  const [disabilityPct, setDisabilityPct] = useState<string>('all')
  const [empStatus, setEmpStatus] = useState<string>('all')
  const [occupationFilter, setOccupationFilter] = useState<string>('all')

  // Checkbox filters
  const [cbMinority, setCbMinority] = useState<boolean>(false)
  const [cbDifferentlyAbled, setCbDifferentlyAbled] = useState<boolean>(false)
  const [cbDbtScheme, setCbDbtScheme] = useState<boolean>(false)
  const [cbBpl, setCbBpl] = useState<boolean>(false)
  const [cbEconomicDistress, setCbEconomicDistress] = useState<boolean>(false)
  const [cbGovtEmployee, setCbGovtEmployee] = useState<boolean>(false)
  const [cbStudent, setCbStudent] = useState<boolean>(false)

  // Accordion Expand/Collapse States
  const [openGender, setOpenGender] = useState<boolean>(false)
  const [openCaste, setOpenCaste] = useState<boolean>(false)
  const [openResidence, setOpenResidence] = useState<boolean>(false)
  const [openBenefitType, setOpenBenefitType] = useState<boolean>(false)
  const [openMarital, setOpenMarital] = useState<boolean>(false)
  const [openEmpStatus, setOpenEmpStatus] = useState<boolean>(false)

  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(160)

  const [categoriesList, setCategoriesList] = useState<string[]>(['All', ...catalogCategories])
  const [allFetchedSchemes, setAllFetchedSchemes] = useState<BackendScheme[]>([])
  const [schemes, setSchemes] = useState<CatalogScheme[]>(catalogSchemes)
  const [loading, setLoading] = useState(false)

  const scope = useRef<HTMLDivElement>(null)
  const flipState = useRef<Flip.FlipState | null>(null)

  // 1. Fetch Dynamic Categories from Backend
  useEffect(() => {
    async function loadCategories() {
      const dynamicCats = await fetchCategories()
      if (dynamicCats && dynamicCats.length > 0) {
        setCategoriesList(['All', ...dynamicCats])
      }
    }
    loadCategories()
  }, [])

  // 2. Fetch Schemes Candidates from Backend
  useEffect(() => {
    let isSubscribed = true
    async function loadSchemes() {
      setLoading(true)
      const selectedCategory = category === 'All' ? undefined : category
      const res = await fetchSchemes({
        category: selectedCategory,
        search: query.trim() ? query.trim() : undefined,
        page: 1,
        limit: 200,
      })

      if (isSubscribed) {
        if (res.schemes && res.schemes.length > 0) {
          setAllFetchedSchemes(res.schemes)
        } else {
          setAllFetchedSchemes([])
        }
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      loadSchemes()
    }, 200)

    return () => {
      isSubscribed = false
      clearTimeout(timer)
    }
  }, [category, query])

  // 3. Multi-field Filtering based on the Filter Panel selections
  useEffect(() => {
    let filtered = [...allFetchedSchemes]

    // State / UT
    if (stateUt !== 'all') {
      filtered = filtered.filter((s) => {
        const text = `${s.title} ${s.description} ${s.eligibility}`.toLowerCase()
        if (stateUt === 'wb') return text.includes('west bengal') || text.includes('wb') || text.includes('duare') || text.includes('kanyashree')
        if (stateUt === 'odisha') return text.includes('odisha') || text.includes('kalia')
        if (stateUt === 'karnataka') return text.includes('karnataka') || text.includes('gruha')
        if (stateUt === 'central') return s.source === 'dataGov' || text.includes('pm') || text.includes('pradhan')
        return true
      })
    }

    // Gender
    if (genderFilter !== 'all') {
      filtered = filtered.filter((s) => {
        const text = `${s.title} ${s.eligibility} ${s.category}`.toLowerCase()
        if (genderFilter === 'female') return text.includes('women') || text.includes('female') || text.includes('girl') || text.includes('mother') || text.includes('widow')
        if (genderFilter === 'male') return text.includes('male') || text.includes('man') || text.includes('boy') || text.includes('farmer')
        return true
      })
    }

    // Age Group
    if (ageGroup !== 'all') {
      filtered = filtered.filter((s) => {
        const text = `${s.title} ${s.eligibility} ${s.description}`.toLowerCase()
        if (ageGroup === 'children') return text.includes('child') || text.includes('school')
        if (ageGroup === 'youth') return text.includes('student') || text.includes('youth') || text.includes('18') || text.includes('college')
        if (ageGroup === 'senior') return text.includes('senior') || text.includes('pension') || text.includes('old age') || text.includes('60')
        return true
      })
    }

    // Caste
    if (casteFilter !== 'all') {
      filtered = filtered.filter((s) => {
        const text = `${s.eligibility} ${s.description}`.toLowerCase()
        return text.includes(casteFilter.toLowerCase()) || text.includes('all categories')
      })
    }

    // Residence
    if (residenceFilter !== 'all') {
      filtered = filtered.filter((s) => {
        const text = `${s.title} ${s.eligibility} ${s.description}`.toLowerCase()
        return text.includes(residenceFilter.toLowerCase()) || text.includes('gramin') || text.includes('urban')
      })
    }

    // Benefit Type
    if (benefitTypeFilter !== 'all') {
      filtered = filtered.filter((s) => {
        const text = `${s.benefit} ${s.description}`.toLowerCase()
        if (benefitTypeFilter === 'dbt') return text.includes('dbt') || text.includes('cash') || text.includes('transfer') || text.includes('financial assistance')
        if (benefitTypeFilter === 'loan') return text.includes('loan') || text.includes('credit') || text.includes('interest')
        if (benefitTypeFilter === 'subsidy') return text.includes('subsidy') || text.includes('grant')
        if (benefitTypeFilter === 'skill') return text.includes('training') || text.includes('skill') || text.includes('course')
        return true
      })
    }

    // Marital Status
    if (maritalStatus !== 'all') {
      filtered = filtered.filter((s) => {
        const text = `${s.eligibility} ${s.title}`.toLowerCase()
        if (maritalStatus === 'widow') return text.includes('widow') || text.includes('destitute')
        if (maritalStatus === 'married') return text.includes('married') || text.includes('couple')
        return true
      })
    }

    // Disability
    if (disabilityPct !== 'all') {
      filtered = filtered.filter((s) => {
        const text = `${s.title} ${s.eligibility} ${s.description}`.toLowerCase()
        return text.includes('disabled') || text.includes('disability') || text.includes('divyangjan') || text.includes('pwd') || text.includes('adip')
      })
    }

    // Occupation
    if (occupationFilter !== 'all') {
      filtered = filtered.filter((s) => {
        const text = `${s.title} ${s.category} ${s.eligibility} ${s.description}`.toLowerCase()
        if (occupationFilter === 'farmer') return text.includes('farmer') || text.includes('agri') || text.includes('kisan')
        if (occupationFilter === 'student') return text.includes('student') || text.includes('scholarship')
        if (occupationFilter === 'artisan') return text.includes('artisan') || text.includes('vishwakarma') || text.includes('small business')
        if (occupationFilter === 'dailywage') return text.includes('mgnrega') || text.includes('wage') || text.includes('worker')
        return true
      })
    }

    // Synchronized Checkbox Filters
    if (cbMinority) filtered = filtered.filter(checkMinority)
    if (cbDifferentlyAbled) filtered = filtered.filter(checkDifferentlyAbled)
    if (cbDbtScheme) filtered = filtered.filter(checkDbt)
    if (cbBpl) filtered = filtered.filter(checkBpl)
    if (cbEconomicDistress) filtered = filtered.filter(checkEconomicDistress)
    if (cbGovtEmployee) filtered = filtered.filter(checkGovtEmp)
    if (cbStudent) filtered = filtered.filter(checkStudent)

    const count = filtered.length
    const pages = Math.ceil(count / 20) || 1
    const currentPage = Math.min(page, pages)

    const startIdx = (currentPage - 1) * 20
    const pagedItems = filtered.slice(startIdx, startIdx + 20)

    const mapped: CatalogScheme[] = pagedItems.map((b) => ({
      id: b.id,
      title: b.title,
      category: b.category as any,
      tag: b.tag || b.category,
      description: b.description,
      benefit: b.benefit,
      eligibility: b.eligibility,
      matched: true,
    }))

    setSchemes(mapped)
    setTotalCount(count)
    setTotalPages(pages)
  }, [
    allFetchedSchemes,
    stateUt,
    genderFilter,
    ageGroup,
    casteFilter,
    residenceFilter,
    benefitTypeFilter,
    maritalStatus,
    disabilityPct,
    empStatus,
    occupationFilter,
    cbMinority,
    cbDifferentlyAbled,
    cbDbtScheme,
    cbBpl,
    cbEconomicDistress,
    cbGovtEmployee,
    cbStudent,
    page,
  ])

  const captureFlip = () => {
    if (prefersReducedMotion()) return
    const cards = gsap.utils.toArray<HTMLElement>(
      '.catalog-card',
      scope.current as HTMLElement,
    )
    if (cards.length) flipState.current = Flip.getState(cards)
  }

  const handleQuery = (e: ChangeEvent<HTMLInputElement>) => {
    captureFlip()
    setQuery(e.target.value)
    setPage(1)
  }

  const handleCategory = (filter: string) => {
    return (e: MouseEvent<HTMLButtonElement>) => {
      pressChip(e.currentTarget)
      captureFlip()
      setCategory(filter)
      setPage(1)
    }
  }

  const handleResetFilters = () => {
    captureFlip()
    setCategory('All')
    setStateUt('all')
    setGenderFilter('all')
    setAgeGroup('all')
    setCasteFilter('all')
    setResidenceFilter('all')
    setBenefitTypeFilter('all')
    setMaritalStatus('all')
    setDisabilityPct('all')
    setEmpStatus('all')
    setOccupationFilter('all')
    setCbMinority(false)
    setCbDifferentlyAbled(false)
    setCbDbtScheme(false)
    setCbBpl(false)
    setCbEconomicDistress(false)
    setCbGovtEmployee(false)
    setCbStudent(false)
    setQuery('')
    setPage(1)
  }

  const handlePrevPage = () => {
    if (page > 1) {
      captureFlip()
      setPage((p) => p - 1)
      window.scrollTo({ top: 200, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      captureFlip()
      setPage((p) => p + 1)
      window.scrollTo({ top: 200, behavior: 'smooth' })
    }
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => {})
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = gsap.utils.toArray<HTMLElement>(
          '.catalog-card',
          scope.current as HTMLElement,
        )
        if (cards.length) {
          gsap.from(cards, {
            y: 16,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
            stagger: 0.04,
            clearProps: 'transform,opacity',
          })
        }
      })
    },
    { scope },
  )

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: reduce)', () => {})
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (flipState.current) {
          const state = flipState.current
          flipState.current = null
          Flip.from(state, {
            duration: 0.45,
            ease: 'power1.inOut',
            absolute: true,
            scale: true,
          })
        }
      })
    },
    { scope, dependencies: [query, category, schemes, page] },
  )

  const startRange = totalCount === 0 ? 0 : (page - 1) * 20 + 1
  const endRange = Math.min(page * 20, totalCount)

  const headerCountLabel = category === 'All'
    ? `${totalCount} active schemes total`
    : `${totalCount} active schemes in ${category}`

  // Single-source-of-truth Checkbox Counts
  const countMinority = allFetchedSchemes.filter(checkMinority).length
  const countDiffAbled = allFetchedSchemes.filter(checkDifferentlyAbled).length
  const countDbt = allFetchedSchemes.filter(checkDbt).length
  const countBpl = allFetchedSchemes.filter(checkBpl).length
  const countDistress = allFetchedSchemes.filter(checkEconomicDistress).length
  const countGovtEmp = allFetchedSchemes.filter(checkGovtEmp).length
  const countStudent = allFetchedSchemes.filter(checkStudent).length

  return (
    <div>
      <PageHeader
        title="Scheme catalog"
        subtitle={
          isOfficer
            ? 'Applications filed in your block, per scheme — review, verify and approve within the service window.'
            : 'Every active government scheme in one place — filter by State, Gender, Age, Caste, Benefit Type or Occupation.'
        }
        count={
          isOfficer
            ? `${totalCount} schemes total`
            : headerCountLabel
        }
      />

      {/* Main Layout: full-width Filter panel on top + catalog content below */}
      <div className="mt-6 flex flex-col gap-6 max-md:mt-4">
        {/* Filter Panel */}
        <section className="w-full rounded-2xl border border-border-subtle bg-surface p-5 shadow-soft max-md:p-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle/80 pb-3">
            <h3 className="font-display text-base font-bold text-[#1f2b5b] dark:text-white">
              Filter By
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[#54b89c] hover:underline"
            >
              Reset Filters
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-5 text-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* 1. State/UT */}
            <div>
              <label className="block font-bold text-ink-900 mb-1.5">State/UT</label>
              <div className="relative">
                <select
                  value={stateUt}
                  onChange={(e) => { setStateUt(e.target.value); setPage(1); }}
                  className="w-full appearance-none rounded-lg border border-border-subtle bg-canvas px-3 py-2.5 pr-8 text-xs font-medium text-ink-700 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                >
                  <option value="all">Select</option>
                  <option value="central">Central / All India</option>
                  <option value="wb">West Bengal</option>
                  <option value="odisha">Odisha</option>
                  <option value="karnataka">Karnataka</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-ink-400" />
              </div>
            </div>

            {/* 2. Gender Accordion */}
            <div>
              <div
                onClick={() => setOpenGender(!openGender)}
                className="flex cursor-pointer items-center justify-between font-bold text-ink-900"
              >
                <span>Gender</span>
                <span className="text-brand-mint text-sm">{openGender ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</span>
              </div>
              {openGender && (
                <div className="mt-2 space-y-1.5 pl-1">
                  {['all', 'female', 'male'].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer text-ink-700 capitalize">
                      <input
                        type="radio"
                        name="gender"
                        checked={genderFilter === g}
                        onChange={() => setGenderFilter(g)}
                        className="text-brand-orange"
                      />
                      {g === 'all' ? 'All Genders' : g}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Age */}
            <div>
              <label className="block font-bold text-ink-900 mb-1.5">Age</label>
              <div className="relative">
                <select
                  value={ageGroup}
                  onChange={(e) => { setAgeGroup(e.target.value); setPage(1); }}
                  className="w-full appearance-none rounded-lg border border-border-subtle bg-canvas px-3 py-2.5 pr-8 text-xs font-medium text-ink-700 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                >
                  <option value="all">Select</option>
                  <option value="children">Children (0-17 yrs)</option>
                  <option value="youth">Youth (18-35 yrs)</option>
                  <option value="senior">Senior Citizens (60+ yrs)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-ink-400" />
              </div>
            </div>

            {/* 4. Caste Accordion */}
            <div>
              <div
                onClick={() => setOpenCaste(!openCaste)}
                className="flex cursor-pointer items-center justify-between font-bold text-ink-900"
              >
                <span>Caste</span>
                <span className="text-brand-mint text-sm">{openCaste ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</span>
              </div>
              {openCaste && (
                <div className="mt-2 space-y-1.5 pl-1">
                  {['all', 'General', 'SC', 'ST', 'OBC'].map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer text-ink-700">
                      <input
                        type="radio"
                        name="caste"
                        checked={casteFilter === c}
                        onChange={() => setCasteFilter(c)}
                        className="text-brand-orange"
                      />
                      {c === 'all' ? 'All Castes' : c}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Residence Accordion */}
            <div>
              <div
                onClick={() => setOpenResidence(!openResidence)}
                className="flex cursor-pointer items-center justify-between font-bold text-ink-900"
              >
                <span>Residence</span>
                <span className="text-brand-mint text-sm">{openResidence ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</span>
              </div>
              {openResidence && (
                <div className="mt-2 space-y-1.5 pl-1">
                  {['all', 'Rural', 'Urban'].map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer text-ink-700">
                      <input
                        type="radio"
                        name="residence"
                        checked={residenceFilter === r}
                        onChange={() => setResidenceFilter(r)}
                        className="text-brand-orange"
                      />
                      {r === 'all' ? 'All Areas' : r}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 6. Benefit Type Accordion */}
            <div>
              <div
                onClick={() => setOpenBenefitType(!openBenefitType)}
                className="flex cursor-pointer items-center justify-between font-bold text-ink-900"
              >
                <span>Benefit Type</span>
                <span className="text-brand-mint text-sm">{openBenefitType ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</span>
              </div>
              {openBenefitType && (
                <div className="mt-2 space-y-1.5 pl-1">
                  {[
                    { id: 'all', label: 'All Types' },
                    { id: 'dbt', label: 'Direct Cash / DBT' },
                    { id: 'subsidy', label: 'Subsidy & Grant' },
                    { id: 'loan', label: 'Loan & Credit' },
                    { id: 'skill', label: 'Skill & Education' },
                  ].map((bt) => (
                    <label key={bt.id} className="flex items-center gap-2 cursor-pointer text-ink-700">
                      <input
                        type="radio"
                        name="benefitType"
                        checked={benefitTypeFilter === bt.id}
                        onChange={() => setBenefitTypeFilter(bt.id)}
                        className="text-brand-orange"
                      />
                      {bt.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Marital Status Accordion */}
            <div>
              <div
                onClick={() => setOpenMarital(!openMarital)}
                className="flex cursor-pointer items-center justify-between font-bold text-ink-900"
              >
                <span>Marital Status</span>
                <span className="text-brand-mint text-sm">{openMarital ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</span>
              </div>
              {openMarital && (
                <div className="mt-2 space-y-1.5 pl-1">
                  {['all', 'single', 'married', 'widow'].map((ms) => (
                    <label key={ms} className="flex items-center gap-2 cursor-pointer text-ink-700 capitalize">
                      <input
                        type="radio"
                        name="marital"
                        checked={maritalStatus === ms}
                        onChange={() => setMaritalStatus(ms)}
                        className="text-brand-orange"
                      />
                      {ms === 'all' ? 'All Statuses' : ms}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 8. Disability Percentage */}
            <div>
              <label className="block font-bold text-ink-900 mb-1.5">Disability Percentage</label>
              <div className="relative">
                <select
                  value={disabilityPct}
                  onChange={(e) => { setDisabilityPct(e.target.value); setPage(1); }}
                  className="w-full appearance-none rounded-lg border border-border-subtle bg-canvas px-3 py-2.5 pr-8 text-xs font-medium text-ink-700 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                >
                  <option value="all">Select</option>
                  <option value="pwd">40%+ Benchmark Disability</option>
                  <option value="none">Non-Disabled</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-ink-400" />
              </div>
            </div>

            {/* 9. Employment Status Accordion */}
            <div>
              <div
                onClick={() => setOpenEmpStatus(!openEmpStatus)}
                className="flex cursor-pointer items-center justify-between font-bold text-ink-900"
              >
                <span>Employment Status</span>
                <span className="text-brand-mint text-sm">{openEmpStatus ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}</span>
              </div>
              {openEmpStatus && (
                <div className="mt-2 space-y-1.5 pl-1">
                  {['all', 'unemployed', 'self-employed', 'salaried'].map((es) => (
                    <label key={es} className="flex items-center gap-2 cursor-pointer text-ink-700 capitalize">
                      <input
                        type="radio"
                        name="empStatus"
                        checked={empStatus === es}
                        onChange={() => setEmpStatus(es)}
                        className="text-brand-orange"
                      />
                      {es === 'all' ? 'All Statuses' : es}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 10. Occupation */}
            <div>
              <label className="block font-bold text-ink-900 mb-1.5">Occupation</label>
              <div className="relative">
                <select
                  value={occupationFilter}
                  onChange={(e) => { setOccupationFilter(e.target.value); setPage(1); }}
                  className="w-full appearance-none rounded-lg border border-border-subtle bg-canvas px-3 py-2.5 pr-8 text-xs font-medium text-ink-700 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                >
                  <option value="all">Select</option>
                  <option value="farmer">Farmer / Agriculturalist</option>
                  <option value="student">Student / Scholar</option>
                  <option value="artisan">Artisan / Small Trader</option>
                  <option value="dailywage">Daily Wage Worker</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-ink-400" />
              </div>
            </div>

            {/* 11. Checkbox Items with Live Synchronized Counts */}
            <div className="flex flex-wrap gap-x-6 gap-y-2.5 sm:col-span-2 lg:col-span-2 xl:col-span-2">
              {[
                { label: 'Minority', count: countMinority, state: cbMinority, setter: setCbMinority },
                { label: 'Differently Abled', count: countDiffAbled, state: cbDifferentlyAbled, setter: setCbDifferentlyAbled },
                { label: 'DBT Scheme', count: countDbt, state: cbDbtScheme, setter: setCbDbtScheme },
                { label: 'Below Poverty Line', count: countBpl, state: cbBpl, setter: setCbBpl },
                { label: 'Economic Distress', count: countDistress, state: cbEconomicDistress, setter: setCbEconomicDistress },
                { label: 'Government Employee', count: countGovtEmp, state: cbGovtEmployee, setter: setCbGovtEmployee },
                { label: 'Student', count: countStudent, state: cbStudent, setter: setCbStudent },
              ].map((item) => (
                <label key={item.label} className="flex cursor-pointer items-center gap-2 rounded-full bg-canvas/60 px-3 py-1.5 font-medium text-ink-800 transition-colors duration-150 hover:bg-canvas">
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => { item.setter(e.target.checked); setPage(1); }}
                    className="rounded border-border-subtle text-brand-orange focus:ring-brand-orange"
                  />
                  <span>{item.label}</span>
                  <span className="text-[10px] font-semibold text-ink-400">{item.count}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Catalog Content */}
        <div className="min-w-0">
          {/* Search Bar */}
          <div className="search-pulse flex items-center gap-2 rounded-[20px] border border-border-subtle bg-surface p-1.5 shadow-soft">
            <Search
              className="ml-3 h-4 w-4 shrink-0 text-ink-400"
              strokeWidth={1.5}
            />
            <input
              value={query}
              onChange={handleQuery}
              placeholder="Search 160+ schemes, benefits or categories (e.g. farmer, housing, solar)…"
              aria-label="Search schemes"
              className="w-full min-w-0 flex-1 bg-transparent px-2 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none max-md:py-2.5 max-md:text-[13px]"
            />
          </div>

          {/* Category Chips */}
          <div
            className="mt-4 flex flex-wrap gap-2 max-md:flex-nowrap max-md:overflow-x-auto max-md:pb-1 max-md:no-scrollbar"
            role="group"
            aria-label="Filter by category"
          >
            {categoriesList.map((filter) => (
              <button
                key={filter}
                onClick={handleCategory(filter)}
                aria-pressed={category === filter}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-orange max-md:min-h-11 ${
                  category === filter
                    ? 'bg-brand-navy text-navy-contrast shadow-soft'
                    : 'border border-border-subtle bg-surface text-ink-700 hover:text-ink-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Range Status indicator */}
          <div className="mt-5 flex items-center justify-between text-xs text-ink-400">
            <p>
              Showing <span className="font-semibold text-ink-900">{startRange}–{endRange}</span> of{' '}
              <span className="font-semibold text-ink-900">{totalCount}</span> schemes
            </p>
            <p>
              Page <span className="font-semibold text-ink-900">{page}</span> of{' '}
              <span className="font-semibold text-ink-900">{totalPages}</span>
            </p>
          </div>

          {/* Schemes Grid */}
          <div
            ref={scope}
            className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 max-md:mt-3 max-md:gap-3"
          >
            {schemes.map((scheme) =>
              isOfficer ? (
                <OfficerCatalogCard key={scheme.id} scheme={scheme} onViewDetails={() => onSelectScheme?.(scheme.id)} />
              ) : (
                <CatalogCard key={scheme.id} scheme={scheme} onViewDetails={() => onSelectScheme?.(scheme.id)} />
              ),
            )}
            {!loading && schemes.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-ink-400/40 bg-surface/60 px-6 py-12 text-center text-ink-400">
                <p className="text-sm">No schemes match your selected filter criteria.</p>
                <button
                  onClick={handleResetFilters}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-6">
              <button
                onClick={handlePrevPage}
                disabled={page <= 1}
                className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-4 py-2 text-xs font-semibold text-ink-700 shadow-soft transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-canvas"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                Previous
              </button>

              <div className="flex items-center gap-1 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      captureFlip()
                      setPage(p)
                      window.scrollTo({ top: 200, behavior: 'smooth' })
                    }}
                    className={`h-8 w-8 rounded-full text-xs font-semibold transition-colors duration-150 ${
                      page === p
                        ? 'bg-brand-navy text-navy-contrast'
                        : 'text-ink-700 hover:bg-surface'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-4 py-2 text-xs font-semibold text-ink-700 shadow-soft transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-canvas"
              >
                Next
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CatalogCard({ scheme, onViewDetails }: { scheme: CatalogScheme; onViewDetails: () => void }) {
  const dotClass = CATEGORY_DOTS[scheme.category] || 'bg-brand-orange'
  const tagText = scheme.tag || scheme.category

  return (
    <div className="catalog-card flex flex-col rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft transition-[box-shadow,translate] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lift max-md:p-4">
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
        />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          {scheme.category}
        </p>
        <span className="ml-auto rounded-full bg-brand-mint/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#3d7d6b] dark:text-[#7fd1bb]">
          {tagText}
        </span>
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-ink-900 max-md:mt-2 max-md:text-base">
        {scheme.title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-700 max-md:text-[13px]">
        {scheme.description}
      </p>
      <p className="mt-3 text-sm font-semibold text-brand-orange max-md:mt-2.5 max-md:text-[13px]">
        {scheme.benefit}
      </p>
      <p className="mt-0.5 text-xs text-ink-400 max-md:text-[11px]">
        Eligibility: {scheme.eligibility}
      </p>
      <div className="mt-auto pt-5">
        <button
          onClick={onViewDetails}
          className="w-full rounded-[14px] bg-brand-navy text-navy-contrast hover:bg-[#2d2839] dark:hover:bg-[#d9d5cd] px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.04em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-brand-orange max-md:normal-case max-md:tracking-normal"
        >
          View Details & Apply
        </button>
      </div>
    </div>
  )
}

function OfficerCatalogCard({ scheme, onViewDetails }: { scheme: CatalogScheme; onViewDetails: () => void }) {
  const stats = officerSchemeStats[scheme.id]
  const pendingPct = stats
    ? Math.min(100, Math.round((stats.pending / stats.applications) * 100))
    : 0
  const dotClass = CATEGORY_DOTS[scheme.category] || 'bg-brand-orange'
  const tagText = scheme.tag || scheme.category

  return (
    <div className="catalog-card flex flex-col rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft transition-[box-shadow,translate] duration-150 ease-out hover:-translate-y-0.5 hover:shadow-lift max-md:p-4">
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
        />
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          {scheme.category}
        </p>
        {stats && stats.overdue > 0 ? (
          <span className="ml-auto rounded-full bg-brand-orange/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#b06a34] dark:text-[#f0a468]">
            {stats.overdue} overdue
          </span>
        ) : (
          <span className="ml-auto rounded-full bg-brand-mint/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#3d7d6b] dark:text-[#7fd1bb]">
            {tagText}
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold text-ink-900 max-md:mt-2 max-md:text-base">
        {scheme.title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-700 max-md:text-[13px]">
        {scheme.description}
      </p>

      {stats && (
        <div className="mt-4 rounded-xl bg-canvas/60 px-4 py-3 max-md:mt-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-ink-900">
              {stats.applications} applications
            </p>
            <p className="text-xs text-ink-400">{stats.pending} pending</p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas">
            <div
              className="h-full rounded-full bg-brand-orange"
              style={{ width: `${pendingPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-400">
            {stats.pending > 0
              ? `${stats.pending} await your review within the 7-day window.`
              : 'All applications reviewed — nothing pending.'}
          </p>
        </div>
      )}

      <div className="mt-auto pt-5 flex gap-2">
        <button
          onClick={onViewDetails}
          className="w-full rounded-[14px] bg-brand-navy px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.04em] text-navy-contrast transition-colors duration-150 hover:bg-[#2d2839] dark:hover:bg-[#d9d5cd] focus-visible:outline-2 focus-visible:outline-brand-orange max-md:normal-case max-md:tracking-normal"
        >
          View Details
        </button>
      </div>
    </div>
  )
}
