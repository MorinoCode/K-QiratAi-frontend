import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';

const BranchChart = ({ data, theme }) => {
    const { t } = useTranslation();
    const isDark = theme === 'dark';

    if (!data || data.length === 0) return <div className="no-data">No Data Available</div>;

    const chartData = data.map(d => ({
        ...d,
        value: parseFloat(d.value) || 0
    }));

    return (
        <div className={`chart-container chart-container--${theme}`}>
            <h3 className="chart-title">{t('branch_performance')}</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#eee'} />
                        <XAxis
                            dataKey="name"
                            stroke={isDark ? '#888' : '#666'}
                            label={{ value: t('branch_name'), position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis
                            stroke={isDark ? '#888' : '#666'}
                            label={{ value: 'KWD', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: isDark ? '#1a1a1a' : '#fff', borderRadius: '8px', border: 'none' }}
                            cursor={{ fill: isDark ? '#333' : '#f5f5f5' }}
                            formatter={(value) => [`${parseFloat(value).toLocaleString()} KWD`, t('revenue')]}
                        />
                        <Bar dataKey="value" name={t('revenue')} radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#B8860B' : '#888'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BranchChart;
