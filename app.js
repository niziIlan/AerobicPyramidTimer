const STORAGE_KEY = "aerobicTimerRoutines";
const SOUND_MUTED_KEY = "aerobicTimerSoundMuted";

const defaultRoutine = {
  id: createId(),
  name: "פרמידה יורדת",
  repeatCount: 5,
  restBetweenCyclesSeconds: 60,
  steps: [
    { label: "עבודה", durationSeconds: 40, type: "work" },
    { label: "מנוחה", durationSeconds: 10, type: "rest" },
    { label: "עבודה", durationSeconds: 30, type: "work" },
    { label: "מנוחה", durationSeconds: 10, type: "rest" },
    { label: "עבודה", durationSeconds: 20, type: "work" },
    { label: "מנוחה", durationSeconds: 10, type: "rest" }
  ]
};

const ascendingRoutine = {
  id: createId(),
  name: "פרמידה עולה",
  repeatCount: 5,
  restBetweenCyclesSeconds: 60,
  steps: [
    { label: "עבודה", durationSeconds: 10, type: "work" },
    { label: "מנוחה", durationSeconds: 10, type: "rest" },
    { label: "עבודה", durationSeconds: 20, type: "work" },
    { label: "מנוחה", durationSeconds: 10, type: "rest" },
    { label: "עבודה", durationSeconds: 30, type: "work" },
    { label: "מנוחה", durationSeconds: 10, type: "rest" },
    { label: "עבודה", durationSeconds: 40, type: "work" },
    { label: "מנוחה", durationSeconds: 10, type: "rest" }
  ]
};

const pomodoroRoutine = {
  id: createId(),
  name: "Pomodoro",
  repeatCount: 1,
  restBetweenCyclesSeconds: 0,
  steps: [
    { label: "עבודה", durationSeconds: 1500, type: "work" },
    { label: "הפסקה", durationSeconds: 300, type: "rest" },
    { label: "עבודה", durationSeconds: 1500, type: "work" },
    { label: "הפסקה", durationSeconds: 300, type: "rest" },
    { label: "עבודה", durationSeconds: 1500, type: "work" },
    { label: "הפסקה", durationSeconds: 300, type: "rest" },
    { label: "עבודה", durationSeconds: 1500, type: "work" },
    { label: "הפסקה ארוכה", durationSeconds: 900, type: "rest" }
  ]
};

const testRoutine = {
  id: createId(),
  name: "Test",
  repeatCount: 3,
  restBetweenCyclesSeconds: 0,
  steps: [
    { label: "עבודה", durationSeconds: 5, type: "work" },
    { label: "מנוחה", durationSeconds: 3, type: "rest" }
  ]
};

const routinesView = document.querySelector("#routines-view");
const editorView = document.querySelector("#editor-view");
const backupView = document.querySelector("#backup-view");
const timerView = document.querySelector("#timer-view");
const routinesList = document.querySelector("#routines-list");
const message = document.querySelector("#message");
const backupMessage = document.querySelector("#backup-message");
const openBackupButton = document.querySelector("#open-backup-button");
const backToRoutinesButton = document.querySelector("#back-to-routines-button");
const exportRoutinesButton = document.querySelector("#export-routines-button");
const importRoutinesButton = document.querySelector("#import-routines-button");
const importRoutinesFile = document.querySelector("#import-routines-file");
const form = document.querySelector("#routine-form");
const editorTitle = document.querySelector("#editor-title");
const routineNameInput = document.querySelector("#routine-name");
const routineModeInput = document.querySelector("#routine-mode");
const stationCountInput = document.querySelector("#station-count");
const stationSettings = document.querySelector("#station-settings");
const roundSettings = document.querySelector(".rounds-field");
const cycleRestField = document.querySelector(".cycle-rest-field");
const workoutStepsSection = document.querySelector(".workout-steps-section");
const workoutStepsLabel = document.querySelector("#workout-steps-label");
const stepsEditorBody = document.querySelector("#steps-editor-body");
const toggleStepsButton = document.querySelector("#toggle-steps-button");
const addStepButton = document.querySelector("#add-step-button");
const repeatCountInput = document.querySelector("#repeat-count");
const cycleRestPicker = document.querySelector("#cycle-rest");
const stepsList = document.querySelector("#steps-list");
const timerRoutineName = document.querySelector("#timer-routine-name");
const timerPanel = document.querySelector("#timer-panel");
const timerCycleProgress = document.querySelector("#timer-cycle-progress");
const timerStepProgress = document.querySelector("#timer-step-progress");
const timerPhaseLabel = document.querySelector("#timer-phase-label");
const timerCountdown = document.querySelector("#timer-countdown");
const timerStatus = document.querySelector("#timer-status");
const timerProgressRing = document.querySelector("#timer-progress-ring");
const timerNextStep = document.querySelector("#timer-next-step");
const pauseTimerButton = document.querySelector("#pause-timer-button");
const pauseTimerIcon = pauseTimerButton.querySelector(".timer-control-icon");
const pauseTimerLabel = pauseTimerButton.querySelector(".timer-control-label");
const skipStepButton = document.querySelector("#skip-step-button");
const restartTimerButton = document.querySelector("#restart-timer-button");
const muteButton = document.querySelector("#mute-button");
const muteIcon = muteButton ? muteButton.querySelector(".mute-icon") : null;
const summarySteps = document.querySelector("#summary-steps");
const summaryRepeats = document.querySelector("#summary-repeats");
const summaryRepeatsItem = summaryRepeats.closest("span");
const summaryDuration = document.querySelector("#summary-duration");

