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




