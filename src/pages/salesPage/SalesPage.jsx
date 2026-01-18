import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './SalesPage.css';
import { 
    ShoppingCart, User, Search, Plus, Trash2, 
    CreditCard, Printer, CheckCircle, X, Upload, Loader, FileText, Camera
} from 'lucide-react';

const SalesPage = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const API_URL = 'http://localhost:5000'; 
    
    const [customerSearch, setCustomerSearch] = useState('');
    const [itemSearch, setItemSearch] = useState('');
    const [customersList, setCustomersList] = useState([]);
    const [inventoryList, setInventoryList] = useState([]);
    const [showCustDropdown, setShowCustDropdown] = useState(false);
    const [showItemDropdown, setShowItemDropdown] = useState(false);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [cart, setCart] = useState([]);
    const [payments, setPayments] = useState([{ method: 'Cash', amount: '', reference: '' }]);

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastInvoice, setLastInvoice] = useState(null);
    const [localPdfUrl, setLocalPdfUrl] = useState(null);

    const frontInputRef = useRef(null);
    const backInputRef = useRef(null);
    const itemInputRef = useRef(null);

    const [liveRates, setLiveRates] = useState(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [idFiles, setIdFiles] = useState({ front: null, back: null });
    const newCustFrontRef = useRef(null);
    const newCustBackRef = useRef(null);
    const activeBranchId = localStorage.getItem('active_branch_id');

    const [formData, setFormData] = useState({
        full_name: '', phone: '', civil_id: '', type: 'Regular', notes: '',
        nationality: 'Kuwaiti', gender: 'M', address: '', birth_date: '', expiry_date: ''
    });

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await api.get('/dashboard/rates');
                setLiveRates(res.data.rates);
            } catch (e) { console.error(e); }
        };
        fetchRates();
    }, []);

    useEffect(() => {
        if(itemInputRef.current) itemInputRef.current.focus();
    }, []);

    useEffect(() => {
        if (customerSearch.length > 1) {
            const timer = setTimeout(async () => {
                try {
                    const res = await api.get(`/customers?search=${customerSearch}`);
                    setCustomersList(res.data.data);
                    setShowCustDropdown(true);
                } catch (e) {}
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setShowCustDropdown(false);
        }
    }, [customerSearch]);

    useEffect(() => {
        if (itemSearch.length > 1) {
            const timer = setTimeout(async () => {
                try {
                    const res = await api.get(`/inventory?search=${itemSearch}`);
                    setInventoryList(res.data.data.filter(i => i.status === 'In Stock'));
                    setShowItemDropdown(true);
                } catch (e) {}
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setShowItemDropdown(false);
        }
    }, [itemSearch]);

    const addToCart = (item) => {
        if (cart.find(c => c.id === item.id)) {
            toast.warning(t('item_already_in_cart'));
            setItemSearch('');
            return;
        }
        
        let pricePerGram = 0;
        if (liveRates?.Gold && item.metal_type === 'Gold') {
            pricePerGram = liveRates.Gold[`${item.karat}K`] || 0;
        } else if (item.metal_type === 'Silver') pricePerGram = liveRates.Silver || 0;

        const newItem = {
            ...item,
            cartQty: 1,
            labor_cost: 0, 
            price_per_gram: pricePerGram,
            total_price: (parseFloat(item.weight) * pricePerGram) 
        };
        setCart([...cart, newItem]);
        setItemSearch('');
        setShowItemDropdown(false);
        
        if(itemInputRef.current) {
            setTimeout(() => itemInputRef.current.focus(), 100);
        }
    };

    const handleScan = async (e) => {
        if (e.key === 'Enter' && itemSearch) {
            e.preventDefault();
            try {
                const res = await api.get(`/inventory?search=${itemSearch}`);
                const foundItems = res.data.data.filter(i => i.status === 'In Stock');

                const exactMatch = foundItems.find(i => i.barcode === itemSearch);
                
                if (exactMatch) {
                    addToCart(exactMatch);
                } else if (foundItems.length === 1) {
                    addToCart(foundItems[0]);
                } else if (foundItems.length > 1) {
                    setInventoryList(foundItems);
                    setShowItemDropdown(true);
                    toast.info(t('multiple_items_found'));
                } else {
                    toast.error(t('item_not_found'));
                    setItemSearch('');
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    const updateCartItem = (id, field, value) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const val = parseFloat(value) || 0;
                const updated = { ...item, [field]: val };
                updated.total_price = (updated.weight * updated.price_per_gram) + updated.labor_cost;
                return updated;
            }
            return item;
        }));
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const grandTotal = cart.reduce((acc, item) => acc + item.total_price, 0);
    const totalPaid = payments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
    const remaining = grandTotal - totalPaid;

    const addPaymentMethod = () => {
        setPayments([...payments, { method: 'Cash', amount: '', reference: '' }]);
    };

    const updatePayment = (index, field, value) => {
        const newPayments = [...payments];
        newPayments[index][field] = value;
        setPayments(newPayments);
    };

    const removePayment = (index) => {
        setPayments(payments.filter((_, i) => i !== index));
    };

    const handleIdUpload = async (e, side) => {
        if (!selectedCustomer) return toast.warning(t('select_customer_first'));
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        if (side === 'front') formData.append('front_image', file);
        else formData.append('back_image', file);

        try {
            const res = await api.put(`/customers/${selectedCustomer.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSelectedCustomer(res.data.data); 
            toast.success(t('upload_success'));
        } catch (err) {
            toast.error(t('upload_failed'));
        }
    };

    const handleSubmitSale = async () => {
        if (!selectedCustomer) return toast.warning(t('select_customer_first'));
        if (cart.length === 0) return toast.warning(t('cart_empty'));
        if (Math.abs(remaining) > 0.01) {
            return toast.error(t('payment_mismatch'));
        }

        setIsLoading(true);

        const payload = {
            customer_id: selectedCustomer.id,
            items: cart.map(i => ({
                id: i.id,
                labor_cost: i.labor_cost,
                price_per_gram: i.price_per_gram
            })),
            payments: payments.map(p => ({
                method: p.method,
                amount: parseFloat(p.amount),
                reference: p.reference
            })),
            notes: "Point of Sale Transaction"
        };

        try {
            const res = await api.post('/sales/create', payload);
            const responseData = res.data.data;
            
            setLastInvoice(responseData.invoice);
            
            if(responseData.local_pdf) {
                setLocalPdfUrl(`${API_URL}${responseData.local_pdf}`);
            } else {
                setLocalPdfUrl(responseData.pdf_url); 
            }
            
            setIsPreviewOpen(true);
            setCart([]);
            setPayments([{ method: 'Cash', amount: '', reference: '' }]);
            setSelectedCustomer(null);
        } catch (err) {
            toast.error(err.response?.data?.message || t('transaction_failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenPDF = () => {
        if(localPdfUrl) {
            window.open(localPdfUrl, '_blank');
        } else {
            toast.warning(t('pdf_not_ready'));
        }
    };

    const handleNewFileSelect = async (e, side) => {
        const file = e.target.files[0];
        if (!file) return;

        setIdFiles(prev => ({ ...prev, [side]: file }));
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
                const data = res.data.data;
                setFormData(prev => ({
                    ...prev,
                    civil_id: data.civil_id || prev.civil_id,
                    full_name: data.full_name || prev.full_name,
                    nationality: data.nationality || prev.nationality,
                    gender: data.gender ? (data.gender === 'F' ? 'F' : 'M') : prev.gender,
                    birth_date: data.birth_date || prev.birth_date,
                    expiry_date: data.expiry_date || prev.expiry_date,
                    address: data.address || prev.address,
                    notes: prev.notes + (prev.notes ? '\n' : '') + '[AI Scanned]'
                }));
                toast.success(t('id_scanned_success'));
            }
        } catch (err) {
            console.error(err);
            toast.error(t('scan_failed'));
        } finally {
            setIsScanning(false);
        }
    };

    const handleSaveNewCustomer = async (e) => {
        e.preventDefault();
        try {
            const payload = new FormData();
            Object.keys(formData).forEach(key => payload.append(key, formData[key]));
            
            if (activeBranchId) payload.append('branch_id', activeBranchId);
            
            if (idFiles.front) payload.append('front_image', idFiles.front);
            if (idFiles.back) payload.append('back_image', idFiles.back);

            const res = await api.post('/customers/add', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.success(t('customer_added_success'));
            
            setSelectedCustomer(res.data.data);
            setIsFormOpen(false);
            setCustomerSearch(''); 
            
            setFormData({ 
                full_name: '', phone: '', civil_id: '', type: 'Regular', notes: '',
                nationality: 'Kuwaiti', gender: 'M', address: '', birth_date: '', expiry_date: ''
            });
            setIdFiles({ front: null, back: null });

        } catch (err) {
            toast.error(err.response?.data?.message || t('error_saving_customer'));
        }
    };

    return (
        <div className={`sales-page sales-page--${theme}`}>
            <header className="sales-header">
                <div className="sales-header__title-group">
                    <ShoppingCart size={28} className="sales-header__icon"/>
                    <h1 className="sales-header__title">{t('new_sale')}</h1>
                </div>
                <div className="sales-header__info">
                    <span className="sales-header__badge">{t('live_gold')}: {liveRates?.Gold?.['21K'] || '...'} {t('kwd')}</span>
                    <span className="sales-header__date">{new Date().toLocaleDateString()}</span>
                </div>
            </header>

            <div className="sales-grid">
                <div className="sales-grid__left">
                    <div className="sales-card sales-search">
                        <div className="sales-search__wrapper">
                            <Search className="sales-search__icon" size={20}/>
                            <input 
                                ref={itemInputRef}
                                className="sales-search__input"
                                placeholder={t('scan_barcode_placeholder')} 
                                value={itemSearch}
                                onChange={e => setItemSearch(e.target.value)}
                                onKeyDown={handleScan}
                                autoFocus
                            />
                            {showItemDropdown && inventoryList.length > 0 && (
                                <ul className="sales-dropdown">
                                    {inventoryList.map(item => (
                                        <li key={item.id} onClick={() => addToCart(item)} className="sales-dropdown__item">
                                            <div className="sales-dropdown__main">{item.item_name}</div>
                                            <div className="sales-dropdown__sub">{item.barcode} | {item.weight}g | {item.karat}K</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="sales-card sales-cart">
                        <h3 className="sales-card__title">{t('shopping_cart')} ({cart.length})</h3>
                        <div className="sales-cart__table-wrapper">
                            <table className="sales-cart__table">
                                <thead>
                                    <tr>
                                        <th>{t('item')}</th>
                                        <th>{t('weight')}</th>
                                        <th>{t('rate')}</th>
                                        <th>{t('making_charge')}</th>
                                        <th>{t('total')}</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <div className="sales-cart__item-name">{item.item_name}</div>
                                                <div className="sales-cart__item-sub">{item.barcode}</div>
                                            </td>
                                            <td>{item.weight} {t('g')}</td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    className="sales-cart__input"
                                                    value={item.price_per_gram}
                                                    onChange={e => updateCartItem(item.id, 'price_per_gram', e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    className="sales-cart__input"
                                                    value={item.labor_cost}
                                                    onChange={e => updateCartItem(item.id, 'labor_cost', e.target.value)}
                                                />
                                            </td>
                                            <td className="sales-cart__total">{item.total_price.toFixed(3)}</td>
                                            <td>
                                                <button onClick={() => removeFromCart(item.id)} className="sales-btn-icon sales-btn-icon--danger">
                                                    <Trash2 size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {cart.length === 0 && (
                                        <tr><td colSpan="6" className="sales-cart__empty">{t('cart_is_empty')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="sales-grid__right">
                    <div className="sales-card sales-customer">
                        <div className="sales-card__header">
                            <h3 className="sales-card__title"><User size={18}/> {t('customer_details')}</h3>
                            {selectedCustomer && (
                                <button className="sales-btn-icon sales-btn-icon--danger" onClick={() => setSelectedCustomer(null)}>
                                    <X size={16}/>
                                </button>
                            )}
                        </div>
                        
                        {!selectedCustomer ? (
                            <div className="sales-search__wrapper">
                                <Search className="sales-search__icon" size={18}/>
                                <input 
                                    className="sales-search__input"
                                    placeholder={t('search_customer_placeholder')} 
                                    value={customerSearch}
                                    onChange={e => setCustomerSearch(e.target.value)}
                                />
                                <button className="sales-btn-add" onClick={() => setIsFormOpen(true)} title={t('add_customer')}>
                                    <Plus size={20} />
                                </button>
                                
                                {showCustDropdown && customersList.length > 0 && (
                                    <ul className="sales-dropdown">
                                        {customersList.map(cust => (
                                            <li key={cust.id} onClick={() => { setSelectedCustomer(cust); setCustomerSearch(''); }} className="sales-dropdown__item">
                                                <div className="sales-dropdown__main">{cust.full_name}</div>
                                                <div className="sales-dropdown__sub">{cust.phone} | {cust.civil_id}</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <div className="sales-customer__details">
                                <div className="sales-customer__group">
                                    <label>{t('name')}</label>
                                    <input className="sales-customer__input" value={selectedCustomer.full_name} readOnly />
                                </div>
                                <div className="sales-customer__group">
                                    <label>{t('phone')}</label>
                                    <input className="sales-customer__input" value={selectedCustomer.phone} readOnly />
                                </div>
                                <div className="sales-customer__group">
                                    <label>{t('civil_id')}</label>
                                    <input className="sales-customer__input" value={selectedCustomer.civil_id} readOnly />
                                </div>
                                
                                <div className="sales-customer__group sales-customer__group--full">
                                    <label>{t('id_cards')}</label>
                                    <div className="sales-customer__uploads">
                                        <input type="file" ref={frontInputRef} hidden onChange={e => handleIdUpload(e, 'front')}/>
                                        <button 
                                            className={`sales-upload-btn ${selectedCustomer.id_card_front_url ? 'sales-upload-btn--done' : ''}`}
                                            onClick={() => frontInputRef.current.click()}
                                        >
                                            {selectedCustomer.id_card_front_url ? <CheckCircle size={14}/> : <Upload size={14}/>} {t('front_id')}
                                        </button>

                                        <input type="file" ref={backInputRef} hidden onChange={e => handleIdUpload(e, 'back')}/>
                                        <button 
                                            className={`sales-upload-btn ${selectedCustomer.id_card_back_url ? 'sales-upload-btn--done' : ''}`}
                                            onClick={() => backInputRef.current.click()}
                                        >
                                            {selectedCustomer.id_card_back_url ? <CheckCircle size={14}/> : <Upload size={14}/>} {t('back_id')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="sales-card sales-payment">
                        <div className="sales-payment__total">
                            <span className="sales-payment__label">{t('grand_total')}</span>
                            <div className="sales-payment__amount">{grandTotal.toFixed(3)} <small>{t('kwd')}</small></div>
                        </div>

                        <div className="sales-payment__list">
                            {payments.map((p, idx) => (
                                <div key={idx} className="sales-payment__row">
                                    <select 
                                        className="sales-payment__select"
                                        value={p.method}
                                        onChange={e => updatePayment(idx, 'method', e.target.value)}
                                    >
                                        <option value="Cash">{t('cash')}</option>
                                        <option value="K-Net">{t('knet')}</option>
                                        <option value="Visa/Master">{t('visa_master')}</option>
                                        <option value="Link">{t('link')}</option>
                                    </select>
                                    <div className="sales-payment__input-wrapper">
                                        <input 
                                            type="number" 
                                            className="sales-payment__input"
                                            placeholder={t('amount')}
                                            value={p.amount}
                                            onChange={e => updatePayment(idx, 'amount', e.target.value)}
                                        />
                                        <span className="sales-payment__suffix">{t('kwd')}</span>
                                    </div>
                                    {payments.length > 1 && (
                                        <button className="sales-btn-icon" onClick={() => removePayment(idx)}>
                                            <X size={16}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button className="sales-btn sales-btn--dashed" onClick={addPaymentMethod}>
                            <Plus size={16}/> {t('add_payment_method')}
                        </button>

                        <div className="sales-payment__summary">
                            <div className="sales-summary-row sales-summary-row--settled">
                                <span>{t('paid')}:</span>
                                <span>{totalPaid.toFixed(3)} {t('kwd')}</span>
                            </div>
                            <div className={`sales-summary-row sales-summary-row--remaining ${remaining > 0.01 ? 'due' : 'settled'}`}>
                                <span>{t('balance')}:</span>
                                <span>{remaining.toFixed(3)} {t('kwd')}</span>
                            </div>
                        </div>

                        <button 
                            className="sales-btn sales-btn--large sales-btn--primary"
                            disabled={Math.abs(remaining) > 0.01 || cart.length === 0 || isLoading}
                            onClick={handleSubmitSale}
                        >
                            {isLoading ? (
                                <><Loader className="sales-spin" size={20} style={{marginRight:8}}/> {t('processing')}</>
                            ) : (
                                <><CheckCircle size={20}/> {t('complete_sale')}</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isPreviewOpen && lastInvoice && (
                <div className="sales-modal-overlay">
                    <div className="sales-modal">
                        <div className="sales-modal__header">
                            <h2>{t('invoice_created')}</h2>
                            <button className="sales-modal__close" onClick={() => setIsPreviewOpen(false)}><X size={24}/></button>
                        </div>
                        
                        <div className="sales-modal__body">
                            <div className="sales-modal__success">
                                <CheckCircle size={48} color="#10b981" style={{margin:'0 auto'}}/>
                                <p>{t('transaction_saved_msg', { number: lastInvoice.invoice_number })}</p>
                            </div>

                            <div className="sales-modal__actions">
                                <button className="sales-btn sales-btn--secondary" onClick={() => setIsPreviewOpen(false)}>{t('close')}</button>
                                <button className="sales-btn sales-btn--primary" onClick={handleOpenPDF}>
                                    <Printer size={18} style={{marginRight:8}}/> {t('print_pdf')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW CUSTOMER MODAL */}
            {isFormOpen && (
                <div className="sales-modal-overlay">
                    <div className={`sales-modal sales-modal--large sales-modal--${theme}`}>
                        <div className="sales-modal__header">
                            <h3>{t('new_customer_scan')}</h3>
                            <button className="sales-modal__close" onClick={() => setIsFormOpen(false)}><X size={20}/></button>
                        </div>
                        
                        <div className="customer-scan-section">
                            <p className="customer-scan__label">{t('upload_civil_id')}</p>
                            <div className="customer-scan__buttons">
                                <input type="file" ref={newCustFrontRef} style={{display:'none'}} accept="image/*" onChange={(e) => handleNewFileSelect(e, 'front')} />
                                <button type="button" className={`customer-scan-btn ${idFiles.front ? 'customer-scan-btn--done' : ''}`} onClick={() => newCustFrontRef.current.click()} disabled={isScanning}>
                                    {isScanning ? <Loader className="sales-spin" size={18}/> : <Camera size={18}/>}
                                    {idFiles.front ? t('front_uploaded') : t('scan_front')}
                                </button>

                                <input type="file" ref={newCustBackRef} style={{display:'none'}} accept="image/*" onChange={(e) => handleNewFileSelect(e, 'back')} />
                                <button type="button" className={`customer-scan-btn ${idFiles.back ? 'customer-scan-btn--done' : ''}`} onClick={() => newCustBackRef.current.click()} disabled={isScanning}>
                                    {isScanning ? <Loader className="sales-spin" size={18}/> : <Upload size={18}/>}
                                    {idFiles.back ? t('back_uploaded') : t('scan_back')}
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSaveNewCustomer} className="customer-form">
                            <input className="customer-form__input" placeholder={t('full_name')} required 
                                value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
                            
                            <div className="customer-form__row">
                                <input className="customer-form__input" placeholder={t('phone')} required 
                                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                <input className="customer-form__input" placeholder={t('civil_id')} 
                                    value={formData.civil_id} onChange={e => setFormData({...formData, civil_id: e.target.value})} />
                            </div>

                            <div className="customer-form__row">
                                <select className="customer-form__input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                    <option value="M">{t('male')}</option>
                                    <option value="F">{t('female')}</option>
                                </select>
                                <input className="customer-form__input" placeholder={t('nationality')} 
                                    value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} />
                            </div>

                            <div className="customer-form__row">
                                <input className="customer-form__input" placeholder={t('birth_date')} 
                                    value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                                <input className="customer-form__input" placeholder={t('expiry_date')} 
                                    value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
                            </div>

                            <input className="customer-form__input" placeholder={t('address')} 
                                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />

                            <select className="customer-form__input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="Regular">Regular</option>
                                <option value="VIP">VIP</option>
                                <option value="Wholesaler">Wholesaler</option>
                            </select>

                            <textarea className="customer-form__input customer-form__input--textarea" placeholder={t('notes')} rows="2"
                                value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />

                            <button type="submit" className="sales-btn sales-btn--primary" disabled={isScanning}>
                                {isScanning ? t('wait_ai') : t('save_customer')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesPage;