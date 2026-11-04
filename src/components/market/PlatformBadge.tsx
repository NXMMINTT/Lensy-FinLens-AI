import { platformLogo } from "@/lib/market/platformLogo";

/** Platform logo from public/logos, or a letter badge for platforms without one. */
export function PlatformBadge({ id, name }: { id: string; name: string }) {
  const logo = platformLogo(id);
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- tiny static logos, next/image adds nothing here
      <img src={logo} alt="" className="h-9 w-9 flex-none rounded-[10px] border border-line bg-white object-contain p-0.5" />
    );
  }
  return (
    <span
      className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-brand-soft text-sm font-bold text-brand"
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
