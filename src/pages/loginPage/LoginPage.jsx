import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { Eye, EyeOff } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();
    const { t } = useTranslation();

    const [credentials, setCredentials] = useState({
        storeId: '',
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({ password: '', server: '' });
    const [isFormValid, setIsFormValid] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (location.state?.tenantId) {
            setCredentials(prev => ({ ...prev, storeId: location.state.tenantId }));
        }
    }, [location.state]);

    useEffect(() => {
        const isValid =
            credentials.storeId.trim().length > 0 &&
            credentials.username.trim().length > 0 &&
            credentials.password.length > 0;
        setIsFormValid(isValid);
    }, [credentials]);

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const config = {
                headers: {
                    'x-tenant-id': credentials.storeId
                }
            };

            const response = await api.post('/auth/login', {
                username: credentials.username,
                password: credentials.password
            }, config);

            console.log("Login Success:", response.data);

            localStorage.setItem('tenant_id', credentials.storeId);

            if (response.data.token) {
                // localStorage.setItem('token', response.data.token); 
            }

            navigate('/dashboard');
        } catch (err) {
            console.error("Login Error:", err);
            const serverError = err.response?.data?.message || t('invalid_credentials');
            setErrors(prev => ({ ...prev, server: serverError }));
        }
    };

    return (
        <div className={`login-page login-page--${theme}`}>
            <div className={`login-card login-card--${theme}`}>
                <div className="login-card__kuwait-strip">
                    <div className="login-card__strip-item login-card__strip-item--green"></div>
                    <div className="login-card__strip-item login-card__strip-item--white"></div>
                    <div className="login-card__strip-item login-card__strip-item--red"></div>
                </div>

                <header className={`login-card__header login-card__header--${theme}`}>
                    <h1 className={`login-card__title login-card__title--${theme}`}>{t('app_title')}</h1>
                    <p className={`login-card__subtitle login-card__subtitle--${theme}`}>SECURE GOLD PORTAL | KUWAIT</p>
                </header>

                <form className={`login-card__form login-card__form--${theme}`} onSubmit={handleLogin}>

                    <div className={`login-card__form-group login-card__form-group--${theme}`}>
                        <label className={`login-card__label login-card__label--${theme}`}>{t('store_id')}</label>
                        <input
                            className={`login-card__input login-card__input--${theme}`}
                            type="text"
                            placeholder="e.g. royal-gold"
                            value={credentials.storeId}
                            onChange={(e) => setCredentials({ ...credentials, storeId: e.target.value })}
                            required
                        />
                    </div>

                    <div className={`login-card__form-group login-card__form-group--${theme}`}>
                        <label className={`login-card__label login-card__label--${theme}`}>{t('username')}</label>
                        <input
                            className={`login-card__input login-card__input--${theme}`}
                            type="text"
                            placeholder={t('enter_username')}
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            required
                        />
                    </div>

                    <div className={`login-card__form-group login-card__form-group--${theme}`}>
                        <label className={`login-card__label login-card__label--${theme}`}>{t('password')}</label>
                        <div className="login-card__password-wrapper">
                            <input
                                className={`login-card__input ${errors.password ? 'login-card__input--error' : ''} login-card__input--${theme}`}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                className={`login-card__eye-btn login-card__eye-btn--${theme}`}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {errors.server && (
                        <div className="login-card__error-msg">
                            {errors.server}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`login-card__submit-btn ${!isFormValid ? 'login-card__submit-btn--disabled' : ''} login-card__submit-btn--${theme}`}
                        disabled={!isFormValid}
                    >
                        {t('secure_login')}
                    </button>

                    <footer className="login-card__footer">
                        <button
                            type="button"
                            className={`login-card__signup-btn login-card__signup-btn--${theme}`}
                            onClick={() => navigate('/signup')}
                        >
                            {t('dont_have_account')} {t('sign_up')}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;