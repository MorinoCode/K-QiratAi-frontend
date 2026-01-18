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
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Goodafternoon');
        else setGreeting('Good evening');
    }, []);

    const menuItems = [
        {
            category: 'sales_operations',
            items: [
                { title: 'new_sale', icon: ShoppingCart, link: '/sales', color: 'primary', desc: 'start invoice' },
                { title: 'customers', icon: Users, link: '/customers', color: 'secondary', desc: 'manage crm' },
                { title: 'gold_calculator', icon: Calculator, link: '/calculator', color: 'secondary', desc: 'quick calc' }
            ]
        },
        {
            category: 'inventory_stock',
            items: [
                { title: 'inventory', icon: Package, link: '/inventory', color: 'default', desc: 'view stock' },
                { title: 'add_item', icon: PlusCircle, link: '/inventory/add', color: 'default', desc: 'new stock' },
                { title: 'old_gold', icon: RefreshCw, link: '/old-gold', color: 'default', desc: 'exchange buy' }
            ]
        },
        {
            category: 'management',
            items: [
                { title: 'dashboard', icon: BarChart2, link: '/dashboard', color: 'accent', desc: 'analytics kpi' },
                { title: 'settings', icon: Settings, link: '/settings', color: 'default', desc: 'app config' }
            ]
        }
    ];

    return (
        <div className={`main-dashboard main-dashboard--${theme}`}>
            <header className="main-dashboard__header">
                <div className="main-dashboard__header-content">
                    <h1 className="main-dashboard__greeting-title">
                        {t(greeting)}, 
                        <span className="main-dashboard__username"> {user?.full_name || 'User'}</span>
                    </h1>
                    
                </div>
                <button className="main-dashboard__logout-btn" onClick={logout} title={t('logout')}>
                    <LogOut className="main-dashboard__logout-icon" size={20} />
                </button>
            </header>

            <div className="main-dashboard__container">
                {menuItems.map((section, idx) => (
                    <section key={idx} className="main-dashboard__section">
                        <h3 className="main-dashboard__section-title">{t(section.category)}</h3>
                        <div className="main-dashboard__grid">
                            {section.items.map((item, i) => (
                                <article 
                                    key={i} 
                                    className={`main-dashboard__card main-dashboard__card--${item.color}`}
                                    onClick={() => navigate(item.link)}
                                >
                                    <div className="main-dashboard__card-icon-wrapper">
                                        <item.icon className="main-dashboard__card-icon" size={28} strokeWidth={1.5} />
                                    </div>
                                    <div className="main-dashboard__card-content">
                                        <h4 className="main-dashboard__card-title">{t(item.title)}</h4>
                                        <p className="main-dashboard__card-desc">{t(item.desc)}</p>
                                    </div>
                                    <div className="main-dashboard__card-arrow-box">
                                        <ArrowRight className="main-dashboard__card-arrow-icon" size={16} />
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