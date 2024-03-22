async function updateOrderTotal(orderId) {
  try {
    // Получаем общую сумму заказа без учета платной доставки
    const [result] = await pool.query(
      `SELECT SUM(p.price * oi.quantity) AS total
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    let total = result[0]?.total || 0;

    // Обновляем общую сумму заказа в базе данных
    await pool.query("UPDATE orders SET total = ? WHERE order_id = ?", [
      total,
      orderId,
    ]);

    return total; // Возвращаем обновленную сумму для возможной дальнейшей обработки
  } catch (error) {
    console.error("Ошибка при обновлении общей суммы заказа:", error);
    throw error; // Возможно, здесь стоит выбросить ошибку для внешней обработки
  }
}

const express = require("express");
const dbConfig = require("../config/dbConfig");
const { body, validationResult } = require("express-validator");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const jwt = require("jsonwebtoken");
const path = require("path");
const baseUrl = "http://localhost";

// Читаем содержимое файла с секретным ключом
const configPath = path.join(__dirname, "config.json");
const secretKeyData = fs.readFileSync(configPath);

// Преобразуем содержимое файла в объект JavaScript
const secretKeyObj = JSON.parse(secretKeyData);

// Используем значение секретного ключа из объекта
const secretKey = secretKeyObj.secretKey;

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

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
        url: "http://localhost",
        description: "Development server",
      },
      {
        url: "https://demoshopping.ru", // Production server
        description: "Production server",
      },
      {
        url: "https://qa.demoshopping.ru", // QA server
        description: "QA server",
      },
    ],
    externalDocs: {
      description: "Скачать JSON-спецификацию Swagger",
      url: baseUrl + "/openapi.json",
    },
  },
  apis: ["server.js"], // указывает на местонахождение документации Swagger в вашем коде
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Маршрут для предоставления JSON-версии спецификации Swagger
app.get("/openapi.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocs);
});

const cardValidation = [
  body("card_type").isIn(["VISA", "MasterCard"]),
  body("card_code").isLength({ min: 16, max: 16 }).isNumeric(),
  body("expiry_month")
    .isInt({ min: 1, max: 12 })
    .withMessage("Месяц истечения срока должен быть числом от 1 до 12."),
  body("expiry_year")
    .isInt({ min: 0, max: 99 })
    .withMessage("Год истечения срока должен быть числом от 0 до 99."),
  body("cvv")
    .isLength({ min: 3, max: 3 })
    .isNumeric()
    .withMessage("CVV должен состоять из 3 цифр."),
  body("email").isEmail().withMessage("Укажите действующий email."),
];

const paypalValidation = [
  body("email_paypal")
    .isEmail()
    .withMessage("Укажите действующий email аккаунта PayPal."),
  body("email")
    .isEmail()
    .withMessage("Укажите действующий email для отправки счета."),
];

app.use(cors()); // Включите CORS для всех маршрутов
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

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

app.get("/payment", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/payment.html"));
});

app.get("/history", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/history.html"));
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
    const [rows] = await pool.query("SELECT * FROM products");
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
  const { username, password } = req.body;

  if (!isValidUsername(username) || !isValidPassword(password)) {
    return res.status(400).send("Неверные данные пользователя.");
  }

  try {
    const [users] = await pool.query(
      "SELECT * FROM users WHERE login = ? AND password = ?",
      [username, password]
    );
    if (users.length > 0) {
      const user = users[0];
      const token = jwt.sign(
        { id: user.user_id }, // Изменено с userId на id
        secretKey,
        { expiresIn: "100 days" }
      );

      await pool.query("UPDATE users SET token = ? WHERE user_id = ?", [
        token,
        user.user_id,
      ]);

      res.send({ message: "Вход выполнен успешно", token });
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
  const { username, password } = req.body;

  const validationErrors = [];

  if (!isValidUsername(username)) {
    validationErrors.push(
      "Логин должен содержать от 3 до 15 символов и может включать буквы, цифры и символы: _"
    );
  }

  if (!isValidPassword(password)) {
    validationErrors.push(
      "Пароль должен содержать не менее 8 символов, включая минимум одну букву и одну цифру"
    );
  }

  if (validationErrors.length > 0) {
    return res
      .status(400)
      .json({ error: "Неверные данные пользователя", validationErrors });
  }

  try {
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE login = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(400).send("Такой пользователь уже существует");
    }

    await pool.query("INSERT INTO users (login, password) VALUES (?, ?)", [
      username,
      password,
    ]);

    res.json({ message: "Регистрация выполнена успешно" });
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
    const [result] = await pool.query("INSERT INTO products SET ?", newProduct);
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
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [
      productId,
    ]);
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
    const [rows] = await pool.query(
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
    const [rows] = await pool.query(
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
    const [rows] = await pool.query(
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

  // Запрет на удаление для ID от 1 до 50
  if (productId >= 1 && productId <= 50) {
    return res.status(403).send("Удаление этого товара запрещено");
  }

  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [
      productId,
    ]);
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
    const [result] = await pool.query("UPDATE products SET ? WHERE id = ?", [
      productData,
      productId,
    ]);
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
    const [result] = await pool.query("UPDATE products SET ? WHERE id = ?", [
      productUpdates,
      productId,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).send("Товар с таким ID не найден");
    }
    res.send("Товар частично обновлён");
  } catch (error) {
    console.error("Ошибка при частичном обновлении продукта:", error);
    res.status(500).send("Ошибка сервера при частичном обновлении продукта");
  }
});

/**
 * @swagger
 * /cart:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Cart
 *     summary: Добавляет товар в корзину пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: Идентификатор добавляемого товара
 *               quantity:
 *                 type: integer
 *                 description: Количество добавляемого товара
 *     responses:
 *       200:
 *         description: Товар успешно добавлен в корзину
 *       400:
 *         description: Неверный запрос
 *       401:
 *         description: Пользователь не авторизован
 *       500:
 *         description: Ошибка сервера
 */

app.post("/cart", async (req, res) => {
  console.log(req.body);
  const { productId, quantity } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Токен не предоставлен");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    if (!userId) {
      return res
        .status(401)
        .send("Ошибка при декодировании токена: отсутствует userId");
    }

    // Проверяем, существует ли уже товар в корзине для данного пользователя
    const [rows] = await pool.query(
      "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    if (rows.length > 0) {
      // Если товар уже присутствует в корзине, обновляем количество товара
      // Важно преобразовать значения в числа и проверить на NaN
      const existingQuantity = parseInt(rows[0].quantity, 10);
      const addedQuantity = parseInt(quantity, 10);

      if (!isNaN(existingQuantity) && !isNaN(addedQuantity)) {
        const updatedQuantity = existingQuantity + addedQuantity;
        await pool.query(
          "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?",
          [updatedQuantity, userId, productId]
        );

        res.status(200).send(`Количество товара в корзине обновлено`);
      } else {
        // Если одно из значений не является числом, отправляем ошибку
        console.error(
          "Ошибка: невозможно обновить количество, так как одно из значений не является числом."
        );
        res.status(400).send("Неверные данные: количество не является числом.");
      }
    } else {
      // Если товар еще не присутствует в корзине, добавляем новую запись
      // Также проверяем, что переданное количество является числом
      if (!isNaN(parseInt(quantity, 10))) {
        await pool.query(
          "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
          [userId, productId, parseInt(quantity, 10)]
        );

        res
          .status(200)
          .send(`Товар добавлен в корзину пользователя с ID: ${userId}`);
      } else {
        console.error("Ошибка: количество не является числом.");
        res.status(400).send("Неверные данные: количество не является числом.");
      }
    }
  } catch (err) {
    console.error("Ошибка при добавлении товара в корзину: ", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).send("Недействительный токен");
    }
    res.status(500).send("Ошибка сервера при добавлении товара в корзину");
  }
});

// Получение содержимого корзины пользователя

/**
 * @swagger
 * /getCart:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Cart
 *     summary: Возвращает содержимое корзины пользователя
 *     responses:
 *       200:
 *         description: Содержимое корзины успешно получено
 *       401:
 *         description: Пользователь не авторизован
 *       500:
 *         description: Ошибка сервера
 */
app.get("/getCart", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Токен не предоставлен" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    if (!userId) {
      return res.status(401).json({
        message: "Ошибка при декодировании токена: отсутствует userId",
      });
    }

    const [cartItems] = await pool.query(
      "SELECT ci.cart_item_id, ci.quantity, p.product_id, p.name, p.price, p.imageUrl FROM cart_items ci JOIN products p ON ci.product_id = p.product_id WHERE ci.user_id = ?",
      [userId]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({ message: "Корзина пуста" });
    }

    res.json(cartItems);
  } catch (err) {
    console.error("Ошибка при получении содержимого корзины: ", err);
    res
      .status(500)
      .json({ message: "Ошибка сервера при получении содержимого корзины" });
  }
});

//Изменение количества товаров в корзине

/**
 * @swagger
 * /cart/{cartItemId}/quantity:
 *   patch:
 *     tags: [Cart]
 *     summary: Обновляет количество товара в корзине пользователя
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Идентификатор элемента в корзине
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: Новое количество товара
 *     responses:
 *       200:
 *         description: Количество товара в корзине обновлено
 *       400:
 *         description: Неверный запрос
 *       401:
 *         description: Пользователь не авторизован
 *       404:
 *         description: Элемент корзины не найден
 *       500:
 *         description: Ошибка сервера
 */
app.patch("/cart/:cartItemId", async (req, res) => {
  const { cartItemId } = req.params;
  const { quantity } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Токен не предоставлен" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    if (!userId) {
      return res.status(401).json({
        message: "Ошибка при декодировании токена: отсутствует userId",
      });
    }

    // Проверяем, существует ли товар в корзине
    const [existingCartItem] = await pool.query(
      "SELECT * FROM cart_items WHERE cart_item_id = ? AND user_id = ?",
      [cartItemId, userId]
    );

    if (existingCartItem.length === 0) {
      return res.status(404).json({ message: "Товар в корзине не найден" });
    }

    // Обновляем количество товара в корзине
    await pool.query(
      "UPDATE cart_items SET quantity = ? WHERE cart_item_id = ? AND user_id = ?",
      [quantity, cartItemId, userId]
    );

    res.json({ message: "Количество товара в корзине обновлено" });
  } catch (err) {
    console.error("Ошибка при обновлении количества товара в корзине: ", err);
    res.status(500).json({
      message: "Ошибка сервера при обновлении количества товара в корзине",
    });
  }
});

// Удаление товара из корзины
/**
 * @swagger
 * /cart/{cartItemId}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Cart
 *     summary: Удаляет товар из корзины пользователя
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Идентификатор удаляемого элемента корзины
 *     responses:
 *       200:
 *         description: Товар успешно удален из корзины
 *       400:
 *         description: Неверный запрос
 *       401:
 *         description: Пользователь не авторизован
 *       404:
 *         description: Товар в корзине не найден
 *       500:
 *         description: Ошибка сервера
 */

app.delete("/cart/:cartItemId", async (req, res) => {
  const cartItemId = parseInt(req.params.cartItemId);
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Токен не предоставлен");
  }

  if (isNaN(cartItemId)) {
    return res.status(400).send("Неверный формат ID товара в корзине");
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;
    if (!userId) {
      return res
        .status(401)
        .send("Ошибка при декодировании токена: отсутствует userId");
    }

    const [result] = await pool.query(
      "DELETE FROM cart_items WHERE cart_item_id = ? AND user_id = ?",
      [cartItemId, userId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .send(
          "Товар не найден в корзине или у пользователя нет прав на его удаление"
        );
    }

    res.status(200).send(`Товар с ID: ${cartItemId} удален из корзины`);
  } catch (err) {
    console.error("Ошибка при удалении товара из корзины: ", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).send("Недействительный токен");
    }
    res.status(500).send("Ошибка сервера при удалении товара из корзины");
  }
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
    const [existingUsers] = await pool.query(
      "SELECT * FROM users WHERE login = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).send("Такой пользователь уже существует.");
    }

    // Добавляем нового пользователя
    const [result] = await pool.query(
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
    const [result] = await pool.query("DELETE FROM users WHERE user_id = ?", [
      userId,
    ]);
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
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Ошибка при фильтрации продуктов:", error);
    res.status(500).send("Ошибка сервера при фильтрации продуктов");
  }
});

//счетчиккорзины
app.get("/getCartCount", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Токен не предоставлен" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    const [result] = await pool.query(
      "SELECT SUM(quantity) AS count FROM cart_items WHERE user_id = ?",
      [userId]
    );

    const count = result[0].count || 0;
    res.json({ count });
  } catch (err) {
    console.error("Ошибка при получении количества товаров в корзине:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

//информация обо всех товарах в заказе
/**
 * @swagger
 * /user-orders:
 *   get:
 *     tags: [Orders]
 *     summary: Получение списка всех заказов пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список заказов успешно получен.
 *       401:
 *         description: Пользователь не авторизован.
 *       500:
 *         description: Ошибка сервера.
 */
app.get("/user-orders", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Токен не предоставлен");

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    // Получаем все заказы пользователя, включая информацию о товарах и индивидуальном статусе бесплатной доставки каждого товара
    const ordersQuery = `
      SELECT o.order_id, o.total, oi.quantity, p.name, p.price, p.product_id, p.freeShipping, p.imageUrl
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      WHERE o.user_id = ?
      ORDER BY o.order_id DESC`;

    const [orders] = await pool.query(ordersQuery, [userId]);

    if (orders.length === 0) {
      return res.status(404).send("Заказы не найдены.");
    }

    // Группируем товары по заказам и добавляем информацию о бесплатной доставке к каждому товару
    const groupedOrders = orders.reduce((acc, current) => {
      const order = acc.find((order) => order.order_id === current.order_id);
      if (order) {
        order.items.push({
          product_id: current.product_id,
          name: current.name,
          price: current.price,
          quantity: current.quantity,
          freeShipping: current.freeShipping === 1, // Преобразуем 1 в true, предполагая, что 1 означает true в вашей БД
          imageUrl: current.imageUrl,
        });
      } else {
        acc.push({
          order_id: current.order_id,
          total: current.total,
          items: [
            {
              product_id: current.product_id,
              name: current.name,
              price: current.price,
              quantity: current.quantity,
              freeShipping: current.freeShipping === 1,
              imageUrl: current.imageUrl,
            },
          ],
        });
      }
      return acc;
    }, []);

    res.json(groupedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера при получении заказов.");
  }
});

// POST: Создание заказа из элементов в корзине
/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Создание заказа из товаров в корзине пользователя
 *     security:
 *       - bearerAuth: []
 *     description: Создает новый заказ, перемещает все товары из корзины пользователя в заказ и очищает корзину.
 *     responses:
 *       201:
 *         description: Заказ успешно создан.
 *       401:
 *         description: Пользователь не авторизован.
 *       500:
 *         description: Ошибка сервера.
 */
app.post("/orders", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Токен не предоставлен");

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    // Вычисляем общую сумму товаров в корзине пользователя
    const [totalResult] = await pool.query(
      "SELECT SUM(p.price * ci.quantity) AS total " +
        "FROM cart_items ci " +
        "JOIN products p ON ci.product_id = p.product_id " +
        "WHERE ci.user_id = ?",
      [userId]
    );
    const total = totalResult[0].total;

    if (total === null) {
      return res.status(400).send("Корзина пуста.");
    }

    // Создаем новый заказ с общей суммой
    const [orderResult] = await pool.query(
      "INSERT INTO orders (user_id, status, total) VALUES (?, 'unpaid', ?)",
      [userId, total]
    );
    const orderId = orderResult.insertId;

    // Перемещаем товары из корзины пользователя в заказ, используя orderId
    await pool.query(
      "INSERT INTO order_items (order_id, product_id, quantity) " +
        "SELECT ?, product_id, quantity FROM cart_items WHERE user_id = ?",
      [orderId, userId]
    );

    // Очищаем корзину пользователя после перемещения товаров в заказ
    await pool.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);

    res.status(201).json({ message: "Заказ успешно создан", orderId: orderId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Ошибка сервера при создании заказа.");
  }

  // POST: Создание заказа из элементов в корзине
  /**
   * @swagger
   * /orders:
   *   post:
   *     tags: [Orders]
   *     summary: Создание заказа из товаров в корзине пользователя
   *     security:
   *       - bearerAuth: []
   *     description: Создает новый заказ, перемещает все товары из корзины пользователя в заказ и очищает корзину.
   *     responses:
   *       201:
   *         description: Заказ успешно создан.
   *       401:
   *         description: Пользователь не авторизован.
   *       500:
   *         description: Ошибка сервера.
   */
  app.post("/orders", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).send("Токен не предоставлен");

    try {
      const decoded = jwt.verify(token, secretKey);
      const userId = decoded.id;

      // Вычисляем общую сумму товаров в корзине пользователя
      const [totalResult] = await pool.query(
        "SELECT SUM(p.price * ci.quantity) AS total " +
          "FROM cart_items ci " +
          "JOIN products p ON ci.product_id = p.product_id " +
          "WHERE ci.user_id = ?",
        [userId]
      );
      const total = totalResult[0].total;

      if (total === null) {
        return res.status(400).send("Корзина пуста.");
      }

      // Создаем новый заказ с общей суммой
      const [orderResult] = await pool.query(
        "INSERT INTO orders (user_id, status, total) VALUES (?, 'unpaid', ?)",
        [userId, total]
      );
      const orderId = orderResult.insertId;

      // Перемещаем товары из корзины пользователя в заказ, используя orderId
      await pool.query(
        "INSERT INTO order_items (order_id, product_id, quantity) " +
          "SELECT ?, product_id, quantity FROM cart_items WHERE user_id = ?",
        [orderId, userId]
      );

      // Очищаем корзину пользователя после перемещения товаров в заказ
      await pool.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);
      await updateOrdersTotal(userId);
      res
        .status(201)
        .json({ message: "Заказ успешно создан", orderId: orderId });
    } catch (error) {
      console.error(error);
      res.status(500).send("Ошибка сервера при создании заказа.");
    }
  });

  // DELETE: Удаление продукта из заказа
  /**
   * @swagger
   * /orders/{orderId}/products/{productId}:
   *   delete:
   *     tags: [Orders]
   *     summary: Удаление товара из заказа
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Идентификатор заказа
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Идентификатор товара
   *     responses:
   *       200:
   *         description: Товар успешно удален из заказа.
   *       400:
   *         description: Неверный запрос.
   *       401:
   *         description: Пользователь не авторизован.
   *       404:
   *         description: Товар или заказ не найдены.
   *       500:
   *         description: Ошибка сервера.
   */
  app.delete("/orders/:orderId/products/:productId", async (req, res) => {
    const { orderId, productId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send("Токен не предоставлен.");
    }

    try {
      const decoded = jwt.verify(token, secretKey);
      const userId = decoded.id;

      // Начинаем транзакцию
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      // Проверка наличия заказа у пользователя
      const [order] = await connection.query(
        "SELECT * FROM orders WHERE order_id = ? AND user_id = ?",
        [orderId, userId]
      );

      if (order.length === 0) {
        await connection.rollback();
        connection.release();
        return res
          .status(404)
          .send("Заказ не найден или у вас нет к нему доступа.");
      }

      // Получаем количество удаляемого товара
      const [[{ quantity }]] = await connection.query(
        "SELECT quantity FROM order_items WHERE order_id = ? AND product_id = ?",
        [orderId, productId]
      );

      // Удаление продукта из order_items
      await connection.query(
        "DELETE FROM order_items WHERE order_id = ? AND product_id = ?",
        [orderId, productId]
      );

      // Возвращаем товар в корзину пользователя
      await connection.query(
        `
      INSERT INTO cart_items (user_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
        [userId, productId, quantity, quantity]
      );

      // Проверяем, остались ли еще товары в заказе
      const [itemsLeft] = await connection.query(
        "SELECT COUNT(*) AS count FROM order_items WHERE order_id = ?",
        [orderId]
      );

      if (itemsLeft[0].count === 0) {
        // Удаляем заказ, если в нем не осталось товаров
        await connection.query("DELETE FROM orders WHERE order_id = ?", [
          orderId,
        ]);
      }

      // Фиксируем транзакцию
      await connection.commit();
      connection.release();
      await updateOrderTotal(orderId);
      await updateOrdersTotal(userId); // Обновляем общую сумму заказов
      res.send("Продукт успешно возвращен в корзину и удален из заказа.");
    } catch (error) {
      // Откатываем транзакцию в случае ошибки
      await connection.rollback();
      connection.release();
      console.error(error);
      if (error.name === "JsonWebTokenError") {
        res.status(401).send("Недействительный токен.");
      } else {
        res.status(500).send("Ошибка сервера.");
      }
    }
  });

  // PATCH: Изменение количества продуктов в заказе
  /**
   * @swagger
   * /orders/{orderId}/products/{productId}:
   *   patch:
   *     tags: [Orders]
   *     summary: Изменение количества товара в заказе
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: orderId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Идентификатор заказа
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: integer
   *         description: Идентификатор товара
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               quantity:
   *                 type: integer
   *                 description: Новое количество товара
   *     responses:
   *       200:
   *         description: Количество товара в заказе успешно обновлено.
   *       400:
   *         description: Неверный запрос.
   *       401:
   *         description: Пользователь не авторизован.
   *       404:
   *         description: Товар или заказ не найдены.
   *       500:
   *         description: Ошибка сервера.
   */
  // PATCH: Изменение количества продуктов в заказе
  app.patch("/orders/:orderId/products/:productId", async (req, res) => {
    const { orderId, productId } = req.params;
    const { quantity } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).send("Токен не предоставлен.");
    }

    try {
      const decoded = jwt.verify(token, secretKey);
      const userId = decoded.id;

      // Проверка наличия заказа у пользователя
      const [order] = await pool.query(
        "SELECT * FROM orders WHERE order_id = ? AND user_id = ?",
        [orderId, userId]
      );

      if (order.length === 0) {
        return res
          .status(404)
          .send("Заказ не найден или у вас нет к нему доступа.");
      }

      // Обновление количества в order_items
      await pool.query(
        "UPDATE order_items SET quantity = ? WHERE order_id = ? AND product_id = ?",
        [quantity, orderId, productId]
      );
      await updateOrderTotal(orderId);
      await updateOrdersTotal(userId);
      res.send("Количество товара обновлено в заказе");
    } catch (error) {
      console.error(error);
      if (error.name === "JsonWebTokenError") {
        res.status(401).send("Недействительный токен.");
      } else {
        res.status(500).send("Ошибка сервера");
      }
    }
  });

  //Оплата
  /**
   * @swagger
   * /pay:
   *   post:
   *     tags:
   *       - Payment
   *     summary: Оплата заказов пользователя
   *     description: Процесс оплаты заказов с использованием карты или PayPal. Валидация входных данных осуществляется в зависимости от выбранного метода оплаты.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - card_type
   *             properties:
   *               card_type:
   *                 type: string
   *                 enum: [VISA, MasterCard, Paypal]
   *                 description: Тип карты для оплаты. Для PayPal выберите 'Paypal'.
   *               card_code:
   *                 type: string
   *                 description: Код карты, требуется если тип оплаты VISA или MasterCard.
   *               expiry_month:
   *                 type: integer
   *                 description: Месяц истечения срока карты, требуется если тип оплаты VISA или MasterCard.
   *               expiry_year:
   *                 type: integer
   *                 description: Год истечения срока карты, требуется если тип оплаты VISA или MasterCard.
   *               cvv:
   *                 type: string
   *                 description: CVV код карты, требуется если тип оплаты VISA или MasterCard.
   *               email:
   *                 type: string
   *                 format: email
   *                 description: Email для отправки счета, требуется для всех типов оплаты.
   *               email_paypal:
   *                 type: string
   *                 format: email
   *                 description: Email аккаунта PayPal, требуется если тип оплаты 'Paypal'.
   *     responses:
   *       200:
   *         description: Платеж успешно проведен и заказы оплачены.
   *       400:
   *         description: Ошибка в данных карты или недостаточно средств/Данный тип карты или платежной системы не поддерживается.
   *       401:
   *         description: Пользователь не авторизован.
   *       500:
   *         description: Ошибка сервера при обработке платежа.
   */

  function cardValidationMiddleware(req, res, next) {
    // Запускаем все валидации
    cardValidation.forEach((validation) => validation.run(req));

    // Проверяем результат валидации
    const result = validationResult(req);
    if (result.isEmpty()) {
      next();
    } else {
      res.status(400).json({ errors: result.array() });
    }
  }

  function paypalValidationMiddleware(req, res, next) {
    // Запускаем все валидации
    paypalValidation.forEach((validation) => validation.run(req));

    // Проверяем результат валидации
    const result = validationResult(req);
    if (result.isEmpty()) {
      next();
    } else {
      res.status(400).json({ errors: result.array() });
    }
  }

  app.post(
    "/pay",
    (req, res, next) => {
      const { card_type } = req.body;
      const validationMiddleware =
        card_type === "Paypal"
          ? paypalValidationMiddleware
          : cardValidationMiddleware;
      validationMiddleware(req, res, next);
    },
    async (req, res) => {
      const {
        card_type,
        card_code,
        expiry_month,
        expiry_year,
        cvv,
        email_paypal,
      } = req.body;

      let decoded;
      try {
        const authToken = req.headers.authorization?.split(" ")[1];
        if (!authToken) {
          return res.status(401).send("Требуется авторизация.");
        }
        decoded = jwt.verify(authToken, secretKey);
      } catch (error) {
        return res.status(401).send("Неверный токен авторизации.");
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      await updateOrdersTotal(decoded.id);

      let paymentProcessed = false;

      const [[ordersTotal]] = await pool.query(
        "SELECT total FROM orders_total WHERE user_id = ?",
        [decoded.id]
      );

      if (!ordersTotal || ordersTotal.total <= 0) {
        return res
          .status(404)
          .send("Нет заказов для оплаты или сумма равна нулю.");
      }

      const totalOrderCost = ordersTotal.total;

      // Получаем текущую дату и время
      const paymentDate = new Date();
      // Рассчитываем дату доставки, добавляя 5 дней к текущей дате
      const deliveryDate = new Date(paymentDate);
      deliveryDate.setDate(deliveryDate.getDate() + 5);

      // Форматируем даты для MySQL
      const paymentDateFormatted = paymentDate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      const deliveryDateFormatted = deliveryDate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      try {
        if (card_type === "VISA" || card_type === "MasterCard") {
          const [cards] = await pool.query(
            "SELECT * FROM card_info WHERE card_code = ? AND expiry_month = ? AND expiry_year = ? AND cvv = ?",
            [card_code, expiry_month, expiry_year, cvv]
          );

          if (cards.length === 0) {
            return res.status(400).send("Данные карты неверны.");
          } else if (cards[0].status !== "valid") {
            return res.status(400).send("Карта недействительна.");
          }

          const balance = parseFloat(cards[0].balance);
          if (balance < totalOrderCost) {
            return res.status(400).send("Недостаточно средств на карте.");
          }

          await pool.query(
            "UPDATE card_info SET balance = balance - ? WHERE card_id = ?",
            [totalOrderCost, cards[0].card_id]
          );
          paymentProcessed = true;
        } else if (card_type === "Paypal") {
          const [paypalAccounts] = await pool.query(
            "SELECT * FROM paypal_info WHERE email = ?",
            [email_paypal]
          );

          if (paypalAccounts.length === 0) {
            return res.status(400).send("Учетная запись PayPal не существует.");
          } else if (paypalAccounts[0].status === "invalid") {
            return res.status(400).send("Учетная запись PayPal не существует.");
          } else if (paypalAccounts[0].status === "blocked") {
            return res.status(400).send("Учетная запись PayPal заблокирована.");
          }

          const balance = parseFloat(paypalAccounts[0].balance);

          if (balance < totalOrderCost) {
            return res
              .status(400)
              .send("Недостаточно средств на счете PayPal.");
          }

          await pool.query(
            "UPDATE paypal_info SET balance = balance - ? WHERE paypal_id = ?",
            [totalOrderCost, paypalAccounts[0].paypal_id]
          );
          paymentProcessed = true;
        } else {
          return res
            .status(400)
            .send("Данный тип карты или платежной системы не поддерживается.");
        }

        if (paymentProcessed) {
          // Получаем ID заказов до изменения их статуса
          const [unpaidOrders] = await pool.query(
            "SELECT order_id FROM orders WHERE user_id = ? AND status = 'unpaid'",
            [decoded.id]
          );

          const orderIds = unpaidOrders.map((order) => order.order_id);

          // Сохраняем информацию об оплаченных товарах в order_items_paid
          for (const orderId of orderIds) {
            const [orderItems] = await pool.query(
              "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
              [orderId]
            );

            for (const item of orderItems) {
              await pool.query(
                "INSERT INTO order_items_paid (user_id, order_id, product_id, quantity) VALUES (?, ?, ?, ?)",
                [decoded.id, orderId, item.product_id, item.quantity]
              );
            }
          }

          // Обновляем статус заказов и добавляем даты платежа и доставки
          if (orderIds.length > 0) {
            await pool.query(
              `UPDATE orders 
              SET status = 'paid', payment_date = ?, delivery_date = ?
              WHERE order_id IN (?)`,
              [paymentDateFormatted, deliveryDateFormatted, orderIds]
            );
          }

          // Удаляем товары из order_items для оплаченных заказов
          await pool.query("DELETE FROM order_items WHERE order_id IN (?)", [
            orderIds,
          ]);

          // Обнуляем общую сумму в orders_total после успешной оплаты
          await pool.query(
            "UPDATE orders_total SET total = 0 WHERE user_id = ?",
            [decoded.id]
          );

          res.send(
            "Платеж успешно проведен, заказы оплачены и даты обновлены."
          );
        } else {
          res.status(400).send("Платеж не был обработан.");
        }
      } catch (error) {
        console.error(error);
        res.status(500).send("Ошибка сервера при обработке платежа.");
      }
    }
  );

  // Общая сумма за все заказы
  /**
   * @swagger
   * /update-orders-total:
   *   post:
   *     tags:
   *       - Orders
   *     summary: Обновление общей суммы заказов пользователя
   *     description: Вызов этого метода приведет к пересчету и обновлению общей суммы всех неоплаченных заказов пользователя.
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Общая сумма заказов успешно обновлена. Возвращает общую сумму заказов.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Общая сумма заказов обновлена
   *                 ordersTotal:
   *                   type: number
   *                   example: 123.45
   *       401:
   *         description: Пользователь не авторизован или токен недействителен.
   *       500:
   *         description: Внутренняя ошибка сервера.
   */

  app.post("/update-orders-total", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Токен не предоставлен" });
    }

    try {
      const decoded = jwt.verify(token, secretKey);
      const userId = decoded.id;

      if (!userId) {
        return res.status(401).json({
          message: "Ошибка при декодировании токена: отсутствует userId",
        });
      }

      // Обновляем общую сумму заказов пользователя и получаем итоговую сумму
      const totalSumWithDelivery = await updateOrdersTotal(userId);
      // Отправляем обновленную итоговую сумму в ответе
      res.json({
        message: "Общая сумма заказов обновлена",
        totalSumWithDelivery, // Отправляем итоговую сумму с учетом доставки, если применимо
      });
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        res.status(401).json({ message: "Недействительный токен" });
      } else {
        console.error(
          "Ошибка сервера при обновлении общей суммы заказов:",
          error
        );
        res.status(500).json({ message: "Ошибка сервера" });
      }
    }
  });

  async function updateOrdersTotal(userId) {
    try {
      // Получаем общую сумму всех заказов пользователя
      const [ordersTotalResult] = await pool.query(
        `SELECT o.order_id, SUM(o.total) AS ordersTotal
      FROM orders o
      WHERE o.user_id = ? AND o.status = 'unpaid'
      GROUP BY o.order_id`,
        [userId]
      );

      let totalSum = 0;
      let deliveryChargeAdded = false;

      for (let row of ordersTotalResult) {
        let orderTotal = parseFloat(row.ordersTotal) || 0;
        let orderId = row.order_id;

        // Проверяем, есть ли платная доставка в каком-либо заказе
        const [deliveryChargeResult] = await pool.query(
          `SELECT EXISTS (
          SELECT 1
          FROM order_items oi
          JOIN products p ON oi.product_id = p.product_id
          WHERE oi.order_id = ? AND p.freeShipping = 0
        ) AS chargeRequired`,
          [orderId]
        );

        if (deliveryChargeResult[0].chargeRequired) {
          deliveryChargeAdded = true;
        }

        // Суммируем суммы всех заказов
        totalSum += orderTotal;
      }

      // Добавляем 5 долларов за доставку, если необходимо
      if (deliveryChargeAdded) {
        totalSum += 5;
      }
      // Обновляем или создаем запись в orders_total
      await pool.query(
        `INSERT INTO orders_total (user_id, total) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE total = VALUES(total)`,
        [userId, totalSum] // Исправлено здесь: замена total на totalSum
      );
      return totalSum; // Возвращаем общую сумму с учётом доставки
    } catch (error) {
      console.error("Ошибка при обновлении общей суммы заказов:", error);
      throw error;
    }
  }
});

