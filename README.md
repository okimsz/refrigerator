# Hearth — Farmhouse refrigerator

A procedural Three.js refrigerator inside a rustic kitchen. No runtime network requests or installation step. Includes a working hinged door, Kitchen and See inside modes, animated compressor piston, evaporator fan, refrigerant direction markers, automatic idle orbit, and live educational thermal simulation. The farmhouse kitchen remains visible in both modes.

## Open in VS Code

Use Node.js 20 or newer. Clone the repository and start the preview:

```sh
git clone https://github.com/okimsz/refrigerator.git
cd refrigerator
npm run dev
```

Open http://127.0.0.1:5175/. Keep the terminal running. Do not open the modular `index.html` using a file URL: browsers restrict local module imports.

## Standalone offline version

```sh
npm run build
```

Open `dist/farmhouse-refrigerator.html` directly in Chrome or Edge. This single file embeds Three.js, CSS and JavaScript. WebGL/hardware acceleration is required. The included Three.js MIT license is retained in the bundle.

## Deploy on Render

Create a **Static Site** in the Render dashboard and connect `okimsz/refrigerator`.
Use branch `main`, leave Root Directory blank, set Build Command to `npm run build`,
and Publish Directory to `dist`. No start command or environment variables are needed.
Click **Deploy Static Site**. Render provides the public URL when deployment finishes.

Alternatively, create a Blueprint using the included `render.yaml`.
The build writes `dist/index.html` for hosting and retains the standalone
`dist/farmhouse-refrigerator.html` for offline use. No dependency installation is required.

## Files

- `models/`: STL exports of the kitchen, assembled refrigerator and inspection view; see its README for scale and printing limitations.

- `src/scene.js`: kitchen, refrigerator, teardown geometry, camera and animations.
- `src/physics.js`: thermal balance, thermostat, material properties and energy use.
- `src/app.js`: controls and readings.
- `src/styles.css`: responsive interface.
- `src/errors.js`: visible startup diagnostics.
- `scripts/`: dependency-free local server and offline bundler.

Run `npm test` for physics checks. No npm install is needed. The custom bundler supports unaliased relative named imports only.

## Model boundaries

Educational, single-temperature cabinet, 18 kJ/K thermal capacity, 28 °C room, 3.2 m² wall area, adjustable 20–100 mm insulation (default 50 mm). Representative dry conductivity: foam .025, fiberglass .040, coir .055 W/(m·K); construction and moisture change real values. Thermostat tolerance is adjustable from ±0.25 to ±2 °C (default ±0.5 °C). The ON/OFF thresholds are target plus/minus tolerance. Cooling uses compressor displacement, nominal 2900 rpm, volumetric efficiency .65 and a representative suction vapor density of 2.1 kg/m³ and refrigeration effect of 210 kJ/kg. COP is .39 of Carnot COP. Pressure lift uses a rough R600a-like exponential approximation, not a property library. No quantitative appliance performance claim is made.

Opening the door adds sensible heat infiltration and 2 W lighting. Inspection opens the visual shell without changing the physical door state. The rear circuit is pulled forward and separated for teaching; normally the evaporator is inside and the condenser behind the cabinet. Mechanism and flow markers are slowed down. Off-cycle pressure equalization, frost, humidity and defrost are omitted. Session cost uses an editable example tariff, not a current utility price.

## Interactive experiments

Add up to six warm grocery loads. Milk, vegetables and leftovers start at 28 °C with representative lumped heat capacities of 3.9, 5.7 and 4.2 kJ/K respectively. Each load exchanges heat with the cabinet at 2.5 W/K; energy removed from groceries is added to cabinet air/contents. Grocery colors fade from warm orange to cool blue. These are illustrative loads, not food-safety predictions.

Blue arrows show internal circulation when cooling runs and the cabinet is visually open. Orange arrows show physical door infiltration and wall heat leakage; wall arrow size follows insulation heat loss. Compressor displacement changes piston stroke and flow-marker speed at fixed nominal motor RPM. Thermostat changes affect the physical on/off cycle rather than instantly changing temperature.

The 24h challenge starts at 4 °C with warm milk and vegetables and default controls. Its game target is at least 95% of monitored time in 3–5 °C after one hour of settling and no more than 0.60 kWh over the full day. Additional loads are locked during the challenge for consistency. Completion pauses the simulation. Restart resets the challenge; Reset returns to free exploration. At 3600×, one simulated day takes about 24 seconds at normal rendering rates. Time acceleration does not accelerate the mechanical teaching animation.

Reference: [Danfoss — How a refrigerator works](https://www.danfoss.com/en-in/about-danfoss/our-businesses/cooling/the-fridge-how-it-works/).
