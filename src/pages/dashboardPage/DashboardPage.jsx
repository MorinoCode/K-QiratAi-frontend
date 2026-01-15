import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import translation hook
import api from '../../api/axios';
import './DashboardPage.css';
import { TrendingUp, DollarSign, Package } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { t } = useTranslation(); // Use translation hook
    
    const [rates, setRates] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [ratesRes, statsRes] = await Promise.all([
                api.get('/dashboard/rates'),
                api.get('/dashboard/stats')
            ]);

            setRates(ratesRes.data.rates);
            setStats(statsRes.data.data);
            
            setLoading(false);
        } catch (err) {
            console.error("Dashboard failed:", err);
            setLoading(false);
            if (err.response?.status === 401) {
                localStorage.removeItem('tenant_id');
                navigate('/login');
            }
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
                <p>{t('syncing_market', 'SYNCING WITH KUWAIT GOLD MARKET...')}</p>
            </div>
        );
    }

    return (
        <div className={`dashboard dashboard--${theme}`}>
            <main className={`dashboard__content dashboard__content--${theme}`}>
                <header className={`dashboard__header dashboard__header--${theme}`}>
                    <div className="dashboard__header-info">
                        <h1 className="dashboard__title">{t('market_overview', 'Market Overview')}</h1>
                        <p className="dashboard__subtitle">{t('live_gold_rates', 'Live gold rates in Kuwaiti Dinar (KWD)')}</p>
                    </div>
                </header>

                {/* Live Rates Section */}
                <section className="dashboard__grid">
                    {rates && rates.Gold && Object.entries(rates.Gold).map(([karat, price]) => (
                        <div key={karat} className={`price-card price-card--${theme}`}>
                            <div className="price-card__header">
                                <span className="price-card__label">{karat} {t('gold', 'GOLD')}</span>
                                <TrendingUp size={16} className="price-card__icon" />
                            </div>
                            <span className="price-card__value">
                                {parseFloat(price).toFixed(3)} <small>{t('kwd', 'KWD')}</small>
                            </span>
                        </div>
                    ))}
                    {rates && rates.Silver > 0 && (
                        <div className={`price-card price-card--${theme} silver-card`}>
                            <div className="price-card__header">
                                <span className="price-card__label">{t('silver', 'SILVER')}</span>
                                <TrendingUp size={16} className="price-card__icon" />
                            </div>
                            <span className="price-card__value">
                                {parseFloat(rates.Silver).toFixed(3)} <small>{t('kwd', 'KWD')}</small>
                            </span>
                        </div>
                    )}
                </section>

                {/* Store Statistics Section */}
                <section className="dashboard__stats">
                    {/* Inventory Value */}
                    <div className={`stat-box stat-box--${theme}`}>
                        <span className="stat-box__label">
                            <Package size={14} className="stat-icon"/> {t('inventory_value', 'Inventory Value (Cost)')}
                        </span>
                        <div className="stat-box__row">
                            <h2 className="stat-box__value">
                                {stats?.inventory_value_cost ? parseFloat(stats.inventory_value_cost).toFixed(3) : "0.000"} 
                                <span className="stat-box__currency">{t('kwd', 'KWD')}</span>
                            </h2>
                        </div>
                    </div>

                    {/* Total Sales Volume */}
                    <div className={`stat-box stat-box--${theme}`}>
                        <span className="stat-box__label">
                            <DollarSign size={14} className="stat-icon"/> {t('total_sales', 'Total Sales Volume')}
                        </span>
                        <h2 className="stat-box__value stat-box__value--positive">
                            {stats?.total_sales ? parseFloat(stats.total_sales).toFixed(3) : "0.000"}
                            <span className="stat-box__currency">{t('kwd', 'KWD')}</span>
                        </h2>
                    </div>

                    {/* Items In Stock */}
                    <div className={`stat-box stat-box--${theme}`}>
                        <span className="stat-box__label">{t('items_in_stock', 'Items In Stock')}</span>
                        <h2 className="stat-box__value">
                            {stats?.items_count || 0}
                            <span className="stat-box__currency" style={{fontSize: '0.8rem'}}>{t('pcs', 'PCS')}</span>
                        </h2>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default DashboardPage;