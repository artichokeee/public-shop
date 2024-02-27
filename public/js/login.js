document.addEventListener("DOMContentLoaded", () => {
  // Элементы формы и кнопки
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const loginButton = document.getElementById("login-button");
  const logoutButton = document.getElementById("logout-button");

  // Функция для отображения сообщений об ошибках
  function displayErrorMessages(messages) {
    showNotification(messages.join("\n"), false);
  }

  // Валидация имени пользователя
  function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    return usernameRegex.test(username);
  }

  // Валидация пароля
  function isValidPassword(password) {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  }

  // Функция отправки запроса на сервер
  const sendAuthRequest = (url, username, password) => {
    if (!isValidUsername(username) || !isValidPassword(password)) {
      const errorMessages = [];
      if (!isValidUsername(username)) {
        errorMessages.push(
          "Логин должен содержать от 3 до 15 символов и может включать буквы, цифры и символы: _"
        );
      }
      if (!isValidPassword(password)) {
        errorMessages.push(
          "Пароль должен содержать не менее 8 символов, включая минимум одну букву и одну цифру"
        );
      }
      displayErrorMessages(errorMessages);
      return;
    }

    axios
      .post(url, { username, password })
      .then((response) => {
        showNotification(response.data.message, true);
        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);
          localStorage.setItem("isLoggedIn", "true");
          window.location.href = "/"; // Обновление страницы
        }
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        showNotification("Произошла ошибка при обработке запроса", false);
      });
  };

  // Обработка формы входа
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("login-username").value;
      const password = document.getElementById("login-password").value;
      sendAuthRequest("http://localhost:3000/login", username, password);
    });
  }

  // Обработка формы регистрации
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("register-username").value;
      const password = document.getElementById("register-password").value;
      sendAuthRequest("http://localhost:3000/register", username, password);
    });
  }

  // Обработка события нажатия кнопки "Выйти"
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("authToken"); // Удаление токена
      window.location.reload(); // Обновление страницы
    });
  }

  // Обновление состояния кнопок входа/выхода
  const updateAuthButtons = () => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      loginButton.style.display = "none";
      logoutButton.style.display = "block";
    } else {
      loginButton.style.display = "block";
      logoutButton.style.display = "none";
    }
  };

  updateAuthButtons();

  function showNotification(message, isSuccess = true) {
    const notificationElement = document.createElement("div");
    notificationElement.textContent = message;
    notificationElement.style.position = "fixed";
    notificationElement.style.top = "20px";
    notificationElement.style.left = "50%";
    notificationElement.style.transform = "translateX(-50%)";
    notificationElement.style.minWidth = "300px"; // Фиксированный размер
    notificationElement.style.maxWidth = "80%"; // Максимальный размер, чтобы уведомление не было слишком широким на маленьких экранах
    notificationElement.style.height = "auto";
    notificationElement.style.backgroundColor = isSuccess
      ? "lightgreen"
      : "#ff6347";
    notificationElement.style.color = "white";
    notificationElement.style.padding = "15px";
    notificationElement.style.borderRadius = "5px";
    notificationElement.style.zIndex = "1000";
    notificationElement.style.textAlign = "center"; // Текст по центру
    notificationElement.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"; // Добавление тени для лучшей видимости
    document.body.appendChild(notificationElement);

    setTimeout(() => {
      notificationElement.remove();
    }, 3000);
  }
});