let routines = loadRoutines();
let editingRoutineId = null;
let messageTimer = null;
let activeRoutine = null;
let timerSequence = [];
let timerPhaseIndex = 0;
let timerSecondsRemaining = 0;
let timerDeadline = 0;
let timerInterval = null;
let timerPaused = false;
let timerComplete = false;
let timerStarted = false;
let audioContext = null;
let lastCountdownBeep = null;
let soundMuted = muteButton ? localStorage.getItem(SOUND_MUTED_KEY) === "true" : false;

document.querySelectorAll("[data-home-button]").forEach((button) => {
  button.addEventListener("click", showHomeTimer);
});
document.querySelector("#create-routine-button").addEventListener("click", () => openEditor());
openBackupButton.addEventListener("click", openBackupView);
backToRoutinesButton.addEventListener("click", closeBackupView);
exportRoutinesButton.addEventListener("click", exportRoutines);
importRoutinesButton.addEventListener("click", importRoutinesFromFile);
addStepButton.addEventListener("click", () => addStepRow());
toggleStepsButton.addEventListener("click", toggleStepsAccordion);
document.querySelector("#cancel-edit-button").addEventListener("click", closeEditor);
document.querySelector("#exit-timer-button").addEventListener("click", exitTimer);
pauseTimerButton.addEventListener("click", toggleTimerPause);
skipStepButton.addEventListener("click", advanceTimerPhase);
restartTimerButton.addEventListener("click", restartTimer);
if (muteButton) {
  muteButton.addEventListener("click", toggleSound);
}
form.addEventListener("submit", saveRoutineFromForm);
form.addEventListener("input", updateEditorSummary);
form.addEventListener("change", updateEditorSummary);
routineModeInput.addEventListener("change", handleRoutineModeChange);
routinesList.addEventListener("click", handleRoutineAction);
stepsList.addEventListener("click", handleStepAction);
stepsList.addEventListener("change", handleStepTypeChange);

populateNumberSelect(stationCountInput, 1, 30);
populateNumberSelect(repeatCountInput, 1, 100);
populateDurationPicker(cycleRestPicker);
renderRoutines();
renderSoundButton();
openInitialTimerView();

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadRoutines() {
  const savedRoutines = localStorage.getItem(STORAGE_KEY);

  if (savedRoutines) {
    try {
      const parsedRoutines = JSON.parse(savedRoutines);
      if (Array.isArray(parsedRoutines)) {
        const migratedRoutines = migrateDefaultRoutine(parsedRoutines);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedRoutines));
        return migratedRoutines;
      }
    } catch (error) {
      console.warn("Could not read saved routines.", error);
    }
  }

  const initialRoutines = [defaultRoutine, ascendingRoutine, pomodoroRoutine, testRoutine];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRoutines));
  return initialRoutines;
}

function migrateDefaultRoutine(savedRoutines) {
  const oldDurations = [40, 10, 30, 10, 40, 10];
  const descendingDurations = [40, 10, 30, 10, 20, 10];

  const migratedRoutines = savedRoutines.map((routine) => {
    if (routine.name === "פירמידה עולה") {
      return { ...routine, name: "פרמידה עולה" };
    }

    if (routine.name === "פירמידה יורדת") {
      return { ...routine, name: "פרמידה יורדת" };
    }

    const hasDefaultSettings = routine.repeatCount === 5
      && routine.restBetweenCyclesSeconds === 60
      && Array.isArray(routine.steps);
    const isOldDefault = routine.name === "פירמידה בסיסית"
      && hasDefaultSettings
      && routine.repeatCount === 5
      && routine.steps.length === oldDurations.length
      && routine.steps.every((step, index) => step.durationSeconds === oldDurations[index]);
    const isCurrentDefault = routine.name === "פירמידה בסיסית"
      && hasDefaultSettings
      && routine.steps.length === descendingDurations.length
      && routine.steps.every(
        (step, index) => step.durationSeconds === descendingDurations[index]
      );

    if (!isOldDefault && !isCurrentDefault) {
      return routine;
    }

    return {
      ...routine,
      name: "פרמידה יורדת",
      steps: routine.steps.map((step, index) => (
        isOldDefault && index === 4 ? { ...step, durationSeconds: 20 } : step
      ))
    };
  });

  const hasAscendingRoutine = migratedRoutines.some(
    (routine) => routine.name === ascendingRoutine.name
  );

  if (!hasAscendingRoutine) {
    migratedRoutines.push(ascendingRoutine);
  }

  const hasPomodoroRoutine = migratedRoutines.some(
    (routine) => routine.name === pomodoroRoutine.name
  );

  if (!hasPomodoroRoutine) {
    migratedRoutines.push(pomodoroRoutine);
  }

  const hasTestRoutine = migratedRoutines.some(
    (routine) => routine.name === testRoutine.name
  );

  if (!hasTestRoutine) {
    migratedRoutines.push(testRoutine);
  }

  return migratedRoutines;
}

function saveRoutines() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
}

function showHomeTimer() {
  closeEditor();
  const routine = activeRoutine || routines[0];
  if (routine) {
    startRoutine(routine);
  }
}

function openInitialTimerView() {
  if (routines.length === 0) {
    return;
  }

  startRoutine(routines[0]);
}

