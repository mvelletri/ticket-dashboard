import { getSheetRows } from "./google-sheets";

export type Row = Record<string, string | null>;

export interface TicketRow {
  ticket: string | null;
  status: string | null;
  cliente: string | null;
  telefone: string | null;
  assunto: string | null;
  descricao: string | null;
  prioridade: string | null;
  fase: string | null;
  tipoProblema: string | null;
  posVendas: string | null;
  consultor: string | null;
  responsavel: string | null;
  dataAbertura: string | null;
  ultimoContato: string | null;
  sla: string | null;
  ra: string | null;
  origem: string | null;
  pedidoNF: string | null;
  dataPedido: string | null;
}

export interface DailyPoint {
  date: string;
  abertos: number;
  concluidos: number;
}

// "M/D/YYYY" or "M/D/YY" → "YYYY-MM-DD" (Data Abertura column)
function parseMDY(raw: string | null): string | null {
  if (!raw) return null;
  const p = raw.split("/");
  if (p.length !== 3) return null;
  let [m, d, y] = p.map(Number);
  if (y < 100) y += 2000;
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// "D/M/YY" or "D/M/YYYY" → "YYYY-MM-DD" (Último Contato column)
function parseDMY(raw: string | null): string | null {
  if (!raw) return null;
  const p = raw.split("/");
  if (p.length !== 3) return null;
  let [d, m, y] = p.map(Number);
  if (y < 100) y += 2000;
  if (isNaN(m) || isNaN(d) || isNaN(y)) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function countBy(rows: Row[], key: string) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const val = row[key] ?? null;
    if (!val) continue;
    counts[val] = (counts[val] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export async function getDashboardData(from?: string, to?: string) {
  const allRows = await getSheetRows();

  const duplicados = allRows.filter((r) => r["Status"] === "Duplicado");

  // Filtra duplicados primeiro, depois aplica range de data
  let rows = allRows.filter((r) => r["Status"] !== "Duplicado");

  if (from || to) {
    rows = rows.filter((r) => {
      const day = parseMDY(r["Data Abertura"]);
      if (!day) return false;
      // Comparação lexicográfica funciona direto em formato YYYY-MM-DD
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    });
  }

  const slaValues = rows
    .map((r) => parseFloat(r["SLA"] as string))
    .filter((v) => !isNaN(v));

  const slaVencido = slaValues.filter((v) => v < 0).length;
  const raAberta = rows.filter((r) => r["RA"] === "Sim").length;
  const concluidos = rows.filter(
    (r) => r["Status"] === "Concluído" || r["Status"] === "Encerrado"
  ).length;

  // Agregação diária
  const dailyMap: Record<string, { abertos: number; concluidos: number }> = {};

  for (const r of rows) {
    const day = parseMDY(r["Data Abertura"]);
    if (!day) continue;
    if (!dailyMap[day]) dailyMap[day] = { abertos: 0, concluidos: 0 };
    dailyMap[day].abertos += 1;
  }

  for (const r of rows.filter(
    (r) => r["Status"] === "Concluído" || r["Status"] === "Encerrado"
  )) {
    const day = parseDMY(r["Último Contato"]) ?? parseMDY(r["Data Abertura"]);
    if (!day) continue;
    if (!dailyMap[day]) dailyMap[day] = { abertos: 0, concluidos: 0 };
    dailyMap[day].concluidos += 1;
  }

  const byDay: DailyPoint[] = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }));

  const tickets: TicketRow[] = rows.map((r) => ({
    ticket: r["Ticket"],
    status: r["Status"],
    cliente: r["Cliente"],
    telefone: r["Telefone"],
    assunto: r["Assunto"],
    descricao: r["Descrição"],
    prioridade: r["Prioridade"],
    fase: r["Fase"],
    tipoProblema: r["Tipo do Problema"],
    posVendas: r["Pós-vendas"],
    consultor: r["Consultor"],
    responsavel: r["Responsável"],
    dataAbertura: r["Data Abertura"],
    ultimoContato: r["Último Contato"],
    sla: r["SLA"],
    ra: r["RA"],
    origem: r["Origem"],
    pedidoNF: r["Pedido ou NF"],
    dataPedido: r["Data do Pedido"],
  }));

  return {
    kpis: {
      total: rows.length,
      duplicados: duplicados.length,
      concluidos,
      slaVencido,
      raAberta,
    },
    byDay,
    byStatus: countBy(rows, "Status"),
    byPrioridade: countBy(
      rows.filter((r) => r["Prioridade"] && r["Prioridade"] !== "Duplicado"),
      "Prioridade"
    ),
    byFase: countBy(rows.filter((r) => r["Fase"]), "Fase"),
    byTipoProblema: countBy(
      rows.filter((r) => r["Tipo do Problema"]),
      "Tipo do Problema"
    ),
    byPosVendas: countBy(rows.filter((r) => r["Pós-vendas"]), "Pós-vendas"),
    byOrigem: countBy(rows.filter((r) => r["Origem"]), "Origem"),
    tickets,
  };
}
