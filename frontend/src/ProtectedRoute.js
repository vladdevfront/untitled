import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, requiredRole, children }) => {
    if (!user) {
        // Если пользователь не авторизован, перенаправляем на страницу авторизации
        return <Navigate to="/auth" />;
    }

    if (requiredRole && user.role_server !== requiredRole) {
        // Если роль пользователя не совпадает с требуемой, перенаправляем на главную
        return <Navigate to="/" />;
    }

    return children; // Если пользователь авторизован, отображаем содержимое
};

export default ProtectedRoute;
