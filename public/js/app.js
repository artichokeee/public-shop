document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("apply-filters")
    .addEventListener("click", applyFilters);
  document
    .getElementById("reset-filters")
    .addEventListener("click", resetFilters);
  let products = [];
  let filteredProducts = [];

  updateCartCount();

  const sortOrderSelect = document.getElementById("sort-order");
  sortOrderSelect.value = "name-asc";
  sortOrderSelect.addEventListener("change", function () {
    sortAndDisplayProducts();
  });

  fetch("http://localhost:3000/products")
    .then((response) => response.json())
    .then((data) => {
      products = data.sort((a, b) => a.name.localeCompare(b.name)); // Сортировка полученных данных
      filteredProducts = [...products];
      displayProducts(filteredProducts, 1); // Отображение отсортированных продуктов
    })
    .catch((error) =>
      console.error("Ошибка при получении данных с сервера:", error)
    );

  const loginButton = document.getElementById("login-button");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  if (sortOrderSelect) {
    sortOrderSelect.addEventListener("change", function () {
      sortAndDisplayProducts();
    });
  }

  const logoutButton = document.createElement("button");
  logoutButton.textContent = "Выйти";
  logoutButton.id = "logout-button";
  logoutButton.style.display = "none";

  function addToCart(productId) {
    const quantity = parseInt(
      document.getElementById(`quantity-${productId}`).value
    );
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const product = products.find((p) => p.id === productId);
    const cartItem = cart.find((item) => item.product.id === productId);

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cart.push({ product, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    showAddedToCartMessage(product, quantity);
    updateCartCount();
  }

  window.addToCart = addToCart;

  if (document.querySelector("header nav")) {
    document.querySelector("header nav").appendChild(logoutButton);
  }

  logoutButton.addEventListener("click", function () {
    localStorage.removeItem("isLoggedIn");
    logoutButton.style.display = "none";
    loginButton.style.display = "block";
  });

  if (localStorage.getItem("isLoggedIn") === "true") {
    loginButton.style.display = "none";
    logoutButton.style.display = "block";
  }

  function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    return usernameRegex.test(username);
  }

  function isValidPassword(password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  }

  function sendAuthRequest(endpoint) {
    const username = document.getElementById(
      endpoint === "login" ? "username" : "reg-username"
    ).value;
    const password = document.getElementById(
      endpoint === "login" ? "password" : "reg-password"
    ).value;

    if (!isValidUsername(username) || !isValidPassword(password)) {
      alert("Неверные данные пользователя.");
      return;
    }

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    fetch(`http://localhost:3000/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    })
      .then((response) => response.text())
      .then((data) => {
        alert(data);
        if (data === "Вход выполнен успешно") {
          localStorage.setItem("isLoggedIn", "true");
          loginButton.style.display = "none";
          logoutButton.style.display = "block";

          // Редирект на index.html после успешного входа
          window.location.href = "/index";
        } else if (data === "Регистрация выполнена успешно") {
          // Дополнительные действия после регистрации, если необходимо
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      sendAuthRequest("login");
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      sendAuthRequest("register");
    });
  }

  const productsPerPage = 6;
  let currentPage = 1;
  const productList = document.getElementById("product-list");
  const paginationElement = document.getElementById("pagination");

  function displayProducts(productsToDisplay, page) {
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = productsToDisplay.slice(startIndex, endIndex);

    productList.innerHTML = "";
    productsToShow.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.innerHTML = `
                  <img src="${product.imageUrl}" alt="${
        product.name
      }" style="width:100px;height:100px;">
                  <h2>${product.name}</h2>
                  <p>${product.description}</p>
                  <p>Цена: ${product.price} USD</p>
                  <p>Категория: ${product.category}</p>
                  <p>Производитель: ${product.manufacturer}</p>
                  <p>Бесплатная доставка: ${
                    product.freeShipping ? "Да" : "Нет"
                  }</p>
                  <input type="number" id="quantity-${
                    product.id
                  }" min="1" value="1" style="width: 50px;">
                  <button onclick="addToCart(${
                    product.id
                  })">&#128722; Добавить в корзину</button>
              `;
      productList.appendChild(productElement);
    });

    displayPaginationButtons(productsToDisplay.length, page);
  }

  function displayPaginationButtons(totalProducts, currentPage) {
    paginationElement.innerHTML = "";
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.innerText = i;
      button.onclick = () => {
        displayProducts(filteredProducts, i);
      };
      if (i === currentPage) {
        button.classList.add("active"); // Подсветка активной страницы
      }
      paginationElement.appendChild(button);
    }
  }

  displayProducts(products, currentPage);

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalCount = cart.reduce((count, item) => count + item.quantity, 0);
    document.getElementById("cart-count").textContent = `(${totalCount})`;
  }

  function showAddedToCartMessage(product, quantity) {
    const message = document.createElement("div");
    message.innerText = `${quantity} x ${product.name} добавлен в корзину!`;
    message.style.position = "fixed";
    message.style.bottom = "20px";
    message.style.right = "20px";
    message.style.backgroundColor = "lightgreen";
    message.style.padding = "10px";
    message.style.borderRadius = "5px";
    message.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
    message.style.zIndex = "1000";
    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  function sortProducts(products, sortOrder) {
    let sortedProducts = [...products];
    switch (sortOrder) {
      case "name-asc":
        return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
      case "price-asc":
        return sortedProducts.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sortedProducts.sort((a, b) => b.price - a.price);
      default:
        return sortedProducts;
    }
  }

  function sortAndDisplayProducts() {
    filteredProducts = sortProducts(products, sortOrderSelect.value);
    displayProducts(filteredProducts, 1);
  }

  sortAndDisplayProducts();

  function applyFilters() {
    const minPrice = document.getElementById("min-price").value;
    const maxPrice = document.getElementById("max-price").value;
    const selectedCategory = document.getElementById("category").value;
    const selectedManufacturer = document.getElementById("manufacturer").value;
    const freeShipping = document.getElementById("free-shipping").checked;

    let url = new URL(`http://localhost:3000/products/filter`);

    // Правильное добавление параметров в URL
    if (selectedCategory) {
      url.searchParams.append("category", selectedCategory);
    }
    if (selectedManufacturer) {
      url.searchParams.append("manufacturer", selectedManufacturer);
    }
    if (freeShipping) {
      url.searchParams.append("freeShipping", freeShipping.toString());
    }
    if (minPrice) {
      url.searchParams.append("minPrice", minPrice);
    }
    if (maxPrice) {
      url.searchParams.append("maxPrice", maxPrice);
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        filteredProducts = data.sort((a, b) =>
          sortOrderSelect.value === "name-asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
        displayProducts(filteredProducts, 1);
      })
      .catch((error) =>
        console.error("Ошибка при фильтрации продуктов:", error)
      );
  }

  function resetFilters() {
    document.getElementById("min-price").value = "";
    document.getElementById("max-price").value = "";
    document.getElementById("category").value = "";
    document.getElementById("manufacturer").value = "";
    document.getElementById("free-shipping").checked = false;

    fetch("http://localhost:3000/products")
      .then((response) => response.json())
      .then((data) => {
        products = data.sort((a, b) => a.name.localeCompare(b.name));
        filteredProducts = [...products];
        displayProducts(filteredProducts, 1);
      })
      .catch((error) =>
        console.error("Ошибка при получении данных с сервера:", error)
      );
  }
});
