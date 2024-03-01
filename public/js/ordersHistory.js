let currentPage = 1;
const ordersPerPage = 10;

document.addEventListener("DOMContentLoaded", () => {
  fetchOrdersHistory();
  setupPaginationHandlers();
});

function setupPaginationHandlers() {
  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchOrdersHistory();
    }
  });

  document.getElementById("next-page").addEventListener("click", () => {
    // Тут будет определение общего количества страниц, основанное на данных с сервера
    fetchOrdersHistory().then((totalOrders) => {
      const totalPages = Math.ceil(totalOrders / ordersPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        fetchOrdersHistory();
      }
    });
  });
}

async function fetchOrdersHistory() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("Токен не найден, пользователь не авторизован");
    return;
  }

  try {
    const response = await axios.get(
      `/api/orders-history?page=${currentPage}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.data || response.data.length === 0) {
      console.log("История заказов пуста");
      return;
    }

    const orders = groupOrders(response.data);
    displayGroupedOrders(
      orders.slice(
        (currentPage - 1) * ordersPerPage,
        currentPage * ordersPerPage
      )
    );
    updatePagination(orders.length);

    // Возвращаем общее количество заказов для пагинации
    return orders.length;
  } catch (error) {
    console.error("Ошибка при получении истории заказов:", error);
    return 0; // В случае ошибки возвращаем 0
  }
}

function updatePagination(totalOrders) {
  const totalPages = Math.ceil(totalOrders / ordersPerPage);
  document.getElementById(
    "current-page"
  ).textContent = `Страница ${currentPage} из ${totalPages}`;
}

function groupOrders(orders) {
  const grouped = orders.reduce((acc, order) => {
    (acc[order.order_id] = acc[order.order_id] || []).push(order);
    return acc;
  }, {});
  return Object.keys(grouped).map((orderId) => {
    return {
      order_id: orderId,
      products: grouped[orderId],
      totalPrice: grouped[orderId]
        .reduce((sum, item) => sum + parseFloat(item.totalPrice), 0)
        .toFixed(2),
      payment_date: grouped[orderId][0].payment_date,
      delivery_date: grouped[orderId][0].delivery_date,
    };
  });
}

function displayGroupedOrders(orders) {
  const ordersTableBody = document.getElementById("orders-table-body");
  ordersTableBody.innerHTML = orders
    .map((order) => {
      const productsHTML = order.products
        .map(
          (product) => `
        <div>
          <img src="${
            product.productImage.startsWith("http")
              ? product.productImage
              : `../${product.productImage}`
          }" alt="${product.productName}" class="order-history-image" />
          ${product.productName} x ${product.quantity}
        </div>
      `
        )
        .join("");
      return `
        <tr>
          <td>${order.order_id}</td>
          <td>${productsHTML}</td>
          <td>${order.totalPrice}</td>
          <td>${formatDate(order.payment_date)}</td>
          <td>${formatDate(order.delivery_date)}</td>
        </tr>
      `;
    })
    .join("");
}

function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  };
  return new Date(dateString).toLocaleDateString("ru-RU", options);
}
