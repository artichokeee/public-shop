document.addEventListener("DOMContentLoaded", function () {
  const paymentForm = document.getElementById("payment-form");
  const paymentMethodInputs = document.querySelectorAll(
    'input[name="paymentMethod"]'
  );
  const cardDetailsSection = document.getElementById("card-details");
  const paypalEmailSection = document.getElementById("paypal-email");
  const totalAmountElement = document.getElementById("total-price");
  const checkoutButton = document.getElementById("checkout-button");

  // Обновление отображения методов оплаты
  paymentMethodInputs.forEach((input) => {
    input.addEventListener("change", function () {
      cardDetailsSection.style.display =
        this.value === "Paypal" ? "none" : "block";
      paypalEmailSection.style.display =
        this.value === "Paypal" ? "block" : "none";
    });
  });

  // Обновление общей стоимости заказа
  async function updateTotalAmount() {
    try {
      const orders = await window.fetchUserOrders();
      console.log(orders); // For debugging: check the received data

      if (!orders || orders.length === 0) {
        console.log("Нет заказов для расчета суммы.");
        totalAmountElement.textContent = "0 USD";
        return;
      }

      let totalAmount = 0;
      let hasPaidShipping = false; // Flag for paid shipping presence

      orders.forEach((order) => {
        // Check each product in each order
        order.items.forEach((item) => {
          totalAmount += item.quantity * item.price; // Sum up the cost of products
          if (!item.freeShipping) {
            // If the product does not have free shipping
            hasPaidShipping = true; // Set the flag for paid shipping
          }
        });
      });

      // If there is at least one product with paid shipping across all orders, add shipping cost
      if (hasPaidShipping) {
        totalAmount += 5;
      }

      // Display the total amount with consideration for shipping
      totalAmountElement.textContent =
        `${totalAmount.toFixed(2)} USD` +
        (hasPaidShipping ? "  с учетом доставки" : "");
    } catch (error) {
      console.error("Ошибка при обновлении общей стоимости:", error);
      totalAmountElement.textContent = "Ошибка при расчете";
    }
  }

  // Инициализация
  updateTotalAmount(); // Обновляем общую стоимость при загрузке страницы
  window.updateTotalAmount = updateTotalAmount;
});
