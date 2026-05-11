"use client";

import { useState, useMemo } from "react";
import { MultiSelect } from "./multi-select";

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
  initialStatus?: string[];
  initialPrioridade?: string[];
  initialPosVendas?: string[];
  initialTipo?: string[];
  initialFase?: string[];
  initialOrigem?: string[];
  initialRa?: string[];
  initialSlaFaixa?: string[];
  initialFrom?: string;
  initialTo?: string;
}

const SLA_FAIXA_OPTIONS = [
  { value: "ok",      label: "0–5 dias (Bom)" },
  { value: "atencao", label: "5–20 dias (Atenção)" },
  { value: "critico", label: ">20 dias (Crítico)" },
];

const SLA_FAIXA_LABEL: Record<string, string> = Object.fromEntries(
  SLA_FAIXA_OPTIONS.map((o) => [o.value, o.label])
);

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
  { label: "Ticket",        key: "ticket",       className: "w-20" },
  { label: "Status",        key: "status" },
  { label: "Prioridade",    key: "prioridade" },
  { label: "Cliente",       key: "cliente",      className: "min-w-[130px]" },
  { label: "Assunto",       key: "assunto",      className: "min-w-[160px]" },
  { label: "Tipo Problema", key: "tipoProblema", className: "min-w-[150px]" },
  { label: "Fase",          key: "fase" },
  { label: "Pós-vendas",   key: "posVendas" },
  { label: "Consultor",     key: "consultor" },
  { label: "Pedido / NF",  key: "pedidoNF" },
  { label: "Abertura",      key: "dataAbertura" },
  { label: "Últ. Contato", key: "ultimoContato" },
  { label: "RA",            key: "ra",           className: "w-16" },
  { label: "SLA",           key: "sla",          className: "w-16" },
];

export function TicketsTable({
  tickets,
  initialStatus = [],
  initialPrioridade = [],
  initialPosVendas = [],
  initialTipo = [],
  initialFase = [],
  initialOrigem = [],
  initialRa = [],
  initialSlaFaixa = [],
  initialFrom = "",
  initialTo = "",
}: Props) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string[]>(initialStatus);
  const [filterPrioridade, setFilterPrioridade] = useState<string[]>(initialPrioridade);
  const [filterPosVendas, setFilterPosVendas] = useState<string[]>(initialPosVendas);
  const [filterTipo, setFilterTipo] = useState<string[]>(initialTipo);
  const [filterFase, setFilterFase] = useState<string[]>(initialFase);
  const [filterOrigem, setFilterOrigem] = useState<string[]>(initialOrigem);
  const [filterRa, setFilterRa] = useState<string[]>(initialRa);
  const [filterSlaFaixa, setFilterSlaFaixa] = useState<string[]>(initialSlaFaixa);
  const [dateFrom, setDateFrom] = useState(initialFrom);
  const [dateTo, setDateTo] = useState(initialTo);
  const [sortKey, setSortKey] = useState<SortKey>("dataAbertura");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(
    !!(initialStatus.length || initialPrioridade.length || initialPosVendas.length ||
       initialTipo.length || initialFase.length || initialOrigem.length ||
       initialRa.length || initialSlaFaixa.length || initialFrom)
  );
  const perPage = 50;

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
      if (filterStatus.length > 0 && !filterStatus.includes(t.status ?? "")) return false;
      if (filterPrioridade.length > 0 && !filterPrioridade.includes(t.prioridade ?? "")) return false;
      if (filterPosVendas.length > 0 && !filterPosVendas.includes(t.posVendas ?? "")) return false;
      if (filterTipo.length > 0 && !filterTipo.includes(t.tipoProblema ?? "")) return false;
      if (filterFase.length > 0 && !filterFase.includes(t.fase ?? "")) return false;
      if (filterOrigem.length > 0 && !filterOrigem.includes(t.origem ?? "")) return false;
      if (filterRa.length > 0 && !filterRa.includes(t.ra ?? "")) return false;
      if (filterSlaFaixa.length > 0) {
        const raw = parseFloat(t.sla ?? "");
        const v = isNaN(raw) ? null : Math.max(0, raw);
        if (v === null) return false;
        const inFaixa = filterSlaFaixa.some((faixa) => {
          if (faixa === "ok")      return v <= 5;
          if (faixa === "atencao") return v > 5 && v <= 20;
          if (faixa === "critico") return v > 20;
          return false;
        });
        if (!inFaixa) return false;
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
  }, [tickets, search, filterStatus, filterPrioridade, filterPosVendas, filterTipo, filterFase, filterOrigem, filterRa, filterSlaFaixa, dateFromMs, dateToMs]);

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

  const hasFilters =
    search || filterStatus.length || filterPrioridade.length || filterPosVendas.length ||
    filterTipo.length || filterFase.length || filterOrigem.length || filterRa.length ||
    filterSlaFaixa.length || dateFrom || dateTo;

  const activeFilterCount = [
    filterStatus.length > 0,
    filterPrioridade.length > 0,
    filterPosVendas.length > 0,
    filterTipo.length > 0,
    filterFase.length > 0,
    filterOrigem.length > 0,
    filterRa.length > 0,
    filterSlaFaixa.length > 0,
    !!(dateFrom || dateTo),
  ].filter(Boolean).length;

  function clearAll() {
    setSearch("");
    setFilterStatus([]); setFilterPrioridade([]); setFilterPosVendas([]);
    setFilterTipo([]);   setFilterFase([]);        setFilterOrigem([]);
    setFilterRa([]);     setFilterSlaFaixa([]);
    setDateFrom(""); setDateTo("");
    setPage(1);
  }

  const hasInitialFilter =
    initialStatus.length || initialPrioridade.length || initialPosVendas.length ||
    initialTipo.length || initialFase.length || initialOrigem.length ||
    initialRa.length || initialSlaFaixa.length || initialFrom;

  function fmtList(arr: string[]) { return arr.join(", "); }

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5">
      {/* Banner */}
      {hasInitialFilter ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <span className="font-medium">Filtrado a partir do gráfico:</span>
          {initialStatus.length > 0    && <span className="font-semibold">Status = {fmtList(initialStatus)}</span>}
          {initialPrioridade.length > 0 && <span className="font-semibold">Prioridade = {fmtList(initialPrioridade)}</span>}
          {initialPosVendas.length > 0  && <span className="font-semibold">Pós-vendas = {fmtList(initialPosVendas)}</span>}
          {initialTipo.length > 0       && <span className="font-semibold">Tipo = {fmtList(initialTipo)}</span>}
          {initialFase.length > 0       && <span className="font-semibold">Fase = {fmtList(initialFase)}</span>}
          {initialOrigem.length > 0     && <span className="font-semibold">Origem = {fmtList(initialOrigem)}</span>}
          {initialRa.length > 0         && <span className="font-semibold">RA = {fmtList(initialRa)}</span>}
          {initialSlaFaixa.length > 0   && <span className="font-semibold">SLA = {initialSlaFaixa.map((f) => SLA_FAIXA_LABEL[f] ?? f).join(", ")}</span>}
          {initialFrom && <span className="font-semibold">Data = {initialFrom}{initialTo && initialTo !== initialFrom ? ` até ${initialTo}` : ""}</span>}
        </div>
      ) : null}

      {/* Filter Panel */}
      <div className="mb-4 border border-zinc-200 rounded-xl">
        <button
          className={`w-full flex items-center justify-between px-4 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left ${filtersOpen ? "rounded-t-xl" : "rounded-xl"}`}
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

            {/* Classificação */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">Classificação</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Status</span>
                  <MultiSelect options={statuses} value={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(1); }} placeholder="Todos" />
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Prioridade</span>
                  <MultiSelect options={prioridades} value={filterPrioridade} onChange={(v) => { setFilterPrioridade(v); setPage(1); }} placeholder="Todas" />
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Pós-vendas</span>
                  <MultiSelect options={agents} value={filterPosVendas} onChange={(v) => { setFilterPosVendas(v); setPage(1); }} placeholder="Todos" />
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Tipo do Problema</span>
                  <MultiSelect options={tipos} value={filterTipo} onChange={(v) => { setFilterTipo(v); setPage(1); }} placeholder="Todos" />
                </div>
              </div>
            </div>

            {/* Contexto */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">Contexto</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Fase</span>
                  <MultiSelect options={fases} value={filterFase} onChange={(v) => { setFilterFase(v); setPage(1); }} placeholder="Todas" />
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Origem</span>
                  <MultiSelect options={origens} value={filterOrigem} onChange={(v) => { setFilterOrigem(v); setPage(1); }} placeholder="Todas" />
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">RA</span>
                  <MultiSelect options={["Sim", "Não"]} value={filterRa} onChange={(v) => { setFilterRa(v); setPage(1); }} placeholder="Todos" />
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Faixa de SLA</span>
                  <MultiSelect
                    options={SLA_FAIXA_OPTIONS.map((o) => o.value)}
                    value={filterSlaFaixa}
                    onChange={(v) => { setFilterSlaFaixa(v); setPage(1); }}
                    placeholder="Todas as faixas"
                  />
                </div>
              </div>
            </div>

            {/* Período */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">Período de Abertura</label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
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

            {hasFilters ? (
              <div className="flex justify-end border-t border-zinc-100 pt-3">
                <button className="text-sm text-red-500 hover:text-red-700 font-medium" onClick={clearAll}>
                  Limpar filtros
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left text-xs text-zinc-500 font-semibold">
              {COLUMNS.flatMap((col, i) => {
                const th = (
                  <th
                    key={col.key}
                    className={`pb-2 pr-3 cursor-pointer select-none whitespace-nowrap hover:text-zinc-800 ${col.className ?? ""}`}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    <SortIcon active={sortKey === col.key} dir={sortDir} />
                  </th>
                );
                if (i === 1) return [<th key="__sla_dot" className="pb-2 pr-2 w-5" />, th];
                return [th];
              })}
            </tr>
          </thead>
          <tbody>
            {paginated.map((t, i) => {
              const slaRaw = parseFloat(t.sla ?? "");
              const sla = isNaN(slaRaw) ? null : Math.max(0, slaRaw);
              const slaColor =
                sla === null        ? "text-zinc-400" :
                sla <= 5            ? "text-green-600 font-medium" :
                sla <= 20           ? "text-yellow-600 font-medium" :
                                      "text-red-600 font-semibold";
              return (
                <tr key={t.ticket ?? i} className="border-b border-zinc-50 hover:bg-zinc-50 align-top">
                  <td className="py-2 pr-3 font-mono text-blue-600 font-medium">{t.ticket}</td>
                  <td className="py-2 pr-2">
                    {sla !== null && (
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          sla <= 5  ? "bg-green-500" :
                          sla <= 20 ? "bg-yellow-400" :
                                      "bg-red-500"
                        }`}
                        title={`SLA: ${sla.toFixed(1)} dias`}
                      />
                    )}
                  </td>
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
