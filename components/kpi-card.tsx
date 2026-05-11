"use client";

interface KpiCardProps {
  label: string;
  value: number | string;
  sub?: string;
  color?: "default" | "red" | "green" | "yellow";
}

const colorMap = {
  default: {
    card: "bg-white border-zinc-200",
    label: "text-zinc-600",
    value: "text-zinc-900",
    sub: "text-zinc-500",
  },
  red: {
    card: "bg-red-50 border-red-300",
    label: "text-red-700",
    value: "text-red-800",
    sub: "text-red-600",
  },
  green: {
    card: "bg-green-50 border-green-300",
    label: "text-green-800",
    value: "text-green-900",
    sub: "text-green-600",
  },
  yellow: {
    card: "bg-yellow-50 border-yellow-300",
    label: "text-yellow-800",
    value: "text-yellow-900",
    sub: "text-yellow-600",
  },
};

export function KpiCard({ label, value, sub, color = "default" }: KpiCardProps) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-1 ${c.card}`}>
      <p className={`text-sm font-semibold ${c.label}`}>{label}</p>
      <p className={`text-3xl font-bold ${c.value}`}>{value}</p>
      {sub && <p className={`text-xs ${c.sub}`}>{sub}</p>}
    </div>
  );
}
