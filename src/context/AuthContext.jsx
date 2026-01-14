import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // شامل role, username, branch_id
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // چک کردن وضعیت لاگین هنگام رفرش صفحه
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                // فرض: یک روت در بک‌اَند داریم که اطلاعات کاربر فعلی را می‌دهد
                // اگر هنوز نساختیم، فعلاً از LocalStorage می‌خوانیم
                const storedUser = localStorage.getItem('user_data');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (err) {
                console.error("Auth check failed", err);
                localStorage.removeItem('user_data');
            } finally {
                setLoading(false);
            }
        };
        checkLoggedIn();
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        navigate('/dashboard');
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user_data');
        // پاک کردن کوکی توسط بک‌اَند باید انجام شود
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);