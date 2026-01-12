// js/main.js
// Orquestra fluxo + estado global do app
// Service Worker DESATIVADO propositalmente para evitar quebra no deploy

import * as storage from "./storage.js";
import {
  buildTherapySummary,
  nowIso,
  uid,
  safeTrim
} from "./utils.js";
import { initUI } from "./ui.js";


/* =========================
   CONSTANTES DE TELAS
========================= */
const SCREENS = {
  HOME: "home",
  CHECKIN: "checkin",
  DUMP: "dump",
  CLARITY: "clarity",
  PAUSE: "pause",
  TIMER: "timer",
  PAUSE_DONE: "pauseDone",
  FINISH: "finish",
  HISTORY: "history",
  DETAIL: "detail",
  CONFIG: "config"
};

/* =========================
   ESTADO GLOBAL DO APP
========================= */
const app = {
  ui: null,
  flow: null,
  currentDetailId: null,
  timer: {
    id: null,
    total: 0,
    remaining: 0,
    running: false,
    text: ""
  }
};

/* =========================
   BOOT
========================= */
boot();

function boot() {
  app.ui = initUI({
    onNavigate,
    onOpenHow,
    onStartFlow,
    onCancelFlow,

    onSendSomeone,
    onConfirmSend,



    onPickIntensity,
    onPickTheme,
    onCheckinNext,

    onDumpTextChange,
    onToggleSaveText,
    onClearDump,
    onDumpNext,

    onPickClarity,
    onClarityNext,
    onBackToDump,

    onPickPause,
    onPauseNext,
    onBackToClarity,

    onEndTimer,
    onPauseDoneNext,

    onFinishClose,
    onFinishHistory,

    onOpenDetail,
    onBackToHistory,
    onCopySummary,
    onRequestDeleteCurrent,
    onRequestClearAllData,

    onCloseModal: () => app.ui.closeModal()
  });

  // Tela inicial
  goHome();

  // 🚫 SERVICE WORKER DESATIVADO AQUI
   registerServiceWorkerSafely();
}

function onConfirmSend(choice) {
  if (choice === "none") return;
  if (!app.currentDetailId) return;

  const record = storage.getById(app.currentDetailId);
  if (!record) return;

  const text = buildWhatsAppText(record);

  // ✅ Preferência moderna (PWA / mobile)
  if (navigator.share) {
    navigator.share({
      text
    }).catch(() => {
      fallbackWhatsApp(text);
    });
    return;
  }

  // ✅ Fallback desktop / browsers antigos
  fallbackWhatsApp(text);
}

function fallbackWhatsApp(text) {
  const encoded = encodeURIComponent(text);
  const url = `https://wa.me/?text=${encoded}`;

  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.href = url;
  }
}



/* =========================
   NAVEGAÇÃO PRINCIPAL
========================= */
function onNavigate(target) {
  if (target === "home") goHome();
  if (target === "history") goHistory();
  if (target === "config") goConfig();
}

function goHome() {
  app.ui.setNavCurrent("home");
  app.ui.showScreen(SCREENS.HOME);
}

function goHistory() {
  app.ui.setNavCurrent("history");
  const records = storage.getAll();
  app.ui.renderHistory(records);
  app.ui.showScreen(SCREENS.HISTORY);
}

function goConfig() {
  app.ui.setNavCurrent("config");
  app.ui.showScreen(SCREENS.CONFIG);
}

function onOpenHow() {
  app.ui.openHowModal();
}

/* =========================
   FLUXO — CHECK-IN
========================= */
function onStartFlow() {
  app.flow = createEmptyCheckin();
  app.ui.renderCheckin(app.flow);
  app.ui.showScreen(SCREENS.CHECKIN);
}

function onCancelFlow() {
  app.flow = null;
  stopTimer();
  goHome();
}

function createEmptyCheckin() {
  return {
    id: uid(),
    created_at: nowIso(),
    intensity: null,
    theme: null,
    text: null,
    clarity_answer: null,
    micro_pause: null,
    deleted: false,

    // controle interno
    save_text: true,
    _draft_text: ""
  };
}

function onPickIntensity(intensity) {
  if (!app.flow) return;
  app.flow.intensity = intensity;
  app.ui.renderCheckin(app.flow);
}

function onPickTheme(theme) {
  if (!app.flow) return;
  const t = safeTrim(theme);
  app.flow.theme = t ? t : null;
  app.ui.renderCheckin(app.flow);
}

function onCheckinNext() {
  if (!app.flow || !app.flow.intensity) return;
  app.ui.renderDump(app.flow);
  app.ui.showScreen(SCREENS.DUMP);
}

/* =========================
   DESCARREGO
========================= */
function onDumpTextChange(text) {
  if (!app.flow) return;
  app.flow._draft_text = text;
}

function onToggleSaveText(value) {
  if (!app.flow) return;
  app.flow.save_text = value;
}

function onClearDump() {
  if (!app.flow) return;
  app.flow._draft_text = "";
  app.flow.save_text = false;
  app.ui.renderDump(app.flow);
}

function onDumpNext() {
  if (!app.flow) return;

  const cleaned = safeTrim(app.flow._draft_text);
  app.flow.text =
    app.flow.save_text && cleaned ? cleaned : null;

  app.ui.renderClarity(app.flow);
  app.ui.showScreen(SCREENS.CLARITY);
}

