import React from 'react';
import { TrendingUp, Scale, Coins, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const KPIStats = ({ data, theme }) => {
    const { t } = useTranslation();

    if (!data) return null;

    const cards = [
        {
            title: t('total_revenue'),
            value: `${parseFloat(data.revenue).toLocaleString()} KWD`,
            icon: <Coins size={24} />,
            color: 'gold'
        },
        {
            title: t('gross_profit'),
            value: `${parseFloat(data.profit).toLocaleString()} KWD`,
            icon: <TrendingUp size={24} />,
            color: 'green'
        },
        {
            title: t('weight_sold'),
            value: `${parseFloat(data.weight_sold).toFixed(2)} g`,
            icon: <Scale size={24} />,
            color: 'blue'
        },
        {
            title: t('transactions'),
            value: data.transactions,
            icon: <ShoppingBag size={24} />,
            color: 'purple'
        }
    ];

    return (
        <div className="kpi-grid">
            {cards.map((card, index) => (
                <div key={index} className={`kpi-card kpi-card--${theme} kpi-card--${card.color}`}>
                    <div className="kpi-card__icon-wrapper">
                        {card.icon}
                    </div>
                    <div className="kpi-card__content">
                        <span className="kpi-card__title">{card.title}</span>
                        <h3 className="kpi-card__value">{card.value}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KPIStats;
