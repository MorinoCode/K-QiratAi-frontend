import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './DashboardPage.css';
import { TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/gold/dashboard');
            setSummary(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Dashboard failed:", err);
            setLoading(false);
            if (err.response?.status === 401) navigate('/login');
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 300000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className={`dashboard-loading dashboard-loading--${theme}`}>
                <div className="dashboard-loading__spinner"></div>
                <p>SYNCING WITH KUWAIT GOLD MARKET...</p>
            </div>
        );
    }

    return (
        <div className={`dashboard dashboard--${theme}`}>
            <main className={`dashboard__content dashboard__content--${theme}`}>
                <header className={`dashboard__header dashboard__header--${theme}`}>
                    <div className="dashboard__header-info">
                        <h1 className="dashboard__title">Market Overview</h1>
                        <p className="dashboard__subtitle">Live gold rates in Kuwaiti Dinar (KWD)</p>
                    </div>
                </header>

                <section className="dashboard__grid">
                    {summary && Object.entries(summary.live_rates).map(([karat, price]) => (
                        <div key={karat} className={`price-card price-card--${theme}`}>
                            <div className="price-card__header">
                                <span className="price-card__label">{karat.replace('k', '')}K GOLD</span>
                                <TrendingUp size={16} className="price-card__icon" />
                            </div>
                            <span className="price-card__value">
                                {parseFloat(price).toFixed(3)} <small>KWD</small>
                            </span>
                        </div>
                    ))}
                </section>

                <section className="dashboard__stats">
                    <div className={`stat-box stat-box--${theme}`}>
                        <span className="stat-box__label">Inventory Market Value</span>
                        <div className="stat-box__row">
                            <h2 className="stat-box__value">
                                {summary?.summary.total_current_kwd || "0.000"} 
                                <span className="stat-box__currency">KWD</span>
                            </h2>
                        </div>
                    </div>

                    <div className={`stat-box stat-box--${theme}`}>
                        <span className="stat-box__label">Profit/Loss</span>
                        <h2 className={`stat-box__value ${parseFloat(summary?.summary.profit_loss_kwd) >= 0 ? 'stat-box__value--positive' : 'stat-box__value--negative'}`}>
                            {summary?.summary.profit_loss_kwd || "0.000"}
                            <span className="stat-box__currency">KWD</span>
                        </h2>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default DashboardPage;