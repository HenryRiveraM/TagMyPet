describe("Búsqueda por edad (UI)", () => {
    
  it("filtra cachorros y combina con Beagle", () => {
      cy.visit("dashboards/buscar_mascota/buscar.html");
    cy.get("#edad").select("cachorro");
    cy.get("#buscar").click();

    cy.get(".card").should("have.length.at.least", 1);
    cy.get(".card").each(($c) => cy.wrap($c).contains(/cachorro/i));

    cy.get("#raza").select("Beagle");
    cy.get("#buscar").click();

    cy.get(".card").each(($c) => {
      cy.wrap($c).contains(/Beagle/i);
      cy.wrap($c).contains(/cachorro/i);
    });
  });

  it("muestra mensaje cuando no hay resultados", () => {
    cy.visit("dashboards/buscar_mascota/buscar.html");
    cy.get("#edad").select("senior");
    cy.get("#raza").select("Labrador");
    cy.get("#buscar").click();
    cy.get("#mensaje").should("not.have.attr", "hidden");
  });
});