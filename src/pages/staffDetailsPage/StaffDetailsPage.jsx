import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './StaffDetailsPage.css';
import { User, ArrowLeft, Briefcase, TrendingUp, Calendar } from 'lucide-react';

const StaffDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/manage/staff/${id}`);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert("Failed to load staff details");
                navigate('/manage');
            }
        };
        fetchDetails();
    }, [id, navigate]);

    if (loading) return <div className={`staff-page staff-page--${theme} loading`}>Loading Analysis...</div>;

    const { staff, history, stats } = data;

    return (
        <div className={`staff-page staff-page--${theme}`}>
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/manage')}>
                    <ArrowLeft size={20}/> Back to List
                </button>
                <h1>{staff.full_name}</h1>
                <span className="badge-role">{staff.role}</span>
            </header>

            <div className="staff-grid">
                {/* Left: Profile & AI Stats */}
                <div className="staff-sidebar">
                    <div className="info-card">
                        <div className="avatar-placeholder"><User size={40}/></div>
                        <h3>{staff.username}</h3>
                        <p className="store-name"><Briefcase size={14}/> {staff.store?.name}</p>
                        <p className="join-date"><Calendar size={14}/> Joined: {new Date(staff.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="ai-card">
                        <div className="ai-header">
                            <TrendingUp size={18}/> 
                            <span>AI Performance Analytics</span>
                        </div>
                        <div className="stat-row">
                            <span>Total Sales Volume:</span>
                            <strong>{stats.total_sales_volume} KWD</strong>
                        </div>
                        <div className="stat-row">
                            <span>Total Invoices:</span>
                            <strong>{stats.total_invoices}</strong>
                        </div>
                        <div className="ai-insight">
                            <p>🤖 <strong>AI Insight:</strong> Data collection in progress. Sales patterns will appear here next month.</p>
                        </div>
                    </div>
                </div>

                {/* Right: Sales History */}
                <div className="staff-content">
                    <h2>Recent Sales History</h2>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Invoice #</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(inv => (
                                    <tr key={inv.id}>
                                        <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                        <td>{inv.invoice_number}</td>
                                        <td>{inv.customer_name}</td>
                                        <td className="text-gold">{inv.total_amount} KWD</td>
                                        <td>{inv.payment_method}</td>
                                    </tr>
                                ))}
                                {history.length === 0 && <tr><td colspan="5" style={{textAlign:'center'}}>No sales records found.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDetailsPage;