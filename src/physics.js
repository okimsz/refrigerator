export const materials = {
  foam: { k: 0.025 },
  glass: { k: 0.04 },
  coir: { k: 0.055 },
};
export function createState() {
  return {
    temperature: 8,
    setpoint: 4,
    displacement: 6,
    insulation: "foam",
    door: false,
    paused: false,
    speed: 60,
    tariff: 12,
    on: true,
    elapsed: 0,
    energy: 0,
  };
}
export function readings(s) {
  const k = materials[s.insulation].k,
    ambient = 28;
  const leak = (3.2 * (ambient - s.temperature)) / (0.05 / k + 0.28);
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
  let remaining = Math.min(dt, 0.1) * s.speed;
  while (remaining > 0) {
    const h = Math.min(remaining, 0.5);
    if (s.temperature > s.setpoint + 0.5) s.on = true;
    else if (s.temperature < s.setpoint - 0.5) s.on = false;
    const r = readings(s);
    s.temperature +=
      ((r.leak + r.doorLoad + (s.door ? 2 : 0) - r.cooling) / 18000) * h;
    s.elapsed += h;
    s.energy += (r.power * h) / 3600000;
    remaining -= h;
  }
  return readings(s);
}
