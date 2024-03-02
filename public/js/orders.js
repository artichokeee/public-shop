document.addEventListener("DOMContentLoaded", function () {
  async function fetchUserOrders() {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        console.error("Токен авторизации не найден.");
        displayNoOrdersMessage();
        return [];
      }

      const response = await fetch("/user-orders", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 404) {
        displayNoOrdersMessage();
        return []; // Возвращаем пустой массив, чтобы вызывающий код мог корректно обработать этот случай
      }

      if (!response.ok) {
        throw new Error("Ошибка при получении информации о заказах.");
      }

      const orders = await response.json();
      if (orders.length === 0) {
        displayNoOrdersMessage();
      } else {
        displayOrders(orders); // Отображаем заказы, если они есть
      }
      return orders; // Возвращаем заказы для дальнейшей обработки
    } catch (error) {
      console.error("Ошибка при получении информации о заказах:", error);
      displayNoOrdersMessage();
      return []; // В случае ошибки также возвращаем пустой массив
    }
  }

  // Инициализация: запрос информации о заказах при загрузке страницы
  fetchUserOrders();

  function displayNoOrdersMessage() {
    const ordersContainer = document.getElementById("order-items-list");
    ordersContainer.innerHTML = "<p>Заказы не найдены.</p>";
  }

  async function deleteProductFromOrder(orderId, productId) {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`/orders/${orderId}/products/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Ошибка при удалении продукта из заказа.");
      }
      showNotification("Продукт удален из заказа и перемещен в корзину.");
      fetchUserOrders(); // Повторный запрос информации о заказах после удаления продукта
      updateTotalAmount();
      updateCartCount();
    } catch (error) {
      console.error("Ошибка:", error);
    }
  }

  async function changeProductQuantityInOrder(orderId, productId, quantity) {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`/orders/${orderId}/products/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ quantity }),
      });
      if (!response.ok) {
        throw new Error("Ошибка при изменении количества продукта в заказе.");
      }
      showNotification("Количество продукта обновлено в заказе.");
      fetchUserOrders(); // Повторный запрос информации о заказах после изменения количества продукта
      updateTotalAmount();
    } catch (error) {
      console.error("Ошибка:", error);
    }
  }

  function displayOrders(orders) {
    const ordersContainer = document.getElementById("order-items-list");
    ordersContainer.innerHTML = ""; // Очищаем контейнер заказов

    orders.forEach((order) => {
      const orderElement = document.createElement("div");
      orderElement.className = "order";
      let orderContent = `<h3>Заказ #${order.order_id}, Общая стоимость: ${order.total} USD</h3><ul>`;

      order.items.forEach((item) => {
        orderContent += `
                <li style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${item.imageUrl}" alt="${item.name}" style="width: 50px; height: auto;">
                        <span style="flex: 1;">${item.name} - ${item.quantity} x ${item.price} USD</span>
                    </div>
                    <div style="display: flex; align-items: center; width: 70%;">
                        <input class="quantity-input" type="number" value="${item.quantity}" onchange="changeProductQuantityInOrder(${order.order_id}, ${item.product_id}, this.value)" style="width: 10%; text-align: center;">
                        <button class="delete-button" onclick="deleteProductFromOrder(${order.order_id}, ${item.product_id})" style="width: 150%; margin-left: 10px; padding: 5px 10px; background-color: #f44336; color: white; border-radius: 4px; cursor: pointer;">Удалить</button>
                    </div>
                </li>`;
      });

      orderContent += "</ul>";
      orderElement.innerHTML = orderContent;
      ordersContainer.appendChild(orderElement);
    });
  }

  // Доступ к функциям из глобальной области видимости
  window.fetchUserOrders = fetchUserOrders;
  window.deleteProductFromOrder = deleteProductFromOrder;
  window.changeProductQuantityInOrder = changeProductQuantityInOrder;
});
