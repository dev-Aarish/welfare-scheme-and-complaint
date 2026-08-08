import {
  Bug,
  Cpu,
  Database,
  FileText,
  Headset,
  HeartHandshake,
  LayoutGrid,
  Map,
  MessagesSquare,
  Phone,
  Shield,
  Siren,
  UserRound,
  type LucideIcon,
} from 'lucide-react'

/* ── Navigation ──────────────────────────────────────────── */

export type TabId =
  | 'overview'
  | 'map'
  | 'chat'
  | 'profile'
  | 'schemes'
  | 'helpline'
  | 'complaints'

export interface Tab {
  id: TabId
  label: string
  icon: LucideIcon
  /** Staff-only destinations — hidden from the citizen sidebar. */
  officerOnly?: boolean
}

export const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'map', label: 'Block map', icon: Map, officerOnly: true },
  { id: 'schemes', label: 'Scheme catalog', icon: FileText },
  { id: 'helpline', label: 'Helpline', icon: Phone },
  { id: 'complaints', label: 'File complaint', icon: FileText },
  { id: 'chat', label: 'Sahayak chat', icon: MessagesSquare },
  { id: 'profile', label: 'My profile', icon: UserRound },
]

/* ── Demo citizen ────────────────────────────────────────── */

export const user = {
  name: 'Asha Verma',
  initials: 'AV',
  meta: 'Female, 32 · Rural · Farmer · Income under ₹2L/yr',
}

/* ── Stats shown in the hero ─────────────────────────────── */

export const stats = [
  { value: '6', label: 'schemes matched' },
  { value: '4', label: 'reports tracked' },
  { value: '4.2 days', label: 'avg. resolution' },
]

/* ── Welfare schemes (rule-based eligibility matches) ────── */

export type CardColor =
  | 'lavender'
  | 'olive'
  | 'terracotta'
  | 'sage'
  | 'mauve'
  | 'khaki'

export type IllustrationKey =
  | 'spiral'
  | 'leaf'
  | 'sun'
  | 'health'
  | 'flower'
  | 'coins'

export interface Scheme {
  id: string
  title: string
  tag: string
  benefit: string
  color: CardColor
  illustration: IllustrationKey
  match: string
}

export const schemes: Scheme[] = [
  {
    id: 'pmay',
    title: 'PM Awas Yojana',
    tag: 'Housing',
    benefit: '₹2.5L housing grant',
    color: 'lavender',
    illustration: 'spiral',
    match: 'Likely eligible',
  },
  {
    id: 'nfsa',
    title: 'Ration Card (NFSA)',
    tag: 'Food security',
    benefit: '30 kg grain / month',
    color: 'olive',
    illustration: 'leaf',
    match: 'Likely eligible',
  },
  {
    id: 'pmkisan',
    title: 'PM-Kisan Samman Nidhi',
    tag: 'Farmer support',
    benefit: '₹6,000 / year',
    color: 'terracotta',
    illustration: 'sun',
    match: 'Likely eligible',
  },
  {
    id: 'ayushman',
    title: 'Ayushman Bharat',
    tag: 'Health cover',
    benefit: '₹5L health cover',
    color: 'sage',
    illustration: 'health',
    match: 'Verify documents',
  },
  {
    id: 'kanyashree',
    title: 'Kanyashree Prakalpa',
    tag: 'Girl child',
    benefit: '₹25,000 scholarship',
    color: 'mauve',
    illustration: 'flower',
    match: 'Likely eligible',
  },
  {
    id: 'sukanya',
    title: 'Sukanya Samriddhi',
    tag: 'Savings',
    benefit: '8.2% p.a. interest',
    color: 'khaki',
    illustration: 'coins',
    match: 'Likely eligible',
  },
]

/* ── Anonymous complaints & their resolution status ──────── */

export type Status = 'Resolved' | 'Under review' | 'Open'

export interface Complaint {
  id: string
  ref: string
  title: string
  location: string
  time: string
  status: Status
  days: number
}

export const complaints: Complaint[] = [
  {
    id: 'c1',
    ref: 'SR-1038',
    title: 'Street light outage',
    location: 'Ward 12, College Road',
    time: '2 days ago',
    status: 'Resolved',
    days: 3,
  },
  {
    id: 'c2',
    ref: 'SR-1041',
    title: 'Water supply disruption',
    location: 'Durganagar, Block B',
    time: '6 days ago',
    status: 'Under review',
    days: 6,
  },
  {
    id: 'c3',
    ref: 'SR-1024',
    title: 'Mid-day meal quality',
    location: 'Purba Para Primary School',
    time: '6 days ago',
    status: 'Resolved',
    days: 5,
  },
  {
    id: 'c4',
    ref: 'SR-1044',
    title: 'Harassment at ration shop',
    location: 'Fuleswar Ration Depot',
    time: 'today',
    status: 'Open',
    days: 0,
  },
]

/* ── Officer (staff) desk ────────────────────────────────── */

export const officer = {
  name: 'Rajiv Das',
  initials: 'RD',
  designation: 'Block Officer · Uluberia-I',
}

/* Stats shown in the officer hero */

export const officerStats = [
  { value: '7', label: 'reports to review' },
  { value: '2', label: 'escalations due' },
  { value: '9 in 10', label: 'resolved on time' },
]

/* Pending queue on the officer desk — flat pastel cards like the
   citizen scheme grid (design.md §6), but the label reads urgency. */

export interface OfficerQueueItem {
  id: string
  title: string
  tag: string
  ref: string
  location: string
  due: string
  color: CardColor
  illustration: IllustrationKey
}

export const officerQueue: OfficerQueueItem[] = [
  {
    id: 'q1',
    title: 'Water supply disruption',
    tag: 'Civic',
    ref: 'SR-1041',
    location: 'Durganagar, Block B',
    due: 'Day 6 of 7',
    color: 'terracotta',
    illustration: 'spiral',
  },
  {
    id: 'q2',
    title: 'Harassment at ration shop',
    tag: 'Ration',
    ref: 'SR-1044',
    location: 'Fuleswar Ration Depot',
    due: 'Day 2 of 7',
    color: 'mauve',
    illustration: 'coins',
  },
  {
    id: 'q3',
    title: 'Ration card not renewed',
    tag: 'Ration',
    ref: 'SR-1056',
    location: 'Ward 3',
    due: 'Day 5 of 7',
    color: 'olive',
    illustration: 'leaf',
  },
  {
    id: 'q4',
    title: 'Drain overflow near school',
    tag: 'Civic',
    ref: 'SR-1053',
    location: 'Ward 8',
    due: 'Day 4 of 7',
    color: 'lavender',
    illustration: 'health',
  },
  {
    id: 'q5',
    title: 'PM-Kisan payment not credited',
    tag: 'Welfare',
    ref: 'SR-1052',
    location: 'Durganagar',
    due: 'Day 1 of 7',
    color: 'sage',
    illustration: 'sun',
  },
  {
    id: 'q6',
    title: 'Anganwadi ration missing',
    tag: 'ICDS',
    ref: 'SR-1055',
    location: 'Ward 9',
    due: 'Day 3 of 7',
    color: 'khaki',
    illustration: 'flower',
  },
]

/* Case log — open, under review and resolved, all on record */

export const officerCases: Complaint[] = [
  {
    id: 'o1',
    ref: 'SR-1038',
    title: 'Street light outage',
    location: 'Ward 12, College Road',
    time: '2 days ago',
    status: 'Resolved',
    days: 3,
  },
  {
    id: 'o2',
    ref: 'SR-1024',
    title: 'Mid-day meal quality',
    location: 'Purba Para Primary School',
    time: '5 days ago',
    status: 'Resolved',
    days: 5,
  },
  {
    id: 'o3',
    ref: 'SR-1051',
    title: 'Road pothole at bazaar crossing',
    location: 'Ward 7',
    time: '4 days ago',
    status: 'Resolved',
    days: 4,
  },
  {
    id: 'o4',
    ref: 'SR-1047',
    title: 'Old-age pension not credited',
    location: 'Durganagar',
    time: 'yesterday',
    status: 'Under review',
    days: 1,
  },
]

/* ── Officer profile (My profile tab) ────────────────────── */

export const officerProfile = {
  employment: [
    { label: 'Employee ID', value: 'BLK-ULB-142' },
    { label: 'Designation', value: 'Block Officer' },
    { label: 'Department', value: 'Rural Development' },
    { label: 'Reporting to', value: 'District Magistrate, Howrah' },
    { label: 'Joined', value: 'July 2021' },
  ],
  posting: [
    { label: 'Block', value: 'Uluberia-I' },
    { label: 'District', value: 'Howrah, West Bengal' },
    { label: 'Villages covered', value: '47' },
    { label: 'Households', value: '31,200' },
    { label: 'Service window', value: '7 days' },
  ],
  contact: [
    { label: 'Official email', value: 'rajiv.das@howrah.gov.in' },
    { label: 'Office phone', value: '033 2661 4200' },
    { label: 'Mobile', value: '+91 98300 11242' },
  ],
}

export const officerAccess = [
  { label: 'Verify scheme applications', granted: true },
  { label: 'Assign & resolve reports', granted: true },
  { label: 'Escalate to district desk', granted: true },
  { label: 'View citizen identifiers', granted: false },
]

export const officerPerformance = [
  { label: 'Cases closed this month', value: '14', pct: 100 },
  { label: 'Resolved on time', value: '93%', pct: 93 },
  { label: 'Reports on desk now', value: '7', pct: 70 },
]

/* ── Officer catalog stats (Scheme catalog tab) — how many
   applications per scheme are waiting in the block ──────── */

export const officerSchemeStats: Record<
  string,
  { applications: number; pending: number; overdue: number }
> = {
  pmay: { applications: 312, pending: 41, overdue: 3 },
  nfsa: { applications: 489, pending: 22, overdue: 1 },
  pmkisan: { applications: 356, pending: 12, overdue: 0 },
  ayushman: { applications: 268, pending: 9, overdue: 0 },
  kanyashree: { applications: 143, pending: 5, overdue: 0 },
  sukanya: { applications: 97, pending: 3, overdue: 0 },
  ujjwala: { applications: 204, pending: 17, overdue: 2 },
  mgnrega: { applications: 521, pending: 0, overdue: 0 },
  jandhan: { applications: 612, pending: 6, overdue: 0 },
  matru: { applications: 88, pending: 4, overdue: 0 },
  fasal: { applications: 176, pending: 8, overdue: 1 },
  ignoaps: { applications: 131, pending: 15, overdue: 1 },
}

/* ── Officer helpline (Helpline tab) — internal support ─── */

export const officerSupportContacts: EmergencyContact[] = [
  { label: 'District IT cell', number: '1800-345-2211', icon: Cpu },
  { label: 'Data officer — Howrah', number: '1800-345-2212', icon: Database },
  { label: 'Escalation desk', number: '1800-345-2213', icon: Headset },
]

export const officerEscalationSteps = [
  {
    title: 'Receive & assign',
    text: 'Reports land on your desk with a reference ID. Assign a field officer within 24 hours.',
  },
  {
    title: 'Review & resolve',
    text: 'Verify the facts, coordinate with the department, and close the case with a public note.',
  },
  {
    title: 'Auto-escalate at day 7',
    text: 'Anything unresolved after 7 days moves to the district desk — no action needed from you.',
  },
]

/* ── Officer block map — a stylized ward map of Uluberia-I.
   Every complaint in the desk queue and case log is pinned to its ward.
   Pins stay ward-level on purpose: anonymous reports never show exact
   locations (design.md §8 line-art language, no stock tiles). ─────── */

export interface BlockIncident {
  ref: string
  title: string
  status: Status
  /** Days since filed — drives the "oldest unresolved" surfacing. */
  age: number
}

export interface BlockWard {
  id: string
  name: string
  sub: string
  /** Hex-grid position (pointy-top, odd rows offset right). */
  row: number
  col: number
  /** Shared service relationship, drawn as a labelled edge (e.g. the
   *  ration-depot catchment that spans Ward 3 market + Fuleswar depot). */
  catchment?: string
  incidents: BlockIncident[]
}

export const blockMap: {
  block: string
  districts: string
  river: string
  wards: BlockWard[]
} = {
  block: 'Uluberia-I',
  districts: 'Howrah · West Bengal',
  river: 'Hooghly',
  wards: [
    {
      id: 'college-road',
      name: 'College Road',
      sub: 'Ward 12 · avenue',
      row: 0,
      col: 0,
      incidents: [
        {
          ref: 'SR-1038',
          title: 'Street light outage',
          status: 'Resolved',
          age: 3,
        },
      ],
    },
    {
      id: 'ward-3',
      name: 'Ward 3',
      sub: 'Market zone',
      row: 0,
      col: 1,
      catchment: 'ration-depot',
      incidents: [
        {
          ref: 'SR-1056',
          title: 'Ration card not renewed',
          status: 'Under review',
          age: 5,
        },
      ],
    },
    {
      id: 'purba-para',
      name: 'Purba Para',
      sub: 'Ward 6 · schools',
      row: 0,
      col: 2,
      incidents: [
        {
          ref: 'SR-1024',
          title: 'Mid-day meal quality',
          status: 'Resolved',
          age: 5,
        },
      ],
    },
    {
      id: 'ward-7',
      name: 'Ward 7',
      sub: 'Bazaar crossing',
      row: 1,
      col: 0,
      incidents: [
        {
          ref: 'SR-1051',
          title: 'Road pothole at bazaar crossing',
          status: 'Resolved',
          age: 4,
        },
      ],
    },
    {
      id: 'fuleswar',
      name: 'Fuleswar',
      sub: 'Ration depot village',
      row: 1,
      col: 1,
      catchment: 'ration-depot',
      incidents: [
        {
          ref: 'SR-1044',
          title: 'Harassment at ration shop',
          status: 'Open',
          age: 2,
        },
      ],
    },
    {
      id: 'durganagar',
      name: 'Durganagar',
      sub: 'Ward 4 · town centre',
      row: 1,
      col: 2,
      incidents: [
        {
          ref: 'SR-1041',
          title: 'Water supply disruption',
          status: 'Under review',
          age: 6,
        },
        {
          ref: 'SR-1052',
          title: 'PM-Kisan payment not credited',
          status: 'Open',
          age: 1,
        },
        {
          ref: 'SR-1047',
          title: 'Old-age pension not credited',
          status: 'Under review',
          age: 1,
        },
      ],
    },
    {
      id: 'ward-9',
      name: 'Ward 9',
      sub: 'Anganwadi zone',
      row: 2,
      col: 0,
      incidents: [
        {
          ref: 'SR-1055',
          title: 'Anganwadi ration missing',
          status: 'Open',
          age: 3,
        },
      ],
    },
    {
      id: 'ward-8',
      name: 'Ward 8',
      sub: 'East residential',
      row: 2,
      col: 1,
      incidents: [
        {
          ref: 'SR-1053',
          title: 'Drain overflow near school',
          status: 'Open',
          age: 4,
        },
      ],
    },
  ],
}

/* ── Officer Sahayak chat ────────────────────────────────── */

export const officerIntroMessages: Record<string, string> = {
  bn: 'শুভ সকাল, Officer Rajiv! 🙏 আমি Sahayak — আপনার ডেস্ক সহকারী। বিচারাধীন রিপোর্ট, যাচাইয়ের অপেক্ষায় থাকা আবেদন বা জরুরি ডেডলাইন — যেকোনো কিছু জিজ্ঞেস করুন।',
  hi: 'सुप्रभात, Officer Rajiv! 🙏 मैं Sahayak हूँ — आपका डेस्क सहायक। लंबित रिपोर्ट, सत्यापन के लिए आवेदन या डेडलाइन — कुछ भी पूछिए।',
  en: "Good morning, Officer Rajiv! 🙏 I'm Sahayak, your desk assistant. Ask about pending reports, applications to verify, or escalation deadlines.",
}

export const officerQuickReplies = [
  'Which reports are due today?',
  'How many applications await review?',
  "Show this week's escalations",
  'My block statistics',
]

export const officerBotReplies = [
  'You have 7 reports on your desk. SR-1041 (Water supply) is Day 6 of 7 — it escalates to the district desk tomorrow if unresolved. 🔔',
  '21 applications await your verification in Uluberia-I. The oldest is a PM Awas Yojana case filed 11 days ago. 🧾',
  'This week: 14 cases closed, 93% on time, 0 escalations. Your block is the fastest in Howrah district. 📈',
  'Reminder: the 7-day window starts the moment a report is filed. Citizens get an SMS at every step — assign early, resolve faster. 📲',
]

/* ── Sahayak chat ────────────────────────────────────────── */

export interface Language {
  id: string
  label: string
}

export const languages: Language[] = [
  { id: 'bn', label: 'বাংলা' },
  { id: 'hi', label: 'हिन्दी' },
  { id: 'en', label: 'English' },
]

