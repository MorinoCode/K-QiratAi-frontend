import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './StaffDetailsPage.css';
import { User, ArrowLeft, Briefcase, TrendingUp, Calendar } from 'lucide-react';

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

    if (loading) return <div className={`staff-page staff-page--${theme} staff-page--loading`}>{t('loading_analysis')}</div>;

    const { staff, history, stats } = data;

    return (
        <div className={`staff-page staff-page--${theme}`}>
            <header className="staff-page__header">
                <button className="staff-page__back-btn" onClick={() => navigate('/manage')}>
                    <ArrowLeft size={20}/> {t('back_to_list')}
                </button>
                <h1 className="staff-page__title">{staff.full_name}</h1>
                <span className={`staff-page__badge staff-page__badge--${staff.role}`}>{staff.role}</span>
            </header>

            <div className="staff-grid">
                <div className="staff-sidebar">
                    <div className="staff-info-card">
                        <div className="staff-avatar-placeholder"><User size={40}/></div>
                        <h3 className="staff-info-card__username">{staff.username}</h3>
                        <p className="staff-info-card__detail">
                            <Briefcase size={14}/> {staff.branch ? staff.branch.name : t('no_branch')}
                        </p>
                        <p className="staff-info-card__detail">
                            <Calendar size={14}/> {t('joined')}: {new Date(staff.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    <div className="staff-ai-card">
                        <div className="staff-ai-header">
                            <TrendingUp size={18}/> 
                            <span>{t('ai_performance_analytics')}</span>
                        </div>
                        <div className="staff-stat-row">
                            <span>{t('total_sales_volume')}:</span>
                            <strong>{stats.total_sales_volume} {t('kwd')}</strong>
                        </div>
                        <div className="staff-stat-row">
                            <span>{t('total_invoices')}:</span>
                            <strong>{stats.total_invoices}</strong>
                        </div>
                        <div className="staff-ai-insight">
                            <p>🤖 <strong>{t('ai_insight')}:</strong> {t('ai_insight_text')}</p>
                        </div>
                    </div>
                </div>

                <div className="staff-content">
                    <h2 className="staff-content__title">{t('recent_sales_history')}</h2>
                    <div className="staff-table-wrapper">
                        <table className="staff-data-table">
                            <thead className="staff-data-table__head">
                                <tr>
                                    <th>{t('date')}</th>
                                    <th>{t('invoice_no')}</th>
                                    <th>{t('customer')}</th>
                                    <th>{t('amount')}</th>
                                </tr>
                            </thead>
                            <tbody className="staff-data-table__body">
                                {history.map(inv => (
                                    <tr key={inv.id} className="staff-data-table__row">
                                        <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                        <td>{inv.invoice_number}</td>
                                        <td>{inv.customer ? inv.customer.full_name : t('unknown')}</td>
                                        <td className="staff-text-gold">{inv.total_amount} {t('kwd')}</td>
                                    </tr>
                                ))}
                                {history.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="staff-data-table__empty">
                                            {t('no_sales_records')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDetailsPage;