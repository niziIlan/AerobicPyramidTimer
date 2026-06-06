const STORAGE_KEY = "aerobicTimerRoutines";

const defaultRoutine = {
  id: createId(),
  name: "פירמידה בסיסית",
  repeatCount: 5,
  restBetweenCyclesSeconds: 60,
  steps: [
    { label: "עבודה", durationSeconds: 40, type: "work" },
    { label: "מנוחה", durationSeconds: 10, type: "rest" },
    { label: "עבודה", durationSeconds: 30, type: "work" },
    { label: "מנוחה", durationSeconds: 10, type: "rest" },
    { label: "עבודה", durationSeconds: 40, type: "work" },
    { label: "מנוחה", durationSeconds: 10, type: "rest" }
  ]
};

const routinesView = document.querySelector("#routines-view");
const editorView = document.querySelector("#editor-view");
const timerView = document.querySelector("#timer-view");
const routinesList = document.querySelector("#routines-list");
const message = document.querySelector("#message");
const form = document.querySelector("#routine-form");
const editorTitle = document.querySelector("#editor-title");
const routineNameInput = document.querySelector("#routine-name");
const repeatCountInput = document.querySelector("#repeat-count");
const cycleRestInput = document.querySelector("#cycle-rest");
const stepsList = document.querySelector("#steps-list");
const timerRoutineName = document.querySelector("#timer-routine-name");
const timerPanel = document.querySelector("#timer-panel");
const timerCycleProgress = document.querySelector("#timer-cycle-progress");
const timerStepProgress = document.querySelector("#timer-step-progress");
const timerPhaseLabel = document.querySelector("#timer-phase-label");
const timerCountdown = document.querySelector("#timer-countdown");
const timerStatus = document.querySelector("#timer-status");
const timerProgressBar = document.querySelector("#timer-progress-bar");
const timerNextStep = document.querySelector("#timer-next-step");
const pauseTimerButton = document.querySelector("#pause-timer-button");
const skipStepButton = document.querySelector("#skip-step-button");
const restartTimerButton = document.querySelector("#restart-timer-button");

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

document.querySelector("#create-routine-button").addEventListener("click", () => openEditor());
document.querySelector("#add-step-button").addEventListener("click", () => addStepRow());
document.querySelector("#cancel-edit-button").addEventListener("click", closeEditor);
document.querySelector("#exit-timer-button").addEventListener("click", exitTimer);
pauseTimerButton.addEventListener("click", toggleTimerPause);
skipStepButton.addEventListener("click", advanceTimerPhase);
restartTimerButton.addEventListener("click", restartTimer);
form.addEventListener("submit", saveRoutineFromForm);
routinesList.addEventListener("click", handleRoutineAction);
stepsList.addEventListener("click", handleStepRemoval);
stepsList.addEventListener("change", handleStepTypeChange);

renderRoutines();

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
        return parsedRoutines;
      }
    } catch (error) {
      console.warn("Could not read saved routines.", error);
    }
  }

  const initialRoutines = [defaultRoutine];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRoutines));
  return initialRoutines;
}

function saveRoutines() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
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
    card.className = "routine-card";
    card.dataset.routineId = routine.id;

    const title = document.createElement("h3");
    title.textContent = routine.name;

    const summary = document.createElement("p");
    summary.className = "step-summary";
    summary.textContent = routine.steps.map((step) => step.durationSeconds).join(" / ");

    const details = document.createElement("p");
    details.className = "routine-details";
    details.append(
      createDetail("מספר חזרות:", routine.repeatCount),
      createDetail("מנוחה בין מחזורים:", `${routine.restBetweenCyclesSeconds} שניות`)
    );

    const actions = document.createElement("div");
    actions.className = "card-actions";
    actions.append(
      createActionButton("הפעל", "start", "start-button"),
      createActionButton("ערוך", "edit"),
      createActionButton("שכפל", "duplicate"),
      createActionButton("מחק", "delete", "delete-button")
    );

    const orderActions = document.createElement("div");
    orderActions.className = "order-actions";
    orderActions.setAttribute("aria-label", "שינוי סדר התוכנית");

    const routineIndex = routines.indexOf(routine);
    const moveUpButton = createActionButton("↑", "move-up", "order-button");
    moveUpButton.setAttribute("aria-label", "העברה למעלה");
    moveUpButton.title = "העברה למעלה";
    moveUpButton.disabled = routineIndex === 0;

    const moveDownButton = createActionButton("↓", "move-down", "order-button");
    moveDownButton.setAttribute("aria-label", "העברה למטה");
    moveDownButton.title = "העברה למטה";
    moveDownButton.disabled = routineIndex === routines.length - 1;

    orderActions.append(moveUpButton, moveDownButton);

    const cardHeading = document.createElement("div");
    cardHeading.className = "routine-card-heading";
    cardHeading.append(title, orderActions);

    card.append(cardHeading, summary, details, actions);
    routinesList.append(card);
  });
}