function openBackupView() {
  stopTimerInterval();
  timerView.hidden = true;
  editorView.hidden = true;
  routinesView.hidden = true;
  backupView.hidden = false;
  hideBackupMessage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeBackupView() {
  backupView.hidden = true;
  routinesView.hidden = false;
  hideBackupMessage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function exportRoutines() {
  const backup = {
    app: "Aerobic Timer",
    version: 1,
    exportedAt: new Date().toISOString(),
    routines
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `aerobic-timer-routines-${date}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showBackupMessage("קובץ הגיבוי נוצר בהצלחה");
}

function importRoutinesFromFile() {
  const file = importRoutinesFile.files[0];
  if (!file) {
    showBackupMessage("יש לבחור קובץ גיבוי לפני הייבוא", true);
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const importedRoutines = parseImportedRoutines(reader.result);
      if (importedRoutines.length === 0) {
        showBackupMessage("לא נמצאו תוכניות בקובץ", true);
        return;
      }

      const preparedRoutines = importedRoutines.map((routine) => ({
        ...routine,
        id: createId(),
        name: createImportedRoutineName(routine.name)
      }));

      routines = [...routines, ...preparedRoutines];
      saveRoutines();
      renderRoutines();
      importRoutinesFile.value = "";
      showBackupMessage(`${preparedRoutines.length} תוכניות יובאו בהצלחה`);
    } catch (error) {
      console.warn("Could not import routines.", error);
      showBackupMessage("קובץ הגיבוי לא תקין", true);
    }
  });
  reader.readAsText(file);
}

function parseImportedRoutines(fileText) {
  const parsed = JSON.parse(fileText);
  const importedRoutines = Array.isArray(parsed) ? parsed : parsed.routines;

  if (!Array.isArray(importedRoutines)) {
    throw new Error("Missing routines array");
  }

  return importedRoutines
    .map(normalizeImportedRoutine)
    .filter(Boolean);
}

function normalizeImportedRoutine(routine) {
  if (!routine || typeof routine !== "object" || !Array.isArray(routine.steps)) {
    return null;
  }

  const steps = routine.steps
    .map((step) => ({
      label: String(step.label || "שלב"),
      durationSeconds: Math.max(1, Number(step.durationSeconds) || 0),
      type: step.type === "rest" ? "rest" : "work"
    }))
    .filter((step) => step.durationSeconds > 0);

  if (steps.length === 0) {
    return null;
  }

  const mode = routine.mode === "stations" ? "stations" : "standard";
  const importedRoutine = {
    id: createId(),
    mode,
    name: String(routine.name || "תוכנית מיובאת"),
    repeatCount: mode === "stations" ? Math.max(1, Number(routine.repeatCount) || 1) : 1,
    restBetweenCyclesSeconds: mode === "stations" ? Math.max(0, Number(routine.restBetweenCyclesSeconds) || 0) : 0,
    steps
  };

  if (mode === "stations") {
    importedRoutine.stationCount = Math.max(1, Number(routine.stationCount) || 1);
  }

  return importedRoutine;
}

function createImportedRoutineName(name) {
  const baseName = String(name || "תוכנית מיובאת");
  const existingNames = new Set(routines.map((routine) => routine.name));
  if (!existingNames.has(baseName)) {
    return baseName;
  }

  let copyIndex = 1;
  let nextName = `${baseName} - ייבוא`;
  while (existingNames.has(nextName)) {
    copyIndex += 1;
    nextName = `${baseName} - ייבוא ${copyIndex}`;
  }
  return nextName;
}

function showBackupMessage(text, isError = false) {
  backupMessage.textContent = text;
  backupMessage.hidden = false;
  backupMessage.classList.toggle("error-message", isError);
}

function hideBackupMessage() {
  backupMessage.hidden = true;
  backupMessage.textContent = "";
  backupMessage.classList.remove("error-message");
}
function renderRoutines() {
  routinesList.replaceChildren();

  if (routines.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "עדיין אין תוכניות שמורות.";
    routinesList.append(emptyState);
    return;
  }

  routines.forEach((routine) => {
    const card = document.createElement("article");
    card.className = "routine-card is-collapsed";
    card.dataset.routineId = routine.id;

    const title = document.createElement("h3");
    title.textContent = routine.name;

    const summary = document.createElement("p");
    summary.className = "step-summary";
    renderRoutineSummary(summary, routine);

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "routine-toggle-button";
    toggleButton.dataset.action = "toggle";
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-label", `פתיחת פרטי התוכנית ${routine.name}`);
    toggleButton.title = "פתיחת פרטי התוכנית";
    toggleButton.innerHTML = '<span aria-hidden="true">▾</span>';

    const details = document.createElement("p");
    details.className = "routine-details";
    if (routine.mode === "stations") {
      details.append(
        createDetail("↻", "מספר סבבים:", routine.repeatCount),
        createDetail("◷", "מנוחה בין סבבים:", formatDurationLabel(routine.restBetweenCyclesSeconds))
      );
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";
    actions.append(
      createActionButton("▶", "הפעל", "start", "start-button"),
      createActionButton("✎", "ערוך", "edit"),
      createActionButton("▣", "שכפל", "duplicate"),
      createActionButton("♲", "מחק", "delete", "delete-button")
    );

    const orderActions = document.createElement("div");
    orderActions.className = "order-actions";
    orderActions.setAttribute("aria-label", "שינוי סדר התוכנית");

    const routineIndex = routines.indexOf(routine);
    const moveUpButton = createActionButton("↑", "", "move-up", "order-button");
    moveUpButton.setAttribute("aria-label", "העברה למעלה");
    moveUpButton.title = "העברה למעלה";
    moveUpButton.disabled = routineIndex === 0;

    const moveDownButton = createActionButton("↓", "", "move-down", "order-button");
    moveDownButton.setAttribute("aria-label", "העברה למטה");
    moveDownButton.title = "העברה למטה";
    moveDownButton.disabled = routineIndex === routines.length - 1;

    orderActions.append(moveUpButton, moveDownButton);

    const cardHeading = document.createElement("div");
    cardHeading.className = "routine-card-heading";
    const titleGroup = document.createElement("div");
    titleGroup.className = "routine-title-group";
    titleGroup.append(toggleButton, title);
    cardHeading.append(titleGroup, orderActions);

    const compactSummary = document.createElement("div");
    compactSummary.className = "routine-compact-summary";
    compactSummary.append(summary);

    const accordionBody = document.createElement("div");
    accordionBody.className = "routine-accordion-body";
    accordionBody.hidden = true;
    if (routine.mode === "stations") {
      accordionBody.append(details);
    }
    accordionBody.append(actions);

    card.append(cardHeading, compactSummary, accordionBody);
    routinesList.append(card);
  });
}

function renderRoutineSummary(summaryElement, routine) {
  summaryElement.replaceChildren();

  if (routine.mode === "stations") {
    summaryElement.classList.add("station-summary");
    const stationCount = routine.stationCount || 1;
    const stationLabel = stationCount === 1 ? "תחנה" : "תחנות";
    const cycleLabel = routine.repeatCount === 1 ? "סבב" : "סבבים";
    const durationSummary = routine.steps
      .map((step) => formatStationEventDuration(step.durationSeconds))
      .join(" / ");

    const mainLine = document.createElement("span");
    mainLine.className = "summary-line summary-main";
    mainLine.textContent = `${stationCount} ${stationLabel}  ${routine.repeatCount} ${cycleLabel}`;

    const eventsLine = document.createElement("span");
    eventsLine.className = "summary-line summary-events";
    eventsLine.textContent = `בכל תחנה ${durationSummary}`;

    summaryElement.append(mainLine, eventsLine);
    return;
  }

  summaryElement.classList.remove("station-summary");
  summaryElement.textContent = getRoutineSummaryText(routine);
}

function createDetail(icon, label, value) {
  const item = document.createElement("span");
  const iconElement = document.createElement("span");
  iconElement.className = "detail-icon";
  iconElement.textContent = icon;
  const strong = document.createElement("strong");
  strong.textContent = `${label} `;
  item.append(iconElement, strong, document.createTextNode(value));
  return item;
}

function createActionButton(icon, label, action, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  const iconElement = document.createElement("span");
  iconElement.className = "action-icon";
  iconElement.setAttribute("aria-hidden", "true");
  iconElement.textContent = icon;
  const labelElement = document.createElement("span");
  labelElement.textContent = label;
  button.append(iconElement, labelElement);

  if (className) {
    button.className = className;
  }

  return button;
}

function formatDurationLabel(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} שעות ${minutes} דקות ${seconds} שניות`;
  }

  if (minutes > 0) {
    return `${minutes} דקות ${seconds} שניות`;
  }

  return `${seconds} שניות`;
}

function toggleRoutineCard(card, routine) {
  const isOpening = card.classList.toggle("is-collapsed");
  const shouldShow = !isOpening;
  const body = card.querySelector(".routine-accordion-body");
  const button = card.querySelector(".routine-toggle-button");

  body.hidden = !shouldShow;
  button.setAttribute("aria-expanded", String(shouldShow));
  button.setAttribute(
    "aria-label",
    `${shouldShow ? "סגירת" : "פתיחת"} פרטי התוכנית ${routine.name}`
  );
  button.title = shouldShow ? "סגירת פרטי התוכנית" : "פתיחת פרטי התוכנית";
  button.querySelector("span").textContent = shouldShow ? "▴" : "▾";
}
function handleRoutineAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const card = button.closest(".routine-card");
  const routine = routines.find((item) => item.id === card.dataset.routineId);
  if (!routine) {
    return;
  }

  if (button.dataset.action === "toggle") {
    toggleRoutineCard(card, routine);
    return;
  }

  if (button.dataset.action === "start") {
    startRoutine(routine);
  }

  if (button.dataset.action === "edit") {
    openEditor(routine);
  }

  if (button.dataset.action === "duplicate") {
    duplicateRoutine(routine);
  }

  if (button.dataset.action === "delete") {
    deleteRoutine(routine);
  }

  if (button.dataset.action === "move-up") {
    moveRoutine(routine.id, -1);
  }

  if (button.dataset.action === "move-down") {
    moveRoutine(routine.id, 1);
  }
}

function openEditor(routine = null) {
  editingRoutineId = routine ? routine.id : null;
  editorTitle.textContent = routine ? "עריכת תוכנית" : "יצירת תוכנית חדשה";
  const routineMode = routine ? routine.mode || "standard" : "standard";
  routineModeInput.value = routineMode;
  routineNameInput.value = routine ? routine.name : "";
  stationCountInput.value = routine ? routine.stationCount || 1 : 1;
  repeatCountInput.value = routine ? routine.repeatCount : 1;
  setDurationPickerValue(
    cycleRestPicker,
    routine ? routine.restBetweenCyclesSeconds : 60
  );
  stepsList.replaceChildren();

  const steps = routine
    ? routine.steps
    : [
        { label: "עבודה", durationSeconds: 40, type: "work" },
        { label: "מנוחה", durationSeconds: 10, type: "rest" }
      ];

  steps.forEach(addStepRow);
  updateRoutineModeView();
  refreshStepRows();
  updateEditorSummary();
  routinesView.hidden = true;
  backupView.hidden = true;
  editorView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  routineNameInput.focus();
}

function closeEditor() {
  form.reset();
  stepsList.replaceChildren();
  editingRoutineId = null;
  editorView.hidden = true;
  backupView.hidden = true;
  routinesView.hidden = false;
}

function startRoutine(routine) {
  activeRoutine = {
    ...routine,
    steps: routine.steps.map((step) => ({ ...step }))
  };
  timerSequence = buildTimerSequence(activeRoutine);
  timerPhaseIndex = 0;
  timerStarted = false;
  timerPaused = true;
  timerComplete = false;
  routinesView.hidden = true;
  editorView.hidden = true;
  backupView.hidden = true;
  timerView.hidden = false;
  timerRoutineName.textContent = `אימון פעיל · ${activeRoutine.name}`;
  pauseTimerButton.hidden = false;
  skipStepButton.hidden = false;
  loadTimerPhase({ autoStart: false });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function buildTimerSequence(routine) {
  const sequence = [{
    label: "מתכוננים",
    durationSeconds: 5,
    type: "rest",
    phaseType: "preparation",
    cycleIndex: 0,
    stepIndex: -1
  }];

  if (routine.mode === "stations") {
    return buildStationsTimerSequence(routine, sequence);
  }

  routine.steps.forEach((step, stepIndex) => {
    sequence.push({
      ...step,
      cycleIndex: 0,
      stepIndex,
      phaseType: step.type
    });
  });

  return sequence;
}

function buildStationsTimerSequence(routine, sequence) {
  const stationCount = Number(routine.stationCount) || 1;

  for (let cycleIndex = 0; cycleIndex < routine.repeatCount; cycleIndex += 1) {
    for (let stationIndex = 0; stationIndex < stationCount; stationIndex += 1) {
      routine.steps.forEach((step, eventIndex) => {
        sequence.push({
          ...step,
          label: `תחנה ${stationIndex + 1} - ${step.label}`,
          cycleIndex,
          stationIndex,
          eventIndex,
          stepIndex: stationIndex * routine.steps.length + eventIndex,
          phaseType: step.type
        });
      });
    }

    const hasAnotherCycle = cycleIndex < routine.repeatCount - 1;
    if (hasAnotherCycle && routine.restBetweenCyclesSeconds > 0) {
      sequence.push({
        label: "מנוחה בין סבבים",
        durationSeconds: routine.restBetweenCyclesSeconds,
        type: "rest",
        phaseType: "cycle-rest",
        cycleIndex,
        stationIndex: stationCount,
        eventIndex: routine.steps.length,
        stepIndex: stationCount * routine.steps.length
      });
    }
  }

  return sequence;
}

function loadTimerPhase(options = {}) {
  const { autoStart = timerStarted } = options;
  stopTimerInterval();

  if (timerPhaseIndex >= timerSequence.length) {
    completeTimer();
    return;
  }

  const phase = timerSequence[timerPhaseIndex];
  timerSecondsRemaining = phase.durationSeconds;
  lastCountdownBeep = null;
  timerDeadline = Date.now() + timerSecondsRemaining * 1000;
  timerPanel.dataset.phaseType = phase.phaseType;
  if (phase.phaseType === "preparation") {
    timerStatus.textContent = "האימון יתחיל מיד";
  } else if (phase.phaseType === "cycle-rest") {
    timerStatus.textContent = "הסבב הבא מתחיל מיד לאחר המנוחה";
  } else {
    timerStatus.textContent = "הטיימר פועל";
  }
  timerStarted = autoStart;
  timerPaused = !autoStart;
  renderTimer();
  setPauseButtonState(timerPaused);

  if (autoStart) {
    playCountdownBeep(timerSecondsRemaining);
    timerInterval = window.setInterval(updateTimer, 200);
  }
}

function updateTimer() {
  const remainingMilliseconds = Math.max(0, timerDeadline - Date.now());
  const nextSeconds = Math.ceil(remainingMilliseconds / 1000);

  if (nextSeconds !== timerSecondsRemaining) {
    timerSecondsRemaining = nextSeconds;
    renderTimer();
    playCountdownBeep(timerSecondsRemaining);
  }

  if (remainingMilliseconds <= 0) {
    advanceTimerPhase();
  }
}

function renderTimer() {
  const phase = timerSequence[timerPhaseIndex];
  if (!phase) {
    return;
  }

  timerPhaseLabel.textContent = phase.label;
  timerCountdown.textContent = formatTime(timerSecondsRemaining);
  const isStationsMode = activeRoutine.mode === "stations";
  timerCycleProgress.hidden = !isStationsMode;

  if (phase.phaseType === "preparation") {
    timerCycleProgress.textContent = isStationsMode
      ? `סבב 1 מתוך ${activeRoutine.repeatCount}`
      : "";
    timerStepProgress.textContent = "הכנה";
  } else if (isStationsMode) {
    const cycleLabel = "סבב";
    timerCycleProgress.textContent = phase.phaseType === "cycle-rest"
      ? `הושלם ${cycleLabel} ${phase.cycleIndex + 1} מתוך ${activeRoutine.repeatCount}`
      : `${cycleLabel} ${phase.cycleIndex + 1} מתוך ${activeRoutine.repeatCount}`;

    timerStepProgress.textContent = phase.phaseType === "cycle-rest"
      ? "מנוחה בין סבבים"
      : `תחנה ${phase.stationIndex + 1} מתוך ${activeRoutine.stationCount} · אירוע ${phase.eventIndex + 1} מתוך ${activeRoutine.steps.length}`;
  } else {
    timerStepProgress.textContent = `שלב ${phase.stepIndex + 1} מתוך ${activeRoutine.steps.length}`;
  }

  const elapsed = phase.durationSeconds - timerSecondsRemaining;
  const progress = phase.durationSeconds > 0
    ? Math.min(100, Math.max(0, (elapsed / phase.durationSeconds) * 100))
    : 100;
  const ringCircumference = 289.03;
  timerProgressRing.style.strokeDashoffset = String(
    ringCircumference * (1 - progress / 100)
  );

  const nextPhase = timerSequence[timerPhaseIndex + 1];
  timerNextStep.textContent = nextPhase
    ? `${nextPhase.label}, ${formatDurationLabel(nextPhase.durationSeconds)}`
    : "סיום האימון";
}

function getRoutineSummaryText(routine) {
  if (routine.mode === "stations") {
    const stationCount = routine.stationCount || 1;
    const cycleLabel = routine.repeatCount === 1 ? "סבב" : "סבבים";
    const durationSummary = routine.steps
      .map((step) => formatStationEventDuration(step.durationSeconds))
      .join(" / ");

    return `תוכנית ${stationCount} תחנות, ${routine.repeatCount} ${cycleLabel} ובכל תחנה ${durationSummary}`;
  }

  return routine.steps
    .map((step) => formatStepSummaryDuration(step.durationSeconds))
    .join(" / ");
}

function formatStationEventDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0 && seconds === 0) {
    return String(minutes);
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatStepSummaryDuration(totalSeconds) {
  if (totalSeconds >= 60) {
    const minutes = totalSeconds / 60;
    return Number.isInteger(minutes) ? String(minutes) : String(minutes);
  }

  return String(totalSeconds);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function toggleTimerPause() {
  if (timerComplete) {
    return;
  }

  if (timerPaused) {
    prepareAudio();
    timerStarted = true;
    timerPaused = false;
    timerDeadline = Date.now() + timerSecondsRemaining * 1000;
    timerInterval = window.setInterval(updateTimer, 200);
    setPauseButtonState(false);
    timerStatus.textContent = "הטיימר פועל";
    return;
  }

  timerPaused = true;
  timerStarted = true;
  timerSecondsRemaining = Math.ceil(Math.max(0, timerDeadline - Date.now()) / 1000);
  stopTimerInterval();
  setPauseButtonState(true);
  timerStatus.textContent = "האימון מושהה";
  renderTimer();
}

function advanceTimerPhase() {
  if (timerComplete) {
    return;
  }

  const hasNextPhase = timerPhaseIndex + 1 < timerSequence.length;
  if (hasNextPhase && timerStarted) {
    playBell();
  }

  timerPhaseIndex += 1;
  loadTimerPhase({ autoStart: timerStarted });
}

function restartTimer() {
  if (!activeRoutine) {
    return;
  }

  prepareAudio();
  timerPhaseIndex = 0;
  timerComplete = false;
  timerStarted = false;
  timerPaused = true;
  pauseTimerButton.hidden = false;
  skipStepButton.hidden = false;
  loadTimerPhase({ autoStart: false });
}

function completeTimer() {
  stopTimerInterval();
  const wasStarted = timerStarted;
  timerComplete = true;
  timerPaused = false;
  timerStarted = false;
  if (wasStarted) {
    playBell();
  }
  timerPanel.dataset.phaseType = "complete";
  timerPhaseLabel.textContent = "האימון הושלם";
  timerCountdown.textContent = "00:00";
  if (activeRoutine.mode === "stations") {
    timerCycleProgress.hidden = false;
    timerCycleProgress.textContent = `${activeRoutine.repeatCount} סבבים הושלמו`;
  } else {
    timerCycleProgress.hidden = true;
    timerCycleProgress.textContent = "";
  }
  timerStepProgress.textContent = "כל הכבוד!";
  timerStatus.textContent = "סיימת את כל שלבי האימון";
  timerProgressRing.style.strokeDashoffset = "0";
  timerNextStep.textContent = "האימון הסתיים";
  pauseTimerButton.hidden = true;
  skipStepButton.hidden = true;
}

function exitTimer() {
  stopTimerInterval();
  activeRoutine = null;
  timerSequence = [];
  timerComplete = false;
  timerStarted = false;
  timerView.hidden = true;
  backupView.hidden = true;
  routinesView.hidden = false;
}

function stopTimerInterval() {
  window.clearInterval(timerInterval);
  timerInterval = null;
}

function setPauseButtonState(isPaused) {
  const isReadyToStart = isPaused && !timerStarted;
  pauseTimerButton.classList.toggle("is-resume", isPaused);
  pauseTimerIcon.textContent = isPaused ? "▶" : "Ⅱ";
  pauseTimerLabel.textContent = isReadyToStart
    ? "הפעל"
    : isPaused
      ? "המשך"
      : "השהיה";
}

function toggleSound() {
  soundMuted = !soundMuted;
  localStorage.setItem(SOUND_MUTED_KEY, String(soundMuted));
  renderSoundButton();

  if (!soundMuted) {
    prepareAudio();
    lastCountdownBeep = null;
    playCountdownBeep(1);
    lastCountdownBeep = null;
  }
}

function renderSoundButton() {
  if (!muteButton || !muteIcon) {
    return;
  }

  muteButton.setAttribute("aria-pressed", String(soundMuted));
  muteIcon.textContent = soundMuted ? "🔇" : "🔊";
  const label = soundMuted ? "הפעלת צלילים" : "השתקת צלילים";
  muteButton.setAttribute("aria-label", label);
  muteButton.title = label;
}

function prepareAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return null;
  }

  if (!audioContext || audioContext.state === "closed") {
    audioContext = new AudioContext();
  }

  if (audioContext.state !== "running") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function playBell() {
  if (soundMuted) {
    return;
  }

  const context = prepareAudio();
  if (!context) {
    return;
  }

  const compressor = context.createDynamicsCompressor();
  const masterGain = context.createGain();
  compressor.threshold.setValueAtTime(-10, context.currentTime);
  compressor.knee.setValueAtTime(10, context.currentTime);
  compressor.ratio.setValueAtTime(8, context.currentTime);
  compressor.attack.setValueAtTime(0.003, context.currentTime);
  compressor.release.setValueAtTime(0.28, context.currentTime);
  masterGain.gain.setValueAtTime(1.05, context.currentTime);
  masterGain.connect(compressor);
  compressor.connect(context.destination);

  const strikes = [
    { delay: 0, strength: 1 },
    { delay: 0.13, strength: 0.88 },
    { delay: 0.28, strength: 0.72 }
  ];

  strikes.forEach(({ delay, strength }) => {
    const startTime = context.currentTime + delay;
    [
      { frequency: 690, volume: 0.38, duration: 1.8 },
      { frequency: 1035, volume: 0.3, duration: 1.5 },
      { frequency: 1480, volume: 0.21, duration: 1.15 },
      { frequency: 2075, volume: 0.14, duration: 0.85 },
      { frequency: 2860, volume: 0.08, duration: 0.58 }
    ].forEach(({ frequency, volume, duration }, toneIndex) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = toneIndex < 2 ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, startTime);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(volume * strength, startTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      oscillator.connect(gain);
      gain.connect(masterGain);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration + 0.03);
    });
  });
}

