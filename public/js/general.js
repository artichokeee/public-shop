function showNotification(message, isSuccess = true) {
  const notificationElement = document.createElement("div");
  notificationElement.innerHTML = message;
  notificationElement.style.position = "fixed";
  notificationElement.style.bottom = "20px"; // Изменено с top на bottom
  notificationElement.style.left = "50%";
  notificationElement.style.transform = "translateX(-50%)";
  notificationElement.style.minWidth = "300px";
  notificationElement.style.maxWidth = "80%";
  notificationElement.style.padding = "15px";
  notificationElement.style.backgroundColor = isSuccess
    ? "lightgreen"
    : "#ff6347";
  notificationElement.style.color = "white";
  notificationElement.style.borderRadius = "5px";
  notificationElement.style.zIndex = "1000";
  notificationElement.style.textAlign = "center";
  notificationElement.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
  notificationElement.style.animation = "fadeIn 0.5s, fadeOut 0.5s 2.5s"; // Добавление анимации

  document.body.appendChild(notificationElement);

  // Анимация появления и исчезновения
  notificationElement.style.opacity = "0";
  setTimeout(() => {
    notificationElement.style.opacity = "1";
  }, 10);
  setTimeout(() => {
    notificationElement.style.opacity = "0";
  }, 2500);

  setTimeout(() => {
    notificationElement.remove();
  }, 3000);
}

window.showNotification = showNotification;
