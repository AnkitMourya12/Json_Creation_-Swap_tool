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
