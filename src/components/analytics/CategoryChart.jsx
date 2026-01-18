import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const COLORS = ['#B8860B', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const CategoryChart = ({ data, theme }) => {
    const { t } = useTranslation();
    const isDark = theme === 'dark';

    // Normalize data: Convert value strings to numbers for Recharts
    const chartData = data?.map(d => ({
        ...d,
        value: parseFloat(d.value) || 0
    })) || [];

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className={`chart-container chart-container--${theme}`}>
            <h3 className="chart-title">{t('category_distribution')}</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={renderCustomLabel}
                            labelLine={false}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: isDark ? '#1a1a1a' : '#fff', borderRadius: '8px', border: 'none' }}
                            formatter={(value) => `${parseFloat(value).toLocaleString()} KWD`}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CategoryChart;
