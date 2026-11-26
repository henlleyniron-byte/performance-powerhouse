const DATA_URL = "assets/physics-intelligence-data.json";
const STORAGE_KEY = "al_performance_powerhouse_physics_intelligence_v1";
const OUTCOMES = new Set(["correct", "wrong", "guessed", "slow", "unattempted"]);
const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

const state = {
  data: null,
  attempts: [],
  visibleFamilies: 24,
  shareMode: new URLSearchParams(location.search).get("share") === "1",
};
let shareRevision = 0;

const el = (id) => document.getElementById(id);
const pct = (value, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const escapeCsv = (value) => `"${String(value).replaceAll('"', '""')}"`;

function loadLocalState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    state.attempts = Array.isArray(parsed.attempts) ? parsed.attempts : [];
  } catch {
    state.attempts = [];
  }
}

function shareActive() {
  return state.shareMode || new URLSearchParams(location.search).get("share") === "1";
}

function validateAttempts(value) {
  if (!Array.isArray(value) || value.length > 20000) throw new Error("Backup attempts are missing or exceed the supported limit.");
  const validFamilies = new Set(state.data.currentFamilies.map((family) => family.familyId));
  return value.map((attempt) => {
    if (!attempt || typeof attempt !== "object" || Array.isArray(attempt)) throw new Error("Backup contains an invalid attempt.");
    if (!validFamilies.has(attempt.familyId) || !OUTCOMES.has(attempt.outcome)) throw new Error("Backup contains an unknown family or outcome.");
    if (!Number.isInteger(attempt.timeSeconds) || attempt.timeSeconds < 0 || attempt.timeSeconds > 1200) throw new Error("Backup contains an invalid time value.");
    if (!Number.isInteger(attempt.confidence) || attempt.confidence < 1 || attempt.confidence > 5) throw new Error("Backup contains an invalid confidence value.");
    if (typeof attempt.recordedAt !== "string" || !Number.isFinite(Date.parse(attempt.recordedAt))) throw new Error("Backup contains an invalid record date.");
    return {
      familyId: attempt.familyId,
      outcome: attempt.outcome,
      timeSeconds: attempt.timeSeconds,
      confidence: attempt.confidence,
      recordedAt: attempt.recordedAt,
    };
  });
}

function validateBackup(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Backup must be a JSON object.");
  if (value.version !== undefined && value.version !== 1) throw new Error("Backup version is not supported.");
  if (value.storageKey !== undefined && value.storageKey !== STORAGE_KEY) throw new Error("Backup belongs to a different tool.");
  return validateAttempts(value.attempts);
}

function showBackupStatus(message) {
  const status = el("backupStatus");
  status.textContent = message;
  status.hidden = false;
}

function saveLocalState() {
  if (shareActive()) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, attempts: state.attempts }));
  return true;
}

function setShareMode(enabled) {
  if (state.shareMode !== enabled) shareRevision += 1;
  state.shareMode = enabled;
  document.body.classList.toggle("share-mode", enabled);
  el("shareBanner").hidden = !enabled;
  el("shareToggle").textContent = enabled ? "Exit share mode" : "Share mode";
  const url = new URL(location.href);
  if (enabled) url.searchParams.set("share", "1"); else url.searchParams.delete("share");
  history.replaceState(null, "", url);
  if (enabled) clearPrivatePerformance();
}

function clearPrivatePerformance() {
  el("recommendations").replaceChildren();
  el("opportunityTable").replaceChildren();
}

function populateControls() {
  const years = state.data.byYear.map((row) => row.year);
  for (const id of ["yearFrom", "yearTo"]) {
    el(id).innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join("");
  }
  el("yearFrom").value = "2000";
  el("yearTo").value = "2025";
  const unitOptions = state.data.units.map((unit) => `<option value="${unit.name}">${unit.name}</option>`).join("");
  el("unitFilter").innerHTML = unitOptions;
  el("unitFilter").value = "Mechanics";
  el("familyUnit").insertAdjacentHTML("beforeend", unitOptions);
  el("attemptFamily").innerHTML = state.data.currentFamilies
    .map((family) => `<option value="${family.familyId}">${family.familyId} · ${family.name}</option>`)
    .join("");
}

