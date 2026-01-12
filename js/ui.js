// js/ui.js
// Camada de UI: DOM, render, navegação e eventos. Sem regras de negócio.
// Recebe callbacks do main.js (orquestra).

import { formatDateTime, labelClarity, labelIntensity, labelPause, snippet } from "./utils.js";

export function initUI(handlers) {
  const els = cacheEls();

  // Navegação bottom
  els.bottomNav.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-nav]");
    if (!btn) return;
    handlers.onNavigate(btn.dataset.nav);
  });

  // Top "Como funciona"
  els.btnHowTop.addEventListener("click", () => handlers.onOpenHow());

  // Home
  els.btnStart.addEventListener("click", () => handlers.onStartFlow());
  els.btnHowHome.addEventListener("click", () => handlers.onOpenHow());

  // Check-in interactions
  els.screenCheckin.addEventListener("click", (e) => {
    const intBtn = e.target.closest("[data-intensity]");
    if (intBtn) {
      handlers.onPickIntensity(intBtn.dataset.intensity);
      return;
    }
    const themeBtn = e.target.closest("[data-theme]");
    if (themeBtn) {
      // data-theme pode ser "" (Não sei explicar)
      handlers.onPickTheme(themeBtn.dataset.theme || "");
      return;
    }
  });

  els.btnCheckinNext.addEventListener("click", () => handlers.onCheckinNext());
  els.btnCancelFlow1.addEventListener("click", () => handlers.onCancelFlow());

  // Dump
  els.dumpText.addEventListener("input", () => handlers.onDumpTextChange(els.dumpText.value));
  els.toggleSaveText.addEventListener("change", () => handlers.onToggleSaveText(els.toggleSaveText.checked));
  els.btnDumpNext.addEventListener("click", () => handlers.onDumpNext());
  els.btnClearDump.addEventListener("click", () => handlers.onClearDump());

  // Clarity
  els.screenClarity.addEventListener("change", (e) => {
    const input = e.target.closest('input[name="clarity"]');
    if (!input) return;
    handlers.onPickClarity(input.value);
  });
  els.btnClarityNext.addEventListener("click", () => handlers.onClarityNext());
  els.btnBackDump.addEventListener("click", () => handlers.onBackToDump());

  // Pause selection
  els.screenPause.addEventListener("click", (e) => {
    const p = e.target.closest("[data-pause]");
    if (!p) return;
    handlers.onPickPause(p.dataset.pause);
  });
  els.btnPauseNext.addEventListener("click", () => handlers.onPauseNext());
  els.btnBackClarity.addEventListener("click", () => handlers.onBackToClarity());

  // Timer
  els.btnEndTimer.addEventListener("click", () => handlers.onEndTimer());

  // Pause done
  els.btnPauseDoneNext.addEventListener("click", () => handlers.onPauseDoneNext());

  // Finish
  els.btnFinishClose.addEventListener("click", () => handlers.onFinishClose());
  els.btnFinishHistory.addEventListener("click", () => handlers.onFinishHistory());

  // History
  els.btnHistoryStart.addEventListener("click", () => handlers.onStartFlow());
  els.historyList.addEventListener("click", (e) => {
    const item = e.target.closest("[data-id]");
    if (!item) return;
    handlers.onOpenDetail(item.dataset.id);
  });

  // Detail
  els.btnBackHistory.addEventListener("click", () => handlers.onBackToHistory());
  els.btnCopySummary.addEventListener("click", () => handlers.onCopySummary());
  els.btnDeleteRecord.addEventListener("click", () => handlers.onRequestDeleteCurrent());

  // Config
  els.btnHowConfig.addEventListener("click", () => handlers.onOpenHow());
  els.btnClearAllData.addEventListener("click", () => handlers.onRequestClearAllData());

  // Modal close by backdrop
  els.modal.addEventListener("click", (e) => {
    const close = e.target.closest("[data-modal-close]");
    if (close) handlers.onCloseModal();
  });

  // Keyboard: ESC closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isModalOpen(els)) handlers.onCloseModal();
  });

  return {
    els,
    showScreen: (name) => showScreen(els, name),
    setNavCurrent: (name) => setNavCurrent(els, name),
    toast: (msg) => toast(els, msg),
    renderCheckin: (state) => renderCheckin(els, state),
    renderDump: (state) => renderDump(els, state),
    renderClarity: (state) => renderClarity(els, state),
    renderPause: (state) => renderPause(els, state),
    renderTimer: (payload) => renderTimer(els, payload),
    updateTimer: (payload) => updateTimer(els, payload),
    renderHistory: (records) => renderHistory(els, records),
    renderDetail: (record) => renderDetail(els, record),
    openHowModal: () => openHowModal(els),
    openConfirmModal: (opts) => openConfirmModal(els, opts),
    closeModal: () => closeModal(els),
  };
}

