document.addEventListener("DOMContentLoaded", () => {
  // Элементы формы и кнопки
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const loginButton = document.getElementById("login-button");
  const logoutButton = document.getElementById("logout-button");

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
      alert("Неверные данные пользователя.");
      return;
    }

    axios
      .post(url, { username, password })
      .then((response) => {
        alert(response.data);
        if (
          response.data === "Вход выполнен успешно" ||
          response.data === "Регистрация выполнена успешно"
        ) {
          localStorage.setItem("isLoggedIn", "true");
          window.location.reload(); // Обновление страницы
        }
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        alert("Произошла ошибка при обработке запроса");
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
});
