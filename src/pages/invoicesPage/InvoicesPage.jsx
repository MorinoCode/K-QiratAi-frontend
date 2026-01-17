import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext'; // Need auth context to check role
import './InvoicesPage.css';
import { 
    FileText, Search, Download, Calendar, X, Filter 
} from 'lucide-react';

const InvoicesPage = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { user } = useAuth(); // Get current user info
    const API_URL = 'http://localhost:5000';

    const [invoices, setInvoices] = useState([]);
    const [branches, setBranches] = useState([]); // List of branches for filter
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [selectedBranchId, setSelectedBranchId] = useState(''); // Filter state

    // Get active branch from local storage (default behavior)
    const activeBranchId = localStorage.getItem('active_branch_id');
    const isOwner = user?.role === 'store_owner';

    useEffect(() => {
        if (isOwner) {
            fetchBranches();
        }
        // Initialize filter with active branch or empty for owner
        if (!isOwner) {
            setSelectedBranchId(activeBranchId);
        }
    }, [isOwner, activeBranchId]);

    useEffect(() => {
        fetchInvoices();
    }, [selectedBranchId, searchTerm, dateFilter]); // Re-fetch when filters change

    const fetchBranches = async () => {
        try {
            // Assuming you have a route to get branches. If not, creates one.
            const res = await api.get('/platform/branches'); // Adjust route if needed
            setBranches(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch branches", err);
        }
    };

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            let query = `/sales/invoices?`; // Fixed endpoint path
            
            if (selectedBranchId) query += `branch_id=${selectedBranchId}&`;
            if (searchTerm) query += `search=${searchTerm}&`;
            if (dateFilter) query += `date=${dateFilter}&`;

            const res = await api.get(query);
            setInvoices(res.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleDownload = (invoice) => {
        if (invoice.pdf_path) {
            const cleanPath = invoice.pdf_path.startsWith('/') ? invoice.pdf_path : `/${invoice.pdf_path}`;
            window.open(`${API_URL}${cleanPath}`, '_blank');
        } else {
            alert(t('pdf_not_found_regenerate'));
        }
    };

    const totalRevenue = invoices.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0);

    return (
        <div className={`invoices-page invoices-page--${theme}`}>
            <header className="invoices-header">
                <div className="invoices-header__titles">
                    <h1 className="invoices-title">
                        <FileText size={24} className="invoices-icon"/> {t('invoices')}
                    </h1>
                    {isOwner ? (
                        <div className="invoices-branch-select">
                            <select 
                                value={selectedBranchId} 
                                onChange={(e) => setSelectedBranchId(e.target.value)}
                                className="invoices-filter__select"
                            >
                                <option value="">{t('all_branches')}</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <p className="invoices-subtitle">{t('branch_invoices')}</p>
                    )}
                </div>
                
                <div className="invoices-stats">
                    <div className="invoices-stat-box">
                        <span>{t('total_invoices')}:</span>
                        <strong>{invoices.length}</strong>
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
                                <th>{t('total_amount')}</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="invoices-table__body">
                            {invoices.map(inv => (
                                <tr key={inv.id} className="invoices-row">
                                    <td className="invoices-row__cell invoices-row__no">{inv.invoice_number}</td>
                                    <td className="invoices-row__cell">
                                        {new Date(inv.createdAt).toLocaleDateString()} 
                                        <small className="invoices-row__time">{new Date(inv.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</small>
                                    </td>
                                    <td className="invoices-row__cell invoices-row__customer">
                                        {inv.customer ? inv.customer.full_name : t('unknown')}
                                    </td>
                                    <td className="invoices-row__cell invoices-row__amount">
                                        {parseFloat(inv.total_amount).toFixed(3)} {t('kwd')}
                                    </td>
                                    <td className="invoices-row__cell">
                                        <div className="invoices-actions">
                                            <button 
                                                className="invoices-btn invoices-btn--download" 
                                                onClick={() => handleDownload(inv)}
                                                title={t('download_pdf')}
                                            >
                                                <Download size={16}/> PDF
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" className="invoices-empty">{t('no_invoices_found')}</td>
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