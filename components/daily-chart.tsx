"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";

interface DailyPoint {
  date: string;
  abertos: number;
  concluidos: number;
}

interface Props {
  data: DailyPoint[];
}

function formatDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function DailyChart({ data }: Props) {
  const router = useRouter();

  function handleClick(payload: DailyPoint) {
    router.push(`/tickets?from=${payload.date}&to=${payload.date}`);
  }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      <h2 className="text-sm font-semibold text-zinc-700 mb-1">
        Tickets Abertos e Concluídos por Dia
      </h2>
      <p className="text-xs text-zinc-500 mb-4">
        Barras = abertos · Linha = concluídos · <span className="font-medium text-blue-500">Clique em um dia para filtrar os tickets</span>
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ left: 0, right: 8, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 10, fill: "#71717a" }}
            interval={Math.ceil(data.length / 20)}
            angle={-35}
            textAnchor="end"
          />
          <YAxis tick={{ fontSize: 11, fill: "#71717a" }} allowDecimals={false} />
          <Tooltip
            formatter={(v, name) => [v, name === "abertos" ? "Abertos" : "Concluídos"]}
            labelFormatter={(l) => `Data: ${formatDate(l)}`}
            cursor={{ fill: "#f0f9ff" }}
          />
          <Legend
            formatter={(v) => (
              <span style={{ fontSize: 12, color: "#52525b" }}>
                {v === "abertos" ? "Abertos" : "Concluídos"}
              </span>
            )}
          />
          <Bar
            dataKey="abertos"
            fill="#93c5fd"
            radius={[3, 3, 0, 0]}
            maxBarSize={18}
            cursor="pointer"
            onClick={(data: unknown) => handleClick(data as DailyPoint)}
          />
          <Line
            type="monotone"
            dataKey="concluidos"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, cursor: "pointer", onClick: (_evt: unknown, dotProps: unknown) => {
              const dp = dotProps as { payload: DailyPoint };
              if (dp?.payload) handleClick(dp.payload);
            } }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
