# Используем официальный образ Python
FROM python:3.9

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем зависимости
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект
COPY . .

# Команда для запуска
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]