"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  labelMap?: Record<string, string>;
}

export function MultiSelect({ options, value, onChange, placeholder, labelMap }: Props) {
  const display = (opt: string) => labelMap?.[opt] ?? opt;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const label =
    value.length === 0 ? placeholder :
    value.length === 1 ? display(value[0]) :
    `${value.length} selecionados`;

  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  }

  const active = value.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${
          active ? "border-blue-400 text-blue-700" : "border-zinc-200 text-zinc-700"
        }`}
      >
        <span className={`truncate mr-2 ${!active ? "text-zinc-400" : "font-medium"}`}>{label}</span>
        <svg
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""} ${active ? "text-blue-400" : "text-zinc-400"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && options.length > 0 && (
        <div className="absolute z-30 mt-1 w-full min-w-[180px] bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden">
          {active && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 border-b border-zinc-100 font-medium"
            >
              Limpar seleção
            </button>
          )}
          <div className="max-h-52 overflow-y-auto">
            {options.map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-zinc-50">
                <input
                  type="checkbox"
                  checked={value.includes(opt)}
                  onChange={() => toggle(opt)}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-400"
                />
                <span className="text-sm text-zinc-700 select-none">{display(opt)}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
