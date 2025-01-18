import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import HomePage from "./pages/Home.jsx";
import IoTPage from "./pages/IoT.jsx";
import AuthForm from "./pages/AuthForm.jsx";

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return Boolean(localStorage.getItem("authToken")); // Проверяем наличие токена при загрузке
    });

    const handleLogout = () => {
        setIsAuthenticated(false); // Устанавливаем состояние аутентификации в false
        localStorage.removeItem("authToken"); // Удаляем токен из localStorage
    };

    return (
        <Router>
            <MainContent
                onLogout={handleLogout}
                isAuthenticated={isAuthenticated}
                setIsAuthenticated={setIsAuthenticated}
            />
        </Router>
    );
};

const MainContent = ({ onLogout, isAuthenticated, setIsAuthenticated }) => {
    const location = useLocation();
    const shouldShowSidebar = location.pathname !== "/auth";

    return (
        <div style={{ display: "flex" }}>
            {shouldShowSidebar && <Sidebar onLogout={onLogout} />} {/* Передаем onLogout в Sidebar */}
            <div style={{ flex: 1, padding: "24px", marginLeft: shouldShowSidebar ? "250px" : "0" }}>
                <Routes>
                    {/* Страница авторизации */}
                    <Route path="/auth" element={<AuthForm setIsAuthenticated={setIsAuthenticated} />} />

                    {/* Главная страница */}
                    <Route path="/" element={<HomePage />} />

                    {/* Защищенная страница IoT */}
                    <Route
                        path="/iot"
                        element={
                            isAuthenticated ? (
                                <IoTPage />
                            ) : (
                                <Navigate to="/auth" replace />
                            )
                        }
                    />
                </Routes>
            </div>
        </div>
    );
};

export default App;
