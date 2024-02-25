const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const dbConfig = require("../config/dbConfig");

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promisePool = pool.promise();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API for online store",
      contact: {
        name: "Artsiom Rusau",
        email: "qa.rusau@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["server.js"], // указывает на местонахождение документации Swagger в вашем коде
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(cors()); // Включите CORS для всех маршрутов
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const path = require("path");
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/index.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/about.html"));
});

app.get("/contacts", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/contacts.html"));
});

app.get("/cart", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/cart.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/login.html"));
});

app.get("/policy", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/policy.html"));
});

let cart = [];

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - category
 *         - manufacturer
 *         - imageUrl
 *         - freeShipping
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор продукта
 *         name:
 *           type: string
 *           description: Название продукта
 *         description:
 *           type: string
 *           description: Описание продукта
 *         price:
 *           type: number
 *           description: Цена продукта
 *         category:
 *           type: string
 *           description: Категория продукта
 *         manufacturer:
 *           type: string
 *           description: Производитель продукта
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: Ссылка на изображение продукта
 *         freeShipping:
 *           type: boolean
 *           description: Доступность бесплатной доставки
 */

// Маршрут для получения списка продуктов
/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Возвращает список всех продуктов
 *     responses:
 *       200:
 *         description: Список продуктов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

app.get("/products", async (req, res) => {
  try {
    const [rows] = await promisePool.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error("Ошибка при получении продуктов: ", err);
    res.status(500).send("Ошибка сервера при получении списка продуктов");
  }
});

function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
  return usernameRegex.test(username);
}

function isValidPassword(password) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
}

//Логин

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Users]
 *     summary: Авторизация пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Вход выполнен успешно
 *       400:
 *         description: Неверные данные пользователя
 */

app.post("/login", async (req, res) => {
  console.log("Получен запрос на /login:", req.body);
  const { username, password } = req.body;

  if (!isValidUsername(username) || !isValidPassword(password)) {
    return res.status(400).send("Неверные данные пользователя.");
  }

  try {
    const [users] = await promisePool.query(
      "SELECT * FROM users WHERE login = ? AND password = ?",
      [username, password]
    );
    if (users.length > 0) {
      res.send("Вход выполнен успешно");
    } else {
      res.status(400).send("Неверный логин или пароль");
    }
  } catch (err) {
    console.error("Ошибка при авторизации пользователя: ", err);
    res.status(500).send("Ошибка сервера при авторизации пользователя");
  }
});

//Регистрация
/**
 * @swagger
 * /register:
 *   post:
 *     tags: [Users]
 *     summary: Регистрация нового пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Регистрация выполнена успешно
 *       400:
 *         description: Неверные данные пользователя или пользователь уже существует
 */

app.post("/register", async (req, res) => {
  console.log("Получен запрос на /register:", req.body);
  const { username, password } = req.body;

  if (!isValidUsername(username) || !isValidPassword(password)) {
    return res.status(400).send("Неверные данные пользователя.");
  }

  try {
    const [existingUser] = await promisePool.query(
      "SELECT * FROM users WHERE login = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(400).send("Такой пользователь уже существует");
    }

    await promisePool.query(
      "INSERT INTO users (login, password) VALUES (?, ?)",
      [username, password]
    );

    res.send("Регистрация выполнена успешно");
  } catch (err) {
    console.error("Ошибка при регистрации пользователя: ", err);
    res.status(500).send("Ошибка сервера при регистрации пользователя");
  }
});

// Функция для валидации данных продукта
function isValidProduct(product) {
  const expectedKeys = [
    "name",
    "description",
    "price",
    "category",
    "manufacturer",
    "imageUrl",
    "freeShipping",
  ];
  const receivedKeys = Object.keys(product);

  for (const key of expectedKeys) {
    if (
      product[key] === undefined ||
      product[key] === null ||
      product[key] === ""
    ) {
      return `Отсутствует или пустое значение для ключа '${key}'`;
    }

    if (!receivedKeys.includes(key)) {
      return `Отсутствует ключ '${key}'`;
    }

    if (product[key] === undefined || product[key] === null) {
      return `Отсутствует значение для ключа '${key}'`;
    }
  }

  if (typeof product.name !== "string")
    return "Неправильный тип значения для 'name'";
  if (typeof product.description !== "string")
    return "Неправильный тип значения для 'description'";
  if (typeof product.price !== "number")
    return "Неправильный тип значения для 'price'";
  if (typeof product.category !== "string")
    return "Неправильный тип значения для 'category'";
  if (typeof product.manufacturer !== "string")
    return "Неправильный тип значения для 'manufacturer'";
  if (typeof product.imageUrl !== "string")
    return "Неправильный тип значения для 'imageUrl'";
  if (typeof product.freeShipping !== "boolean")
    return "Неправильный тип значения для 'freeShipping'";

  return null;
}