export const introMessages: Record<string, string> = {
  bn: 'নমস্কার, Asha! 🙏 আমি Sahayak — আপনার কল্যাণ সহায়ক। বাংলা, হিন্দি বা ইংরেজিতে, টেক্সট বা ভয়েসে প্রশ্ন করুন।',
  hi: 'नमस्ते, Asha! 🙏 मैं Sahayak हूँ — आपका कल्याण सहायक। बांग्ला, हिंदी या अंग्रेज़ी में, टाइप करके या आवाज़ से पूछिए।',
  en: 'Hello again, Asha! 🙏 I\u2019m Sahayak, your welfare assistant. Ask me anything — in Bengali, Hindi or English, by text or voice.',
}

export const quickReplies = [
  'Which schemes am I eligible for?',
  'How do I apply for Ration Card?',
  'Track my complaint',
  'Do I qualify for a housing scheme?',
]

export const botReplies = [
  'You\u2019re eligible for 6 schemes right now! The quickest is Ration Card (NFSA) — about 5 minutes with just your Aadhaar. Shall I open the form for you? 🧾',
  'Your report SR-1041 (Water supply disruption) is under review — day 1 of 7. If unresolved by day 7, it escalates automatically to the block officer. 🔔',
  'Most schemes need only 2 documents from you: Aadhaar and the income certificate — both are already verified in your profile. ✅',
  'Tip: applications filed through SevaNest are tracked end-to-end. You will get an SMS at every stage, in your chosen language. 📲',
]

/* ── Scheme catalog ──────────────────────────────────────── */

export type CatalogCategory =
  | 'Housing'
  | 'Food'
  | 'Health'
  | 'Farmer'
  | 'Education'
  | 'Women'
  | 'Savings'
  | 'Pension'

export const catalogCategories: CatalogCategory[] = [
  'Housing',
  'Food',
  'Health',
  'Farmer',
  'Education',
  'Women',
  'Savings',
  'Pension',
]

export interface CatalogScheme {
  id: string
  title: string
  category: CatalogCategory
  tag?: string
  description: string
  benefit: string
  eligibility: string
  matched: boolean
}

export const catalogSchemes: CatalogScheme[] = [
  {
    id: 'pmay',
    title: 'PM Awas Yojana',
    category: 'Housing',
    description:
      'Build or upgrade a permanent house for your family with a central grant.',
    benefit: '₹2.5L housing grant',
    eligibility: 'Rural · income under ₹3L',
    matched: true,
  },
  {
    id: 'nfsa',
    title: 'Ration Card (NFSA)',
    category: 'Food',
    description:
      'Subsidised grain for every family member, delivered at your local depot.',
    benefit: '30 kg grain / month',
    eligibility: 'BPL households',
    matched: true,
  },
  {
    id: 'pmkisan',
    title: 'PM-Kisan Samman Nidhi',
    category: 'Farmer',
    description:
      'Direct income support for landholding farmers, credited to your bank account.',
    benefit: '₹6,000 / year',
    eligibility: 'Owns farmland',
    matched: true,
  },
  {
    id: 'ayushman',
    title: 'Ayushman Bharat',
    category: 'Health',
    description:
      'Cashless hospital cover for the whole family at empanelled hospitals.',
    benefit: '₹5L health cover',
    eligibility: 'Rural · income-linked',
    matched: true,
  },
  {
    id: 'kanyashree',
    title: 'Kanyashree Prakalpa',
    category: 'Education',
    description:
      'Annual scholarship to keep girls in school until they turn 18.',
    benefit: '₹25,000 scholarship',
    eligibility: 'Girl child · school-going',
    matched: true,
  },
  {
    id: 'sukanya',
    title: 'Sukanya Samriddhi',
    category: 'Savings',
    description:
      'A high-interest savings account for your daughter\u2019s education and marriage.',
    benefit: '8.2% p.a. interest',
    eligibility: 'Girl child under 10',
    matched: true,
  },
  {
    id: 'ujjwala',
    title: 'PM Ujjwala Yojana',
    category: 'Women',
    description:
      'Free LPG connection for women in BPL households — cleaner, safer cooking.',
    benefit: 'Free LPG connection',
    eligibility: 'Women · BPL',
    matched: false,
  },
  {
    id: 'mgnrega',
    title: 'MGNREGA',
    category: 'Farmer',
    description:
      'Guaranteed 100 days of wage work per year for rural households.',
    benefit: '100 days of work',
    eligibility: 'Rural adult · 18+',
    matched: false,
  },
  {
    id: 'jandhan',
    title: 'PM Jan Dhan Yojana',
    category: 'Savings',
    description:
      'A zero-balance bank account with accident cover and insurance benefits.',
    benefit: 'Zero-balance account + ₹2L cover',
    eligibility: 'All adults',
    matched: false,
  },
  {
    id: 'matru',
    title: 'Matru Vandana Yojana',
    category: 'Women',
    description:
      'Maternity benefit for the first child, paid in cash instalments.',
    benefit: '₹5,000 maternity benefit',
    eligibility: 'First pregnancy · 19+',
    matched: false,
  },
  {
    id: 'fasal',
    title: 'PM Fasal Bima Yojana',
    category: 'Farmer',
    description:
      'Crop insurance against drought, flood, pests and other natural risks.',
    benefit: 'Subsidised crop cover',
    eligibility: 'Cultivating farmers',
    matched: false,
  },
  {
    id: 'ignoaps',
    title: 'Old Age Pension (IGNOAPS)',
    category: 'Pension',
    description:
      'Monthly pension for senior citizens aged 60+ without other income.',
    benefit: '₹1,000 / month',
    eligibility: 'Age 60+ · BPL',
    matched: false,
  },
]