function createDetail(label, value) {
  const item = document.createElement("span");
  const strong = document.createElement("strong");
  strong.textContent = `${label} `;
  item.append(strong, document.createTextNode(value));
  return item;
}

function createActionButton(label, action, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  button.textContent = label;

  if (className) {
    button.className = className;
  }

  return button;
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
  routineNameInput.value = routine ? routine.name : "";
  repeatCountInput.value = routine ? routine.repeatCount : 1;
  cycleRestInput.value = routine ? routine.restBetweenCyclesSeconds : 60;
  stepsList.replaceChildren();

  const steps = routine
    ? routine.steps
    : [
        { label: "עבודה", durationSeconds: 40, type: "work" },
        { label: "מנוחה", durationSeconds: 10, type: "rest" }
      ];

  steps.forEach(addStepRow);
  routinesView.hidden = true;
  editorView.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  routineNameInput.focus();
}

function closeEditor() {
  form.reset();
  stepsList.replaceChildren();
  editingRoutineId = null;
  editorView.hidden = true;
  routinesView.hidden = false;
}

function startRoutine(routine) {
  activeRoutine = {
    ...routine,
    steps: routine.steps.map((step) => ({ ...step }))
  };
  timerSequence = buildTimerSequence(activeRoutine);
  timerPhaseIndex = 0;
  timerPaused = false;
  timerComplete = false;
  routinesView.hidden = true;
  editorView.hidden = true;
  timerView.hidden = false;
  timerRoutineName.textContent = activeRoutine.name;
  pauseTimerButton.hidden = false;
  skipStepButton.hidden = false;
  pauseTimerButton.textContent = "השהיה";
  playBell("phase-start");
  loadTimerPhase();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function buildTimerSequence(routine) {
  const sequence = [];

  for (let cycleIndex = 0; cycleIndex < routine.repeatCount; cycleIndex += 1) {
    routine.steps.forEach((step, stepIndex) => {
      sequence.push({
        ...step,
        cycleIndex,
        stepIndex,
        phaseType: step.type
      });
    });

    const hasAnotherCycle = cycleIndex < routine.repeatCount - 1;
    if (hasAnotherCycle && routine.restBetweenCyclesSeconds > 0) {
      sequence.push({
        label: "מנוחה בין מחזורים",
        durationSeconds: routine.restBetweenCyclesSeconds,
        type: "rest",
        phaseType: "cycle-rest",
        cycleIndex,
        stepIndex: routine.steps.length
      });
    }
  }

  return sequence;
}

function loadTimerPhase() {
  stopTimerInterval();

  if (timerPhaseIndex >= timerSequence.length) {
    completeTimer();
    return;
  }

  const phase = timerSequence[timerPhaseIndex];
  timerSecondsRemaining = phase.durationSeconds;
  timerDeadline = Date.now() + timerSecondsRemaining * 1000;
  timerPanel.dataset.phaseType = phase.phaseType;
  timerStatus.textContent = phase.phaseType === "cycle-rest"
    ? "המחזור הבא מתחיל מיד לאחר המנוחה"
    : "הטיימר פועל";
  pauseTimerButton.textContent = "השהיה";
  timerPaused = false;
  renderTimer();
  timerInterval = window.setInterval(updateTimer, 200);
}

function updateTimer() {
  const remainingMilliseconds = Math.max(0, timerDeadline - Date.now());
  const nextSeconds = Math.ceil(remainingMilliseconds / 1000);

  if (nextSeconds !== timerSecondsRemaining) {
    timerSecondsRemaining = nextSeconds;
    renderTimer();
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
  timerCycleProgress.textContent = phase.phaseType === "cycle-rest"
    ? `הושלם מחזור ${phase.cycleIndex + 1} מתוך ${activeRoutine.repeatCount}`
    : `מחזור ${phase.cycleIndex + 1} מתוך ${activeRoutine.repeatCount}`;
  timerStepProgress.textContent = phase.phaseType === "cycle-rest"
    ? "מנוחה בין מחזורים"
    : `שלב ${phase.stepIndex + 1} מתוך ${activeRoutine.steps.length}`;

  const elapsed = phase.durationSeconds - timerSecondsRemaining;
  const progress = phase.durationSeconds > 0
    ? Math.min(100, Math.max(0, (elapsed / phase.durationSeconds) * 100))
    : 100;
  timerProgressBar.style.width = `${progress}%`;

  const nextPhase = timerSequence[timerPhaseIndex + 1];
  timerNextStep.textContent = nextPhase
    ? `${nextPhase.label}, ${nextPhase.durationSeconds} שניות`
    : "סיום האימון";
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
    timerPaused = false;
    timerDeadline = Date.now() + timerSecondsRemaining * 1000;
    timerInterval = window.setInterval(updateTimer, 200);
    pauseTimerButton.textContent = "השהיה";
    timerStatus.textContent = "הטיימר פועל";
    return;
  }

  timerPaused = true;
  timerSecondsRemaining = Math.ceil(Math.max(0, timerDeadline - Date.now()) / 1000);
  stopTimerInterval();
  pauseTimerButton.textContent = "המשך";
  timerStatus.textContent = "האימון מושהה";
  renderTimer();
}

function advanceTimerPhase() {
  if (timerComplete) {
    return;
  }

  const hasNextPhase = timerPhaseIndex + 1 < timerSequence.length;
  if (hasNextPhase) {
    playBell("phase-start");
  }

  timerPhaseIndex += 1;
  loadTimerPhase();
}

function restartTimer() {
  if (!activeRoutine) {
    return;
  }

  timerPhaseIndex = 0;
  timerComplete = false;
  pauseTimerButton.hidden = false;
  skipStepButton.hidden = false;
  playBell("phase-start");
  loadTimerPhase();
}

function completeTimer() {
  stopTimerInterval();
  timerComplete = true;
  timerPaused = false;
  playBell("phase-start");
  timerPanel.dataset.phaseType = "complete";
  timerPhaseLabel.textContent = "האימון הושלם";
  timerCountdown.textContent = "00:00";
  timerCycleProgress.textContent = `${activeRoutine.repeatCount} מחזורים הושלמו`;
  timerStepProgress.textContent = "כל הכבוד!";
  timerStatus.textContent = "סיימת את כל שלבי האימון";
  timerProgressBar.style.width = "100%";
  timerNextStep.textContent = "האימון הסתיים";
  pauseTimerButton.hidden = true;
  skipStepButton.hidden = true;
}

function exitTimer() {
  stopTimerInterval();
  activeRoutine = null;
  timerSequence = [];
  timerComplete = false;
  timerView.hidden = true;
  routinesView.hidden = false;
}

function stopTimerInterval() {
  window.clearInterval(timerInterval);
  timerInterval = null;
}

function playBell(kind) {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return;
  }

  const context = new AudioContext();
  const notes = [
    { frequency: 783.99, delay: 0 },
    { frequency: 1046.5, delay: 0.2 }
  ];

  notes.forEach(({ frequency, delay }) => {
    const startTime = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.32, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.72);
  });

  window.setTimeout(() => context.close(), 1100);
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
    <label class="field">
      <span>שם השלב</span>
      <input class="step-label" type="text" required>
    </label>
    <label class="field">
      <span>משך (שניות)</span>
      <input class="step-duration" type="number" min="1" step="1" required>
    </label>
    <label class="field">
      <span>סוג</span>
      <select class="step-type">
        <option value="work">עבודה</option>
        <option value="rest">מנוחה</option>
      </select>
    </label>
    <button class="remove-step-button" type="button" aria-label="מחיקת שלב" title="מחיקת שלב">×</button>
  `;

  row.querySelector(".step-label").value = step.label;
  row.querySelector(".step-duration").value = step.durationSeconds;
  row.querySelector(".step-type").value = step.type;
  stepsList.append(row);
}

function handleStepRemoval(event) {
  const button = event.target.closest(".remove-step-button");
  if (!button) {
    return;
  }

  button.closest(".step-row").remove();
}

function handleStepTypeChange(event) {
  if (!event.target.matches(".step-type")) {
    return;
  }

  event.target.closest(".step-row").dataset.stepType = event.target.value;
}

function saveRoutineFromForm(event) {
  event.preventDefault();

  const stepRows = [...stepsList.querySelectorAll(".step-row")];
  if (stepRows.length === 0) {
    window.alert("יש להוסיף לפחות שלב אחד לתוכנית.");
    return;
  }

  const routineData = {
    id: editingRoutineId || createId(),
    name: routineNameInput.value.trim(),
    repeatCount: Number(repeatCountInput.value),
    restBetweenCyclesSeconds: Number(cycleRestInput.value),
    steps: stepRows.map((row) => ({
      label: row.querySelector(".step-label").value.trim(),
      durationSeconds: Number(row.querySelector(".step-duration").value),
      type: row.querySelector(".step-type").value
    }))
  };

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
