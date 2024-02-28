document.addEventListener("DOMContentLoaded", function () {
  const cartElement = document.getElementById("cart");
  const cartTotalElement = document.getElementById("cart-total");
  let cart = [];
  let cartElements = {}; // Объект для хранения ссылок на элементы корзины

  // Загрузка корзины при загрузке страницы
  loadCart();

  document.addEventListener("click", function (event) {
    if (event.target.matches(".add-to-cart-button")) {
      const productId = event.target.getAttribute("data-product-id");
      window.addToCart(productId);
    }
  });

  function loadCart() {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      return;
    }

    axios
      .get("http://localhost:3000/getCart", {
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
        `http://localhost:3000/cart/${cartItemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      .then(() => {
        showNotification("Количество товара в корзине обновлено");
        loadCart(); // Перезагружаем содержимое корзины
        const event = new CustomEvent("cartUpdated");
        window.dispatchEvent(event);
      })
      .catch((error) => {
        console.error(
          "Ошибка при изменении количества товара в корзине:",
          error
        );
        showNotification("Ошибка при изменении количества товара в корзине");
      });
  };

  window.addToCart = (productId) => {
    console.log("Добавление в корзину товара с ID:", productId);
    const quantityInput = document.querySelector(`#quantity-${productId}`);
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1; // Получаем количество товара из поля ввода
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      showNotification(
        "Пожалуйста, войдите в систему, чтобы добавить товар в корзину"
      );
      return;
    }

    axios
      .post(
        "http://localhost:3000/cart",
        { productId, quantity },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      .then(() => {
        showNotification("Товар добавлен в корзину");
        loadCart(); // Перезагружаем содержимое корзины
        const event = new CustomEvent("cartUpdated");
        window.dispatchEvent(event);
      })
      .catch((error) => {
        console.error("Ошибка при добавлении товара в корзину:", error);
        showNotification("Ошибка при добавлении товара в корзину");
      });
  };

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
        <button onclick="window.removeFromCart(${item.cart_item_id})">Удалить</button>
      `;

      cartElement.appendChild(cartItemElement);
      cartElements[item.cart_item_id] = cartItemElement; // Сохраняем ссылку на элемент

      // Добавляем обработчик события изменения количества
      document
        .getElementById(`quantity-${item.cart_item_id}`)
        .addEventListener("change", (e) => {
          const newQuantity = parseInt(e.target.value);
          window.updateProductQuantityInCart(item.cart_item_id, newQuantity);
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

  window.removeFromCart = (cartItemId) => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      showNotification(
        "Пожалуйста, войдите в систему, чтобы удалить товар из корзины"
      );
      return;
    }

    axios
      .delete(`http://localhost:3000/cart/${cartItemId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then(() => {
        const cartItemElement = cartElements[cartItemId];
        if (cartItemElement) {
          cartItemElement.remove(); // Удаляем элемент из DOM
          delete cartElements[cartItemId]; // Удаляем ссылку из объекта

          // Обновляем массив cart
          cart = cart.filter((item) => item.cart_item_id !== cartItemId);

          updateCartCount(); // Обновите счетчик корзины
          updateCartTotal(); // Обновите общую сумму корзины

          showNotification("Товар удалён из корзины");
        }
      })
      .catch((error) => {
        console.error("Ошибка при удалении товара из корзины:", error);
        showNotification("Ошибка при удалении товара из корзины");
      });
  };

  updateCartTotal();

  window.changeQuantity = (productId, quantity) => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      showNotification(
        "Пожалуйста, войдите в систему, чтобы изменить количество товара в корзине"
      );
      return;
    }

    axios
      .put(
        `http://localhost:3000/cart/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      .then(() => {
        const cartItem = cart.find((item) => item.product_id === productId);
        if (cartItem) {
          cartItem.quantity = parseInt(quantity);
          updateCartDisplay();
          updateCartCount();
        }
      })
      .catch((error) => {
        console.error(
          "Ошибка при изменении количества товара в корзине:",
          error
        );
        showNotification("Ошибка при изменении количества товара в корзине");
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
        "http://localhost:3000/orders",
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      )
      .then((response) => {
        console.log(response.data);
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

  // Функция для отображения всплывающего сообщения
  function showNotification(message) {
    const notificationElement = document.createElement("div");
    notificationElement.classList.add("notification");
    notificationElement.textContent = message;
    notificationElement.style.backgroundColor = "#ff6347"; // Красный цвет фона
    notificationElement.style.color = "#fff"; // Белый цвет текста
    notificationElement.style.padding = "10px"; // Поля внутри уведомления
    notificationElement.style.borderRadius = "5px"; // Скругленные углы
    notificationElement.style.position = "fixed"; // Фиксированное положение
    notificationElement.style.top = "20px"; // Отступ сверху
    notificationElement.style.left = "50%"; // Положение по центру
    notificationElement.style.transform = "translateX(-50%)"; // Центрирование по горизонтали
    notificationElement.style.zIndex = "1000"; // Значение z-index, чтобы уведомление было поверх других элементов
    notificationElement.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)"; // Тень

    document.body.appendChild(notificationElement);

    // Удаляем уведомление через 5 секунд
    setTimeout(() => {
      notificationElement.remove();
    }, 2000);
  }

  updateCartDisplay();
  updateCartCount();
});
