import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './ManagePage.css';
import { 
    Building, Users, Plus, Trash2, MapPin, Phone, 
    X, Edit, Search, ShieldAlert 
} from 'lucide-react';

const ManagePage = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth(); // دریافت وضعیت لودینگ احراز هویت
    
    // States
    const [activeTab, setActiveTab] = useState('staff');
    const [dataLoading, setDataLoading] = useState(true); // لودینگ دیتای صفحه
    
    const [branches, setBranches] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);

    const [branchForm, setBranchForm] = useState({ id: null, name: '', location: '', phone: '' });
    const [staffForm, setStaffForm] = useState({ username: '', password: '', full_name: '', branch_id: '', role: 'sales_man' });

    // 1. تنظیم تب پیش‌فرض بر اساس نقش (فقط وقتی یوزر لود شد)
    useEffect(() => {
        if (user) {
            console.log(user);
            if (user.role === 'store_owner') {
                setActiveTab('branches');
            } else {
                setActiveTab('staff');
            }
        }
    }, [user]);

    // 2. دریافت دیتا وقتی تب عوض می‌شود یا یوزر لود می‌شود
    useEffect(() => {
        if (user) {
            fetchData();
            setSearchTerm('');
        }
    }, [activeTab, user]);

    const fetchData = async () => {
        setDataLoading(true);
        try {
            // دریافت لیست شعب (اگر Owner یا Manager باشد)
            if (user?.role === 'store_owner' || user?.role === 'branch_manager' || activeTab === 'branches') {
                const resStores = await api.get('/manage/branches');
                setBranches(resStores.data.data || []);
            }

            // دریافت لیست کارکنان
            if (activeTab === 'staff') {
                const resStaff = await api.get('/manage/staff');
                setStaffList(resStaff.data.data || []);
            }
        } catch (err) {
            console.error(err);
            toast.error(t('error_fetching_data'));
        } finally {
            setDataLoading(false);
        }
    };

    // --- Helper: Check Edit Permissions ---
    const canEditStaff = (staffMember) => {
        if (!user) return false;

        // 1. Store Owner
        if (user.role === 'store_owner') return true;

        // 2. Branch Manager
        if (user.role === 'branch_manager') {
            if (staffMember.role === 'store_owner') return false;

            // هندل کردن فرمت‌های مختلف ID (ممکن است آبجکت باشد یا عدد)
            const managerBranchId = user.branch?.id || user.branch_id;
            const staffBranchId = staffMember.branch?.id || staffMember.branch_id;

            // مقایسه (با == برای هندل کردن String vs Number)
            return managerBranchId == staffBranchId;
        }
        return false;
    };

    // --- Handlers ---
    const handleSaveBranch = async (e) => {
        e.preventDefault();
        try {
            if (branchForm.id) {
                await api.put(`/manage/branches/${branchForm.id}`, branchForm);
                toast.success(t('branch_updated'));
            } else {
                await api.post('/manage/branches', branchForm);
                toast.success(t('branch_added'));
            }
            setIsBranchModalOpen(false);
            setBranchForm({ id: null, name: '', location: '', phone: '' });
            fetchData();
        } catch (err) { 
            toast.error(err.response?.data?.message || t('error_saving_branch')); 
        }
    };

    const handleDeleteBranch = async (id) => {
        if (!window.confirm(t('confirm_delete_branch'))) return;
        try { 
            await api.delete(`/manage/branches/${id}`); 
            toast.success(t('branch_deleted'));
            fetchData(); 
        } catch (err) { 
            toast.error(err.response?.data?.message || t('delete_failed')); 
        }
    };

    const openEditBranch = (branch) => {
        setBranchForm(branch);
        setIsBranchModalOpen(true);
    };

    const handleSaveStaff = async (e) => {
        e.preventDefault();
        try {
            if (editingStaff) {
                await api.put(`/manage/staff/${editingStaff.id}`, staffForm);
                toast.success(t('staff_updated'));
            } else {
                await api.post('/manage/staff', staffForm);
                toast.success(t('staff_created'));
            }
            setIsStaffModalOpen(false);
            setEditingStaff(null);
            
            // Reset form
            const defaultBranchId = (user?.role === 'branch_manager') 
                ? (user.branch?.id || user.branch_id) 
                : '';

            setStaffForm({ 
                username: '', password: '', full_name: '', 
                branch_id: defaultBranchId, role: 'sales_man' 
            });
            fetchData();
        } catch (err) { 
            toast.error(err.response?.data?.message || t('error_saving_staff')); 
        }
    };

    const openEditStaff = (staff) => {
        setEditingStaff(staff);
        
        const staffBranchId = staff.branch?.id || staff.branch_id || '';
        const userBranchId = user?.branch?.id || user?.branch_id;

        setStaffForm({
            username: staff.username,
            full_name: staff.full_name,
            branch_id: staffBranchId || (user?.role === 'branch_manager' ? userBranchId : ''),
            role: staff.role,
            password: ''
        });
        setIsStaffModalOpen(true);
    };

    const handleDeleteStaff = async (id, role, e) => {
        e.stopPropagation(); 
        if (role === 'store_owner') {
            toast.error(t('cannot_delete_owner'));
            return;
        }
        if (!window.confirm(t('confirm_delete_staff'))) return;
        try { 
            await api.delete(`/manage/staff/${id}`); 
            toast.success(t('staff_deleted'));
            fetchData(); 
        } catch (err) { 
            toast.error(err.response?.data?.message || t('delete_failed')); 
        }
    };

    // --- Loading State Check ---
    if (authLoading || !user) {
        return <div className={`manage-page manage-page--${theme} flex items-center justify-center h-screen`}>
            <div className="text-xl opacity-50">Loading System Access...</div>
        </div>;
    }

    // --- Filtering ---
    const filteredBranches = branches.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredStaff = staffList.filter(s => 
        s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`manage-page manage-page--${theme}`}>
            <header className="manage-header">
                <h1 className="manage-title">{t('system_management')}</h1>
                <div className="manage-tabs">
                    {user?.role === 'store_owner' && (
                        <button className={`manage-tab-btn ${activeTab === 'branches' ? 'manage-tab-btn--active' : ''}`} onClick={() => setActiveTab('branches')}>
                            <Building size={18}/> {t('branches')}
                        </button>
                    )}
                    <button className={`manage-tab-btn ${activeTab === 'staff' ? 'manage-tab-btn--active' : ''}`} onClick={() => setActiveTab('staff')}>
                        <Users size={18}/> {t('staff')}
                    </button>
                </div>
            </header>

            <div className="manage-content">
                <div className="manage-controls">
                    <div className="manage-search">
                        <Search size={18} className="manage-search__icon"/>
                        <input 
                            className="manage-search__input"
                            placeholder={activeTab === 'branches' ? t('search_branches') : t('search_staff')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {user?.role === 'store_owner' || activeTab === 'staff' ? (
                        <button className="manage-btn-add" onClick={() => {
                            if(activeTab === 'branches') {
                                setBranchForm({ id: null, name: '', location: '', phone: '' });
                                setIsBranchModalOpen(true);
                            } else {
                                setEditingStaff(null);
                                const defaultBranchId = (user?.role === 'branch_manager') 
                                    ? (user.branch?.id || user.branch_id) 
                                    : '';
                                setStaffForm({ 
                                    username: '', password: '', full_name: '', 
                                    branch_id: defaultBranchId, role: 'sales_man' 
                                });
                                setIsStaffModalOpen(true);
                            }
                        }}>
                            <Plus size={18}/> {t('add')} {activeTab === 'branches' ? t('branch') : t('staff_member')}
                        </button>
                    ) : null}
                </div>

                {/* Branches Tab */}
                {activeTab === 'branches' && user?.role === 'store_owner' && (
                    <div className="manage-tab-pane">
                        <div className="manage-grid">
                            {filteredBranches.map(branch => (
                                <div key={branch.id} className={`manage-card ${branch.is_main ? 'manage-card--main' : ''}`}>
                                    <div className={`manage-card__icon ${branch.is_main ? 'manage-card__icon--gold' : ''}`}><Building size={24}/></div>
                                    <div className="manage-card__info">
                                        <div className="manage-branch-title">
                                            <h3>{branch.name}</h3>
                                            {branch.is_main && <span className="manage-badge-main">{t('hq')}</span>}
                                        </div>
                                        <p><MapPin size={14}/> {branch.location}</p>
                                        <p><Phone size={14}/> {branch.phone}</p>
                                    </div>
                                    <div className="manage-card__actions">
                                        <button onClick={() => openEditBranch(branch)} className="manage-btn-icon manage-btn-icon--edit"><Edit size={16}/></button>
                                        {!branch.is_main && (
                                            <button onClick={() => handleDeleteBranch(branch.id)} className="manage-btn-icon manage-btn-icon--del"><Trash2 size={16}/></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Staff Tab */}
                {activeTab === 'staff' && (
                    <div className="manage-tab-pane">
                        {dataLoading ? (
                            <div className="p-10 text-center opacity-50">Loading Staff Data...</div>
                        ) : (
                            <div className="manage-table-wrapper">
                                <table className="manage-table">
                                    <thead className="manage-table__head">
                                        <tr>
                                            <th>{t('name')}</th>
                                            <th>{t('username')}</th>
                                            <th>{t('role')}</th>
                                            <th>{t('branch')}</th>
                                            <th>{t('action')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="manage-table__body">
                                        {filteredStaff.map(staff => (
                                            <tr key={staff.id} onClick={() => canEditStaff(staff) && navigate(`/manage/staff/${staff.id}`)} className="manage-table__row">
                                                <td className="manage-table__cell manage-table__cell--bold">{staff.full_name}</td>
                                                <td className="manage-table__cell">{staff.username}</td>
                                                <td className="manage-table__cell"><span className={`manage-badge-role manage-badge-role--${staff.role}`}>{staff.role}</span></td>
                                                <td className="manage-table__cell">{staff.branch ? staff.branch.name : <span className="manage-text-muted">{t('no_branch')}</span>}</td>
                                                <td className="manage-table__cell">
                                                    <div className="manage-table__actions">
                                                        {canEditStaff(staff) ? (
                                                            <button className="manage-btn-icon manage-btn-icon--edit" onClick={(e) => { e.stopPropagation(); openEditStaff(staff); }}><Edit size={16}/></button>
                                                        ) : null}
                                                        
                                                        {staff.role !== 'store_owner' && staff.id !== user?.id && (user.role === 'store_owner' || canEditStaff(staff)) ? (
                                                            <button className="manage-btn-icon manage-btn-icon--del" onClick={(e) => handleDeleteStaff(staff.id, staff.role, e)}><Trash2 size={16}/></button>
                                                        ) : (
                                                            <div className="manage-icon-protected" title={t('protected_account')}><ShieldAlert size={16}/></div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals are the same... just need to ensure branch_id is passed correctly */}
            {isStaffModalOpen && (
                <div className="manage-modal-overlay">
                    <div className={`manage-modal manage-modal--${theme}`}>
                        <div className="manage-modal__header">
                            <h3>{editingStaff ? t('edit_staff') : t('add_new_staff')}</h3>
                            <button className="manage-modal__close" onClick={() => setIsStaffModalOpen(false)}><X/></button>
                        </div>
                        <form onSubmit={handleSaveStaff} className="manage-form">
                            <input className="manage-input" placeholder={t('full_name')} required 
                                value={staffForm.full_name} onChange={e => setStaffForm({...staffForm, full_name: e.target.value})}/>
                            <input className="manage-input" placeholder={t('username')} required 
                                value={staffForm.username} onChange={e => setStaffForm({...staffForm, username: e.target.value})}/>
                            <input className="manage-input" type="password" placeholder={editingStaff ? t('new_password_optional') : t('password')} required={!editingStaff} 
                                value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})}/>
                            
                            <select className="manage-input" required value={staffForm.role} onChange={e => setStaffForm({...staffForm, role: e.target.value})} disabled={user?.role === 'branch_manager'}>
                                <option value="sales_man">{t('sales_man')}</option>
                                {user?.role === 'store_owner' && <option value="branch_manager">{t('branch_manager')}</option>}
                                {user?.role === 'store_owner' && <option value="store_owner">{t('store_owner')}</option>}
                            </select>

                            <select className="manage-input" required value={staffForm.branch_id} onChange={e => setStaffForm({...staffForm, branch_id: e.target.value})} disabled={user?.role !== 'store_owner'}>
                                <option value="">{t('select_branch')}</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>

                            <button type="submit" className="manage-btn-submit">{editingStaff ? t('update_staff') : t('create_staff')}</button>
                        </form>
                    </div>
                </div>
            )}
            
            {isBranchModalOpen && (
                <div className="manage-modal-overlay">
                    {/* Branch Modal Content (Same as before) */}
                    <div className={`manage-modal manage-modal--${theme}`}>
                        <div className="manage-modal__header">
                            <h3>{branchForm.id ? t('edit_branch') : t('add_new_branch')}</h3>
                            <button className="manage-modal__close" onClick={() => setIsBranchModalOpen(false)}><X/></button>
                        </div>
                        <form onSubmit={handleSaveBranch} className="manage-form">
                            <input className="manage-input" placeholder={t('branch_name')} required 
                                value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})}/>
                            <input className="manage-input" placeholder={t('location')} required 
                                value={branchForm.location} onChange={e => setBranchForm({...branchForm, location: e.target.value})}/>
                            <input className="manage-input" placeholder={t('phone')} 
                                value={branchForm.phone} onChange={e => setBranchForm({...branchForm, phone: e.target.value})}/>
                            <button type="submit" className="manage-btn-submit">{branchForm.id ? t('update_branch') : t('create_branch')}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePage;