document.addEventListener("DOMContentLoaded", fetchOrdersHistory);

async function fetchOrdersHistory() {
  try {
    // Предполагается, что у вас есть API-эндпоинт для получения истории заказов
    const response = await axios.get("/api/orders-history");
    const orders = response.data;
    const ordersTableBody = document.getElementById("orders-table-body");
    ordersTableBody.innerHTML = orders
      .map(
        (order) => `
      <tr>
        <td>${order.orderId}</td>
        <td><img src="${order.productImage}" alt="${order.productName}" /></td>
        <td>${order.productName}</td>
        <td>${order.quantity}</td>
        <td>${order.totalPrice}</td>
        <td>${formatDate(order.orderDate)}</td>
        <td>${formatDate(order.deliveryDate)}</td>
      </tr>
    `
      )
      .join("");
  } catch (error) {
    console.error("Ошибка при получении истории заказов:", error);
    // Обработка ошибок, например, показ сообщения пользователю
  }
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
}
