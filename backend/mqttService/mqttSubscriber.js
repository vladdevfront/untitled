import mqtt from 'mqtt';
import pool from '../database.js';


// Параметры подключения к MQTT-брокеру
const mqttBrokerUrl = 'http://147.232.205.176/mqttexplorer/';
const mqttOptions = {
    port: 1883,                // Порт брокера
    username: 'maker', // Укажите имя пользователя, если требуется
    password: 'mother.mqtt.password', // Укажите пароль, если требуется
};


const client = mqtt.connect(mqttBrokerUrl, mqttOptions);


const topic = 'kpi/romulus/rfid/vl457mk';


client.on('connect', () => {
    console.log('Подключение к MQTT успешно установлено');

    // Подписка на топик
    client.subscribe(topic, (err) => {
        if (err) {
            console.error('Ошибка подписки на топик:', err.message);
        } else {
            console.log(`Подписка на топик "${topic}" выполнена`);
        }
    });
});

// Обработка сообщений из подписанного топика
client.on('message', async (topic, message) => {
    console.log(`Сообщение из топика ${topic}: ${message.toString()}`);

});

client.on('message', async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());

        if (data.attendances && Array.isArray(data.attendances)) {
            for (const attendance of data.attendances) {
                const { student_id, cviky_id, dt } = attendance;

                // Проверка наличия студента в базе данных
                const queryText = `
                    UPDATE studenty
                    SET present = true, timestamp = $1
                    WHERE isic = $2 AND cviky_id = $3
                    RETURNING *;
                `;

                // Подставляем параметры
                const result = await pool.query(queryText, [dt, student_id, cviky_id]);

                if (result.rowCount > 0) {
                    console.log(`Статус студента ${student_id} обновлен на "Присутствует".`);

                } else {
                    console.warn(
                        `Студент с ISIC ${student_id} не найден для пары с ID ${data.cviky_id}.`
                    );
                }
            }
        }
    } catch (error) {
        console.error('Ошибка обработки сообщения:', error.message);
    }
});

// Обработка ошибок
client.on('error', (err) => {
    console.error('Ошибка подключения к MQTT:', err.message);
});


