// js/utils.js
// Helpers pequenos, puros, sem DOM.

export function nowIso() {
  return new Date().toISOString();
}

export function uid() {
  // ID simples (suficiente para MVP). Evita dependências.
  return `pi_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function safeTrim(str) {
  if (typeof str !== "string") return "";
  return str.trim();
}

export function snippet(text, maxLen = 80) {
  const t = safeTrim(text);
  if (!t) return "";
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen - 1) + "…";
}

export function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    const dd = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const hh = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${dd} • ${hh}`;
  } catch {
    return iso;
  }
}

export function labelIntensity(intensity) {
  if (intensity === "leve") return "Leve";
  if (intensity === "neutro") return "Neutro";
  if (intensity === "pesado") return "Pesado";
  return "—";
}

export function labelClarity(answer) {
  if (answer === "acao") return "Ação (um passo pequeno)";
  if (answer === "acolhimento") return "Acolhimento";
  if (answer === "nao_sei") return "Não sei";
  return "—";
}

export function labelPause(pause) {
  if (pause === "respirar") return "Respirar 60s";
  if (pause === "pausa") return "Pausa de 2 min";
  if (pause === "alongar") return "Alongar";
  if (pause === "agua") return "Água";
  if (pause === "pular") return "Pulou por agora";
  return "—";
}

/**
 * Monta um resumo pronto (para copiar).
 * Linguagem humana e não-clínica.
 */
export function buildTherapySummary(record) {
  const lines = [];
  lines.push("Resumo do meu check-in (Pausa Interna)");
  lines.push("-----------------------------------");
  lines.push(`Quando: ${formatDateTime(record.created_at)}`);
  lines.push(`Como eu estava: ${labelIntensity(record.intensity)}`);

  if (record.theme) lines.push(`Tema: ${record.theme}`);
  lines.push(`Clareza: ${labelClarity(record.clarity_answer)}`);

  if (record.micro_pause) lines.push(`Micro-pausa: ${labelPause(record.micro_pause)}`);

  if (record.text) {
    lines.push("");
    lines.push("Descarrego:");
    lines.push(record.text);
  }

  lines.push("");
  lines.push("Observação: este app não é terapia; é um apoio leve para organização interna.");
  return lines.join("\n");
}