function selectedYears() {
  let start = Number(el("yearFrom").value);
  let end = Number(el("yearTo").value);
  if (start > end) [start, end] = [end, start];
  const era = el("eraFilter").value;
  return state.data.byYear.filter((row) => row.year >= start && row.year <= end && (era === "all" || row.era === era));
}

function renderOverview() {
  const { overview, release } = state.data;
  el("metricQuestions").textContent = overview.questions.toLocaleString();
  el("metricYears").textContent = overview.examinationYears;
  el("metricCurrent").textContent = overview.currentEra.questions;
  el("metricFamilies").textContent = overview.currentEra.families;
  el("releaseHash").textContent = `Checkpoint ${release.checkpointZipSha256.slice(0, 12)}…`;
  for (const [id, values] of [["validatedList", state.data.scope.validated], ["provisionalList", state.data.scope.provisional], ["unavailableList", state.data.scope.unavailable]]) {
    el(id).innerHTML = values.map((value) => `<li>${value}</li>`).join("");
  }
  el("externalLink").href = state.data.externalComparison.url;
}

function aggregateUnits(rows) {
  const result = new Map(state.data.units.map((unit) => [unit.name, { count: 0, years: 0 }]));
  let totalQuestions = 0;
  for (const row of rows) {
    totalQuestions += row.questionCount;
    for (const unit of state.data.units) {
      const count = row.units[unit.name].count;
      result.get(unit.name).count += count;
      if (count > 0) result.get(unit.name).years += 1;
    }
  }
  return { result, totalQuestions };
}

function renderBarsAndTable(rows) {
  const { result, totalQuestions } = aggregateUnits(rows);
  const ordered = [...result.entries()].map(([unit, values]) => ({ unit, ...values, share: totalQuestions ? values.count / totalQuestions : 0 }))
    .sort((a, b) => b.share - a.share || a.unit.localeCompare(b.unit));
  const maxShare = Math.max(...ordered.map((row) => row.share), 0.01);
  el("unitBars").innerHTML = ordered.map((row) => `<div class="bar-row"><span>${row.unit}</span><div class="bar-track"><div class="bar-fill" style="width:${(row.share / maxShare) * 100}%"></div></div><span class="bar-value">${pct(row.share)}</span></div>`).join("");
  el("unitTable").innerHTML = ordered.map((row) => `<tr><td>${row.unit}</td><td>${row.count}</td><td>${pct(row.share, 2)}</td><td>${rows.length ? (row.count / rows.length).toFixed(2) : "—"}</td><td>${row.years}/${rows.length}</td></tr>`).join("");
}

function renderTrend(rows) {
  const unit = el("unitFilter").value;
  const svg = el("trendChart");
  const width = 720, height = 270, left = 42, right = 18, top = 18, bottom = 38;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  el("trendTitle").textContent = `${unit} trend`;
  if (!rows.length) {
    svg.innerHTML = `<text x="20" y="50" class="axis-text">No years match this filter.</text>`;
    el("trendSummary").textContent = "No selected papers";
    return;
  }
  const values = rows.map((row) => ({ year: row.year, value: row.units[unit].percentage }));
  const maxValue = Math.max(...values.map((row) => row.value), 0.2);
  const yMax = Math.ceil(maxValue * 10) / 10;
  const x = (index) => left + (index / Math.max(values.length - 1, 1)) * (width - left - right);
  const y = (value) => top + (1 - value / yMax) * (height - top - bottom);
  let grid = "";
  for (let i = 0; i <= 4; i++) {
    const value = yMax * i / 4;
    const yPos = y(value);
    grid += `<line x1="${left}" x2="${width - right}" y1="${yPos}" y2="${yPos}" class="chart-gridline"/><text x="${left - 6}" y="${yPos + 4}" text-anchor="end" class="axis-text">${Math.round(value * 100)}%</text>`;
  }
  const points = values.map((row, index) => `${x(index)},${y(row.value)}`).join(" ");
  const area = `${left},${height - bottom} ${points} ${x(values.length - 1)},${height - bottom}`;
  const labels = values.map((row, index) => index % Math.ceil(values.length / 9) === 0 || index === values.length - 1 ? `<text x="${x(index)}" y="${height - 15}" text-anchor="middle" class="axis-text">${row.year}</text>` : "").join("");
  const dots = values.map((row, index) => `<circle cx="${x(index)}" cy="${y(row.value)}" r="4" class="chart-dot"><title>${row.year}: ${pct(row.value, 2)}</title></circle>`).join("");
  svg.innerHTML = `${grid}<polygon points="${area}" class="chart-area"/><polyline points="${points}" class="chart-line"/>${dots}${labels}`;
  const mean = values.reduce((sum, row) => sum + row.value, 0) / values.length;
  el("trendSummary").textContent = `${values.length} papers · mean ${pct(mean, 2)}`;
}

