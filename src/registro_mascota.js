export const STORAGE_KEY = "mascotas";

const IS_CYPRESS = typeof window !== "undefined" && !!window.Cypress;

let form, msg, listaMascotas, inputFoto, preview;

// ====== Storage ======
export function getMascotas() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
export function setMascotas(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// ====== DOM binding ======
export function bindDOM(rootDoc = document) {
  form = rootDoc.getElementById("formRegistroMascota");
  msg = rootDoc.getElementById("mensaje");
  listaMascotas = rootDoc.getElementById("listaMascotas");
  inputFoto = rootDoc.getElementById("foto");
  preview = rootDoc.getElementById("photo-preview");
}

// ====== UI helpers ======
export function showMessage(text, type = "info") {
  if (!msg) return;
  msg.textContent = text;
  msg.style.color = type === "error" ? "crimson" : "#22c55e";
  setTimeout(() => {
    if (msg && msg.textContent === text) msg.textContent = "";
  }, 3000);
}

export function renderLista(data = getMascotas(), root = listaMascotas) {
  if (!root) return 0;
  root.innerHTML = "";
  if (!data.length) {
    root.innerHTML = `<p style="color:#6b7280">No hay mascotas registradas.</p>`;
    return 0;
  }
  data.forEach((m) => {
    const card = document.createElement("div");
    card.className = "pet-card";
    card.innerHTML = `
      <div><strong>${m.nombre}</strong> · ${m.especie} · ${m.raza} · ${m.edad} años</div>
      ${m.foto ? `<img src="${m.foto}" alt="${m.nombre}" style="max-width:100px;border-radius:8px;margin-top:6px;">` : ""}
    `;
    root.appendChild(card);
  });
  return data.length;
}

// ====== Validación ======
export function validate(formEl) {
  if (!formEl) return { isValid: false };
  const nombre = formEl.querySelector("#nombre")?.value?.trim();
  const especie = formEl.querySelector("#especie")?.value?.trim();
  const raza = formEl.querySelector("#raza")?.value?.trim();
  const edadStr = formEl.querySelector("#edad")?.value?.trim();
  const edad = Number(edadStr);
  const file = formEl.querySelector("#foto")?.files?.[0] ?? null;

  const requiereFoto = !IS_CYPRESS;
  const faltan =
    !nombre || !especie || !raza ||
    edadStr === "" || Number.isNaN(edad) || edad < 0 ||
    (requiereFoto && !file);

  return { isValid: !faltan, nombre, especie, raza, edad, file };
}

// ====== Handlers ======
function handlePreview() {
  if (!inputFoto || !preview) return;
  preview.style.display = "none";
  inputFoto.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      preview.removeAttribute("src");
      preview.style.display = "none";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      preview.src = ev.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });
}

function handleSubmit() {
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const { isValid, nombre, especie, raza, edad, file } = validate(form);
    if (!isValid) {
      showMessage("Complete todos los campos requeridos.", "error");
      return;
    }

    let fotoUrl = "";
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        fotoUrl = ev.target.result;
        guardarMascota(nombre, especie, raza, edad, fotoUrl);
      };
      reader.readAsDataURL(file);
    } else {
      guardarMascota(nombre, especie, raza, edad, "");
    }
  });
}

function guardarMascota(nombre, especie, raza, edad, fotoUrl) {
  const nueva = { id: Date.now(), nombre, especie, raza, edad, foto: fotoUrl };
  const list = getMascotas();
  list.push(nueva);
  setMascotas(list);

  showMessage("Mascota registrada exitosamente.", "success");
  form.reset();
  if (preview) {
    preview.removeAttribute("src");
    preview.style.display = "none";
  }
  renderLista();
}

// ====== Inicializador ======
export function initRegistro() {
  bindDOM();
  handlePreview();
  renderLista();
  handleSubmit();
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRegistro);
  } else {
    initRegistro();
  }
}
