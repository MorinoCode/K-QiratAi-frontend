import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './ManagePage.css';
import { 
    Building, Users, Plus, Trash2, MapPin, Phone, 
    UserPlus, X, Edit, Search 
} from 'lucide-react';

const ManagePage = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('branches');
    const [loading, setLoading] = useState(true);
    
    const [branches, setBranches] = useState([]);
    const [staffList, setStaffList] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');

    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

    const [branchForm, setBranchForm] = useState({ id: null, name: '', location: '', phone: '' });
    const [staffForm, setStaffForm] = useState({ username: '', password: '', full_name: '', store_id: '' });

    useEffect(() => {
        fetchData();
        setSearchTerm('');
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resStores = await api.get('/manage/branches');
            setBranches(resStores.data);

            if (activeTab === 'staff') {
                const resStaff = await api.get('/manage/staff');
                setStaffList(resStaff.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBranch = async (e) => {
        e.preventDefault();
        try {
            if (branchForm.id) {
                await api.put(`/manage/branches/${branchForm.id}`, branchForm);
                alert("Branch Updated!");
            } else {
                await api.post('/manage/branches', branchForm);
                alert("Branch Added!");
            }
            setIsBranchModalOpen(false);
            setBranchForm({ id: null, name: '', location: '', phone: '' });
            fetchData();
        } catch (err) { alert("Error saving branch"); }
    };

    const handleDeleteBranch = async (id) => {
        if (!window.confirm("Delete this branch? Only branches with no staff can be deleted.")) return;
        try { 
            await api.delete(`/manage/branches/${id}`); 
            fetchData(); 
        } catch (err) { 
            alert(err.response?.data?.message || "Delete failed"); 
        }
    };

    const openEditBranch = (branch) => {
        setBranchForm(branch);
        setIsBranchModalOpen(true);
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await api.post('/manage/staff', staffForm);
            alert("Staff Created!");
            setIsStaffModalOpen(false);
            setStaffForm({ username: '', password: '', full_name: '', store_id: '' });
            fetchData();
        } catch (err) { alert("Error creating staff"); }
    };

    const handleDeleteStaff = async (id, e) => {
        e.stopPropagation(); 
        if (!window.confirm("Are you sure?")) return;
        try { await api.delete(`/manage/staff/${id}`); fetchData(); }
        catch (err) { alert("Delete failed"); }
    };

    const filteredBranches = branches.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStaff = staffList.filter(s => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.store?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`manage-page manage-page--${theme}`}>
            <header className="manage-header">
                <h1 className="manage-title">System Management</h1>
                <div className="tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'branches' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('branches')}
                    >
                        <Building size={18}/> Branches
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`} 
                        onClick={() => setActiveTab('staff')}
                    >
                        <Users size={18}/> Staff
                    </button>
                </div>
            </header>

            <div className="manage-content">
                
                <div className="controls-bar" style={{marginBottom: '20px', display: 'flex', gap: '15px'}}>
                    <div className="search-box" style={{flex: 1}}>
                        <Search size={18} className="icon"/>
                        <input 
                            placeholder={activeTab === 'branches' ? "Search Branches..." : "Search Staff..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-add" onClick={() => {
                        if(activeTab === 'branches') {
                            setBranchForm({ id: null, name: '', location: '', phone: '' });
                            setIsBranchModalOpen(true);
                        } else {
                            setIsStaffModalOpen(true);
                        }
                    }}>
                        <Plus size={18}/> Add {activeTab === 'branches' ? 'Branch' : 'Staff'}
                    </button>
                </div>

                {activeTab === 'branches' && (
                    <div className="tab-pane">
                        <div className="grid-list">
                            {filteredBranches.map(branch => (
                                <div key={branch.id} className={`card-item ${branch.is_main ? 'card-item--main' : ''}`}>
                                    <div className={`card-icon ${branch.is_main ? 'icon-gold' : ''}`}>
                                        <Building size={24}/>
                                    </div>
                                    <div className="card-info">
                                        <div className="branch-title-row">
                                            <h3>{branch.name}</h3>
                                            {/* بج برای شعبه اصلی */}
                                            {branch.is_main && <span className="badge-main">MAIN HQ</span>}
                                        </div>
                                        <p><MapPin size={14}/> {branch.location}</p>
                                        <p><Phone size={14}/> {branch.phone}</p>
                                    </div>
                                    <div className="card-actions">
                                        <button onClick={() => openEditBranch(branch)} className="btn-icon-edit"><Edit size={16}/></button>
                                        {/* دکمه حذف فقط برای شعب غیر اصلی */}
                                        {!branch.is_main && (
                                            <button onClick={() => handleDeleteBranch(branch.id)} className="btn-icon-del">
                                                <Trash2 size={16}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'staff' && (
                    <div className="tab-pane">
                        <div className="table-wrapper">
                            <table className="manage-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Username</th>
                                        <th>Role</th>
                                        <th>Branch</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.map(staff => (
                                        <tr key={staff.id} onClick={() => navigate(`/manage/staff/${staff.id}`)} style={{cursor: 'pointer'}}>
                                            <td className="fw-bold">{staff.full_name}</td>
                                            <td>{staff.username}</td>
                                            <td><span className="badge-role">{staff.role}</span></td>
                                            <td>{staff.store ? staff.store.name : <span className="text-muted">No Branch</span>}</td>
                                            <td>
                                                <button className="btn-icon-del" onClick={(e) => handleDeleteStaff(staff.id, e)}>
                                                    <Trash2 size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {isBranchModalOpen && (
                <div className="modal-overlay">
                    <div className={`modal-content modal--${theme}`}>
                        <div className="modal-header">
                            <h3>{branchForm.id ? 'Edit Branch' : 'Add New Branch'}</h3>
                            <button onClick={() => setIsBranchModalOpen(false)}><X/></button>
                        </div>
                        <form onSubmit={handleSaveBranch} className="modal-form">
                            <input className="input-field" placeholder="Branch Name" required 
                                value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})}/>
                            <input className="input-field" placeholder="Location" required 
                                value={branchForm.location} onChange={e => setBranchForm({...branchForm, location: e.target.value})}/>
                            <input className="input-field" placeholder="Phone" 
                                value={branchForm.phone} onChange={e => setBranchForm({...branchForm, phone: e.target.value})}/>
                            <button type="submit" className="btn-submit">{branchForm.id ? 'Update Branch' : 'Create Branch'}</button>
                        </form>
                    </div>
                </div>
            )}

            {isStaffModalOpen && (
                <div className="modal-overlay">
                    <div className={`modal-content modal--${theme}`}>
                        <div className="modal-header">
                            <h3>Add New Staff</h3>
                            <button onClick={() => setIsStaffModalOpen(false)}><X/></button>
                        </div>
                        <form onSubmit={handleAddStaff} className="modal-form">
                            <input className="input-field" placeholder="Full Name" required 
                                value={staffForm.full_name} onChange={e => setStaffForm({...staffForm, full_name: e.target.value})}/>
                            <input className="input-field" placeholder="Username" required 
                                value={staffForm.username} onChange={e => setStaffForm({...staffForm, username: e.target.value})}/>
                            <input className="input-field" type="password" placeholder="Password" required 
                                value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})}/>
                            
                            <select className="input-field" required 
                                value={staffForm.store_id} onChange={e => setStaffForm({...staffForm, store_id: e.target.value})}>
                                <option value="">Select Branch...</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>

                            <button type="submit" className="btn-submit">Create Staff Account</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePage;