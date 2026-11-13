export const LogoMark = ({ size = 40, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
    <rect x="2" y="2" width="60" height="60" rx="16" fill="#FF5436" stroke="#16130F" strokeWidth="3" />
    <path d="M15 46V20l17 16 17-16v26" fill="none" stroke="#FFF6E9" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="51" cy="13" r="7" fill="#FFD43B" stroke="#16130F" strokeWidth="3" />
  </svg>
);

export const Logo = ({ className = "" }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <LogoMark size={38} />
    <span className="font-display text-2xl font-extrabold tracking-tight">mulisınav</span>
  </span>
);
