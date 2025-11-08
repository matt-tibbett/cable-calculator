const resistivity = {
  1: 0.0181,
  1.5: 0.0121,
  2.5: 0.00741,
  4: 0.00461,
  6: 0.00308,
  10: 0.00183,
  16: 0.00115,
  25: 0.000727,
  35: 0.000524,
  50: 0.000387,
};

const maxZsTable = {
  B: { 6: 7.67, 15: 3.08, 20: 2.30, 25: 1.84, 32: 1.44, 40: 1.15, 45: 1.02, 50: 0.92, 63: 0.72 },
  C: { 6: 3.83, 15: 1.54, 20: 1.15, 25: 0.92, 32: 0.72, 40: 0.58, 45: 0.51, 50: 0.46, 63: 0.36 },
  D: { 6: 1.92, 15: 0.77, 20: 0.57, 25: 0.46, 32: 0.36, 40: 0.29, 45: 0.26, 50: 0.23, 63: 0.18 },
};

class CableCalculator {
  constructor(root, name, onChange) {
    this.root = root;
    this.name = name;
    this.onChange = onChange;
    this.root.querySelector(".calc-body").innerHTML = this.getTemplate(name);
    this.bindElements();
    this.addListeners();
    this.calculate();
  }

  getTemplate(name) {
  const radioName = `circuit-${name}`;
  return `
    <div class="input-group">
      <label>Ze / Zdb (Ω):</label>
      <input type="number" class="ze" min="0" step="0.01" value="0.35" />
    </div>

    <div class="input-group inline2">
      <div class="col">
        <label>OCPD (A)</label>
        <select class="ocpd">
          ${[6, 15, 20, 25, 32, 40, 45, 50, 63]
            .map(a => `<option>${a}</option>`)
            .join("")}
        </select>
      </div>
      <div class="col">
        <label>Type</label>
        <select class="type">
          <option>B</option>
          <option>C</option>
          <option>D</option>
        </select>
      </div>
    </div>

    <div class="input-group">
      <label>Design Current (A):</label>
      <input type="text" class="ib" value="32" />
      <div class="checkbox small">
        <input type="checkbox" class="use-ocpd" checked />
        <label>Use OCPD</label>
      </div>
    </div>

    <div class="input-group">
      <label>Conductor CSA (mm²):</label>
      <select class="csa">
        ${Object.keys(resistivity)
          .map(parseFloat)
          .sort((a, b) => a - b)
          .map(s => `<option>${s}</option>`)
          .join("")}
      </select>
    </div>

    <div class="input-group">
      <label>CPC CSA (mm²):</label>
      <select class="cpc">
        ${Object.keys(resistivity)
          .map(parseFloat)
          .sort((a, b) => a - b)
          .map(s => `<option>${s}</option>`)
          .join("")}
      </select>
    </div>

    <div class="input-group">
      <label>Cable Length (m): <span class="length-value">50</span>m</label>
      <input type="range" class="length" min="1" max="100" value="50" />
    </div>

    <!-- Top info: circuit type + limits -->
    <div class="top-info">
      <fieldset class="circuit-type">
        <legend>Circuit Type</legend>
        <label><input type="radio" name="${radioName}" value="lighting" checked /> Lighting</label>
        <label><input type="radio" name="${radioName}" value="other" /> Other</label>
      </fieldset>

      <div class="limits">
        <div class="row">
          <span>Max Zs (100%):</span><span class="max-zs">0.00</span> Ω
        </div>
        <div class="row small">
          <span>Design Zs (80%):</span><span class="design-zs">0.00</span> Ω
        </div>
        <div class="row">
          <span>Max Vd:</span><span class="max-vd">0.00</span> V
        </div>
      </div>
    </div> <!-- ✅ close .top-info -->

    <!-- Output results section -->
    <div class="output">
      <div class="header-row">
        <span>Ze</span>
        <span>R1 + R2</span>
        <span>Zs</span>
      </div>
      <div class="value-row">
        <span class="ze-val">0.35</span>
        <span class="r1r2">0.000</span>
        <span class="zs">0.00</span>
      </div>
      <div class="vd-row">
        <span class="label">Volt Drop:</span>
        <span class="vdrop">0.00</span> V (<span class="vdrop-percent">0.00</span>%)
      </div>
    </div>
  `;
}


  bindElements() {
    const q = s => this.root.querySelector(s);
    this.inputs = {
      ze: q(".ze"),
      ocpd: q(".ocpd"),
      type: q(".type"),
      csa: q(".csa"),
      cpc: q(".cpc"),
      length: q(".length"),
      ib: q(".ib"),
      useOcpd: q(".use-ocpd"),
      lengthValue: q(".length-value"),
      circuitRadios: this.root.querySelectorAll('fieldset input[type="radio"]'),
    };
    this.outputs = {
      zeVal: q(".ze-val"),
      r1r2: q(".r1r2"),
      zs: q(".zs"),
      vdrop: q(".vdrop"),
      vdropPercent: q(".vdrop-percent"),
      maxZs: q(".max-zs"),
      maxVd: q(".max-vd"),
    };
  }

  addListeners() {
    const i = this.inputs;
    const trigger = () => {
      this.calculate();
      if (this.onChange) this.onChange();
    };

    i.useOcpd.addEventListener("change", () => {
      i.ib.disabled = i.useOcpd.checked;
      if (i.useOcpd.checked) i.ib.value = i.ocpd.value;
      trigger();
    });

    [i.ocpd, i.type, i.csa, i.cpc, i.length, i.ib, i.ze].forEach(el =>
      el.addEventListener("input", trigger)
    );

    i.circuitRadios.forEach(r => r.addEventListener("change", trigger));
  }

  calculate() {
  const i = this.inputs;
  const L = parseFloat(i.length.value);
  const ocpdVal = parseFloat(i.ocpd.value);
  const I = i.useOcpd.checked ? ocpdVal : parseFloat(i.ib.value);
  const r1 = resistivity[parseFloat(i.csa.value)];
  const r2 = resistivity[parseFloat(i.cpc.value)];
  const ze = parseFloat(i.ze.value);
  const breakerType = i.type.value;

  const r1r2 = (r1 + r2) * L;
  const vdrop = I * r1r2;
  const vdropPercent = (vdrop / 230) * 100;
  const zs = ze + r1r2;

  const maxZsRaw = maxZsTable[breakerType][ocpdVal] || 0;  // tabulated 100 %
  const maxZsDesign = maxZsRaw * 0.8;                       // design 80 %

  const circuitType = [...i.circuitRadios].find(r => r.checked).value;
  const maxVd = circuitType === "lighting" ? 230 * 0.03 : 230 * 0.05;

  const o = this.outputs;
  o.zeVal.textContent = ze.toFixed(2);
  o.r1r2.textContent = r1r2.toFixed(4);
  o.zs.textContent = zs.toFixed(2);
  o.vdrop.textContent = vdrop.toFixed(2);
  o.vdropPercent.textContent = vdropPercent.toFixed(2);
  o.maxZs.textContent = maxZsRaw.toFixed(2);
  o.maxVd.textContent = maxVd.toFixed(1);
  i.lengthValue.textContent = L;

  // --- 80 % design Zs display (if element exists) ---
  if (!o.designZs) o.designZs = this.root.querySelector(".design-zs");
  if (o.designZs) o.designZs.textContent = maxZsDesign.toFixed(2);

  // --- Colour logic ---
  const zsOk = zs <= maxZsDesign;
  o.zs.className = zsOk ? "ok" : "bad";

  const vdOk = vdrop <= maxVd;
  o.vdrop.className = o.vdropPercent.className = vdOk ? "ok" : "bad";

  return { zs, vdrop, vdropPercent, r1r2 };
}

}

