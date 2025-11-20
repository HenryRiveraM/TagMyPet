// src/mascota.js

// Datos por defecto de la mascota
const DEFAULT_PET = {
  name: "Firulais",
  breed: "Mestizo",
  age: 3,
  status: "En adopción",
  photoUrl: "https://via.placeholder.com/400x250?text=Firulais",
};

// Lee el escenario desde la URL: ?scenario=missingPhoto / ?scenario=missingData
function getScenarioFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("scenario") || "default";
}

// Si falta un valor, devuelve el mensaje de información no disponible
function safeField(value) {
  if (value === null || value === undefined || value === "") {
    return "Información no disponible.";
  }
  return String(value);
}

// Construye el objeto mascota según el escenario
function buildPetData(scenario) {
  const pet = { ...DEFAULT_PET };

  if (scenario === "missingPhoto") {
    pet.photoUrl = null; // sin foto
  }

  if (scenario === "missingData") {
    pet.age = null; // simulamos que falta la edad
  }

  return pet;
}

// Pinta la información en el DOM
function renderPetProfile(pet) {
  const nameEl = document.querySelector("#pet-name");
  const breedEl = document.querySelector("#pet-breed");
  const ageEl = document.querySelector("#pet-age");
  const statusEl = document.querySelector("#pet-status");
  const photoImg = document.querySelector("#pet-photo");
  const photoFallback = document.querySelector("#pet-photo-fallback");

  if (nameEl) nameEl.textContent = safeField(pet.name);
  if (breedEl) breedEl.textContent = safeField(pet.breed);
  if (ageEl) ageEl.textContent = safeField(pet.age);
  if (statusEl) statusEl.textContent = safeField(pet.status);

  // Manejo de foto / foto no disponible
  if (photoImg && photoFallback) {
    if (pet.photoUrl) {
      photoImg.src = pet.photoUrl;
      photoImg.classList.remove("hidden");

      photoFallback.classList.add("hidden");
    } else {
      photoImg.removeAttribute("src");
      photoImg.classList.add("hidden");

      photoFallback.textContent = "Foto no disponible.";
      photoFallback.classList.remove("hidden");
    }
  }
}

// Inicialización cuando la página carga
document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector('[data-testid="pet-card"]');
  if (!card) return;

  const scenario = getScenarioFromUrl();
  const pet = buildPetData(scenario);
  renderPetProfile(pet);
});
