export const materials = {
  foam: { k: 0.025 },
  glass: { k: 0.04 },
  coir: { k: 0.055 },
};
export function createState() {
  return {
    temperature: 8,
    setpoint: 4,
    tolerance: 0.5,
    thickness: 50,
    displacement: 6,
    insulation: "foam",
    door: false,
    paused: false,
    speed: 60,
    tariff: 12,
    on: true,
    elapsed: 0,
    energy: 0,
    groceries: [],
    challenge: null,
  };
}
export function addGroceries(s, kind = "milk") {
  if (s.groceries.length >= 6 || s.challenge?.active) return false;
  const capacity =
    kind === "vegetables" ? 5700 : kind === "leftovers" ? 4200 : 3900;
  s.groceries.push({ kind, temperature: 28, capacity });
  return true;
}
export function startChallenge(s) {
  Object.assign(s, createState(), { temperature: 4, speed: 3600 });
  addGroceries(s, "milk");
  addGroceries(s, "vegetables");
  s.challenge = {
    active: true,
    inRange: 0,
    monitored: 0,
    energy: 0,
    passed: false,
  };
}
export function readings(s) {
  const k = materials[s.insulation].k,
    ambient = 28;
  const leak =
    (3.2 * (ambient - s.temperature)) / (s.thickness / 1000 / k + 0.28);
  const doorLoad = s.door ? 9 * Math.max(0, ambient - s.temperature) : 0;
  const te = Math.min(-3, s.temperature - 12),
    tc = ambient + 12;
  const cop = Math.max(1, (0.39 * (te + 273.15)) / (tc - te));
  const rpm = s.on ? 2900 : 0;
  const mass = s.on ? ((s.displacement * 1e-6 * rpm) / 60) * 0.65 * 2.1 : 0;
  const cooling = mass * 210000,
    power = cooling / cop;
  const low = 0.9 * Math.exp(0.033 * (te + 10)),
    high = 0.9 * Math.exp(0.033 * (tc + 10));
  return {
    k,
    leak,
    doorLoad,
    groceryHeat: s.groceries.reduce(
      (sum, item) => sum + 2.5 * (item.temperature - s.temperature),
      0,
    ),
    te,
    cop: s.on ? cop : 0,
    rpm,
    mass,
    cooling,
    power: power + (s.door ? 2 : 0),
    rejected: cooling + power,
    pressure: s.on ? high - low : 0,
    volumetric: s.on
      ? cooling / ((s.displacement * 1e-6 * rpm) / 60) / 1000
      : 0,
  };
}
export function step(s, dt) {
  if (s.paused) return readings(s);
  let remaining = Math.max(0, Math.min(dt, 0.1)) * s.speed;
  if (s.challenge?.active) remaining = Math.min(remaining, 86400 - s.elapsed);
  while (remaining > 0) {
    const h = Math.min(remaining, 0.5);
    if (s.temperature > s.setpoint + s.tolerance) s.on = true;
    else if (s.temperature < s.setpoint - s.tolerance) s.on = false;
    const r = readings(s);
    for (const item of s.groceries)
      item.temperature -=
        ((2.5 * (item.temperature - s.temperature)) / item.capacity) * h;
    s.temperature +=
      ((r.leak + r.doorLoad + r.groceryHeat + (s.door ? 2 : 0) - r.cooling) /
        18000) *
      h;
    s.elapsed += h;
    s.energy += (r.power * h) / 3600000;
    if (s.challenge?.active) {
      const scored = Math.max(0, s.elapsed - Math.max(3600, s.elapsed - h));
      s.challenge.monitored += scored;
      if (s.temperature >= 3 && s.temperature <= 5)
        s.challenge.inRange += scored;
      s.challenge.energy = s.energy;
      if (s.elapsed >= 86400 - 1e-6) {
        s.challenge.active = false;
        s.challenge.passed =
          s.challenge.inRange / s.challenge.monitored >= 0.95 &&
          s.energy <= 0.6;
        s.paused = true;
      }
    }
    remaining -= h;
  }
  return readings(s);
}
