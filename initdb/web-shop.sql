CREATE DATABASE  IF NOT EXISTS `web_shop` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `web_shop`;
-- MySQL dump 10.13  Distrib 8.0.36, for macos14 (arm64)
--
-- Host: localhost    Database: web_shop
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `card_info`
--

DROP TABLE IF EXISTS `card_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_info` (
  `card_id` smallint NOT NULL AUTO_INCREMENT,
  `card_type` varchar(50) DEFAULT NULL,
  `expiry_month` int DEFAULT NULL,
  `expiry_year` int DEFAULT NULL,
  `cvv` int DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `card_code` char(16) DEFAULT NULL,
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card_info`
--

LOCK TABLES `card_info` WRITE;
/*!40000 ALTER TABLE `card_info` DISABLE KEYS */;
INSERT INTO `card_info` VALUES (1,'VISA',12,26,123,1846.00,'valid','8820354696467284'),(2,'MasterCard',12,26,456,1597.00,'valid','5248106661644884'),(3,'VISA',1,20,789,2000.00,'expired','4340511554108849'),(4,'MasterCard',1,20,101,2000.00,'expired20','0307328035514696'),(5,'VISA',6,26,234,2000.00,'stolen','0779330784258313'),(6,'MasterCard',6,26,567,2000.00,'stolen','1151842195999505'),(7,'VISA',12,26,890,0.00,'valid','7178218557247775'),(8,'MasterCard',12,26,112,0.00,'valid','3320643190265792'),(9,'VISA',12,26,0,2000.00,'blocked','9181347306820824'),(10,'MasterCard',12,26,0,2000.00,'blocked','6107972359241284');
/*!40000 ALTER TABLE `card_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `cart_item_id` smallint NOT NULL AUTO_INCREMENT,
  `user_id` smallint DEFAULT NULL,
  `product_id` smallint DEFAULT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`cart_item_id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=982 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (981,6,31,1);
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` smallint NOT NULL,
  `product_id` smallint NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=750 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items_paid`
--

DROP TABLE IF EXISTS `order_items_paid`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items_paid` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` smallint NOT NULL,
  `order_id` smallint NOT NULL,
  `product_id` smallint NOT NULL,
  `quantity` smallint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_paid_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `order_items_paid_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  CONSTRAINT `order_items_paid_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items_paid`
--

LOCK TABLES `order_items_paid` WRITE;
/*!40000 ALTER TABLE `order_items_paid` DISABLE KEYS */;
INSERT INTO `order_items_paid` VALUES (1,6,209,4,1),(2,6,211,4,1),(3,6,222,27,1),(4,6,223,4,1),(5,6,224,4,1),(6,6,224,27,1),(7,6,224,18,1),(8,6,225,4,1),(9,6,226,4,1),(10,6,227,4,1),(11,6,228,4,1),(12,6,229,4,1),(13,6,230,4,1),(14,6,231,4,1),(15,6,236,4,1),(16,6,253,4,2),(17,6,256,4,1),(18,6,257,27,1),(19,6,264,31,3),(20,6,265,31,1),(21,6,266,4,1),(22,6,274,49,3),(23,6,275,31,1),(24,6,285,27,1);
/*!40000 ALTER TABLE `order_items_paid` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `order_id` smallint NOT NULL AUTO_INCREMENT,
  `user_id` smallint DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `delivery_date` datetime DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`order_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=286 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (204,6,'paid','2024-02-29 23:18:52','2024-03-05 23:18:52',1127.00),(205,6,'paid','2024-02-29 23:19:56','2024-03-05 23:19:56',1477.00),(207,6,'paid','2024-02-29 23:28:23','2024-03-05 23:28:23',149.00),(209,6,'paid','2024-03-01 11:28:41','2024-03-06 11:28:41',149.00),(211,6,'paid','2024-03-01 11:34:20','2024-03-06 11:34:20',149.00),(222,6,'paid','2024-03-01 13:36:17','2024-03-06 13:36:17',403.00),(223,6,'paid','2024-03-01 13:36:17','2024-03-06 13:36:17',149.00),(224,6,'paid','2024-03-01 14:38:19','2024-03-06 14:38:19',702.00),(225,6,'paid','2024-03-01 15:53:58','2024-03-06 15:53:58',149.00),(226,6,'paid','2024-03-01 15:54:11','2024-03-06 15:54:11',149.00),(227,6,'paid','2024-03-01 15:54:21','2024-03-06 15:54:21',149.00),(228,6,'paid','2024-03-01 15:55:08','2024-03-06 15:55:08',149.00),(229,6,'paid','2024-03-01 15:55:08','2024-03-06 15:55:08',149.00),(230,6,'paid','2024-03-01 15:55:32','2024-03-06 15:55:32',149.00),(231,6,'paid','2024-03-01 15:55:42','2024-03-06 15:55:42',149.00),(236,6,'paid','2024-03-01 18:43:43','2024-03-06 18:43:43',149.00),(253,6,'paid','2024-03-01 21:04:04','2024-03-06 21:04:04',298.00),(256,6,'paid','2024-03-01 21:18:56','2024-03-06 21:18:56',149.00),(257,6,'paid','2024-03-01 21:20:08','2024-03-06 21:20:08',403.00),(264,6,'paid','2024-03-02 10:01:21','2024-03-07 10:01:21',3381.00),(265,6,'paid','2024-03-02 10:02:10','2024-03-07 10:02:10',1127.00),(266,6,'paid','2024-03-02 10:18:37','2024-03-07 10:18:37',149.00),(274,6,'paid','2024-03-02 14:54:43','2024-03-07 14:54:43',4431.00),(275,6,'paid','2024-03-02 15:38:33','2024-03-07 15:38:33',1127.00),(285,6,'paid','2024-03-02 23:30:47','2024-03-07 23:30:47',403.00);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders_total`
--

DROP TABLE IF EXISTS `orders_total`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders_total` (
  `user_id` smallint NOT NULL,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `orders_total_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders_total`
--

LOCK TABLES `orders_total` WRITE;
/*!40000 ALTER TABLE `orders_total` DISABLE KEYS */;
INSERT INTO `orders_total` VALUES (6,0.00);
/*!40000 ALTER TABLE `orders_total` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paypal_info`
--

DROP TABLE IF EXISTS `paypal_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paypal_info` (
  `paypal_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`paypal_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paypal_info`
--

LOCK TABLES `paypal_info` WRITE;
/*!40000 ALTER TABLE `paypal_info` DISABLE KEYS */;
INSERT INTO `paypal_info` VALUES (1,'valid@email.com',8309.00,'valid'),(2,'invalid@@email.com',0.00,'invalid'),(3,'blocked@email.com',523.00,'blocked');
/*!40000 ALTER TABLE `paypal_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` smallint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `freeShipping` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Huawei iPhone 19','Описание для Huawei iPhone 19',50.00,'Phones','Huawei','/images/phone.webp',1),(2,'Samsung Active 5','Описание для Samsung Active 5',518.00,'Watches','Samsung','/images/watches.webp',0),(3,'Samsung Air 12','Описание для Samsung Air 12',1289.00,'Laptops','Samsung','/images/laptop.webp',0),(4,'Apple Fit 20','Описание для Apple Fit 20',149.00,'Watches','Apple','/images/watches.webp',0),(5,'Samsung Book 2','Описание для Samsung Book 2',454.00,'Laptops','Samsung','/images/laptop.webp',1),(6,'Apple Gaming 10','Описание для Apple Gaming 10',1010.00,'Laptops','Apple','/images/laptop.webp',0),(7,'Samsung P30 19','Описание для Samsung P30 19',306.00,'Phones','Samsung','/images/phone.webp',0),(8,'Huawei Book 2','Описание для Huawei Book 2',659.00,'Laptops','Huawei','/images/laptop.webp',0),(9,'Xiaomi Watch 8','Описание для Xiaomi Watch 8',1080.00,'Watches','Xiaomi','/images/watches.webp',0),(10,'Huawei Note 10','Описание для Huawei Note 10',93.00,'Phones','Huawei','/images/phone.webp',0),(11,'Samsung Gear 18','Описание для Samsung Gear 18',920.00,'Watches','Samsung','/images/watches.webp',0),(12,'Samsung Band 5','Описание для Samsung Band 5',878.00,'Watches','Samsung','/images/watches.webp',0),(13,'Samsung Gear 3','Описание для Samsung Gear 3',869.00,'Watches','Samsung','/images/watches.webp',1),(14,'Samsung Band 18','Описание для Samsung Band 18',212.00,'Watches','Samsung','/images/watches.webp',0),(15,'Apple Ultra 20','Описание для Apple Ultra 20',689.00,'Laptops','Apple','/images/laptop.webp',0),(16,'Xiaomi Note 17','Описание для Xiaomi Note 17',451.00,'Phones','Xiaomi','/images/phone.webp',0),(17,'Xiaomi Band 10','Описание для Xiaomi Band 10',849.00,'Watches','Xiaomi','/images/watches.webp',1),(18,'Apple Gaming 15','Описание для Apple Gaming 15',150.00,'Laptops','Apple','/images/laptop.webp',0),(19,'Huawei Fit 3','Описание для Huawei Fit 3',780.00,'Watches','Huawei','/images/watches.webp',0),(20,'Huawei Active 10','Описание для Huawei Active 10',550.00,'Watches','Huawei','/images/watches.webp',1),(21,'Huawei iPhone 8','Описание для Huawei iPhone 8',631.00,'Phones','Huawei','/images/phone.webp',1),(22,'Apple Studio 6','Описание для Apple Studio 6',579.00,'Laptops','Apple','/images/laptop.webp',1),(23,'Huawei Note 12','Описание для Huawei Note 12',1038.00,'Phones','Huawei','/images/phone.webp',0),(24,'Samsung Mi 10','Описание для Samsung Mi 10',1014.00,'Phones','Samsung','/images/phone.webp',0),(25,'Xiaomi iPhone 7','Описание для Xiaomi iPhone 7',1167.00,'Phones','Xiaomi','/images/phone.webp',0),(26,'Samsung Ultra 3','Описание для Samsung Ultra 3',1116.00,'Laptops','Samsung','/images/laptop.webp',1),(27,'Apple Galaxy 12','Описание для Apple Galaxy 12',403.00,'Phones','Apple','/images/phone.webp',1),(28,'Xiaomi Galaxy 3','Описание для Xiaomi Galaxy 3',1452.00,'Phones','Xiaomi','/images/phone.webp',1),(29,'Xiaomi Note 19','Описание для Xiaomi Note 19',339.00,'Phones','Xiaomi','/images/phone.webp',0),(30,'Huawei Mi 3','Описание для Huawei Mi 3',849.00,'Phones','Huawei','/images/phone.webp',0),(31,'Apple Fit 12','Описание для Apple Fit 12',1127.00,'Watches','Apple','/images/watches.webp',1),(32,'Huawei Galaxy 5','Описание для Huawei Galaxy 5',1382.00,'Phones','Huawei','/images/phone.webp',0),(33,'Huawei Air 16','Описание для Huawei Air 16',1286.00,'Laptops','Huawei','/images/laptop.webp',0),(34,'Huawei P30 9','Описание для Huawei P30 9',1010.00,'Phones','Huawei','/images/phone.webp',1),(35,'Xiaomi iPhone 6','Описание для Xiaomi iPhone 6',902.00,'Phones','Xiaomi','/images/phone.webp',0),(36,'Samsung P30 2','Описание для Samsung P30 2',65.00,'Phones','Samsung','/images/phone.webp',0),(37,'Huawei Mi 5','Описание для Huawei Mi 5',1434.00,'Phones','Huawei','/images/phone.webp',1),(38,'Huawei Active 8','Описание для Huawei Active 8',90.00,'Watches','Huawei','/images/watches.webp',1),(39,'Apple Studio 20','Описание для Apple Studio 20',349.00,'Laptops','Apple','/images/laptop.webp',0),(40,'Apple iPhone 11','Описание для Apple iPhone 11',822.00,'Phones','Apple','/images/phone.webp',1),(41,'Samsung Air 19','Описание для Samsung Air 19',487.00,'Laptops','Samsung','/images/laptop.webp',0),(42,'Apple Ultra 4','Описание для Apple Ultra 4',675.00,'Laptops','Apple','/images/laptop.webp',1),(43,'Xiaomi Pro 9','Описание для Xiaomi Pro 9',977.00,'Laptops','Xiaomi','/images/laptop.webp',1),(44,'Xiaomi Pro 4','Описание для Xiaomi Pro 4',1284.00,'Laptops','Xiaomi','/images/laptop.webp',0),(45,'Huawei Mi 1','Описание для Huawei Mi 1',1313.00,'Phones','Huawei','/images/phone.webp',0),(46,'Apple iPhone 11','Описание для Apple iPhone 11',312.00,'Phones','Apple','/images/phone.webp',1),(47,'Huawei Book 3','Описание для Huawei Book 3',393.00,'Laptops','Huawei','/images/laptop.webp',0),(48,'Apple Watch 11','Описание для Apple Watch 11',1196.00,'Watches','Apple','/images/watches.webp',1),(49,'Apple Fit 10','Описание для Apple Fit 10',1477.00,'Watches','Apple','/images/watches.webp',1),(50,'Huawei Mi 3','Описание для Huawei Mi 3',293.00,'Phones','Huawei','/images/phone.webp',0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` smallint NOT NULL AUTO_INCREMENT,
  `login` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (4,'password2','password1',NULL),(5,'pass','password1',NULL),(6,'password1','password1','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzA5NTY0MDIzLCJleHAiOjE3MTgyMDQwMjN9.r996pvE80Zg_M2jdBW8uOMzLvttoQ6WD1t4hbhtQF28'),(7,'password4324','password4324',NULL),(8,'passwor11','password11',NULL),(9,'password555','password555',NULL),(10,'password222','password222',NULL),(11,'password333','password333','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MDg5NTcwMjgsImV4cCI6MTcwOTA0MzQyOH0.Gzq_9Efnyf9i8CCuSgmREo_nu5R3J4MBtit3cd4OEHk'),(12,'password2222','password2222','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImlhdCI6MTcwODk1OTAyNCwiZXhwIjoxNzA5MDQ1NDI0fQ.bOz5KvwT98LeoLNTXWsndtjndW9bCj2CstxZZqUmshQ'),(13,'sdfsgfs','password2222',NULL),(14,'ewrtwrwerrwe','wrwererw3333',NULL),(15,'password600','password600',NULL),(16,'password6005','password600',NULL),(17,'passwo','password600',NULL),(18,'password11','password1',NULL),(19,'password55555','password55555',NULL),(20,'password12345','password12345','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjAsImlhdCI6MTcwOTA1OTU4NywiZXhwIjoxNzA5MTQ1OTg3fQ.wvmGn1JPDoxp5bkGa7Xo1aSZQ77fVFvLV8Zv_5Jc838');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-03-05  1:16:38
