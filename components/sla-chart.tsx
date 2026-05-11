"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";

interface Props {
  data: { ok: number; atencao: number; critico: number };
}

const FAIXAS = [
  { key: "ok",      name: "0–5 dias",   label: "Bom",     color: "#16a34a", textColor: "text-green-600",  param: "ok" },
  { key: "atencao", name: "5–20 dias",  label: "Atenção", color: "#d97706", textColor: "text-yellow-600", param: "atencao" },
  { key: "critico", name: ">20 dias",   label: "Crítico", color: "#dc2626", textColor: "text-red-600",    param: "critico" },
] as const;

const NAME_TO_PARAM: Record<string, string> = Object.fromEntries(
  FAIXAS.map((f) => [f.name, f.param])
);

export function SlaChart({ data }: Props) {
  const router = useRouter();
  const total = data.ok + data.atencao + data.critico;

  const chartData = FAIXAS.map((f) => ({
    name: f.name,
    value: data[f.key],
    color: f.color,
  }));

  function handleClick(barName: string) {
    const param = NAME_TO_PARAM[barName];
    if (param) router.push(`/tickets?slaFaixa=${param}`);
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <h2 className="text-sm font-semibold text-zinc-700 mb-1">Distribuição de SLA</h2>
      <p className="text-xs text-zinc-500 mb-4">
        <span className="font-medium text-blue-500">Clique em uma barra para filtrar os tickets</span>
      </p>

      {/* Mini KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {FAIXAS.map((f) => {
          const count = data[f.key];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={f.key} className="text-center">
              <div className={`text-2xl font-bold ${f.textColor}`}>{count}</div>
              <div className="text-xs font-medium text-zinc-600 mt-0.5">{f.label}</div>
              <div className="text-xs text-zinc-400">{f.name}</div>
              {total > 0 && (
                <div className={`text-xs font-medium mt-0.5 ${f.textColor}`}>{pct}%</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={chartData} margin={{ bottom: 0, left: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(v) => [`${v} tickets`, ""]}
            cursor={{ fill: "#f0f9ff" }}
          />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            cursor="pointer"
            onClick={(data: unknown) => {
              const d = data as { name?: string };
              if (d.name) handleClick(d.name);
            }}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