function onBackToDump() {
  if (!app.flow) return;
  app.ui.renderDump(app.flow);
  app.ui.showScreen(SCREENS.DUMP);
}

/* =========================
   CLAREZA
========================= */
function onPickClarity(answer) {
  if (!app.flow) return;
  app.flow.clarity_answer = answer;
  app.ui.renderClarity(app.flow);
}

function onClarityNext() {
  if (!app.flow || !app.flow.clarity_answer) return;
  app.ui.renderPause(app.flow);
  app.ui.showScreen(SCREENS.PAUSE);
}

function onBackToClarity() {
  if (!app.flow) return;
  app.ui.showScreen(SCREENS.CLARITY);
}

/* =========================
   MICRO-PAUSA
========================= */
function onPickPause(pause) {
  if (!app.flow) return;
  app.flow.micro_pause = pause;
  app.ui.renderPause(app.flow);
}

function onPauseNext() {
  if (!app.flow || !app.flow.micro_pause) return;

  if (app.flow.micro_pause === "respirar") {
    startTimer(60, "Inspire… solte… só acompanha.");
    return;
  }

  if (app.flow.micro_pause === "pausa") {
    startTimer(120, "Só fique aqui. Sem tarefa.");
    return;
  }

  app.ui.showScreen(SCREENS.PAUSE_DONE);
}

function startTimer(seconds, text) {
  stopTimer();

  app.timer.total = seconds;
  app.timer.remaining = seconds;
  app.timer.text = text;
  app.timer.running = true;

  app.ui.renderTimer({
    totalSeconds: seconds,
    remainingSeconds: seconds,
    text
  });

  app.ui.showScreen(SCREENS.TIMER);

  app.timer.id = setInterval(() => {
    app.timer.remaining--;

    if (app.timer.remaining <= 0) {
      stopTimer();
      app.ui.showScreen(SCREENS.PAUSE_DONE);
    } else {
      app.ui.updateTimer({
        totalSeconds: app.timer.total,
        remainingSeconds: app.timer.remaining
      });
    }
  }, 1000);
}

function onEndTimer() {
  stopTimer();
  app.ui.showScreen(SCREENS.PAUSE_DONE);
}

function stopTimer() {
  if (app.timer.id) clearInterval(app.timer.id);
  app.timer.id = null;
  app.timer.running = false;
}

/* =========================
   FINALIZAÇÃO
========================= */
function onPauseDoneNext() {
  app.ui.showScreen(SCREENS.FINISH);
}

function finalizeAndSave() {
  if (!app.flow) return;

  storage.add({
    id: app.flow.id,
    created_at: app.flow.created_at,
    intensity: app.flow.intensity,
    theme: app.flow.theme,
    text: app.flow.text,
    clarity_answer: app.flow.clarity_answer,
    micro_pause: app.flow.micro_pause,
    deleted: false
  });

  app.flow = null;
}

function onFinishClose() {
  finalizeAndSave();
  goHome();
}

function onFinishHistory() {
  finalizeAndSave();
  goHistory();
}

/* =========================
   HISTÓRICO / DETALHE
========================= */
function onOpenDetail(id) {
  app.currentDetailId = id;
  const record = storage.getById(id);
  app.ui.renderDetail(record);
  app.ui.showScreen(SCREENS.DETAIL);
}

function onBackToHistory() {
  app.currentDetailId = null;
  goHistory();
}

async function onCopySummary() {
  if (!app.currentDetailId) return;
  const record = storage.getById(app.currentDetailId);
  if (!record) return;

  const text = buildTherapySummary(record);

  try {
    await navigator.clipboard.writeText(text);
    app.ui.toast("Resumo copiado.");
  } catch {
    alert(text);
  }
}

function onRequestDeleteCurrent() {
  if (!app.currentDetailId) return;

  app.ui.openConfirmModal({
    title: "Deletar check-in?",
    message: "Esse registro será removido deste dispositivo.",
    confirmLabel: "Deletar",
    cancelLabel: "Cancelar",
    danger: true,
    onConfirm: () => {
      storage.remove(app.currentDetailId);
      app.currentDetailId = null;
      goHistory();
    }
  });
}

function onRequestClearAllData() {
  app.ui.openConfirmModal({
    title: "Limpar dados?",
    message: "Isso apaga todo o histórico local.",
    confirmLabel: "Apagar tudo",
    cancelLabel: "Cancelar",
    danger: true,
    onConfirm: () => {
      storage.clearAll();
      goHistory();
    }
  });
}

function onSendSomeone() {
  if (!app.currentDetailId) return;
  app.ui.openSendModal();
}


function buildWhatsAppText(record) {
  const lines = [];

  lines.push("Resumo de um check-in pessoal");
  lines.push("(feito no app Pausa Interna)");
  lines.push("");
  lines.push(`Quando: ${record.created_at}`);
  lines.push(`Como eu estava: ${record.intensity}`);
  if (record.theme) lines.push(`Tema: ${record.theme}`);
  lines.push(`Clareza: ${record.clarity_answer}`);
  if (record.micro_pause) lines.push(`Micro-pausa: ${record.micro_pause}`);

  if (record.text) {
    lines.push("");
    lines.push("Descarrego:");
    lines.push(record.text);
  }

  lines.push("");
  lines.push("Compartilho isso porque confio em você.");
  lines.push("Não precisa responder agora.");

  return lines.join("\n");
}
