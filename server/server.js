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

let products = [];
let cart = [];
const users = {}; // Простейшее хранилище для пользователей

fs.readFile("../data/products.json", "utf8", (err, data) => {
  if (err) {
    console.error("Ошибка при чтении файла: ", err);
    return;
  }
  products = JSON.parse(data);
});

function generateId() {
  return Math.floor(1000 + Math.random() * 9000);
}

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

app.get("/products", (req, res) => {
  res.json(products);
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

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!isValidUsername(username) || !isValidPassword(password)) {
    return res.status(400).send("Неверные данные пользователя.");
  }

  const user = Object.values(users).find(
    (user) => user.username === username && user.password === password
  );
  if (user) {
    res.send("Вход выполнен успешно");
  } else {
    res.status(400).send("Неверный логин или пароль");
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

app.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!isValidUsername(username) || !isValidPassword(password)) {
    return res.status(400).send("Неверные данные пользователя.");
  }

  // Проверяем, существует ли уже пользователь с таким username
  const userExists = Object.values(users).some(
    (user) => user.username === username
  );
  if (userExists) {
    return res.status(400).send("Такой пользователь уже существует");
  }

  const userId = generateId();
  users[userId] = { username, password };

  res.send("Регистрация выполнена успешно");
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

app.post("/add-product", (req, res) => {
  const newProduct = req.body;
  const validationMessage = isValidProduct(newProduct);

  if (validationMessage) {
    return res.status(400).send(validationMessage);
  }

  newProduct.id = generateId();
  products.push(newProduct);

  fs.writeFile("products.json", JSON.stringify(products), (err) => {
    if (err) {
      console.error("Ошибка при записи в файл: ", err);
      return res.status(500).send("Ошибка сервера при добавлении продукта.");
    }
    res.send(`Продукт успешно добавлен с ID: ${newProduct.id}`);
  });
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
app.get("/products/id/:productId", (req, res) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) {
    return res.status(400).send("Неверный формат ID");
  }
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).send("Товар с таким ID не найден");
  }
  res.json(product);
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
app.get("/products/FindByCategory", (req, res) => {
  const categories = req.query.category;
  if (!categories) {
    return res.status(400).send("Не указана категория");
  }
  const categoryArray = Array.isArray(categories) ? categories : [categories];
  const filteredProducts = products.filter((p) =>
    categoryArray.includes(p.category)
  );
  if (filteredProducts.length === 0) {
    return res.status(404).send("Товары в данной категории не найдены");
  }
  res.json(filteredProducts);
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
app.get("/products/FindByManufacturer", (req, res) => {
  const manufacturers = req.query.manufacturer;
  if (!manufacturers) {
    return res.status(400).send("Не указан производитель");
  }
  const manufacturerArray = Array.isArray(manufacturers)
    ? manufacturers
    : [manufacturers];
  const filteredProducts = products.filter((p) =>
    manufacturerArray.includes(p.manufacturer)
  );
  if (filteredProducts.length === 0) {
    return res.status(404).send("Товары данного производителя не найдены");
  }
  res.json(filteredProducts);
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
app.get("/products/FindByShipping", (req, res) => {
  const freeShippingValues = req.query.freeShipping;
  if (!freeShippingValues) {
    return res
      .status(400)
      .send("Не указан параметр 'freeShipping' для бесплатной доставки");
  }

  const freeShippingArray = Array.isArray(freeShippingValues)
    ? freeShippingValues.map((value) => value === "true") // Преобразуем строки в булевы значения
    : [freeShippingValues === "true"];

  const filteredProducts = products.filter((p) =>
    freeShippingArray.includes(p.freeShipping)
  );
  if (filteredProducts.length === 0) {
    return res
      .status(404)
      .send("Товары с указанным параметром бесплатной доставки не найдены");
  }

  res.json(filteredProducts);
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
app.delete("/products/id/:productId", (req, res) => {
  const productId = parseInt(req.params.productId);
  if (isNaN(productId)) {
    return res.status(400).send("Неверный формат ID");
  }
  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) {
    return res.status(404).send("Товар с таким ID не найден");
  }
  products.splice(index, 1);
  res.send("Товар удалён");
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
app.put("/products/id/:productId", (req, res) => {
  const productId = parseInt(req.params.productId);
  const newProduct = req.body;
  const validationMessage = isValidProduct(newProduct);

  if (isNaN(productId)) {
    return res.status(400).send("Неверный формат ID");
  }
  if (validationMessage) {
    return res.status(400).send(validationMessage);
  }

  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) {
    return res.status(404).send("Товар с таким ID не найден");
  }

  newProduct.id = productId; // Убедитесь, что ID остаётся прежним
  products[index] = newProduct;
  res.send("Товар обновлён");
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
app.patch("/products/id/:productId", (req, res) => {
  const productId = parseInt(req.params.productId);
  const productUpdates = req.body;

  if (isNaN(productId)) {
    return res.status(400).send("Неверный формат ID");
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).send("Товар с таким ID не найден");
  }

  // Обновляем только предоставленные поля
  Object.keys(productUpdates).forEach((key) => {
    product[key] = productUpdates[key];
  });

  res.send("Товар частично обновлён");
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
app.post("/users", (req, res) => {
  const { username, password } = req.body;

  if (!isValidUsername(username) || !isValidPassword(password)) {
    return res.status(400).send("Неверные данные пользователя.");
  }

  // Проверяем уникальность имени пользователя
  if (Object.values(users).find((user) => user.username === username)) {
    return res.status(400).send("Пользователь с таким именем уже существует.");
  }

  const userId = generateId();
  users[userId] = { username, password };

  res.send(`Пользователь с ID: ${userId} успешно добавлен.`);
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
app.delete("/users/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).send("Неверный формат ID пользователя");
  }

  if (!users[userId]) {
    return res.status(404).send("Пользователь не найден");
  }

  delete users[userId];

  res.send(`Пользователь с ID: ${userId} успешно удален.`);
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
app.get("/products/filter", (req, res) => {
  const { category, manufacturer, freeShipping, minPrice, maxPrice } =
    req.query;

  let filteredProducts = products;

  if (category) {
    filteredProducts = filteredProducts.filter((p) => p.category === category);
  }

  if (manufacturer) {
    filteredProducts = filteredProducts.filter(
      (p) => p.manufacturer === manufacturer
    );
  }

  if (freeShipping) {
    const freeShippingBool = freeShipping === "true";
    filteredProducts = filteredProducts.filter(
      (p) => p.freeShipping === freeShippingBool
    );
  }

  if (minPrice) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price >= Number(minPrice)
    );
  }

  if (maxPrice) {
    filteredProducts = filteredProducts.filter(
      (p) => p.price <= Number(maxPrice)
    );
  }

  res.json(filteredProducts);
});

app.listen(3000, () => {
  console.log("Сервер запущен на http://localhost:3000");
});
