"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  data: { name: string; value: number }[];
  color?: string;
  horizontal?: boolean;
  maxItems?: number;
  filterKey?: string; // URL param name para navegação para /tickets
}

const PRIORITY_COLORS: Record<string, string> = {
  P1: "#ef4444",
  P2: "#f97316",
  P3: "#eab308",
};

export function BarChartCard({
  title,
  data,
  color = "#3b82f6",
  horizontal = false,
  maxItems = 10,
  filterKey,
}: Props) {
  const router = useRouter();
  const display = data.slice(0, maxItems);
  const clickable = !!filterKey;

  function handleClick(name: string) {
    if (!filterKey) return;
    router.push(`/tickets?${filterKey}=${encodeURIComponent(name)}`);
  }

  const barProps = {
    cursor: clickable ? "pointer" : "default",
    onClick: (payload: { name: string }) => handleClick(payload.name),
  };

  if (horizontal) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200 p-5">
        <h2 className="text-sm font-semibold text-zinc-700 mb-1">{title}</h2>
        {clickable && (
          <p className="text-xs text-blue-500 font-medium mb-3">
            Clique em uma barra para filtrar os tickets
          </p>
        )}
        <ResponsiveContainer width="100%" height={Math.max(display.length * 36, 120)}>
          <BarChart data={display} layout="vertical" margin={{ left: 8, right: 24 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 11 }}
              tickLine={false}
            />
            <Tooltip formatter={(v: number) => [`${v} tickets`, ""]} cursor={{ fill: "#f0f9ff" }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} {...barProps}>
              {display.map((entry) => (
                <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <h2 className="text-sm font-semibold text-zinc-700 mb-1">{title}</h2>
      {clickable && (
        <p className="text-xs text-blue-500 font-medium mb-3">
          Clique em uma barra para filtrar os tickets
        </p>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={display} margin={{ bottom: 32 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            interval={0}
            angle={-30}
            textAnchor="end"
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number) => [`${v} tickets`, ""]} cursor={{ fill: "#f0f9ff" }} />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} {...barProps}>
            {display.map((entry) => (
              <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
