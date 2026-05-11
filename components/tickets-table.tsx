"use client";

import { useState, useMemo } from "react";

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

interface Props {
  tickets: TicketRow[];
  initialStatus?: string;
  initialPrioridade?: string;
  initialPosVendas?: string;
  initialTipo?: string;
  initialFase?: string;
  initialOrigem?: string;
  initialSlaFaixa?: string;
  initialFrom?: string;
  initialTo?: string;
}

const SLA_FAIXA_LABEL: Record<string, string> = {
  ok:      "0–5 dias (Bom)",
  atencao: "5–20 dias (Atenção)",
  critico: ">20 dias (Crítico)",
};

type SortKey = keyof TicketRow;
type SortDir = "asc" | "desc";

const PRIORITY_BADGE: Record<string, string> = {
  P1: "bg-red-100 text-red-700",
  P2: "bg-orange-100 text-orange-700",
  P3: "bg-yellow-100 text-yellow-700",
  Duplicado: "bg-zinc-100 text-zinc-500",
};

const STATUS_BADGE: Record<string, string> = {
  "Concluído": "bg-green-100 text-green-700",
  "Encerrado": "bg-zinc-100 text-zinc-500",
};

const RA_BADGE: Record<string, string> = {
  "Sim": "bg-red-100 text-red-700",
  "Não": "bg-zinc-100 text-zinc-500",
};

const PRIORITY_ORDER: Record<string, number> = { P1: 1, P2: 2, P3: 3 };

function parseDate(raw: string | null): Date | null {
  if (!raw) return null;
  const parts = raw.split("/");
  if (parts.length !== 3) return null;
  let [m, d, y] = parts.map(Number);
  if (y < 100) y += 2000;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? null : date;
}

function badge(text: string | null, map: Record<string, string>, fallback = "bg-blue-50 text-blue-700") {
  if (!text) return null;
  const cls = map[text] ?? fallback;
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>
      {text}
    </span>
  );
}

function compare(a: TicketRow, b: TicketRow, key: SortKey, dir: SortDir): number {
  const mul = dir === "asc" ? 1 : -1;
  if (key === "dataAbertura" || key === "ultimoContato" || key === "dataPedido") {
    const da = parseDate(a[key])?.getTime() ?? 0;
    const db = parseDate(b[key])?.getTime() ?? 0;
    return (da - db) * mul;
  }
  if (key === "sla") {
    const sa = parseFloat(a.sla ?? "");
    const sb = parseFloat(b.sla ?? "");
    return ((isNaN(sa) ? Infinity : sa) - (isNaN(sb) ? Infinity : sb)) * mul;
  }
  if (key === "prioridade") {
    const pa = PRIORITY_ORDER[a.prioridade ?? ""] ?? 99;
    const pb = PRIORITY_ORDER[b.prioridade ?? ""] ?? 99;
    return (pa - pb) * mul;
  }
  if (key === "ticket") {
    return (parseInt(a.ticket ?? "0") - parseInt(b.ticket ?? "0")) * mul;
  }
  const va = (a[key] ?? "").toLowerCase();
  const vb = (b[key] ?? "").toLowerCase();
  return va < vb ? -mul : va > vb ? mul : 0;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-zinc-300">↕</span>;
  return <span className="ml-1 text-blue-500">{dir === "asc" ? "↑" : "↓"}</span>;
}

interface ColDef {
  label: string;
  key: SortKey;
  className?: string;
}

const COLUMNS: ColDef[] = [
  { label: "Ticket",         key: "ticket",        className: "w-20" },
  { label: "Status",         key: "status" },
  { label: "Prioridade",     key: "prioridade" },
  { label: "Cliente",        key: "cliente",       className: "min-w-[130px]" },
  { label: "Assunto",        key: "assunto",       className: "min-w-[160px]" },
  { label: "Tipo Problema",  key: "tipoProblema",  className: "min-w-[150px]" },
  { label: "Fase",           key: "fase" },
  { label: "Pós-vendas",    key: "posVendas" },
  { label: "Consultor",      key: "consultor" },
  { label: "Pedido / NF",   key: "pedidoNF" },
  { label: "Abertura",       key: "dataAbertura" },
  { label: "Últ. Contato",  key: "ultimoContato" },
  { label: "RA",             key: "ra",            className: "w-16" },
  { label: "SLA",            key: "sla",           className: "w-16" },
];

