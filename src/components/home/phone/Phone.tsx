export function Phone({ children, tall = false }: { children: React.ReactNode; tall?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`box-border shrink-0 rounded-[46px] bg-[#1E2B3F] p-2.5 shadow-[0_24px_50px_rgba(20,46,34,.22)] ${tall ? "h-[500px] w-[280px] lg:h-[min(500px,calc(100svh-120px))]" : "h-[570px] w-[280px]"}`}
    >
      <div className="force-light flex h-full flex-col overflow-hidden rounded-[37px] bg-[#DCEBFD] text-xs leading-snug">{children}</div>
    </div>
  );
}
