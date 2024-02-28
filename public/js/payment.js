document.addEventListener("DOMContentLoaded", function () {
  const paymentForm = document.getElementById("payment-form");
  // Остальная логика оплаты...

  paymentForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    // Сбор данных формы и отправка на сервер
    const paymentData = {
      // Данные для оплаты
    };

    try {
      const response = await fetch("/complete-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error("Ошибка при оформлении заказа.");
      }

      // Обработка успешного оформления заказа
      alert("Заказ успешно оформлен!");
    } catch (error) {
      console.error("Ошибка при оформлении заказа:", error);
      alert("Ошибка при оформлении заказа.");
    }
  });

  // Загрузка информации о товарах в заказе...
});
