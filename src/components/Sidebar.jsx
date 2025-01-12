import React, { useState } from "react";
import { Link } from "react-router-dom";
import IoT from "../images/iot.svg";

const Sidebar = () => {
    const [activeItem, setActiveItem] = useState(null); // Хранит текущий активный элемент

    const menuItems = [
        { id: 1, name: "Zaklady internetu veci", path: "/iot", icon: IoT },
    ];

    return (
        <aside
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "250px",
                height: "100vh",
                backgroundColor: "#111827",
                borderRight: "1px solid #e5e7eb",
                padding: "16px",
                boxSizing: "border-box",
            }}
        >
            <Link to="/" onClick={() => setActiveItem(null)} style={{ textDecoration: "none" }}>
                <h1
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#ffffff",
                        margin: 0,
                        userSelect: "none",
                        cursor: "pointer",
                    }}
                >
                    Prezenčka.SK
                </h1>
            </Link>
            <div
                style={{
                    marginTop: "24px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: "#99a1af",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                }}
            >
                predmety
            </div>
            <ul style={{ marginTop: "12px", listStyle: "none", padding: 0 }}>
                {menuItems.map((item) => (
                    <li key={item.id} style={{ marginBottom: "16px" }}>
                        <Link
                            to={item.path}
                            onClick={() => setActiveItem(item.id)} // Устанавливаем активный элемент
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "8px",
                                fontSize: "18px",
                                color: activeItem === item.id ? "#ffffff" : "#99a1af", // Меняем цвет текста
                                backgroundColor:
                                    activeItem === item.id ? "#1e2939" : "transparent", // Меняем фон
                                textDecoration: "none",
                                borderRadius: "4px",
                                transition: "background-color 0.2s, color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                if (activeItem !== item.id) {
                                    e.target.style.backgroundColor = "#1e2939";
                                    e.target.style.color = "#ffffff";
                                    const img = e.target.querySelector("img");
                                    if (img) img.style.filter = "brightness(2)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeItem !== item.id) {
                                    e.target.style.backgroundColor = "transparent";
                                    e.target.style.color = "#99a1af";
                                    const img = e.target.querySelector("img");
                                    if (img) img.style.filter = "brightness(1)";
                                }
                            }}
                        >
                            <img
                                src={item.icon}
                                style={{
                                    width: "24px",
                                    height: "24px",
                                    marginRight: "8px",
                                    transition: "filter 0.2s",
                                    filter:
                                        activeItem === item.id
                                            ? "brightness(2)"
                                            : "brightness(1)", // Яркость для активного элемента
                                }}
                                alt={`${item.name} Icon`}
                            />
                            {item.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default Sidebar;
