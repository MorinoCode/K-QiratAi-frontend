import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './CustomerDetailsPage.css';
import { 
    User, ArrowLeft, Calendar, MapPin, 
    CreditCard, TrendingUp, ShoppingBag 
} from 'lucide-react';

const CustomerDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/customers/${id}`);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                alert("Customer not found");
                navigate('/customers');
            }
        };
        fetchDetails();
    }, [id, navigate]);

    if (loading) return <div className={`cust-details-page cust-details-page--${theme} loading`}>Loading...</div>;

    const { customer, history, stats } = data;

    return (
        <div className={`cust-details-page cust-details-page--${theme}`}>
            <header className="page-header">
                <button className="btn-back" onClick={() => navigate('/customers')}>
                    <ArrowLeft size={20}/> Back
                </button>
                <h1>{customer.full_name}</h1>
                <span className={`badge-type ${customer.type.toLowerCase()}`}>{customer.type}</span>
            </header>

            <div className="details-grid">
                {/* Left: Profile Card & ID Image */}
                <div className="left-col">
                    <div className="profile-card">
                        <div className="profile-avatar">
                            <User size={40}/>
                        </div>
                        <div className="profile-info">
                            <h3>{customer.civil_id}</h3>
                            <p><span className="label">Phone:</span> {customer.phone}</p>
                            <p><span className="label">Nation:</span> {customer.nationality}</p>
                            <p><span className="label">Gender:</span> {customer.gender === 'M' ? 'Male' : 'Female'}</p>
                            <p><span className="label">DOB:</span> {customer.birth_date || '-'}</p>
                            <p><span className="label">Expiry:</span> {customer.expiry_date || '-'}</p>
                            <div className="address-box">
                                <MapPin size={14}/> {customer.address || 'No Address'}
                            </div>
                        </div>
                    </div>

                    <div className="id-card-preview">
                        <h4>Stored ID Card</h4>
                        <img 
                            src={`http://localhost:5000/api/customers/image/${customer.id}`} 
                            alt="Civil ID" 
                            onError={(e) => e.target.src = 'https://via.placeholder.com/300x180?text=No+ID+Image'}
                        />
                    </div>
                </div>

                {/* Right: AI Analysis & History */}
                <div className="right-col">
                    <div className="ai-dashboard">
                        <div className="ai-header">
                            <TrendingUp size={20}/> <span>AI Shopping Insights</span>
                        </div>
                        <div className="ai-stats-row">
                            <div className="ai-stat">
                                <span className="label">Total Spent</span>
                                <span className="value">{stats.total_spent} KWD</span>
                            </div>
                            <div className="ai-stat">
                                <span className="label">Transactions</span>
                                <span className="value">{stats.invoice_count}</span>
                            </div>
                            <div className="ai-stat">
                                <span className="label">Last Visit</span>
                                <span className="value">{stats.last_purchase ? new Date(stats.last_purchase).toLocaleDateString() : 'Never'}</span>
                            </div>
                        </div>
                        <div className="ai-prediction">
                            <p>🤖 <strong>AI Analysis:</strong> 
                                {stats.invoice_count > 2 
                                ? "Frequent buyer. Prefers 21K items. Likely to buy during holidays." 
                                : "New customer. Needs engagement."}
                            </p>
                        </div>
                    </div>

                    <div className="history-section">
                        <h3><ShoppingBag size={18}/> Purchase History</h3>
                        <div className="table-wrapper">
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Invoice #</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Pay</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(inv => (
                                        <tr key={inv.id}>
                                            <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                                            <td>{inv.invoice_number}</td>
                                            <td>{inv.items?.length || 0}</td>
                                            <td className="text-gold">{inv.total_amount}</td>
                                            <td>{inv.payment_method}</td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && <tr><td colspan="5" style={{textAlign:'center'}}>No purchases yet.</td></tr>}
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