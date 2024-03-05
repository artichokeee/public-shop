document.addEventListener("DOMContentLoaded", function () {
  fetchBaseUrl();
  const cartElement = document.getElementById("cart");
  const cartTotalElement = document.getElementById("cart-total");
  let cart = [];
  let cartElements = {}; // Объект для хранения ссылок на элементы корзины

  // Загрузка корзины при загрузке страницы
  loadCart();

  function loadCart() {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      return;
    }

    axios
      .get(baseUrl + "/getCart", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        cart = response.data;
        updateCartDisplay();
        updateCartCount();
      })
      .catch((error) => {
        console.error("Ошибка при загрузке корзины:", error);
      });
  }

  function updateCartDisplay() {
    cartElement.innerHTML = ""; // Очищаем содержимое элемента корзины
    cartElements = {}; // Очищаем ссылки на элементы корзины

    cart.forEach((item) => {
      const cartItemElement = document.createElement("div");
      cartItemElement.id = `cart-item-${item.cart_item_id}`;
      // Добавляем элемент с изображением товара
      cartItemElement.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.name}" style="width: 100px; height: auto;">
        <p>${item.name}: <input type="number" value="${item.quantity}" min="1" id="quantity-${item.cart_item_id}" class="quantity-input"> шт. (Цена за шт.: ${item.price} руб.)</p>
        <button onclick="removeFromCart(${item.cart_item_id})">Удалить</button>
      `;

      cartElement.appendChild(cartItemElement);
      cartElements[item.cart_item_id] = cartItemElement; // Сохраняем ссылку на элемент

      // Добавляем обработчик события изменения количества
      document
        .getElementById(`quantity-${item.cart_item_id}`)
        .addEventListener("change", (e) => {
          const input = e.target;
          let newQuantity = parseInt(input.value);
          if (newQuantity < 1 || isNaN(newQuantity)) {
            newQuantity = 1; // Корректируем значение, если оно меньше 1 или не число
            input.value = newQuantity; // Обновляем значение в поле ввода
          }
          updateProductQuantityInCart(item.cart_item_id, newQuantity);
        });
    });

    updateCartTotal();
  }

  function updateCartCount() {
    const cartCountElement = document.getElementById("cart-count");
    let totalCount = cart.reduce((count, item) => count + item.quantity, 0);
    cartCountElement.textContent = `(${totalCount})`;
  }

  function updateCartTotal() {
    let total = 0;
    cart.forEach((item) => {
      total += item.price * item.quantity;
    });
    cartTotalElement.innerText = `Общая сумма: ${total} руб.`;
  }

  window.updateProductQuantityInCart = (cartItemId, newQuantity) => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      showNotification(
        "Пожалуйста, войдите в систему, чтобы изменить количество товара в корзине"
      );
      return;
    }

    axios
      .patch(
        `${baseUrl}/cart/${cartItemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      .then(() => {
        loadCart(); // Перезагружаем содержимое корзины
        const event = new CustomEvent("cartUpdated");
        window.dispatchEvent(event);
      })
      .catch((error) => {
        console.error(
          "Ошибка при изменении количества товара в корзине:",
          error
        );
      });
  };

  window.removeFromCart = (cartItemId) => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      showNotification(
        "Пожалуйста, войдите в систему, чтобы удалить товар из корзины."
      );
      return;
    }

    axios
      .delete(`${baseUrl}/cart/${cartItemId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then(() => {
        const cartItemElement = cartElements[cartItemId];
        if (cartItemElement) {
          cartItemElement.remove(); // Удаляем элемент из DOM
          delete cartElements[cartItemId]; // Удаляем ссылку из объекта

          // Обновляем массив cart
          cart = cart.filter((item) => item.cart_item_id !== cartItemId);

          updateCartCount(); // Обновляем счетчик корзины
          updateCartTotal(); // Обновляем общую сумму корзины

          showNotification("Товар успешно удален из корзины.", false); // Показываем уведомление об успешном удалении
        }
      })
      .catch((error) => {
        console.error("Ошибка при удалении товара из корзины:", error);
        showNotification("Не удалось удалить товар из корзины."); // Показываем уведомление об ошибке
      });
  };

  function handleCheckout() {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      showNotification("Пожалуйста, войдите в систему для оформления заказа.");
      return;
    }

    axios
      .post(
        baseUrl + "/orders",
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      )
      .then((response) => {
        // Здесь можно добавить дальнейшие действия, например, переход на страницу подтверждения заказа
        window.location.href = "/payment"; // Пример перехода на страницу подтверждения
      })
      .catch((error) => {
        console.error("Ошибка при оформлении заказа: ", error);
        showNotification(
          "Ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз."
        );
      });
  }

  document
    .getElementById("checkout-button")
    .addEventListener("click", handleCheckout);

  updateCartTotal();
  updateCartCount();
});
