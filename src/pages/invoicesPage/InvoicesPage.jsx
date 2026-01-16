import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './InvoicesPage.css';
import { 
    FileText, Search, Download, Calendar, Filter, Eye, X 
} from 'lucide-react';

const InvoicesPage = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const API_URL = 'http://localhost:5000';

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD

    const activeBranchId = localStorage.getItem('active_branch_id');
    const activeBranchName = localStorage.getItem('active_branch_name') || t('all_branches');

    useEffect(() => {
        fetchInvoices();
    }, [activeBranchId]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            // فرض بر این است که اندپوینت مناسب در بک‌اند وجود دارد
            const res = await api.get(`/sales/invoices?branch_id=${activeBranchId}`);
            setInvoices(res.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDownload = (invoice) => {
        const safeBranch = 'Main-Branch'; 
        const fileName = `INV-${safeBranch}-${invoice.invoice_number}.pdf`;
        const url = `${API_URL}/uploads/invoices/${fileName}`;
        window.open(url, '_blank');
    };

    const filteredInvoices = invoices.filter(inv => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
            inv.invoice_number.toLowerCase().includes(term) ||
            (inv.customer && inv.customer.full_name.toLowerCase().includes(term)) ||
            (inv.customer && inv.customer.phone.includes(term));

        let matchesDate = true;
        if (dateFilter) {
            const invDate = new Date(inv.createdAt).toISOString().split('T')[0];
            matchesDate = invDate === dateFilter;
        }

        return matchesSearch && matchesDate;
    });

    const totalRevenue = filteredInvoices.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0);

    return (
        <div className={`invoices-page invoices-page--${theme}`}>
            <header className="invoices-header">
                <div className="invoices-header__titles">
                    <h1 className="invoices-title">
                        <FileText size={24} className="invoices-icon"/> {t('invoices')}
                    </h1>
                    <p className="invoices-subtitle">{activeBranchName}</p>
                </div>
                
                <div className="invoices-stats">
                    <div className="invoices-stat-box">
                        <span>{t('total_invoices')}:</span>
                        <strong>{filteredInvoices.length}</strong>
                    </div>
                    <div className="invoices-stat-box invoices-stat-box--gold">
                        <span>{t('total_revenue')}:</span>
                        <strong>{totalRevenue.toFixed(3)} {t('kwd')}</strong>
                    </div>
                </div>
            </header>

            <div className="invoices-controls">
                <div className="invoices-search">
                    <Search size={18} className="invoices-search__icon"/>
                    <input 
                        className="invoices-search__input"
                        placeholder={t('search_invoice_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="invoices-filter">
                    <Calendar size={18} className="invoices-filter__icon"/>
                    <input 
                        type="date" 
                        className="invoices-filter__input"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                    {dateFilter && (
                        <button className="invoices-filter__clear" onClick={() => setDateFilter('')}>
                            <X size={16}/>
                        </button>
                    )}
                </div>
            </div>

            <div className="invoices-table-container">
                <div className="invoices-table-wrapper">
                    <table className="invoices-table">
                        <thead className="invoices-table__head">
                            <tr>
                                <th>{t('invoice_no')}</th>
                                <th>{t('date')}</th>
                                <th>{t('customer')}</th>
                                <th>{t('items')}</th>
                                <th>{t('total_amount')}</th>
                                <th>{t('payment_method')}</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="invoices-table__body">
                            {filteredInvoices.map(inv => (
                                <tr key={inv.id} className="invoices-row">
                                    <td className="invoices-row__cell invoices-row__no">{inv.invoice_number}</td>
                                    <td className="invoices-row__cell">
                                        {new Date(inv.createdAt).toLocaleDateString()} 
                                        <small className="invoices-row__time">{new Date(inv.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                    </td>
                                    <td className="invoices-row__cell invoices-row__customer">
                                        {inv.customer ? inv.customer.full_name : t('unknown')}
                                    </td>
                                    <td className="invoices-row__cell">{inv.items ? inv.items.length : 0}</td>
                                    <td className="invoices-row__cell invoices-row__amount">
                                        {parseFloat(inv.total_amount).toFixed(3)} {t('kwd')}
                                    </td>
                                    <td className="invoices-row__cell">
                                        {inv.payments && inv.payments.length > 0 ? (
                                            <div className="payment-tags">
                                                {inv.payments.map((p, i) => (
                                                    <span key={i} className="payment-tag">{p.method}</span>
                                                ))}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="invoices-row__cell">
                                        <div className="invoices-actions">
                                            <button 
                                                className="invoices-btn invoices-btn--download" 
                                                onClick={() => handleDownload(inv)}
                                                title={t('download_pdf')}
                                            >
                                                <Download size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="7" className="invoices-empty">{t('no_invoices_found')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoicesPage;