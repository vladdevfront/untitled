import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Получить пары
export const getCviky = async () => {
    const response = await axios.get(`${API_URL}/cviky`);
    return response.data;
};

// Получить студентов
export const getStudents = async () => {
    const response = await axios.get(`${API_URL}/students`);
    return response.data;
};

// Добавить студента
export const addStudentToCviky = async ({ isic, first_name, last_name, cviky_id }) => {
    if (!first_name || !last_name) {
        throw new Error("Имя и фамилия обязательны для добавления студента.");
    }

    return await axios.post(`${API_URL}/students`, {
        isic,
        first_name,
        last_name,
        cviky_id,
    });
};


// Обновить присутствие
export const updateStudentPresence = async (id, present) => {
    const response = await axios.put(`${API_URL}/students/${id}`, { present });
    return response.data;
};
