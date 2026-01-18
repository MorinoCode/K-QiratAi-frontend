import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './MainPage.css';
import { 
    ShoppingCart, Users, Package, RefreshCw, 
    BarChart2, Settings, Calculator, LogOut,
    PlusCircle, ArrowRight
} from 'lucide-react';

const MainPage = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('good_morning');
        else if (hour < 18) setGreeting('good_afternoon');
        else setGreeting('good_evening');
    }, []);

    const menuItems = [
        {
            category: 'sales_operations',
            items: [
                { title: 'new_sale', icon: ShoppingCart, link: '/sales', color: 'primary', desc: 'start_invoice' },
                { title: 'customers', icon: Users, link: '/customers', color: 'secondary', desc: 'manage_crm' },
                { title: 'gold_calculator', icon: Calculator, link: '/calculator', color: 'secondary', desc: 'quick_calc' }
            ]
        },
        {
            category: 'inventory_stock',
            items: [
                { title: 'inventory', icon: Package, link: '/inventory', color: 'default', desc: 'view_stock' },
                { title: 'add_item', icon: PlusCircle, link: '/inventory/add', color: 'default', desc: 'new_stock' },
                { title: 'old_gold', icon: RefreshCw, link: '/old-gold', color: 'default', desc: 'exchange_buy' }
            ]
        },
        {
            category: 'management',
            items: [
                { title: 'dashboard', icon: BarChart2, link: '/dashboard', color: 'accent', desc: 'analytics_kpi' },
                { title: 'settings', icon: Settings, link: '/settings', color: 'default', desc: 'app_config' }
            ]
        }
    ];

    return (
        <div className={`main-dashboard main-dashboard--${theme}`}>
            <header className="main-dashboard__header">
                <div className="main-dashboard__header-content">
                    <h1 className="main-dashboard__greeting">
                        {t(greeting)}, <span className="main-dashboard__username">{user?.full_name || 'User'}</span>
                    </h1>
                    <p className="main-dashboard__subtitle">{t('main_subtitle')}</p>
                </div>
                <button className="main-dashboard__logout-btn" onClick={logout} title={t('logout')}>
                    <LogOut className="main-dashboard__logout-icon" size={20} />
                </button>
            </header>

            <div className="main-dashboard__content">
                {menuItems.map((section, idx) => (
                    <section key={idx} className="main-dashboard__section">
                        <h3 className="main-dashboard__section-title">{t(section.category)}</h3>
                        <div className="main-dashboard__grid">
                            {section.items.map((item, i) => (
                                <article 
                                    key={i} 
                                    className={`dashboard-card dashboard-card--${item.color}`}
                                    onClick={() => navigate(item.link)}
                                >
                                    <div className="dashboard-card__icon-box">
                                        <item.icon size={24} strokeWidth={1.5} />
                                    </div>
                                    <div className="dashboard-card__info">
                                        <h4 className="dashboard-card__title">{t(item.title)}</h4>
                                        <p className="dashboard-card__desc">{t(item.desc)}</p>
                                    </div>
                                    <div className="dashboard-card__action">
                                        <ArrowRight size={18} />
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default MainPage;