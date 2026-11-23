export function createScene(host, onPick) {
  const T = window.THREE;
  if (!T) throw new Error("Three.js is missing.");
  const scene = new T.Scene();
  scene.background = new T.Color("#d7d6c3");
  scene.fog = new T.Fog("#d7d6c3", 12, 25);
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  host.prepend(renderer.domElement);
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    window.fridgeFail("The graphics context was lost. Reload the page.");
  });
  const camera = new T.PerspectiveCamera(40, 1, 0.05, 80);
  scene.add(new T.HemisphereLight(0xfff4d8, 0x687b63, 2.1));
  const sun = new T.DirectionalLight(0xffeed0, 3.3);
  sun.position.set(-3, 6, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, {
    left: -7,
    right: 7,
    top: 7,
    bottom: -7,
    near: 0.1,
    far: 20,
  });
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  const fill = new T.DirectionalLight(0xc6e3e8, 1.2);
  fill.position.set(4, 2, -1);
  scene.add(fill);
  const mat = (color, metalness = 0, roughness = 0.65) =>
    new T.MeshStandardMaterial({ color, metalness, roughness });
  const cream = mat("#e9e3ce"),
    sage = mat("#71826a", 0.25, 0.36),
    wood = mat("#9c7046"),
    darkwood = mat("#64482f"),
    white = mat("#f8f1df"),
    black = mat("#303b36", 0.3),
    brass = mat("#b48b48", 0.75, 0.26),
    steel = mat("#a6b5b1", 0.8, 0.3),
    copper = mat("#bd7141", 0.7, 0.3),
    cold = mat("#579caf", 0.55, 0.3),
    hot = mat("#d26d48", 0.45, 0.3),
    gold = mat("#cead5d", 0.6, 0.3);
  function mesh(g, m, parent, x = 0, y = 0, z = 0) {
    const o = new T.Mesh(g, m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  }
  function box(p, x, y, z, w, h, d, m) {
    return mesh(new T.BoxGeometry(w, h, d), m, p, x, y, z);
  }
  function cyl(p, x, y, z, r, h, m) {
    return mesh(new T.CylinderGeometry(r, r, h, 32), m, p, x, y, z);
  }
  function ball(p, x, y, z, r, m) {
    return mesh(new T.SphereGeometry(r, 20, 12), m, p, x, y, z);
  }
  function tube(p, points, r, m) {
    const path = new T.CatmullRomCurve3(
      points.map((v) => new T.Vector3(...v)),
      false,
      "centripetal",
    );
    const o = mesh(
      new T.TubeGeometry(path, Math.max(32, points.length * 8), r, 8, false),
      m,
      p,
    );
    return { path, o };
  }
  const room = new T.Group();
  scene.add(room);
  // Individual timber planks, board joints and deterministic grain lines.
  for (let i = 0; i < 15; i++) {
    const m = mat(
      new T.Color("#a88960").multiplyScalar(0.88 + (i % 4) * 0.055),
    );
    box(room, -3.5 + i * 0.49, -0.055, 0.15, 0.48, 0.1, 5.2, m);
    for (let j = 0; j < 4; j++)
      box(
        room,
        -3.5 + i * 0.49 - 0.19 + j * 0.12,
        -0.002,
        0.15,
        0.003,
        0.001,
        5.15,
        darkwood,
      );
    for (let j = 0; j < 3; j++)
      box(
        room,
        -3.5 + i * 0.49,
        0,
        -1.7 + j * 1.7 + (i % 2) * 0.8,
        0.47,
        0.002,
        0.008,
        darkwood,
      );
  }
  const back = new T.Group();
  room.add(back);
  box(back, -0.3, 1.6, -1.55, 7.1, 3.2, 0.12, cream);
  for (let y = 0.15; y < 3.2; y += 0.22)
    box(back, -0.3, y, -1.48, 7.1, 0.009, 0.008, mat("#d5cdb8"));
  box(back, -0.3, 0.1, -1.44, 7.1, 0.18, 0.08, white);
  for (const x of [-3.7, 0.1, 3.1])
    box(back, x, 1.65, -1.38, 0.13, 3.3, 0.16, darkwood);
  box(back, -0.3, 3.14, -1.35, 7.1, 0.18, 0.25, darkwood);
  // Window, divided panes and sunlight patches.
  box(back, -2.1, 2.02, -1.46, 1.35, 1.28, 0.03, mat("#b9d9d1"));
  for (const x of [-2.82, -2.1, -1.38])
    box(back, x, 2.02, -1.38, 0.07, 1.42, 0.13, white);
  for (const y of [1.35, 2.02, 2.69])
    box(back, -2.1, y, -1.37, 1.5, 0.07, 0.14, white);
  box(back, -2.1, 1.29, -1.27, 1.65, 0.1, 0.4, wood);
  // Farmhouse cabinet and apron sink.
  box(room, -2.2, 0.48, -0.88, 2.25, 0.9, 0.93, sage);
  box(room, -2.2, 0.96, -0.83, 2.37, 0.12, 1.06, wood);
  for (const x of [-2.95, -2.2, -1.45]) {
    box(room, x, 0.48, -0.398, 0.68, 0.71, 0.035, mat("#7e8f75"));
    box(room, x, 0.72, -0.36, 0.19, 0.025, 0.035, brass);
  }
  box(room, -2.15, 0.98, -0.68, 0.82, 0.12, 0.63, white);
  box(room, -2.15, 1.05, -0.43, 0.82, 0.25, 0.07, white);
  box(room, -2.15, 1.05, -0.94, 0.82, 0.18, 0.06, white);
  for (const x of [-2.54, -1.76])
    box(room, x, 1.05, -0.68, 0.06, 0.18, 0.56, white);
  box(room, -2.15, 1, -0.68, 0.69, 0.015, 0.43, mat("#9aa8a0"));
  tube(
    room,
    [
      [-2.15, 1.02, -1.1],
      [-2.15, 1.4, -1.1],
      [-2.15, 1.45, -0.84],
      [-2.15, 1.29, -0.78],
    ],
    0.025,
    brass,
  );
  // Open shelving, crockery, jars and herbs.
  for (const y of [1.65, 2.32]) {
    box(room, 1.87, y, -1.18, 1.85, 0.07, 0.48, wood);
    for (const x of [1.2, 2.5])
      box(room, x, y - 0.12, -1.34, 0.04, 0.28, 0.05, black);
    for (let i = 0; i < 3; i++) {
      cyl(
        room,
        1.3 + i * 0.22,
        y + 0.13,
        -1.16,
        0.08,
        0.2,
        i === 1 ? sage : white,
      );
      cyl(room, 1.3 + i * 0.22, y + 0.24, -1.16, 0.085, 0.03, wood);
    }
    for (let j = 0; j < 3; j++)
      cyl(room, 2.25, y + 0.05 + j * 0.025, -1.14, 0.2, 0.018, white);
  }
  function plant(x, y, z) {
    cyl(room, x, y + 0.09, z, 0.11, 0.18, mat("#ab6946"));
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4;
      const leaf = ball(
        room,
        x + Math.sin(a) * 0.1,
        y + 0.24 + (i % 3) * 0.07,
        z + Math.cos(a) * 0.08,
        0.075,
        mat(i % 2 ? "#55774d" : "#7c9259"),
      );
      leaf.scale.set(0.6, 1.8, 0.5);
      leaf.rotation.z = Math.sin(a) * 0.7;
    }
  }
  plant(-3, 1.03, -0.9);
  plant(2.52, 2.36, -1.15);
  cyl(room, -1.38, 1.12, -0.85, 0.12, 0.25, white);
  for (let i = 0; i < 5; i++) {
    const spoon = cyl(room, -1.4 + i * 0.015, 1.39, -0.85, 0.012, 0.36, wood);
    spoon.rotation.z = (i - 2) * 0.12;
  }
  // Woven rug and a small stool make the refrigerator part of a real room.
  const rug = box(room, 0.15, 0.007, 1.0, 2.25, 0.012, 1.15, mat("#d6c8a4"));
  for (let i = 0; i < 22; i++)
    box(
      room,
      -0.92 + i * 0.1,
      0.016,
      1,
      0.025,
      0.004,
      1.14,
      i % 3 ? cream : wood,
    );
  cyl(room, 2.25, 0.51, 0.12, 0.37, 0.1, wood);
  for (const x of [2.03, 2.47])
    for (const z of [-0.1, 0.34]) {
      const leg = cyl(room, x, 0.25, z, 0.035, 0.5, darkwood);
      leg.rotation.z = (x - 2.25) * 0.15;
    }
  const fridge = new T.Group();
  fridge.position.set(0, 0, 0);
  scene.add(fridge);
  for (const x of [-0.43, 0.43])
    for (const z of [-0.3, 0.35]) cyl(fridge, x, 0.07, z, 0.06, 0.13, black);
  const shell = new T.Group();
  fridge.add(shell);
  box(shell, -0.53, 1.19, 0, 0.1, 2.15, 0.9, sage);
  box(shell, 0.53, 1.19, 0, 0.1, 2.15, 0.9, sage);
  box(shell, 0, 2.25, 0, 1.16, 0.1, 0.9, sage);
  box(shell, 0, 0.16, 0, 1.16, 0.1, 0.9, sage);
  const backPanel = box(shell, 0, 1.2, -0.43, 1.05, 2.1, 0.08, sage);
  const liner = new T.Group();
  fridge.add(liner);
  box(liner, 0, 1.25, -0.365, 0.96, 1.94, 0.05, white);
  box(liner, -0.465, 1.24, 0, 0.03, 1.94, 0.76, white);
  box(liner, 0.465, 1.24, 0, 0.03, 1.94, 0.76, white);
  box(liner, 0, 2.17, 0, 0.95, 0.04, 0.76, white);
  box(liner, 0, 0.31, 0, 0.95, 0.04, 0.76, white);
  const glass = new T.MeshStandardMaterial({
    color: "#c4ded7",
    transparent: true,
    opacity: 0.38,
    roughness: 0.12,
    metalness: 0.1,
  });
  for (const y of [0.7, 1.1, 1.5, 1.9]) {
    box(liner, 0, y, 0.015, 0.91, 0.022, 0.7, glass);
    box(liner, 0, y, 0.37, 0.92, 0.024, 0.022, steel);
  }
  box(liner, 0, 0.49, 0.04, 0.86, 0.3, 0.63, glass);
  const foods = new T.Group();
  liner.add(foods);
  for (let i = 0; i < 4; i++) {
    ball(
      foods,
      -0.28 + i * 0.17,
      0.78,
      0.1,
      0.075,
      mat(i % 2 ? "#b95738" : "#c3a652"),
    );
  }
  for (const x of [-0.26, -0.05]) {
    cyl(foods, x, 1.24, -0.02, 0.07, 0.25, cream);
    cyl(foods, x, 1.38, -0.02, 0.073, 0.03, gold);
  }
  box(foods, 0.23, 1.28, 0, 0.16, 0.34, 0.17, white);
  box(foods, 0.23, 1.3, 0.09, 0.13, 0.1, 0.006, sage);
  for (let i = 0; i < 3; i++) {
    cyl(foods, -0.24 + i * 0.23, 1.57, -0.02, 0.08, 0.12, white);
    ball(foods, -0.24 + i * 0.23, 1.64, -0.02, 0.075, mat("#9a7956"));
  }
  const doorPivot = new T.Group();
  doorPivot.position.set(-0.57, 0, 0.46);
  fridge.add(doorPivot);
  box(doorPivot, 0.57, 1.21, 0.035, 1.14, 2.1, 0.13, sage);
  box(doorPivot, 0.57, 1.21, -0.041, 1.04, 1.98, 0.025, black);
  box(doorPivot, 0.57, 1.21, -0.063, 0.99, 1.93, 0.04, white);
  for (const y of [0.55, 1.15, 1.72]) {
    box(doorPivot, 0.57, y, -0.145, 0.88, 0.06, 0.18, white);
    box(doorPivot, 0.57, y + 0.08, -0.23, 0.88, 0.15, 0.025, glass);
  }
  box(doorPivot, 1.02, 1.42, 0.15, 0.035, 0.51, 0.045, brass);
  for (const y of [1.18, 1.66])
    box(doorPivot, 1.02, y, 0.12, 0.035, 0.035, 0.07, brass);
  box(doorPivot, 0.57, 1.93, 0.107, 0.26, 0.055, 0.008, brass);
  const interiorLight = new T.PointLight("#e7f7e0", 0, 2);
  interiorLight.position.set(0, 1.8, 0.2);
  fridge.add(interiorLight);
  // Teaching rig: the actual rear circuit slides out into an accessible inspection position.
  const rig = new T.Group();
  rig.position.set(0, 0, -0.55);
  scene.add(rig);
  const rigBacking = box(
    rig,
    0,
    1.1,
    -0.08,
    1.04,
    1.9,
    0.025,
    mat("#47584b", 0.2),
  );
  const compressor = new T.Group();
  compressor.position.set(-0.25, 0.35, 0);
  rig.add(compressor);
  const compressorShell = cyl(compressor, 0, 0, 0, 0.19, 0.38, black);
  const shellTop = ball(compressor, 0, 0.19, 0, 0.19, black);
  shellTop.scale.y = 0.35;
  box(compressor, 0, -0.22, 0, 0.48, 0.05, 0.4, steel);
  const motor = cyl(compressor, 0, -0.1, 0, 0.13, 0.15, copper);
  const crank = box(compressor, 0, 0.08, 0, 0.035, 0.025, 0.025, brass);
  const piston = box(compressor, 0.12, 0.1, 0, 0.08, 0.1, 0.12, steel);
  const rod = box(compressor, 0.04, 0.08, 0, 0.11, 0.025, 0.025, brass);
  const cylinder = box(compressor, 0.15, 0.1, -0.08, 0.2, 0.14, 0.025, black);
  const circuits = [];
  function circuit(points, m, key) {
    const { path, o } = tube(rig, points, 0.018, m);
    o.userData.part = key;
    const dots = [];
    for (let i = 0; i < 9; i++) {
      const d = mesh(
        new T.ConeGeometry(0.032, 0.085, 8),
        mat("#fff3cc", 0.1, 0.2),
        rig,
      );
      dots.push(d);
    }
    circuits.push({ path, dots });
    return o;
  }
  // High-pressure gas rises to the condenser, liquid descends to the capillary.
  const condPoints = [
    [-0.25, 0.52, 0],
    [-0.48, 0.65, 0],
    [-0.48, 1.96, 0],
    [0.45, 1.96, 0],
    [0.45, 1.83, 0],
    [-0.37, 1.83, 0],
    [-0.37, 1.7, 0],
    [0.45, 1.7, 0],
    [0.45, 1.57, 0],
    [-0.37, 1.57, 0],
    [-0.37, 1.44, 0],
    [0.45, 1.44, 0],
    [0.45, 1.31, 0],
    [0.08, 1.31, 0],
  ];
  circuit(condPoints, hot, "condenser");
  for (let x = -0.4; x < 0.46; x += 0.065)
    box(rig, x, 1.67, -0.03, 0.008, 0.68, 0.012, copper);
  const capPoints = [[0.08, 1.31, 0]];
  for (let i = 0; i <= 65; i++) {
    const a = (i / 65) * Math.PI * 10;
    capPoints.push([
      0.08 + Math.cos(a) * 0.065,
      1.22 - (i / 65) * 0.29,
      0.02 + Math.sin(a) * 0.065,
    ]);
  }
  capPoints.push([0.35, 0.87, 0.02]);
  circuit(capPoints, gold, "capillary");
  const evapPoints = [
    [0.35, 0.87, 0.02],
    [-0.38, 0.87, 0.02],
    [-0.38, 0.76, 0.02],
    [0.4, 0.76, 0.02],
    [0.4, 0.65, 0.02],
    [-0.38, 0.65, 0.02],
    [-0.38, 0.57, 0.02],
    [-0.25, 0.53, 0.02],
  ];
  circuit(evapPoints, cold, "evaporator");
  const fan = new T.Group();
  fan.position.set(0.28, 0.35, 0.06);
  rig.add(fan);
  cyl(fan, 0, 0, 0, 0.035, 0.09, steel).rotation.x = Math.PI / 2;
  for (let i = 0; i < 5; i++) {
    const pivot = new T.Group();
    pivot.rotation.z = (i * Math.PI * 2) / 5;
    fan.add(pivot);
    const blade = box(pivot, 0, 0.085, 0, 0.055, 0.14, 0.012, steel);
    blade.rotation.y = 0.45;
  }
  const ring = mesh(
    new T.TorusGeometry(0.17, 0.009, 8, 40),
    steel,
    rig,
    0.28,
    0.35,
    0.04,
  );
  const groceryGroup = new T.Group();
  liner.add(groceryGroup);
  const groceryModels = [];
  const airArrows = [],
    leakArrows = [];
  let showAir = true,
    airPhase = 0,
    flowPhase = 0;
  for (let i = 0; i < 18; i++) {
    const arrow = new T.ArrowHelper(
      new T.Vector3(0, -1, 0),
      new T.Vector3(),
      0.15,
      i < 10 ? 0x438fae : 0xda7947,
      0.065,
      0.035,
    );
    fridge.add(arrow);
    airArrows.push(arrow);
  }
  for (let i = 0; i < 5; i++) {
    const arrow = new T.ArrowHelper(
      new T.Vector3(-1, 0, 0),
      new T.Vector3(0.95, 0.55 + i * 0.32, 0.3),
      0.35,
      0xda7947,
      0.1,
      0.06,
    );
    fridge.add(arrow);
    leakArrows.push(arrow);
  }
  const tags = [];
  const thermalMaterial = new T.MeshBasicMaterial({
    color: "#62b8df",
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
    side: T.DoubleSide,
  });
  const thermalVolume = box(
    fridge,
    0,
    1.24,
    0.03,
    0.9,
    1.84,
    0.72,
    thermalMaterial,
  );
  thermalVolume.castShadow = false;
  thermalVolume.receiveShadow = false;
  const rejectedArrows = [];
  for (let i = 0; i < 4; i++) {
    const arrow = new T.ArrowHelper(
      new T.Vector3(0.4, 1, 0).normalize(),
      new T.Vector3(),
      0.3,
      0xe57a3c,
      0.1,
      0.055,
    );
    rig.add(arrow);
    rejectedArrows.push(arrow);
  }
  const tagRoot = document.getElementById("tags");
  for (const [key, text, pos] of [
    ["compressor", "Compressor", [-0.23, 0.2, 0.12]],
    ["condenser", "Condenser", [0, 2.08, 0.06]],
    ["capillary", "Capillary", [0.34, 1.15, 0.1]],
    ["evaporator", "Evaporator", [-0.12, 0.95, 0.08]],
  ]) {
    const el = document.createElement("button");
    el.className = "tag";
    el.textContent = text;
    el.onclick = () => onPick(key);
    tagRoot.append(el);
    tags.push({ el, pos: new T.Vector3(...pos), key });
  }
  let mode = "home",
    showLabels = true,
    orbit = false,
    lastInput = performance.now(),
    angle = 0.48,
    elevation = 0.3,
    distance = 6.7,
    doorAngle = 0,
    spread = 0,
    phase = 0,
    drag = null,
    pinch = 0;
  const target = new T.Vector3(-0.35, 1.15, 0),
    desired = new T.Vector3();
  const pointers = new Map();
  const canvas = renderer.domElement;
  canvas.addEventListener("pointerdown", (e) => {
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    canvas.setPointerCapture(e.pointerId);
    drag = [e.clientX, e.clientY];
    lastInput = performance.now();
    orbit = false;
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, [e.clientX, e.clientY]);
    if (pointers.size === 2) {
      const a = [...pointers.values()];
      const gap = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]);
      if (pinch)
        distance = Math.max(3.4, Math.min(11, (distance * pinch) / gap));
      pinch = gap;
    } else if (drag) {
      angle -= (e.clientX - drag[0]) * 0.006;
      elevation = Math.max(
        0.08,
        Math.min(1.15, elevation + (e.clientY - drag[1]) * 0.005),
      );
    }
    drag = [e.clientX, e.clientY];
    lastInput = performance.now();
  });
  for (const ev of ["pointerup", "pointercancel"])
    canvas.addEventListener(ev, (e) => {
      pointers.delete(e.pointerId);
      drag = null;
      pinch = 0;
      lastInput = performance.now();
    });
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      distance = Math.max(
        3.4,
        Math.min(11, distance * Math.exp(e.deltaY * 0.001)),
      );
      lastInput = performance.now();
    },
    { passive: false },
  );
  const raycaster = new T.Raycaster();
  canvas.addEventListener("click", (e) => {
    if (mode === "home") return;
    const r = canvas.getBoundingClientRect();
    raycaster.setFromCamera(
      new T.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        (-(e.clientY - r.top) / r.height) * 2 + 1,
      ),
      camera,
    );
    const hit = raycaster
      .intersectObjects(rig.children, true)
      .find((h) => h.object.userData.part);
    if (hit) onPick(hit.object.userData.part);
  });
  function resetView() {
    angle = 0.48;
    elevation = 0.3;
    distance = host.clientWidth < 600 ? 8 : 6.7;
    lastInput = performance.now();
    orbit = false;
  }
  resetView();
  const resize = new ResizeObserver(() => {
    const w = host.clientWidth,
      h = host.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  resize.observe(host);
  function update(dt, s, r) {
    const ease = 1 - Math.exp(-dt * 5);
    spread +=
      ((mode === "home" ? 0 : mode === "cutaway" ? 1 : 1.3) - spread) * ease;
    rig.position.x = spread * 1.45;
    rig.position.z = -0.55 + spread * 0.95;
    rigBacking.visible = mode === "home";
    compressorShell.visible = mode === "home";
    shellTop.visible = mode === "home";
    backPanel.visible = mode === "home";
    shell.position.x +=
      ((mode === "exploded" ? -0.55 : 0) - shell.position.x) * ease;
    liner.position.x +=
      ((mode === "exploded" ? -0.25 : 0) - liner.position.x) * ease;
    const wantedDoor = s.door || mode !== "home" ? -Math.PI * 0.62 : 0;
    doorAngle += (wantedDoor - doorAngle) * ease;
    doorPivot.rotation.y = doorAngle;
    doorPivot.position.x = -0.57 - (mode === "exploded" ? spread * 0.3 : 0);
    interiorLight.intensity = s.door || mode !== "home" ? 1.2 : 0;
    thermalVolume.visible = showAir && (mode !== "home" || s.door);
    thermalMaterial.color
      .copy(new T.Color("#238dd4"))
      .lerp(
        new T.Color("#ed8a45"),
        Math.max(0, Math.min(1, s.temperature / 28)),
      );
    rejectedArrows.forEach((arrow, i) => {
      arrow.visible = showAir && s.on;
      arrow.position.set(
        -0.25 + i * 0.21,
        2.04 + ((airPhase * 0.23 + i * 0.07) % 0.18),
        0.08,
      );
      arrow.setLength(
        0.12 + r.rejected / 450,
        0.07 + r.rejected / 2500,
        0.04 + r.rejected / 5000,
      );
    });
    if (!s.paused) {
      airPhase += dt;
      if (s.on) flowPhase += (dt * 2.6 * s.displacement) / 6;
    }
    while (groceryModels.length > s.groceries.length) {
      const model = groceryModels.pop();
      groceryGroup.remove(model);
      model.geometry.dispose();
      model.material.dispose();
    }
    for (let i = 0; i < s.groceries.length; i++) {
      if (
        groceryModels[i] &&
        groceryModels[i].userData.kind !== s.groceries[i].kind
      ) {
        const old = groceryModels[i];
        groceryGroup.remove(old);
        old.geometry.dispose();
        old.material.dispose();
        groceryModels[i] = null;
      }
      if (!groceryModels[i]) {
        const material = mat("#d98248");
        const item = s.groceries[i];
        const g =
          item.kind === "vegetables"
            ? new T.SphereGeometry(0.075, 16, 12)
            : new T.BoxGeometry(0.13, item.kind === "milk" ? 0.19 : 0.1, 0.14);
        const model = mesh(
          g,
          material,
          groceryGroup,
          -0.28 + (i % 3) * 0.28,
          2.02,
          -0.16 + Math.floor(i / 3) * 0.36,
        );
        model.userData.kind = item.kind;
        groceryModels[i] = model;
      }
      groceryModels[i].material.color
        .copy(new T.Color("#619fae"))
        .lerp(
          new T.Color("#db7843"),
          Math.max(0, Math.min(1, (s.groceries[i].temperature - 4) / 24)),
        );
    }
    airArrows.forEach((arrow, i) => {
      const t = (airPhase * 0.3 + (i % 10) / 10) % 1;
      arrow.visible =
        showAir && (i < 10 ? s.on && (s.door || mode !== "home") : s.door);
      if (i < 10) {
        arrow.position.set(-0.34 + 0.68 * (i % 2), 2.02 - t * 1.55, 0.48);
        arrow.setDirection(
          new T.Vector3(i % 2 === 0 ? 0.15 : -0.15, -1, 0).normalize(),
        );
      } else {
        arrow.position.set(
          -0.25 + (i % 3) * 0.25,
          0.7 + (i % 4) * 0.3,
          1.2 - t * 0.7,
        );
        arrow.setDirection(new T.Vector3(0, 0, -1));
      }
    });
    leakArrows.forEach((arrow, i) => {
      arrow.visible = showAir;
      const strength = Math.max(0.3, Math.min(1.6, r.leak / 40));
      arrow.setLength(
        0.22 + strength * 0.2,
        0.06 + strength * 0.05,
        0.025 + strength * 0.04,
      );
      arrow.position.x = 0.95 + Math.sin(airPhase * 2 + i) * 0.04;
    });
    if (!s.paused && r.rpm) {
      phase += dt * 2.6;
      fan.rotation.z -= dt * 8;
    }
    {
      const crankRadius = (0.035 * s.displacement) / 6;
      const cx = crankRadius * Math.cos(phase),
        cy = crankRadius * Math.sin(phase),
        px = cx + Math.sqrt(0.11 ** 2 - cy ** 2);
      crank.rotation.z = phase;
      crank.scale.x = s.displacement / 6;
      crank.position.set(cx / 2, 0.08 + cy / 2, 0);
      piston.position.set(px, 0.08, 0);
      rod.position.set((cx + px) / 2, 0.08 + cy / 2, 0);
      rod.rotation.z = Math.atan2(-cy, px - cx);
      const radius = 9 + s.displacement * 1.4,
        x = 30 + radius * Math.cos(phase),
        y = 32 + radius * Math.sin(phase);
      const end = x + Math.sqrt(90 ** 2 - (y - 32) ** 2);
      document.getElementById("demoCrank").setAttribute("x2", x);
      document.getElementById("demoCrank").setAttribute("y2", y);
      const demoRod = document.getElementById("demoRod");
      demoRod.setAttribute("x1", x);
      demoRod.setAttribute("y1", y);
      demoRod.setAttribute("x2", end);
      document.getElementById("demoPiston").setAttribute("x", end - 7);
    }
    for (const c of circuits)
      for (let i = 0; i < c.dots.length; i++) {
        const t = (flowPhase * 0.035 + i / c.dots.length) % 1;
        const p = c.path.getPointAt(t),
          tangent = c.path.getTangentAt(t);
        c.dots[i].position.copy(p);
        c.dots[i].quaternion.setFromUnitVectors(
          new T.Vector3(0, 1, 0),
          tangent,
        );
        c.dots[i].visible = s.on;
        c.dots[i].scale.setScalar(0.65 + s.displacement / 10);
      }
    if ((orbit || performance.now() - lastInput > 12000) && !drag)
      angle += dt * 0.085;
    desired.set(mode === "home" ? -0.35 : 0.45, 1.15, 0);
    target.lerp(desired, ease);
    const dist = distance * (camera.aspect < 1 ? 1.25 : 1);
    camera.position.set(
      target.x + Math.sin(angle) * Math.cos(elevation) * dist,
      target.y + Math.sin(elevation) * dist,
      target.z + Math.cos(angle) * Math.cos(elevation) * dist,
    );
    camera.lookAt(target);
    scene.updateMatrixWorld();
    for (const tag of tags) {
      const p = rig.localToWorld(tag.pos.clone()).project(camera);
      tag.el.hidden = !showLabels || mode === "home" || p.z > 1 || p.z < -1;
      tag.el.style.left = (p.x * 0.5 + 0.5) * host.clientWidth + "px";
      tag.el.style.top = (-p.y * 0.5 + 0.5) * host.clientHeight + "px";
    }
    renderer.render(scene, camera);
    window.fridgeReady = true;
    document.getElementById("startup").hidden = true;
  }
  return {
    update,
    setMode(v) {
      mode = v;
      resetView();
    },
    setLabels(v) {
      showLabels = v;
    },
    setAirflow(v) {
      showAir = v;
    },
    setTour(v) {
      orbit = v;
      lastInput = performance.now();
    },
    resetView,
  };
}
