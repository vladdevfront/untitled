import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/Home";
import IoTPage from "./pages/IoT";

const App = () => {
    return (
        <Router>
            <div>
                {/* Сайдбар */}
                <Sidebar />

                {/* Основной контент */}
                <div style={{ marginLeft: "250px", padding: "24px" }}>
                    <Routes>
                        {/* Главная страница */}
                        <Route path="/" element={<HomePage />} />

                        {/* IoT страница */}
                        <Route path="/iot" element={<IoTPage />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
