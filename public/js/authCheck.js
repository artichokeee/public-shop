document.addEventListener("DOMContentLoaded", function () {
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    showAuthRequiredNotification();
  }
});

function showAuthRequiredNotification() {
  const message = `Пожалуйста, <a href="/login" style="color: white; text-decoration: underline;">войдите в систему</a>, чтобы получить доступ к этой функциональности.`;
  showNotification(message, false);
}

function showNotification(message, isSuccess = true) {
  const notificationElement = document.createElement("div");
  // Установка innerHTML вместо textContent для поддержки HTML-контента
  notificationElement.innerHTML = message;
  notificationElement.style.position = "fixed";
  notificationElement.style.top = "20px";
  notificationElement.style.left = "50%";
  notificationElement.style.transform = "translateX(-50%)";
  notificationElement.style.minWidth = "300px"; // Фиксированный размер
  notificationElement.style.maxWidth = "80%"; // Максимальный размер
  notificationElement.style.height = "auto";
  notificationElement.style.backgroundColor = isSuccess
    ? "lightgreen"
    : "#ff6347";
  notificationElement.style.color = "white";
  notificationElement.style.padding = "15px";
  notificationElement.style.borderRadius = "5px";
  notificationElement.style.zIndex = "1000";
  notificationElement.style.textAlign = "center"; // Текст по центру
  notificationElement.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"; // Добавление тени
  document.body.appendChild(notificationElement);

  setTimeout(() => {
    notificationElement.remove();
  }, 3000);
}
