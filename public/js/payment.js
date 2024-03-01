document.addEventListener("DOMContentLoaded", function () {
  const paymentForm = document.getElementById("payment-form");
  const paymentMethodInputs = document.querySelectorAll(
    'input[name="paymentMethod"]'
  );
  const cardDetailsSection = document.getElementById("card-details");
  const paypalEmailSection = document.getElementById("paypal-email");
  const totalAmountElement = document.getElementById("total-price");
  const errorMessages = document.querySelectorAll(".error-message");

  function hideErrorMessages() {
    errorMessages.forEach((element) => (element.style.display = "none"));
  }

  function clearErrorHighlighting() {
    document
      .querySelectorAll(".error")
      .forEach((element) => element.classList.remove("error"));
  }

  function validateEmail(email) {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function showError(input, message) {
    const errorElement = input.nextElementSibling;
    input.classList.add("error");
    if (errorElement && errorElement.classList.contains("error-message")) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  function validatePaymentForm() {
    let valid = true;
    const cardNumberInput = document.getElementById("card-number");
    const expiryMonthInput = document.getElementById("card-expiry-month");
    const expiryYearInput = document.getElementById("card-expiry-year");
    const cvvInput = document.getElementById("card-cvv");
    const paypalEmailInput = document.getElementById("paypal-email-input");
    const receiptEmailInput = document.getElementById("receipt-email");
    const cardNameInput = document.getElementById("card-name");
    const cardSurnameInput = document.getElementById("card-surname");
    const selectedPaymentMethod = document.querySelector(
      'input[name="paymentMethod"]:checked'
    ).value;

    clearErrorHighlighting();
    hideErrorMessages();

    if (selectedPaymentMethod !== "Paypal") {
      if (!cardNumberInput.value.match(/^\d{16}$/)) {
        showError(cardNumberInput, "Неверный номер карты.");
        valid = false;
      }

      if (
        !(
          parseInt(expiryMonthInput.value) >= 1 &&
          parseInt(expiryMonthInput.value) <= 12
        )
      ) {
        showError(
          expiryMonthInput,
          "Месяц истечения срока должен быть числом от 1 до 12."
        );
        valid = false;
      }

      if (
        !(
          parseInt(expiryYearInput.value) >= 0 &&
          parseInt(expiryYearInput.value) <= 99
        )
      ) {
        showError(
          expiryYearInput,
          "Год истечения срока должен быть числом от 0 до 99."
        );
        valid = false;
      }

      if (!cvvInput.value.match(/^\d{3}$/)) {
        showError(cvvInput, "CVV должен состоять из 3 цифр.");
        valid = false;
      }
    }

    if (
      selectedPaymentMethod === "Paypal" &&
      !validateEmail(paypalEmailInput.value)
    ) {
      showError(paypalEmailInput, "Укажите действующий email аккаунта PayPal.");
      valid = false;
    }

    if (!validateEmail(receiptEmailInput.value)) {
      showError(
        receiptEmailInput,
        "Укажите действующий email для отправки счета."
      );
      valid = false;
    }

    if (!cardNameInput.value.match(/^[A-Za-z]+$/)) {
      showError(
        cardNameInput,
        "Имя должно содержать только буквы латинского алфавита."
      );
      valid = false;
    }

    if (!cardSurnameInput.value.match(/^[A-Za-z]+$/)) {
      showError(
        cardSurnameInput,
        "Фамилия должна содержать только буквы латинского алфавита."
      );
      valid = false;
    }

    return valid;
  }

  paymentMethodInputs.forEach((input) => {
    input.addEventListener("change", function () {
      cardDetailsSection.style.display =
        this.value === "Paypal" ? "none" : "block";
      paypalEmailSection.style.display =
        this.value === "Paypal" ? "block" : "none";
      updateTotalAmount(); // Обновляем общую стоимость при изменении метода оплаты
    });
  });

  // Добавляем обработчик для кнопки "Оформить заказ"
  // Добавляем обработчик для кнопки "Оформить заказ"
  const checkoutButton = document.getElementById("checkout-button");
  checkoutButton.addEventListener("click", function (event) {
    event.preventDefault(); // Предотвращаем отправку формы по умолчанию

    // Проверяем валидацию формы
    if (validatePaymentForm()) {
      // Добавьте код для отправки заказа здесь

      // После успешной отправки заказа, можно обновить интерфейс
      // Например, перенаправить пользователя на другую страницу
      window.location.href = "/success"; // Поменяйте "/success" на URL страницы успешной отправки заказа
    } else {
    }
  });

  function showError(input, message) {
    const errorElement = input.nextElementSibling;
    input.classList.add("error");
    if (errorElement && errorElement.classList.contains("error-message")) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  // Обновление общей стоимости заказа
  async function updateTotalAmount() {
    try {
      const orders = await window.fetchUserOrders();

      if (!orders || orders.length === 0) {
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