// --- Initialize calculators ---
//const submain = new CableCalculator(document.getElementById("submain"), "sub", updateOverall);
//const circuit = new CableCalculator(document.getElementById("circuit"), "circ", updateOverall);
//const modeToggle = document.getElementById("dual-mode");

// Create calculators
const submain = new CableCalculator(document.getElementById("submain"), "sub", updateOverall);
const circuit = new CableCalculator(document.getElementById("circuit"), "circ", updateOverall);
const singleCircuit = new CableCalculator(document.getElementById("single-circuit"), "single", updateOverall);
const modeToggle = document.getElementById("dual-mode");


// Mode management
modeToggle.addEventListener("change", () => setMode(modeToggle.checked));

function setMode(dual) {
  const submainDetails = document.getElementById("submain-details");
  const circuitDetails = document.getElementById("circuit-details");
  const singleCircuitDiv = document.getElementById("single-circuit");
  const overallDiv = document.querySelector(".overall-results");

  if (dual) {
    // --- SUBMAIN MODE ON ---
    submainDetails.style.display = "block";
    circuitDetails.style.display = "block";
    singleCircuitDiv.style.display = "none";
    overallDiv.style.display = "block";
    overallDiv.classList.add("sticky");

    // Lock Circuit Ze (comes from submain)
    circuit.inputs.ze.disabled = true;
    circuit.inputs.ze.classList.add("disabled");

    // Submain circuit type fixed to "Other"
    submain.inputs.circuitRadios.forEach(r => {
      r.checked = r.value === "other";
      r.disabled = true;
      r.closest("label").classList.add("disabled");
    });

  } else {
    // --- SINGLE-CIRCUIT MODE ---
    submainDetails.style.display = "none";
    circuitDetails.style.display = "none";
    singleCircuitDiv.style.display = "block";
    overallDiv.style.display = "none";
    overallDiv.classList.remove("sticky");

    // Re-enable Circuit Ze
    circuit.inputs.ze.disabled = false;
    circuit.inputs.ze.classList.remove("disabled");

    // Re-enable Submain circuit type
    submain.inputs.circuitRadios.forEach(r => {
      r.disabled = false;
      r.closest("label").classList.remove("disabled");
    });
  }

  updateOverall();
}





function updateOverall() {
  const dual = modeToggle.checked;
  const overallBox = document.querySelector(".overall-results");

  if (dual) {
    const sub = submain.calculate();
    circuit.inputs.ze.value = sub.zs.toFixed(2);
    circuit.inputs.ze.disabled = true;
    const circ = circuit.calculate();

    const overallZs = sub.zs + circ.r1r2;
    const overallVd = sub.vdrop + circ.vdrop;
    const overallVdPercent = (overallVd / 230) * 100;

    const finalType = [...circuit.inputs.circuitRadios].find(r => r.checked).value;
    const maxOverallPercent = finalType === "lighting" ? 3 : 5;
    const vdOK = overallVdPercent <= maxOverallPercent;

    // Update output
    document.getElementById("overall-zs").textContent = overallZs.toFixed(2);
    document.getElementById("overall-vd").textContent = overallVd.toFixed(2);
    const vdEl = document.getElementById("overall-vd-percent");
    vdEl.textContent = overallVdPercent.toFixed(2);
    vdEl.className = vdOK ? "ok" : "bad";

    // Overall box colour
    overallBox.classList.toggle("ok", vdOK);
    overallBox.classList.toggle("bad", !vdOK);
  } else {
    const circ = circuit.calculate();
    document.getElementById("overall-zs").textContent = circ.zs.toFixed(2);
    document.getElementById("overall-vd").textContent = circ.vdrop.toFixed(2);
    const vdEl = document.getElementById("overall-vd-percent");
    vdEl.textContent = circ.vdropPercent.toFixed(2);
    vdEl.className = "";
    overallBox.classList.remove("ok", "bad");
  }
}

// Initialise default (single-circuit mode)
setMode(false);
