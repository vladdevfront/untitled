import bcrypt from 'bcrypt';
import pool from '../database.js';

export const findUserByLogin = async (login) => {
    const result = await pool.query(`SELECT * FROM users WHERE login = $1`, [login]);
    return result.rows[0];
};

export const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
