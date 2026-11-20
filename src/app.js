import { createState, readings, step } from "./physics.js";
import { createScene } from "./scene.js";
const $ = (id) => document.getElementById(id);
let state = createState();
const history = [];
const descriptions = {
  compressor: [
    "The small engine of the cooling loop.",
    "A crank drives the piston back and forth, compressing low-pressure vapor. The motor supplies the work needed to move heat out of a colder cabinet.",
  ],
  condenser: [
    "The warmth behind the refrigerator.",
    "Hot vapor releases heat to the kitchen and condenses into liquid. Heat rejected equals heat removed from the cabinet plus compressor input.",
  ],
  capillary: [
    "A tiny tube. A big pressure drop.",
    "A narrow, fixed capillary restricts refrigerant flow. Pressure falls and some liquid flashes into vapor before entering the evaporator.",
  ],
  evaporator: [
    "Where the cooling happens.",
    "Low-pressure refrigerant absorbs cabinet heat as it boils. A fan circulates cabinet air across this cold surface.",
  ],
};
function choose(key) {
  $("storyTitle").textContent = descriptions[key][0];
  $("storyText").textContent = descriptions[key][1];
  document
    .querySelectorAll("[data-part]")
    .forEach((b) => b.classList.toggle("active", b.dataset.part === key));
}
const view = createScene($("stage"), choose);
let mode = "home";
document
  .querySelectorAll("[data-mode]")
  .forEach((b) => (b.onclick = () => setMode(b.dataset.mode)));
function setMode(v) {
  mode = v;
  view.setMode(v);
  document
    .querySelectorAll("[data-mode]")
    .forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === v));
}
document.querySelectorAll("[data-part]").forEach(
  (b) =>
    (b.onclick = () => {
      if (mode === "home") setMode("cutaway");
      choose(b.dataset.part);
    }),
);
for (const id of ["setpoint", "displacement", "insulation", "speed", "tariff"])
  $(id).addEventListener("input", () => {
    state[id] =
      id === "insulation" ? $(id).value : Math.max(0, Number($(id).value) || 0);
    $("setpointOut").textContent = state.setpoint + " °C";
    $("displacementOut").textContent = state.displacement + " cm³";
  });
$("door").onclick = () => {
  state.door = !state.door;
  $("door").textContent = state.door ? "Close door" : "Open door";
  $("door").setAttribute("aria-pressed", state.door);
};
$("pause").onclick = () => {
  state.paused = !state.paused;
  $("pause").textContent = state.paused ? "Resume" : "Pause";
};
$("reset").onclick = () => {
  state = createState();
  history.length = 0;
  for (const id of [
    "setpoint",
    "displacement",
    "insulation",
    "speed",
    "tariff",
  ])
    $(id).value = state[id];
  $("setpointOut").textContent = "4 °C";
  $("displacementOut").textContent = "6 cm³";
  $("door").textContent = "Open door";
  $("door").setAttribute("aria-pressed", false);
  $("pause").textContent = "Pause";
  setMode("home");
};
$("labels").onclick = () => {
  const value = $("labels").getAttribute("aria-pressed") !== "true";
  $("labels").setAttribute("aria-pressed", value);
  view.setLabels(value);
};
$("guideButton").onclick = () => $("guide").showModal();
$("closeGuide").onclick = () => $("guide").close();
let last = performance.now(),
  lastSample = 0;
function telemetry(r) {
  $("cabinet").textContent = state.temperature.toFixed(1);
  $("status").textContent = state.paused
    ? "Simulation paused"
    : state.on
      ? "Compressor running"
      : "Thermostat resting";
  $("thermostatState").textContent = state.door
    ? "Door open · warm air entering"
    : state.on
      ? "Pulling heat out of the cabinet"
      : "Setpoint reached · compressor off";
  $("cooling").textContent = r.cooling.toFixed(0) + " W";
  $("power").textContent = r.power.toFixed(0) + " W";
  $("evap").textContent = state.on ? r.te.toFixed(1) + " °C" : "Resting";
  $("cop").textContent = state.on ? r.cop.toFixed(2) : "—";
  $("conductivity").textContent = "k = " + r.k.toFixed(3) + " W/(m·K)";
  $("leak").textContent = r.leak.toFixed(0) + " W wall leakage";
  $("mass").textContent = (r.mass * 1000).toFixed(2) + " g/s";
  $("pressure").textContent = state.on
    ? r.pressure.toFixed(1) + " bar"
    : "Equalizing";
  $("rejected").textContent = r.rejected.toFixed(0) + " W";
  $("volumetric").textContent = r.volumetric.toFixed(0) + " kJ/m³";
  $("energy").textContent = state.energy.toFixed(4) + " kWh";
  $("cost").textContent = "₱" + (state.energy * state.tariff).toFixed(3);
  $("elapsed").textContent =
    Math.floor(state.elapsed / 3600) +
    "h " +
    Math.floor((state.elapsed % 3600) / 60) +
    "m";
}
function frame(now) {
  const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
  last = now;
  const r = step(state, dt);
  view.update(dt, state, r);
  telemetry(r);
  if (now - lastSample > 1000 && !state.paused) {
    history.push(state.temperature);
    if (history.length > 100) history.shift();
    const lo = Math.min(0, ...history),
      hi = Math.max(10, ...history);
    $("trend").setAttribute(
      "d",
      history
        .map(
          (v, i) =>
            (i ? "L" : "M") +
            ((i / Math.max(1, history.length - 1)) * 120).toFixed(1) +
            " " +
            (40 - ((v - lo) / (hi - lo)) * 35).toFixed(1),
        )
        .join(" "),
    );
    lastSample = now;
  }
  requestAnimationFrame(frame);
}
document.addEventListener("visibilitychange", () => (last = performance.now()));
requestAnimationFrame(frame);
