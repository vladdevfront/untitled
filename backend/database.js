import pg from 'pg';

const { Pool } = pg;

// Настройки подключения
const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


// Экспортируем объект для выполнения запросов
export default {
    query: (text, params) => pool.query(text, params), // Обертка для выполнения SQL-запросов
};
