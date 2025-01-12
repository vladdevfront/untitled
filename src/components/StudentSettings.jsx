import React from "react";

const StudentSettings = ({ student, onClose, onDelete, onTogglePresence }) => {
    if (!student) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "8px",
                    padding: "24px",
                    maxWidth: "500px",
                    width: "100%",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                    position: "relative",
                }}
            >
                {/* Кнопка закрытия модального окна */}
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        background: "none",
                        border: "none",
                        fontSize: "16px",
                        cursor: "pointer",
                    }}
                >
                    ✕
                </button>

                {/* Информация о студенте */}
                <h2
                    style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 500,
                        marginBottom: "32px",
                    }}
                >
                    Nastavenia pre: {student.name}
                </h2>
                <p>
                    <strong>ISIC čislo:</strong> {student.id}
                </p>
                <p>
                    <strong>Absencie:</strong> {student.absences || 0}
                </p>

                {/* Выпадающий список для выбора статуса */}
                <div style={{ marginTop: "24px" }}>
                    <label style={{ marginBottom: "8px", display: "block", fontWeight: "bold" }}>
                        Status:
                    </label>
                    <select
                        value={student.present ? "present" : "absent"}
                        onChange={(e) =>
                            onTogglePresence(student.id, e.target.value === "present")
                        }
                        style={{
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                            width: "100%",
                            cursor: "pointer",
                        }}
                    >
                        <option value="present">V triede</option>
                        <option value="absent">Chýba</option>
                    </select>
                </div>

                {/* Кнопка удаления */}
                <div style={{ marginTop: "24px", marginLeft: "auto", display: "flex", justifyContent: "flex-end" }}>
                    <button
                        onClick={() => onDelete(student.id)}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        Odstrániť zo zoznamu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentSettings;
