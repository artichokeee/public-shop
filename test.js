const products = [
  {
    id: 1,
    name: "Huawei iPhone 19",
    description: "Описание для Huawei iPhone 19",
    price: 50,
    category: "Смартфоны",
    manufacturer: "Huawei",
    freeShipping: true,
    imageUrl: "media/phone.webp",
  },
  {
    id: 2,
    name: "Samsung Active 5",
    description: "Описание для Samsung Active 5",
    price: 518,
    category: "Умные часы",
    manufacturer: "Samsung",
    freeShipping: false,
    imageUrl: "url_to_image_2.jpg",
  },
  {
    id: 3,
    name: "Samsung Air 12",
    description: "Описание для Samsung Air 12",
    price: 1289,
    category: "Компьютеры",
    manufacturer: "Samsung",
    freeShipping: false,
    imageUrl: "url_to_image_3.jpg",
  },
  {
    id: 4,
    name: "Apple Fit 20",
    description: "Описание для Apple Fit 20",
    price: 149,
    category: "Умные часы",
    manufacturer: "Apple",
    freeShipping: false,
    imageUrl: "url_to_image_4.jpg",
  },
  {
    id: 5,
    name: "Samsung Book 2",
    description: "Описание для Samsung Book 2",
    price: 454,
    category: "Компьютеры",
    manufacturer: "Samsung",
    freeShipping: true,
    imageUrl: "url_to_image_5.jpg",
  },
  {
    id: 6,
    name: "Apple Gaming 10",
    description: "Описание для Apple Gaming 10",
    price: 1010,
    category: "Компьютеры",
    manufacturer: "Apple",
    freeShipping: false,
    imageUrl: "url_to_image_6.jpg",
  },
  {
    id: 7,
    name: "Samsung P30 19",
    description: "Описание для Samsung P30 19",
    price: 306,
    category: "Смартфоны",
    manufacturer: "Samsung",
    freeShipping: false,
    imageUrl: "url_to_image_7.jpg",
  },
  {
    id: 8,
    name: "Huawei Book 2",
    description: "Описание для Huawei Book 2",
    price: 659,
    category: "Компьютеры",
    manufacturer: "Huawei",
    freeShipping: false,
    imageUrl: "url_to_image_8.jpg",
  },
  {
    id: 9,
    name: "Xiaomi Watch 8",
    description: "Описание для Xiaomi Watch 8",
    price: 1080,
    category: "Умные часы",
    manufacturer: "Xiaomi",
    freeShipping: false,
    imageUrl: "url_to_image_9.jpg",
  },
  {
    id: 10,
    name: "Huawei Note 10",
    description: "Описание для Huawei Note 10",
    price: 93,
    category: "Смартфоны",
    manufacturer: "Huawei",
    freeShipping: false,
    imageUrl: "url_to_image_10.jpg",
  },
  {
    id: 11,
    name: "Samsung Gear 18",
    description: "Описание для Samsung Gear 18",
    price: 920,
    category: "Умные часы",
    manufacturer: "Samsung",
    freeShipping: false,
    imageUrl: "url_to_image_11.jpg",
  },
  {
    id: 12,
    name: "Samsung Band 5",
    description: "Описание для Samsung Band 5",
    price: 878,
    category: "Умные часы",
    manufacturer: "Samsung",
    freeShipping: false,
    imageUrl: "url_to_image_12.jpg",
  },
  {
    id: 13,
    name: "Samsung Gear 3",
    description: "Описание для Samsung Gear 3",
    price: 869,
    category: "Умные часы",
    manufacturer: "Samsung",
    freeShipping: true,
    imageUrl: "url_to_image_13.jpg",
  },
  {
    id: 14,
    name: "Samsung Band 18",
    description: "Описание для Samsung Band 18",
    price: 212,
    category: "Умные часы",
    manufacturer: "Samsung",
    freeShipping: false,
    imageUrl: "url_to_image_14.jpg",
  },
  {
    id: 15,
    name: "Apple Ultra 20",
    description: "Описание для Apple Ultra 20",
    price: 689,
    category: "Компьютеры",
    manufacturer: "Apple",
    freeShipping: false,
    imageUrl: "url_to_image_15.jpg",
  },
  {
    id: 16,
    name: "Xiaomi Note 17",
    description: "Описание для Xiaomi Note 17",
    price: 451,
    category: "Смартфоны",
    manufacturer: "Xiaomi",
    freeShipping: false,
    imageUrl: "url_to_image_16.jpg",
  },
  {
    id: 17,
    name: "Xiaomi Band 10",
    description: "Описание для Xiaomi Band 10",
    price: 849,
    category: "Умные часы",
    manufacturer: "Xiaomi",
    freeShipping: true,
    imageUrl: "url_to_image_17.jpg",
  },
  {
    id: 18,
    name: "Apple Gaming 15",
    description: "Описание для Apple Gaming 15",
    price: 150,
    category: "Компьютеры",
    manufacturer: "Apple",
    freeShipping: false,
    imageUrl: "url_to_image_18.jpg",
  },
  {
    id: 19,
    name: "Huawei Fit 3",
    description: "Описание для Huawei Fit 3",
    price: 780,
    category: "Умные часы",
    manufacturer: "Huawei",
    freeShipping: false,
    imageUrl: "url_to_image_19.jpg",
  },
  {
    id: 20,
    name: "Huawei Active 10",
    description: "Описание для Huawei Active 10",
    price: 550,
    category: "Умные часы",
    manufacturer: "Huawei",
    freeShipping: true,
    imageUrl: "url_to_image_20.jpg",
  },
  {
    id: 21,
    name: "Huawei iPhone 8",
    description: "Описание для Huawei iPhone 8",
    price: 631,
    category: "Смартфоны",
    manufacturer: "Huawei",
    freeShipping: true,
    imageUrl: "url_to_image_21.jpg",
  },
  {
    id: 22,
    name: "Apple Studio 6",
    description: "Описание для Apple Studio 6",
    price: 579,
    category: "Компьютеры",
    manufacturer: "Apple",
    freeShipping: true,
    imageUrl: "url_to_image_22.jpg",
  },
  {
    id: 23,
    name: "Huawei Note 12",
    description: "Описание для Huawei Note 12",
    price: 1038,
    category: "Смартфоны",
    manufacturer: "Huawei",
    freeShipping: false,
    imageUrl: "url_to_image_23.jpg",
  },
  {
    id: 24,
    name: "Samsung Mi 10",
    description: "Описание для Samsung Mi 10",
    price: 1014,
    category: "Смартфоны",
    manufacturer: "Samsung",
    freeShipping: false,
    imageUrl: "url_to_image_24.jpg",
  },
  {
    id: 25,
    name: "Xiaomi iPhone 7",
    description: "Описание для Xiaomi iPhone 7",
    price: 1167,
    category: "Смартфоны",
    manufacturer: "Xiaomi",
    freeShipping: false,
    imageUrl: "url_to_image_25.jpg",
  },
  {
    id: 26,
    name: "Samsung Ultra 3",
    description: "Описание для Samsung Ultra 3",
    price: 1116,
    category: "Компьютеры",
    manufacturer: "Samsung",
    freeShipping: true,
    imageUrl: "url_to_image_26.jpg",
  },
  {
    id: 27,
    name: "Apple Galaxy 12",
    description: "Описание для Apple Galaxy 12",
    price: 403,
    category: "Смартфоны",
    manufacturer: "Apple",
    freeShipping: true,
    imageUrl: "url_to_image_27.jpg",
  },
  {
    id: 28,
    name: "Xiaomi Galaxy 3",
    description: "Описание для Xiaomi Galaxy 3",
    price: 1452,
    category: "Смартфоны",
    manufacturer: "Xiaomi",
    freeShipping: true,
    imageUrl: "url_to_image_28.jpg",
  },
  {
    id: 29,
    name: "Xiaomi Note 19",
    description: "Описание для Xiaomi Note 19",
    price: 339,
    category: "Смартфоны",
    manufacturer: "Xiaomi",
    freeShipping: false,
    imageUrl: "url_to_image_29.jpg",
  },
  {
    id: 30,
    name: "Huawei Mi 3",
    description: "Описание для Huawei Mi 3",
    price: 849,
    category: "Смартфоны",
    manufacturer: "Huawei",
    freeShipping: false,
    imageUrl: "url_to_image_30.jpg",
  },
  {
    id: 31,
    name: "Apple Fit 12",
    description: "Описание для Apple Fit 12",
    price: 1127,
    category: "Умные часы",
    manufacturer: "Apple",
    freeShipping: true,
    imageUrl: "url_to_image_31.jpg",
  },
  {
    id: 32,
    name: "Huawei Galaxy 5",
    description: "Описание для Huawei Galaxy 5",
    price: 1382,
    category: "Смартфоны",
    manufacturer: "Huawei",
    freeShipping: false,
    imageUrl: "url_to_image_32.jpg",
  },
  {
    id: 33,
    name: "Huawei Air 16",
    description: "Описание для Huawei Air 16",
    price: 1286,
    category: "Компьютеры",
    manufacturer: "Huawei",
    freeShipping: false,
    imageUrl: "url_to_image_33.jpg",
  },
  {
    id: 34,
    name: "Huawei P30 9",
    description: "Описание для Huawei P30 9",
    price: 1010,
    category: "Смартфоны",
    manufacturer: "Huawei",
    freeShipping: true,
    imageUrl: "url_to_image_34.jpg",
  },
  {
    id: 35,
    name: "Xiaomi iPhone 6",
    description: "Описание для Xiaomi iPhone 6",
    price: 902,
    category: "Смартфоны",
    manufacturer: "Xiaomi",
    freeShipping: false,
    imageUrl: "url_to_image_35.jpg",
  },
  {
    id: 36,
    name: "Samsung P30 2",
    description: "Описание для Samsung P30 2",
    price: 65,
    category: "Смартфоны",
    manufacturer: "Samsung",
    freeShipping: false,
    imageUrl: "url_to_image_36.jpg",
  },
  {
    id: 37,
    name: "Huawei Mi 5",
    description: "Описание для Huawei Mi 5",
    price: 1434,
    category: "Смартфоны",
    manufacturer: "Huawei",
    freeShipping: true,
    imageUrl: "url_to_image_37.jpg",
  },
  {
    id: 38,
    name: "Huawei Active 8",
    description: "Описание для Huawei Active 8",
    price: 90,
    category: "Умные часы",
    manufacturer: "Huawei",
    freeShipping: true,
    imageUrl: "url_to_image_38.jpg",
  },
  {
    id: 39,
    name: "Apple Studio 20",
    description: "Описание для Apple Studio 20",
    price: 349,
    category: "Компьютеры",
    manufacturer: "Apple",
    freeShipping: false,
    imageUrl: "url_to_image_39.jpg",
  },
  {
    id: 40,
    name: "Apple iPhone 11",
    description: "Описание для Apple iPhone 11",
    price: 822,
    category: "Смартфоны",
    manufacturer: "Apple",
    freeShipping: true,
    imageUrl: "url_to_image_40.jpg",
  },
  {
    id: 41,
    name: "Samsung Air 19",
    description: "Описание для Samsung Air 19",
    price: 487,
    category: "Компьютеры",
    manufacturer: "Samsung",
    freeShipping: false,
    imageUrl: "url_to_image_41.jpg",
  },
  {
    id: 42,
    name: "Apple Ultra 4",
    description: "Описание для Apple Ultra 4",
    price: 675,
    category: "Компьютеры",
    manufacturer: "Apple",
    freeShipping: true,
    imageUrl: "url_to_image_42.jpg",
  },
  {
    id: 43,
    name: "Xiaomi Pro 9",
    description: "Описание для Xiaomi Pro 9",
    price: 977,
    category: "Компьютеры",
    manufacturer: "Xiaomi",
    freeShipping: true,
    imageUrl: "url_to_image_43.jpg",
  },
  {
    id: 44,
    name: "Xiaomi Pro 4",
    description: "Описание для Xiaomi Pro 4",
    price: 1284,
    category: "Компьютеры",
    manufacturer: "Xiaomi",
    freeShipping: false,
    imageUrl: "url_to_image_44.jpg",
  },
  {
    id: 45,
    name: "Huawei Mi 1",
    description: "Описание для Huawei Mi 1",
    price: 1313,
    category: "Смартфоны",
    manufacturer: "Huawei",
    freeShipping: false,
    imageUrl: "url_to_image_45.jpg",
  },
  {
    id: 46,
    name: "Apple iPhone 11",
    description: "Описание для Apple iPhone 11",
    price: 312,
    category: "Смартфоны",
    manufacturer: "Apple",
    freeShipping: true,
    imageUrl: "url_to_image_46.jpg",
  },
  {
    id: 47,
    name: "Huawei Book 3",
    description: "Описание для Huawei Book 3",
    price: 393,
    category: "Компьютеры",
    manufacturer: "Huawei",
    freeShipping: false,
    imageUrl: "url_to_image_47.jpg",
  },
  {
    id: 48,
    name: "Apple Watch 11",
    description: "Описание для Apple Watch 11",
    price: 1196,
    category: "Умные часы",
    manufacturer: "Apple",
    freeShipping: true,
    imageUrl: "url_to_image_48.jpg",
  },
  {
    id: 49,
    name: "Apple Fit 10",
    description: "Описание для Apple Fit 10",
    price: 1477,
    category: "Умные часы",
    manufacturer: "Apple",
    freeShipping: true,
    imageUrl: "url_to_image_49.jpg",
  },
  {
    id: 50,
    name: "Huawei Mi 3",
    description: "Описание для Huawei Mi 3",
    price: 293,
    category: "Смартфоны",
    manufacturer: "Huawei",
    freeShipping: false,
    imageUrl: "url_to_image_50.jpg",
  },
];

function updateImageUrls(products) {
  products.forEach((product) => {
    switch (product.category) {
      case "Смартфоны":
        product.imageUrl = "media/phone.webp";
        break;
      case "Умные часы":
        product.imageUrl = "media/watches.webp";
        break;
      case "Компьютеры":
        product.imageUrl = "media/laptop.webp";
        break;
      default:
        // Если категория не соответствует ни одной из указанных, можно оставить imageUrl как есть или обновить его как-то иначе
        break;
    }
  });
  return products;
}

// Используйте эту функцию для обновления изображений в вашем массиве products
// Предполагается, что у вас уже есть массив products
const updatedProducts = updateImageUrls(products);
console.log(updatedProducts);
