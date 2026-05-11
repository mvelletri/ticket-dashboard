import Link from "next/link";

interface KpiCardProps {
  label: string;
  value: number | string;
  sub?: string;
  color?: "default" | "red" | "green" | "yellow";
  href?: string;
}

const colorMap = {
  default: { card: "bg-white border-zinc-200",      label: "text-zinc-600",  value: "text-zinc-900",  sub: "text-zinc-500" },
  red:     { card: "bg-red-50 border-red-300",       label: "text-red-700",   value: "text-red-800",   sub: "text-red-600" },
  green:   { card: "bg-green-50 border-green-300",   label: "text-green-800", value: "text-green-900", sub: "text-green-600" },
  yellow:  { card: "bg-yellow-50 border-yellow-300", label: "text-yellow-800",value: "text-yellow-900",sub: "text-yellow-600" },
};

export function KpiCard({ label, value, sub, color = "default", href }: KpiCardProps) {
  const c = colorMap[color];

  const inner = (
    <>
      <p className={`text-sm font-semibold ${c.label}`}>{label}</p>
      <p className={`text-3xl font-bold ${c.value}`}>{value}</p>
      {sub && <p className={`text-xs ${c.sub}`}>{sub}</p>}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`rounded-xl border p-5 flex flex-col gap-1 ${c.card} hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-1 ${c.card}`}>
      {inner}
    </div>
  );
}