function playCountdownBeep(secondsRemaining) {
  if (
    soundMuted
    ||
    secondsRemaining < 1
    || secondsRemaining > 3
    || lastCountdownBeep === secondsRemaining
  ) {
    return;
  }

  const context = prepareAudio();
  if (!context) {
    return;
  }

  lastCountdownBeep = secondsRemaining;
  const startTime = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.62, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.16);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + 0.18);
}

function moveRoutine(routineId, direction) {
  const currentIndex = routines.findIndex((routine) => routine.id === routineId);
  const targetIndex = currentIndex + direction;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= routines.length) {
    return;
  }

  [routines[currentIndex], routines[targetIndex]] = [
    routines[targetIndex],
    routines[currentIndex]
  ];
  saveRoutines();
  renderRoutines();
}

function addStepRow(step = { label: "עבודה", durationSeconds: 30, type: "work" }) {
  const row = document.createElement("div");
  row.className = "step-row";
  row.dataset.stepType = step.type;

  row.innerHTML = `
    <div class="step-main">
      <span class="step-number">שלב</span>
      <label class="field">
        <span>שם השלב</span>
        <input class="step-label" type="text" required>
      </label>
    </div>
    <div class="field duration-field">
      <span>משך השלב</span>
      <div class="duration-picker step-duration">
        <label class="duration-seconds-field">
          <span>שניות</span>
          <select class="duration-seconds" aria-label="שניות"></select>
        </label>
        <label class="duration-minutes-field">
          <span>דקות</span>
          <select class="duration-minutes" aria-label="דקות"></select>
        </label>
        <label class="duration-hours-field">
          <span>שעות</span>
          <select class="duration-hours" aria-label="שעות"></select>
        </label>
      </div>
    </div>
    <div class="step-type-actions">
      <label class="field">
        <span>סוג</span>
        <select class="step-type step-type-badge">
          <option value="work">עבודה</option>
          <option value="rest">מנוחה</option>
        </select>
      </label>
      <div class="step-actions">
        <button class="step-action-button duplicate-step" data-step-action="duplicate" type="button" aria-label="שכפול שלב" title="שכפול שלב">⧉</button>
        <button class="step-action-button move-step-up" data-step-action="up" type="button" aria-label="העברת שלב למעלה" title="העברת שלב למעלה">↑</button>
        <button class="step-action-button move-step-down" data-step-action="down" type="button" aria-label="העברת שלב למטה" title="העברת שלב למטה">↓</button>
        <button class="step-action-button delete-step" data-step-action="delete" type="button" aria-label="מחיקת שלב" title="מחיקת שלב">×</button>
      </div>
    </div>
  `;

  row.querySelector(".step-label").value = step.label;
  const durationPicker = row.querySelector(".step-duration");
  populateDurationPicker(durationPicker);
  setDurationPickerValue(durationPicker, step.durationSeconds);
  row.querySelector(".step-type").value = step.type;
  stepsList.append(row);
  refreshStepRows();
  updateEditorSummary();
}

