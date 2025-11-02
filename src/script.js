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

const ocpd = document.getElementById("ocpd");
const type = document.getElementById("type");
const csa = document.getElementById("csa");
const cpc = document.getElementById("cpc");
const length = document.getElementById("length");
const lengthValue = document.getElementById("length-value");
const r1r2Out = document.getElementById("r1r2");
const vdropOut = document.getElementById("vdrop");
const vdropPercentOut = document.getElementById("vdrop-percent");
const zsOut = document.getElementById("zs");
const maxZsOut = document.getElementById("max-zs");
const maxVdOut = document.getElementById("max-vd");
const ibInput = document.getElementById("ib");
const useOcpd = document.getElementById("use-ocpd");
const zeInput = document.getElementById("ze");
const zeVal = document.getElementById("ze-val");
const circuitRadios = document.querySelectorAll('input[name="circuit"]');

function calculate() {
  const L = parseFloat(length.value);
  const ocpdVal = parseFloat(ocpd.value);
  const I = useOcpd.checked ? ocpdVal : parseFloat(ibInput.value);
  const r1 = resistivity[parseFloat(csa.value)];
  const r2 = resistivity[parseFloat(cpc.value)];
  const ze = parseFloat(zeInput.value);
  const breakerType = type.value;

  const r1r2 = (r1 + r2) * L;
  const vdrop = I * r1r2;
  const vdropPercent = (vdrop / 230) * 100;
  const zs = ze + r1r2;
  const maxZs = maxZsTable[breakerType][ocpdVal] || 0;

  const circuitType = document.querySelector('input[name="circuit"]:checked').value;
  const maxVd = circuitType === "lighting" ? (230 * 0.03) : (230 * 0.05);

  // Update fields
  zeVal.textContent = ze.toFixed(2);
  r1r2Out.textContent = r1r2.toFixed(4);
  zsOut.textContent = zs.toFixed(2);
  vdropOut.textContent = vdrop.toFixed(2);
  vdropPercentOut.textContent = vdropPercent.toFixed(2);
  maxZsOut.textContent = maxZs.toFixed(2);
  maxVdOut.textContent = maxVd.toFixed(1);
  lengthValue.textContent = L;

  // Volt drop color
  const vdOk = vdrop <= maxVd;
  vdropOut.className = vdropPercentOut.className = vdOk ? "ok" : "bad";

  // Zs color
  const zsOk = zs <= maxZs;
  zsOut.className = zsOk ? "ok" : "bad";
}

useOcpd.addEventListener("change", () => {
  const checked = useOcpd.checked;
  ibInput.disabled = checked;
  if (checked) {
    ibInput.value = ocpd.value;
  }
  calculate();
});

ocpd.addEventListener("change", () => {
  if (useOcpd.checked) ibInput.value = ocpd.value;
  calculate();
});

[ocpd, type, csa, cpc, length, ibInput, zeInput].forEach(el => el.addEventListener("input", calculate));
circuitRadios.forEach(r => r.addEventListener("change", calculate));

ibInput.disabled = useOcpd.checked;
if (useOcpd.checked) ibInput.value = ocpd.value;
calculate();
