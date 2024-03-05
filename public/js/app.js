document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("apply-filters")
    .addEventListener("click", applyFilters);
  document
    .getElementById("reset-filters")
    .addEventListener("click", resetFilters);

  let products = [];
  let filteredProducts = [];

  const sortOrderSelect = document.getElementById("sort-order");
  sortOrderSelect.value = "name-asc";

  const productsPerPage = 6;
  let currentPage = 1;
  const productList = document.getElementById("product-list");
  const paginationElement = document.getElementById("pagination");

  sortOrderSelect.addEventListener("change", function () {
    sortAndDisplayProducts();
  });

  fetch(baseUrl + "/products")
    .then((response) => response.json())
    .then((data) => {
      products = data.sort((a, b) => a.name.localeCompare(b.name));
      filteredProducts = [...products];
      displayProducts(filteredProducts, 1);
    })
    .catch((error) =>
      console.error("Ошибка при получении данных с сервера:", error)
    );

  function displayProducts(productsToDisplay, page) {
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = productsToDisplay.slice(startIndex, endIndex);

    productList.innerHTML = productsToShow
      .map(
        (product) => `
        <div>
          <img src="${product.imageUrl}" alt="${
          product.name
        }" style="width:100px;height:100px;">
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <p>Цена: ${product.price} USD</p>
          <p>Категория: ${product.category}</p>
          <p>Производитель: ${product.manufacturer}</p>
          <p>Бесплатная доставка: ${product.freeShipping ? "Да" : "Нет"}</p>
          <input type="number" id="quantity-${
            product.product_id
          }" min="1" value="1" style="width: 50px;">
          <button class="add-to-cart-button" data-product-id="${
            product.product_id
          }">Добавить в корзину</button>
        </div>
      `
      )
      .join("");

    // Привязываем обработчики событий к кнопкам после того, как они добавлены в DOM
    productsToShow.forEach((product) => {
      const button = document.querySelector(
        `button[data-product-id="${product.product_id}"]`
      );
      const quantityInput = document.getElementById(
        `quantity-${product.product_id}`
      );
      button.addEventListener("click", function () {
        let quantity = parseInt(quantityInput.value, 10);
        quantity = !isNaN(quantity) && quantity > 0 ? quantity : 1;
        addToCart(product.product_id, quantity);
      });
    });

    displayPaginationButtons(productsToDisplay.length, page);
  }

  function addToCart(productId, quantity) {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      showNotification(
        "Пожалуйста, войдите в систему, чтобы добавить товар в корзину"
      );
      return;
    }

    if (quantity <= 0) {
      showNotification("Количество должно быть больше 0");
      return;
    }

    axios
      .post(
        baseUrl + "/cart",
        { productId, quantity },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then(() => {
        showNotification("Товар добавлен в корзину");
        loadCart(); // Предполагается, что эта функция обновляет отображение корзины на странице
        const event = new CustomEvent("cartUpdated");
        window.dispatchEvent(event);
      })
      .catch((error) => {
        console.error("Ошибка при добавлении товара в корзину:", error);
        showNotification("Ошибка при добавлении товара в корзину");
      });
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
        button.classList.add("active");
      }
      paginationElement.appendChild(button);
    }
  }

  displayProducts(products, currentPage);

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
    filteredProducts = sortProducts(filteredProducts, sortOrderSelect.value);
    displayProducts(filteredProducts, 1);
  }

  sortAndDisplayProducts();

  function applyFilters() {
    const minPrice = document.getElementById("min-price").value;
    const maxPrice = document.getElementById("max-price").value;
    const selectedCategory = document.getElementById("category").value;
    const selectedManufacturer = document.getElementById("manufacturer").value;
    const freeShipping = document.getElementById("free-shipping").checked;

    let url = new URL(baseUrl + "/products/products/filter");

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
        filteredProducts = [...data];
        sortAndDisplayProducts();
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

    fetch(baseUrl + "/products")
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
