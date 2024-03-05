module.exports = dbConfig;

const dbConfig = {
  host: "185.251.91.112",
  port: "3306",
  user: "admin",
  password: "admin1234",
  database: "web_shop",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};
