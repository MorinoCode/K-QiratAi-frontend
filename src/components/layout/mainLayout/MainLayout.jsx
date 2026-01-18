import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../../sidebar/Sidebar';
import { Menu } from 'lucide-react';
import './MainLayout.css';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate()
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="main-layout">
            <div 
                className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
                onClick={closeSidebar}
            ></div>

            <div className={`layout-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <Sidebar closeSidebar={closeSidebar} />
            </div>

            <div className="layout-content">
                <header className="main-header">
                    <button className="hamburger-btn" onClick={toggleSidebar}>
                        <Menu size={28} />
                    </button>
                    <div className="brand-title" onClick={()=> navigate('/home')}>
                        K-QIRAT <span>AI</span>
                    </div>
                </header>

                <main className="page-container">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;