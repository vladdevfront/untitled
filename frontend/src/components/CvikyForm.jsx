import React, { useState } from "react";

const CvikyForm = ({ onClose, onSubmit }) => {
    const [dayName, setDayName] = useState("");
    const [timeStart, setTimeStart] = useState("");
    const [timeEnd, setTimeEnd] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!dayName || !timeStart || !timeEnd) {
            alert("Prosim, uvedte spravne hodnoty!");
            return;
        }

        onSubmit({ day_name: dayName, time_start: timeStart, time_end: timeEnd });
        onClose();
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                padding: "24px",
                width: "400px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
            }}>
                <h2 style={{ textAlign: "center", marginBottom: "16px" }}>Pridať nové cvičenie</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "8px" }}>Deň:</label>
                        <input
                            type="text"
                            value={dayName}
                            onChange={(e) => setDayName(e.target.value)}
                            placeholder="Napriklad, PO (pondelok)"
                            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "8px" }}>Začiatok:</label>
                        <input
                            type="time"
                            value={timeStart}
                            onChange={(e) => setTimeStart(e.target.value)}
                            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                        />
                    </div>
                    <div>
                        <label style={{ display: "block", marginBottom: "8px" }}>Koniec:</label>
                        <input
                            type="time"
                            value={timeEnd}
                            onChange={(e) => setTimeEnd(e.target.value)}
                            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
                        />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <button type="button" onClick={onClose} style={{
                            padding: "8px 16px",
                            backgroundColor: "#f44336",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}>Zrušiť</button>
                        <button type="submit" style={{
                            padding: "8px 16px",
                            backgroundColor: "#4caf50",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}>Pridať</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CvikyForm;
