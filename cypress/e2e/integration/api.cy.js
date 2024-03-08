describe("API Integration Tests", () => {
  let token = "";

  it("Log in and receive a token", () => {
    cy.request("POST", "/login", {
      username: "password1",
      password: "password1",
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("token");
      token = response.body.token; // Сохраняем токен для использования в последующих тестах
    });
  });

  it("Fetch the list of all products", () => {
    cy.request("GET", "/products").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an("array");
    });
  });

  it("Add a product to the cart with a token", () => {
    // Этот тест зависит от успешного выполнения теста логина
    expect(token).to.not.be.empty; // Проверяем, что токен действительно получен

    const productId = 5;
    const quantity = 5;

    cy.request({
      method: "POST",
      url: "/cart",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        productId: productId,
        quantity: quantity,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
