document.addEventListener("DOMContentLoaded", function () {
  const cartElement = document.getElementById("cart");
  const cartTotalElement = document.getElementById("cart-total");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function updateCartDisplay() {
    cartElement.innerHTML = "";
    cart.forEach((item) => {
      const cartItemElement = document.createElement("div");
      cartItemElement.id = `cart-item-${item.product.id}`;
      cartItemElement.innerHTML = `
                  <p>${item.product.name}: ${item.quantity} шт. (Цена за шт.: ${item.product.price} руб.)</p>
                  <button onclick="removeFromCart(${item.product.id})">Удалить</button>
                  <input type="number" value="${item.quantity}" min="1" onchange="changeQuantity(${item.product.id}, this.value)">
              `;
      cartElement.appendChild(cartItemElement);
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
      total += item.product.price * item.quantity;
    });
    cartTotalElement.innerText = `Общая сумма: ${total} руб.`;
  }

  window.removeFromCart = (productId) => {
    const product = cart.find((item) => item.product.id === productId)?.product;
    const cartItemElement = document.querySelector(`#cart-item-${productId}`);
    if (cartItemElement) {
      cartItemElement.style.opacity = "0";
      setTimeout(() => {
        cart = cart.filter((item) => item.product.id !== productId);
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay(); // Обновите отображение после удаления элемента
        updateCartCount(); // Обновите счетчик корзины
        if (product) {
          showRemovedFromCartMessage(product);
        }
      }, 300); // Задержка должна совпадать с длительностью CSS-транзиции
    }
  };

  window.changeQuantity = (productId, quantity) => {
    const cartItem = cart.find((item) => item.product.id === productId);
    if (cartItem) {
      cartItem.quantity = parseInt(quantity);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
    updateCartCount();
  };

  function showRemovedFromCartMessage(product) {
    const message = document.createElement("div");
    message.innerText = `${product.name} удален из корзины.`;
    message.style.position = "fixed";
    message.style.bottom = "20px";
    message.style.right = "20px";
    message.style.backgroundColor = "red";
    message.style.color = "white";
    message.style.padding = "10px";
    message.style.borderRadius = "5px";
    message.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
    message.style.zIndex = "1000";
    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
    }, 3000);
  }
  updateCartDisplay();
  updateCartCount();
});
