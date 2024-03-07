# Используем базовый образ Node.js
FROM node:14

# Устанавливаем рабочую директорию в контейнере
WORKDIR /usr/src/app

# Копируем файлы package.json и package-lock.json в текущую директорию
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы из текущей директории в рабочую директорию в контейнере
COPY . .

# Указываем порт, который будет прослушивать приложение
EXPOSE 3000

# Устанавливаем переменную окружения BASE_URL
ENV BASE_URL=http://localhost

# Изменяем конфигурацию БД перед запуском
RUN sed -i "s#host: \"185.251.91.112\"#host: \"mysql\"#g" ./config/dbConfig.js

# Изменяем файлы HTML перед запуском
RUN sh -c "find . -name '*.html' -type f -exec sed -i 's#window.baseUrl = \"\";#window.baseUrl = \"${BASE_URL}\";#g' {} +"

# Изменяем файл server.js перед запуском
RUN sed -i "s#const baseUrl = 'http://localhost';#const baseUrl = '${BASE_URL}';#g" ./server/server.js

# Команда, которая будет запущена при запуске контейнера
CMD ["node", "./server/server.js"]