//Добавление продукта

/**
 * @swagger
 * /add-product:
 *   post:
 *     tags: [Products]
 *     summary: Добавление нового продукта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Продукт успешно добавлен
 *       400:
 *         description: Ошибка в данных продукта
 */

app.post("/add-product", async (req, res) => {
  const newProduct = req.body;
  const validationMessage = isValidProduct(newProduct);

  if (validationMessage) {
    return res.status(400).send(validationMessage);
  }

  try {
    const [result] = await promisePool.query(
      "INSERT INTO products SET ?",
      newProduct
    );
    res.send(`Продукт успешно добавлен с ID: ${result.insertId}`);
  } catch (err) {
    console.error("Ошибка при добавлении продукта: ", err);
    res.status(500).send("Ошибка сервера при добавлении продукта");
  }
});

// Поиск товара по ID
/**
 * @swagger
 * /products/id/{productId}:
 *   get:
 *     tags: [Products]
 *     summary: Поиск товара по ID
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Уникальный идентификатор продукта
 *     responses:
 *       200:
 *         description: Данные о продукте
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар с таким ID не найден
 */
app.get("/products/id/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) {
    return res.status(400).send("Неверный формат ID");
  }

  try {
    const [rows] = await promisePool.query(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );
    const product = rows[0];
    if (!product) {
      return res.status(404).send("Товар с таким ID не найден");
    }
    res.json(product);
  } catch (error) {
    console.error("Ошибка при получении продукта:", error);
    res.status(500).send("Ошибка сервера при получении продукта.");
  }
});

// Поиск товара по категории
/**
 * @swagger
 * /products/FindByCategory:
 *   get:
 *     summary: Поиск товаров по категории
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         required: true
 *         description: Категория продукта
 *     responses:
 *       200:
 *         description: Список продуктов по категории
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товары в данной категории не найдены
 */
app.get("/products/FindByCategory", async (req, res) => {
  const category = req.query.category;
  if (!category) {
    return res.status(400).send("Не указана категория");
  }

  try {
    const [rows] = await promisePool.query(
      "SELECT * FROM products WHERE category = ?",
      [category]
    );
    if (rows.length === 0) {
      return res.status(404).send("Товары в данной категории не найдены");
    }
    res.json(rows);
  } catch (err) {
    console.error("Ошибка при поиске по категории:", err);
    res.status(500).send("Ошибка сервера");
  }
});

// Поиск товара по производителю
/**
 * @swagger
 * /products/FindByManufacturer:
 *   get:
 *     tags: [Products]
 *     summary: Поиск товаров по производителю
 *     parameters:
 *       - in: query
 *         name: manufacturer
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         required: true
 *         description: Производитель продукта
 *     responses:
 *       200:
 *         description: Список продуктов по производителю
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товары данного производителя не найдены
 */
app.get("/products/FindByManufacturer", async (req, res) => {
  const manufacturer = req.query.manufacturer;
  if (!manufacturer) {
    return res.status(400).send("Не указан производитель");
  }

  try {
    const [rows] = await promisePool.query(
      "SELECT * FROM products WHERE manufacturer = ?",
      [manufacturer]
    );
    if (rows.length === 0) {
      return res.status(404).send("Товары данного производителя не найдены");
    }
    res.json(rows);
  } catch (err) {
    console.error("Ошибка при поиске по производителю:", err);
    res.status(500).send("Ошибка сервера");
  }
});

// Поиск товара по возможности бесплатной доставки
/**
 * @swagger
 * /products/FindByShipping:
 *   get:
 *     tags: [Products]
 *     summary: Поиск товаров с бесплатной доставкой
 *     parameters:
 *       - in: query
 *         name: freeShipping
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: ['true', 'false']
 *         required: true
 *         description: Наличие бесплатной доставки (true/false)
 *     responses:
 *       200:
 *         description: Список продуктов с бесплатной доставкой
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товары с указанным параметром бесплатной доставки не найдены
 */
