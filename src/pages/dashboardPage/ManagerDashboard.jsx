import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { useGoldSocket } from '../../hooks/useGoldSocket';

const ManagerDashboard = () => {
    const { theme } = useTheme();
    const { prices } = useGoldSocket();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/dashboard/manager');
                setData(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="dashboard-loader"><span className="dashboard-loader__text">Loading Manager Dashboard...</span></div>;

    return (
        <div className={`manager-dashboard manager-dashboard--${theme}`}>
            <div className={`ticker-bar ticker-bar--${theme}`}>
                <span className="ticker-bar__highlight">GOLD 21K: {prices?.gold?.karat21 || '...'}</span>
                <span className="ticker-bar__subtext">Branch: Main</span>
            </div>

            {/* Manager KPIs */}
            <div className="kpi-grid">
                <div className={`kpi-card kpi-card--${theme}`}>
                    <div className="kpi-card__title">Today's Sales</div>
                    <div className="kpi-card__value-wrapper">
                         <span className="kpi-card__value">{data?.kpi?.branch_sales}</span>
                         <span className="kpi-card__unit">KD</span>
                    </div>
                </div>
                <div className={`kpi-card kpi-card--${theme}`}>
                    <div className="kpi-card__title">Cash In Hand</div>
                    <div className="kpi-card__value-wrapper">
                        <span className="kpi-card__value">{data?.kpi?.cash_in_hand}</span>
                        <span className="kpi-card__unit">KD</span>
                    </div>
                </div>
                <div className={`kpi-card kpi-card--${theme}`}>
                    <div className="kpi-card__title">Invoices</div>
                    <div className="kpi-card__value-wrapper">
                        <span className="kpi-card__value">{data?.kpi?.invoice_count}</span>
                    </div>
                </div>
                <div className={`kpi-card kpi-card--${theme} kpi-card--alert`}>
                    <div className="kpi-card__title kpi-card__title--alert">Low Stock Alerts</div>
                    <div className="kpi-card__value-wrapper">
                        <span className="kpi-card__value kpi-card__value--alert">{data?.kpi?.low_stock_count}</span>
                    </div>
                </div>
            </div>

            <div className="content-grid">
                {/* Low Stock Table */}
                <div className={`content-panel content-panel--${theme}`}>
                    <h3 className="content-panel__title content-panel__title--alert">⚠️ Low Stock Items</h3>
                    <table className="stock-table">
                        <thead className="stock-table__head">
                            <tr className="stock-table__row">
                                <th className="stock-table__header">Item Name</th>
                                <th className="stock-table__header">Current</th>
                                <th className="stock-table__header">Min Limit</th>
                            </tr>
                        </thead>
                        <tbody className="stock-table__body">
                            {data?.alerts?.low_stock_items.map((item, i) => (
                                <tr key={i} className={`stock-table__row stock-table__row--${theme}`}>
                                    <td className="stock-table__cell">{item.name}</td>
                                    <td className="stock-table__cell stock-table__cell--alert">{item.qty}</td>
                                    <td className="stock-table__cell stock-table__cell--faded">{item.min}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Staff Leaderboard */}
                <div className={`content-panel content-panel--${theme}`}>
                    <h3 className="content-panel__title">Top Sellers Today</h3>
                    <div className="content-panel__chart">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={data?.charts?.staff_leaderboard} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="creator.full_name" type="category" width={100} style={{fontSize:12}} />
                                <Tooltip />
                                <Bar dataKey="total_sales" fill="#D4AF37" radius={[0, 5, 5, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;