const mysql = require("mysql2/promise");
const fs = require("fs");

async function insertProducts() {
  // Замените следующие значения на реальные параметры подключения к вашей MySQL базе данных
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    port: "3306",
    user: "root",
    password: "root1234@",
    database: "web_shop",
  });

  await connection.execute("TRUNCATE TABLE products");

  let rawdata = fs.readFileSync("data/products.json");
  let products = JSON.parse(rawdata);

  for (const product of products) {
    const {
      name,
      description,
      price,
      category,
      manufacturer,
      freeShipping,
      imageUrl,
    } = product;
    const sql = `INSERT INTO products (name, description, price, category, manufacturer, freeShipping, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      name,
      description,
      price,
      category,
      manufacturer,
      freeShipping,
      imageUrl,
    ];
    await connection.execute(sql, values);
  }

  await connection.end();
}

insertProducts().catch(console.error);
