import React, { useState, useEffect } from "react";
import StudentSettings from "../components/StudentSettings";
import { getCviky, getStudents, addStudentToCviky} from "../api";
import AddStudentForm from "../components/AddStudentForm.jsx"; // Импорт API-запросов

const IoTPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courses, setCourses] = useState([]); // Курсы (загрузка с сервера)
    const [students, setStudents] = useState([]); // Студенты (загрузка с сервера)
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    const handleAddStudent = async (studentData) => {
        if (!selectedTimeSlot) {
            alert("Пожалуйста, выберите аудиторию!");
            return;
        }

        try {
            // Добавляем студента
            await addStudentToCviky({
                isic: studentData.isic,
                first_name: studentData.name, // Передаем отдельно имя
                last_name: studentData.surname, // Передаем отдельно фамилию
                cviky_id: selectedTimeSlot.id,
                present: false,
            });

            // Загружаем обновленный список студентов
            const loadedStudents = await getStudents();

            // Форматируем список студентов
            const formattedStudents = loadedStudents.map((student) => ({
                id: student.id,
                name: `${student.first_name} ${student.last_name}`, // Объединяем имя и фамилию
                isic: student.isic,
                present: student.present,
                cviky_id: student.cviky_id,
            }));

            // Обновляем состояние студентов
            setStudents(formattedStudents);
        } catch (error) {
            console.error("Ошибка добавления студента:", error.message);
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
                console.error("Ошибка при загрузке данных:", error.message);
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
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#1e2939",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Pridať študenta
                </button>
            </div>

            {/* Модальное окно для добавления студента */}
            {isModalOpen && (
                <AddStudentForm
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAddStudent}
                />
            )}


            <div>
                <h2 style={{color: "#686868", marginBottom: "16px"}}>Zoznam cvičení:</h2>
                {courses.map((course) => (
                    <button
                        key={course.id}
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
                ))}
            </div>

            {selectedTimeSlot && (
                <div>
                    <h2 style={{color: "#686868", marginBottom: "16px", marginTop: "32px"}}>
                        Zoznam študentov
                    </h2>
                    <ul style={{listStyle: "none", padding: 0}}>
                        {students
                            .filter((student) => student.cviky_id === selectedTimeSlot.id)
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
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "16px",
                                                height: "16px",
                                                borderRadius: "50%",
                                                backgroundColor: student.present
                                                    ? "#4caf50"
                                                    : "#f44336",
                                            }}
                                        ></div>
                                        <span>{student.name}</span>
                                    </div>
                                </li>
                            ))}
                    </ul>
                </div>
            )}

            <StudentSettings
                student={selectedStudent}
                onClose={() => setSelectedStudent(null)}
            />
        </div>
    );
};

export default IoTPage;
