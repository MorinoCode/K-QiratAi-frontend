import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './StaffDetailsPage.css';
import { User, ArrowLeft, Briefcase, TrendingUp, Calendar, BadgeCheck } from 'lucide-react';

const StaffDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/manage/staff/${id}`);
                setData(res.data.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert(t('failed_load_staff'));
                navigate('/manage');
            }
        };
        fetchDetails();
    }, [id, navigate, t]);

    if (loading) return (
        <div className={`staff-page staff-page--${theme} staff-page--loading`}>
            <div className="staff-page__loader"></div>
            <span>{t('loading_analysis')}</span>
        </div>
    );

    const { staff, history, stats } = data;

    return (
        <div className={`staff-page staff-page--${theme}`}>
            <header className="staff-page__header">
                <button className="staff-page__back-btn" onClick={() => navigate('/manage')}>
                    <ArrowLeft size={20}/> {t('back_to_list')}
                </button>
                <div className="staff-page__title-group">
                    <h1 className="staff-page__title">{staff.full_name}</h1>
                    <span className={`staff-page__badge staff-page__badge--${staff.role}`}>
                        {t(staff.role)}
                    </span>
                </div>
            </header>

            <div className="staff-grid">
                <aside className="staff-sidebar">
                    <div className="staff-card staff-info">
                        <div className="staff-info__avatar-wrapper">
                            <div className="staff-info__avatar">
                                <User size={40}/>
                            </div>
                        </div>
                        <h3 className="staff-info__username">{staff.username}</h3>
                        
                        <div className="staff-info__details">
                            <div className="staff-info__detail-item">
                                <Briefcase size={16} className="staff-info__icon"/>
                                <span className="staff-info__value">
                                    {staff.branch ? staff.branch.name : t('no_branch')}
                                </span>
                            </div>
                            <div className="staff-info__detail-item">
                                <Calendar size={16} className="staff-info__icon"/>
                                <span className="staff-info__value">
                                    {t('joined')}: {new Date(staff.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="staff-card staff-ai">
                        <div className="staff-card__header">
                            <TrendingUp size={20}/> 
                            <h3>{t('ai_performance_analytics')}</h3>
                        </div>
                        
                        <div className="staff-ai__stats">
                            <div className="staff-ai__stat-row">
                                <span className="staff-ai__label">{t('total_sales_volume')}:</span>
                                <span className="staff-ai__value staff-ai__value--gold">
                                    {stats.total_sales_volume} <small>{t('kwd')}</small>
                                </span>
                            </div>
                            <div className="staff-ai__stat-row">
                                <span className="staff-ai__label">{t('total_invoices')}:</span>
                                <span className="staff-ai__value">{stats.total_invoices}</span>
                            </div>
                        </div>

                        <div className="staff-ai__insight">
                            <div className="staff-ai__insight-header">
                                <BadgeCheck size={16} /> {t('ai_insight')}
                            </div>
                            <p className="staff-ai__insight-text">
                                {t('ai_insight_text')}
                            </p>
                        </div>
                    </div>
                </aside>

                <main className="staff-content">
                    <div className="staff-card staff-history">
                        <h2 className="staff-card__title">{t('recent_sales_history')}</h2>
                        <div className="staff-table-wrapper">
                            <table className="staff-table">
                                <thead className="staff-table__head">
                                    <tr>
                                        <th>{t('date')}</th>
                                        <th>{t('invoice_no')}</th>
                                        <th>{t('customer')}</th>
                                        <th>{t('amount')}</th>
                                    </tr>
                                </thead>
                                <tbody className="staff-table__body">
                                    {history.map(inv => (
                                        <tr key={inv.id} className="staff-table__row">
                                            <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                            <td className="staff-table__invoice">{inv.invoice_number}</td>
                                            <td>{inv.customer ? inv.customer.full_name : t('unknown')}</td>
                                            <td className="staff-table__amount">{inv.total_amount} {t('kwd')}</td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="staff-table__empty">
                                                {t('no_sales_records')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StaffDetailsPage;