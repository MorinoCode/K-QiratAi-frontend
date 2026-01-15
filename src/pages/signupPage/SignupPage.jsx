import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';
import { useTheme } from '../../context/ThemeContext';
import './SignupPage.css';

const SignupPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [formData, setFormData] = useState({
        storeName: '',
        username: '',
        fullName: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    useEffect(() => {
        const newErrors = {};
        if (formData.password && !passwordRegex.test(formData.password)) {
            newErrors.password = "Complexity: 8+ chars, Upper, Lower, Num, Special.";
        }
        if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }
        
        setErrors(newErrors);

        const isValid = 
            formData.storeName.length >= 3 &&
            formData.username.length >= 3 &&
            formData.fullName.length >= 3 &&
            formData.phone.length >= 8 &&
            passwordRegex.test(formData.password) &&
            formData.password === formData.confirmPassword;

        setIsFormValid(isValid);
    }, [formData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        // نگاشت اطلاعات به فرمت جدید بک‌اند
        const payload = {
            store_name: formData.storeName.trim().toLowerCase(),
            username: formData.username.trim().toLowerCase(),
            owner_name: formData.fullName.trim().toLowerCase(), 
            phone: formData.phone,
            password: formData.password
        };

        try {
            // تغییر آدرس به پلتفرم رجیستر
            const res = await api.post('/platform/register', payload);
            
            // نمایش شناسه فروشگاه به کاربر (بسیار مهم)
            const tenantId = res.data.tenant_id;
            alert(`Store Registered Successfully!\n\nIMPORTANT: Your Store ID is: "${tenantId}"\nPlease save it for login.`);
            
            // انتقال شناسه فروشگاه به صفحه لاگین برای راحتی کاربر
            navigate('/login', { state: { tenantId } });

        } catch (err) {
            console.error("Signup Error:", err);
            const serverError = err.response?.data?.error || err.response?.data?.message || "Registration failed.";
            setErrors(prev => ({ ...prev, server: serverError }));
        }
    };

    return (
        <div className={`signup-page signup-page--${theme}`}>
            <div className={`signup-card signup-card--${theme}`}>
                <div className={`signup-card__kuwait-strip signup-card__kuwait-strip--${theme}`}>
                    <div className={`signup-card__strip-item signup-card__strip-item--green`}></div>
                    <div className={`signup-card__strip-item signup-card__strip-item--white`}></div>
                    <div className={`signup-card__strip-item signup-card__strip-item--red`}></div>
                </div>

                <header className={`signup-card__header signup-card__header--${theme}`}>
                    <h1 className={`signup-card__title signup-card__title--${theme}`}>JOIN K-QIRAT</h1>
                    <p className={`signup-card__subtitle signup-card__subtitle--${theme}`}>REGISTER YOUR GOLD STORE IN KUWAIT</p>
                </header>

                <form className={`signup-card__form signup-card__form--${theme}`} onSubmit={handleSubmit}>
                    <div className={`signup-card__form-group signup-card__form-group--full signup-card__form-group--${theme}`}>
                        <label className={`signup-card__label signup-card__label--${theme}`}>Store Name</label>
                        <input 
                            name="storeName"
                            className={`signup-card__input signup-card__input--${theme}`}
                            type="text"
                            placeholder="e.g. Al-Baraka Gold"
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={`signup-card__form-group signup-card__form-group--${theme}`}>
                        <label className={`signup-card__label signup-card__label--${theme}`}>Owner Name</label>
                        <input 
                            name="fullName"
                            className={`signup-card__input signup-card__input--${theme}`}
                            type="text"
                            placeholder="Full Name"
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={`signup-card__form-group signup-card__form-group--${theme}`}>
                        <label className={`signup-card__label signup-card__label--${theme}`}>Admin Username</label>
                        <input 
                            name="username"
                            className={`signup-card__input signup-card__input--${theme}`}
                            type="text"
                            placeholder="Username"
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={`signup-card__form-group signup-card__form-group--${theme}`}>
                        <label className={`signup-card__label signup-card__label--${theme}`}>Phone Number</label>
                        <input 
                            name="phone"
                            className={`signup-card__input signup-card__input--${theme}`}
                            type="text"
                            placeholder="e.g. 96512345678"
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className={`signup-card__form-group signup-card__form-group--${theme}`}>
                        <label className={`signup-card__label signup-card__label--${theme}`}>Password</label>
                        <input 
                            name="password"
                            className={`signup-card__input ${errors.password ? 'signup-card__input--error' : ''} signup-card__input--${theme}`}
                            type="password"
                            placeholder="••••••••"
                            onChange={handleInputChange}
                            required
                        />
                        {errors.password && <span className={`signup-card__error-msg signup-card__error-msg--${theme}`}>{errors.password}</span>}
                    </div>

                    <div className={`signup-card__form-group signup-card__form-group--${theme}`}>
                        <label className={`signup-card__label signup-card__label--${theme}`}>Confirm Password</label>
                        <input 
                            name="confirmPassword"
                            className={`signup-card__input ${errors.confirmPassword ? 'signup-card__input--error' : ''} signup-card__input--${theme}`}
                            type="password"
                            placeholder="••••••••"
                            onChange={handleInputChange}
                            required
                        />
                        {errors.confirmPassword && <span className={`signup-card__error-msg signup-card__error-msg--${theme}`}>{errors.confirmPassword}</span>}
                    </div>

                    {errors.server && <div className="signup-card__form-group--full" style={{color: 'red', fontSize: '0.8rem', textAlign: 'center'}}>{errors.server}</div>}

                    <button 
                        type="submit"
                        className={`signup-card__submit-btn ${!isFormValid ? 'signup-card__submit-btn--disabled' : ''} signup-card__submit-btn--${theme}`}
                        disabled={!isFormValid}
                    >
                        CREATE ACCOUNT
                    </button>

                    <footer className={`signup-card__footer signup-card__footer--${theme}`}>
                        <span className={`signup-card__footer-text signup-card__footer-text--${theme}`}>Already have an account? </span>
                        <button 
                            type="button"
                            className={`signup-card__link-btn signup-card__link-btn--${theme}`} 
                            onClick={() => navigate('/login')}
                        >
                            LOGIN
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;