function cacheEls() {
  const q = (sel) => document.querySelector(sel);

  return {
    screens: Array.from(document.querySelectorAll("[data-screen]")),

    bottomNav: q(".bottom-nav"),
    navBtns: Array.from(document.querySelectorAll(".nav-btn")),

    btnHowTop: q("#btnHowTop"),
    btnStart: q("#btnStart"),
    btnHowHome: q("#btnHowHome"),

    screenCheckin: q('[data-screen="checkin"]'),
    btnCheckinNext: q("#btnCheckinNext"),
    btnCancelFlow1: q("#btnCancelFlow1"),

    dumpText: q("#dumpText"),
    toggleSaveText: q("#toggleSaveText"),
    btnDumpNext: q("#btnDumpNext"),
    btnClearDump: q("#btnClearDump"),

    screenClarity: q('[data-screen="clarity"]'),
    clarityHint: q("#clarityHint"),
    btnClarityNext: q("#btnClarityNext"),
    btnBackDump: q("#btnBackDump"),

    screenPause: q('[data-screen="pause"]'),
    btnPauseNext: q("#btnPauseNext"),
    btnBackClarity: q("#btnBackClarity"),

    screenTimer: q('[data-screen="timer"]'),
    timerTitle: q("#timerTitle"),
    timerText: q("#timerText"),
    timerCountdown: q("#timerCountdown"),
    timerBar: q("#timerBar"),
    btnEndTimer: q("#btnEndTimer"),

    btnPauseDoneNext: q("#btnPauseDoneNext"),

    btnFinishClose: q("#btnFinishClose"),
    btnFinishHistory: q("#btnFinishHistory"),

    historyEmpty: q("#historyEmpty"),
    historyList: q("#historyList"),
    btnHistoryStart: q("#btnHistoryStart"),

    detailBody: q("#detailBody"),
    btnBackHistory: q("#btnBackHistory"),
    btnCopySummary: q("#btnCopySummary"),
    btnDeleteRecord: q("#btnDeleteRecord"),

    btnHowConfig: q("#btnHowConfig"),
    btnClearAllData: q("#btnClearAllData"),

    toast: q("#toast"),

    modal: q("#modal"),
    modalTitle: q("#modalTitle"),
    modalBody: q("#modalBody"),
    modalActions: q("#modalActions"),
  };
}

function showScreen(els, name) {
  for (const s of els.screens) {
    const isTarget = s.dataset.screen === name;
    s.hidden = !isTarget;
  }

  // Foco no título da tela (acessibilidade)
  const active = els.screens.find((s) => s.dataset.screen === name);
  if (active) {
    const h1 = active.querySelector("h1");
    if (h1) {
      h1.setAttribute("tabindex", "-1");
      h1.focus({ preventScroll: true });
      // remove tabindex depois (evita ficar no tab-flow)
      setTimeout(() => h1.removeAttribute("tabindex"), 50);
    }
  }
}

function setNavCurrent(els, name) {
  for (const btn of els.navBtns) {
    const isCurrent = btn.dataset.nav === name;
    if (isCurrent) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  }
}

let toastTimer = null;
function toast(els, msg) {
  els.toast.textContent = msg;
  els.toast.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.style.display = "none";
    els.toast.textContent = "";
  }, 2400);
}

