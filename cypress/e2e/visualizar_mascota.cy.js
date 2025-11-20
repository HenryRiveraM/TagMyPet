describe("Visualizar información básica de mascota (UI)", () => {
  const RUTA = "dashboards/visualizer_pet/mascota.html";

  beforeEach(() => {
    // Página por defecto (con todos los datos y foto)
    cy.visit(RUTA);
  });

  it("muestra nombre, raza, edad, estado y foto por defecto", () => {
    cy.get('[data-testid="pet-card"]').should("be.visible");

    cy.get('[data-testid="pet-name"]').should("not.be.empty");
    cy.get('[data-testid="pet-breed"]').should("not.be.empty");
    cy.get('[data-testid="pet-age"]').should("not.be.empty");
    cy.get('[data-testid="pet-status"]').should("not.be.empty");

    cy.get('[data-testid="pet-photo"]').should("be.visible");
  });

  it('muestra "Foto no disponible." cuando no hay foto', () => {
    // mismo archivo, pero con query de escenario
    cy.visit(RUTA + "?scenario=missingPhoto");

    cy.get('[data-testid="pet-photo"]').should("exist");
    cy.get('[data-testid="pet-photo"]').should("not.be.visible");

    cy.get('[data-testid="pet-photo-fallback"]')
      .should("be.visible")
      .and("contain", "Foto no disponible.");
  });

  it('muestra "Información no disponible." cuando falta algún dato', () => {
    cy.visit(RUTA + "?scenario=missingData");

    cy.get('[data-testid="pet-age"]').should(
      "contain",
      "Información no disponible."
    );
  });

  it("la ficha se ve correctamente en vista móvil", () => {
    cy.viewport("iphone-6");
    cy.visit(RUTA);

    cy.get('[data-testid="pet-card"]').should("be.visible");
  });
});
