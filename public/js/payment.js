document.addEventListener("DOMContentLoaded", function () {
  fetchBaseUrl();
  const paymentForm = document.getElementById("payment-form");
  const paymentMethodInputs = document.querySelectorAll(
    'input[name="paymentMethod"]'
  );
  const cardDetailsSection = document.getElementById("card-details");
  const paypalEmailSection = document.getElementById("paypal-email");
  const totalAmountElement = document.getElementById("total-price");
  const errorMessages = document.querySelectorAll(".error-message");

  // Получаем доступ к элементам формы и сохраняем их в переменных
  const cardNumberInput = document.getElementById("card-number");
  const expiryMonthInput = document.getElementById("card-expiry-month");
  const expiryYearInput = document.getElementById("card-expiry-year");
  const cvvInput = document.getElementById("card-cvv");
  const cardNameInput = document.getElementById("card-name");
  const cardSurnameInput = document.getElementById("card-surname");
  const paypalEmailInput = document.getElementById("paypal-email-input");
  const receiptEmailInput = document.getElementById("receipt-email");

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

    return valid;
  }

  paymentMethodInputs.forEach((input) => {
    input.addEventListener("change", function () {
      cardDetailsSection.style.display =
        this.value === "Paypal" ? "none" : "block";
      paypalEmailSection.style.display =
        this.value === "Paypal" ? "block" : "none";

      // При изменении метода оплаты скрываем или показываем соответствующие поля валидации
      if (this.value === "Paypal") {
        // Если выбран PayPal, отключаем валидацию для деталей карты
        cardNumberInput.removeAttribute("required");
        expiryMonthInput.removeAttribute("required");
        expiryYearInput.removeAttribute("required");
        cvvInput.removeAttribute("required");
        cardNameInput.removeAttribute("required");
        cardSurnameInput.removeAttribute("required");
      } else {
        // Если выбрана оплата картой, включаем валидацию для деталей карты
        cardNumberInput.setAttribute("required", true);
        expiryMonthInput.setAttribute("required", true);
        expiryYearInput.setAttribute("required", true);
        cvvInput.setAttribute("required", true);
        cardNameInput.setAttribute("required", true);
        cardSurnameInput.setAttribute("required", true);
      }
    });
  });

  const checkoutButton = document.getElementById("checkout-button");
  checkoutButton.addEventListener("click", function (event) {
    event.preventDefault(); // Предотвращаем отправку формы по умолчанию

    // Проверяем валидацию формы
    if (validatePaymentForm()) {
      try {
        const authToken = localStorage.getItem("authToken");
        const formData = new FormData(paymentForm);
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/pay");
        xhr.setRequestHeader("Authorization", `Bearer ${authToken}`);
        xhr.setRequestHeader(
          "Content-Type",
          "application/x-www-form-urlencoded"
        ); // Установка заголовка Content-Type

        // Добавляем параметры в зависимости от выбранного метода оплаты
        const selectedPaymentMethod = document.querySelector(
          'input[name="paymentMethod"]:checked'
        ).value;
        if (selectedPaymentMethod === "Paypal") {
          formData.append("card_type", "Paypal");
          formData.append("email_paypal", paypalEmailInput.value); // Добавляем параметр email_paypal для PayPal
        } else {
          if (selectedPaymentMethod === "VISA") {
            formData.append("card_type", "VISA");
          } else if (selectedPaymentMethod === "MasterCard") {
            formData.append("card_type", "MasterCard");
          }
          formData.append("card_code", cardNumberInput.value);
          formData.append("expiry_month", expiryMonthInput.value);
          formData.append("expiry_year", expiryYearInput.value);
          formData.append("cvv", cvvInput.value);
        }

        xhr.onreadystatechange = function () {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
              // Если запрос прошел успешно, перенаправляем пользователя на страницу успешной оплаты
              window.location.href = "/history";
            } else {
              // Если возникла ошибка, выводим сообщение об ошибке
              showNotification(xhr.responseText);
            }
          }
        };
        xhr.send(new URLSearchParams(formData)); // Преобразование FormData в URLSearchParams для отправки
      } catch (error) {
        console.error("Ошибка при отправке данных на сервер:", error);
        // Выводим сообщение об ошибке
        showNotification("Произошла ошибка. Попробуйте еще раз.");
      }
    }
  });

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

  updateTotalAmount();
  window.updateTotalAmount = updateTotalAmount;
});
