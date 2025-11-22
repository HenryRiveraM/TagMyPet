// js/muestraRefugios.js

window.addEventListener('DOMContentLoaded', (event) => {
    // Función para mostrar todos los refugios guardados en LocalStorage
    const listaRefugios = document.getElementById('listaRefugios');
    
    // Obtener los refugios desde LocalStorage
    const refugios = JSON.parse(localStorage.getItem('refugios')) || [];

    // Limpiar la lista antes de agregar nuevos refugios
    listaRefugios.innerHTML = '';

    // Si no hay refugios, mostrar un mensaje
    if (refugios.length === 0) {
        listaRefugios.innerHTML = "<p>No hay refugios registrados.</p>";
    }

    // Iterar sobre los refugios y mostrar cada uno
    refugios.forEach(refugio => {
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
});
