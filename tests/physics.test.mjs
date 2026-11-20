import test from "node:test";
import assert from "node:assert/strict";
import { createState, readings, step } from "../src/physics.js";
test("cycle conserves energy and capacity responds to displacement", () => {
  const s = createState();
  for (const d of [3, 6, 10]) {
    s.displacement = d;
    const r = readings(s);
    assert.ok(Math.abs(r.rejected - r.cooling - r.power) < 1e-9);
    assert.ok(r.mass > 0 && r.cop > 1);
  }
  s.displacement = 3;
  const a = readings(s);
  s.displacement = 6;
  assert.equal(readings(s).cooling, 2 * a.cooling);
});
test("insulation and door change heat load", () => {
  const s = createState();
  const foam = readings(s);
  s.insulation = "coir";
  assert.ok(readings(s).leak > foam.leak);
  s.door = true;
  assert.ok(readings(s).doorLoad > 0);
});
test("thermostat cycles, pause freezes, accumulated energy nonnegative", () => {
  const s = createState();
  s.temperature = 3;
  step(s, 0.1);
  assert.equal(s.on, false);
  s.temperature = 5;
  step(s, 0.1);
  assert.equal(s.on, true);
  s.paused = true;
  const original = JSON.stringify(s);
  step(s, 0.1);
  assert.equal(JSON.stringify(s), original);
  s.paused = false;
  for (let i = 0; i < 10000; i++) step(s, 0.1);
  assert.ok(s.temperature > 3 && s.temperature < 5);
  assert.ok(s.energy > 0);
});
