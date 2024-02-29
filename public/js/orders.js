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
    ordersContainer.innerHTML = ""; // Очищаем контейнер заказов перед отображением новых данных

    orders.forEach((order) => {
      const orderElement = document.createElement("div");
      orderElement.className = "order";
      let orderContent = `<h3>Заказ #${order.order_id}, Общая стоимость: ${order.total} USD</h3><ul>`;

      order.items.forEach((item) => {
        // Проверяем статус бесплатной доставки для каждого товара
        const shippingStatus = item.freeShipping ? "" : " (Платная доставка)";
        orderContent += `
                <li>
                    <img src="${item.imageUrl}" alt="${item.name}" style="width: 50px; height: auto;">
                    ${item.name} - ${item.quantity} x ${item.price} USD${shippingStatus}
                    <button onclick="deleteProductFromOrder(${order.order_id}, ${item.product_id})">Удалить</button>
                    <button onclick="changeProductQuantityInOrder(${order.order_id}, ${item.product_id}, prompt('Новое количество:', ${item.quantity}))">Изменить количество</button>
                </li>`;
      });

      orderContent += "</ul>";
      orderElement.innerHTML = orderContent;
      ordersContainer.appendChild(orderElement);
    });
  }

  // Инициализация: запрос информации о заказах при загрузке страницы
  fetchUserOrders();

  // Доступ к функциям из глобальной области видимости
  window.fetchUserOrders = fetchUserOrders;
  window.deleteProductFromOrder = deleteProductFromOrder;
  window.changeProductQuantityInOrder = changeProductQuantityInOrder;
});
