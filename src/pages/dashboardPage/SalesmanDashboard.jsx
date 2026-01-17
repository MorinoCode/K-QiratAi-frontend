import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, QrCode, Search, Repeat } from 'lucide-react';
import api from '../../api/axios';
import { useGoldSocket } from '../../hooks/useGoldSocket';
import { useTheme } from '../../context/ThemeContext';

const SalesmanDashboard = () => {
    const navigate = useNavigate();
    const { prices } = useGoldSocket();
    const { theme } = useTheme();
    const [data, setData] = useState(null);

    useEffect(() => {
        api.get('/dashboard/salesman').then(res => setData(res.data.data));
    }, []);

    return (
        <div className={`sales-dashboard sales-dashboard--${theme}`}>
            {/* Big Live Price (POS Style) */}
            <div className="price-display">
                <div className="price-display__label">Today's Gold Rate (21K)</div>
                <div className="price-display__value-wrapper">
                    <span className="price-display__value">{prices?.gold?.karat21 || '...'}</span>
                    <span className="price-display__unit">KWD</span>
                </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="action-grid">
                <button 
                    onClick={() => navigate('/sales/new')}
                    className="action-card action-card--primary"
                >
                    <PlusCircle size={48} className="action-card__icon" />
                    <span className="action-card__label">NEW SALE</span>
                </button>

                <button 
                    onClick={() => navigate('/customers/scan')}
                    className={`action-card action-card--${theme}`}
                >
                    <QrCode size={48} className="action-card__icon action-card__icon--faded" />
                    <span className="action-card__label">SCAN CUSTOMER ID</span>
                </button>

                <button 
                    onClick={() => navigate('/inventory/check')}
                    className={`action-card action-card--${theme}`}
                >
                    <Search size={48} className="action-card__icon action-card__icon--faded" />
                    <span className="action-card__label">CHECK PRICE</span>
                </button>

                <button 
                    onClick={() => navigate('/old-gold/buy')}
                    className={`action-card action-card--secondary-${theme}`}
                >
                    <Repeat size={48} className="action-card__icon" />
                    <span className="action-card__label">OLD GOLD</span>
                </button>
            </div>

            {/* My Stats Footer */}
            <div className={`stats-footer stats-footer--${theme}`}>
                <div className="stats-footer__label">My Sales Today:</div>
                <div className="stats-footer__value">{data?.my_stats?.total_sales_today} KD</div>
            </div>
        </div>
    );
};

export default SalesmanDashboard;