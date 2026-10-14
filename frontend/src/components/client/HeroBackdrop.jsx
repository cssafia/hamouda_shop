import { LuCpu, LuHardDrive, LuMonitor, LuRepeat } from 'react-icons/lu';

// Inline SVGs for GPU and RAM, same stroke style as the Lucide icons.
function GpuIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="6" width="20" height="10" rx="2" />
      <circle cx="8" cy="11" r="2.5" />
      <circle cx="16" cy="11" r="2.5" />
      <path d="M6 16v3M18 16v3" />
    </svg>
  );
}

function RamIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="7" width="20" height="9" rx="1.5" />
      <path d="M6 11h2M11 11h2M16 11h2M6 16v2M10 16v2M14 16v2M18 16v2" />
    </svg>
  );
}

// Desktop: unchanged. `side` = the way the connector line points (toward the text).
const DESKTOP_CHIPS = [
  { key: 'gpu', label: 'GPU', Icon: GpuIcon, side: 'left', pos: 'top-[14%] left-[7%]' },
  { key: 'cpu', label: 'CPU', Icon: LuCpu, side: 'left', pos: 'top-[44%] left-[2%]' },
  { key: 'ram', label: 'RAM', Icon: RamIcon, side: 'left', pos: 'top-[74%] left-[10%]' },
  { key: 'ssd', label: 'SSD', Icon: LuHardDrive, side: 'right', pos: 'top-[14%] right-[7%]' },
  { key: 'screen', label: 'Écran', Icon: LuMonitor, side: 'right', pos: 'top-[44%] right-[2%]' },
  { key: 'digital', label: 'Abonnements', Icon: LuRepeat, side: 'right', pos: 'top-[74%] right-[10%]' },
];


const MOBILE_CHIPS = [
  { key: 'gpu', label: 'GPU', Icon: GpuIcon, side: 'left', pos: 'top-4 left-3 px-2.5' },
  { key: 'screen', label: 'Écran', Icon: LuMonitor, side: 'left', pos: 'top-[56px] -left-3 pl-[22px] pr-2.5' },
  { key: 'ssd', label: 'SSD', Icon: LuHardDrive, side: 'right', pos: 'top-[36px] right-3 px-2.5' },
  { key: 'cpu', label: 'CPU', Icon: LuCpu, side: 'right', pos: 'bottom-[36px] right-3 px-2.5' },
  { key: 'digital', label: 'Abonnements', Icon: LuRepeat, side: 'right', pos: 'bottom-[76px] -right-3 pl-2.5 pr-[22px]' },
  { key: 'ram', label: 'RAM', Icon: RamIcon, side: 'left', pos: 'bottom-[56px] left-3 px-2.5' },
];

// Decorative only: aria-hidden, not clickable, no images, no animation.
export default function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
      {/* Glow, desktop */}
      <div
        className="hidden lg:block absolute inset-0 text-brand-500"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 0%, color-mix(in srgb, currentColor 14%, transparent), transparent 70%)',
        }}
      />

      {/* Glow, mobile: wider and stronger so it shows on a small screen */}
      <div
        className="lg:hidden absolute inset-0 text-brand-500"
        style={{
          background:
            'radial-gradient(ellipse 120% 70% at 50% 0%, color-mix(in srgb, currentColor 22%, transparent), transparent 75%)',
        }}
      />

      {/* Dot grid, desktop */}
      <div
        className="hidden lg:block absolute inset-0 text-brand-500"
        style={{
          backgroundImage:
            'radial-gradient(color-mix(in srgb, currentColor 22%, transparent) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 70% at 50% 40%, black, transparent 80%)',
          maskImage: 'radial-gradient(ellipse 60% 70% at 50% 40%, black, transparent 80%)',
        }}
      />

      {/* Dot grid, mobile: mask is wider so the dots reach both chip bands */}
      <div
        className="lg:hidden absolute inset-0 text-brand-500"
        style={{
          backgroundImage:
            'radial-gradient(color-mix(in srgb, currentColor 24%, transparent) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          WebkitMaskImage: 'radial-gradient(ellipse 110% 85% at 50% 50%, black 30%, transparent 85%)',
          maskImage: 'radial-gradient(ellipse 110% 85% at 50% 50%, black 30%, transparent 85%)',
        }}
      />

      {/* Desktop chips with connector lines */}
      {DESKTOP_CHIPS.map(({ key, label, Icon, side, pos }) => (
        <div
          key={key}
          className={`absolute hidden lg:flex items-center justify-center gap-2 px-3 py-2
                      rounded-full bg-white border border-brand-200 text-brand-600 ${pos}`}
        >
          <Icon size={18} />
          <span className="text-xs font-medium text-ink-600">{label}</span>

          <span
            className={`absolute top-1/2 h-px w-10 bg-brand-200 ${side === 'left' ? 'left-full' : 'right-full'}`}
          >
            <span
              className={`absolute -top-[2px] w-[5px] h-[5px] rounded-full bg-brand-400 ${
                side === 'left' ? 'right-0' : 'left-0'
              }`}
            />
          </span>
        </div>
      ))}

      {/* Mobile chips: smaller, with a short connector line */}
      {MOBILE_CHIPS.map(({ key, label, Icon, side, pos }) => (
        <div
          key={key}
          className={`absolute lg:hidden flex items-center gap-1.5 py-1.5
                      rounded-full bg-white border border-brand-200 text-brand-600 ${pos}`}
        >
          <Icon size={14} />
          <span className="text-[11px] font-medium text-ink-600">{label}</span>

          <span
            className={`absolute top-1/2 h-px w-4 bg-brand-200 ${side === 'left' ? 'left-full' : 'right-full'}`}
          >
            <span
              className={`absolute -top-[2px] w-[5px] h-[5px] rounded-full bg-brand-400 ${
                side === 'left' ? 'right-0' : 'left-0'
              }`}
            />
          </span>
        </div>
      ))}
    </div>
  );
}