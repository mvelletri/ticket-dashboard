"use client";

import { useRouter } from "next/navigation";

interface Props {
  from: string;
  to: string;
  defaultFrom: string;
}

const PRESETS = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "60 dias", days: 60 },
  { label: "90 dias", days: 90 },
];

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function subtractDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return isoDate(d);
}

export function DateRangePicker({ from, to, defaultFrom }: Props) {
  const router = useRouter();
  const today = isoDate(new Date());

  function update(newFrom: string, newTo: string) {
    const params = new URLSearchParams({ from: newFrom, to: newTo });
    router.replace(`/?${params.toString()}`);
  }

  const isDefault = from === defaultFrom && to === today;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-zinc-600">Período:</span>

      {/* Presets */}
      {PRESETS.map(({ label, days }) => {
        const pFrom = subtractDays(days);
        const active = from === pFrom && to === today;
        return (
          <button
            key={days}
            onClick={() => update(pFrom, today)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              active
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            {label}
          </button>
        );
      })}

      <div className="w-px h-5 bg-zinc-200" />

      {/* Custom date inputs */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-zinc-500 font-medium">De</span>
        <input
          type="date"
          value={from}
          max={to}
          onChange={(e) => update(e.target.value, to)}
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-zinc-500 font-medium">Até</span>
        <input
          type="date"
          value={to}
          min={from}
          max={today}
          onChange={(e) => update(from, e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {!isDefault && (
        <button
          onClick={() => update(defaultFrom, today)}
          className="text-xs text-zinc-400 hover:text-zinc-700 underline underline-offset-2"
        >
          Resetar
        </button>
      )}
    </div>
  );
}
