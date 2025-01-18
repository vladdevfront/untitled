import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { findByUserByLogin } from "../api.js";

const AuthForm = ({setIsAuthenticated}) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // Запрашиваем данные пользователя с сервера
            const data = await findByUserByLogin(username, password);

            // Проверяем наличие данных о пользователе
            if (!data.user || !data.user.role) {
                throw new Error("Неверные данные или отсутствует роль пользователя.");
            }
            console.log('setIsAuthenticated:', typeof setIsAuthenticated);

            console.log("Успешный вход:", data);

            localStorage.setItem("authToken", "dummy-token"); // Здесь должен быть реальный токен, если сервер его возвращает
            console.log("Токен сохранен:", localStorage.getItem("authToken"));

            // Устанавливаем флаг авторизации
            setIsAuthenticated(true);

            // Перенаправляем в зависимости от роли пользователя
            if (data.user.role === "teacher") {
                console.log('Navigating to IoT');
                window.location.href = '/iot';

                console.log("Перенаправление на страницу IoT");
            } else {
                navigate("/");
                console.log("Перенаправление на общую страницу");
            }
        } catch (error) {
            console.error("Ошибка входа:", error.message);
            alert("Ошибка входа: " + error.message);
        }
    };

    return (
        <div
            style={{
                maxWidth: "400px",
                margin: "50px auto",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#fff",
            }}
        >
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Prihlasenie</h2>
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: "15px" }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "5px",
                            fontWeight: "bold",
                        }}
                    >
                        Login:
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                        }}
                    />
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "5px",
                            fontWeight: "bold",
                        }}
                    >
                        Heslo:
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                        }}
                    />
                </div>
                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "#202d4a",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    Prihlaste sa
                </button>
            </form>
        </div>
    );
};

export default AuthForm;
