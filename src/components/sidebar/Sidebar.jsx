import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../api/axios"; // API Import
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import "./Sidebar.css";
import {
  LayoutDashboard, Package, ShoppingCart, LogOut, Layers, Store, ChevronDown,
  Users, Scale, X, Sun, Moon, Settings, Languages, Check
} from "lucide-react";

const Sidebar = ({ closeSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [activeStore, setActiveStore] = useState(null);

  // دریافت اطلاعات کاربر و شعب
  // در حالت واقعی این اطلاعات از AuthContext می‌آید
  const user = { role: "admin" }; 
  const canSwitchBranch = user?.role === "admin";
  const activeStoreId = localStorage.getItem('active_store_id') || '1';

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/manage/branches');
      setBranches(res.data);
      const current = res.data.find(b => b.id.toString() === activeStoreId.toString());
      setActiveStore(current || res.data[0]);
    } catch (err) {
      console.error("Failed to fetch branches", err);
    }
  };

  const handleSwitchBranch = (branch) => {
    localStorage.setItem('active_store_id', branch.id);
    setActiveStore(branch);
    setIsStoreMenuOpen(false);
    // ریلود صفحه برای اعمال تغییرات در تمام کامپوننت‌ها (روش ساده و مطمئن)
    window.location.reload(); 
  };

  const handleLogout = () => {
    console.log("Logout Clicked");
    if (closeSidebar) closeSidebar();
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const isActive = (path) => location.pathname === path ? "sidebar__nav-item--active" : "";

  return (
    <aside className={`sidebar-inner sidebar-inner--${theme}`}>
      <div className="sidebar__header-row">
        <div className={`sidebar__logo sidebar__logo--${theme}`}>
          <Layers className="sidebar__logo-icon" size={28} />
          <span className="sidebar__logo-text">{t('app_title')}</span>
        </div>
        <button className="sidebar__close-btn" onClick={closeSidebar}><X size={24} /></button>
      </div>

      <div className="sidebar__branch-section">
        <label className="sidebar__label">{t('current_branch')}</label>
        <div
          className={`sidebar__branch-selector sidebar__branch-selector--${theme}`}
          onClick={() => canSwitchBranch && setIsStoreMenuOpen(!isStoreMenuOpen)}
        >
          <div className="sidebar__branch-info">
            <div className={`sidebar__branch-icon-bg ${activeStore?.is_main ? 'main-branch-icon' : ''}`}>
              <Store size={18} />
            </div>
            <span className="sidebar__branch-name">
              {activeStore ? activeStore.name : 'Loading...'}
            </span>
          </div>
          {canSwitchBranch && <ChevronDown size={16} />}
        </div>

        {/* منوی بازشونده انتخاب شعبه */}
        {isStoreMenuOpen && (
          <div className={`branch-dropdown branch-dropdown--${theme}`}>
            {branches.map(branch => (
              <div 
                key={branch.id} 
                className={`branch-item ${branch.id.toString() === activeStoreId.toString() ? 'active' : ''}`}
                onClick={() => handleSwitchBranch(branch)}
              >
                <div className="branch-info">
                  <span className="branch-name">{branch.name}</span>
                  {branch.is_main && <span className="badge-hq">HQ</span>}
                </div>
                {branch.id.toString() === activeStoreId.toString() && <Check size={14} className="check-icon"/>}
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
        <Link to="/old-gold" className={`sidebar__nav-item sidebar__nav-item--${theme} ${isActive("/old-gold")}`} onClick={closeSidebar}>
          <Scale size={20} /> <span>{t('old_gold')}</span>
        </Link>
        <Link to="/customers" className={`sidebar__nav-item sidebar__nav-item--${theme} ${isActive("/customers")}`} onClick={closeSidebar}>
          <Users size={20} /> <span>{t('customers')}</span>
        </Link>
        <Link to="/manage" className={`sidebar__nav-item sidebar__nav-item--${theme} ${isActive("/manage")}`} onClick={closeSidebar}>
          <Settings size={20} /> <span>{t('manage')}</span>
        </Link>
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