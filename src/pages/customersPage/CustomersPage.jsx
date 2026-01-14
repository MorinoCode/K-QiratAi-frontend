import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './CustomersPage.css';
import { 
    Users, Search, Plus, Edit, Trash2,  
    X, Camera, Loader 
} from 'lucide-react';

const CustomersPage = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const [isScanning, setIsScanning] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const fileInputRef = useRef(null);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    
    const [formData, setFormData] = useState({
        full_name: '', phone: '', civil_id: '', type: 'Regular', notes: '',
        nationality: 'Kuwaiti', gender: 'M', address: '', birth_date: '', expiry_date: ''
    });

    const activeStoreId = localStorage.getItem('active_store_id') || 1;

    useEffect(() => {
        fetchCustomers();
    }, [searchTerm]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/customers?store_id=${activeStoreId}&search=${searchTerm}`);
            setCustomers(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadedFile(file); 
        await processOCR(file);
    };

    const processOCR = async (file) => {
        setIsScanning(true);
        const ocrFormData = new FormData();
        ocrFormData.append('image', file);

        try {
            const res = await api.post('/customers/scan', ocrFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const { civil_id, full_name, nationality, gender, birth_date, expiry_date } = res.data.data;
                setFormData(prev => ({
                    ...prev,
                    civil_id: civil_id || prev.civil_id,
                    full_name: full_name || prev.full_name,
                    nationality: nationality || prev.nationality,
                    gender: gender || prev.gender,
                    birth_date: birth_date || prev.birth_date,
                    expiry_date: expiry_date || prev.expiry_date,
                    notes: prev.notes + `\n[Auto-Scanned]`
                }));
                alert("ID Scanned Successfully! Extracted data applied.");
            }
        } catch (err) {
            console.error(err);
            alert("Scan failed. Please enter details manually.");
        } finally {
            setIsScanning(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            Object.keys(formData).forEach(key => payload.append(key, formData[key]));
            payload.append('store_id', activeStoreId);
            
            if (uploadedFile) {
                payload.append('id_card_image', uploadedFile);
            }

            if (selectedCustomer) {
                await api.put(`/customers/${selectedCustomer.id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/customers', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            setIsFormOpen(false);
            setFormData({ 
                full_name: '', phone: '', civil_id: '', type: 'Regular', notes: '',
                nationality: 'Kuwaiti', gender: 'M', address: '', birth_date: '', expiry_date: ''
            });
            setUploadedFile(null);
            setSelectedCustomer(null);
            fetchCustomers();
        } catch (err) {
            alert("Error saving customer");
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure?")) return;
        try { await api.delete(`/customers/${id}`); fetchCustomers(); } 
        catch (err) { alert(err.response?.data?.message || "Delete failed"); }
    };

    const openEdit = (customer, e) => {
        e.stopPropagation();
        setSelectedCustomer(customer);
        setFormData({
            full_name: customer.full_name,
            phone: customer.phone,
            civil_id: customer.civil_id,
            type: customer.type,
            notes: customer.notes || '',
            nationality: customer.nationality || '',
            gender: customer.gender || 'M',
            address: customer.address || '',
            birth_date: customer.birth_date || '',
            expiry_date: customer.expiry_date || ''
        });
        setUploadedFile(null);
        setIsFormOpen(true);
    };

    const handleRowClick = (id) => {
        navigate(`/customers/${id}`);
    };

    return (
        <div className={`customer-page customer-page--${theme}`}>
            <header className="page-header">
                <h1 className="page-title"><Users size={24}/> Customer Management</h1>
                <button className="btn-add" onClick={() => { setSelectedCustomer(null); setIsFormOpen(true); }}>
                    <Plus size={18}/> New Customer
                </button>
            </header>

            <div className="controls-bar">
                <div className="search-box">
                    <Search size={18} className="icon"/>
                    <input 
                        placeholder="Search Name, Phone, Civil ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Civil ID</th>
                            <th>Type</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map(c => (
                            <tr key={c.id} onClick={() => handleRowClick(c.id)} className="clickable-row">
                                <td className="fw-bold">{c.full_name}</td>
                                <td>{c.phone}</td>
                                <td>{c.civil_id}</td>
                                <td><span className={`badge-type ${c.type.toLowerCase()}`}>{c.type}</span></td>
                                <td>
                                    <div className="actions">
                                        <button title="Edit" onClick={(e) => openEdit(c, e)}><Edit size={16}/></button>
                                        <button title="Delete" className="text-red" onClick={(e) => handleDelete(c.id, e)}><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isFormOpen && (
                <div className="modal-overlay">
                    <div className={`modal-content modal--${theme}`}>
                        <div className="modal-header">
                            <h3>{selectedCustomer ? 'Edit Customer' : 'New Customer & Scan ID'}</h3>
                            <button onClick={() => setIsFormOpen(false)}><X size={20}/></button>
                        </div>
                        
                        <div className="scan-section">
                            <p className="scan-label">Scan Civil ID (Front/Back) for Auto-fill:</p>
                            <div className="scan-buttons">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    style={{display: 'none'}} 
                                    accept="image/*" 
                                    capture="environment"
                                    onChange={handleFileSelect}
                                />
                                
                                <button 
                                    type="button" 
                                    className="btn-scan" 
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={isScanning}
                                >
                                    {isScanning ? <Loader className="spin" size={20}/> : <Camera size={20}/>}
                                    {isScanning ? 'Processing AI...' : 'Take Photo / Upload ID'}
                                </button>
                            </div>
                            {uploadedFile && <div className="file-preview">Image Ready to Save</div>}
                        </div>

                        <form onSubmit={handleSave} className="modal-form">
                            <input className="input-field" placeholder="Full Name" required 
                                value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                            
                            <div className="row-2">
                                <input className="input-field" placeholder="Phone" required 
                                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                <input className="input-field" placeholder="Civil ID" 
                                    value={formData.civil_id} onChange={e => setFormData({...formData, civil_id: e.target.value})} />
                            </div>

                            <div className="row-2">
                                <select className="input-field" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                </select>
                                <input className="input-field" placeholder="Nationality" 
                                    value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
                            </div>

                            <div className="row-2">
                                <input className="input-field" placeholder="Birth Date" 
                                    value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                                <input className="input-field" placeholder="Expiry Date" 
                                    value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
                            </div>

                            <input className="input-field" placeholder="Address" 
                                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />

                            <select className="input-field" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="Regular">Regular</option>
                                <option value="VIP">VIP</option>
                                <option value="Wholesaler">Wholesaler</option>
                            </select>

                            <textarea className="input-field" placeholder="Notes..." rows="2"
                                value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />

                            <button type="submit" className="btn-submit" disabled={isScanning}>
                                {isScanning ? 'Wait for AI...' : 'Save & Close'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersPage;