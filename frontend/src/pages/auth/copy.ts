/* ── Trilingual interface copy for the SevaNest auth page (UI only) ────────
   Every string on the screen is driven by this dictionary: switching language
   re-speaks the entire page, brand panel included. Language chips render in
   this order (product decision): English first, then Bengali, then Hindi. */

export type Lang = 'bn' | 'hi' | 'en'
export type Role = 'citizen' | 'officer'
export type Mode = 'signin' | 'signup'

export interface AuthCopy {
  langLabel: string
  roleCitizen: string
  roleOfficer: string
  brandEyebrow: string
  brandTitle: string
  brandSub: string
  trust: string[]
  insideTitle: string
  insideHint: string
  stats: { value: string; label: string }[]
  citizenHeading: { signin: string; signup: string }
  citizenSub: { signin: string; signup: string }
  nameLabel: string
  namePlaceholder: string
  mobileLabel: string
  mobilePlaceholder: string
  mobileHelper: string
  sendCode: string
  otpHeading: string
  otpSub: string
  changeNumber: string
  verify: string
  resendIn: string
  resend: string
  back: string
  officerHeading: string
  officerSub: string
  idLabel: string
  idPlaceholder: string
  pwLabel: string
  forgot: string
  officerBtn: string
  trouble: string
  footerSignup: string
  footerSignupAction: string
  footerSignin: string
  footerSigninAction: string
  continueAnyway: string
  errMobile: string
  errOtp: string
  errLogin: string
}

export const LANGS: { id: Lang; native: string }[] = [
  { id: 'en', native: 'English' },
  { id: 'bn', native: 'বাংলা' },
  { id: 'hi', native: 'हिन्दी' },
]