function populateNumberSelect(select, minimum, maximum) {
  if (select.options.length > 0) {
    return;
  }

  for (let value = minimum; value <= maximum; value += 1) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
}

function populateDurationPicker(picker) {
  populateNumberSelect(picker.querySelector(".duration-hours"), 0, 23);
  populateNumberSelect(picker.querySelector(".duration-minutes"), 0, 59);
  populateNumberSelect(picker.querySelector(".duration-seconds"), 0, 59);
}

function setDurationPickerValue(picker, totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.min(23, Math.floor(safeSeconds / 3600));
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  picker.querySelector(".duration-hours").value = hours;
  picker.querySelector(".duration-minutes").value = minutes;
  picker.querySelector(".duration-seconds").value = seconds;
}

function getDurationPickerValue(picker) {
  const hours = Number(picker.querySelector(".duration-hours").value);
  const minutes = Number(picker.querySelector(".duration-minutes").value);
  const seconds = Number(picker.querySelector(".duration-seconds").value);
  return hours * 3600 + minutes * 60 + seconds;
}

function handleStepAction(event) {
  const button = event.target.closest("[data-step-action]");
  if (!button) {
    return;
  }

  const row = button.closest(".step-row");
  const action = button.dataset.stepAction;

  if (action === "delete") {
    row.remove();
  }

  if (action === "duplicate") {
    const duplicate = row.cloneNode(true);
    row.after(duplicate);
  }

  if (action === "up" && row.previousElementSibling) {
    row.previousElementSibling.before(row);
  }

  if (action === "down" && row.nextElementSibling) {
    row.nextElementSibling.after(row);
  }

  refreshStepRows();
  updateEditorSummary();
}

