// js/ui.js
// UI (DOM only): renderização, navegação, eventos.
// NÃO faz persistência, NÃO chama WhatsApp, NÃO contém regra de negócio.

export function initUI(handlers) {
  const els = cacheEls();

  // --- SAFE EVENT LISTENERS ---
  // (Usamos ?. para evitar crash se o elemento não existir)

  // Top bar
  els.btnHowTop?.addEventListener("click", () => handlers.onOpenHow?.());

  // Home
  els.btnStart?.addEventListener("click", () => handlers.onStartFlow?.());
  els.btnHowHome?.addEventListener("click", () => handlers.onOpenHow?.());

  // Bottom nav
  if (els.navButtons) {
    els.navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-nav");
        if (target) handlers.onNavigate?.(target);
      });
    });
  }

  // Check-in: intensidade
  if (els.intensityBtns) {
    els.intensityBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = btn.getAttribute("data-intensity");
        if (v) handlers.onPickIntensity?.(v);
      });
    });
  }

  // Check-in: tema
  if (els.themeChips) {
    els.themeChips.forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = btn.getAttribute("data-theme");
        handlers.onPickTheme?.(v ?? "");
      });
    });
  }

  els.btnCheckinNext?.addEventListener("click", () => handlers.onCheckinNext?.());
  els.btnCancelFlow1?.addEventListener("click", () => handlers.onCancelFlow?.());

  // Descarrego
  els.dumpText?.addEventListener("input", () => {
    handlers.onDumpTextChange?.(els.dumpText.value);
  });

  els.toggleSaveText?.addEventListener("change", () => {
    handlers.onToggleSaveText?.(!!els.toggleSaveText.checked);
  });

  els.btnClearDump?.addEventListener("click", (e) => {
    e.preventDefault();
    handlers.onClearDump?.();
  });

  els.btnDumpNext?.addEventListener("click", () => handlers.onDumpNext?.());

  // Clareza
  if (els.clarityRadios) {
    els.clarityRadios.forEach((r) => {
      r.addEventListener("change", () => {
        if (r.checked) handlers.onPickClarity?.(r.value);
      });
    });
  }

  els.btnClarityNext?.addEventListener("click", () => handlers.onClarityNext?.());
  els.btnBackDump?.addEventListener("click", () => handlers.onBackToDump?.());

  // Micro-pausa
  if (els.pauseCards) {
    els.pauseCards.forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = btn.getAttribute("data-pause");
        if (v) handlers.onPickPause?.(v);
      });
    });
  }

  els.btnPauseNext?.addEventListener("click", () => handlers.onPauseNext?.());
  els.btnBackClarity?.addEventListener("click", () => handlers.onBackToClarity?.());

  // Timer
  els.btnEndTimer?.addEventListener("click", () => handlers.onEndTimer?.());

  // Pause done
  els.btnPauseDoneNext?.addEventListener("click", () => handlers.onPauseDoneNext?.());

  // Finish
  els.btnFinishClose?.addEventListener("click", () => handlers.onFinishClose?.());
  els.btnFinishHistory?.addEventListener("click", () => handlers.onFinishHistory?.());

  // History
  els.btnHistoryStart?.addEventListener("click", () => handlers.onStartFlow?.());

  // Detail
  els.btnBackHistory?.addEventListener("click", () => handlers.onBackToHistory?.());
  els.btnCopySummary?.addEventListener("click", () => handlers.onCopySummary?.());
  els.btnDeleteRecord?.addEventListener("click", () => handlers.onRequestDeleteCurrent?.());

  // Send
  els.btnSendSomeone?.addEventListener("click", () => handlers.onSendSomeone?.());

  // Config
  els.btnClearAllData?.addEventListener("click", () => handlers.onRequestClearAllData?.());
  els.btnHowConfig?.addEventListener("click", () => handlers.onOpenHow?.());
  els.btnThemeToggle?.addEventListener("click", () => handlers.onToggleTheme?.());


  // Modal base
  els.modal?.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.getAttribute && t.getAttribute("data-modal-close") === "true") {
      handlers.onCloseModal?.();
    }
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

    renderHistory: (records) => renderHistory(els, records, handlers.onOpenDetail),
    renderDetail: (record) => renderDetail(els, record),

    openHowModal: () => openHowModal(els),
    openConfirmModal: (opts) => openConfirmModal(els, opts),
    closeModal: () => closeModal(els),
    openSendModal: () => openSendModal(els, handlers.onConfirmSend),
    
    setThemeLabel: (mode) => setThemeLabel(els, mode),
  };
}

