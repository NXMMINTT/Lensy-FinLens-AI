export function MiniPhone({ children, chat = false }: { children: React.ReactNode; chat?: boolean }) {
  return (
    <div className="absolute -bottom-8 left-1/2 box-border h-[230px] w-[220px] -translate-x-1/2 rounded-t-[34px] bg-[#1E2B3F] p-2.5">
      <div className={`flex h-full flex-col gap-2 rounded-t-[26px] p-3.5 text-xs ${chat ? "bg-[#DCEBFD]" : "bg-surface"}`}>{children}</div>
    </div>
  );
}
