import pg from 'pg';

const { Pool } = pg;

// Настройки подключения
const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "228325602",
    database: "attendance_system",
});


// Экспортируем объект для выполнения запросов
export default {
    query: (text, params) => pool.query(text, params), // Обертка для выполнения SQL-запросов
};