export const copy: Record<Lang, AuthCopy> = {
  en: {
    langLabel: 'Language',
    roleCitizen: 'Citizen',
    roleOfficer: 'Officer',
    brandEyebrow: 'Free government service',
    brandTitle: 'Your welfare, in your language.',
    brandSub:
      'SevaNest finds the schemes you qualify for and tracks every complaint you file — on any phone, at no cost.',
    trust: [
      'Never pay anyone — this service is free',
      'SMS updates at every step, in your language',
      'Works on low network and shared phones',
    ],
    insideTitle: 'Inside your portal',
    insideHint: 'Once you sign in, you will see',
    stats: [
      { value: '6', label: 'schemes matched' },
      { value: '4', label: 'complaints tracked' },
      { value: '4.2 days', label: 'avg. resolution' },
    ],
    citizenHeading: { signin: 'Welcome back', signup: 'Create your account' },
    citizenSub: {
      signin: 'Sign in with your mobile number — no password to remember.',
      signup: 'A few details, verified by a code — no password needed.',
    },
    nameLabel: 'Full name',
    namePlaceholder: 'e.g. Asha Verma',
    mobileLabel: 'Mobile number',
    mobilePlaceholder: '10-digit mobile number',
    mobileHelper: "We'll send a 6-digit code by SMS.",
    sendCode: 'Send code',
    otpHeading: 'Enter the code',
    otpSub: 'We sent a 6-digit code by SMS to',
    changeNumber: 'Change number',
    verify: 'Verify & continue',
    resendIn: 'Resend code in',
    resend: 'Resend code',
    back: 'Back',
    officerHeading: 'Officer sign-in',
    officerSub: 'Review, assign and resolve citizen reports.',
    idLabel: 'Employee ID or email',
    idPlaceholder: 'e.g. BLK-ULB-142',
    pwLabel: 'Password',
    forgot: 'Forgot password?',
    officerBtn: 'Sign in',
    trouble: 'Having trouble? Contact the district IT cell.',
    footerSignup: 'New to SevaNest?',
    footerSignupAction: 'Create account',
    footerSignin: 'Already registered?',
    footerSigninAction: 'Sign in',
    continueAnyway: 'Continue anyway',
    errMobile: 'Enter the 10-digit mobile number.',
    errOtp: 'Enter all 6 digits to continue.',
    errLogin: 'Enter your ID and password.',
  },

  bn: {
    langLabel: 'ভাষা',
    roleCitizen: 'নাগরিক',
    roleOfficer: 'কর্মকর্তা',
    brandEyebrow: 'সরকারি সেবা, সম্পূর্ণ বিনামূল্যে',
    brandTitle: 'আপনার কল্যাণ, আপনার ভাষায়।',
    brandSub:
      'SevaNest আপনার যোগ্য প্রকল্প খুঁজে দেয় এবং প্রতিটি অভিযোগের খবর রাখে — যেকোনো ফোনে, একেবারে ফ্রি।',
    trust: [
      'কাউকে টাকা দেবেন না — সেবাটি সম্পূর্ণ বিনামূল্যে',
      'প্রতিটি ধাপে এসএমএস খবর, আপনার ভাষায়',
      'কম নেটওয়ার্ক ও ভাগ করা ফোনেও চলে',
    ],
    insideTitle: 'আপনার পোর্টালে যা পাবেন',
    insideHint: 'প্রবেশ করলেই দেখতে পাবেন',
    stats: [
      { value: '৬', label: 'টি প্রকল্প মিলেছে' },
      { value: '৪', label: 'টি অভিযোগ ট্র্যাক' },
      { value: '৪.২ দিন', label: 'গড় সমাধান সময়' },
    ],
    citizenHeading: { signin: 'আবার স্বাগতম', signup: 'অ্যাকাউন্ট খুলুন' },
    citizenSub: {
      signin: 'মোবাইল নম্বর দিয়েই প্রবেশ — কোনো পাসওয়ার্ড মনে রাখতে হবে না।',
      signup: 'কয়েকটি তথ্য, কোড দিয়ে যাচাই — পাসওয়ার্ড লাগবে না।',
    },
    nameLabel: 'পুরো নাম',
    namePlaceholder: 'যেমন: আশা ভর্মা',
    mobileLabel: 'মোবাইল নম্বর',
    mobilePlaceholder: '১০-ডিজিটের মোবাইল নম্বর',
    mobileHelper: 'আপনার মোবাইলে ৬ ডিজিটের একটি কোড পাঠানো হবে।',
    sendCode: 'কোড পাঠান',
    otpHeading: 'কোডটি লিখুন',
    otpSub: '৬ ডিজিটের কোডটি এসএমএসে পাঠানো হয়েছে এই নম্বরে',
    changeNumber: 'নম্বর বদলান',
    verify: 'যাচাই করে ঢুকুন',
    resendIn: 'পুনরায় পাঠান',
    resend: 'কোড আবার পাঠান',
    back: 'পেছনে',
    officerHeading: 'কর্মকর্তা প্রবেশ',
    officerSub: 'নাগরিকদের অভিযোগ দেখুন, বরাদ্দ করুন ও সমাধান করুন।',
    idLabel: 'কর্মী আইডি বা ইমেইল',
    idPlaceholder: 'যেমন: BLK-ULB-142',
    pwLabel: 'পাসওয়ার্ড',
    forgot: 'পাসওয়ার্ড ভুলে গেছেন?',
    officerBtn: 'প্রবেশ করুন',
    trouble: 'সমস্যা হচ্ছে? জেলা আইটি সেলে যোগাযোগ করুন।',
    footerSignup: 'SevaNest-এ নতুন?',
    footerSignupAction: 'অ্যাকাউন্ট খুলুন',
    footerSignin: 'আগে থেকেই নথিভুক্ত?',
    footerSigninAction: 'প্রবেশ করুন',
    continueAnyway: 'তবুও ঢুকে পড়ুন',
    errMobile: '১০ ডিজিটের মোবাইল নম্বর দিন।',
    errOtp: 'চালিয়ে যেতে ৬টি ডিজিটই দিন।',
    errLogin: 'আইডি ও পাসওয়ার্ড দিন।',
  },

  hi: {
    langLabel: 'भाषा',
    roleCitizen: 'नागरिक',
    roleOfficer: 'अधिकारी',
    brandEyebrow: 'सरकारी सेवा, पूरी तरह मुफ़्त',
    brandTitle: 'आपकी सेवा, आपकी भाषा में।',
    brandSub:
      'SevaNest उन योजनाओं को खोजता है जिनके आप पात्र हैं और हर शिकायत का हाल रखता है — किसी भी फ़ोन पर, बिल्कुल मुफ़्त।',
    trust: [
      'किसी को पैसे न दें — यह सेवा मुफ़्त है',
      'हर कदम पर SMS, आपकी भाषा में',
      'कम नेटवर्क और शेयर किए फ़ोन पर भी चलता है',
    ],
    insideTitle: 'आपके पोर्टल में क्या मिलेगा',
    insideHint: 'प्रवेश करते ही दिखेगा',
    stats: [
      { value: '6', label: 'योजनाएँ मिलीं' },
      { value: '4', label: 'शिकायतें ट्रैक' },
      { value: '4.2 दिन', label: 'औसत समाधान' },
    ],
    citizenHeading: { signin: 'वापसी पर स्वागत है', signup: 'खाता बनाएँ' },
    citizenSub: {
      signin: 'मोबाइल नंबर से लॉगिन करें — कोई पासवर्ड याद रखने की ज़रूरत नहीं।',
      signup: 'कुछ जानकारी, कोड से पुष्टि — पासवर्ड की ज़रूरत नहीं।',
    },
    nameLabel: 'पूरा नाम',
    namePlaceholder: 'जैसे: आशा वर्मा',
    mobileLabel: 'मोबाइल नंबर',
    mobilePlaceholder: '10 अंकों का मोबाइल नंबर',
    mobileHelper: 'आपके मोबाइल पर 6 अंकों का कोड SMS से भेजा जाएगा।',
    sendCode: 'कोड भेजें',
    otpHeading: 'कोड दर्ज करें',
    otpSub: '6 अंकों का कोड इस नंबर पर SMS से भेजा गया है',
    changeNumber: 'नंबर बदलें',
    verify: 'पुष्टि करके प्रवेश करें',
    resendIn: 'फिर से भेजें',
    resend: 'कोड फिर से भेजें',
    back: 'पीछे',
    officerHeading: 'अधिकारी लॉगिन',
    officerSub: 'नागरिकों की शिकायतें देखें, सौंपें और हल करें।',
    idLabel: 'कर्मचारी आईडी या ईमेल',
    idPlaceholder: 'जैसे: BLK-ULB-142',
    pwLabel: 'पासवर्ड',
    forgot: 'पासवर्ड भूल गए?',
    officerBtn: 'साइन इन करें',
    trouble: 'परेशानी हो रही है? ज़िला आईटी सेल से संपर्क करें।',
    footerSignup: 'SevaNest पर नए हैं?',
    footerSignupAction: 'खाता बनाएँ',
    footerSignin: 'पहले से पंजीकृत हैं?',
    footerSigninAction: 'साइन इन करें',
    continueAnyway: 'फिर भी आगे बढ़ें',
    errMobile: '10 अंकों का मोबाइल नंबर दर्ज करें।',
    errOtp: 'आगे बढ़ने के लिए सभी 6 अंक दर्ज करें।',
    errLogin: 'अपनी आईडी और पासवर्ड दर्ज करें।',
  },
}
