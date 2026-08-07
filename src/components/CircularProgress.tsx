export default function CircularProgress({ value, colorClass }: { value: number, colorClass: string }) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative w-10 h-10">
      <svg className="w-full h-full -rotate-90">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="currentColor" strokeWidth="4" className="text-[var(--card-bg)]" />
        <circle cx="20" cy="20" r={radius} fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={colorClass} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">{value}</span>
    </div>
  )
}
