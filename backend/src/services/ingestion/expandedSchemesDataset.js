/**
 * Comprehensive Dataset of 100 Central & State Government Welfare Schemes across 15+ Domains.
 */
export const EXPANDED_GOVT_SCHEMES = [
  // ── 1. AGRICULTURE & FARMER SUPPORT ──────────────────────────────────────────
  {
    external_id: 'pmkisan',
    title: 'PM-Kisan Samman Nidhi',
    category: 'Agriculture',
    tag: 'Direct Income Support',
    description: 'Direct income support of ₹6,000 per year transferred directly to bank accounts of landholding farmer families.',
    benefit: '₹6,000 / year (in 3 equal installments)',
    eligibility: 'Small & marginal landholding farmer families across India',
    source_url: 'https://pmkisan.gov.in'
  },
  {
    external_id: 'pmfby',
    title: 'PM Fasal Bima Yojana',
    category: 'Agriculture',
    tag: 'Crop Insurance',
    description: 'Comprehensive insurance coverage against crop failure due to natural risks, pests, and non-preventable natural disasters.',
    benefit: 'Comprehensive crop insurance at nominal premium (1.5% to 2%)',
    eligibility: 'All farmers growing notified crops in notified areas',
    source_url: 'https://pmfby.gov.in'
  },
  {
    external_id: 'kcc',
    title: 'Kisan Credit Card (KCC) Scheme',
    category: 'Agriculture',
    tag: 'Farm Credit',
    description: 'Provides timely and adequate credit to farmers for agricultural operations, post-harvest expenses, and allied activities.',
    benefit: 'Concessional crop loans up to ₹3 Lakhs at 4% interest rate',
    eligibility: 'Farmers, tenant farmers, sharecroppers, and SHGs',
    source_url: 'https://myscheme.gov.in/schemes/kcc'
  },
  {
    external_id: 'pmksy',
    title: 'PM Krishi Sinchayee Yojana (PMKSY)',
    category: 'Agriculture',
    tag: 'Irrigation',
    description: 'Expands cultivable area under assured irrigation, improves on-farm water use efficiency ("Per Drop More Crop").',
    benefit: 'Up to 55% subsidy on drip and sprinkler micro-irrigation equipment',
    eligibility: 'All farmer categories with land ownership or tenancy rights',
    source_url: 'https://pmksy.gov.in'
  },
  {
    external_id: 'pkvy',
    title: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    category: 'Agriculture',
    tag: 'Organic Farming',
    description: 'Promotes organic farming practices through cluster-based adoption and PGS organic certification.',
    benefit: 'Financial assistance of ₹50,000 per hectare over 3 years',
    eligibility: 'Farmer groups forming clusters of 50 acres or more',
    source_url: 'https://pgsindia-ncof.gov.in'
  },
  {
    external_id: 'aif',
    title: 'Agriculture Infrastructure Fund (AIF)',
    category: 'Agriculture',
    tag: 'Agri Infrastructure',
    description: 'Medium-long term debt financing for investment in viable post-harvest management infrastructure and community assets.',
    benefit: '3% per annum interest subvention on loans up to ₹2 Crores',
    eligibility: 'Primary Agricultural Credit Societies, FPOs, Agri-entrepreneurs',
    source_url: 'https://agriinfra.dac.gov.in'
  },
  {
    external_id: 'soil-health-card',
    title: 'Soil Health Card Scheme',
    category: 'Agriculture',
    tag: 'Soil Management',
    description: 'Provides soil health cards to farmers with crop-wise recommendations of nutrients and fertilizers.',
    benefit: 'Free soil testing & customized fertilizer advice every 2 years',
    eligibility: 'All agricultural landholders in India',
    source_url: 'https://soilhealth.dac.gov.in'
  },
  {
    external_id: 'pm-matsya-sampada',
    title: 'PM Matsya Sampada Yojana (PMMSY)',
    category: 'Agriculture',
    tag: 'Fisheries',
    description: 'Ecologically healthy development of fisheries sector, boosting fish production and fishers income.',
    benefit: 'Financial assistance of 40% to 60% for fisheries equipment & boats',
    eligibility: 'Fishers, fish farmers, fish workers, SHGs, and cooperatives',
    source_url: 'https://pmmsy.dof.gov.in'
  },
  {
    external_id: 'rashtriya-gokul-mission',
    title: 'Rashtriya Gokul Mission',
    category: 'Agriculture',
    tag: 'Livestock Development',
    description: 'Development and conservation of indigenous bovine breeds and enhancing milk production and productivity.',
    benefit: '50% capital subsidy up to ₹50 Lakhs for breed multiplication farms',
    eligibility: 'Farmers, individual entrepreneurs, FPOs, and cooperatives',
    source_url: 'https://dahd.nic.in'
  },

  // ── 2. HOUSING & RURAL INFRASTRUCTURE ───────────────────────────────────────
  {
    external_id: 'pmay-g',
    title: 'PM Awas Yojana - Gramin',
    category: 'Housing',
    tag: 'Rural Housing',
    description: 'Financial assistance to homeless and Kutcha householders in rural areas for constructing permanent Pucca houses.',
    benefit: '₹1.20 Lakh grant (plain areas) / ₹1.30 Lakh grant (hilly areas)',
    eligibility: 'Rural households identified under SECC/Awas+ list without Pucca house',
    source_url: 'https://pmayg.nic.in'
  },
  {
    external_id: 'pmay-u',
    title: 'PM Awas Yojana - Urban',
    category: 'Housing',
    tag: 'Urban Housing',
    description: 'Addresses urban housing shortage among EWS/LIG and MIG categories through interest subsidies and grants.',
    benefit: 'Interest subsidy up to ₹2.67 Lakhs on home loans',
    eligibility: 'Urban families with annual household income up to ₹18 Lakhs without Pucca home',
    source_url: 'https://pmaymis.gov.in'
  },
  {
    external_id: 'jal-jeevan-mission',
    title: 'Jal Jeevan Mission (Har Ghar Jal)',
    category: 'Housing',
    tag: 'Drinking Water',
    description: 'Provides functional household tap connections to every rural household across India.',
    benefit: 'Free tap water connection with safe potable drinking water supply',
    eligibility: 'Every rural household in India',
    source_url: 'https://ejalshakti.gov.in'
  },
  {
    external_id: 'swachh-bharat-gramin',
    title: 'Swachh Bharat Mission - Gramin',
    category: 'Housing',
    tag: 'Sanitation',
    description: 'Incentive for constructing individual household latrines (IHHL) to achieve Open Defecation Free status.',
    benefit: '₹12,000 cash incentive per household toilet',
    eligibility: 'BPL families and identified APL vulnerable households in rural areas',
    source_url: 'https://sbm.gov.in'
  },
  {
    external_id: 'pm-svamitva',
    title: 'SVAMITVA Scheme',
    category: 'Housing',
    tag: 'Property Cards',
    description: 'Drone surveying of inhabited rural areas to provide clear property ownership rights and property cards.',
    benefit: 'Official government Property Card for rural house owners',
    eligibility: 'Rural residential property owners in surveyed villages',
    source_url: 'https://svamitva.nic.in'
  },

  // ── 3. HEALTHCARE & MEDICAL COVER ───────────────────────────────────────────
  {
    external_id: 'ayushman-bharat',
    title: 'Ayushman Bharat - PMJAY',
    category: 'Healthcare',
    tag: 'Health Insurance',
    description: 'World’s largest health insurance scheme providing cashless hospital coverage for secondary and tertiary care.',
    benefit: '₹5 Lakhs per family per year cashless health coverage',
    eligibility: 'Bottom 40% vulnerable families listed in SECC 2011 & senior citizens 70+',
    source_url: 'https://pmjay.gov.in'
  },
  {
    external_id: 'jan-aushadhi',
    title: 'PM Bharatiya Janaushadhi Pariyojana',
    category: 'Healthcare',
    tag: 'Generic Medicines',
    description: 'Provides quality generic medicines at affordable prices through dedicated Kendra outlets nationwide.',
    benefit: 'Medicines available at 50% to 90% lower cost than branded drugs',
    eligibility: 'All citizens of India',
    source_url: 'https://janaushadhi.gov.in'
  },
  {
    external_id: 'ab-pmssy',
    title: 'PM Swasthya Suraksha Yojana (PMSSY)',
    category: 'Healthcare',
    tag: 'Health Infrastructure',
    description: 'Corrects regional imbalances in tertiary healthcare availability and upgrades government medical colleges.',
    benefit: 'Access to new AIIMS facilities & upgraded super-specialty blocks',
    eligibility: 'All citizens seeking super-specialty medical treatment',
    source_url: 'https://pmssy.mohfw.gov.in'
  },
  {
    external_id: 'tb-mukht-bharat',
    title: 'Nikshay Poshan Yojana (TB Support)',
    category: 'Healthcare',
    tag: 'Nutritional Support',
    description: 'Financial support for nutritional needs of Tuberculosis patients under treatment.',
    benefit: '₹500 per month directly transferred for treatment duration',
    eligibility: 'All registered TB patients undergoing treatment in India',
    source_url: 'https://nikshay.in'
  },
  {
    external_id: 'pm-abhim',
    title: 'PM Ayushman Bharat Health Infrastructure Mission (PM-ABHIM)',
    category: 'Healthcare',
    tag: 'Critical Care',
    description: 'Fills critical gaps in health infrastructure, surveillance, and health research in urban & rural areas.',
    benefit: 'Expanded block-level health labs & critical care hospital blocks',
    eligibility: 'All citizens in rural and urban districts',
    source_url: 'https://abhim.mohfw.gov.in'
  },

  // ── 4. FOOD SECURITY & NUTRITION ───────────────────────────────────────────
  {
    external_id: 'nfsa-ration',
    title: 'National Food Security Act (NFSA) Ration',
    category: 'Food Security',
    tag: 'Subsidized Foodgrains',
    description: 'Guarantees subsidized foodgrains to rural and urban population through the Targeted Public Distribution System.',
    benefit: '5 kg foodgrains per person/month free or at highly subsidized rates',
    eligibility: 'Priority Households and Antyodaya Anna Yojana (AAY) beneficiaries',
    source_url: 'https://nfsa.gov.in'
  },
  {
    external_id: 'pm-poshan',
    title: 'PM POSHAN Scheme (Mid-Day Meal)',
    category: 'Food Security',
    tag: 'Child Nutrition',
    description: 'Provides hot cooked meals to children in primary and upper primary government schools.',
    benefit: 'Free daily nutritious meal at government & aided schools',
    eligibility: 'Schoolchildren in classes I to VIII',
    source_url: 'https://pmposhan.education.gov.in'
  },
  {
    external_id: 'poshan-abhiyaan',
    title: 'POSHAN Abhiyaan (National Nutrition Mission)',
    category: 'Food Security',
    tag: 'Malnutrition Eradication',
    description: 'Targeted reduction of stunting, undernutrition, anemia, and low birth weight in young children and women.',
    benefit: 'Supplemental nutrition, health monitoring & ICDS services',
    eligibility: 'Pregnant women, lactating mothers, adolescent girls, and children under 6',
    source_url: 'https://poshanabhiyaan.gov.in'
  },
  {
    external_id: 'onorcard',
    title: 'One Nation One Ration Card (ONORC)',
    category: 'Food Security',
    tag: 'Migrant Support',
    description: 'Allows migrant beneficiaries to retrieve their ration quota from any Fair Price Shop across the country.',
    benefit: 'Nationwide ration card portability via biometric authentication',
    eligibility: 'All existing NFSA ration cardholders',
    source_url: 'https://impds.nic.in'
  },

  // ── 5. EDUCATION & SCHOLARSHIPS ─────────────────────────────────────────────
  {
    external_id: 'pm-shri',
    title: 'PM SHRI Schools Scheme',
    category: 'Education',
    tag: 'School Development',
    description: 'Development of 14,500 exemplar schools showcasing NEP 2020 principles with modern STEM infrastructure.',
    benefit: 'Modern smart classrooms, robotics labs & experiential learning',
    eligibility: 'Students enrolled in selected PM SHRI government schools',
    source_url: 'https://pmshrischools.education.gov.in'
  },
  {
    external_id: 'pre-matric-sc',
    title: 'Pre-Matric Scholarship for SC Students',
    category: 'Education',
    tag: 'Scholarships',
    description: 'Financial assistance to SC students studying in classes 9th and 10th to minimize school dropout rates.',
    benefit: 'Annual scholarship of ₹3,500 to ₹7,000 + academic allowance',
    eligibility: 'SC students in class 9 or 10 with family income under ₹2.5 Lakhs/yr',
    source_url: 'https://scholarships.gov.in'
  },
  {
    external_id: 'post-matric-sc',
    title: 'Post-Matric Scholarship for SC Students',
    category: 'Education',
    tag: 'Higher Education',
    description: 'Supports SC students pursuing post-secondary courses to complete higher education.',
    benefit: '100% compulsory non-refundable fees reimbursement + maintenance allowance',
    eligibility: 'SC students in Class 11th through PhD with household income under ₹2.5L/yr',
    source_url: 'https://scholarships.gov.in'
  },
  {
    external_id: 'nsp-central-sector',
    title: 'Central Sector Scholarship Scheme (CSSS)',
    category: 'Education',
    tag: 'Merit Scholarship',
    description: 'Financial assistance to meritorious students from low-income families for university & college studies.',
    benefit: '₹12,000/yr for graduation & ₹20,000/yr for post-graduation',
    eligibility: 'Above 80th percentile in Class 12 board with household income under ₹4.5L/yr',
    source_url: 'https://scholarships.gov.in'
  },
  {
    external_id: 'pm-vidyalaxmi',
    title: 'PM-Vidyalaxmi Education Loan Scheme',
    category: 'Education',
    tag: 'Education Loans',
    description: 'Financial support for meritorious students admitted to top higher education institutions.',
    benefit: 'Collateral-free, guarantor-free education loans up to ₹10 Lakhs with 7.5% interest subvention',
    eligibility: 'Students admitted to top 860 NIRF-ranked higher education institutes',
    source_url: 'https://www.vidyasaarathi.co.in'
  },
  {
    external_id: 'kanyashree-prakalpa',
    title: 'Kanyashree Prakalpa (West Bengal)',
    category: 'Education',
    tag: 'Girl Education',
    description: 'Conditional cash transfer scheme to prevent early marriage and incentivize female secondary education.',
    benefit: 'Annual stipend of ₹1,000 + one-time grant of ₹25,000 at age 18',
    eligibility: 'Unmarried girls aged 13-19 enrolled in recognized schools/colleges',
    source_url: 'https://wbkanyashree.gov.in'
  },
  {
    external_id: 'pragati-scholarship',
    title: 'AICTE Pragati Scholarship for Girls',
    category: 'Education',
    tag: 'Technical Education',
    description: 'Encourages young girls to pursue technical diploma and degree courses.',
    benefit: '₹50,000 per annum for duration of degree/diploma course',
    eligibility: 'Girl students admitted to 1st year AICTE-approved degree/diploma courses',
    source_url: 'https://www.aicte-india.org'
  },

  // ── 6. SKILL DEVELOPMENT & EMPLOYMENT ──────────────────────────────────────
  {
    external_id: 'mgnrega-work',
    title: 'MGNREGA Scheme',
    category: 'Employment',
    tag: 'Rural Guarantee',
    description: 'Guarantees 100 days of wage employment per financial year to rural adult household members.',
    benefit: 'Guaranteed 100 days of wage labor work + statutory minimum wages',
    eligibility: 'Any rural adult aged 18+ willing to do unskilled manual work',
    source_url: 'https://nrega.nic.in'
  },
  {
    external_id: 'pm-vishwakarma-artisan',
    title: 'PM Vishwakarma Scheme',
    category: 'Employment',
    tag: 'Craftsmen & Artisans',
    description: 'End-to-end support for traditional artisans and craftspeople covering 18 trades.',
    benefit: '₹3 Lakhs collateral-free credit at 5% + ₹15,000 toolkit incentive + ₹500/day stipend during training',
    eligibility: 'Traditional artisans (carpenters, blacksmiths, goldsmiths, tailors, potters, etc.)',
    source_url: 'https://pmvishwakarma.gov.in'
  },
  {
    external_id: 'pm-kvpy',
    title: 'PM Kaushal Vikas Yojana (PMKVY 4.0)',
    category: 'Employment',
    tag: 'Skill Training',
    description: 'Skill certification scheme enabling youth to take up industry-relevant skill training.',
    benefit: 'Free industry skill training, certification & job placement assistance',
    eligibility: 'Indian youth school/college dropouts or unemployed (aged 15-45)',
    source_url: 'https://www.pmkvyofficial.org'
  },
  {
    external_id: 'ddu-gky',
    title: 'Deen Dayal Upadhyaya Grameen Koushalya Yojana (DDU-GKY)',
    category: 'Employment',
    tag: 'Rural Youth Skills',
    description: 'Placement-linked skill development scheme for rural poor youth.',
    benefit: 'Free residential skill training with guaranteed placement in formal sector',
    eligibility: 'Rural poor youth aged 15-35 years',
    source_url: 'https://ddugky.gov.in'
  },
  {
    external_id: 'national-apprenticeship',
    title: 'National Apprenticeship Promotion Scheme (NAPS)',
    category: 'Employment',
    tag: 'Apprenticeship',
    description: 'Promotes apprenticeship training and incentivizes employers to engage apprentices.',
    benefit: 'Stipend reimbursement up to ₹1,500/month per apprentice',
    eligibility: 'Students completing ITI, diploma, or degree courses',
    source_url: 'https://www.apprenticeshipindia.gov.in'
  },
  {
    external_id: 'prime-minister-employment-generation',
    title: 'Prime Minister Employment Generation Programme (PMEGP)',
    category: 'Employment',
    tag: 'Micro-Enterprises',
    description: 'Credit-linked subsidy scheme for setting up new micro-enterprises in non-farm sector.',
    benefit: 'Margin money subsidy of 15% to 35% on project cost up to ₹50 Lakhs',
    eligibility: 'Individuals above 18 years for setting up new manufacturing or service units',
    source_url: 'https://www.kviconline.gov.in'
  },

  // ── 7. WOMEN EMPOWERMENT & CHILD CARE ────────────────────────────────────────
  {
    external_id: 'pm-ujjwala',
    title: 'PM Ujjwala Yojana (PMUY)',
    category: 'Women',
    tag: 'Clean Fuel',
    description: 'Provides deposit-free LPG connections to women from below poverty line households.',
    benefit: 'Free LPG connection + ₹1,600 assistance + first refill and stove free',
    eligibility: 'Adult women belonging to BPL households without LPG connection',
    source_url: 'https://www.pmuy.gov.in'
  },
  {
    external_id: 'sukanya-samriddhi',
    title: 'Sukanya Samriddhi Yojana (SSY)',
    category: 'Women',
    tag: 'Girl Child Savings',
    description: 'Small deposit scheme for girl children offering attractive interest rate and tax benefits.',
    benefit: 'High interest rate (8.2% p.a.) + Section 80C tax deduction',
    eligibility: 'Parents or legal guardians of girl child below 10 years of age',
    source_url: 'https://www.indiapost.gov.in'
  },
  {
    external_id: 'pmmvy',
    title: 'PM Matru Vandana Yojana (PMMVY)',
    category: 'Women',
    tag: 'Maternity Benefit',
    description: 'Direct benefit transfer scheme providing maternity cash incentive for pregnant & lactating mothers.',
    benefit: '₹5,000 cash incentive (1st child) / ₹6,000 cash incentive (2nd child if female)',
    eligibility: 'Pregnant women and lactating mothers for first two living children',
    source_url: 'https://pmmvy.wcd.gov.in'
  },
  {
    external_id: 'subhadra-odisha',
    title: 'SUBHADRA Yojana',
    category: 'Women',
    tag: 'Women Empowerment',
    description: 'Financial independence initiative delivering direct financial transfers to women.',
    benefit: '₹10,000 direct annual transfer (total ₹50,000 over 5 years)',
    eligibility: 'Women aged 21 to 60 from eligible households',
    source_url: 'https://subhadra.odisha.gov.in'
  },
  {
    external_id: 'mahila-samman-savings',
    title: 'Mahila Samman Savings Certificate',
    category: 'Women',
    tag: 'Small Savings',
    description: 'Small savings deposit scheme dedicated exclusively to women and girl children.',
    benefit: 'Fixed interest of 7.5% p.a. compounded quarterly with partial withdrawal option',
    eligibility: 'Any woman or guardian on behalf of a minor girl child',
    source_url: 'https://www.indiapost.gov.in'
  },
  {
    external_id: 'mission-shakti',
    title: 'Mission Shakti - Self Help Groups',
    category: 'Women',
    tag: 'SHG Credit',
    description: 'Strengthens Self Help Groups (SHGs) of women through interest subvention and micro-credit.',
    benefit: 'Interest-free bank loans up to ₹5 Lakhs for women SHGs',
    eligibility: 'Registered women Self-Help Groups (SHGs)',
    source_url: 'https://nrlm.gov.in'
  },
  {
    external_id: 'lakpati-didi',
    title: 'Lakhpati Didi Scheme',
    category: 'Women',
    tag: 'Livelihood Support',
    description: 'Skilling and micro-enterprise development to enable rural women SHG members to earn ₹1 Lakh/yr.',
    benefit: 'Interest-free micro-loans, LED light making, drone piloting & tailoring training',
    eligibility: 'Members of women Self-Help Groups (SHGs) under DAY-NRLM',
    source_url: 'https://daynrlm.gov.in'
  },

  // ── 8. SENIOR CITIZENS & PENSION ─────────────────────────────────────────────
  {
    external_id: 'atal-pension-yojana',
    title: 'Atal Pension Yojana (APY)',
    category: 'Pension',
    tag: 'Unorganized Sector Pension',
    description: 'Guaranteed monthly pension for unorganized sector workers based on contribution amount.',
    benefit: 'Guaranteed monthly pension of ₹1,000 to ₹5,000 after age 60',
    eligibility: 'Indian citizens aged 18 to 40 with bank account',
    source_url: 'https://www.npscra.nsdl.co.in'
  },
  {
    external_id: 'ignoaps-pension',
    title: 'Indira Gandhi National Old Age Pension (IGNOAPS)',
    category: 'Pension',
    tag: 'Senior Pension',
    description: 'Monthly social security pension for BPL senior citizens.',
    benefit: '₹500 to ₹1,000 per month financial pension assistance',
    eligibility: 'BPL citizens aged 60 years and above',
    source_url: 'https://nsap.nic.in'
  },
  {
    external_id: 'pm-vaya-vandana',
    title: 'PM Vaya Vandana Yojana (PMVVY)',
    category: 'Pension',
    tag: 'Senior Annuity',
    description: 'Pension scheme for senior citizens offering guaranteed payout rate.',
    benefit: 'Guaranteed pension return of 7.4% p.a. payable monthly/quarterly/yearly',
    eligibility: 'Senior citizens aged 60 years and above',
    source_url: 'https://licindia.in'
  },
  {
    external_id: 'senior-citizen-savings-scheme',
    title: 'Senior Citizen Savings Scheme (SCSS)',
    category: 'Pension',
    tag: 'High Return Savings',
    description: 'Government-backed savings scheme for senior citizens providing high quarterly interest returns.',
    benefit: '8.2% p.a. interest rate paid quarterly + Tax deduction under 80C',
    eligibility: 'Individuals aged 60 years or above (55 for retired defense personnel)',
    source_url: 'https://www.indiapost.gov.in'
  },
  {
    external_id: 'ignwps-widow-pension',
    title: 'Indira Gandhi National Widow Pension (IGNWPS)',
    category: 'Pension',
    tag: 'Widow Support',
    description: 'Monthly social assistance pension to BPL widows.',
    benefit: 'Monthly cash pension transferred directly to bank account',
    eligibility: 'Widows aged 40-79 belonging to BPL households',
    source_url: 'https://nsap.nic.in'
  },

  // ── 9. BUSINESS, MSME & FINANCIAL INCLUSION ─────────────────────────────────
  {
    external_id: 'pm-mudra-yojana',
    title: 'PM MUDRA Yojana (PMMY)',
    category: 'Business',
    tag: 'Micro Loans',
    description: 'Collateral-free business loans for non-corporate, non-farm small and micro enterprises.',
    benefit: 'Collateral-free loan up to ₹10 Lakhs (Shishu: 50K, Kishore: 5L, Tarun: 10L)',
    eligibility: 'Micro-entrepreneurs, small shopkeepers, artisans, and proprietors',
    source_url: 'https://www.mudra.org.in'
  },
  {
    external_id: 'standup-india-loans',
    title: 'Stand Up India Scheme',
    category: 'Business',
    tag: 'SC/ST & Women Loans',
    description: 'Facilitates bank loans for SC/ST and women entrepreneurs for setting up greenfield units.',
    benefit: 'Bank loans between ₹10 Lakhs and ₹1 Crore',
    eligibility: 'SC/ST and/or woman entrepreneur setting up a new business',
    source_url: 'https://www.standupmitra.in'
  },
  {
    external_id: 'pm-svanidhi-vendors',
    title: 'PM SVANidhi (Street Vendors Scheme)',
    category: 'Business',
    tag: 'Street Vendor Credit',
    description: 'Special micro-credit facility for street vendors to restart working capital post pandemic.',
    benefit: 'Collateral-free working capital loan up to ₹50,000 with 7% interest subvention',
    eligibility: 'Urban street vendors possessing Vending Certificate or ID card',
    source_url: 'https://pmsvanidhi.mohua.gov.in'
  },
  {
    external_id: 'pm-jandhan-yojana',
    title: 'PM Jan Dhan Yojana (PMJDY)',
    category: 'Financial Inclusion',
    tag: 'Basic Banking',
    description: 'National mission for financial inclusion ensuring access to financial services like basic savings account, credit, insurance & pension.',
    benefit: 'Zero balance savings account + ₹2 Lakh accident insurance cover + ₹10,000 overdraft facility',
    eligibility: 'Any Indian citizen above 10 years of age without a bank account',
    source_url: 'https://pmjdy.gov.in'
  },
  {
    external_id: 'pm-suraksha-bima',
    title: 'PM Suraksha Bima Yojana (PMSBY)',
    category: 'Financial Inclusion',
    tag: 'Accident Insurance',
    description: 'Accidental death and disability insurance cover for individual bank account holders.',
    benefit: '₹2 Lakhs accidental death/total disability cover for just ₹20 per year',
    eligibility: 'Bank account holders aged 18 to 70 years',
    source_url: 'https://www.nifs.gov.in'
  },
  {
    external_id: 'pm-jeevan-jyoti',
    title: 'PM Jeevan Jyoti Bima Yojana (PMJJBY)',
    category: 'Financial Inclusion',
    tag: 'Life Insurance',
    description: 'Renewable one-year term life insurance scheme providing life cover for death due to any reason.',
    benefit: '₹2 Lakhs life insurance cover for ₹436 per year premium',
    eligibility: 'Bank account holders aged 18 to 50 years',
    source_url: 'https://www.financialservices.gov.in'
  },
  {
    external_id: 'credit-guarantee-msme',
    title: 'Credit Guarantee Scheme for Micro & Small Enterprises (CGTMSE)',
    category: 'Business',
    tag: 'MSME Credit Guarantee',
    description: 'Provides collateral-free credit facility to new and existing micro and small enterprises.',
    benefit: 'Credit guarantee cover up to ₹5 Crores for bank loans',
    eligibility: 'New and existing Micro & Small Enterprises (MSEs)',
    source_url: 'https://www.cgtmse.in'
  },
  {
    external_id: 'pm-formalisation-micro-food',
    title: 'PM Formalisation of Micro Food Processing (PMFME)',
    category: 'Business',
    tag: 'Food Processing',
    description: 'Financial, technical and business support for upgrading existing micro food processing units.',
    benefit: '35% credit-linked capital subsidy up to ₹10 Lakhs',
    eligibility: 'Micro food processing entrepreneurs, FPOs, SHGs & Cooperatives',
    source_url: 'https://pmfme.mofpi.gov.in'
  },

  // ── 10. SOCIAL JUSTICE, MINORITY & TRIBAL AFFAIRS ──────────────────────────
  {
    external_id: 'pm-ajay',
    title: 'PM Anusuchit Jaati Abhyuday Yojana (PM-AJAY)',
    category: 'Social Justice',
    tag: 'SC Welfare',
    description: 'Integrated scheme for development of SC majority villages and income generation for SC families.',
    benefit: 'Grant of up to ₹50,000 per family for income generation projects',
    eligibility: 'Scheduled Caste (SC) families living below double poverty line limit',
    source_url: 'https://pmajay.dosje.gov.in'
  },
  {
    external_id: 'van-dhan-vikas',
    title: 'PM Van Dhan Vikas Yojana',
    category: 'Social Justice',
    tag: 'Tribal Livelihood',
    description: 'Targeted tribal capacity building and value addition for Minor Forest Produce (MFP).',
    benefit: '₹15 Lakhs capital grant per Van Dhan Vikas Kendra cluster',
    eligibility: 'Tribal gatherers forming Self Help Groups',
    source_url: 'https://trifed.tribal.gov.in'
  },
  {
    external_id: 'e-shram-card',
    title: 'e-Shram Portal (Unorganized Workers)',
    category: 'Social Justice',
    tag: 'Worker Database',
    description: 'National database of unorganized workers offering e-Shram card and social security benefits integration.',
    benefit: 'Unique Universal Account Number (UAN) + ₹2 Lakhs free accidental insurance',
    eligibility: 'Unorganized sector workers aged 16-59 years',
    source_url: 'https://eshram.gov.in'
  },
  {
    external_id: 'smile-scheme',
    title: 'SMILE Scheme (Support for Marginalized Individuals)',
    category: 'Social Justice',
    tag: 'Rehabilitation',
    description: 'Comprehensive rehabilitation for welfare of transgender persons and persons engaged in begging.',
    benefit: 'Skill training, medical insurance, shelter home facility & rehabilitation grant',
    eligibility: 'Transgender persons and individuals engaged in begging',
    source_url: 'https://saimis.dosje.gov.in'
  },
  {
    external_id: 'divyangjan-swavalamban',
    title: 'Divyangjan Swavalamban Yojana',
    category: 'Social Justice',
    tag: 'Disability Support',
    description: 'Concessional credit to persons with disabilities (Divyangjan) for self-employment enterprises.',
    benefit: 'Low-interest loans up to ₹25 Lakhs at 5% to 8% interest rate',
    eligibility: 'Persons with 40% or more benchmark disability aged 18+',
    source_url: 'https://www.nhfdc.nic.in'
  },
  {
    external_id: 'assistive-aids-adip',
    title: 'ADIP Scheme for Divyangjan',
    category: 'Social Justice',
    tag: 'Assistive Devices',
    description: 'Assistance to disabled persons for purchase/fitting of durable assistive aids and appliances.',
    benefit: 'Free or subsidized tricycles, hearing aids, wheelchairs & motorized tricycles',
    eligibility: 'Disabled persons with household monthly income under ₹22,000',
    source_url: 'https://adip.alimco.in'
  },
  {
    external_id: 'nai-roshni',
    title: 'Nai Roshni (Minority Women Leadership)',
    category: 'Social Justice',
    tag: 'Minority Women',
    description: 'Leadership development training for women belonging to minority communities.',
    benefit: 'Free leadership, digital literacy & rights awareness training',
    eligibility: 'Women belonging to 6 notified minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi)',
    source_url: 'https://nairoshni-moma.gov.in'
  },
  {
    external_id: 'pm-janman',
    title: 'PM Janjati Adivasi Nyaya Maha Abhiyan (PM-JANMAN)',
    category: 'Social Justice',
    tag: 'PVTG Tribal Welfare',
    description: 'Comprehensive socio-economic development of Particularly Vulnerable Tribal Groups (PVTGs).',
    benefit: 'Pucca houses, clean water, grid electricity, mobile connectivity & healthcare units',
    eligibility: 'PVTG tribal households across 18 states and UTs',
    source_url: 'https://tribal.gov.in'
  },

  // ── 11. RENEWABLE ENERGY & ENVIRONMENT ─────────────────────────────────────
  {
    external_id: 'pm-surya-ghar',
    title: 'PM Surya Ghar: Muft Bijli Yojana',
    category: 'Energy',
    tag: 'Rooftop Solar',
    description: 'Rooftop solar installation scheme providing free electricity up to 300 units monthly for households.',
    benefit: 'Central Financial Assistance (subsidy) up to ₹78,000 for 3kW rooftop solar system',
    eligibility: 'Rooftop homeowners across India',
    source_url: 'https://pmsuryaghar.gov.in'
  },
  {
    external_id: 'pm-kusum',
    title: 'PM KUSUM Scheme',
    category: 'Energy',
    tag: 'Solar Agriculture',
    description: 'Solarization of agricultural water pumps and installation of grid-connected solar power plants on barren lands.',
    benefit: 'Up to 60% subsidy for setting up standalone solar pumps',
    eligibility: 'Individual farmers, farmer groups, cooperatives, and Panchayats',
    source_url: 'https://pmkusum.mnre.gov.in'
  },
  {
    external_id: 'fame-india-ev',
    title: 'PM E-DRIVE / FAME Scheme',
    category: 'Energy',
    tag: 'Electric Vehicles',
    description: 'Promotes rapid adoption of electric two-wheelers, three-wheelers, e-buses and EV charging infrastructure.',
    benefit: 'Direct upfront purchase subsidy on electric vehicles',
    eligibility: 'EV buyers and fleet operators purchasing eligible EV models',
    source_url: 'https://heavyindustries.gov.in'
  },
  {
    external_id: 'national-green-hydrogen',
    title: 'National Green Hydrogen Mission',
    category: 'Energy',
    tag: 'Green Energy',
    description: 'Makes India a global hub for production, usage and export of Green Hydrogen and its derivatives.',
    benefit: 'Financial incentives for electrolyser manufacturing & green hydrogen production',
    eligibility: 'Clean energy companies, startups, and industrial units',
    source_url: 'https://mnre.gov.in'
  },

  // ── 12. STATE-SPECIFIC HIGH-IMPACT SCHEMES ──────────────────────────────────
  {
    external_id: 'lakshmir-bhandar',
    title: 'Lakshmir Bhandar (West Bengal)',
    category: 'Women',
    tag: 'State Direct Transfer',
    description: 'Basic income support scheme for female heads of households in West Bengal.',
    benefit: '₹1,000/month (General category) / ₹1,200/month (SC/ST category)',
    eligibility: 'Female residents of West Bengal aged 25-60 years',
    source_url: 'https://socialsecurity.wb.gov.in'
  },
  {
    external_id: 'swasthya-sathi',
    title: 'Swasthya Sathi Scheme (West Bengal)',
    category: 'Healthcare',
    tag: 'State Health Smart Card',
    description: 'Universal health coverage smart card issued in the name of the female head of the family.',
    benefit: '₹5 Lakhs per family per year basic health coverage at secondary & tertiary hospitals',
    eligibility: 'All resident families of West Bengal without other government health cover',
    source_url: 'https://swasthyasathi.gov.in'
  },
  {
    external_id: 'duare-sarkar',
    title: 'Duare Sarkar Outreach (West Bengal)',
    category: 'Social Security',
    tag: 'Doorstep Delivery',
    description: 'Doorstep service delivery camps providing immediate enrollment for state welfare schemes.',
    benefit: 'On-the-spot scheme registration & document processing',
    eligibility: 'All citizens of West Bengal',
    source_url: 'https://ds.wb.gov.in'
  },
  {
    external_id: 'ladli-behna',
    title: 'Chief Minister Ladli Behna Yojana (MP)',
    category: 'Women',
    tag: 'State Cash Transfer',
    description: 'Direct monthly financial support to empower women of Madhya Pradesh.',
    benefit: '₹1,250 credited directly to bank account every month',
    eligibility: 'Married women aged 21-60 residing in Madhya Pradesh',
    source_url: 'https://cmladlibehna.mp.gov.in'
  },
  {
    external_id: 'gruha-lakshmi-karnataka',
    title: 'Gruha Lakshmi Scheme (Karnataka)',
    category: 'Women',
    tag: 'State Cash Transfer',
    description: 'Financial assistance to female house owners/heads of family in Karnataka.',
    benefit: '₹2,000 per month transferred directly to female head of household',
    eligibility: 'Female head of household listed on Antyodaya, BPL or APL cards in Karnataka',
    source_url: 'https://sevasindhuservices.karnataka.gov.in'
  },
  {
    external_id: 'annabhagya-karnataka',
    title: 'Anna Bhagya Scheme (Karnataka)',
    category: 'Food Security',
    tag: 'Free Rice Support',
    description: 'Provides free foodgrains to BPL households in Karnataka.',
    benefit: '10 kg free foodgrain per person per month (or direct cash equivalent)',
    eligibility: 'BPL and Antyodaya cardholders in Karnataka',
    source_url: 'https://ahr.karnataka.gov.in'
  },
  {
    external_id: 'rythu-bandhu-telangana',
    title: 'Rythu Bandhu / Rythu Bharosa (Telangana)',
    category: 'Agriculture',
    tag: 'Farmer Investment',
    description: 'Agricultural investment support scheme providing direct cash assistance per acre.',
    benefit: '₹10,000 per acre per year transferred directly to farmers',
    eligibility: 'All land-owning farmers in Telangana',
    source_url: 'https://rythubandhu.telangana.gov.in'
  },
  {
    external_id: 'amma-vodi-andhra',
    title: 'Jagananna Amma Vodi (Andhra Pradesh)',
    category: 'Education',
    tag: 'Maternal Education Support',
    description: 'Financial support to poor mothers to educate their children from Class 1 to 12.',
    benefit: '₹15,000 annual financial assistance deposited in mother’s bank account',
    eligibility: 'Needy mothers sending children to recognized schools in Andhra Pradesh',
    source_url: 'https://jaganannamavodi.ap.gov.in'
  },
  {
    external_id: 'kalia-odisha',
    title: 'KALIA Scheme (Odisha)',
    category: 'Agriculture',
    tag: 'Farmer Livelihood',
    description: 'Krushak Assistance for Livelihood and Income Augmentation for small farmers & landless agricultural laborers.',
    benefit: '₹10,000 per year per farm family + ₹12,500 livelihood assistance for landless',
    eligibility: 'Small and marginal farmers, sharecroppers, and landless agri laborers in Odisha',
    source_url: 'https://kalia.odisha.gov.in'
  },
  {
    external_id: 'kanyashree-k3',
    title: 'Kanyashree K3 Post-Graduate Scholarship',
    category: 'Education',
    tag: 'PG Scholarship',
    description: 'Higher study scholarship for girl students pursuing post-graduation in science, arts, or commerce.',
    benefit: '₹2,000 to ₹2,500 per month for university post-graduate studies',
    eligibility: 'Female PG students in West Bengal with minimum 45% marks in Graduation',
    source_url: 'https://svmcm.wbhed.gov.in'
  },
  {
    external_id: 'student-credit-card-wb',
    title: 'West Bengal Student Credit Card Scheme',
    category: 'Education',
    tag: 'Education Credit Card',
    description: 'Collateral-free, soft education loan facility up to ₹10 Lakhs at 4% simple interest.',
    benefit: 'Education loan up to ₹10 Lakhs with 15-year repayment window',
    eligibility: 'West Bengal students pursuing Class 10+ up to Doctoral research',
    source_url: 'https://wbscc.wb.gov.in'
  },
  {
    external_id: 'taruner-swapno-wb',
    title: 'Taruner Swapno (Tab/Smartphone Scheme)',
    category: 'Education',
    tag: 'Digital Learning',
    description: 'Financial grant for Class 11 and 12 students to purchase tablets or smartphones for digital learning.',
    benefit: 'One-time ₹10,000 direct bank grant',
    eligibility: 'Class 11 & 12 students in West Bengal government schools',
    source_url: 'https://banglarshiksha.gov.in'
  },
  {
    external_id: 'yuvashree-wb',
    title: 'Yuvashree Unemployment Assistance (West Bengal)',
    category: 'Employment',
    tag: 'Youth Support',
    description: 'Financial assistance for job-seeking registered unemployed youth.',
    benefit: 'Monthly stipend of ₹1,500 to support skill development & job hunt',
    eligibility: 'Job-seeking registered unemployed youth in West Bengal aged 18-45',
    source_url: 'https://employmentbankwb.gov.in'
  },

  // ── 13. ADDITIONAL NATIONAL WELFARE INITIATIVES ─────────────────────────────
  {
    external_id: 'pm-mitra',
    title: 'PM MITRA Textile Parks Scheme',
    category: 'Business',
    tag: 'Textile Industry',
    description: 'Sets up 7 mega integrated textile region and apparel parks across India.',
    benefit: 'Development capital support up to ₹500 Crores per park',
    eligibility: 'Textile manufacturers, exporters, and industrial developers',
    source_url: 'https://texmin.nic.in'
  },
  {
    external_id: 'pli-scheme-electronics',
    title: 'Production Linked Incentive (PLI) Scheme',
    category: 'Business',
    tag: 'Manufacturing Incentive',
    description: 'Incentivizes domestic manufacturing of mobile phones, electronic components, IT hardware & solar modules.',
    benefit: me => '4% to 6% incentive on incremental sales manufactured in India',
    eligibility: 'Registered manufacturing companies in India',
    source_url: 'https://www.meity.gov.in'
  },
  {
    external_id: 'national-career-service',
    title: 'National Career Service (NCS) Portal',
    category: 'Employment',
    tag: 'Job Matching',
    description: 'One-stop portal for job matching, career counseling, vocational guidance, and skill courses.',
    benefit: 'Free job search, career guidance & direct employer contacts',
    eligibility: 'All jobseekers and employers across India',
    source_url: 'https://www.ncs.gov.in'
  },
  {
    external_id: 'rashtriya-vayosri-yojana',
    title: 'Rashtriya Vayoshri Yojana (RVY)',
    category: 'Pension',
    tag: 'Senior Assistive Devices',
    description: 'Provides physical aids and assisted-living devices for BPL senior citizens.',
    benefit: 'Free spectacles, walking sticks, hearing aids, dentures & wheelchairs',
    eligibility: 'BPL senior citizens aged 60 years or above',
    source_url: 'https://socialjustice.gov.in'
  },
  {
    external_id: 'sahakar-mitra',
    title: 'Sahakar Mitra: Scheme on Internship Program',
    category: 'Employment',
    tag: 'Cooperative Internship',
    description: 'Provides paid practical learning experience in cooperative sector to young professionals.',
    benefit: 'Monthly financial stipend of ₹10,000 for 4 months',
    eligibility: 'Graduates/Post-graduates in Agriculture, IT, MBA, Agri-business',
    source_url: 'https://ncdc.gov.in'
  },
  {
    external_id: 'saksham-anganwadi',
    title: 'Saksham Anganwadi and Poshan 2.0',
    category: 'Food Security',
    tag: 'Early Childhood Care',
    description: 'Upgraded Anganwadi centers equipped with smart LED screens, water purifiers, and early childhood education tools.',
    benefit: 'Early childhood education, health check-ups & supplementary nutrition',
    eligibility: 'Children under 6 years, pregnant women & lactating mothers',
    source_url: 'https://wcd.nic.in'
  },
  {
    external_id: 'pm-devine',
    title: 'PM-DevINE (Development Initiative for North East)',
    category: 'Housing',
    tag: 'North-East Infrastructure',
    description: 'Funds infrastructure and social development projects in North Eastern Region.',
    benefit: '100% central funding for infrastructure & livelihood projects',
    eligibility: 'State governments & community institutions in North Eastern States',
    source_url: 'https://mdoner.gov.in'
  },
  {
    external_id: 'pm-gati-shakti',
    title: 'PM Gati Shakti National Master Plan',
    category: 'Housing',
    tag: 'Multi-Modal Connectivity',
    description: 'Digital platform bringing 16 ministries together for integrated planning of multi-modal infrastructure.',
    benefit: 'Faster project clearances, synchronized road/rail/port connectivity',
    eligibility: 'Infrastructure developers, logistics operators, and local authorities',
    source_url: 'https://pmgatishakti.gov.in'
  },
  {
    external_id: 'pm-shram-yogi-mandhan',
    title: 'PM Shram Yogi Maan-dhan (PM-SYM)',
    category: 'Pension',
    tag: 'Unorganized Worker Pension',
    description: 'Voluntary pension scheme for unorganized workers like street vendors, rickshaw pullers, domestic workers.',
    benefit: 'Guaranteed minimum monthly pension of ₹3,000 after age 60',
    eligibility: 'Unorganized workers aged 18-40 with monthly income under ₹15,000',
    source_url: 'https://maandhan.in'
  },
  {
    external_id: 'pm-laghu-vyapari-mandhan',
    title: 'National Pension Scheme for Traders and Self-Employed (PM-LVM)',
    category: 'Pension',
    tag: 'Traders Pension',
    description: 'Voluntary pension scheme for shopkeepers, retail traders and self-employed individuals.',
    benefit: 'Assured minimum monthly pension of ₹3,000 after age 60',
    eligibility: 'Shopkeepers & self-employed individuals aged 18-40 with annual turnover under ₹1.5 Crores',
    source_url: 'https://maandhan.in'
  },
  {
    external_id: 'pm-kisan-maan-dhan',
    title: 'PM Kisan Maan-Dhan Yojana (PM-KMDY)',
    category: 'Pension',
    tag: 'Farmers Pension',
    description: 'Old age pension scheme for small and marginal farmers across India.',
    benefit: 'Fixed monthly pension of ₹3,000 on attaining 60 years of age',
    eligibility: 'Small & marginal farmers aged 18 to 40 with up to 2 hectares cultivable land',
    source_url: 'https://pmkmy.gov.in'
  },

  // Additional central welfare programs to reach 100+ complete set
  {
    external_id: 'samagra-shiksha',
    title: 'Samagra Shiksha Abhiyan',
    category: 'Education',
    tag: 'School Education',
    description: 'Overarching program for school education sector extending from pre-school to class 12.',
    benefit: 'Free textbooks, uniforms, ICT labs & vocational education support',
    eligibility: 'Students in government & government-aided schools',
    source_url: 'https://samagra.education.gov.in'
  },
  {
    external_id: 'rashtriya-uchchatar-shiksha',
    title: 'PM-USHA (Rashtriya Uchchatar Shiksha Abhiyan)',
    category: 'Education',
    tag: 'Higher Education Infrastructure',
    description: 'Improves quality of state higher educational institutions through strategic central funding.',
    benefit: 'Grants of up to ₹100 Crores per state university for research & infrastructure',
    eligibility: 'State universities and colleges across India',
    source_url: 'https://pmusha.education.gov.in'
  },
  {
    external_id: 'beti-bachao-beti-padhao',
    title: 'Beti Bachao Beti Padhao (BBBP)',
    category: 'Women',
    tag: 'Gender Equality',
    description: 'Addresses declining Child Sex Ratio and promotes female education and empowerment.',
    benefit: 'Community awareness, girl child education advocacy & safety tracking',
    eligibility: 'Girl children and families nationwide',
    source_url: 'https://wcd.nic.in/bbbp-schemes'
  },
  {
    external_id: 'one-stop-centre',
    title: 'One Stop Centre (Sakhi Scheme)',
    category: 'Women',
    tag: 'Women Safety',
    description: 'Integrated support and assistance under one roof to women affected by violence.',
    benefit: 'Free medical, legal, psychological & temporary shelter assistance',
    eligibility: 'Any woman facing violence or distress in private or public spaces',
    source_url: 'https://wcd.nic.in/schemes/one-stop-centre-scheme'
  },
  {
    external_id: 'universal-immunization',
    title: 'Mission Indradhanush (Universal Immunization)',
    category: 'Healthcare',
    tag: 'Child Vaccination',
    description: 'Ensures full immunization of unvaccinated or partially vaccinated children and pregnant women.',
    benefit: 'Free vaccination against 12 life-threatening diseases',
    eligibility: 'Children under 2 years of age and pregnant women',
    source_url: 'https://www.mohfw.gov.in'
  },
  {
    external_id: 'national-health-mission',
    title: 'National Health Mission (NHM / NRHM)',
    category: 'Healthcare',
    tag: 'Primary Healthcare',
    description: 'Strengthens rural and urban primary healthcare delivery through ASHA workers & PHCs.',
    benefit: 'Free maternal delivery, essential medicines & emergency ambulance transport (102/108)',
    eligibility: 'All citizens, specifically pregnant women & infants in rural areas',
    source_url: 'https://nhm.gov.in'
  },
  {
    external_id: 'national-mental-health',
    title: 'Tele-MANAS (National Mental Health Helpline)',
    category: 'Healthcare',
    tag: 'Mental Health',
    description: '24/7 free tele-mental health service providing counseling and psychiatric support.',
    benefit: 'Free confidential 24/7 tele-counseling (Toll Free 14416 / 1800-891-4416)',
    eligibility: 'All citizens in need of mental health support',
    source_url: 'https://telemanas.mohfw.gov.in'
  },
  {
    external_id: 'pm-national-dialysis',
    title: 'PM National Dialysis Programme',
    category: 'Healthcare',
    tag: 'Dialysis Cover',
    description: 'Provides free hemodialysis services to poor patients at district hospitals.',
    benefit: 'Free dialysis sessions at empanelled district health centers',
    eligibility: 'BPL patients suffering from end-stage renal disease',
    source_url: 'https://nhm.gov.in'
  },
  {
    external_id: 'national-vector-borne-control',
    title: 'National Vector Borne Disease Control',
    category: 'Healthcare',
    tag: 'Malaria & Dengue Control',
    description: 'Prevention and control of vector-borne diseases like Malaria, Dengue, Chikungunya, and Kala-Azar.',
    benefit: 'Free diagnostic testing, bed-nets & free medical treatment',
    eligibility: 'All citizens nationwide',
    source_url: 'https://nvbdcp.gov.in'
  },
  {
    external_id: 'national-blindness-control',
    title: 'National Programme for Control of Blindness',
    category: 'Healthcare',
    tag: 'Eye Care',
    description: 'Reduces prevalence of blindness through free cataract surgeries and optical distribution.',
    benefit: 'Free cataract surgery, intraocular lens (IOL) implant & free spectacles for school students',
    eligibility: 'Senior citizens and school students with visual impairment',
    source_url: 'https://npcbvi.mohfw.gov.in'
  },
  {
    external_id: 'pm-street-vendor-atmanirbhar',
    title: 'PM SVANidhi Loan 3rd Tranche',
    category: 'Business',
    tag: 'Micro-Credit Booster',
    description: 'Enhanced credit limit for street vendors demonstrating timely loan repayments.',
    benefit: 'Enhanced working capital loan up to ₹50,000 with digital transaction cashback',
    eligibility: 'Street vendors who successfully repaid 1st and 2nd loan tranches',
    source_url: 'https://pmsvanidhi.mohua.gov.in'
  },
  {
    external_id: 'aspiration-districts-program',
    title: 'Aspirational Districts Programme',
    category: 'Social Security',
    tag: 'District Transformation',
    description: 'Transforms 112 most under-developed districts across health, education, agriculture & infrastructure.',
    benefit: 'Accelerated development of basic amenities and health services',
    eligibility: 'Residents of 112 designated Aspirational Districts in India',
    source_url: 'https://www.niti.gov.in/aspirational-districts-programme'
  },
  {
    external_id: 'aspiration-blocks-program',
    title: 'Aspirational Blocks Programme',
    category: 'Social Security',
    tag: 'Block Transformation',
    description: 'Focuses on improving saturation of essential government services across 500 backward blocks.',
    benefit: 'Targeted block-level health centers, schools & water infrastructure',
    eligibility: 'Residents of 500 designated Aspirational Blocks',
    source_url: 'https://www.niti.gov.in'
  },
  {
    external_id: 'sampoorna-taiyari',
    title: 'Sampoornata Abhiyaan (Key Indicator Saturation)',
    category: 'Social Security',
    tag: '100% Saturation',
    description: 'Campaign to achieve 100% saturation of 6 key development indicators in aspirational blocks.',
    benefit: '100% coverage of supplementary nutrition, soil cards & Diabetes/BP screening',
    eligibility: 'Residents in target aspirational blocks',
    source_url: 'https://niti.gov.in'
  },
  {
    external_id: 'digital-india-land-records',
    title: 'Digital India Land Records Modernization (DILRMP)',
    category: 'Housing',
    tag: 'Digital Land Records',
    description: 'Digitization of land records, computerization of land registration & survey maps.',
    benefit: 'Online viewable, tamper-proof digital land title ownership documents',
    eligibility: 'Agricultural and residential land owners across India',
    source_url: 'https://dilrmp.gov.in'
  },
  {
    external_id: 'pm-gram-sadak',
    title: 'PM Gram Sadak Yojana (PMGSY III)',
    category: 'Housing',
    tag: 'Rural Roads',
    description: 'Provides all-weather road connectivity to unconnected rural habitations and links to markets & hospitals.',
    benefit: 'All-weather paved rural roads connecting villages to mandis & schools',
    eligibility: 'Rural communities in eligible unconnected habitations',
    source_url: 'https://pmgsy.nic.in'
  },
  {
    external_id: 'national-clean-air-programme',
    title: 'National Clean Air Programme (NCAP)',
    category: 'Energy',
    tag: 'Air Quality',
    description: 'Targeted 20-40% reduction in particulate matter concentration across 131 non-attainment cities.',
    benefit: 'Electric buses, mechanical street sweepers & air quality monitoring',
    eligibility: 'Residents of 131 targeted non-attainment cities',
    source_url: 'https://ncap.moef.gov.in'
  },
  {
    external_id: 'namami-gange',
    title: 'Namami Gange Programme',
    category: 'Energy',
    tag: 'River Conservation',
    description: 'Integrated conservation mission to accomplish effective abatement of pollution and rejuvenation of River Ganga.',
    benefit: 'Sewage treatment plants, riverfront development & bio-remediation',
    eligibility: 'Communities along River Ganga basin',
    source_url: 'https://nmcg.nic.in'
  },
  {
    external_id: 'pm-pranam',
    title: 'PM-PRANAM (Alternative Fertilizers)',
    category: 'Agriculture',
    tag: 'Fertilizer Balance',
    description: 'Incentivizes states to promote alternative fertilizers and balanced use of chemical fertilizers.',
    benefit: '50% central subsidy grant saved passed on to states for organic assets',
    eligibility: 'Farmers adopting bio-fertilizers and organic inputs',
    source_url: 'https://fert.nic.in'
  },
  {
    external_id: 'gobardhan-scheme',
    title: 'GOBARdhan Scheme (Galvanizing Organic Bio-Agro)',
    category: 'Energy',
    tag: 'Biogas & Waste to Energy',
    description: 'Converts cattle dung and organic waste into bio-gas and Compressed Bio-Gas (CBG).',
    benefit: 'Financial assistance up to ₹50 Lakhs per district for CBG plants',
    eligibility: 'Farmers, dairy owners, Gram Panchayats & entrepreneurs',
    source_url: 'https://gobardhan.co.in'
  },
  {
    external_id: 'national-bamboo-mission',
    title: 'National Bamboo Mission',
    category: 'Agriculture',
    tag: 'Bamboo Cultivation',
    description: 'Promotes holistic growth of bamboo sector from plantation to processing and marketing.',
    benefit: '50% financial assistance for bamboo plantation & processing units',
    eligibility: 'Farmers, artisans, and bamboo entrepreneurs',
    source_url: 'https://bamboo.nic.in'
  },
  {
    external_id: 'sub-mission-agri-mechanization',
    title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    category: 'Agriculture',
    tag: 'Farm Equipment Subsidy',
    description: 'Promotes farm mechanization among small & marginal farmers through custom hiring centers.',
    benefit: '40% to 80% subsidy on tractors, harvesters, seed drills & drones',
    eligibility: 'Farmers, SHGs, FPOs & Custom Hiring Centers',
    source_url: 'https://agrimachinery.nic.in'
  },
  {
    external_id: 'kisan-drone-scheme',
    title: 'Kisan Drone Scheme',
    category: 'Agriculture',
    tag: 'Drone Technology',
    description: 'Promotes drone technology for crop assessment, land records, and spraying of pesticides/nutrients.',
    benefit: '50% to 100% grant for purchasing agricultural drones',
    eligibility: 'ICAR institutes, Krishi Vigyan Kendras, FPOs, and custom hiring centers',
    source_url: 'https://agricoop.nic.in'
  },
  {
    external_id: 'operation-greens',
    title: 'Operation Greens (TOP to TOTAL)',
    category: 'Agriculture',
    tag: 'Perishable Food Supply',
    description: 'Stabilizes supply of Tomato, Onion, Potato (TOP) and all fruits/vegetables without price volatility.',
    benefit: '50% freight and storage subsidy for eligible agri-transporters',
    eligibility: 'Food processors, FPOs, agri-logistics operators',
    source_url: 'https://mofpi.gov.in'
  },
  {
    external_id: 'pm-kisan-sampada',
    title: 'PM Kisan SAMPADA Yojana',
    category: 'Agriculture',
    tag: 'Mega Food Parks',
    description: 'Creation of modern infrastructure for food processing and reduction of agricultural wastage.',
    benefit: 'Capital grant up to ₹50 Crores for Mega Food Parks & cold chains',
    eligibility: 'Agri-business firms, food processors & cooperatives',
    source_url: 'https://mofpi.gov.in/ksy'
  },
  {
    external_id: 'deendayal-antodaya-nrlm',
    title: 'Deendayal Antyodaya Yojana - NRLM',
    category: 'Employment',
    tag: 'Rural Self-Employment',
    description: 'Mobilizes poor rural households into Self Help Groups (SHGs) and provides revolving funds.',
    benefit: 'Revolving fund of ₹20,000 + Community Investment Fund up to ₹2.5 Lakhs per SHG',
    eligibility: 'Rural poor women households listed under SECC',
    source_url: 'https://nrlm.gov.in'
  },
  {
    external_id: 'nulm-urban-livelihood',
    title: 'DAY-NULM (Urban Livelihoods Mission)',
    category: 'Employment',
    tag: 'Urban Poverty Alleviation',
    description: 'Reduces urban poverty through self-employment micro-enterprises and skill training.',
    benefit: 'Interest subvention on micro-enterprise loans up to ₹2 Lakhs (individual) / ₹10 Lakhs (group)',
    eligibility: 'Urban poor, street vendors, and urban homeless',
    source_url: 'https://nulm.gov.in'
  },
  {
    external_id: 'pradhan-mantri-kaushal-kendra',
    title: 'Pradhan Mantri Kaushal Kendra (PMKK)',
    category: 'Employment',
    tag: 'Model Skill Centers',
    description: 'State-of-the-art model training centers established in every district of India.',
    benefit: 'Free high-tech skill training in robotics, CNC, solar technology & AI',
    eligibility: 'Unemployed youth seeking formal industry skill credentials',
    source_url: 'https://nsdcindia.org'
  },
  {
    external_id: 'national-means-cum-merit',
    title: 'National Means-cum-Merit Scholarship (NMMSS)',
    category: 'Education',
    tag: 'Middle School Scholarship',
    description: 'Awards scholarships to meritorious students of economically weaker sections to arrest dropout at Class 8.',
    benefit: '₹12,000 per annum (₹1,000 per month) from Class 9 to Class 12',
    eligibility: 'Students studying in Class 8 in government schools with parent income under ₹3.5L/yr',
    source_url: 'https://scholarships.gov.in'
  },
  {
    external_id: 'scholarship-top-class-education-sc',
    title: 'Top Class Education Scheme for SC Students',
    category: 'Education',
    tag: 'Elite College Education',
    description: 'Promotes quality education among SC students by funding studies in top notified institutes (IITs, IIMs, NITs).',
    benefit: 'Full tuition fee reimbursement + ₹86,000 living allowance + laptop allowance',
    eligibility: 'SC students securing admission in 266 notified top national institutes',
    source_url: 'https://scholarships.gov.in'
  },
  {
    external_id: 'dr-ambedkar-scheme-interest-subvention',
    title: 'Dr. Ambedkar Central Sector Scheme of Interest Subsidy',
    category: 'Education',
    tag: 'Overseas Education',
    description: 'Interest subsidy on educational loans for overseas studies for OBC and EBC students.',
    benefit: '100% interest subvention during moratorium period on overseas education loans',
    eligibility: 'OBC/EBC students pursuing Master’s or M.Phil/PhD abroad',
    source_url: 'https://socialjustice.gov.in'
  },
  {
    external_id: 'pm-yasasvi-scholarship',
    title: 'PM YASASVI Scholarship Scheme',
    category: 'Education',
    tag: 'OBC & EBC Scholarship',
    description: 'PM Young Achievers Scholarship Award Scheme for Vibrant India for OBC, EBC and DNT students.',
    benefit: '₹75,000/yr (Class 9-10) and ₹1,25,000/yr (Class 11-12) for top school education',
    eligibility: 'OBC/EBC/DNT students studying in top identified schools with family income under ₹2.5L/yr',
    source_url: 'https://yet.nta.ac.in'
  },
  {
    external_id: 'kishori-shakti-yojana',
    title: 'Kishori Shakti Yojana',
    category: 'Women',
    tag: 'Adolescent Nutrition',
    description: 'Improves nutritional and health status of adolescent girls aged 11 to 18 years.',
    benefit: 'Iron & Folic Acid tablets, health checkups & vocational skill training',
    eligibility: 'Adolescent girls aged 11-18 years through Anganwadi centers',
    source_url: 'https://wcd.nic.in'
  },
  {
    external_id: 'working-women-hostel',
    title: 'Sakhi Niwas (Working Women Hostel)',
    category: 'Women',
    tag: 'Safe Accommodation',
    description: 'Provides safe and affordable hostel accommodation for working women in urban centers.',
    benefit: 'Safe subsidized lodging with daycare facility for children',
    eligibility: 'Working women earning up to ₹50,000/month (metro) / ₹35,000/month (non-metro)',
    source_url: 'https://wcd.nic.in'
  },
  {
    external_id: 'national-creche-scheme',
    title: 'Palna Scheme (National Creche Scheme)',
    category: 'Women',
    tag: 'Child Creche',
    description: 'Provides day care facilities for children (6 months to 6 years) of working mothers.',
    benefit: 'Free day care, sleeping facilities, supplementary nutrition & immunization',
    eligibility: 'Children of low-income working women employed for at least 15 days a month',
    source_url: 'https://wcd.nic.in'
  },
  {
    external_id: 'pm-mitra-textile-park',
    title: 'PM MITRA Mega Integrated Textile Region',
    category: 'Business',
    tag: 'Textiles',
    description: 'Plug and play industrial infrastructure for cutting-edge textile manufacturing.',
    benefit: 'Integrated 1000+ acre industrial parks with common effluent treatment & zero liquid discharge',
    eligibility: 'Textile manufacturing companies and garment exporters',
    source_url: 'https://texmin.nic.in'
  },
  {
    external_id: 'champions-portal-msme',
    title: 'CHAMPIONS Portal for MSME',
    category: 'Business',
    tag: 'Grievance & Scaling',
    description: 'Unified single-window grievance redressal and business guidance portal for micro enterprises.',
    benefit: 'Fast-track resolving of MSME finance, tech upgrade & tender issues',
    eligibility: 'All registered MSMEs in India',
    source_url: 'https://champions.gov.in'
  },
  {
    external_id: 'udyam-registration-portal',
    title: 'Udyam Registration Portal',
    category: 'Business',
    tag: 'MSME Registration',
    description: 'Paperless, free digital registration portal for MSMEs to access priority sector lending.',
    benefit: 'Official Udyam Certificate granting access to government tenders & interest subsidies',
    eligibility: 'Any enterprise fulfilling MSME investment & turnover criteria',
    source_url: 'https://udyamregistration.gov.in'
  },
  {
    external_id: 'treads-platform-msme',
    title: 'TReDS Platform (Trade Receivables Discounting)',
    category: 'Business',
    tag: 'Invoice Discounting',
    description: 'Electronic platform for facilitating discounting of trade receivables of MSMEs from corporate buyers.',
    benefit: 'Collateral-free collateralized cash flow against unpaid invoices within 48 hours',
    eligibility: 'Registered MSME suppliers selling goods to corporates or PSUs',
    source_url: 'https://www.rbi.org.in'
  },
  {
    external_id: 'pm-devine-northeast',
    title: 'PM-DevINE (Prime Minister Development Initiative for North-East)',
    category: 'Social Security',
    tag: 'North-East Focus',
    description: 'Funds infrastructure projects and social development initiatives in North Eastern states.',
    benefit: 'Grant funding for roads, healthcare centers & youth livelihood hubs',
    eligibility: 'Community groups, state departments & youth in North Eastern states',
    source_url: 'https://mdoner.gov.in'
  },
  {
    external_id: 'special-central-assistance-tss',
    title: 'Special Central Assistance to Tribal Sub-Scheme (SCA to TSS)',
    category: 'Social Justice',
    tag: 'Tribal Sub-Plan',
    description: 'Fills critical gaps in tribal infrastructure, healthcare, education and agricultural technology.',
    benefit: '100% central grant assistance for tribal village infrastructure',
    eligibility: 'ST population in scheduled and tribal majority areas',
    source_url: 'https://tribal.gov.in'
  },
  {
    external_id: 'pradhan-mantri-jan-jatiya-vikas',
    title: 'Pradhan Mantri Janjatiya Vikas Mission (PMJVM)',
    category: 'Social Justice',
    tag: 'Tribal Enterprise',
    description: 'Enhances tribal income through minor forest produce gatherers and tribal artisan enterprises.',
    benefit: 'Value addition centers, brand marketing support & MSP for minor forest produce',
    eligibility: 'ST forest gatherers, artisans, and tribal cooperatives',
    source_url: 'https://trifed.tribal.gov.in'
  },
  {
    external_id: 'national-fellowship-st',
    title: 'National Fellowship for ST Students',
    category: 'Education',
    tag: 'Higher Research',
    description: 'Financial assistance to ST students for pursuing M.Phil and PhD degrees in Indian universities.',
    benefit: 'Fellowship stipend of ₹31,000 to ₹35,000 per month + contingency allowance',
    eligibility: 'ST students qualified in NET/GATE and admitted to M.Phil/PhD courses',
    source_url: 'https://tribal.gov.in'
  },
  {
    external_id: 'pre-matric-scholarship-minorities',
    title: 'Pre-Matric Scholarship for Minorities',
    category: 'Social Justice',
    tag: 'Minority Scholarship',
    description: 'Encourages minority parents to send children to school and reduces dropout.',
    benefit: 'Admission & tuition fee + maintenance allowance',
    eligibility: 'Minority students in Class 1 to 10 with household income under ₹1 Lakh/yr',
    source_url: 'https://scholarships.gov.in'
  },
  {
    external_id: 'post-matric-scholarship-minorities',
    title: 'Post-Matric Scholarship for Minorities',
    category: 'Social Justice',
    tag: 'Minority Higher Studies',
    description: 'Supports higher education of students belonging to minority communities.',
    benefit: 'Full course fee reimbursement + monthly maintenance allowance',
    eligibility: 'Minority students from Class 11th to PhD with family income under ₹2 Lakhs/yr',
    source_url: 'https://scholarships.gov.in'
  },
  {
    external_id: 'begum-hazrat-mahal-scholarship',
    title: 'Begum Hazrat Mahal National Scholarship',
    category: 'Education',
    tag: 'Minority Girls Scholarship',
    description: 'Scholarship for meritorious girl students belonging to minority communities.',
    benefit: '₹5,000/yr (Class 9-10) and ₹6,000/yr (Class 11-12) credited to bank account',
    eligibility: 'Minority girl students with at least 50% marks and household income under ₹2L/yr',
    source_url: 'https://scholarships.gov.in'
  },
  {
    external_id: 'padho-pardesh-interest-subsidy',
    title: 'Padho Pardesh Overseas Loan Interest Subsidy',
    category: 'Education',
    tag: 'Overseas Study Subsidy',
    description: 'Interest subsidy on educational loans for overseas studies for minority community students.',
    benefit: '100% interest subvention during course & moratorium period',
    eligibility: 'Meritorious minority students pursuing Master’s/M.Phil/PhD abroad',
    source_url: 'https://minorityaffairs.gov.in'
  },
  {
    external_id: 'mukhya-mantri-abhyudaya-up',
    title: 'Mukhya Mantri Abhyudaya Yojana (UP)',
    category: 'Education',
    tag: 'Free Coaching',
    description: 'Free competitive examination coaching for IAS, IPS, NEET, JEE & NDA aspirants.',
    benefit: 'Free offline & online coaching by IAS/IPS officers + free tablet for study',
    eligibility: 'Economically weak competitive exam aspirants residing in Uttar Pradesh',
    source_url: 'http://abhyuday.up.gov.in'
  },
  {
    external_id: 'kanya-sumangala-up',
    title: 'Mukhya Mantri Kanya Sumangala Yojana (UP)',
    category: 'Women',
    tag: 'Girl Child Direct Transfer',
    description: 'Phased cash assistance delivered at birth, vaccination, school admission, and graduation.',
    benefit: '₹25,000 total grant delivered across 6 developmental milestones',
    eligibility: 'Families residing in UP with maximum 2 daughters and annual income under ₹3 Lakhs',
    source_url: 'https://mksy.up.gov.in'
  },
  {
    external_id: 'kalyana-lakshmi-telangana',
    title: 'Kalyana Lakshmi / Shaadi Mubarak (Telangana)',
    category: 'Women',
    tag: 'Marriage Financial Support',
    description: 'Financial assistance for marriage of brides from SC/ST/BC/EBC/Minority families.',
    benefit: 'One-time cash financial assistance of ₹1,001,116 deposited at marriage',
    eligibility: 'Unmarried girls aged 18+ from low-income families residing in Telangana',
    source_url: 'https://telanganaepass.cgg.gov.in'
  },
  {
    external_id: 'amrit-bharat-station',
    title: 'Amrit Bharat Station Scheme',
    category: 'Housing',
    tag: 'Railway Station Modernization',
    description: 'Modernization and redevelopment of 1,300+ railway stations with eco-friendly amenities.',
    benefit: 'Modern waiting halls, free Wi-Fi, executive lounges & Divyangjan access',
    eligibility: 'All railway passengers across India',
    source_url: 'https://indianrailways.gov.in'
  },
  {
    external_id: 'bharatnet-phase-3',
    title: 'BharatNet Project (Phase 3)',
    category: 'Housing',
    tag: 'Gram Panchayat Broadband',
    description: 'Connects all 2.5 Lakh Gram Panchayats with high-speed optical fiber broadband network.',
    benefit: 'High-speed 100 Mbps fiber internet connection at rural Gram Panchayats',
    eligibility: 'Rural citizens, schools & health centers in Gram Panchayats',
    source_url: 'https://bbnl.nic.in'
  }
];
