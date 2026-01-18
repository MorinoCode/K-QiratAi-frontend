import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import KPIStats from '../../components/analytics/KPIStats';
import RevenueChart from '../../components/analytics/RevenueChart';
import CategoryChart from '../../components/analytics/CategoryChart';
import BranchChart from '../../components/analytics/BranchChart';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        kpi: null,
        charts: null
    });
    const [dateRange, setDateRange] = useState('30days');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange, customStart, customEnd]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            let startDate = new Date();
            let endDate = new Date();

            if (dateRange === '7days') {
                startDate.setDate(endDate.getDate() - 7);
            } else if (dateRange === '30days') {
                startDate.setDate(endDate.getDate() - 30);
            } else if (dateRange === '90days') {
                startDate.setDate(endDate.getDate() - 90);
            } else if (dateRange === 'custom') {
                if (!customStart || !customEnd) {
                    setLoading(false);
                    return; // Wait for both dates
                }
                startDate = new Date(customStart);
                endDate = new Date(customEnd);
                // Set end date to end of day
                endDate.setHours(23, 59, 59, 999);
            }

            const response = await api.get('/dashboard/analytics', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });

            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`analytics-page analytics-page--${theme}`}>
            <header className="analytics-header">
                <div>
                    <h1 className="analytics-title">{t('dashboard_overview')}</h1>
                    <p className="analytics-subtitle">{t('welcome_back_analytics')}</p>
                </div>
                <div className="filter-group">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className={`filter-select filter-select--${theme}`}
                    >
                        <option value="7days">{t('last_7_days')}</option>
                        <option value="30days">{t('last_30_days')}</option>
                        <option value="90days">{t('last_3_months')}</option>
                        <option value="custom">{t('custom_range')}</option>
                    </select>

                    {dateRange === 'custom' && (
                        <div className="custom-date-inputs">
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className={`date-input date-input--${theme}`}
                            />
                            <span className="date-separator">-</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className={`date-input date-input--${theme}`}
                            />
                        </div>
                    )}
                </div>
            </header>

            {loading && !data.kpi ? (
                <div className="loading-screen">Loading Analytics...</div>
            ) : (
                <>
                    <section className="analytics-section">
                        <KPIStats data={data.kpi} theme={theme} />
                    </section>

                    <section className="analytics-grid">
                        <div className="analytics-grid__main">
                            <RevenueChart data={data.charts?.sales_trend} theme={theme} />
                        </div>
                        <div className="analytics-grid__side">
                            <CategoryChart data={data.charts?.category_distribution} theme={theme} />
                        </div>
                        <div className="analytics-grid__full">
                            <BranchChart data={data.charts?.branch_performance} theme={theme} />
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default AnalyticsPage;
