// src/context/ThemeContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // خواندن تم از لوکال استوریج یا پیش‌فرض 'dark'
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app_theme') || 'dark';
    });

    const toggleTheme = () => {
        setTheme((prevTheme) => {
            const newTheme = prevTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('app_theme', newTheme);
            return newTheme;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);