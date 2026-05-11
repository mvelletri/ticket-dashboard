import { getDashboardData } from "@/lib/dashboard-data";
import { TicketsTable } from "@/components/tickets-table";

interface SearchParams {
  status?: string;
  prioridade?: string;
  posVendas?: string;
  tipo?: string;
  fase?: string;
  origem?: string;
  ra?: string;
  slaFaixa?: string;
  from?: string;
  to?: string;
}

function parseMulti(val?: string): string[] {
  if (!val) return [];
  return val.split(",").map((s) => s.trim()).filter(Boolean);
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { tickets, kpis } = await getDashboardData();

  const initialStatus     = parseMulti(params.status);
  const initialPrioridade = parseMulti(params.prioridade);
  const initialPosVendas  = parseMulti(params.posVendas);
  const initialTipo       = parseMulti(params.tipo);
  const initialFase       = parseMulti(params.fase);
  const initialOrigem     = parseMulti(params.origem);
  const initialRa         = parseMulti(params.ra);
  const initialSlaFaixa   = parseMulti(params.slaFaixa);
  const initialFrom       = params.from ?? "";
  const initialTo         = params.to ?? "";

  const tableKey = JSON.stringify(params);

  return (
    <main className="px-8 py-6 flex flex-col gap-4 max-w-screen-xl mx-auto w-full">
      <p className="text-sm font-medium text-zinc-500">
        {kpis.total} tickets · {kpis.duplicados} duplicados desconsiderados
      </p>
      <TicketsTable
        key={tableKey}
        tickets={tickets}
        initialStatus={initialStatus}
        initialPrioridade={initialPrioridade}
        initialPosVendas={initialPosVendas}
        initialTipo={initialTipo}
        initialFase={initialFase}
        initialOrigem={initialOrigem}
        initialRa={initialRa}
        initialSlaFaixa={initialSlaFaixa}
        initialFrom={initialFrom}
        initialTo={initialTo}
      />
    </main>
  );
}
