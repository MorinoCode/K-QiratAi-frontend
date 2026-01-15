import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import "./Sidebar.css";
import {
  LayoutDashboard, Package, ShoppingCart, LogOut, Layers, Store, ChevronDown,
  Users, Scale, X, Sun, Moon, Settings, Languages, Check, FileText
} from "lucide-react";

const Sidebar = ({ closeSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [activeStore, setActiveStore] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // دریافت ID شعبه فعال از حافظه
  const savedBranchId = localStorage.getItem('active_branch_id');

  useEffect(() => {
    const initData = async () => {
      try {
        const userRes = await api.get('/auth/me');
        const user = userRes.data;
        setCurrentUser(user);

        let branchList = [];
        
        if (user.role === 'store_owner') {
          const branchesRes = await api.get('/manage/branches');
          branchList = Array.isArray(branchesRes.data.data) ? branchesRes.data.data : [];
        } else if (user.branch) {
          branchList = [user.branch];
        }

        setBranches(branchList);

        if (branchList.length > 0) {
          // پیدا کردن شعبه فعال
          const saved = branchList.find(b => b.id.toString() === savedBranchId);
          if (saved) {
            setActiveStore(saved);
            // ✅ اطمینان از ذخیره نام شعبه در صورت رفرش
            localStorage.setItem('active_branch_name', saved.name);
          } else {
            const defaultBranch = branchList.find(b => b.is_main) || branchList[0];
            setActiveStore(defaultBranch);
            localStorage.setItem('active_branch_id', defaultBranch.id);
            // ✅ ذخیره نام شعبه پیش‌فرض
            localStorage.setItem('active_branch_name', defaultBranch.name);
          }
        }
      } catch (err) {
        console.error("Sidebar Init Error:", err);
        if (err.response?.status === 401) handleLogout();
      }
    };

    initData();
  }, []);

  const handleSwitchBranch = (branch) => {
    localStorage.setItem('active_branch_id', branch.id);
    // ✅ ذخیره نام شعبه جدید
    localStorage.setItem('active_branch_name', branch.name);
    
    setActiveStore(branch);
    setIsStoreMenuOpen(false);
    window.location.reload(); 
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) { console.error(e); } 
    finally {
      localStorage.removeItem('tenant_id');
      localStorage.removeItem('active_branch_id');
      localStorage.removeItem('active_branch_name'); // ✅ پاک کردن نام شعبه
      if (closeSidebar) closeSidebar();
      navigate('/login');
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const isActive = (path) => location.pathname === path ? "sidebar__nav-item--active" : "";
  const canSwitchBranch = currentUser?.role === 'store_owner';

  return (
    <aside className={`sidebar-inner sidebar-inner--${theme}`}>
      <div className="sidebar__header-row">
        <div className={`sidebar__logo sidebar__logo--${theme}`}>
          <Layers className="sidebar__logo-icon" size={28} />
          <span className="sidebar__logo-text">K-QIRAT</span>
        </div>
        <button className="sidebar__close-btn" onClick={closeSidebar}><X size={24} /></button>
      </div>

      <div className="sidebar__branch-section">
        <label className="sidebar__label">{t('current_branch')}</label>
        <div
          className={`sidebar__branch-selector sidebar__branch-selector--${theme} ${!canSwitchBranch ? 'disabled' : ''}`}
          onClick={() => canSwitchBranch && setIsStoreMenuOpen(!isStoreMenuOpen)}
        >
          <div className="sidebar__branch-info">
            <div className={`sidebar__branch-icon-bg ${activeStore?.is_main ? 'main-branch-icon' : ''}`}>
              <Store size={18} />
            </div>
            <div className="sidebar__branch-details">
              <span className="sidebar__branch-name">
                {activeStore ? activeStore.name : 'Loading...'}
              </span>
              <span className="sidebar__user-role">
                {currentUser ? currentUser.role.replace('_', ' ').toUpperCase() : ''}
              </span>
            </div>
          </div>
          {canSwitchBranch && <ChevronDown size={16} />}
        </div>

        {isStoreMenuOpen && canSwitchBranch && (
          <div className={`branch-dropdown branch-dropdown--${theme}`}>
            {branches.map(branch => (
              <div 
                key={branch.id} 
                className={`branch-item ${branch.id === activeStore?.id ? 'active' : ''}`}
                onClick={() => handleSwitchBranch(branch)}
              >
                <div className="branch-info">
                  <span className="branch-name">{branch.name}</span>
                  {branch.is_main && <span className="badge-hq">HQ</span>}
                </div>
                {branch.id === activeStore?.id && <Check size={14} className="check-icon"/>}
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="sidebar__nav">
        <Link to="/dashboard" className={`sidebar__nav-item sidebar__nav-item--${theme} ${isActive("/dashboard")}`} onClick={closeSidebar}>
          <LayoutDashboard size={20} /> <span>{t('dashboard')}</span>
        </Link>
        <Link to="/inventory" className={`sidebar__nav-item sidebar__nav-item--${theme} ${isActive("/inventory")}`} onClick={closeSidebar}>
          <Package size={20} /> <span>{t('inventory')}</span>
        </Link>
        <Link to="/sales" className={`sidebar__nav-item sidebar__nav-item--${theme} ${isActive("/sales")}`} onClick={closeSidebar}>
          <ShoppingCart size={20} /> <span>{t('sales')}</span>
        </Link>
        <Link to="/invoices" className={`sidebar__nav-item sidebar__nav-item--${theme} ${isActive("/invoices")}`} onClick={closeSidebar}>
          <FileText size={20} /> <span>Invoices</span>
        </Link>
        <Link to="/old-gold" className={`sidebar__nav-item sidebar__nav-item--${theme} ${isActive("/old-gold")}`} onClick={closeSidebar}>
          <Scale size={20} /> <span>{t('old_gold')}</span>
        </Link>
        <Link to="/customers" className={`sidebar__nav-item sidebar__nav-item--${theme} ${isActive("/customers")}`} onClick={closeSidebar}>
          <Users size={20} /> <span>{t('customers')}</span>
        </Link>
        {currentUser?.role !== 'sales_man' && (
          <Link to="/manage" className={`sidebar__nav-item sidebar__nav-item--${theme} ${isActive("/manage")}`} onClick={closeSidebar}>
            <Settings size={20} /> <span>{t('manage')}</span>
          </Link>
        )}
      </nav>

      <div className={`sidebar__footer sidebar__footer--${theme}`}>
        <button className={`sidebar__theme-btn sidebar__theme-btn--${theme}`} onClick={toggleLanguage}>
          <Languages size={20} /> <span>{i18n.language === 'en' ? 'العربية' : 'English'}</span>
        </button>
        <button className={`sidebar__theme-btn sidebar__theme-btn--${theme}`} onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          <span>{t(theme === "dark" ? "light_mode" : "dark_mode")}</span>
        </button>
        <button className={`sidebar__logout sidebar__logout--${theme}`} onClick={handleLogout}>
          <LogOut size={20} /> <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;