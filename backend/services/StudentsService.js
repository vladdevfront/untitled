import db from '../database.js';


export const getStudents = async () => {
    const result = await db.query('SELECT * FROM studenty');
    return result.rows;
};

export const addStudent = async (isic, firstName, lastName, cvikyId) => {
    const query = `
        INSERT INTO studenty (isic, first_name, last_name, cviky_id, present)
        VALUES ($1, $2, $3, $4, FALSE)
        RETURNING *;
    `;
    const result = await db.query(query, [isic, firstName, lastName, cvikyId]);
    return result.rows[0];
};


export const deleteStudent = async (id) => {
    await db.query('DELETE FROM studenty WHERE id = $1', [id]);
};

export const updateStudentPresence = async (id, present) => {
    const result = await db.query(
        'UPDATE studenty SET present = $1 WHERE id = $2 RETURNING *',
        [present, id]
    );
    return result.rows[0];
};

export const deleteAllStudents = async (cvikyId) => {
    const query = "DELETE FROM studenty WHERE cviky_id = $1;";
    await db.query(query, [cvikyId]);
};

export const updatedStudents = async (cvikyId) => {
    const query = "SELECT * FROM studenty WHERE cviky_id = $1;";
    try {
        const result = await db.query(query, [cvikyId]);
        return result.rows; // Возвращаем массив строк из результата
    } catch (error) {
        console.error("Ошибка выполнения запроса:", error.message);
        throw error; // Пробрасываем ошибку для обработки в вызывающем коде
    }
};

export const getAttendanceByStudentId = async (studentId) => {
    try {
        console.log('Параметр student_id для SQL-запроса:', studentId); // Логируем параметр
        const result = await db.query(
            'SELECT * FROM attendance_weeks WHERE student_id = $1 ORDER BY week_number ASC',
            [studentId]
        );
        console.log('Результат SQL-запроса:', result.rows); // Логируем результат
        return result.rows;
    } catch (error) {
        console.error('Ошибка получения данных о посещаемости:', error.message);
        throw new Error('Не удалось получить данные о посещаемости.');
    }
};

export const updateAttendance = async (studentIsic, weekNumber, attended) => {
    try {
        const result = await db.query(
            `
            INSERT INTO attendance_weeks (student_id, week_number, attended)
            VALUES ($1, $2, $3)
            ON CONFLICT (student_id, week_number)
            DO UPDATE SET attended = $3
            RETURNING *;
            `,
            [studentIsic, weekNumber, attended]
        );
        console.log("Данные запроса:", result.rows[0]);

        return result.rows[0]; // Возвращаем обновленные данные
    } catch (error) {
        console.error('Ошибка обновления данных о посещаемости:', error.message);
        throw new Error('Не удалось обновить данные о посещаемости.');
    }
};






