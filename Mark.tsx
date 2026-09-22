export function Mark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="GABAY"
      fill="none"
    >
      <path
        d="M32 4C20.4 4 11 13.4 11 25c0 6.4 3.1 11.6 6.9 16.2C21.9 46.3 27 51.4 32 58c5-6.6 10.1-11.7 14.1-16.8C49.9 36.6 53 31.4 53 25 53 13.4 43.6 4 32 4Z"
        fill="#0e1633"
      />
      <path
        d="M18 26.5 32 39l14-12.5-6.6 0L32 31l-7.4-4.5Z"
        fill="#2fe2e6"
      />
      <path
        d="M22 21.5 32 26l10-4.5-4.2 0L32 23l-5.8-1.5Z"
        fill="#2fe2e6"
        opacity="0.55"
      />
      <circle cx="32" cy="45.5" r="3.4" fill="#e0342a" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="display-tight text-[1.6rem] leading-none font-black tracking-[-0.05em]">
      GABAY
    </span>
  );
}
