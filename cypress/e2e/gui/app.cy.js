describe("Page GUI Tests", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.clearLocalStorage();
  });

  it("Should display the product list", () => {
    cy.get("#product-list").children().should("have.length.greaterThan", 0);
  });

  it("Should apply filters correctly and reflect in the UI", () => {
    const minPrice = "500";
    const maxPrice = "1000";
    const category = "Laptops";
    const manufacturer = "Apple";
    const freeShipping = true;

    cy.get("#min-price").type(minPrice);
    cy.get("#max-price").type(maxPrice);
    cy.get("#category").select(category);
    cy.get("#manufacturer").select(manufacturer);
    if (freeShipping) {
      cy.get("#free-shipping").check();
    }

    cy.get("#apply-filters").click();

    // Ожидаем, что список товаров обновится и будет содержать хотя бы один товар
    cy.get("#product-list").children().should("have.length.greaterThan", 0);
    cy.wait(1000);

    // Предполагаем, что имя товара содержится внутри элемента h2 каждой карточки товара
    cy.get("#product-list")
      .children()
      .each(($el) => {
        cy.wrap($el)
          .find("h2") // Используйте селектор, который точно указывает на элемент с именем товара
          .should("contain.text", manufacturer);
      });
  });

  it("Should reset filters correctly and update the product list accordingly", () => {
    // Применяем фильтры
    cy.get("#min-price").type("100");
    cy.get("#max-price").type("200");
    cy.get("#category").select("Phones");
    cy.get("#manufacturer").select("Xiaomi");
    cy.get("#free-shipping").check();

    cy.get("#reset-filters").click();

    cy.get("#min-price").should("have.value", "");
    cy.get("#max-price").should("have.value", "");
    cy.get("#category").should("have.value", "");
    cy.get("#manufacturer").should("have.value", "");
    cy.get("#free-shipping").should("not.be.checked");

    cy.get("#product-list").children().should("have.length.greaterThan", 0);
    // Проверка, что список товаров вернулся к исходному виду, может потребовать мокирования API
  });

  it("Should display correct pagination", () => {
    // Проверяем, что пагинация отображается корректно
    cy.get("#pagination").children().should("have.length.greaterThan", 1);
    // Кликаем по второй странице и проверяем, что список товаров обновляется
    cy.get("#pagination").children().eq(1).click();
    cy.get("#product-list").children().should("have.length.greaterThan", 0);
    // Возможны дополнительные проверки для убеждения в корректности пагинации
  });
  it.only("Should sort products correctly from A to Z and Z to A", () => {
    cy.get("#sort-order").select("name-asc");
    // Дополнительная проверка сортировки от A до Z
    checkSorting("asc", "h2");

    cy.wait(1000); // Замените это на более подходящее ожидание в вашем контексте

    cy.get("#sort-order").select("name-desc");
    cy.wait(1000);
    // Дополнительная проверка сортировки от Z до A
    checkSorting("desc", "h2");
  });

  // Вспомогательная функция для проверки сортировки
  function checkSorting(order, selector) {
    cy.get("#product-list > div").then(($products) => {
      const productNames = $products
        .toArray()
        .map((el) => Cypress.$(el).find(selector).text().trim());
      const sortedProductNames = productNames.slice().sort((a, b) => {
        if (order === "asc") {
          return a.localeCompare(b);
        } else {
          return b.localeCompare(a);
        }
      });

      expect(productNames).to.deep.equal(sortedProductNames);
    });
  }
});
