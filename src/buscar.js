// UMD: exporta para Node (tests) y expone en window para el navegador
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.TagMyPetBuscar = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {

  function categoriaEdad(edad) {
    if (edad < 1) return "cachorro";
    if (edad >= 8) return "senior";
    return "adulto";
  }

  function filtrarMascotas(lista, edadCat = "", raza = "") {
    const e = (edadCat || "").trim().toLowerCase();
    const r = (raza || "").trim().toLowerCase();

    return (lista || []).filter(m => {
      const cat = categoriaEdad(Number(m.edadAnios));
      const passEdad = !e || cat === e;
      const passRaza = !r || (m.raza || "").toLowerCase() === r;
      return passEdad && passRaza;
    });
  }

  // --- Código UI simple si estamos en navegador y existen los elementos ---
  if (typeof document !== "undefined") {
    const $edad = document.getElementById("edad");
    const $raza = document.getElementById("raza");
    const $btn  = document.getElementById("buscar");
    const $res  = document.getElementById("resultados");
    const $msg  = document.getElementById("mensaje");

    if ($btn && $res && $edad && $raza && $msg) {
      // Mock muy simple (pon tus imágenes en /assets si quieres verlas)
      const mascotasUI = [
        { nombre: "Lucky",  raza: "Beagle",   edadAnios: 0.5, foto: "../assets/luckyDog.jpeg" },
        { nombre: "Canela", raza: "Mestizo",  edadAnios: 5,   foto: "../assets/luckyDog.jpeg" },
        { nombre: "Rex",    raza: "Labrador", edadAnios: 2,   foto: "../assets/luckyDog.jpeg" },
        { nombre: "Bimba",  raza: "Beagle",   edadAnios: 9,   foto: "../assets/luckyDog.jpeg" }
      ];

      function render(lista) {
        $res.innerHTML = "";
        if (!lista.length) { $msg.hidden = false; return; }
        $msg.hidden = true;
        for (const m of lista) {
          const cat = categoriaEdad(m.edadAnios);
          $res.innerHTML += `
            <div class="card">
              <img src="${m.foto}" alt="${m.nombre}">
              <h3>${m.nombre}</h3>
              <p>${m.raza} • ${cat}</p>
            </div>`;
        }
      }

      $btn.addEventListener("click", () => {
        const out = filtrarMascotas(mascotasUI, $edad.value, $raza.value);
        render(out);
      });

      // Estado inicial
      render(mascotasUI);
    }
  }

  return { categoriaEdad, filtrarMascotas };
});