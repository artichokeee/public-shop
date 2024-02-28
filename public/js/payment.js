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
      const orders = await window.fetchUserOrders(); // Предполагается, что fetchUserOrders теперь возвращает данные
      if (!orders || orders.length === 0) {
        console.log("Нет заказов для расчета суммы.");
        totalAmountElement.textContent = "0 USD";
        return;
      }
      let totalAmount = orders.reduce((total, order) => {
        const orderTotal = order.items.reduce(
          (sum, item) => sum + item.quantity * item.price,
          0
        );
        return total + orderTotal;
      }, 0);
      totalAmountElement.textContent = `${totalAmount.toFixed(2)} USD`;
    } catch (error) {
      console.error("Ошибка при обновлении общей стоимости:", error);
      totalAmountElement.textContent = "Ошибка при расчете";
    }
  }

  // Обработка оформления заказа
  paymentForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    // Подготовка данных для отправки
    const paymentData = {
      // Сбор данных из формы
    };

    try {
      // Отправка данных на сервер
      console.log("Оформление заказа с данными:", paymentData);
      // Предположим, здесь код для отправки данных на сервер

      // После успешной отправки
      alert("Заказ успешно оформлен!");
      updateTotalAmount(); // Обновляем общую стоимость заказов
    } catch (error) {
      console.error("Ошибка при оформлении заказа:", error);
      alert("Ошибка при оформлении заказа.");
    }
  });

  // Инициализация
  updateTotalAmount(); // Обновляем общую стоимость при загрузке страницы
  window.updateTotalAmount = updateTotalAmount;
});
