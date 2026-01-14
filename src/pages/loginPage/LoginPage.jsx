import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({ password: '', server: '' });
    const [isFormValid, setIsFormValid] = useState(false);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // useEffect(() => {
    //     const isUserValid = credentials.username.trim().length >= 3;
    //     const isPassValid = passwordRegex.test(credentials.password);
    //     setIsFormValid(isUserValid && isPassValid);
        
    //     if (credentials.password.length > 0 && !isPassValid) {
    //         setErrors(prev => ({ ...prev, password: 'Required: 8+ chars, Upper, Lower, Num, Symbol.' }));
    //     } else {
    //         setErrors(prev => ({ ...prev, password: '' }));
    //     }
    // }, [credentials]);

    const handleLogin = async (e) => {
        e.preventDefault();
        // if (!isFormValid) return;

        try {
            const response = await api.post('/auth/login', {
                username: credentials.username,
                password: credentials.password
            });

            console.log("Login Success:", response.data);
            navigate('/dashboard');
        } catch (err) {
            console.error("Login Error:", err);
            const serverError = err.response?.data?.message || "Invalid Username or Password";
            setErrors(prev => ({ ...prev, server: serverError }));
        }
    };

    return (
        <div className={`login-page login-page--${theme}`}>
            <div className={`login-card login-card--${theme}`}>
                <div className={`login-card__kuwait-strip login-card__kuwait-strip--${theme}`}>
                    <div className={`login-card__strip-item login-card__strip-item--green`}></div>
                    <div className={`login-card__strip-item login-card__strip-item--white`}></div>
                    <div className={`login-card__strip-item login-card__strip-item--red`}></div>
                </div>
                
                <header className={`login-card__header login-card__header--${theme}`}>
                    <h1 className={`login-card__title login-card__title--${theme}`}>K-QIRAT</h1>
                    <p className={`login-card__subtitle login-card__subtitle--${theme}`}>SECURE GOLD PORTAL | KUWAIT</p>
                </header>

                <form className={`login-card__form login-card__form--${theme}`} onSubmit={handleLogin}>
                    <div className={`login-card__form-group login-card__form-group--${theme}`}>
                        <label className={`login-card__label login-card__label--${theme}`}>Store ID / Username</label>
                        <input 
                            className={`login-card__input login-card__input--${theme}`}
                            type="text" 
                            placeholder="Enter username"
                            value={credentials.username}
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className={`login-card__form-group login-card__form-group--${theme}`}>
                        <label className={`login-card__label login-card__label--${theme}`}>Password</label>
                        <input 
                            className={`login-card__input ${errors.password ? 'login-card__input--error' : ''} login-card__input--${theme}`}
                            type="password" 
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            required
                        />
                        {errors.password && (
                            <span className={`login-card__error-msg login-card__error-msg--${theme}`}>
                                {errors.password}
                            </span>
                        )}
                    </div>

                    {errors.server && (
                        <div className="login-card__error-msg login-card__error-msg--server" style={{textAlign: 'center', marginBottom: '10px'}}>
                            {errors.server}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className={`login-card__submit-btn ${!isFormValid ? 'login-card__submit-btn--disabled' : ''} login-card__submit-btn--${theme}`}
                        // disabled={!isFormValid}
                    >
                        SECURE LOGIN
                    </button>

                    <footer className="login-card__footer" style={{textAlign: 'center', marginTop: '15px'}}>
                         <button 
                            type="button" 
                            style={{background: 'none', border: 'none', color: theme === 'dark' ? '#D4AF37' : '#B8860B', cursor: 'pointer', fontSize: '0.85rem'}}
                            onClick={() => navigate('/signup')}
                        >
                            Don't have an account? Sign Up
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;