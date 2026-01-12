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
  // registerServiceWorkerSafely();
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
  app.flow