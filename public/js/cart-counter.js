document.addEventListener("DOMContentLoaded", () => {
  const cartCountElement = document.getElementById("cart-count");

  updateCartCount(); // Инициализация при загрузке страницы

  window.addEventListener("cartUpdated", () => {
    updateCartCount(); // Обновление при событии
  });

  function updateCartCount() {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      hideCartCount(); // Скрыть счетчик корзины
      return;
    }

    axios
      .get("http://0.0.0.0:3000/getCartCount", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        const { count } = response.data;
        cartCountElement.textContent = `(${count})`; // Обновляем счетчик корзины
        showCartCount(); // Показываем счетчик корзины
      })
      .catch((error) => {
        console.error(
          "Ошибка при получении количества товаров в корзине:",
          error
        );
        hideCartCount(); // Скрыть счетчик корзины в случае ошибки
      });
  }

  function showCartCount() {
    // Показываем счетчик корзины
    cartCountElement.style.opacity = "1";
  }

  function hideCartCount() {
    // Скрываем счетчик корзины
    cartCountElement.style.opacity = "0";
  }

  window.updateCartCount = updateCartCount;
});
