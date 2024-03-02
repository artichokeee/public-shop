document.addEventListener("DOMContentLoaded", function () {
  const authToken = localStorage.getItem("authToken");

  // Перехватываем клик по всем ссылкам, которые требуют авторизации
  document.querySelectorAll(".auth-dependent").forEach((link) => {
    link.addEventListener("click", function (event) {
      // Проверяем, авторизован ли пользователь
      if (!authToken) {
        event.preventDefault(); // Предотвращаем переход по ссылке
        // Показываем сообщение о необходимости авторизации
        const message = `Пожалуйста, <a href="/login" style="color: white; text-decoration: underline;">войдите в систему</a>, чтобы получить доступ к этой функциональности.`;
        showNotification(message, false);
      }
    });
  });
});
