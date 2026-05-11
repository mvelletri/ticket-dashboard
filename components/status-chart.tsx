"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  "Aguardando Operações": "#f59e0b",
  "Aguardando Cliente": "#3b82f6",
  "Aguardando Fábrica": "#8b5cf6",
  "Aguardando Instalador": "#06b6d4",
  "Aguardando Consultor": "#f97316",
  "Aguardando Financeiro": "#ec4899",
  "Em transporte": "#10b981",
  "Concluído": "#22c55e",
  "Encerrado": "#6b7280",
  "Duplicado": "#d1d5db",
};

function getColor(name: string, index: number) {
  return STATUS_COLORS[name] ?? `hsl(${(index * 47) % 360}, 65%, 55%)`;
}

interface Props {
  data: { name: string; value: number }[];
}

export function StatusChart({ data }: Props) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <h2 className="text-sm font-semibold text-zinc-700 mb-1">Status dos Tickets</h2>
      <p className="text-xs text-zinc-500 mb-3">
        <span className="font-medium text-blue-500">Clique em um status para filtrar os tickets</span>
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            cursor="pointer"
            onClick={(payload: { name: string }) =>
              router.push(`/tickets?status=${encodeURIComponent(payload.name)}`)
            }
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={getColor(entry.name, index)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number, _: string, props: { payload?: { name?: string } }) => [
              `${v} tickets`,
              props.payload?.name ?? "",
            ]}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", color: "#3f3f46", paddingTop: "8px" }}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
