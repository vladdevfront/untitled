import pg from 'pg';

const { Pool } = pg;

// Настройки подключения
const pool = new Pool({
    user: 'postgres',          // Имя пользователя PostgreSQL
    host: 'localhost',         // Адрес сервера базы данных
    database: 'attendance_system', // Имя базы данных
    password: '228325602',     // Пароль пользователя
    port: 5432,                // Порт PostgreSQL (по умолчанию 5432)
});

// Экспортируем объект для выполнения запросов
export default {
    query: (text, params) => pool.query(text, params), // Обертка для выполнения SQL-запросов
};
