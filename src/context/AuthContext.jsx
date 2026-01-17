import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // چک کردن وضعیت لاگین با درخواست به سرور (مطمئن‌ترین روش)
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                // دریافت اطلاعات تازه کاربر (شامل branch_id و role)
                const res = await api.get('/auth/me');
                
                // هندل کردن ساختار پاسخ (res.data.data یا res.data)
                const userData = res.data.data || res.data;
                setUser(userData);
            } catch (err) {
                // اگر ارور داد (مثلاً 401)، یعنی توکن معتبر نیست
                // console.error("Auth check failed:", err);
                setUser(null);
                localStorage.removeItem('user_data'); // پاک کردن دیتای قدیمی
                
                // اگر در صفحه لاگین نیست، هدایت کن
                if (location.pathname !== '/login') {
                    // navigate('/login'); // اختیاری: اگر می‌خواهید ریدایرکت اجباری باشد
                }
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

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error('Logout error', e);
        } finally {
            setUser(null);
            localStorage.removeItem('user_data');
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {/* تا وقتی لودینگ تمام نشده، هیچ چیزی رندر نکن تا باگ null پیش نیاید */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);