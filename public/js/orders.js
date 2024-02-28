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
      showNotification("Продукт удален из заказа и пермещен в корзину.");
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
        orderContent += `<li>${item.name} - ${item.quantity} x ${item.price} USD <button onclick="deleteProductFromOrder(${order.order_id}, ${item.product_id})">Удалить</button> <button onclick="changeProductQuantityInOrder(${order.order_id}, ${item.product_id}, prompt('Новое количество:', ${item.quantity}))">Изменить количество</button></li>`;
      });
      orderContent += "</ul>";
      orderElement.innerHTML = orderContent;
      ordersContainer.appendChild(orderElement);
    });
  }

  // Инициализация: запрос информации о заказах при загрузке страницы
  fetchUserOrders();

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

  // Доступ к функциям из глобальной области видимости
  window.fetchUserOrders = fetchUserOrders;
  window.deleteProductFromOrder = deleteProductFromOrder;
  window.changeProductQuantityInOrder = changeProductQuantityInOrder;
});
