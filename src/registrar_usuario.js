// registrar_usuario.js
(function(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(); // Node/Jest
  } else {
    root.TagMyPetRegistrar = factory(); // navegador
  }
})(typeof self !== "undefined" ? self : this, function() {

  // --- Funciones de validación puras ---
  function validarCampos(usuario) {
    return Object.values(usuario).every(v => v && v.trim() !== "");
  }

  // --- Código UI solo si existe document ---
  if (typeof document !== "undefined") {
    const form = document.getElementById("formRegistro");
    const mensaje = document.getElementById("mensaje");

    if (form && mensaje) {
      form.addEventListener("submit", function(e) {
        e.preventDefault();

        const usuario = {
          nombre: document.getElementById("nombre").value,
          correo: document.getElementById("correo").value,
          contrasena: document.getElementById("contrasena").value,
          telefono: document.getElementById("telefono").value,
          fechaNacimiento: document.getElementById("fechaNacimiento").value
        };

        if (!validarCampos(usuario)) {
          mensaje.textContent = "Por favor, completa todos los campos.";
          mensaje.style.color = "red";
          return;
        }

        // Guardar en localStorage
        localStorage.setItem("usuario", JSON.stringify(usuario));

        mensaje.textContent = "Usuario registrado correctamente.";
        mensaje.style.color = "green";
        // window.location.assign("../userAdoptante.html");

      });
    }
  }

  return { validarCampos }; // Jest puede usarlo
});