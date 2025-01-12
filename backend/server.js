import express from 'express';
import { getPairs, addPair, updatePair, deletePair } from './services/CvikService.js';
import {
    getStudents,
    addStudent,
    deleteStudent,
    updateStudentPresence,
    deleteAllStudents,
} from './services/StudentsService.js';
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Сервер работает!');
});

// Получить все пары
app.get('/cviky', async (req, res) => {
    console.log('Получен запрос на /cviky');
    try {
        const pairs = await getPairs();
        res.status(200).json(pairs);
    } catch (err) {
        console.error('Ошибка при получении пар:', err);
        res.status(500).send('Ошибка сервера');
    }
});


// Добавить новую пару
app.post('/cviky', async (req, res) => {
    const { day_name, time_start, time_end } = req.body;
    try {
        const newPair = await addPair(day_name, time_start, time_end);
        res.status(201).json(newPair);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Ошибка сервера');
    }
});

// Обновить пару
app.put('/cviky/:id', async (req, res) => {
    const { id } = req.params;
    const { day_name, time_start, time_end } = req.body;
    try {
        const updatedPair = await updatePair(id, day_name, time_start, time_end);
        res.status(200).json(updatedPair);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Ошибка сервера');
    }
});

// Удалить пару
app.delete('/cviky/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await deletePair(id);
        res.status(204).send(); // Успешное удаление
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Ошибка сервера');
    }
});


// Получить всех студентов
app.get('/students', async (req, res) => {
    try {
        const students = await getStudents();
        res.status(200).json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Ошибка сервера');
    }
});

// Добавить студента
app.post("/students", async (req, res) => {
    const { isic, first_name, last_name, cviky_id } = req.body;

    try {
        const newStudent = await addStudent(isic, first_name, last_name, cviky_id);
        res.status(201).json(newStudent);
    } catch (error) {
        console.error("Ошибка добавления студента:", error.message);
        res.status(500).send("Ошибка сервера");
    }
});


// Удалить студента
app.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await deleteStudent(id);
        res.status(204).send();
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Ошибка сервера');
    }
});

// Обновить присутствие студента
app.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const { present } = req.body;
    try {
        const updatedStudent = await updateStudentPresence(id, present);
        res.status(200).json(updatedStudent);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Ошибка сервера');
    }
});

app.delete("/students/by-cviky/:cvikyId", async (req, res) => {
    const { cvikyId } = req.params;

    try {
        await deleteAllStudents(cvikyId);
        res.status(204).send(); // Успешно, без содержимого
    } catch (error) {
        console.error("Ошибка удаления студентов:", error.message);
        res.status(500).send("Ошибка сервера");
    }
});