app.get("/products/FindByShipping", async (req, res) => {
  const freeShipping = req.query.freeShipping;
  if (freeShipping === undefined) {
    return res
      .status(400)
      .send("Не указан параметр 'freeShipping' для бесплатной доставки");
  }

  try {
    const [rows] = await promisePool.query(
      "SELECT * FROM products WHERE freeShipping = ?",
      [freeShipping === "true"]
    );
    if (rows.length === 0) {
      return res
        .status(404)
        .send("Товары с указанным параметром бесплатной доставки не найдены");
    }
    res.json(rows);
  } catch (err) {
    console.error("Ошибка при поиске по бесплатной доставке:", err);
    res.status(500).send("Ошибка сервера");
  }
});

// Удаление товара по ID
/**
 * @swagger
 * /products/id/{productId}:
 *   delete:
 *     tags: [Products]
 *     summary: Удаление товара по ID
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Уникальный идентификатор продукта
 *     responses:
 *       200:
 *         description: Товар успешно удалён
 *       404:
 *         description: Товар с таким ID не найден
 */
app.delete("/products/id/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) {
    return res.status(400).send("Неверный формат ID");
  }

  try {
    const [result] = await promisePool.query(
      "DELETE FROM products WHERE id = ?",
      [productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).send("Товар с таким ID не найден");
    }
    res.send("Товар удалён");
  } catch (error) {
    console.error("Ошибка при удалении продукта:", error);
    res.status(500).send("Ошибка сервера при удалении продукта");
  }
});

// Полное обновление товара по ID
/**
 * @swagger
 * /products/id/{productId}:
 *   put:
 *     tags: [Products]
 *     summary: Полное обновление товара по ID
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Уникальный идентификатор продукта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Товар успешно обновлён
 *       400:
 *         description: Неверные данные продукта
 *       404:
 *         description: Товар с таким ID не найден
 */
app.put("/products/id/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  const productData = req.body;
  const validationMessage = isValidProduct(productData);

  if (isNaN(productId)) {
    return res.status(400).send("Неверный формат ID");
  }
  if (validationMessage) {
    return res.status(400).send(validationMessage);
  }

  try {
    const [result] = await promisePool.query(
      "UPDATE products SET ? WHERE id = ?",
      [productData, productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).send("Товар с таким ID не найден");
    }
    res.send("Товар обновлён");
  } catch (error) {
    console.error("Ошибка при обновлении продукта:", error);
    res.status(500).send("Ошибка сервера при обновлении продукта");
  }
});

// Частичное обновление товара по ID
/**
 * @swagger
 * /products/id/{productId}:
 *   patch:
 *     tags: [Products]
 *     summary: Частичное обновление товара по ID
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Уникальный идентификатор продукта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *               freeShipping:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Товар успешно обновлён
 *       400:
 *         description: Неверные данные продукта
 *       404:
 *         description: Товар с таким ID не найден
 */
app.patch("/products/id/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  const productUpdates = req.body;

  if (isNaN(productId)) {
    return res.status(400).send("Неверный формат ID");
  }

  try {
    const [result] = await promisePool.query(
      "UPDATE products SET ? WHERE id = ?",
      [productUpdates, productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).send("Товар с таким ID не найден");
    }
    res.send("Товар частично обновлён");
  } catch (error) {
    console.error("Ошибка при частичном обновлении продукта:", error);
    res.status(500).send("Ошибка сервера при частичном обновлении продукта");
  }
});

// Добавление товара в корзину
/**
 * @swagger
 * /cart:
 *   post:
 *     tags: [Cart]
 *     summary: Добавляет товар в корзину пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: Идентификатор продукта для добавления в корзину
 *               quantity:
 *                 type: integer
 *                 description: Количество добавляемых товаров
 *     responses:
 *       200:
 *         description: Товар добавлен в корзину
 *       400:
 *         description: Неверный запрос
 */
app.post("/cart", (req, res) => {
  const { productId, quantity } = req.body;

  // Валидация
  if (!productId || !quantity) {
    return res.status(400).send("Некорректные данные товара или количество");
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).send("Продукт не найден");
  }

  // Здесь должна быть логика добавления в корзину
  // Для примера, добавим товар в массив cart
  const cartItem = { productId, quantity };
  // предполагается, что у нас уже есть массив cart
  cart.push(cartItem);

  return res
    .status(200)
    .send(
      `Товар с ID: ${productId} добавлен в корзину в количестве ${quantity}`
    );
});