/* =========================
   Cache DOM
========================= */
function cacheEls() {
  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));

  return {
    screens: qa(".screen"),
    toast: q("#toast"),

    // Top
    btnHowTop: q("#btnHowTop"),

    // Home
    btnStart: q("#btnStart"),
    btnHowHome: q("#btnHowHome"),

    // Bottom nav
    navButtons: qa("[data-nav]"),

    // Check-in
    intensityBtns: qa("[data-intensity]"),
    themeChips: qa("[data-theme]"),
    btnCheckinNext: q("#btnCheckinNext"),
    btnCancelFlow1: q("#btnCancelFlow1"),

    // Dump
    dumpText: q("#dumpText"),
    toggleSaveText: q("#toggleSaveText"),
    btnDumpNext: q("#btnDumpNext"),
    btnClearDump: q("#btnClearDump"),

    // Clarity
    clarityRadios: qa('input[name="clarity"]'),
    clarityHint: q("#clarityHint"),
    btnClarityNext: q("#btnClarityNext"),
    btnBackDump: q("#btnBackDump"),

    // Pause
    pauseCards: qa("[data-pause]"),
    btnPauseNext: q("#btnPauseNext"),
    btnBackClarity: q("#btnBackClarity"),

    // Timer
    timerTitle: q("#timerTitle"),
    timerText: q("#timerText"),
    timerCountdown: q("#timerCountdown"),
    timerBar: q("#timerBar"),
    btnEndTimer: q("#btnEndTimer"),

    // Pause done
    btnPauseDoneNext: q("#btnPauseDoneNext"),

    // Finish
    btnFinishClose: q("#btnFinishClose"),
    btnFinishHistory: q("#btnFinishHistory"),

    // History
    historyEmpty: q("#historyEmpty"),
    historyList: q("#historyList"),
    btnHistoryStart: q("#btnHistoryStart"),

    // Detail
    detailBody: q("#detailBody"),
    btnSendSomeone: q("#btnSendSomeone"),
    btnCopySummary: q("#btnCopySummary"),
    btnDeleteRecord: q("#btnDeleteRecord"),
    btnBackHistory: q("#btnBackHistory"),

    // Config
    btnClearAllData: q("#btnClearAllData"),
    btnHowConfig: q("#btnHowConfig"),
    btnThemeToggle: q("#btnThemeToggle"),

    // Modal
    modal: q("#modal"),
    modalTitle: q("#modalTitle"),
    modalBody: q("#modalBody"),
    modalActions: q("#modalActions"),
  };
}

/* =========================
   Funções de UI
========================= */
function showScreen(els, name) {
  if(!els.screens) return;
  els.screens.forEach((sec) => {
    const id = sec.getAttribute("data-screen");
    const isTarget = id === name;
    sec.hidden = !isTarget;
  });

  const active = els.screens.find((s) => !s.hidden);
  if (active) {
    const title = active.querySelector("h1, h2, .title");
    if (title && typeof title.focus === "function") {
      try { title.focus(); } catch {}
    }
  }
}

function setNavCurrent(els, name) {
  if(!els.navButtons) return;
  els.navButtons.forEach((btn) => {
    const t = btn.getAttribute("data-nav");
    const isCurrent = t === name;
    btn.classList.toggle("is-current", isCurrent);
    btn.setAttribute("aria-current", isCurrent ? "page" : "false");
  });
}

function toast(els, msg) {
  if (!els.toast) return;
  els.toast.textContent = msg;
  els.toast.classList.add("show");
  window.clearTimeout(els.toast._t);
  els.toast._t = window.setTimeout(() => els.toast.classList.remove("show"), 2000);
}

