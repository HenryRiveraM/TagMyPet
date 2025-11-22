
document.getElementById('formRegistro').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar que el formulario se envíe de forma predeterminada

    // Capturamos los valores de los campos
    const nombre = document.getElementById('nombre').value;
    const ubicacion = document.getElementById('ubicacion').value;
    const numAnimales = document.getElementById('numAnimales').value;
    const descripcion = document.getElementById('descripcion').value;
    const contacto = document.getElementById('contacto').value;

    // Validar si los campos están vacíos
    if (!nombre || !ubicacion || !numAnimales || !descripcion || !contacto) {
        const mensajeError = document.getElementById('mensajeError');
        mensajeError.style.display = 'block';  // Mostrar mensaje de error
        mensajeError.innerHTML = 'Todos los campos son obligatorios';
        return;
    }

    // Crear un objeto con los datos del refugio
    const refugio = {
        nombre,
        ubicacion,
        numAnimales,
        descripcion,
        contacto
    };

    // Obtener los refugios existentes de LocalStorage
    let refugios = JSON.parse(localStorage.getItem('refugios')) || [];

    // Agregar el nuevo refugio al array de refugios
    refugios.push(refugio);

    // Guardar el array actualizado de refugios en LocalStorage
    localStorage.setItem('refugios', JSON.stringify(refugios));

    // Mostrar mensaje de éxito
    const mensajeExito = document.getElementById('mensajeExito');
    mensajeExito.style.display = 'block';  // Hacer visible el mensaje
    mensajeExito.innerHTML = '¡Refugio registrado con éxito!';

    // Limpiar el formulario
    document.getElementById('formRegistro').reset();

    // Actualizar la lista de refugios mostrados en la página
    mostrarRefugios();
});

// Mostrar todos los refugios guardados
function mostrarRefugios() {
    const refugios = JSON.parse(localStorage.getItem('refugios')) || [];
    const listaRefugios = document.getElementById('listaRefugios');

    if (!listaRefugios) {
        console.error("El contenedor 'listaRefugios' no existe.");
        return; // No intentamos modificarlo si no existe
    }
    // Limpiar la lista antes de agregar los nuevos elementos
    listaRefugios.innerHTML = '';

    // Iterar sobre el array de refugios y agregar cada uno al HTML
    refugios.forEach((refugio, index) => {
        const refugioElemento = document.createElement('div');
        refugioElemento.classList.add('refugio');

        refugioElemento.innerHTML = `
            <h3>${refugio.nombre}</h3>
            <p><strong>Ubicación:</strong> ${refugio.ubicacion}</p>
            <p><strong>Número de animales disponibles:</strong> ${refugio.numAnimales}</p>
            <p><strong>Descripción:</strong> ${refugio.descripcion}</p>
            <p><strong>Contacto:</strong> ${refugio.contacto}</p>
        `;

        listaRefugios.appendChild(refugioElemento);
    });
}

// Llamar a la función para mostrar los refugios cuando la página se carga
window.addEventListener('DOMContentLoaded', mostrarRefugios);
