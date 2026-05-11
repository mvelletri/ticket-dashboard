import { getDashboardData } from "@/lib/dashboard-data";
import { KpiCard } from "@/components/kpi-card";
import { StatusChart } from "@/components/status-chart";
import { BarChartCard } from "@/components/bar-chart-card";
import { DailyChart } from "@/components/daily-chart";
import { SlaChart } from "@/components/sla-chart";
import { DateRangePicker } from "@/components/date-range-picker";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function defaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return isoDate(d);
}

export default async function IndicadoresPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const today = isoDate(new Date());
  const def30 = defaultFrom();

  const from = params.from ?? def30;
  const to = params.to ?? today;

  const data = await getDashboardData(from, to);
  const { kpis, bySla, byDay, byStatus, byPrioridade, byFase, byTipoProblema, byPosVendas, byOrigem } = data;

  return (
    <main className="px-8 py-6 flex flex-col gap-6 max-w-screen-xl mx-auto w-full">

      {/* Date range picker */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-500">
          {kpis.total} tickets no período · {kpis.duplicados} duplicados desconsiderados
        </p>
        <DateRangePicker from={from} to={to} defaultFrom={def30} />
      </div>

      {/* KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Total de Tickets"
          value={kpis.total}
          href="/tickets"
        />
        <KpiCard
          label="Concluídos"
          value={kpis.concluidos}
          sub={kpis.total > 0 ? `${Math.round((kpis.concluidos / kpis.total) * 100)}% do total (incl. Encerrados)` : "—"}
          color="green"
          href="/tickets?status=Concluído,Encerrado"
        />
        <KpiCard
          label="SLA Crítico"
          value={kpis.slaCritico}
          sub="tickets acima de 20 dias"
          color={kpis.slaCritico > 0 ? "red" : "green"}
          href="/tickets?slaFaixa=critico"
        />
        <KpiCard
          label="RAs Abertas"
          value={kpis.raAberta}
          color={kpis.raAberta > 0 ? "yellow" : "default"}
          href="/tickets?ra=Sim"
        />
        <KpiCard
          label="Duplicados (excluídos)"
          value={kpis.duplicados}
          sub="não contabilizados"
          color="default"
        />
      </section>

      {/* Abertos e Concluídos por Dia */}
      <section>
        <DailyChart data={byDay} />
      </section>

      {/* SLA */}
      <section>
        <SlaChart data={bySla} />
      </section>

      {/* Status + Prioridade */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusChart data={byStatus} />
        <BarChartCard title="Tickets por Prioridade" data={byPrioridade} color="#3b82f6" filterKey="prioridade" />
      </section>

      {/* Tipo de Problema + Fase */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartCard title="Tipo do Problema" data={byTipoProblema} horizontal color="#8b5cf6" filterKey="tipo" />
        <BarChartCard title="Fase Atual" data={byFase} horizontal color="#06b6d4" filterKey="fase" />
      </section>

      {/* Equipe + Origem */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartCard title="Tickets por Pós-vendas" data={byPosVendas} horizontal color="#10b981" filterKey="posVendas" />
        <BarChartCard title="Origem dos Tickets" data={byOrigem} color="#f59e0b" filterKey="origem" />
      </section>
    </main>
  );
}
