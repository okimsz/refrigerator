import test from "node:test";
import assert from "node:assert/strict";
import {
  createState,
  readings,
  step,
  addGroceries,
  startChallenge,
} from "../src/physics.js";
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
test("groceries transfer equal energy out of food and into cabinet", () => {
  const s = createState();
  s.temperature = 4;
  s.setpoint = 8;
  s.on = false;
  s.speed = 1;
  addGroceries(s, "milk");
  const before = readings(s),
    t = s.temperature,
    food = s.groceries[0].temperature;
  step(s, 0.1);
  const cabinetGain = (s.temperature - t) * 18000,
    foodLoss = (food - s.groceries[0].temperature) * s.groceries[0].capacity;
  assert.ok(Math.abs(cabinetGain - foodLoss - before.leak * 0.1) < 1e-8);
  assert.ok(s.groceries[0].temperature < food);
});
test("challenge finishes exactly at one day and rewards a viable strategy", () => {
  const s = createState();
  startChallenge(s);
  assert.equal(addGroceries(s), false);
  for (let i = 0; i < 241; i++) step(s, 0.1);
  assert.equal(s.elapsed, 86400);
  assert.equal(s.challenge.active, false);
  assert.equal(s.paused, true);
  assert.equal(s.challenge.monitored, 82800);
  assert.equal(s.challenge.passed, true);
  const snapshot = JSON.stringify(s);
  step(s, 0.1);
  assert.equal(JSON.stringify(s), snapshot);
});
test("door left open fails the temperature objective", () => {
  const s = createState();
  startChallenge(s);
  s.door = true;
  for (let i = 0; i < 241; i++) step(s, 0.1);
  assert.equal(s.challenge.passed, false);
  assert.ok(s.challenge.inRange / s.challenge.monitored < 0.95);
});
