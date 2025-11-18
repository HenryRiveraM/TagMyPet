describe("Registro de mascota (Datos básicos)", () => {
  beforeEach(() => {
    cy.visit("dashboards/registro_mascota/registro_mascota.html");
    cy.contains("Registrar Nueva Mascota").should("be.visible");
  });

  it("muestra error si faltan campos obligatorios", () => {
    cy.get("#formRegistroMascota").within(() => {
      cy.get("#nombre").type("Lucky");
      cy.get("#edad").type("3");
      cy.get("#raza").type("Golden");
      cy.root().submit();
    });
    cy.contains("Complete todos los campos requeridos.").should("be.visible");
  });

  it("registra la mascota exitosamente y la muestra en la lista", () => {
    cy.get("#formRegistroMascota").within(() => {
      cy.get("#nombre").type("Lucky");
      cy.get("#edad").type("3");
      cy.get("#especie").select("Perro");
      cy.get("#raza").type("Golden Retriever");
      cy.root().submit();
    });

    cy.contains("Mascota registrada exitosamente.").should("be.visible");
    cy.get("#listaMascotas")
      .should("contain.text", "Lucky")
      .and("contain.text", "Perro")
      .and("contain.text", "Golden Retriever")
      .and("contain.text", "3 años");
  });
});
