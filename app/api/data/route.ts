import { getSheetRows } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

function countBy(rows: Record<string, string | null>[], key: string) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const val = row[key] ?? "(vazio)";
    counts[val] = (counts[val] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export async function GET() {
  const rows = await getSheetRows();

  const activeRows = rows.filter(
    (r) => r["Status"] !== "Duplicado" && r["Status"] !== "Encerrado"
  );

  const slaValues = rows
    .map((r) => parseFloat(r["SLA"] as string))
    .filter((v) => !isNaN(v));

  const slaVencido = slaValues.filter((v) => v < 0).length;
  const slaMedia = slaValues.length
    ? Math.round(slaValues.reduce((a, b) => a + b, 0) / slaValues.length * 10) / 10
    : 0;

  const raAberta = rows.filter((r) => r["RA"] === "Sim").length;
  const concluidos = rows.filter(
    (r) => r["Status"] === "Concluído" || r["Status"] === "Encerrado"
  ).length;

  return NextResponse.json({
    kpis: {
      total: rows.length,
      ativos: activeRows.length,
      slaVencido,
      slaMedia,
      raAberta,
      concluidos,
    },
    byStatus: countBy(rows, "Status"),
    byPrioridade: countBy(
      rows.filter((r) => r["Prioridade"] && r["Prioridade"] !== "Duplicado"),
      "Prioridade"
    ),
    byFase: countBy(
      rows.filter((r) => r["Fase"]),
      "Fase"
    ),
    byTipoProblema: countBy(
      rows.filter((r) => r["Tipo do Problema"]),
      "Tipo do Problema"
    ),
    byPosVendas: countBy(
      rows.filter((r) => r["Pós-vendas"]),
      "Pós-vendas"
    ),
    byOrigem: countBy(
      rows.filter((r) => r["Origem"]),
      "Origem"
    ),
    tickets: rows.map((r) => ({
      ticket: r["Ticket"],
      status: r["Status"],
      cliente: r["Cliente"],
      assunto: r["Assunto"],
      prioridade: r["Prioridade"],
      fase: r["Fase"],
      posVendas: r["Pós-vendas"],
      dataAbertura: r["Data Abertura"],
      sla: r["SLA"],
      ra: r["RA"],
      tipoProblema: r["Tipo do Problema"],
      origem: r["Origem"],
    })),
  });
}
