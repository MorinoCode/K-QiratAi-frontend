import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import api from '../../api/axios';
import InventoryItemRow from '../../components/inventoryItem/InventoryItem';
import { BarcodeLabel } from '../../components/barcode/BarcodeLabel';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './InventoryPage.css';
import { 
    Plus, Search, ScanLine, X, Printer
} from 'lucide-react';

const InventoryPage = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { user } = useAuth();
    
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterKarat, setFilterKarat] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterMetal, setFilterMetal] = useState('All');
    const [filterCountry, setFilterCountry] = useState('All');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    
    const [liveRates, setLiveRates] = useState(null);
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Print Logic
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printItem, setPrintItem] = useState(null);
    const printRef = useRef(null);

    const handlePrintConfirm = useReactToPrint({
        content: () => printRef.current,
        onAfterPrint: () => setIsPrintModalOpen(false),
        pageStyle: `
            @page { size: 55mm 12mm; margin: 0; }
            body { margin: 0; }
        `
    });

    const [newItem, setNewItem] = useState({
        metal_type: 'Gold',
        item_name: '',
        item_name_ar: '',
        category: 'Ring',
        country_of_origin: 'Kuwait',
        description: '',
        description_ar: '',
        karat: '21',
        weight: '',
        quantity: 1,
        min_stock_level: 2,
        buy_price_per_gram: '',
        barcode: ''
    });
    
    const [selectedImages, setSelectedImages] = useState([]);
    const fileInputRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const searchInputRef = useRef(null);

    const activeBranchId = localStorage.getItem('active_branch_id');
    const activeBranchName = localStorage.getItem('active_branch_name') || t('main_branch');

    useEffect(() => {
        if(user) {
            fetchInventory();
            fetchLiveRates();
        }
    }, [activeBranchId, user]);

    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            
            const branchQuery = (user?.role === 'store_owner' && activeBranchId) 
                ? `?branch_id=${activeBranchId}` 
                : '';

            const res = await api.get(`/inventory${branchQuery}`);
            setItems(res.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchLiveRates = async () => {
        try {
            const res = await api.get('/dashboard/rates');
            setLiveRates(res.data.rates);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePrintRequest = (item) => {
        setPrintItem(item);
        setIsPrintModalOpen(true);
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (selectedImages.length + files.length > 5) {
            alert(t('max_images_alert'));
            return;
        }
        setSelectedImages(prev => [...prev, ...files]);
    };

    const removeSelectedImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            Object.keys(newItem).forEach(key => formData.append(key, newItem[key]));
            
            if (activeBranchId) formData.append('branch_id', activeBranchId);
            
            selectedImages.forEach(file => {
                formData.append('images', file);
            });

            await api.post('/inventory/add', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setNewItem({
                metal_type: 'Gold', item_name: '', item_name_ar: '', category: 'Ring',
                country_of_origin: 'Kuwait', description: '', description_ar: '',
                karat: '21', weight: '', quantity: 1, min_stock_level: 2, 
                buy_price_per_gram: '', barcode: ''
            });
            setSelectedImages([]);
            setIsAddModalOpen(false);
            fetchInventory();
            alert(t('item_added_success'));
        } catch (err) {
            alert(err.response?.data?.message || t('item_add_failed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm(t('confirm_delete_item'))) {
            try {
                await api.delete(`/inventory/${id}`);
                setItems(prev => prev.filter(item => item.id !== id));
            } catch (err) {
                alert(t('delete_failed'));
            }
        }
    };

    const calculateLivePrice = (item) => {
        if (!liveRates) return 0;
        let rate = 0;
        if (item.metal_type === 'Gold' && liveRates.Gold) {
            rate = liveRates.Gold[`${item.karat}K`] || 0;
        } else if (item.metal_type === 'Silver') {
            rate = liveRates.Silver || 0;
        }
        return (parseFloat(item.weight) * rate).toFixed(3);
    };

    const calculateProfit = (item) => {
        const currentVal = calculateLivePrice(item);
        const buyVal = parseFloat(item.weight) * parseFloat(item.buy_price_per_gram);
        return (currentVal - buyVal).toFixed(3);
    };

    const filteredItems = items.filter(item => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = item.item_name.toLowerCase().includes(term) || 
                              (item.barcode && item.barcode.toLowerCase().includes(term)) ||
                              item.category.toLowerCase().includes(term);
                              
        const matchesKarat = filterKarat === 'All' || item.karat === filterKarat;
        const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
        const matchesMetal = filterMetal === 'All' || item.metal_type === filterMetal;
        const matchesCountry = filterCountry === 'All' || (item.country_of_origin && item.country_of_origin === filterCountry);

        const itemValue = parseFloat(calculateLivePrice(item));
        const matchesMinPrice = !priceMin || itemValue >= parseFloat(priceMin);
        const matchesMaxPrice = !priceMax || itemValue <= parseFloat(priceMax);

        return matchesSearch && matchesKarat && matchesCategory && matchesMetal && matchesCountry && matchesMinPrice && matchesMaxPrice;
    });

    const totalWeight = filteredItems.reduce((acc, item) => acc + (parseFloat(item.weight) * item.quantity), 0).toFixed(3);
    const totalValue = filteredItems.reduce((acc, item) => acc + (parseFloat(calculateLivePrice(item)) * item.quantity), 0).toFixed(3);

    return (
        <div className={`inventory-page inventory-page--${theme}`}>
            <header className="inventory-page__header">
                <div className="inventory-page__headings">
                    <h1 className="inventory-page__title">{t('branch_inventory')}</h1>
                    <p className="inventory-page__subtitle">{activeBranchName}</p>
                </div>
                
                <div className="inventory-page__stats">
                    <div className="inventory-stat"><span>{t('items')}:</span> <strong>{filteredItems.length}</strong></div>
                    <div className="inventory-stat"><span>{t('total_weight')}:</span> <strong>{totalWeight} {t('g')}</strong></div>
                    <div className="inventory-stat inventory-stat--gold"><span>{t('market_value')}:</span> <strong>{totalValue} {t('kwd')}</strong></div>
                </div>
                
                <div className="inventory-page__actions">
                    <button className="inventory-btn inventory-btn--primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} /> <span>{t('add_item')}</span>
                    </button>
                </div>
            </header>

            <div className="inventory-page__controls">
                <div className="inventory-page__search-row">
                    <div className="inventory-search">
                        <Search size={18} className="inventory-search__icon" />
                        <input 
                            ref={searchInputRef}
                            className="inventory-search__input"
                            type="text" 
                            placeholder={t('search_placeholder')} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                        <ScanLine size={16} className="inventory-search__scan-icon" title={t('ready_scanner')}/>
                    </div>
                    
                    <div className="inventory-price-filter">
                        <input 
                            className="inventory-price-filter__input"
                            type="number" 
                            placeholder={t('min_price')} 
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value)}
                        />
                        <span className="inventory-price-filter__sep">-</span>
                        <input 
                            className="inventory-price-filter__input"
                            type="number" 
                            placeholder={t('max_price')} 
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="inventory-page__filter-row">
                    <div className="inventory-select-wrapper">
                        <select className="inventory-select" onChange={(e) => setFilterMetal(e.target.value)} value={filterMetal}>
                            <option value="All">{t('all_metals')}</option>
                            <option value="Gold">{t('gold')}</option>
                            <option value="Silver">{t('silver')}</option>
                            <option value="Platinum">{t('platinum')}</option>
                            <option value="Diamond">{t('diamond')}</option>
                        </select>
                    </div>
                    <div className="inventory-select-wrapper">
                        <select className="inventory-select" onChange={(e) => setFilterKarat(e.target.value)} value={filterKarat}>
                            <option value="All">{t('all_karats')}</option>
                            <option value="24">24K</option>
                            <option value="22">22K</option>
                            <option value="21">21K</option>
                            <option value="18">18K</option>
                        </select>
                    </div>
                    <div className="inventory-select-wrapper">
                        <select className="inventory-select" onChange={(e) => setFilterCategory(e.target.value)} value={filterCategory}>
                            <option value="All">{t('all_categories')}</option>
                            <option value="Ring">{t('rings')}</option>
                            <option value="Necklace">{t('necklaces')}</option>
                            <option value="Bracelet">{t('bracelets')}</option>
                            <option value="Set">{t('sets')}</option>
                            <option value="Earring">{t('earrings')}</option>
                            <option value="Bangle">{t('bangles')}</option>
                            <option value="Pendant">{t('pendants')}</option>
                        </select>
                    </div>
                    <div className="inventory-select-wrapper">
                        <select className="inventory-select" onChange={(e) => setFilterCountry(e.target.value)} value={filterCountry}>
                            <option value="All">{t('all_countries')}</option>
                            <option value="Kuwait">{t('kuwait')}</option>
                            <option value="Italy">{t('italy')}</option>
                            <option value="India">{t('india')}</option>
                            <option value="UAE">{t('uae')}</option>
                            <option value="Turkey">{t('turkey')}</option>
                            <option value="Bahrain">{t('bahrain')}</option>
                            <option value="Singapore">{t('singapore')}</option>
                            <option value="Saudi Arabia">{t('saudi_arabia')}</option>
                            <option value="Other">{t('other')}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="inventory-table-container">
                <div className="inventory-table-wrapper">
                    <table className="inventory-table">
                        <thead className="inventory-table__head">
                            <tr>
                                <th>{t('image')}</th>
                                <th>{t('item_details')}</th>
                                <th>{t('metal')}</th>
                                <th>{t('karat')}</th>
                                <th>{t('weight')}</th>
                                <th>{t('qty')}</th>
                                <th>{t('buy_price')}</th>
                                <th>{t('live_value')}</th>
                                <th>{t('profit')}</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="inventory-table__body">
                            {filteredItems.map(item => (
                                <InventoryItemRow 
                                    key={item.id} 
                                    item={item} 
                                    calculateLivePrice={calculateLivePrice}
                                    calculateProfit={calculateProfit}
                                    onDelete={handleDeleteItem}
                                    onPrint={handlePrintRequest}
                                    theme={theme}
                                />
                            ))}
                        </tbody>
                    </table>
                    {filteredItems.length === 0 && !loading && (
                        <div className="inventory-empty-state">{t('no_items_found')}</div>
                    )}
                </div>
            </div>
            
            {/* ADD ITEM MODAL */}
            {isAddModalOpen && (
                <div className="inventory-modal-overlay">
                    <div className={`inventory-modal inventory-modal--${theme}`}>
                         <div className="inventory-modal__header">
                            <h2>{t('add_new_item')}</h2>
                            <button className="inventory-modal__close" onClick={() => setIsAddModalOpen(false)}>
                                <X size={24} />
                            </button>
                         </div>
                         
                         <form className="inventory-form" onSubmit={handleAddItem}>
                            <div className="inventory-form__row">
                                <select className="inventory-form__input" value={newItem.metal_type} onChange={e => setNewItem({...newItem, metal_type: e.target.value})}>
                                    <option value="Gold">{t('gold')}</option>
                                    <option value="Silver">{t('silver')}</option>
                                    <option value="Platinum">{t('platinum')}</option>
                                    <option value="Diamond">{t('diamond')}</option>
                                </select>
                                <select className="inventory-form__input" value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                                    <option value="Ring">{t('ring')}</option>
                                    <option value="Necklace">{t('necklace')}</option>
                                    <option value="Bracelet">{t('bracelet')}</option>
                                    <option value="Earring">{t('earring')}</option>
                                    <option value="Set">{t('full_set')}</option>
                                    <option value="Bangle">{t('bangle')}</option>
                                    <option value="Pendant">{t('pendant')}</option>
                                </select>
                            </div>

                            <div className="inventory-form__upload-section">
                                <div className="inventory-form__thumbnails">
                                    {selectedImages.map((file, idx) => (
                                        <div key={idx} className="inventory-form__thumb">
                                            <img src={URL.createObjectURL(file)} alt="preview" />
                                            <button type="button" className="inventory-form__remove-thumb" onClick={() => removeSelectedImage(idx)}>
                                                <X size={12}/>
                                            </button>
                                        </div>
                                    ))}
                                    {selectedImages.length < 5 && (
                                        <button type="button" className="inventory-form__add-thumb" onClick={() => fileInputRef.current.click()}>
                                            <Plus size={20}/>
                                        </button>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    style={{display:'none'}} 
                                    accept="image/*" 
                                    multiple
                                    onChange={handleImageSelect} 
                                />
                            </div>

                            <input className="inventory-form__input" placeholder={t('item_name_en')} required
                                value={newItem.item_name} onChange={e => setNewItem({...newItem, item_name: e.target.value})} />
                            
                            <input className="inventory-form__input" placeholder={t('item_name_ar')} 
                                value={newItem.item_name_ar} onChange={e => setNewItem({...newItem, item_name_ar: e.target.value})} style={{textAlign: 'right'}} />

                            <div className="inventory-form__row">
                                <select className="inventory-form__input" value={newItem.country_of_origin} onChange={e => setNewItem({...newItem, country_of_origin: e.target.value})}>
                                    <option value="Kuwait">{t('kuwait')}</option>
                                    <option value="Italy">{t('italy')}</option>
                                    <option value="India">{t('india')}</option>
                                    <option value="UAE">{t('uae')}</option>
                                    <option value="Turkey">{t('turkey')}</option>
                                    <option value="Bahrain">{t('bahrain')}</option>
                                    <option value="Singapore">{t('singapore')}</option>
                                    <option value="Saudi Arabia">{t('saudi_arabia')}</option>
                                    <option value="Other">{t('other')}</option>
                                </select>
                                <select className="inventory-form__input" value={newItem.karat} onChange={e => setNewItem({...newItem, karat: e.target.value})}>
                                    <option value="24">24K</option>
                                    <option value="22">22K</option>
                                    <option value="21">21K</option>
                                    <option value="18">18K</option>
                                </select>
                            </div>

                            <div className="inventory-form__row">
                                <input type="number" step="0.001" className="inventory-form__input" placeholder={t('weight_g')} required
                                    value={newItem.weight} onChange={e => setNewItem({...newItem, weight: e.target.value})} />
                                <div style={{display:'flex', gap:'8px'}}>
                                    <input type="number" className="inventory-form__input" placeholder={t('quantity')} required
                                        value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} />
                                    <input type="number" className="inventory-form__input" placeholder={t('min_stock')}
                                        value={newItem.min_stock_level} onChange={e => setNewItem({...newItem, min_stock_level: e.target.value})} title={t('low_stock_alert_threshold')} />
                                </div>
                            </div>

                            <input type="number" step="0.001" className="inventory-form__input" placeholder={t('buy_price_per_gram')} required
                                value={newItem.buy_price_per_gram} onChange={e => setNewItem({...newItem, buy_price_per_gram: e.target.value})} />

                            <textarea className="inventory-form__input" placeholder={t('description_en')} rows="2"
                                value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                            
                            <textarea className="inventory-form__input" placeholder={t('description_ar')} rows="2" style={{textAlign: 'right'}}
                                value={newItem.description_ar} onChange={e => setNewItem({...newItem, description_ar: e.target.value})} />

                            <button type="submit" className="inventory-btn inventory-btn--submit" disabled={isSubmitting}>
                                {isSubmitting ? t('saving') : t('add_item_to_inventory')}
                            </button>
                         </form>
                    </div>
                </div>
            )}

            {/* PRINT MODAL */}
            {isPrintModalOpen && printItem && (
                <div className="inventory-modal-overlay">
                    <div className={`inventory-modal inventory-modal--${theme} inventory-modal--small`}>
                        <div className="inventory-modal__header">
                            <h2>{t('print_preview')}</h2>
                            <button className="inventory-modal__close" onClick={() => setIsPrintModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="inventory-modal__body inventory-modal__body--center">
                            
                            {/* This is the visual preview for the user */}
                            <div className="print-preview-area">
                                <BarcodeLabel item={printItem} />
                            </div>

                            {/* This is the hidden component that ReactToPrint actually grabs */}
                            <div style={{ display: 'none' }}>
                                <BarcodeLabel ref={printRef} item={printItem} />
                            </div>

                            <p className="print-instruction">{t('ensure_printer_connected')}</p>
                            
                            {/* The button now triggers the hook function */}
                            <button className="inventory-btn inventory-btn--primary" onClick={handlePrintConfirm}>
                                <Printer size={18} /> {t('confirm_print')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;