import React, { useState, useEffect } from "react";
import StudentSettings from "../components/StudentSettings.jsx";
import {
    getCviky,
    getStudents,
    addStudentToCviky,
    addPair,
    deletePair,
    deleteAllStudents,
    updateStudentPresence, deleteStudent, updateUserByCvikId, updateAttendanceByStudentId, updateAttendance
} from "../api.js";
import AddStudentForm from "../components/AddStudentForm.jsx";
import CvikyForm from "../components/CvikyForm.jsx";
import RaspberrySettings from "../components/RaspberrySettings.jsx";


const IoTPage = () => {
    const [attendance, setAttendance] = useState({});
    const [settingsRaspberry, setSettingsRaspberry] = useState(false);
    const [hoveredCourse, setHoveredCourse] = useState(null);
    const [isModalOpenCviko, setIsModalOpenCviko] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courses, setCourses] = useState([]); // Курсы (загрузка с сервера)
    const [students, setStudents] = useState([]); // Студенты (загрузка с сервера)
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const handleToggleAttendance = async (studentIsic, weekNumber, attended) => {
        try {
            await updateAttendance(studentIsic, weekNumber, attended); // Обновляем на сервере

            // Обновляем локальное состояние
            setAttendance((prev) => ({
                ...prev,
                [studentIsic]: prev[studentIsic].map((week) =>
                    week.week_number === weekNumber
                        ? { ...week, attended }
                        : week
                ),
            }));
        } catch (error) {
            console.error("Ошибка обновления посещаемости:", error.message);
        }
    };


    const fetchAttendance = async (isic) => {
        try {
            console.log('Идентификатор студента для API:', isic);
            const response = await updateAttendanceByStudentId(isic);
            console.log('Response:', response.data);
            return response.data; // Массив с посещаемостью по неделям
        } catch (error) {
            console.error('Ошибка получения данных о посещаемости:', error.message);
        }
    };

    useEffect(() => {
        const loadAttendanceData = async () => {
            if (!students || students.length === 0) {
                console.log('Нет студентов для загрузки посещаемости');
                return;
            }

            const attendanceData = {};
            for (const student of students) {
                console.log(`Загрузка посещаемости для студента: ${student.isic}`);
                const studentAttendance = await fetchAttendance(student.isic);
                console.log(`Данные для студента ${student.id}:`, studentAttendance);
                attendanceData[student.isic] = studentAttendance;
            }
            console.log('Все данные о посещаемости:', attendanceData);
            setAttendance(attendanceData);
        };

        loadAttendanceData();
    }, [students]);




    const handleSubmitRaspberrySettings = async (config) => {
        try {
            const response = await axios.post("http://localhost:3000/raspberry-config", config);
            alert("Конфигурация успешно отправлена!");
            console.log("Отправленная конфигурация:", config);
        } catch (error) {
            console.error("Ошибка при отправке конфигурации:", error);
            alert("Не удалось отправить конфигурацию.");
        }
    };

    const fetchStudents = async (cvikyId) => {
        try {
            const response = await updateUserByCvikId(cvikyId);
            console.log(
                'Response:',
                response.data
            )
            const formattedStudents = response.data.map((student) => ({
                id: student.id,
                name: `${student.first_name} ${student.last_name}`, // Объединяем имя и фамилию
                isic: student.isic,
                present: student.present,
                cviky_id: student.cviky_id,
            }));

            setStudents(formattedStudents);

        } catch (error) {
            console.error('Ошибка при получении студентов:', error);
        }
    };

    useEffect(() => {
        if (!selectedTimeSlot) return; // Если пара не выбрана, ничего не делаем

        // Запуск пинга каждые 5 секунд
        const intervalId = setInterval(() => {
            console.log(`Пинг для обновления студентов пары с ID: ${selectedTimeSlot.id}`);
            fetchStudents(selectedTimeSlot.id);
        }, 10000);

        return () => clearInterval(intervalId); // Очищаем интервал при размонтировании компонента или изменении выбранной пары
    }, [selectedTimeSlot]);


    const handleDeleteAllStudents = async (cvikyId) => {
        try {
            await deleteAllStudents(cvikyId);
            alert(`Všetci študenti pre cvičenie "${selectedTimeSlot.name}" su vymazane.`);

            const loadedStudents = await getStudents();
            const formattedStudents = loadedStudents.map((student) => ({
                id: student.id,
                name: `${student.first_name} ${student.last_name}`, // Объединяем имя и фамилию
                isic: student.isic,
                present: student.present,
                cviky_id: student.cviky_id,
            }));

            setStudents(formattedStudents);
        } catch (error) {
            console.error("Chyba vymazania študentov:", error.message);
            alert("Nepodarilo sa vymazať študentov.");
        }
    };

    const handleAddCviky = async (cvikyData) => {
        if (!cvikyData || !cvikyData.day_name || !cvikyData.time_start || !cvikyData.time_end) {
            alert("Prosim, vyplňte všetky polia pre pridanie cvičenia!");
            return;
        }

        try {
            // Добавляем новую пару через API
            await addPair({
                day_name: cvikyData.day_name,
                time_start: cvikyData.time_start,
                time_end: cvikyData.time_end,
            });

            // Загружаем обновленные данные с сервера
            const loadedCourses = await getCviky();
            const formattedCourses = loadedCourses.map((course) => ({
                id: course.id,
                name: `${course.day_name}: ${course.time_start} - ${course.time_end}`,
                timeSlots: [`${course.day_name}: ${course.time_start} - ${course.time_end}`],
            }));

            // Обновляем состояние курсов
            setCourses(formattedCourses);

            console.log("Cvičenie úspešne pridané.");
        } catch (error) {
            console.error("Chyba pridania cvika:", error.message);
            alert("Nepodarilo sa pridať cvičenie. Skúste to znova.");
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm("Действительно хотите удалить пару из списка?")) {
            try {
                await deletePair(courseId); // API-запрос для удаления
                setCourses((prevCourses) => prevCourses.filter((course) => course.id !== courseId));
                console.log(`Пара с ID ${courseId} успешно удалена.`);
            } catch (error) {
                console.error("Ошибка при удалении пары:", error.message);
                alert("Не удалось удалить пару. Попробуйте снова.");
            }
        }
    };

    const handleDeleteStudent = async (id) => {
        try {
            await deleteStudent(id); // Удаляем студента на сервере
            const loadedStudents = await getStudents();
            const formattedStudents = loadedStudents.map((student) => ({
                id: student.id,
                name: `${student.first_name} ${student.last_name}`, // Объединяем имя и фамилию
                isic: student.isic,
                present: student.present,
                cviky_id: student.cviky_id,
            }));

            setStudents(formattedStudents);
        } catch (error) {
            console.error("Ошибка удаления студента:", error.message);
        }
    };

    const handleAddStudent = async (studentData) => {
        if (!selectedTimeSlot) {
            alert("Prosim,zvoľte miestnosť(čas)!");
            return;
        }

        try {
            await addStudentToCviky({
                isic: studentData.isic,
                first_name: studentData.name, // Передаем отдельно имя
                last_name: studentData.surname, // Передаем отдельно фамилию
                cviky_id: selectedTimeSlot.id,
                present: false,
            });
            const loadedStudents = await getStudents();
            const formattedStudents = loadedStudents.map((student) => ({
                id: student.id,
                name: `${student.first_name} ${student.last_name}`, // Объединяем имя и фамилию
                isic: student.isic,
                present: student.present,
                cviky_id: student.cviky_id,
            }));

            setStudents(formattedStudents);
        } catch (error) {
            console.error("Chyba pridania študenta:", error.message);
        }
    };


    useEffect(() => {
        console.log("Курсы:", courses);
        console.log("Студенты:", students);
    }, [courses, students]);

    // Загрузка курсов и студентов с сервера
    useEffect(() => {
        const fetchData = async () => {
            try {
                const loadedCourses = await getCviky(); // Загрузка пар с сервера
                const loadedStudents = await getStudents(); // Загрузка студентов с сервера

                console.log("Загруженные курсы с сервера:", loadedCourses);
                console.log("Загруженные студенты с сервера:", loadedStudents);

                const formattedCourses = loadedCourses.map((course) => ({
                    id: course.id,
                    name: `${course.day_name}: ${course.time_start} - ${course.time_end}`,
                    timeSlots: [`${course.day_name}: ${course.time_start} - ${course.time_end}`],
                }));

                // Форматирование студентов: объединяем имя и фамилию в одну строку
                const formattedStudents = loadedStudents.map((student) => ({
                    id: student.id,
                    name: `${student.first_name} ${student.last_name}`, // Объединяем имя и фамилию
                    isic: student.isic,
                    present: student.present,
                    cviky_id: student.cviky_id,
                }));

                setCourses(formattedCourses);
                setStudents(formattedStudents);
            } catch (error) {
                console.error("Chyba:", error.message);
            }
        };

        fetchData();
    }, []);


    return (
        <div style={{padding: "24px"}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <div style={{display: "flex", alignItems: "center", gap: "16px"}}>
                    <h1 style={{fontSize: "48px", fontFamily: "Montserrat, Medium 500 Italic"}}>
                        Základy internetu vecí
                    </h1>
                    <span style={{marginTop: "20px", opacity: 0.5, display: "block"}}>
                    Kod predmetu: XXXXXX
                </span>
                </div>
                <button
                    onClick={() => setSettingsRaspberry(true)}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#1e2939",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px", // Расстояние между текстом и иконкой
                    }}
                >
                    {/* Иконка шестеренки */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{width: "20px", height: "20px"}}
                    >
                        <circle cx="12" cy="12" r="3"></circle>
                        <path
                            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    Nastavenia Raspberry Pi
                </button>
            </div>
            {settingsRaspberry && (
                <RaspberrySettings
                    onClose={() => setSettingsRaspberry(false)}
                    onSubmit={handleSubmitRaspberrySettings}
                />
            )}

            {/* Модальное окно для добавления студента */}
            {isModalOpen && (
                <AddStudentForm
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAddStudent}
                />
            )}

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                }}
            >
                <h2 style={{color: "#686868"}}>Zoznam cvičení:</h2>
                <button
                    onClick={() => setIsModalOpenCviko(true)}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#112a45",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Pridať cvičenie
                </button>
            </div>

            {/* Список пар */}
            <div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
                {courses.map((course) => (
                    <div
                        key={course.id}
                        style={{
                            position: "relative",
                            display: "inline-block",
                        }}
                        onMouseEnter={() => setHoveredCourse(course.id)}
                        onMouseLeave={() => setHoveredCourse(null)}
                    >
                        {/* Кнопка удаления (крестик) */}
                        {hoveredCourse === course.id && (
                            <button
                                onClick={() => handleDeleteCourse(course.id)}
                                style={{
                                    position: "absolute",
                                    top: "0px",
                                    right: "0px",
                                    width: "20px",
                                    height: "20px",
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    lineHeight: "20px",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                ✕
                            </button>
                        )}

                        {/* Кнопка выбора пары */}
                        <button
                            onClick={() => setSelectedTimeSlot(course)}
                            style={{
                                padding: "8px 16px",
                                margin: "8px",
                                backgroundColor:
                                    selectedTimeSlot?.id === course.id ? "#003366" : "#f0f0f0",
                                color: selectedTimeSlot?.id === course.id ? "white" : "black",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            {course.name}
                        </button>
                    </div>
                ))}
            </div>
            {isModalOpenCviko && (
                <CvikyForm
                    onClose={() => setIsModalOpenCviko(false)}
                    onSubmit={handleAddCviky}
                />
            )}

            {selectedTimeSlot && (
                <div>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <h2 style={{color: "#686868", marginBottom: "16px", marginTop: "32px"}}>
                            Zoznam študentov
                        </h2>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#62bd5f",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            Pridať študenta
                        </button>
                    </div>
                    <ul style={{listStyle: "none", padding: 0}}>
                        {students
                            ?.filter((student) => student.cviky_id === selectedTimeSlot.id)
                            .map((student) => (
                                <li
                                    key={student.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "12px",
                                        marginBottom: "8px",
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "8px",
                                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                                    }}
                                >
                                    {/* Левая часть: Имя студента */}
                                    <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                                        <div
                                            style={{
                                                width: "16px",
                                                height: "16px",
                                                borderRadius: "50%",
                                                backgroundColor: student.present ? "#4caf50" : "#f44336",
                                            }}
                                        ></div>
                                        <span>{student.name}</span>
                                    </div>

                                    {/* Правая часть: Недельная посещаемость */}
                                    <div style={{display: "flex", gap: "13px"}}>
                                        {Array(13)
                                            .fill(null)
                                            .map((_, weekIndex) => {
                                                const weekData = attendance[student.isic]?.find(
                                                    (week) => week.week_number === weekIndex + 1
                                                );
                                                const attended = weekData?.attended || false;

                                                return (
                                                    <div
                                                        key={weekIndex}
                                                        onClick={() =>
                                                            handleToggleAttendance(student.isic, weekIndex + 1, !attended)
                                                        } // Обработчик клика
                                                        style={{
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            minWidth: "30px",
                                                            cursor: "pointer", // Указываем, что элемент кликабельный
                                                        }}
                                                    >
                                                        {/* Номер недели */}
                                                        <span
                                                            style={{
                                                                fontSize: "16px",
                                                                fontWeight: "bold",
                                                                marginBottom: "4px",
                                                                color: "#555",
                                                            }}
                                                        >
                    {weekIndex + 1}
                  </span>

                                                        {/* Метка "U" или "N" */}
                                                        <span
                                                            style={{
                                                                fontSize: "24px",
                                                                fontWeight: "bold",
                                                                color: attended ? "#4caf50" : "#f44336", // Цвет метки
                                                            }}
                                                        >
                    {attended ? "U" : "N"}
                  </span>
                                                    </div>
                                                );
                                            })}
                                    </div>

                                    {/* Кнопка настроек */}
                                    <div>
                                        <button
                                            onClick={() => setSelectedStudent(student)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                style={{
                                                    width: "20px",
                                                    height: "20px",
                                                    color: "#202d4a",
                                                }}
                                            >
                                                <circle cx="12" cy="12" r="3"></circle>
                                                <path
                                                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                                                ></path>
                                            </svg>
                                        </button>
                                    </div>
                                </li>
                            ))}
                    </ul>


                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "16px",
                        }}
                    >
                        <button
                            onClick={() => {
                                if (
                                    confirm(
                                        `Вы уверены, что хотите удалить всех студентов для пары "${selectedTimeSlot.name}"?`
                                    )
                                ) {
                                    handleDeleteAllStudents(selectedTimeSlot.id);
                                }
                            }}
                            style={{
                                padding: "10px 20px",
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                            }}
                        >
                            Vymazať zoznam
                        </button>
                    </div>
                </div>
            )}
            <StudentSettings
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)}
                onDelete={handleDeleteStudent}
                onTogglePresence={async (id, present) => {
                    try {
                        await updateStudentPresence(id, present); // Обновляем в базе данных
                        const loadedStudents = await getStudents();
                        const formattedStudents = loadedStudents.map((student) => ({
                            id: student.id,
                            name: `${student.first_name} ${student.last_name}`, // Объединяем имя и фамилию
                            isic: student.isic,
                            present: student.present,
                            cviky_id: student.cviky_id,
                        }));

                        setStudents(formattedStudents);
                    } catch (error) {
                        console.error("Ошибка обновления присутствия:", error.message);
                    }
                }}
            />
        </div>
    );
}
export default IoTPage;
