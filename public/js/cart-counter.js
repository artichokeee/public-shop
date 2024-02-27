document.addEventListener("DOMContentLoaded", () => {
  updateCartCount(); // Инициализация при загрузке страницы

  window.addEventListener("cartUpdated", () => {
    updateCartCount(); // Обновление при событии
  });

  const cartCountElement = document.getElementById("cart-count");

  function updateCartCount() {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      console.log("Пользователь не авторизован");
      cartCountElement.textContent = `(0)`;
      return;
    }

    axios
      .get("http://localhost:3000/getCartCount", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        const { count } = response.data;
        cartCountElement.textContent = `(${count})`;
      })
      .catch((error) => {
        console.error(
          "Ошибка при получении количества товаров в корзине:",
          error
        );
        cartCountElement.textContent = `(Ошибка)`;
      });
  }

  // Начальное обновление счетчика при загрузке страницы
  updateCartCount();
});