function handleStepTypeChange(event) {
  if (!event.target.matches(".step-type")) {
    return;
  }

  event.target.closest(".step-row").dataset.stepType = event.target.value;
  updateEditorSummary();
}

function refreshStepRows() {
  const rows = [...stepsList.querySelectorAll(".step-row")];

  rows.forEach((row, index) => {
    row.querySelector(".step-number").textContent = routineModeInput.value === "stations"
      ? `אירוע ${index + 1}`
      : `שלב ${index + 1}`;
    row.querySelector(".move-step-up").disabled = index === 0;
    row.querySelector(".move-step-down").disabled = index === rows.length - 1;
  });
}

function handleRoutineModeChange() {
  updateRoutineModeView();
  updateEditorSummary();
}

function updateRoutineModeView() {
  const isStationsMode = routineModeInput.value === "stations";
  stationSettings.hidden = !isStationsMode;
  roundSettings.hidden = !isStationsMode;
  cycleRestField.hidden = !isStationsMode;
  summaryRepeatsItem.hidden = !isStationsMode;
  workoutStepsLabel.textContent = isStationsMode
    ? "תחנה - אירועים שחוזרים בכל תחנה"
    : "שלבי האימון";
  addStepButton.textContent = isStationsMode ? "+ הוספת אירוע" : "+ הוספת שלב";
  refreshStepRows();
}

