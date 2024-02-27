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
    cartElement.innerHTML = "";
    cartElements = {}; // Очищаем объект при обновлении корзины
    cart.forEach((item) => {
      const cartItemElement = document.createElement("div");
      cartItemElement.id = `cart-item-${item.cart_item_id}`;
      cartItemElement.innerHTML = `
                  <p>${item.name}: ${item.quantity} шт. (Цена за шт.: ${item.price} руб.)</p>
                  <button onclick="removeFromCart(${item.cart_item_id})">Удалить</button>
                  <input type="number" value="${item.quantity}" min="1" onchange="changeQuantity(${item.cart_item_id}, this.value)">
              `;
      cartElement.appendChild(cartItemElement);
      cartElements[item.cart_item_id] = cartItemElement; // Сохраняем ссылку на элемент
    });
    updateCartTotal();
    // Обновляем ссылки на элементы корзины
    Object.keys(cartElements).forEach((cartItemId) => {
      const cartItemElement = document.getElementById(
        `cart-item-${cartItemId}`
      );
      if (cartItemElement) {
        cartElements[cartItemId] = cartItemElement;
      }
    });
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
