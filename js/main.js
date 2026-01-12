// js/main.js
// Orquestra fluxo + estado. Não renderiza DOM diretamente.

import * as storage from "./storage.js";
import { buildTherapySummary, nowIso, uid, safeTrim } from "./utils.js";
import { initUI } from "./ui.js";

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
  CONFIG: "config",
};

const app = {
  ui: null,
  currentNav: SCREENS.HOME,

  // Estado de fluxo (não persiste até o final)
  flow: null,

  // Detalhe selecionado
  currentDetailId: null,

  // Timer (micro-pausa)
  timer: {
    id: null,
    total: 0,
    remaining: 0,
    running: false,
    text: "",
  },
};

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

    onCloseModal: () => app.ui.closeModal(),
  });

  // Primeira tela
  goHome();

  // PWA SW (somente em contexto https/localhost)
  registerServiceWorkerSafely();
}

/* ---------------- Navigation ---------------- */

function onNavigate(target) {
  // target: "home" | "history" | "config"
  if (target === "home") goHome();
  if (target === "history") goHistory();
  if (target === "config") goConfig();
}

function goHome() {
  app.currentNav = SCREENS.HOME;
  app.ui.setNavCurrent("home");
  app.ui.showScreen(SCREENS.HOME);
}

function goHistory() {
  app.currentNav = SCREENS.HISTORY;
  app.ui.setNavCurrent("history");

  const records = storage.getAll();
  app.ui.renderHistory(records);

  app.ui.showScreen(SCREENS.HISTORY);
}

function goConfig() {
  app.currentNav = SCREENS.CONFIG;
  app.ui.setNavCurrent("config");
  app.ui.showScreen(SCREENS.CONFIG);
}

function onOpenHow() {
  app.ui.openHowModal();
}

function onStartFlow() {
  // Novo objeto em memória
  app.flow = createEmptyCheckin();
  app.ui.setNavCurrent("home"); // mantém nav "Início" durante fluxo
  app.ui.renderCheckin(app.flow);
  app.ui.showScreen(SCREENS.CHECKIN);
}

function onCancelFlow() {
  if (!app.flow) {
    goHome();
    return;
  }

  app.ui.openConfirmModal({
    title: "Sair do check-in?",
    message: "Se você sair agora, este check-in não será salvo. Quer voltar para o início?",
    confirmLabel: "Sair",
    cancelLabel: "Ficar",
    danger: false,
    onConfirm: () => {
      app.flow = null;
      stopTimer();
      goHome();
      app.ui.toast("Tudo bem. Você pode voltar quando quiser.");
    },
  });
}

/* ---------------- Flow: Check-in ---------------- */

function createEmptyCheckin() {
  return {
    id: uid(),
    created_at: nowIso(),
    intensity: null, // "leve" | "neutro" | "pesado"
    theme: null, // string | null
    text: null, // string | null (pode ser null se não salvar)
    clarity_answer: null, // "acao" | "acolhimento" | "nao_sei"
    micro_pause: null, // "respirar" | "pausa" | "alongar" | "agua" | "pular" | null
    deleted: false,

    // interno do fluxo (não persiste no modelo final)
    save_text: true,
    _draft_text: "",
  };
}

function onPickIntensity(intensity) {
  if (!app.flow) return;
  app.flow.intensity = intensity;
  app.ui.renderCheckin(app.flow);
}

function onPickTheme(theme) {
  if (!app.flow) return;

  // "Não sei explicar" vem como "" -> vira null (sem tema)
  const t = safeTrim(theme);
  app.flow.theme = t ? t : null;

  app.ui.renderCheckin(app.flow);
}

function onCheckinNext() {
  if (!app.flow) return;
  if (!app.flow.intensity) return;

  // Preparar descarrego (sem persistir ainda)
  app.ui.renderDump({
    text: app.flow._draft_text || "",
    save_text: app.flow.save_text,
  });

  app.ui.showScreen(SCREENS.DUMP);
}

/* ---------------- Flow: Descarrego ---------------- */

function onDumpTextChange(text) {
  if (!app.flow) return;
  app.flow._draft_text = text;
}

function onToggleSaveText(checked) {
  if (!app.flow) return;
  app.flow.save_text = !!checked;
}

function onClearDump() {
  if (!app.flow) return;

  // Regra: limpa o campo e desmarca "Salvar texto" momentaneamente
  app.flow._draft_text = "";
  app.flow.save_text = false;

  app.ui.renderDump({
    text: "",
    save_text: false,
  });

  app.ui.toast("Ok. Texto limpo (sem salvar por enquanto).");
}

function onDumpNext() {
  if (!app.flow) return;

  // Aplicar regra: se save_text = false, text vai ser null
  const cleaned = safeTrim(app.flow._draft_text);
  app.flow.text = app.flow.save_text ? (cleaned ? cleaned : "") : null;

  // se save_text true mas vazio -> salva string vazia? Melhor: null para reduzir ruído.
  if (app.flow.save_text && !cleaned) app.flow.text = null;

  app.ui.renderClarity(app.flow);
  app.ui.showScreen(SCREENS.CLARITY);
}

function onBackToDump() {
  if (!app.flow) return;
  app.ui.renderDump({ text: app.flow._draft_text || "", save_text: app.flow.save_text });
  app.ui.showScreen(SCREENS.DUMP);
}

/* ---------------- Flow: Clareza ---------------- */

function onPickClarity(answer) {
  if (!app.flow) return;
  app.flow.clarity_answer = answer;
  app.ui.renderClarity(app.flow);
}