// Удаление товара из корзины
/**
 * @swagger
 * /cart/{productId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Удаляет товар из корзины пользователя
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Идентификатор продукта для удаления из корзины
 *     responses:
 *       200:
 *         description: Товар удален из корзины
 *       400:
 *         description: Неверный запрос
 *       404:
 *         description: Товар не найден в корзине
 */
app.delete("/cart/:productId", (req, res) => {
  const productId = parseInt(req.params.productId);

  // Валидация
  if (isNaN(productId)) {
    return res.status(400).send("Неверный формат ID товара");
  }

  // Находим индекс товара в корзине
  const index = cart.findIndex((item) => item.productId === productId);

  // Проверяем, есть ли товар в корзине
  if (index === -1) {
    return res.status(404).send("Товар не найден в корзине");
  }

  // Удаляем товар из корзины
  cart.splice(index, 1);

  return res.status(200).send(`Товар с ID: ${productId} удален из корзины`);
});

// Добавление нового пользователя
/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Добавление нового пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Пользователь успешно добавлен
 *       400:
 *         description: Неверные данные пользователя
 */
app.post("/users", async (req, res) => {
  const { username, password } = req.body;

  if (!isValidUsername(username) || !isValidPassword(password)) {
    return res.status(400).send("Неверные данные пользователя.");
  }

  try {
    // Проверяем, существует ли уже пользователь с таким именем пользователя
    const [existingUsers] = await promisePool.query(
      "SELECT * FROM users WHERE login = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).send("Такой пользователь уже существует.");
    }

    // Добавляем нового пользователя
    const [result] = await promisePool.query(
      "INSERT INTO users (login, password) VALUES (?, ?)",
      [username, password]
    );
    res.send(`Пользователь успешно добавлен с ID: ${result.insertId}`);
  } catch (error) {
    console.error("Ошибка при добавлении пользователя:", error);
    res.status(500).send("Ошибка сервера при добавлении пользователя");
  }
});

// Удаление пользователя по ID
/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     tags: [Users]
 *     summary: Удаляет пользователя по ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Уникальный идентификатор пользователя
 *     responses:
 *       200:
 *         description: Пользователь успешно удалён
 *       404:
 *         description: Пользователь не найден
 */
app.delete("/users/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).send("Неверный формат ID пользователя");
  }

  try {
    const [result] = await promisePool.query(
      "DELETE FROM users WHERE user_id = ?",
      [userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).send("Пользователь не найден");
    }

    res.send(`Пользователь с ID: ${userId} успешно удален.`);
  } catch (error) {
    console.error("Ошибка при удалении пользователя:", error);
    res.status(500).send("Ошибка сервера при удалении пользователя");
  }
});

// Общий эндпоинт для фильтрации продуктов
/**
 * @swagger
 * /products/filter:
 *   get:
 *     summary: Фильтрация списка продуктов
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: false
 *         description: Категория продукта
 *       - in: query
 *         name: manufacturer
 *         schema:
 *           type: string
 *         required: false
 *         description: Производитель продукта
 *       - in: query
 *         name: freeShipping
 *         schema:
 *           type: boolean
 *         required: false
 *         description: Наличие бесплатной доставки
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         required: false
 *         description: Минимальная цена продукта
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         required: false
 *         description: Максимальная цена продукта
 *     responses:
 *       200:
 *         description: Отфильтрованный список продуктов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка запроса
 */
app.get("/products/filter", async (req, res) => {
  const { category, manufacturer, freeShipping, minPrice, maxPrice } =
    req.query;

  let query = "SELECT * FROM products WHERE ";
  let conditions = [];
  let params = [];

  if (category) {
    conditions.push("category = ?");
    params.push(category);
  }

  if (manufacturer) {
    conditions.push("manufacturer = ?");
    params.push(manufacturer);
  }

  if (freeShipping) {
    conditions.push("freeShipping = ?");
    params.push(freeShipping === "true");
  }

  if (minPrice) {
    conditions.push("price >= ?");
    params.push(minPrice);
  }

  if (maxPrice) {
    conditions.push("price <= ?");
    params.push(maxPrice);
  }

  if (conditions.length === 0) {
    query = "SELECT * FROM products";
  } else {
    query += conditions.join(" AND ");
  }

  try {
    const [rows] = await promisePool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Ошибка при фильтрации продуктов:", error);
    res.status(500).send("Ошибка сервера при фильтрации продуктов");
  }
});

app.listen(3000, () => {
  console.log("Сервер запущен на http://localhost:3000");
});
