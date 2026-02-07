function toggleDark() {
  document.body.classList.toggle("light");
}

/* FEATURE 1 */
function swapPairs() {
  const input = numberInput.value.trim();
  if (!/^\d+$/.test(input) || input.length % 2 !== 0) {
    digitOutput.innerText = "❌ Even digits only";
    return;
  }

  let res = "";
  for (let i = 0; i < input.length; i += 2) {
    res += input[i + 1] + input[i];
  }
  digitOutput.innerText = res;
}

/* =========================
   FEATURE 1 (FILE BASED)
========================= */

function swapFromFile() {
  const fileInput = document.getElementById("swapFile");
  if (!fileInput.files.length) {
    alert("Please upload a file");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    let content = e.target.result;
    let outputLines = [];

    try {
      // If JSON file
      if (file.name.endsWith(".json")) {
        const jsonData = JSON.parse(content);

        for (let key in jsonData) {
          const val = jsonData[key].toString();

          if (val.length % 2 !== 0 || !/^\d+$/.test(val)) {
            outputLines.push(`${key}: INVALID`);
            continue;
          }

          outputLines.push(`${key}: ${swapEvenDigits(val)}`);
        }
      }
      // If TXT file
      else {
        const lines = content.split(/\r?\n/);

        lines.forEach(line => {
          const val = line.trim();
          if (!val) return;

          if (val.length % 2 !== 0 || !/^\d+$/.test(val)) {
            outputLines.push("INVALID");
          } else {
            outputLines.push(swapEvenDigits(val));
          }
        });
      }

      downloadFile(outputLines.join("\n"), "swapped_output.txt");
      digitOutput.innerText = "✅ File processed & downloaded";

    } catch (err) {
      digitOutput.innerText = "❌ File format error";
    }
  };

  reader.readAsText(file);
}

/* Helper: swap each two digits */
function swapEvenDigits(numStr) {
  let res = "";
  for (let i = 0; i < numStr.length; i += 2) {
    res += numStr[i + 1] + numStr[i];
  }
  return res;
}

/* Helper: download output */
function downloadFile(content, filename) {
  const blob = new Blob([content], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}


/* FEATURE 2 */
function specialSwap() {
  let input = numberInput.value.trim();
  if (!/^\d+$/.test(input) || (input.length !== 5 && input.length !== 6)) {
    digitOutput.innerText = "❌ Only 5 or 6 digits allowed";
    return;
  }

  if (input.length === 5) input += "F";

  const result =
    input[1] + input[0] +
    input[5] + input[2] +
    input[4] + input[3];

  digitOutput.innerText = result;
}

/* COPY OUTPUT */
function copyOutput() {
  const text = digitOutput.innerText;
  if (text === "—" || text.startsWith("❌")) return;
  navigator.clipboard.writeText(text);
  alert("Copied!");
}

/* FEATURE 3 */
function generateJSON() {
  const file = jsonFile.files[0];
  if (!file) {
    jsonStatus.innerText = "❌ Upload JSON file";
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      const circles = data.MNOs[0].Circles;

      const zip = new JSZip();
      const folder = zip.folder("CircleData");

      circles.forEach(c => {
        const obj = {};
        c.Params.forEach((p, i) => obj[p] = c.Values[i]);
        folder.file(`${c.Name}.json`, JSON.stringify(obj, null, 2));
      });

      zip.generateAsync({ type: "blob" }).then(content => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "CircleData.zip";
        a.click();
      });

      jsonStatus.innerText = "✅ JSON files created";
    } catch {
      jsonStatus.innerText = "❌ Invalid JSON";
    }
  };
  reader.readAsText(file);
}

/* ===========================
   THREE.JS SOLAR SYSTEM (VISIBLE VERSION)
=========================== */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 25);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById("three-bg").appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const sunLight = new THREE.PointLight(0xffcc00, 2, 200);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// ⭐ STARS (VERY IMPORTANT FOR VISIBILITY)
const starGeometry = new THREE.BufferGeometry();
const starCount = 2000;
const starPositions = [];

for (let i = 0; i < starCount; i++) {
  starPositions.push(
    (Math.random() - 0.5) * 600,
    (Math.random() - 0.5) * 600,
    (Math.random() - 0.5) * 600
  );
}

starGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starPositions, 3)
);

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.7
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// 🌞 SUN
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(4, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffaa00 })
);
scene.add(sun);

// 🌍 EARTH ORBIT
const earthOrbit = new THREE.Object3D();
scene.add(earthOrbit);

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1.5, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x2266ff })
);
earth.position.x = 12;
earthOrbit.add(earth);

// 🌕 MOON ORBIT
const moonOrbit = new THREE.Object3D();
earth.add(moonOrbit);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.4, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xbbbbbb })
);
moon.position.x = 3;
moonOrbit.add(moon);

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation
function animate() {
  requestAnimationFrame(animate);

  sun.rotation.y += 0.002;
  earthOrbit.rotation.y += 0.004;
  moonOrbit.rotation.y += 0.03;
  stars.rotation.y += 0.0005;

  renderer.render(scene, camera);
}

animate();

function specialSwapLogic(value) {
  // Must be digits only
  if (!/^\d+$/.test(value)) return "INVALID";

  // 5-digit case → append F
  if (value.length === 5) {
    value = value + "F"; // now length = 6
  }

  // Only 6 characters allowed after this
  if (value.length !== 6) return "INVALID";

  // Pair-wise swap: (01)(23)(45)
  return (
    value[1] + value[0] +   
    value[5] + value[2] +   
    value[4] + value[3]     
  );
}


function specialSwapFromFile() {
  const fileInput = document.getElementById("specialSwapFile");

  if (!fileInput.files.length) {
    alert("Please upload a file");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    let content = e.target.result;
    let output = [];

    try {
      // JSON file
      if (file.name.endsWith(".json")) {
        const jsonData = JSON.parse(content);

        for (let key in jsonData) {
          const val = jsonData[key].toString();
          const result = specialSwapLogic(val);
          output.push(`${key}: ${result}`);
        }
      }
      // TXT file
      else {
        const lines = content.split(/\r?\n/);
        lines.forEach(line => {
          const val = line.trim();
          if (!val) return;
          output.push(specialSwapLogic(val));
        });
      }

      downloadFile(
        output.join("\n"),
        "special_swap_output.txt"
      );

      digitOutput.innerText = "✅ Special swap file processed";

    } catch (err) {
      digitOutput.innerText = "❌ Invalid file format";
    }
  };

  reader.readAsText(file);
}