function renderCheckin(els, state) {
  els.intensityBtns.forEach((btn) => {
    const v = btn.getAttribute("data-intensity");
    const active = v === state.intensity;
    btn.classList.toggle("selected", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  els.themeChips.forEach((btn) => {
    const v = btn.getAttribute("data-theme");
    const active = (v ?? "") === (state.theme ?? "");
    btn.classList.toggle("selected", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  if (els.btnCheckinNext) {
    els.btnCheckinNext.disabled = !state.intensity;
  }
}

function renderDump(els, state) {
  if (els.dumpText) els.dumpText.value = state._draft_text ?? "";
  if (els.toggleSaveText) els.toggleSaveText.checked = !!state.save_text;
}

function renderClarity(els, state) {
  els.clarityRadios.forEach((r) => {
    r.checked = r.value === state.clarity_answer;
  });

  if (els.clarityHint) {
    els.clarityHint.textContent = clarityHintFor(state.clarity_answer);
  }

  if (els.btnClarityNext) {
    els.btnClarityNext.disabled = !state.clarity_answer;
  }
}

function clarityHintFor(v) {
  if (v === "acao") return "Tudo bem. Vamos pensar no menor passo possível.";
  if (v === "acolhimento") return "Certo. Agora é sobre respirar e aliviar um pouco.";
  if (v === "nao_sei") return "Tudo bem não saber. Vamos por leveza primeiro.";
  return "";
}

function renderPause(els, state) {
  els.pauseCards.forEach((btn) => {
    const v = btn.getAttribute("data-pause");
    const active = v === state.micro_pause;
    btn.classList.toggle("selected", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });

  if (els.btnPauseNext) {
    els.btnPauseNext.disabled = !state.micro_pause;
  }
}

function renderTimer(els, payload) {
  const { totalSeconds, remainingSeconds, text } = payload;

  if (els.timerTitle) {
    els.timerTitle.textContent = totalSeconds === 60 ? "Respirar 60s" : "Pausa de 2 min";
  }
  if (els.timerText) els.timerText.textContent = text || "";
  if (els.timerCountdown) els.timerCountdown.textContent = formatCountdown(remainingSeconds);
  if (els.timerBar) els.timerBar.style.width = progressPct(totalSeconds, remainingSeconds) + "%";
}

function updateTimer(els, payload) {
  const { totalSeconds, remainingSeconds } = payload;
  if (els.timerCountdown) els.timerCountdown.textContent = formatCountdown(remainingSeconds);
  if (els.timerBar) els.timerBar.style.width = progressPct(totalSeconds, remainingSeconds) + "%";
}

function formatCountdown(seconds) {
  const s = Math.max(0, Number(seconds) || 0);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function progressPct(total, remaining) {
  const t = Math.max(1, Number(total) || 1);
  const r = Math.max(0, Number(remaining) || 0);
  const done = t - r;
  return Math.round((done / t) * 100);
}

function renderHistory(els, records, onOpenDetail) {
  const list = els.historyList;
  const empty = els.historyEmpty;

  if (!list || !empty) return;

  const items = (records || []).slice().sort((a, b) => {
    return (b.created_at || "").localeCompare(a.created_at || "");
  });

  if (items.length === 0) {
    empty.hidden = false;
    list.innerHTML = "";
    return;
  }

  empty.hidden = true;
  list.innerHTML = "";

  items.forEach((r) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "item";
    card.setAttribute("aria-label", "Abrir detalhe do check-in");

    const dt = formatDateTime(r.created_at);
    const theme = r.theme ? ` • ${r.theme}` : "";
    const snippet = r.text ? escapeHtml(r.text).slice(0, 80) : "";

    card.innerHTML = `
      <div class="item-top">
        <div class="item-title">${dt}</div>
        <div class="item-meta">${escapeHtml(r.intensity || "")}${theme}</div>
      </div>
      ${snippet ? `<div class="item-snippet">${snippet}${r.text && r.text.length > 80 ? "…" : ""}</div>` : ""}
    `;

    card.addEventListener("click", () => onOpenDetail?.(r.id));
    list.appendChild(card);
  });
}

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso || "");
  }
}

function renderDetail(els, record) {
  if (!els.detailBody) return;

  if (!record) {
    els.detailBody.innerHTML = `<p class="body">Registro não encontrado.</p>`;
    return;
  }

  const dt = formatDateTime(record.created_at);
  const theme = record.theme ? escapeHtml(record.theme) : "—";
  const text = record.text ? escapeHtml(record.text) : "—";
  const clarity = record.clarity_answer ? escapeHtml(record.clarity_answer) : "—";
  const pause = record.micro_pause ? escapeHtml(record.micro_pause) : "—";
  const intensity = record.intensity ? escapeHtml(record.intensity) : "—";

  els.detailBody.innerHTML = `
    <div class="detail-row"><span class="label">Quando</span><span class="value">${dt}</span></div>
    <div class="detail-row"><span class="label">Intensidade</span><span class="value">${intensity}</span></div>
    <div class="detail-row"><span class="label">Tema</span><span class="value">${theme}</span></div>
    <div class="detail-row"><span class="label">Clareza</span><span class="value">${clarity}</span></div>
    <div class="detail-row"><span class="label">Micro-pausa</span><span class="value">${pause}</span></div>
    <div class="detail-block">
      <div class="label">Texto</div>
      <div class="value pre">${text}</div>
    </div>
  `;
}

function openModal(els, { title, bodyHtml, actions }) {
  if (!els.modal || !els.modalTitle || !els.modalBody || !els.modalActions) return;

  els.modalTitle.textContent = title || " ";
  els.modalBody.innerHTML = bodyHtml || "";
  els.modalActions.innerHTML = "";

  (actions || []).forEach((a) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      a.kind === "danger" ? "danger-btn" :
      a.kind === "secondary" ? "secondary-btn" :
      "primary-btn";
    btn.textContent = a.label || "OK";
    btn.addEventListener("click", () => a.onClick?.());
    els.modalActions.appendChild(btn);
  });

  els.modal.classList.add("open");
  els.modal.setAttribute("aria-hidden", "false");
}

function closeModal(els) {
  if (!els.modal) return;
  els.modal.classList.remove("open");
  els.modal.setAttribute("aria-hidden", "true");
  if (els.modalBody) els.modalBody.innerHTML = "";
  if (els.modalActions) els.modalActions.innerHTML = "";
}

function openHowModal(els) {
  openModal(els, {
    title: "Como o Pausa Interna funciona",
    bodyHtml: `
      <ul class="bullets">
        <li>Você faz um check-in rápido.</li>
        <li>Solta os pensamentos sem se preocupar em organizar.</li>
        <li>A gente te faz uma pergunta de clareza.</li>
        <li>Você escolhe uma micro-pausa (se quiser).</li>
      </ul>
      <p class="body">Leve, sem cobrança. Do seu jeito.</p>
    `,
    actions: [
      { label: "Entendi", kind: "primary", onClick: () => closeModal(els) },
    ],
  });
}

function openConfirmModal(els, opts) {
  const {
    title = "Confirmar",
    message = "",
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    danger = false,
    onConfirm,
  } = opts || {};

  openModal(els, {
    title,
    bodyHtml: `<p class="body">${escapeHtml(message)}</p>`,
    actions: [
      { label: cancelLabel, kind: "secondary", onClick: () => closeModal(els) },
      { label: confirmLabel, kind: danger ? "danger" : "primary", onClick: () => { closeModal(els); onConfirm?.(); } },
    ],
  });
}

function openSendModal(els, onConfirmSend) {
  openModal(els, {
    title: "Enviar este resumo",
    bodyHtml: `
      <p class="body">Este texto é seu. Envie apenas se fizer sentido agora.</p>

      <div class="radio-group" role="radiogroup" aria-label="Destino do envio">
        <label class="radio">
          <input type="radio" name="sendTo" value="me" />
          <span>Para mim mesmo(a)</span>
        </label>

        <label class="radio">
          <input type="radio" name="sendTo" value="therapist" />
          <span>Para minha terapeuta</span>
        </label>

        <label class="radio">
          <input type="radio" name="sendTo" value="other" />
          <span>Para outra pessoa</span>
        </label>

        <label class="radio">
          <input type="radio" name="sendTo" value="none" />
          <span>Prefiro não enviar agora</span>
        </label>
      </div>

      <p class="help subtle">
        O Pausa Interna não envia mensagens sozinho.
        Você escolhe o contato e confirma no WhatsApp.
      </p>
    `,
    actions: [
      { label: "Cancelar", kind: "secondary", onClick: () => closeModal(els) },
      {
        label: "Continuar",
        kind: "primary",
        onClick: () => {
          const checked = document.querySelector('input[name="sendTo"]:checked');
          if (!checked) return;
          closeModal(els);
          if (typeof onConfirmSend === "function") {
            onConfirmSend(checked.value);
          }
        },
      },
    ],
  });
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setThemeLabel(els, mode) {
  // Proteção: verifica se o botão existe antes de mudar texto
  if (!els.btnThemeToggle) return;
  
  if (mode === "light") {
    els.btnThemeToggle.textContent = "Usar tema escuro";
  } else {
    els.btnThemeToggle.textContent = "Usar tema claro";
  }
}