import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

const RevenueChart = ({ data, theme }) => {
    const { t } = useTranslation();
    const isDark = theme === 'dark';

    if (!data || data.length === 0) return <div className="no-data">No Data Available</div>;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    };

    const chartData = data.map(d => ({
        ...d,
        revenue: parseFloat(d.revenue) || 0,
        weight: parseFloat(d.weight) || 0
    }));

    return (
        <div className={`chart-container chart-container--${theme}`}>
            <h3 className="chart-title">{t('sales_trend')}</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#B8860B" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#B8860B" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#eee'} />
                        <XAxis
                            dataKey="date"
                            stroke={isDark ? '#888' : '#666'}
                            tickFormatter={formatDate}
                            label={{ value: t('date'), position: 'insideBottomRight', offset: 0 }}
                        />
                        <YAxis
                            stroke={isDark ? '#888' : '#666'}
                            label={{ value: 'KWD', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: isDark ? '#1a1a1a' : '#fff', borderRadius: '8px', border: 'none' }}
                            labelFormatter={formatDate}
                            formatter={(value) => [`${parseFloat(value).toLocaleString()} KWD`, t('revenue')]}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#B8860B"
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            name={t('revenue')}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;