function onClarityNext() {
  if (!app.flow) return;
  if (!app.flow.clarity_answer) return;

  app.ui.renderPause(app.flow);
  app.ui.showScreen(SCREENS.PAUSE);
}

function onBackToClarity() {
  if (!app.flow) return;
  app.ui.renderClarity(app.flow);
  app.ui.showScreen(SCREENS.CLARITY);
}

/* ---------------- Flow: Micro-pausa ---------------- */

function onPickPause(pause) {
  if (!app.flow) return;
  app.flow.micro_pause = pause;
  app.ui.renderPause(app.flow);
}

function onPauseNext() {
  if (!app.flow) return;
  if (!app.flow.micro_pause) return;

  if (app.flow.micro_pause === "respirar") {
    startTimer({
      totalSeconds: 60,
      text: "Inspire… solte… só acompanha.",
    });
    return;
  }

  if (app.flow.micro_pause === "pausa") {
    startTimer({
      totalSeconds: 120,
      text: "Só fique aqui. Sem tarefa.",
    });
    return;
  }

  // Alongar / Água / Pular: vai direto para “Feito”
  app.ui.showScreen(SCREENS.PAUSE_DONE);
}

function startTimer({ totalSeconds, text }) {
  stopTimer();

  app.timer.total = totalSeconds;
  app.timer.remaining = totalSeconds;
  app.timer.text = text;
  app.timer.running = true;

  app.ui.renderTimer({
    totalSeconds: app.timer.total,
    remainingSeconds: app.timer.remaining,
    text: app.timer.text,
  });

  app.ui.showScreen(SCREENS.TIMER);

  app.timer.id = window.setInterval(() => {
    if (!app.timer.running) return;
    app.timer.remaining -= 1;

    if (app.timer.remaining <= 0) {
      stopTimer();
      app.ui.showScreen(SCREENS.PAUSE_DONE);
      return;
    }

    app.ui.updateTimer({
      totalSeconds: app.timer.total,
      remainingSeconds: app.timer.remaining,
    });
  }, 1000);
}

function onEndTimer() {
  stopTimer();
  app.ui.showScreen(SCREENS.PAUSE_DONE);
}

function stopTimer() {
  app.timer.running = false;
  if (app.timer.id) {
    clearInterval(app.timer.id);
    app.timer.id = null;
  }
}

function onPauseDoneNext() {
  app.ui.showScreen(SCREENS.FINISH);
}

/* ---------------- Flow: Finish + Persist ---------------- */

function finalizeRecordAndPersist() {
  if (!app.flow) return null;

  // Garante compatibilidade com o modelo pedido
  const record = {
    id: app.flow.id,
    created_at: app.flow.created_at,
    intensity: app.flow.intensity,
    theme: app.flow.theme,
    text: app.flow.text, // pode ser null
    clarity_answer: app.flow.clarity_answer,
    micro_pause: app.flow.micro_pause,
    deleted: false,
  };

  storage.add(record);

  // Limpa estado do fluxo
  app.flow = null;
  stopTimer();
  return record;
}

function onFinishClose() {
  const saved = finalizeRecordAndPersist();
  goHome();
  if (saved) app.ui.toast("Check-in salvo com gentileza. 💛");
}

function onFinishHistory() {
  const saved = finalizeRecordAndPersist();
  goHistory();
  if (saved) app.ui.toast("Salvo. Seu histórico foi atualizado.");
}

/* ---------------- History / Detail ---------------- */

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
    app.ui.toast("Resumo copiado. Leve com você quando quiser.");
  } catch {
    // Fallback: seleção manual via modal
    app.ui.openConfirmModal({
      title: "Copiar resumo",
      message: "Não consegui copiar automaticamente. Quer abrir o texto para copiar manualmente?",
      confirmLabel: "Abrir",
      cancelLabel: "Fechar",
      onConfirm: () => {
        app.ui.openConfirmModal({
          title: "Resumo (copie manualmente)",
          message: text,
          confirmLabel: "Fechar",
          cancelLabel: "—",
          onConfirm: () => {},
          onCancel: () => {},
        });
      },
    });
  }
}

function onRequestDeleteCurrent() {
  if (!app.currentDetailId) return;

  app.ui.openConfirmModal({
    title: "Deletar este check-in?",
    message: "Isso remove o registro do seu histórico neste dispositivo.",
    confirmLabel: "Deletar",
    cancelLabel: "Cancelar",
    danger: true,
    onConfirm: () => {
      storage.remove(app.currentDetailId);
      app.currentDetailId = null;
      goHistory();
      app.ui.toast("Registro removido.");
    },
  });
}

function onRequestClearAllData() {
  app.ui.openConfirmModal({
    title: "Limpar todos os dados?",
    message: "Isso apaga todo o histórico deste app neste dispositivo. Tem certeza?",
    confirmLabel: "Apagar tudo",
    cancelLabel: "Cancelar",
    danger: true,
    onConfirm: () => {
      storage.clearAll();
      app.ui.toast("Dados locais removidos.");
      goHistory(); // reflete vazio
    },
  });
}

/* ---------------- Service Worker ---------------- */

function registerServiceWorkerSafely() {
  // SW exige https ou localhost (file:// não registra).
  if (!("serviceWorker" in navigator)) return;

  const isLocalhost =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "";

  const isSecure = location.protocol === "https:" || isLocalhost;

  if (!isSecure) return;

  navigator.serviceWorker.register("./service-worker.js").catch(() => {
    // Silencioso: app funciona mesmo sem SW.
  });
}