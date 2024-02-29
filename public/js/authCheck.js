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
