import { Sparkles } from 'lucide-react';

interface AdminDemoButtonProps {
  demo: boolean;
  onToggle: () => void;
}

export function AdminDemoButton({ demo, onToggle }: AdminDemoButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={demo ? 'Showing demo data — click to return to live data' : 'Browse the demo dataset'}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-lift transition-all focus-visible:outline-2 focus-visible:outline-brand-orange ${
        demo
          ? 'bg-brand-orange text-white hover:brightness-95 dark:bg-brand-orange dark:text-white'
          : 'bg-brand-navy text-white hover:bg-[#2d2839] dark:bg-white dark:text-ink-900 dark:hover:bg-[#f2f0ec]'
      }`}
    >
      <Sparkles className="h-4 w-4" />
      <span>{demo ? 'Live Mode' : 'Demo Data'}</span>
    </button>
  );
}
