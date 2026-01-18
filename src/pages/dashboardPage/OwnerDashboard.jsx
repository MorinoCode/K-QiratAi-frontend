import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, EyeOff, TrendingUp, AlertTriangle } from 'lucide-react'; 
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { useGoldSocket } from '../../hooks/useGoldSocket';

const COLORS = ['#D4AF37', '#000000', '#FFBB28', '#FF8042'];

const OwnerDashboard = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const { prices } = useGoldSocket();
    const [data, setData] = useState(null);
    const [showProfit, setShowProfit] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/dashboard/owner');
                setData(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="dashboard-loader"><span className="dashboard-loader__text">Loading Dashboard...</span></div>;

    return (
        <div className={`owner-dashboard owner-dashboard--${theme}`}>
            
            {/* Live Ticker */}
            <div className={`ticker-bar ticker-bar--${theme}`}>
                <div className="ticker-bar__rates">
                    <span className="ticker-bar__label">LIVE GOLD:</span>
                    <span className="ticker-bar__item">24K: {prices?.gold?.karat24 || '...'}</span>
                    <span className="ticker-bar__item">22K: {prices?.gold?.karat22 || '...'}</span>
                    <span className="ticker-bar__item">21K: {prices?.gold?.karat21 || '...'}</span>
                    <span className="ticker-bar__item">18K: {prices?.gold?.karat18 || '...'}</span>
                </div>
                <div className="ticker-bar__exchange">
                    USD/KWD: {prices?.exchange_rate}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className={`kpi-card kpi-card--${theme}`}>
                    <h3 className="kpi-card__title">Total Sales Today</h3>
                    <div className="kpi-card__value-wrapper">
                        <span className="kpi-card__value">{data?.kpi?.total_sales}</span>
                        <span className="kpi-card__unit">KWD</span>
                    </div>
                </div>

                <div className={`kpi-card kpi-card--${theme}`}>
                    <h3 className="kpi-card__title">Net Profit</h3>
                    <div className="kpi-card__action-row">
                        <div className="kpi-card__value-wrapper kpi-card__value-wrapper--profit">
                            {showProfit ? `${data?.kpi?.net_profit} KWD` : '•••••••'}
                        </div>
                        <button onClick={() => setShowProfit(!showProfit)} className="kpi-card__toggle-btn">
                            {showProfit ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                    </div>
                </div>

                <div className={`kpi-card kpi-card--${theme}`}>
                    <h3 className="kpi-card__title">Total Weight Sold</h3>
                    <div className="kpi-card__value-wrapper">
                        <span className="kpi-card__value">{data?.kpi?.total_weight}</span>
                        <span className="kpi-card__unit">g</span>
                    </div>
                </div>

                <div className={`kpi-card kpi-card--${theme}`}>
                    <h3 className="kpi-card__title">WhatsApp Status</h3>
                    <div className={`kpi-card__status ${data?.kpi?.whatsapp_status === 'CONNECTED' ? 'kpi-card__status--connected' : 'kpi-card__status--disconnected'}`}>
                        {data?.kpi?.whatsapp_status}
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="insights-grid">
                {data?.ai_insights?.map((insight, idx) => (
                    <div key={idx} className={`insight-card insight-card--${theme} insight-card--${insight.type}`}>
                        {insight.type === 'prediction' ? <TrendingUp className="insight-card__icon insight-card__icon--blue"/> : <AlertTriangle className="insight-card__icon insight-card__icon--orange"/>}
                        <p className="insight-card__text">{insight.text}</p>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className={`chart-box chart-box--${theme}`}>
                    <h3 className="chart-box__title">Weekly Sales Trend</h3>
                    <div className="chart-box__container">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data?.charts?.weekly_sales}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.3} />
                                <XAxis dataKey="date" style={{fontSize: 10}} />
                                <YAxis style={{fontSize: 10}} />
                                <Tooltip />
                                <Line type="monotone" dataKey="daily_sales" stroke="#D4AF37" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={`chart-box chart-box--${theme}`}>
                    <h3 className="chart-box__title">Sales by Branch</h3>
                    <div className="chart-box__container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.charts?.branch_pie}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="total_sales"
                                >
                                    {data?.charts?.branch_pie.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;