export function TicketsTable({
  tickets,
  initialStatus = "",
  initialPrioridade = "",
  initialPosVendas = "",
  initialTipo = "",
  initialFase = "",
  initialOrigem = "",
  initialSlaFaixa = "",
  initialFrom = "",
  initialTo = "",
}: Props) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [filterPrioridade, setFilterPrioridade] = useState(initialPrioridade);
  const [filterPosVendas, setFilterPosVendas] = useState(initialPosVendas);
  const [filterTipo, setFilterTipo] = useState(initialTipo);
  const [filterFase, setFilterFase] = useState(initialFase);
  const [filterOrigem, setFilterOrigem] = useState(initialOrigem);
  const [filterSlaFaixa, setFilterSlaFaixa] = useState(initialSlaFaixa);
  const [dateFrom, setDateFrom] = useState(initialFrom);
  const [dateTo, setDateTo] = useState(initialTo);
  const [sortKey, setSortKey] = useState<SortKey>("dataAbertura");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(
    !!(initialStatus || initialPrioridade || initialPosVendas || initialTipo || initialFase || initialOrigem || initialFrom)
  );
  const perPage = 15;

  const statuses = useMemo(
    () => [...new Set(tickets.map((t) => t.status).filter(Boolean))].sort() as string[],
    [tickets]
  );
  const prioridades = useMemo(
    () => [...new Set(tickets.map((t) => t.prioridade).filter(Boolean))].sort() as string[],
    [tickets]
  );
  const agents = useMemo(
    () => [...new Set(tickets.map((t) => t.posVendas).filter(Boolean))].sort() as string[],
    [tickets]
  );
  const tipos = useMemo(
    () => [...new Set(tickets.map((t) => t.tipoProblema).filter(Boolean))].sort() as string[],
    [tickets]
  );
  const fases = useMemo(
    () => [...new Set(tickets.map((t) => t.fase).filter(Boolean))].sort() as string[],
    [tickets]
  );
  const origens = useMemo(
    () => [...new Set(tickets.map((t) => t.origem).filter(Boolean))].sort() as string[],
    [tickets]
  );

  const dateFromMs = dateFrom ? new Date(dateFrom).getTime() : null;
  const dateToMs = dateTo ? new Date(dateTo + "T23:59:59").getTime() : null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tickets.filter((t) => {
      if (filterStatus && t.status !== filterStatus) return false;
      if (filterPrioridade && t.prioridade !== filterPrioridade) return false;
      if (filterPosVendas && t.posVendas !== filterPosVendas) return false;
      if (filterTipo && t.tipoProblema !== filterTipo) return false;
      if (filterFase && t.fase !== filterFase) return false;
      if (filterOrigem && t.origem !== filterOrigem) return false;
      if (filterSlaFaixa) {
        const raw = parseFloat(t.sla ?? "");
        const v = isNaN(raw) ? null : Math.max(0, raw);
        if (v === null) return false;
        if (filterSlaFaixa === "ok"      && v > 5) return false;
        if (filterSlaFaixa === "atencao" && (v <= 5 || v > 20)) return false;
        if (filterSlaFaixa === "critico" && v <= 20) return false;
      }
      if (dateFromMs !== null || dateToMs !== null) {
        const d = parseDate(t.dataAbertura)?.getTime() ?? null;
        if (d === null) return false;
        if (dateFromMs !== null && d < dateFromMs) return false;
        if (dateToMs !== null && d > dateToMs) return false;
      }
      if (q) {
        const haystack = `${t.ticket} ${t.cliente} ${t.assunto} ${t.tipoProblema} ${t.consultor} ${t.pedidoNF}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, search, filterStatus, filterPrioridade, filterPosVendas, filterTipo, filterFase, filterOrigem, filterSlaFaixa, dateFromMs, dateToMs]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compare(a, b, sortKey, sortDir)),
    [filtered, sortKey, sortDir]
  );

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "dataAbertura" || key === "ultimoContato" ? "desc" : "asc");
    }
    setPage(1);
  }

  const hasFilters = search || filterStatus || filterPrioridade || filterPosVendas || filterTipo || filterFase || filterOrigem || filterSlaFaixa || dateFrom || dateTo;
  const activeFilterCount = [filterStatus, filterPrioridade, filterPosVendas, filterTipo, filterFase, filterOrigem, filterSlaFaixa, dateFrom || dateTo ? "period" : ""].filter(Boolean).length;

  function clearAll() {
    setSearch(""); setFilterStatus(""); setFilterPrioridade("");
    setFilterPosVendas(""); setFilterTipo(""); setFilterFase(""); setFilterOrigem("");
    setFilterSlaFaixa(""); setDateFrom(""); setDateTo("");
    setPage(1);
  }

  const hasInitialFilter = initialStatus || initialPrioridade || initialPosVendas || initialTipo || initialFase || initialOrigem || initialSlaFaixa || initialFrom;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      {/* Banner de filtro vindo dos gráficos */}
      {hasInitialFilter && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <span>Filtrado a partir do gráfico:</span>
          {initialStatus && <span className="font-semibold">Status = {initialStatus}</span>}
          {initialPrioridade && <span className="font-semibold">Prioridade = {initialPrioridade}</span>}
          {initialPosVendas && <span className="font-semibold">Pós-vendas = {initialPosVendas}</span>}
          {initialTipo && <span className="font-semibold">Tipo = {initialTipo}</span>}
          {initialFase && <span className="font-semibold">Fase = {initialFase}</span>}
          {initialOrigem && <span className="font-semibold">Origem = {initialOrigem}</span>}
          {initialSlaFaixa && <span className="font-semibold">SLA = {SLA_FAIXA_LABEL[initialSlaFaixa] ?? initialSlaFaixa}</span>}
          {initialFrom && <span className="font-semibold">Data = {initialFrom}{initialTo && initialTo !== initialFrom ? ` até ${initialTo}` : ""}</span>}
        </div>
      )}

      {/* Filter Panel */}
      <div className="mb-4 border border-zinc-200 rounded-xl overflow-hidden">
        {/* Header / Toggle */}
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            <span className="text-sm font-semibold text-zinc-700">Filtros</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold w-5 h-5">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">{sorted.length} resultado(s)</span>
            <svg
              className={`w-4 h-4 text-zinc-400 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Filter Body */}
        {filtersOpen && (
          <div className="px-4 py-4 flex flex-col gap-4 border-t border-zinc-100">
            {/* Busca */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">Busca</label>
              <input
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ticket, cliente, consultor, pedido..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {/* Linha 1: Status, Prioridade, Pós-vendas, Tipo */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">Classificação</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Status</span>
                  <select
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                  >
                    <option value="">Todos</option>
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Prioridade</span>
                  <select
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filterPrioridade}
                    onChange={(e) => { setFilterPrioridade(e.target.value); setPage(1); }}
                  >
                    <option value="">Todas</option>
                    {prioridades.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Pós-vendas</span>
                  <select
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filterPosVendas}
                    onChange={(e) => { setFilterPosVendas(e.target.value); setPage(1); }}
                  >
                    <option value="">Todos</option>
                    {agents.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Tipo do Problema</span>
                  <select
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filterTipo}
                    onChange={(e) => { setFilterTipo(e.target.value); setPage(1); }}
                  >
                    <option value="">Todos</option>
                    {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Linha 2: Fase, Origem, SLA, Período */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">Contexto & Período</label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Fase</span>
                  <select
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filterFase}
                    onChange={(e) => { setFilterFase(e.target.value); setPage(1); }}
                  >
                    <option value="">Todas</option>
                    {fases.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Origem</span>
                  <select
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filterOrigem}
                    onChange={(e) => { setFilterOrigem(e.target.value); setPage(1); }}
                  >
                    <option value="">Todas</option>
                    {origens.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Faixa de SLA</span>
                  <select
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filterSlaFaixa}
                    onChange={(e) => { setFilterSlaFaixa(e.target.value); setPage(1); }}
                  >
                    <option value="">Todas as faixas</option>
                    <option value="ok">0–5 dias (Bom)</option>
                    <option value="atencao">5–20 dias (Atenção)</option>
                    <option value="critico">&gt;20 dias (Crítico)</option>
                  </select>
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">De</span>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  />
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Até</span>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  />
                </div>
              </div>
            </div>

            {/* Rodapé */}
            {hasFilters && (
              <div className="flex justify-end border-t border-zinc-100 pt-3">
                <button
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                  onClick={clearAll}
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 font-semibold">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`pb-2 pr-3 cursor-pointer select-none whitespace-nowrap hover:text-zinc-800 ${col.className ?? ""}`}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  <SortIcon active={sortKey === col.key} dir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((t, i) => {
              const slaRaw = parseFloat(t.sla ?? "");
              const sla = isNaN(slaRaw) ? null : Math.max(0, slaRaw);
              const slaColor = sla === null
                ? "text-zinc-400"
                : sla <= 5
                ? "text-green-600 font-medium"
                : sla <= 20
                ? "text-yellow-600 font-medium"
                : "text-red-600 font-semibold";
              return (
                <tr key={t.ticket ?? i} className="border-b border-zinc-50 hover:bg-zinc-50 align-top">
                  <td className="py-2 pr-3 font-mono text-blue-600 font-medium">{t.ticket}</td>
                  <td className="py-2 pr-3">{badge(t.status, STATUS_BADGE, "bg-amber-50 text-amber-700")}</td>
                  <td className="py-2 pr-3">{badge(t.prioridade, PRIORITY_BADGE)}</td>
                  <td className="py-2 pr-3 max-w-[130px] truncate text-zinc-700" title={t.cliente ?? ""}>{t.cliente}</td>
                  <td className="py-2 pr-3 max-w-[160px] truncate text-zinc-600" title={t.assunto ?? ""}>{t.assunto}</td>
                  <td className="py-2 pr-3 max-w-[150px] truncate text-zinc-600" title={t.tipoProblema ?? ""}>{t.tipoProblema ?? <span className="text-zinc-300">—</span>}</td>
                  <td className="py-2 pr-3 text-zinc-500 whitespace-nowrap">{t.fase ?? <span className="text-zinc-300">—</span>}</td>
                  <td className="py-2 pr-3 text-zinc-600 whitespace-nowrap">{t.posVendas ?? <span className="text-zinc-300">—</span>}</td>
                  <td className="py-2 pr-3 text-zinc-500 whitespace-nowrap">{t.consultor ?? <span className="text-zinc-300">—</span>}</td>
                  <td className="py-2 pr-3 font-mono text-zinc-500 whitespace-nowrap">{t.pedidoNF ?? <span className="text-zinc-300">—</span>}</td>
                  <td className="py-2 pr-3 text-zinc-500 whitespace-nowrap">{t.dataAbertura}</td>
                  <td className="py-2 pr-3 text-zinc-500 whitespace-nowrap">{t.ultimoContato ?? <span className="text-zinc-300">—</span>}</td>
                  <td className="py-2 pr-3">{badge(t.ra, RA_BADGE)}</td>
                  <td className={`py-2 whitespace-nowrap ${slaColor}`}>{sla === null ? "—" : sla.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            className="text-sm text-zinc-500 hover:text-zinc-800 disabled:opacity-30"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Anterior
          </button>
          <span className="text-xs text-zinc-400">Página {page} de {totalPages}</span>
          <button
            className="text-sm text-zinc-500 hover:text-zinc-800 disabled:opacity-30"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  );
}
