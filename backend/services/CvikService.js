import db from '../database.js';


export const getPairs = async () => {
    const result = await db.query('SELECT * FROM cviky');
    return result.rows;
};

export const addPair = async (day_name, time_start, time_end) => {
    const result = await db.query(
        'INSERT INTO cviky (day_name, time_start, time_end) VALUES ($1, $2, $3) RETURNING *',
        [day_name, time_start, time_end]
    );
    return result.rows[0];
};

export const updatePair = async (id, day_name, time_start, time_end) => {
    const result = await db.query(
        'UPDATE cviky SET day_name = $1, time_start = $2, time_end = $3 WHERE id = $4 RETURNING *',
        [day_name, time_start, time_end, id]
    );
    return result.rows[0];
};

export const deletePair = async (id) => {
    await db.query('DELETE FROM cviky WHERE id = $1', [id]);
};


