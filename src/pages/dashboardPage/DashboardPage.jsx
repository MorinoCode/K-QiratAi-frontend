import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import OwnerDashboard from './OwnerDashboard';
import ManagerDashboard from './ManagerDashboard';
import SalesmanDashboard from './SalesmanDashboard';
import './DashboardPage.css'; // Ensure CSS is imported

const DashboardPage = () => {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            try {
                const res = await api.get('/auth/me');
                setUserRole(res.data.data.role);
            } catch (error) {
                console.error("Failed to fetch user role", error);
            } finally {
                setLoading(false);
            }
        };
        checkRole();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loader">
                <div className="dashboard-loader__spinner"></div>
                <span className="dashboard-loader__text">Loading System...</span>
            </div>
        );
    }

    // Container for the specific dashboard
    return (
        <div className="dashboard-page">
            {(() => {
                switch (userRole) {
                    case 'store_owner':
                        return <OwnerDashboard />;
                    case 'branch_manager':
                        return <ManagerDashboard />;
                    case 'sales_man':
                        return <SalesmanDashboard />;
                    default:
                        return (
                            <div className="dashboard-page__error">
                                <span className="dashboard-page__error-text">Access Denied: Unknown Role</span>
                            </div>
                        );
                }
            })()}
        </div>
    );
};

export default DashboardPage;