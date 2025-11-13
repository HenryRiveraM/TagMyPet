describe("Registro de usuario", () => {
  beforeEach(() => {
    cy.visit("dashboards/registar_user/registrar_usuario.html");
  });

  it("muestra mensaje de error si falta algún campo", () => {
    cy.get("#nombre").type("Lucas");
    cy.get("#correo").type("lucas@mail.com");
    // Dejamos los demás vacíos
    cy.get("#formRegistro").submit();

    cy.get("#mensaje")
      .should("be.visible")
      .and("contain", "Por favor, completa todos los campos.");
  });
});


it("registra un usuario correctamente", () => {
    cy.visit("dashboards/registar_user/registrar_usuario.html");
    cy.get("#nombre").type("Lucas");
    cy.get("#correo").type("lucas@mail.com");
    cy.get("#contrasena").type("12345");
    cy.get("#telefono").type("77777777");
    cy.get("#fechaNacimiento").type("2000-01-01");

    cy.get("#formRegistro").submit();

    cy.get("#mensaje")
      .should("be.visible")
      .and("contain", "Usuario registrado correctamente.");

  });