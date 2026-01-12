// js/storage.js
// Persistência local (LocalStorage) isolada. Sem DOM.

const KEY = "pausa_interna_checkins_v1";

function readRaw() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeRaw(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

/**
 * Retorna todos os registros (mais recentes primeiro).
 */
export function getAll() {
  const items = readRaw();
  // Garantir ordenação por created_at desc
  return items
    .slice()
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

/**
 * Busca um registro por id.
 */
export function getById(id) {
  const items = readRaw();
  return items.find((x) => x && x.id === id) || null;
}

/**
 * Salva (insere) um novo registro.
 */
export function add(record) {
  const items = readRaw();
  items.push(record);
  writeRaw(items);
  return record;
}

/**
 * Remove por id (MVP remove direto; campo deleted fica para expansão futura).
 */
export function remove(id) {
  const items = readRaw().filter((x) => x && x.id !== id);
  writeRaw(items);
}

/**
 * Limpa tudo.
 */
export function clearAll() {
  localStorage.removeItem(KEY);
}

/**
 * Para debug/saúde: retorna quantidade.
 */
export function count() {
  return readRaw().length;
}