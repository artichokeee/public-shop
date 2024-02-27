document.addEventListener("DOMContentLoaded", function () {
  const paymentForm = document.getElementById("payment-form");
  const paymentMethodInputs = document.querySelectorAll(
    'input[name="paymentMethod"]'
  );
  const cardDetailsSection = document.getElementById("card-details");
  const paypalEmailSection = document.getElementById("paypal-email");
  const shippingFeeSection = document.getElementById("shipping-fee");
  const orderItemsList = document.getElementById("order-items-list");
  const totalAmountElement = document.getElementById("total-amount");
  let totalAmount = 0;
  let orderItems = [];

  function updateOrderDisplay() {
    orderItemsList.innerHTML = "";
    orderItems.forEach((item) => {
      const orderItemElement = document.createElement("div");
      orderItemElement.innerHTML = `
          <span>${item.name} - ${item.quantity} x $${item.price}</span>
          <input type="number" value="${item.quantity}" min="1" onchange="changeQuantity(${item.id}, this.value)">
          <button onclick="removeFromOrder(${item.id})">Удалить</button>
        `;
      orderItemsList.appendChild(orderItemElement);
    });
    calculateTotalAmount();
  }

  function calculateTotalAmount() {
    totalAmount = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    totalAmountElement.textContent = totalAmount.toFixed(2);
  }

  function removeFromOrder(itemId) {
    orderItems = orderItems.filter((item) => item.id !== itemId);
    updateOrderDisplay();
  }

  function changeQuantity(itemId, quantity) {
    const item = orderItems.find((item) => item.id === itemId);
    if (item) {
      item.quantity = quantity;
      updateOrderDisplay();
    }
  }

  paymentMethodInputs.forEach((input) => {
    input.addEventListener("change", function () {
      switch (this.value) {
        case "Paypal":
          cardDetailsSection.style.display = "none";
          paypalEmailSection.style.display = "block";
          break;
        case "Visa":
        case "MasterCard":
          cardDetailsSection.style.display = "block";
          paypalEmailSection.style.display = "none";
          break;
      }
    });
  });

  paymentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const paymentMethod = document.querySelector(
      'input[name="paymentMethod"]:checked'
    ).value;
    const cardNumber = document.getElementById("card-number").value;
    const cardName = document.getElementById("card-name").value;
    const cardSurname = document.getElementById("card-surname").value;
    const cardExpiryMonth = document.getElementById("card-expiry-month").value;
    const cardExpiryYear = document.getElementById("card-expiry-year").value;
    const cardCvv = document.getElementById("card-cvv").value;
    const paypalEmail = document.getElementById("paypal-email-input").value;
    const receiptEmail = document.getElementById("receipt-email").value;
    const hasPaidShipping = shippingFeeSection.style.display === "block";

    const paymentData = {
      paymentMethod,
      cardNumber,
      cardName,
      cardSurname,
      cardExpiryMonth,
      cardExpiryYear,
      cardCvv,
      paypalEmail,
      receiptEmail,
      hasPaidShipping,
      orderItems,
      totalAmount,
    };

    // TODO: Implement the logic to process the paymentData
    console.log("Payment Data:", paymentData);
    alert("Заказ оформлен!");
  });

  // TODO: Load the initial order items from server or storage
  loadOrderItems();

  function loadOrderItems() {
    // Placeholder for loading order items logic
    orderItems = [
      // Placeholder items
      { id: 1, name: "Product 1", quantity: 2, price: 9.99 },
      { id: 2, name: "Product 2", quantity: 1, price: 19.99 },
    ];
    updateOrderDisplay();
  }
});

// Expose the removeFromOrder and changeQuantity functions to global scope
window.removeFromOrder = removeFromOrder;
window.changeQuantity = changeQuantity;

function removeFromOrder(itemId) {
  // Implementation depends on how the orderItems are stored
}

function changeQuantity(itemId, newQuantity) {
  // Implementation depends on how the orderItems are stored
}