/* ---------- Renders ---------- */

export function renderCheckin(els, state) {
  // Intensidade
  const intButtons = els.screenCheckin.querySelectorAll("[data-intensity]");
  intButtons.forEach((b) => {
    const pressed = b.dataset.intensity === state.intensity;
    b.setAttribute("aria-pressed", pressed ? "true" : "false");
  });

  // Tema
  const themeButtons = els.screenCheckin.querySelectorAll("[data-theme]");
  themeButtons.forEach((b) => {
    const theme = b.dataset.theme || "";
    const pressed = theme === (state.theme || "");
    b.setAttribute("aria-pressed", pressed ? "true" : "false");
  });

  els.btnCheckinNext.disabled = !state.intensity;
}

export function renderDump(els, state) {
  // Não “força” texto: se o usuário está digitando, respeita.
  if (els.dumpText.value !== (state.text || "")) {
    els.dumpText.value = state.text || "";
  }
  els.toggleSaveText.checked = !!state.save_text;
}

export function renderClarity(els, state) {
  const radios = els.screenClarity.querySelectorAll('input[name="clarity"]');
  radios.forEach((r) => (r.checked = r.value === state.clarity_answer));

  els.btnClarityNext.disabled = !state.clarity_answer;

  const hint = clarityHintText(state.clarity_answer);
  els.clarityHint.textContent = hint || "";
}

function clarityHintText(answer) {
  if (answer === "acao") return "Tudo bem. Vamos pensar no menor passo possível.";
  if (answer === "acolhimento") return "Certo. Agora é sobre respirar e aliviar um pouco.";
  if (answer === "nao_sei") return "Tudo bem não saber. Vamos por leveza primeiro.";
  return "";
}

export function renderPause(els, state) {
  const cards = els.screenPause.querySelectorAll("[data-pause]");
  cards.forEach((c) => {
    const pressed = c.dataset.pause === state.micro_pause;
    c.setAttribute("aria-pressed", pressed ? "true" : "false");
  });
  els.btnPauseNext.disabled = !state.micro_pause;
}

export function renderTimer(els, payload) {
  // payload: { mode, totalSeconds, remainingSeconds, text }
  els.timerText.textContent = payload.text;
  els.timerCountdown.textContent = String(payload.remainingSeconds);
  els.timerBar.style.width = `${percentDone(payload.totalSeconds, payload.remainingSeconds)}%`;
}

export function updateTimer(els, payload) {
  els.timerCountdown.textContent = String(payload.remainingSeconds);
  els.timerBar.style.width = `${percentDone(payload.totalSeconds, payload.remainingSeconds)}%`;
}

function percentDone(total, remaining) {
  const done = total - remaining;
  const pct = total <= 0 ? 100 : Math.round((done / total) * 100);
  return Math.max(0, Math.min(100, pct));
}

export function renderHistory(els, records) {
  const has = records.length > 0;

  els.historyEmpty.hidden = has;
  els.historyList.hidden = !has;

  if (!has) {
    els.historyList.innerHTML = "";
    return;
  }

  els.historyList.innerHTML = records.map((r) => {
    const when = formatDateTime(r.created_at);
    const intensity = labelIntensity(r.intensity);
    const theme = r.theme ? r.theme : "—";
    const snippetText = r.text ? snippet(r.text, 90) : "";

    const intensityBadgeClass = r.intensity === "pesado" ? "danger" : "primary";

    return `
      <div class="item" role="button" tabindex="0" data-id="${escapeAttr(r.id)}" aria-label="Abrir check-in de ${when}">
        <div class="item-top">
          <div class="badges">
            <span class="badge">${escapeHtml(when)}</span>
            <span class="badge ${intensityBadgeClass}">${escapeHtml(intensity)}</span>
            <span class="badge">${escapeHtml(theme)}</span>
          </div>
          <span class="badge">${escapeHtml(labelClarity(r.clarity_answer))}</span>
        </div>
        ${snippetText ? `<div class="item-snippet">${escapeHtml(snippetText)}</div>` : ""}
      </div>
    `;
  }).join("");

  // Acessibilidade: Enter/Space abre
  els.historyList.querySelectorAll(".item").forEach((it) => {
    it.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        it.click();
      }
    });
  });
}