function toggleStepsAccordion() {
  const isCollapsed = workoutStepsSection.classList.toggle("is-collapsed");
  stepsEditorBody.hidden = isCollapsed;
  toggleStepsButton.setAttribute("aria-expanded", String(!isCollapsed));
  toggleStepsButton.querySelector("span:first-child").textContent = isCollapsed ? "+" : "×";
  toggleStepsButton.querySelector("span:last-child").textContent = isCollapsed ? "פתיחה" : "סגירה";
}

function updateEditorSummary() {
  const rows = [...stepsList.querySelectorAll(".step-row")];
  const isStationsMode = routineModeInput.value === "stations";
  const repeats = isStationsMode ? Number(repeatCountInput.value) || 1 : 1;
  const stationCount = isStationsMode ? Number(stationCountInput.value) || 1 : 1;
  const cycleDuration = rows.reduce(
    (total, row) => total + getDurationPickerValue(row.querySelector(".step-duration")),
    0
  ) * stationCount;
  const cycleRest = isStationsMode ? getDurationPickerValue(cycleRestPicker) : 0;
  const totalDuration = cycleDuration * repeats + cycleRest * Math.max(0, repeats - 1);

  summarySteps.textContent = isStationsMode
    ? `${stationCount} תחנות × ${rows.length} אירועים`
    : rows.length;
  summaryRepeats.textContent = repeats;
  summaryDuration.textContent = formatSummaryTime(totalDuration);
}

function formatSummaryTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function saveRoutineFromForm(event) {
  event.preventDefault();

  const stepRows = [...stepsList.querySelectorAll(".step-row")];
  if (stepRows.length === 0) {
    window.alert("יש להוסיף לפחות שלב אחד לתוכנית.");
    return;
  }

  const hasEmptyDuration = stepRows.some(
    (row) => getDurationPickerValue(row.querySelector(".step-duration")) === 0
  );
  if (hasEmptyDuration) {
    window.alert("משך כל שלב חייב להיות לפחות שנייה אחת.");
    return;
  }

  const isStationsMode = routineModeInput.value === "stations";
  const routineData = {
    id: editingRoutineId || createId(),
    mode: routineModeInput.value,
    name: routineNameInput.value.trim(),
    repeatCount: isStationsMode ? Number(repeatCountInput.value) : 1,
    restBetweenCyclesSeconds: isStationsMode ? getDurationPickerValue(cycleRestPicker) : 0,
    steps: stepRows.map((row) => ({
      label: row.querySelector(".step-label").value.trim(),
      durationSeconds: getDurationPickerValue(row.querySelector(".step-duration")),
      type: row.querySelector(".step-type").value
    }))
  };

  if (isStationsMode) {
    routineData.stationCount = Number(stationCountInput.value) || 1;
  }

  if (editingRoutineId) {
    routines = routines.map((routine) =>
      routine.id === editingRoutineId ? routineData : routine
    );
  } else {
    routines.push(routineData);
  }

  saveRoutines();
  renderRoutines();
  closeEditor();
  showMessage("התוכנית נשמרה בהצלחה");
}

function duplicateRoutine(routine) {
  const duplicate = {
    ...routine,
    id: createId(),
    name: `${routine.name} - עותק`,
    steps: routine.steps.map((step) => ({ ...step }))
  };

  routines.push(duplicate);
  saveRoutines();
  renderRoutines();
  showMessage("נוצר עותק של התוכנית");
}

function deleteRoutine(routine) {
  const approved = window.confirm(`למחוק את התוכנית "${routine.name}"?`);
  if (!approved) {
    return;
  }

  routines = routines.filter((item) => item.id !== routine.id);
  saveRoutines();
  renderRoutines();
  showMessage("התוכנית נמחקה");
}

function showMessage(text) {
  window.clearTimeout(messageTimer);
  message.textContent = text;
  message.hidden = false;
  messageTimer = window.setTimeout(() => {
    message.hidden = true;
  }, 3500);
}
