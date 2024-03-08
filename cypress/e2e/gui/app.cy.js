describe("Page GUI Tests", () => {
  beforeEach(() => {
    cy.visit("http://127.0.0.1:3000");
  });

  it("Should display the product list", () => {
    cy.get("#product-list").should("exist");
    cy.get(".product").should("have.length.above", 0);
  });

  it("Should apply filters correctly", () => {
    // Проверяем наличие элементов фильтрации
    cy.get("#min-price").should("exist");
    cy.get("#max-price").should("exist");
    cy.get("#category").should("exist");
    cy.get("#manufacturer").should("exist");
    cy.get("#free-shipping").should("exist");

    // Применяем фильтры
    cy.get("#min-price").type("500");
    cy.get("#max-price").type("1000");
    cy.get("#category").select("Laptops");
    cy.get("#manufacturer").select("Samsung");
    cy.get("#free-shipping").check();

    // Нажимаем кнопку применения фильтров
    cy.get("#apply-filters").click();

    // Проверяем, что список продуктов изменился после применения фильтров
    cy.get(".product").should("have.length.above", 0);
  });

  it("Should reset filters correctly", () => {
    // Применяем некоторые фильтры
    cy.get("#min-price").type("10");
    cy.get("#max-price").type("50");
    cy.get("#category").select("Laptops");
    cy.get("#manufacturer").select("Samsung");
    cy.get("#free-shipping").check();

    // Нажимаем кнопку сброса фильтров
    cy.get("#reset-filters").click();

    // Проверяем, что значения фильтров сброшены
    cy.get("#min-price").should("have.value", "");
    cy.get("#max-price").should("have.value", "");
    cy.get("#category").should("have.value", "");
    cy.get("#manufacturer").should("have.value", "");
    cy.get("#free-shipping").should("not.be.checked");
  });
});
