import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './CustomerDetailPage.css';
import { 
    User, ArrowLeft, MapPin, TrendingUp, ShoppingBag, CreditCard, Download 
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
        return `${API_BASE_URL}${url}`;
    };

    const handleDownloadInvoice = (invoice) => {
        // Safe branch name logic or fetch from invoice if available
        const safeBranch = 'Main-Branch'; 
        const fileName = `INV-${safeBranch}-${invoice.invoice_number}.pdf`;
        const url = `${API_BASE_URL}/uploads/invoices/${fileName}`;
        window.open(url, '_blank');
    };

    if (loading) return (
        <div className={`cust-details-page cust-details-page--${theme} cust-details-page--loading`}>
            {t('loading')}
        </div>
    );

    const { customer, history, stats } = data;

    return (
        <div className={`cust-details-page cust-details-page--${theme}`}>
            <header className="cust-details-header">
                <button className="cust-details-back" onClick={() => navigate('/customers')}>
                    <ArrowLeft size={20}/> {t('back')}
                </button>
                <div className="cust-details-title-row">
                    <h1 className="cust-details-name">{customer.full_name}</h1>
                    <span className={`cust-details-badge cust-details-badge--${customer.type.toLowerCase()}`}>
                        {customer.type}
                    </span>
                </div>
            </header>

            <div className="cust-details-grid">
                {/* Left Column */}
                <div className="cust-details-col-left">
                    <div className="cust-profile-card">
                        <div className="cust-profile-avatar">
                            <User size={40}/>
                        </div>
                        <div className="cust-profile-info">
                            <h3 className="cust-profile-civil">{customer.civil_id || t('no_civil_id')}</h3>
                            <div className="cust-profile-row">
                                <span className="cust-label">{t('phone')}:</span> {customer.phone}
                            </div>
                            <div className="cust-profile-row">
                                <span className="cust-label">{t('nationality')}:</span> {customer.nationality}
                            </div>
                            <div className="cust-profile-row">
                                <span className="cust-label">{t('gender')}:</span> {customer.gender === 'M' ? t('male') : t('female')}
                            </div>
                            <div className="cust-profile-row">
                                <span className="cust-label">{t('dob')}:</span> {customer.birth_date || '-'}
                            </div>
                            <div className="cust-profile-row">
                                <span className="cust-label">{t('expiry')}:</span> {customer.expiry_date || '-'}
                            </div>
                            <div className="cust-profile-address">
                                <MapPin size={14}/> {customer.address || t('no_address')}
                            </div>
                        </div>
                    </div>

                    <div className="cust-id-card-box">
                        <div className="cust-id-header">
                            <CreditCard size={16}/> {t('stored_id_cards')}
                        </div>
                        
                        <div className="cust-id-image-wrapper">
                            <span className="cust-id-label">{t('front_id')}</span>
                            {customer.id_card_front_url ? (
                                <img 
                                    src={getImageUrl(customer.id_card_front_url)} 
                                    alt="Front ID" 
                                    className="cust-id-img"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/300x180?text=Error'}
                                />
                            ) : <div className="cust-id-placeholder">{t('no_front_image')}</div>}
                        </div>

                        <div className="cust-id-image-wrapper">
                            <span className="cust-id-label">{t('back_id')}</span>
                            {customer.id_card_back_url ? (
                                <img 
                                    src={getImageUrl(customer.id_card_back_url)} 
                                    alt="Back ID" 
                                    className="cust-id-img"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/300x180?text=Error'}
                                />
                            ) : <div className="cust-id-placeholder">{t('no_back_image')}</div>}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="cust-details-col-right">
                    <div className="cust-ai-dashboard">
                        <div className="cust-ai-header">
                            <TrendingUp size={20}/> <span>{t('ai_shopping_insights')}</span>
                        </div>
                        <div className="cust-ai-stats">
                            <div className="cust-ai-stat-box">
                                <span className="cust-stat-label">{t('total_spent')}</span>
                                <span className="cust-stat-value">
                                    {stats.total_spent} <small>{t('kwd')}</small>
                                </span>
                            </div>
                            <div className="cust-ai-stat-box">
                                <span className="cust-stat-label">{t('transactions')}</span>
                                <span className="cust-stat-value">{stats.invoice_count}</span>
                            </div>
                            <div className="cust-ai-stat-box">
                                <span className="cust-stat-label">{t('last_visit')}</span>
                                <span className="cust-stat-value">
                                    {stats.last_purchase ? new Date(stats.last_purchase).toLocaleDateString() : t('never')}
                                </span>
                            </div>
                        </div>
                        <div className="cust-ai-prediction">
                            <p>🤖 <strong>{t('ai_analysis')}:</strong> 
                                {parseInt(stats.invoice_count) > 2 
                                ? t('ai_frequent_buyer') 
                                : t('ai_new_customer')}
                            </p>
                        </div>
                    </div>

                    <div className="cust-history-section">
                        <h3 className="cust-history-title">
                            <ShoppingBag size={18}/> {t('purchase_history')}
                        </h3>
                        <div className="cust-history-wrapper">
                            <table className="cust-history-table">
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
                                            className="cust-history-row clickable"
                                            title={t('click_download')}
                                        >
                                            <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                            <td>{inv.invoice_number}</td>
                                            <td>{inv.items?.length || 0}</td>
                                            <td className="cust-text-gold">{inv.total_amount} {t('kwd')}</td>
                                            <td>
                                                <button className="cust-download-btn">
                                                    <Download size={16}/> PDF
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="cust-history-empty">
                                                {t('no_purchases_yet')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailsPage;