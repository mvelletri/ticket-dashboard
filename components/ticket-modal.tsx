"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { TicketRow } from "./tickets-table";

interface Props {
  ticket: TicketRow;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-zinc-800">{value ?? <span className="text-zinc-300">—</span>}</p>
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  "Concluído":  "bg-green-100 text-green-700",
  "Encerrado":  "bg-zinc-100 text-zinc-500",
};
const PRIORITY_COLORS: Record<string, string> = {
  P1: "bg-red-100 text-red-700",
  P2: "bg-orange-100 text-orange-700",
  P3: "bg-yellow-100 text-yellow-700",
};

export function TicketModal({ ticket, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const slaRaw = parseFloat(ticket.sla ?? "");
  const sla = isNaN(slaRaw) ? null : Math.max(0, slaRaw);
  const slaDot = sla === null ? null : sla <= 5 ? "bg-green-500" : sla <= 20 ? "bg-yellow-400" : "bg-red-500";
  const slaLabel = sla === null ? "—" : sla <= 5 ? "Bom (0–5 dias)" : sla <= 20 ? "Atenção (5–20 dias)" : "Crítico (>20 dias)";
  const slaColor = sla === null ? "text-zinc-400" : sla <= 5 ? "text-green-600" : sla <= 20 ? "text-yellow-600" : "text-red-600";

  const content = (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal / bottom sheet */}
      <div className="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col">

        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-zinc-300" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-4 pb-4 border-b border-zinc-100">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              {slaDot && <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${slaDot}`} />}
              <span className="text-xl font-bold text-zinc-900">Ticket #{ticket.ticket}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {ticket.status && (
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[ticket.status] ?? "bg-amber-50 text-amber-700"}`}>
                  {ticket.status}
                </span>
              )}
              {ticket.prioridade && (
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[ticket.prioridade] ?? "bg-zinc-100 text-zinc-600"}`}>
                  {ticket.prioridade}
                </span>
              )}
              {ticket.ra === "Sim" && (
                <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700">RA</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-700 flex-shrink-0 mt-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-6">

          {/* Cliente */}
          <section>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Cliente</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Nome" value={ticket.cliente} />
              <Field label="Telefone" value={ticket.telefone} />
              <Field label="Origem" value={ticket.origem} />
            </div>
          </section>

          {/* Ticket */}
          <section>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Ticket</h3>
            <div className="flex flex-col gap-4">
              <Field label="Assunto" value={ticket.assunto} />
              {ticket.descricao && <Field label="Descrição" value={ticket.descricao} />}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4">
              <Field label="Tipo do Problema" value={ticket.tipoProblema} />
              <Field label="Fase" value={ticket.fase} />
            </div>
          </section>

          {/* SLA */}
          <section>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">SLA</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">Dias</p>
                <p className={`text-sm font-semibold ${slaColor}`}>
                  {sla === null ? "—" : `${sla.toFixed(1)} dias`}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-0.5">Faixa</p>
                <p className={`text-sm font-semibold ${slaColor}`}>{slaLabel}</p>
              </div>
            </div>
          </section>

          {/* Equipe */}
          <section>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Equipe</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Pós-vendas" value={ticket.posVendas} />
              <Field label="Consultor" value={ticket.consultor} />
              <Field label="Responsável" value={ticket.responsavel} />
            </div>
          </section>

          {/* Datas & Pedido */}
          <section>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Datas & Pedido</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Data de Abertura" value={ticket.dataAbertura} />
              <Field label="Último Contato" value={ticket.ultimoContato} />
              <Field label="Pedido / NF" value={ticket.pedidoNF} />
              <Field label="Data do Pedido" value={ticket.dataPedido} />
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            Fechar
          </button>
          <a
            href={ticket.sheetsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Abrir no Google Sheets
          </a>
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(content, document.body);
}