function heatColor(value, max) {
  const intensity = max ? value / max : 0;
  const lightness = 15 + intensity * 48;
  return `hsl(201 78% ${lightness}%)`;
}

function renderHeatmap(rows) {
  const units = state.data.units.map((unit) => unit.name);
  const max = Math.max(...rows.flatMap((row) => units.map((unit) => row.units[unit].percentage)), 0.01);
  const abbreviations = {"Oscillations and Waves":"O&W","Gravitational Field":"Gravity","Electrostatic Field":"Electrostatic","Magnetic Field":"Magnetic","Current Electricity":"Current","Mechanical Properties of Matter":"MPM","Matter and Radiation":"M&R","Thermal Physics":"Thermal"};
  let html = `<div class="heatmap-grid" style="grid-template-columns:54px repeat(${units.length}, minmax(58px,1fr))"><span></span>${units.map((unit) => `<span class="heat-label">${abbreviations[unit] || unit}</span>`).join("")}`;
  for (const row of rows) {
    html += `<span class="heat-label heat-year">${row.year}</span>`;
    for (const unit of units) {
      const value = row.units[unit].percentage;
      html += `<span class="heat-cell" style="background:${heatColor(value, max)}" title="${row.year} · ${unit}: ${row.units[unit].count}/${row.questionCount} (${pct(value, 2)})">${Math.round(value * 100)}</span>`;
    }
  }
  html += "</div>";
  el("heatmap").innerHTML = html;
}

function renderDistribution() {
  const rows = selectedYears();
  renderTrend(rows);
  renderBarsAndTable(rows);
  renderHeatmap(rows);
}

function filteredFamilies() {
  const query = el("familySearch").value.trim().toLowerCase();
  const unit = el("familyUnit").value;
  const minimum = Number(el("familyRecurrence").value);
  return state.data.currentFamilies.filter((family) => {
    const matchesQuery = !query || `${family.familyId} ${family.name} ${family.subtopic} ${family.questionReferences.join(" ")}`.toLowerCase().includes(query);
    return matchesQuery && (unit === "all" || family.unit === unit) && family.recurrenceCount >= minimum;
  });
}

function renderFamilies(reset = false) {
  if (reset) state.visibleFamilies = 24;
  const families = filteredFamilies();
  el("familyCount").textContent = `${families.length} families`;
  el("familyList").innerHTML = families.slice(0, state.visibleFamilies).map((family) => `<article class="family-card"><header><h3>${family.familyId} · ${family.name}</h3><span class="recurrence">${family.recurrenceCount} question${family.recurrenceCount === 1 ? "" : "s"}</span></header><p class="family-meta">${family.unit} · ${family.subtopic}</p><p class="family-refs"><strong>Years:</strong> ${family.years.join(", ")}<br><strong>References:</strong> ${family.questionReferences.join(" · ")}</p></article>`).join("");
  el("showMoreFamilies").hidden = state.visibleFamilies >= families.length;
}

