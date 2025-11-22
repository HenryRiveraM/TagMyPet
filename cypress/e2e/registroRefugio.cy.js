describe("Prueba de Registro de Refugio", () => {
  
  beforeEach(() => {
    // Visitamos la página del formulario antes de cada prueba
    cy.visit("dashboards/registro_de_refugio/registro_refugio.html");
  });

  it("Debería registrar un refugio correctamente", () => {
    // Rellenamos los campos del formulario
    cy.get('#nombre').type('Refugio Esperanza');
    cy.get('#ubicacion').type('Cochabamba, Bolivia');
    cy.get('#numAnimales').type('25');
    cy.get('#descripcion').type('Refugio para animales rescatados.');
    cy.get('#contacto').type('123456789');

    // Hacemos clic en el botón de registrar
    cy.get('button[type="submit"]').click();

    // Verificamos que el mensaje de éxito aparezca
    cy.get('#mensajeExito').should('be.visible').and('contain', '¡Refugio registrado con éxito!');

  });

  it("Debería mostrar un mensaje de error si falta algún campo", () => {
    // Dejamos algunos campos vacíos y enviamos el formulario
    cy.get('#nombre').type('Refugio Esperanza');
    cy.get('#ubicacion').type('xd');  // Campo vacío
    cy.get('#numAnimales').type('12');  // Campo vacío
    cy.get('#descripcion').type('Refugio para animales rescatados.');
    cy.get('#contacto').type('123456789');

    // Hacemos clic en el botón de registrar
    cy.get('button[type="submit"]').click();

    // Verificamos que se muestre una alerta de error
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Todos los campos son obligatorios');
    });
  });

  it("Debería verificar que los campos del formulario están vacíos inicialmente", () => {
    // Verificamos que los campos estén vacíos al cargar el formulario
    cy.get('#nombre').should('have.value', '');
    cy.get('#ubicacion').should('have.value', '');
    cy.get('#numAnimales').should('have.value', '');
    cy.get('#descripcion').should('have.value', '');
    cy.get('#contacto').should('have.value', '');
  });

  it("Debería mostrar un mensaje cuando no se ingresen datos", () => {
    // Dejamos todos los campos vacíos y tratamos de enviar el formulario
    cy.get('button[type="submit"]').click({ force: true });

    // Verificamos que el mensaje de error tenga display: block
    cy.get('#mensajeError', { timeout: 10000 })
      .should('be.visible') 
      .and('contain', 'Todos los campos son obligatorios');  // Verifica el contenido
});
});