export function renderDetail(els, record) {
  if (!record) {
    els.detailBody.innerHTML = "<p class='body'>Registro não encontrado.</p>";
    return;
  }

  els.detailBody.innerHTML = `
    <div class="kv">
      <div class="k">Quando</div>
      <div class="v">${escapeHtml(formatDateTime(record.created_at))}</div>
    </div>
    <div class="kv">
      <div class="k">Como eu estava</div>
      <div class="v">${escapeHtml(labelIntensity(record.intensity))}</div>
    </div>
    <div class="kv">
      <div class="k">Tema</div>
      <div class="v">${escapeHtml(record.theme || "—")}</div>
    </div>
    <div class="kv">
      <div class="k">Clareza</div>
      <div class="v">${escapeHtml(labelClarity(record.clarity_answer))}</div>
    </div>
    <div class="kv">
      <div class="k">Micro-pausa</div>
      <div class="v">${escapeHtml(labelPause(record.micro_pause))}</div>
    </div>
    <div class="kv">
      <div class="k">Descarrego</div>
      <div class="v">${record.text ? escapeHtml(record.text) : "— (texto não foi salvo)"}</div>
    </div>
  `;
}

/* ---------- Modal ---------- */

function isModalOpen(els) {
  return els.modal.getAttribute("aria-hidden") === "false";
}

export function openHowModal(els) {
  const body = `
    <ul>
      <li>Você faz um check-in rápido.</li>
      <li>Solta os pensamentos sem se preocupar em organizar.</li>
      <li>A gente te faz uma pergunta de clareza.</li>
      <li>Você escolhe uma micro-pausa (se quiser).</li>
    </ul>
    <p style="margin-top:10px;">Leve, sem cobrança. Do seu jeito.</p>
  `;

  openModal(els, {
    title: "Como o Pausa Interna funciona",
    bodyHtml: body,
    actions: [
      { label: "Entendi", kind: "primary", onClick: "close" }
    ],
  });
}

export function openConfirmModal(els, opts) {
  // opts: { title, message, confirmLabel, cancelLabel, danger, onConfirm }
  openModal(els, {
    title: opts.title,
    bodyHtml: `<p>${escapeHtml(opts.message)}</p>`,
    actions: [
      { label: opts.cancelLabel || "Cancelar", kind: "secondary", onClick: "cancel" },
      { label: opts.confirmLabel || "Confirmar", kind: opts.danger ? "danger" : "primary", onClick: "confirm" },
    ],
    onConfirm: opts.onConfirm,
    onCancel: opts.onCancel,
  });
}

function openModal(els, config) {
  els.modalTitle.textContent = config.title || "Aviso";
  els.modalBody.innerHTML = config.bodyHtml || "";

  els.modalActions.innerHTML = "";
  for (const a of config.actions || []) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = a.label;

    if (a.kind === "primary") btn.className = "primary-btn";
    else if (a.kind === "danger") btn.className = "danger-btn";
    else btn.className = "secondary-btn";

    btn.addEventListener("click", () => {
      if (a.onClick === "close") closeModal(els);
      if (a.onClick === "confirm") {
        closeModal(els);
        if (typeof config.onConfirm === "function") config.onConfirm();
      }
      if (a.onClick === "cancel") {
        closeModal(els);
        if (typeof config.onCancel === "function") config.onCancel();
      }
    });

    els.modalActions.appendChild(btn);
  }

  els.modal.setAttribute("aria-hidden", "false");
  // foco no primeiro botão
  const firstBtn = els.modalActions.querySelector("button");
  if (firstBtn) firstBtn.focus();
}

export function closeModal(els) {
  els.modal.setAttribute("aria-hidden", "true");
  els.modalTitle.textContent = "";
  els.modalBody.innerHTML = "";
  els.modalActions.innerHTML = "";
}

/* ---------- Escapes ---------- */

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll(" ", "%20");
}