function familyScores() {
  const maxFrequency = Math.max(...state.data.currentFamilies.map((family) => family.recurrenceCount), 1);
  return state.data.currentFamilies.map((family) => {
    const attempts = state.attempts.filter((attempt) => attempt.familyId === family.familyId);
    if (!attempts.length) return { family, attempts, score: null, parts: null };
    const weaknessMap = { correct: 0, wrong: 1, guessed: .75, slow: .55, unattempted: .45 };
    const frequency = family.recurrenceCount / maxFrequency;
    const weakness = attempts.reduce((sum, attempt) => sum + weaknessMap[attempt.outcome], 0) / attempts.length;
    const wrongLike = attempts.filter((attempt) => attempt.outcome === "wrong").length + attempts.filter((attempt) => attempt.outcome === "guessed").length * .5;
    const repeated = Math.min(1, wrongLike / 3);
    const averageTime = attempts.reduce((sum, attempt) => sum + attempt.timeSeconds, 0) / attempts.length;
    const timeLoss = Math.max(0, Math.min(1, (averageTime - 75) / 105));
    const mismatchValues = attempts.filter((attempt) => attempt.outcome === "wrong" || attempt.outcome === "guessed").map((attempt) => attempt.confidence / 5);
    const mismatch = mismatchValues.length ? mismatchValues.reduce((a, b) => a + b, 0) / mismatchValues.length : 0;
    const score = 100 * (.30 * frequency + .30 * weakness + .15 * repeated + .15 * timeLoss + .10 * mismatch);
    return { family, attempts, score, parts: { frequency, weakness, repeated, timeLoss, mismatch, averageTime } };
  }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
}

function actionFor(item) {
  const latest = item.attempts.at(-1);
  if (!latest) return "Log a timed baseline";
  if (latest.outcome === "wrong" || latest.outcome === "guessed") return "Revise, then retest closed-book";
  if (latest.outcome === "slow" || item.parts.averageTime > 105) return "Practise under a 90-second cap";
  if (latest.outcome === "unattempted") return "Repair prerequisite, then attempt";
  return "Maintain with delayed retest";
}

function renderPerformance() {
  if (shareActive()) {
    clearPrivatePerformance();
    return;
  }
  const scored = familyScores();
  const usable = scored.filter((item) => item.score !== null);
  if (!usable.length) {
    el("recommendations").innerHTML = `<article class="recommendation"><span>NEXT MOVE</span><strong>Log one honest timed Physics MCQ</strong><small>A recommendation requires your marked outcome, time and confidence.</small></article>`;
    el("opportunityTable").innerHTML = `<tr><td colspan="6">No private evidence yet. Frequency alone will not be disguised as a personal diagnosis.</td></tr>`;
    return;
  }
  const revise = usable.find((item) => ["wrong", "guessed", "unattempted"].includes(item.attempts.at(-1).outcome)) || usable[0];
  const practise = usable.find((item) => item.attempts.at(-1).outcome === "slow" || item.parts.averageTime > 105) || usable[0];
  const retest = usable.find((item) => ["wrong", "guessed"].includes(item.attempts.at(-1).outcome)) || usable[0];
  el("recommendations").innerHTML = [["REVISE", revise], ["PRACTISE", practise], ["RETEST", retest]].map(([label, item]) => `<article class="recommendation"><span>${label}</span><strong>${item.family.name}</strong><small>${item.family.unit} · score ${item.score.toFixed(1)}</small></article>`).join("");
  el("opportunityTable").innerHTML = usable.slice(0, 12).map((item, index) => {
    const outcomes = Object.entries(item.attempts.reduce((acc, attempt) => (acc[attempt.outcome] = (acc[attempt.outcome] || 0) + 1, acc), {})).map(([key, value]) => `${value} ${key}`).join(", ");
    return `<tr><td>${index + 1}</td><td>${item.family.name}</td><td>${item.family.unit}</td><td class="score">${item.score.toFixed(1)}</td><td>${outcomes}; avg ${Math.round(item.parts.averageTime)}s</td><td>${actionFor(item)}</td></tr>`;
  }).join("");
}

function downloadFilteredCsv() {
  const rows = selectedYears();
  const lines = [["exam_year", "era", "question_count", "unit", "count", "normalized_percentage"].map(escapeCsv).join(",")];
  for (const row of rows) for (const unit of state.data.units) lines.push([row.year, row.era, row.questionCount, unit.name, row.units[unit.name].count, row.units[unit.name].percentage].map(escapeCsv).join(","));
  const blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "text/csv;charset=utf-8" });
  const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "physics-unit-distribution-filtered.csv" });
  link.click();
  URL.revokeObjectURL(link.href);
}

