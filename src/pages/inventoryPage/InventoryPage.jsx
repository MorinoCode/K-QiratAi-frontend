import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import InventoryItemRow from '../../components/inventoryItem/InventoryItem';
import { useTheme } from '../../context/ThemeContext';
import './InventoryPage.css';
import { 
    Plus, Search, Filter, ScanLine, 
    X, Camera 
} from 'lucide-react';

const InventoryPage = () => {
    const { theme } = useTheme();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterKarat, setFilterKarat] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    
    const [liveRates, setLiveRates] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const activeStoreId = localStorage.getItem('active_store_id') || 1;

    useEffect(() => {
        fetchInventory();
        fetchLiveRates();
    }, [activeStoreId]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/gold/inventory?store_id=${activeStoreId}`);
            setItems(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load inventory", err);
            setLoading(false);
        }
    };

    const fetchLiveRates = async () => {
        try {
            const res = await api.get('/gold/dashboard');
            setLiveRates(res.data.live_rates);
        } catch (err) {
            console.error("Failed to load rates", err);
        }
    };

    const calculateLivePrice = (item) => {
        if (!liveRates) return 0;
        const rate = liveRates[`k${item.karat}`] || 0;
        return (parseFloat(item.weight) * rate).toFixed(3);
    };

    const calculateProfit = (item) => {
        const currentVal = calculateLivePrice(item);
        const buyVal = parseFloat(item.weight) * parseFloat(item.buy_price_per_gram);
        return (currentVal - buyVal).toFixed(3);
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              item.barcode.includes(searchTerm);
        const matchesKarat = filterKarat === 'All' || item.karat === filterKarat;
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;

        return matchesSearch && matchesKarat && matchesCategory;
    });

    const totalWeight = filteredItems.reduce((acc, item) => acc + parseFloat(item.weight), 0).toFixed(3);
    const totalValue = filteredItems.reduce((acc, item) => acc + parseFloat(calculateLivePrice(item)), 0).toFixed(3);

    const handleCameraScan = () => {
        alert("Camera Scanner Modal will open here");
    };

    return (
        <div className={`inventory-page inventory-page--${theme}`}>
            <header className="inventory-header">
                <div className="inventory-header__text">
                    <h1 className="inventory-title">Branch Inventory</h1>
                    <p className="inventory-subtitle">Store ID: {activeStoreId}</p>
                </div>
                
                <div className="inventory-stats">
                    <div className="stat-badge"><span>Items:</span> <strong>{filteredItems.length}</strong></div>
                    <div className="stat-badge"><span>Total Weight:</span> <strong>{totalWeight} g</strong></div>
                    <div className="stat-badge stat-badge--gold"><span>Market Value:</span> <strong>{totalValue} KWD</strong></div>
                </div>
                
                <div className="header-actions">
                    <button className="btn-secondary" onClick={handleCameraScan} title="Scan via Camera">
                        <Camera size={18} /> <span className="btn-text-mobile">Scan</span>
                    </button>
                    <button className="btn-add" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} /> <span className="btn-text">Add Item</span>
                    </button>
                </div>
            </header>

            <div className="inventory-controls">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search / Scan Barcode..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        autoFocus 
                    />
                    <ScanLine size={16} className="scan-icon-indicator" title="Ready for Scanner"/>
                </div>
                
                <div className="filters-group">
                    <div className="filter-box">
                        <Filter size={16} className="filter-icon" />
                        <select onChange={(e) => setFilterKarat(e.target.value)} value={filterKarat}>
                            <option value="All">All Karats</option>
                            <option value="24">24K</option>
                            <option value="22">22K</option>
                            <option value="21">21K</option>
                            <option value="18">18K</option>
                        </select>
                    </div>

                    <div className="filter-box">
                        <select onChange={(e) => setFilterCategory(e.target.value)} value={filterCategory}>
                            <option value="All">All Categories</option>
                            <option value="Ring">Rings</option>
                            <option value="Necklace">Necklaces</option>
                            <option value="Bracelet">Bracelets</option>
                            <option value="Earring">Earrings</option>
                            <option value="Set">Full Sets</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <div className="table-wrapper">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Item Details</th>
                                <th>Karat</th>
                                <th>Weight</th>
                                <th>Buy Price</th>
                                <th>Live Value</th>
                                <th>Profit</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <InventoryItemRow 
                                    key={item.id} 
                                    item={item} 
                                    calculateLivePrice={calculateLivePrice}
                                    calculateProfit={calculateProfit}
                                    theme={theme}
                                />
                            ))}
                        </tbody>
                    </table>
                    {filteredItems.length === 0 && !loading && (
                        <div className="empty-state">No items found in this branch.</div>
                    )}
                </div>
            </div>
            
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className={`modal-content modal--${theme}`}>
                         <div className="modal-header">
                            <h2>Add New Item</h2>
                            <button onClick={() => setIsAddModalOpen(false)} style={{background:'none',border:'none',color:'inherit',cursor:'pointer'}}><X/></button>
                         </div>
                         <p style={{textAlign:'center', padding: '20px', opacity: 0.7}}>Add Item Form Goes Here...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;