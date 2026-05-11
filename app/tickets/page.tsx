import { getDashboardData } from "@/lib/dashboard-data";
import { TicketsTable } from "@/components/tickets-table";

interface SearchParams {
  status?: string;
  prioridade?: string;
  posVendas?: string;
  tipo?: string;
  fase?: string;
  origem?: string;
  slaFaixa?: string;
  from?: string;
  to?: string;
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { tickets, kpis } = await getDashboardData();

  // Mapeamento de searchParams → filtros da tabela
  const initialStatus = params.status ?? "";
  const initialPrioridade = params.prioridade ?? "";
  const initialPosVendas = params.posVendas ?? "";
  const initialTipo = params.tipo ?? "";
  const initialFase = params.fase ?? "";
  const initialOrigem = params.origem ?? "";
  const initialSlaFaixa = params.slaFaixa ?? "";
  const initialFrom = params.from ?? "";
  const initialTo = params.to ?? "";

  // key muda quando qualquer filtro muda → força remount da tabela com estado limpo
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
        initialSlaFaixa={initialSlaFaixa}
        initialFrom={initialFrom}
        initialTo={initialTo}
      />
    </main>
  );
}