function bindEvents() {
  for (const id of ["yearFrom", "yearTo", "eraFilter", "unitFilter"]) el(id).addEventListener("change", renderDistribution);
  for (const id of ["familySearch", "familyUnit", "familyRecurrence"]) el(id).addEventListener(id === "familySearch" ? "input" : "change", () => renderFamilies(true));
  el("showMoreFamilies").addEventListener("click", () => { state.visibleFamilies += 24; renderFamilies(); });
  el("downloadCsv").addEventListener("click", downloadFilteredCsv);
  el("shareToggle").addEventListener("click", () => {
    setShareMode(!state.shareMode);
    renderPerformance();
  });
  el("attemptForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (shareActive()) return;
    const previous = state.attempts;
    state.attempts = [...previous, {
      familyId: el("attemptFamily").value,
      outcome: el("attemptOutcome").value,
      timeSeconds: Number(el("attemptTime").value),
      confidence: Number(el("attemptConfidence").value),
      recordedAt: new Date().toISOString(),
    }];
    try {
      if (!saveLocalState()) throw new Error("Share mode is active.");
      renderPerformance();
    } catch {
      state.attempts = previous;
      showBackupStatus("This browser could not save the new outcome. Existing records were kept.");
    }
  });
  el("exportBackup").addEventListener("click", () => {
    if (shareActive()) return;
    const blob = new Blob([JSON.stringify({ version: 1, storageKey: STORAGE_KEY, attempts: state.attempts }, null, 2)], { type: "application/json" });
    const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "physics-intelligence-private-backup.json" });
    link.click(); URL.revokeObjectURL(link.href);
  });
  el("importBackup").addEventListener("change", async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file || shareActive()) return;
    const requestRevision = shareRevision;
    if (file.size > MAX_BACKUP_BYTES) {
      showBackupStatus("Import rejected: the backup exceeds the 2 MB limit.");
      return;
    }
    let attempts;
    try {
      attempts = validateBackup(JSON.parse(await file.text()));
    } catch {
      showBackupStatus("Import rejected: the backup is malformed or contains unsupported records. Your saved records were kept.");
      return;
    }
    if (shareActive() || requestRevision !== shareRevision) return;
    if (!confirm(`Replace ${state.attempts.length} saved outcome(s) with ${attempts.length} imported outcome(s)?`)) {
      showBackupStatus("Import cancelled. Your saved records were kept.");
      return;
    }
    if (shareActive() || requestRevision !== shareRevision) return;
    const previous = state.attempts;
    state.attempts = attempts;
    try {
      if (!saveLocalState()) throw new Error("Share mode is active.");
      renderPerformance();
      showBackupStatus(`Imported ${attempts.length} validated outcome(s).`);
    } catch {
      state.attempts = previous;
      showBackupStatus("Import failed while saving. Your existing records were kept.");
    }
  });
}

async function init() {
  setShareMode(state.shareMode);
  const response = await fetch(DATA_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load validated data (${response.status})`);
  state.data = await response.json();
  loadLocalState();
  populateControls();
  renderOverview();
  renderDistribution();
  renderFamilies();
  renderPerformance();
  bindEvents();
}

init().catch((error) => {
  console.error(error);
  const main = document.querySelector("main");
  const section = document.createElement("section");
  section.className = "panel section-panel";
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "DATA LOAD ERROR";
  const heading = document.createElement("h1");
  heading.textContent = "Physics Intelligence could not start.";
  const detail = document.createElement("p");
  detail.textContent = error instanceof Error ? error.message : "Unknown error";
  section.append(eyebrow, heading, detail);
  main.replaceChildren(section);
});
