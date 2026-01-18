import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './CustomerDetailPage.css';
import { 
    User, ArrowLeft, MapPin, TrendingUp, ShoppingBag, CreditCard, Download, Calendar, Phone, Globe, Shield 
} from 'lucide-react';

const CustomerDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const API_BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/customers/${id}`);
                setData(res.data.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert(t('customer_not_found'));
                navigate('/customers');
            }
        };
        fetchDetails();
    }, [id, navigate, t]);

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${API_BASE_URL}${cleanUrl}`;
    };

    const handleDownloadInvoice = (invoice) => {
        const safeBranch = 'Branch'; 
        const fileName = `INV-${safeBranch}-${invoice.invoice_number}.pdf`;
        const url = `${API_BASE_URL}/uploads/invoices/${fileName}`;
        window.open(url, '_blank');
    };

    if (loading) return (
        <div className={`customer-details customer-details--${theme} customer-details--loading`}>
            <div className="customer-details__loader"></div>
            <span>{t('loading')}</span>
        </div>
    );

    const { customer, history, stats } = data;

    return (
        <div className={`customer-details customer-details--${theme}`}>
            <header className="customer-details__header">
                <button className="customer-details__back-btn" onClick={() => navigate('/customers')}>
                    <ArrowLeft size={20}/> {t('back')}
                </button>
                <div className="customer-details__title-group">
                    <h1 className="customer-details__name">{customer.full_name}</h1>
                    <span className={`customer-details__badge customer-details__badge--${customer.type.toLowerCase()}`}>
                        {customer.type}
                    </span>
                </div>
            </header>

            <div className="customer-details__grid">
                <aside className="customer-details__sidebar">
                    <div className="customer-card customer-profile">
                        <div className="customer-profile__avatar-wrapper">
                            <div className="customer-profile__avatar">
                                <User size={40}/>
                            </div>
                        </div>
                        
                        <div className="customer-profile__content">
                            <h3 className="customer-profile__civil-id">{customer.civil_id || t('no_civil_id')}</h3>
                            
                            <div className="customer-profile__info-list">
                                <div className="customer-profile__info-item">
                                    <Phone size={14} className="customer-profile__icon"/>
                                    <span className="customer-profile__label">{t('phone')}:</span>
                                    <span className="customer-profile__value">{customer.phone}</span>
                                </div>
                                <div className="customer-profile__info-item">
                                    <Globe size={14} className="customer-profile__icon"/>
                                    <span className="customer-profile__label">{t('nationality')}:</span>
                                    <span className="customer-profile__value">{customer.nationality}</span>
                                </div>
                                <div className="customer-profile__info-item">
                                    <User size={14} className="customer-profile__icon"/>
                                    <span className="customer-profile__label">{t('gender')}:</span>
                                    <span className="customer-profile__value">{customer.gender === 'M' ? t('male') : t('female')}</span>
                                </div>
                                <div className="customer-profile__info-item">
                                    <Calendar size={14} className="customer-profile__icon"/>
                                    <span className="customer-profile__label">{t('dob')}:</span>
                                    <span className="customer-profile__value">{customer.birth_date || '-'}</span>
                                </div>
                                <div className="customer-profile__info-item">
                                    <Shield size={14} className="customer-profile__icon"/>
                                    <span className="customer-profile__label">{t('expiry')}:</span>
                                    <span className="customer-profile__value">{customer.expiry_date || '-'}</span>
                                </div>
                            </div>

                            <div className="customer-profile__address">
                                <MapPin size={16} className="customer-profile__address-icon"/>
                                <span>{customer.address || t('no_address')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="customer-card customer-ids">
                        <div className="customer-card__header">
                            <CreditCard size={18}/>
                            <h3>{t('stored_id_cards')}</h3>
                        </div>
                        
                        <div className="customer-ids__grid">
                            <div className="customer-ids__item">
                                <span className="customer-ids__label">{t('front_id')}</span>
                                {customer.id_card_front_url ? (
                                    <div className="customer-ids__image-container">
                                        <img 
                                            src={getImageUrl(customer.id_card_front_url)} 
                                            alt="Front ID" 
                                            className="customer-ids__img"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/300x180?text=Error'}
                                        />
                                    </div>
                                ) : <div className="customer-ids__placeholder">{t('no_front_image')}</div>}
                            </div>

                            <div className="customer-ids__item">
                                <span className="customer-ids__label">{t('back_id')}</span>
                                {customer.id_card_back_url ? (
                                    <div className="customer-ids__image-container">
                                        <img 
                                            src={getImageUrl(customer.id_card_back_url)} 
                                            alt="Back ID" 
                                            className="customer-ids__img"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/300x180?text=Error'}
                                        />
                                    </div>
                                ) : <div className="customer-ids__placeholder">{t('no_back_image')}</div>}
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="customer-details__content">
                    <div className="customer-card customer-insights">
                        <div className="customer-card__header">
                            <TrendingUp size={20}/>
                            <h3>{t('ai_shopping_insights')}</h3>
                        </div>
                        
                        <div className="customer-insights__stats">
                            <div className="customer-insights__stat-box">
                                <span className="customer-insights__label">{t('total_spent')}</span>
                                <span className="customer-insights__value">
                                    {stats.total_spent} <small>{t('kwd')}</small>
                                </span>
                            </div>
                            <div className="customer-insights__stat-box">
                                <span className="customer-insights__label">{t('transactions')}</span>
                                <span className="customer-insights__value">{stats.invoice_count}</span>
                            </div>
                            <div className="customer-insights__stat-box">
                                <span className="customer-insights__label">{t('last_visit')}</span>
                                <span className="customer-insights__value">
                                    {stats.last_purchase ? new Date(stats.last_purchase).toLocaleDateString() : t('never')}
                                </span>
                            </div>
                        </div>
                        
                        <div className="customer-insights__prediction">
                            <span className="customer-insights__prediction-icon">🤖</span>
                            <div className="customer-insights__prediction-text">
                                <strong>{t('ai_analysis')}:</strong> 
                                <span> {parseInt(stats.invoice_count) > 2 ? t('ai_frequent_buyer') : t('ai_new_customer')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="customer-card customer-history">
                        <div className="customer-card__header">
                            <ShoppingBag size={20}/>
                            <h3>{t('purchase_history')}</h3>
                        </div>
                        
                        <div className="customer-history__wrapper">
                            <table className="customer-history__table">
                                <thead>
                                    <tr>
                                        <th>{t('date')}</th>
                                        <th>{t('invoice_no')}</th>
                                        <th>{t('items')}</th>
                                        <th>{t('total')}</th>
                                        <th>{t('action')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(inv => (
                                        <tr 
                                            key={inv.id} 
                                            onClick={() => handleDownloadInvoice(inv)} 
                                            className="customer-history__row"
                                            title={t('click_download')}
                                        >
                                            <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                            <td className="customer-history__invoice-id">{inv.invoice_number}</td>
                                            <td>{inv.items?.length || 0}</td>
                                            <td className="customer-history__amount">{inv.total_amount} {t('kwd')}</td>
                                            <td>
                                                <button className="customer-history__download-btn">
                                                    <Download size={16}/> {t('pdf')}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="customer-history__empty">
                                                {t('no_purchases_yet')}
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

export default CustomerDetailsPage;