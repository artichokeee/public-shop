const dbConfig = {
  host: "url сервера бд",
  port: "3306",
  user: "имя пользователя",
  password: "пароль",
  database: "название бд",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

module.exports = dbConfig;