// Получение данных об оплаченных заказах
/**
 * @swagger
 * /api/orders-history:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Получение данных об оплаченных заказах
 *     description: Получает данные об оплаченных заказах для авторизованного пользователя.
 *     responses:
 *       200:
 *         description: Успешный запрос. Возвращает список оплаченных заказов.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   order_id:
 *                     type: integer
 *                     description: Уникальный идентификатор заказа.
 *                   payment_date:
 *                     type: string
 *                     format: date-time
 *                     description: Дата и время оплаты заказа.
 *                   delivery_date:
 *                     type: string
 *                     format: date-time
 *                     description: Дата и время доставки заказа.
 *                   totalPrice:
 *                     type: number
 *                     format: float
 *                     description: Общая стоимость заказа.
 *                   productImage:
 *                     type: string
 *                     description: URL изображения товара.
 *                   productName:
 *                     type: string
 *                     description: Название товара.
 *                   quantity:
 *                     type: integer
 *                     description: Количество товаров в заказе.
 *       401:
 *         description: Ошибка аутентификации. Токен не предоставлен.
 *       500:
 *         description: Внутренняя ошибка сервера. Не удалось получить данные об оплаченных заказах.
 */

app.get("/api/orders-history", async (req, res) => {
  // Получение токена и его проверка
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Токен не предоставлен" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({
        message: "Ошибка при декодировании токена: отсутствует userId",
      });
    }

    // Запрос к базе данных для получения истории заказов
    const query = `
      SELECT o.order_id, o.payment_date, o.delivery_date, o.total AS totalPrice,
             p.imageUrl AS productImage, p.name AS productName,
             op.quantity
      FROM orders o
      JOIN order_items_paid op ON o.order_id = op.order_id
      JOIN products p ON op.product_id = p.product_id
      WHERE o.user_id = ?
      ORDER BY o.payment_date DESC
    `;

    const [ordersHistory] = await pool.query(query, [userId]);
    res.json(ordersHistory);
  } catch (error) {
    console.error("Ошибка при получении истории заказов: ", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log(`Сервер запущен на ${baseUrl}:3000`);
});