/* ── Citizen profile (My profile tab) ────────────────────── */

export interface ProfileRow {
  label: string
  value: string
}

export const profile = {
  personal: [
    { label: 'Full name', value: 'Asha Verma' },
    { label: 'Gender', value: 'Female' },
    { label: 'Age', value: '32 years' },
    { label: 'Aadhaar', value: '•••• 4432 · linked ✓' },
    { label: 'Mobile', value: '+91 98765 43210 · verified' },
    {
      label: 'Language',
      value: 'বাংলা (primary) · हिन्दी · English',
    },
  ],
  household: [
    { label: 'Village', value: 'Durganagar' },
    { label: 'Block', value: 'Uluberia-I' },
    { label: 'District', value: 'Howrah, West Bengal' },
    { label: 'Household size', value: '5 members' },
    { label: 'Ration card', value: 'BPL · yellow' },
  ],
  occupation: [
    { label: 'Occupation', value: 'Farmer (kharif + dairy)' },
    { label: 'Land owned', value: '1.2 acres' },
    { label: 'Annual income', value: '₹1.4L' },
    {
      label: 'Income source',
      value: 'Crops, dairy, MGNREGA days',
    },
  ],
  documents: [
    { label: 'Aadhaar', status: 'Verified', note: 'Linked to mobile' },
    { label: 'Voter ID', status: 'Verified', note: 'Electoral roll 2024' },
    { label: 'Income certificate', status: 'Verified', note: 'Issued 2026' },
    { label: 'Ration card', status: 'Verified', note: 'BPL category' },
    { label: 'Bank passbook', status: 'Pending', note: 'Upload front page' },
    { label: 'Land record (ROR)', status: 'Pending', note: 'Block office copy' },
  ] as { label: string; status: 'Verified' | 'Pending'; note: string }[],
  factors: [
    'Income under ₹2L',
    'Rural household',
    'Farmer',
    'Girl child in family',
    'BPL ration card',
  ],
}

/* ── Helpline ────────────────────────────────────────────── */

export const reportCategories = [
  'Civic issue',
  'Harassment',
  'Corruption',
  'Other',
] as const

export interface EmergencyContact {
  label: string
  number: string
  icon: LucideIcon
}

export const emergencyContacts: EmergencyContact[] = [
  { label: 'Police (emergency)', number: '100', icon: Shield },
  { label: 'Women helpline', number: '1091', icon: HeartHandshake },
  { label: 'Emergency response', number: '112', icon: Siren },
  { label: 'Cybercrime fraud', number: '1930', icon: Bug },
]

export const helplineSteps = [
  {
    title: 'Report anonymously',
    text: 'Describe the issue, attach photo or video evidence, and let us auto-locate it.',
  },
  {
    title: 'Track every step',
    text: 'Get SMS updates in your language — assigned, under review, resolved.',
  },
  {
    title: 'Auto-escalation',
    text: 'Unresolved after 7 days? Escalates to the block officer, then the district authority.',
  },
]
