import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './OldGoldPage.css';
import { Save, Scale, Camera } from 'lucide-react';

const OldGoldPage = () => {
    const { theme } = useTheme();
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_civil_id: '',
        customer_phone: '',
        item_description: '',
        karat: '21',
        weight: '',
        price_per_gram_bought: ''
    });
    
    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);

    const [liveRates, setLiveRates] = useState(null);
    const activeBranchId = localStorage.getItem('active_branch_id');

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await api.get('/dashboard/rates');
                setLiveRates(res.data.rates);
            } catch (err) { console.error(err); }
        };
        fetchRates();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file) setImageFile(file);
    };

    const getEstimatedPrice = () => {
        if (!liveRates || !formData.karat) return 0;
        let marketRate = 0;
        if (liveRates.Gold) {
            marketRate = liveRates.Gold[`${formData.karat}K`] || 0;
        }
        return (marketRate - 1.500).toFixed(3);
    };

    const handleAutoPrice = () => {
        setFormData(prev => ({ ...prev, price_per_gram_bought: getEstimatedPrice() }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            // Map form fields to backend expectations
            data.append('customer_id', 1); // Placeholder for now, ideally fetch customer ID first or implement create
            data.append('description', formData.item_description);
            data.append('karat', formData.karat);
            data.append('weight', formData.weight);
            data.append('price_per_gram', formData.price_per_gram_bought);
            
            if(activeBranchId) data.append('branch_id', activeBranchId);
            if(imageFile) data.append('image', imageFile);

            await api.post('/old-gold/create', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert("Old Gold Purchase Recorded!");
            setFormData({
                customer_name: '', customer_civil_id: '', customer_phone: '',
                item_description: '', karat: '21', weight: '', price_per_gram_bought: ''
            });
            setImageFile(null);
        } catch (err) {
            console.error(err);
            alert("Error recording purchase");
        }
    };

    return (
        <div className={`old-gold-page old-gold-page--${theme}`}>
            <header className="page-header">
                <h1><Scale size={28}/> Old Gold Purchase</h1>
            </header>

            <div className="purchase-container">
                <form onSubmit={handleSubmit} className="purchase-form">
                    <div className="form-section">
                        <h3>Seller Details</h3>
                        <input name="customer_name" placeholder="Seller Name" value={formData.customer_name} onChange={handleChange} required className="input-field"/>
                        <input name="customer_civil_id" placeholder="Civil ID" value={formData.customer_civil_id} onChange={handleChange} required className="input-field"/>
                        <input name="customer_phone" placeholder="Phone" value={formData.customer_phone} onChange={handleChange} className="input-field"/>
                    </div>

                    <div className="form-section">
                        <h3>Item Details</h3>
                        <input name="item_description" placeholder="Description (e.g. Broken Ring)" value={formData.item_description} onChange={handleChange} required className="input-field"/>
                        
                        <div className="row-2">
                            <select name="karat" value={formData.karat} onChange={handleChange} className="input-field">
                                <option value="24">24K</option>
                                <option value="22">22K</option>
                                <option value="21">21K</option>
                                <option value="18">18K</option>
                            </select>
                            <input name="weight" type="number" step="0.01" placeholder="Weight (g)" value={formData.weight} onChange={handleChange} required className="input-field"/>
                        </div>

                        <div className="price-row">
                            <input name="price_per_gram_bought" type="number" step="0.001" placeholder="Buying Price / Gram" value={formData.price_per_gram_bought} onChange={handleChange} required className="input-field highlight"/>
                            <button type="button" onClick={handleAutoPrice} className="btn-auto">Auto Price</button>
                        </div>

                        <div className="upload-section">
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
                            <button type="button" className={`btn-upload ${imageFile ? 'done' : ''}`} onClick={() => fileInputRef.current.click()}>
                                <Camera size={18}/> {imageFile ? 'Image Attached' : 'Take Photo of Item'}
                            </button>
                        </div>
                    </div>

                    <div className="total-display">
                        Total to Pay: <span>{(formData.weight * formData.price_per_gram_bought || 0).toFixed(3)} KWD</span>
                    </div>

                    <button type="submit" className="btn-submit-large"><Save size={20}/> Record Purchase</button>
                </form>
            </div>
        </div>
    );
};

export default OldGoldPage;