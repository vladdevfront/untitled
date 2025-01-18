import mqtt from 'mqtt';
import pool from '../database.js';


// Параметры подключения к MQTT-брокеру
const mqttBrokerUrl = 'http://147.232.205.176/mqttexplorer/';
const mqttOptions = {
    port: 1883,
    username: 'maker',
    password: 'mother.mqtt.password',
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
        console.log(`\n=== Новое сообщение из топика "${topic}" ===`);
        console.log(`Полученные данные: ${JSON.stringify(data, null, 2)}`);

        if (data.attendances && Array.isArray(data.attendances)) {
            for (const attendance of data.attendances) {
                const { student_id, cviky_id, dt } = attendance;
                console.log(`Обработка студента: ${student_id}, пара: ${cviky_id}, время: ${dt}`);

                // Лог перед выполнением SQL-запроса
                console.log("Выполнение запроса для проверки пары...");
                console.log(`SQL: SELECT * FROM cviky WHERE id = ${cviky_id} AND day_name = to_char('${dt}', 'Day') AND '${dt}'::time BETWEEN (time_start - interval '15 minutes') AND (time_start + interval '30 minutes');`);

                // Проверка на правильность пары
                const query = `
                    SELECT *
                    FROM cviky
                    WHERE id = $1
                      AND trim(day_name) = trim(to_char($2::timestamp, 'Day'))
                      AND $2::time BETWEEN (time_start - interval '5 minutes')
                                       AND (time_start + interval '30 minutes');
                `;

                const values = [cviky_id, dt];
                const result = await pool.query(query, values);

                // Лог результата SQL-запроса на проверку пары
                if (result.rows.length > 0) {
                    console.log(`✅ Студент ${student_id} пришел на правильную пару ${cviky_id}.`);

                    // Обновляем присутствие в таблице studenty
                    const updateQuery = `
                        UPDATE studenty
                        SET present = true, timestamp = $1
                        WHERE isic = $2 AND cviky_id = $3
                            RETURNING *;
                    `;
                    const updateValues = [dt, student_id, cviky_id];
                    const updateResult = await pool.query(updateQuery, updateValues);

                    if (updateResult.rowCount > 0) {
                        console.log(`✅ Присутствие обновлено: ${JSON.stringify(updateResult.rows[0], null, 2)}`);


                        const semesterStartDate = new Date('2025-01-03T00:00:00Z'); // Дата начала семестра

                        const currentWeek = Math.ceil(
                            (new Date(dt).getTime() - semesterStartDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
                        );



                        const attendanceUpdateQuery = `
                            UPDATE attendance_weeks
                            SET attended = true
                            WHERE student_id = $1 AND cviky_id = $2 AND week_number = $3
                                RETURNING *;
                        `;
                        const attendanceValues = [student_id, cviky_id, currentWeek];
                        const attendanceResult = await pool.query(attendanceUpdateQuery, attendanceValues);

                        if (attendanceResult.rowCount > 0) {
                            console.log(`Неделя ${currentWeek} отмечена как посещенная для студента ${student_id}.`);
                        } else {
                            console.warn(`⚠️ Не удалось обновить данные посещаемости для недели ${currentWeek}.`);
                        }
                    } else {
                        console.warn(`⚠️ Студент ${student_id} не найден в таблице "studenty".`);
                    }
                } else {
                    console.warn(`❌ Студент ${student_id} пришел на неправильную пару или в неподходящее время.`);
                }
            }
        } else {
            console.warn('⚠️ Неправильный формат данных. Поле "attendances" отсутствует или не является массивом.');
        }
    } catch (error) {
        console.error('❌ Ошибка обработки сообщения:', error.message);
        console.error(error.stack); // Вывод полного стека ошибки для отладки
    }
});




// Обработка ошибок
client.on('error', (err) => {
    console.error('Ошибка подключения к MQTT:', err.message);
});


