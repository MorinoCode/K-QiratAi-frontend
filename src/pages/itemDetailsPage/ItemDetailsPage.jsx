import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './ItemDetailsPage.css';
import { 
    ArrowLeft, Save, Trash2, Printer, Edit3, 
    Upload, X, CheckCircle 
} from 'lucide-react';

const ItemDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await api.get(`/gold/${id}`);
                setItem(res.data);
                setFormData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching item:", err);
                alert("Item not found");
                navigate('/inventory');
            }
        };
        fetchItem();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            const data = new FormData();
            data.append('item_name', formData.item_name);
            data.append('category', formData.category);
            data.append('karat', formData.karat);
            data.append('weight', formData.weight);
            data.append('buy_price_per_gram', formData.buy_price_per_gram);
            
            if (imageFile) {
                data.append('image', imageFile);
            }

            await api.put(`/gold/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Item updated successfully!");
            setIsEditing(false);
            const res = await api.get(`/gold/${id}`);
            setItem(res.data);
            setPreviewImage(null);
        } catch (err) {
            console.error(err);
            alert("Failed to update item.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this item permanently?")) {
            try {
                await api.delete(`/gold/${id}`);
                alert("Item deleted.");
                navigate('/inventory');
            } catch (err) {
                alert("Failed to delete item.");
            }
        }
    };

    const handlePrintBarcode = () => {
        window.print();
    };

    if (loading) return <div className={`details-page details-page--${theme} loading`}>Loading...</div>;

    return (
        <div className={`details-page details-page--${theme}`}>
            <header className="details-header">
                <button className="btn-back" onClick={() => navigate('/inventory')}>
                    <ArrowLeft size={20} /> Back to Inventory
                </button>
                <div className="header-actions">
                    {!isEditing ? (
                        <>
                            <button className="btn-action btn-print" onClick={handlePrintBarcode}>
                                <Printer size={18} /> Print Label
                            </button>
                            <button className="btn-action btn-edit" onClick={() => setIsEditing(true)}>
                                <Edit3 size={18} /> Edit Item
                            </button>
                            <button className="btn-action btn-delete" onClick={handleDelete}>
                                <Trash2 size={18} /> Delete
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="btn-action btn-cancel" onClick={() => setIsEditing(false)}>
                                <X size={18} /> Cancel
                            </button>
                            <button className="btn-action btn-save" onClick={handleSave}>
                                <Save size={18} /> Save Changes
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="details-container">
                <div className="details-image-section">
                    <div className="image-wrapper">
                        <img 
                            src={previewImage || `http://localhost:5000/api/gold/image/${item.id}`} 
                            alt={item.item_name} 
                            onError={(e) => {e.target.src = 'https://via.placeholder.com/300?text=No+Image'}}
                        />
                        {isEditing && (
                            <div className="image-upload-overlay" onClick={() => fileInputRef.current.click()}>
                                <Upload size={30} />
                                <span>Change Photo</span>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    hidden 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                        )}
                    </div>
                    <div className="barcode-display">
                        <p className="barcode-label">BARCODE</p>
                        <div className="barcode-value">{item.barcode}</div>
                    </div>
                </div>

                <div className="details-info-section">
                    <h1 className="item-title-large">
                        {isEditing ? (
                            <input 
                                name="item_name" 
                                value={formData.item_name} 
                                onChange={handleChange} 
                                className="edit-input title-input"
                            />
                        ) : item.item_name}
                    </h1>

                    <div className="info-grid">
                        <div className="info-group">
                            <label>Category</label>
                            {isEditing ? (
                                <select name="category" value={formData.category} onChange={handleChange} className="edit-input">
                                    <option value="Ring">Ring</option>
                                    <option value="Necklace">Necklace</option>
                                    <option value="Bracelet">Bracelet</option>
                                    <option value="Earring">Earring</option>
                                    <option value="Set">Set</option>
                                    <option value="General">General</option>
                                </select>
                            ) : (
                                <p className="info-value">{item.category}</p>
                            )}
                        </div>

                        <div className="info-group">
                            <label>Karat</label>
                            {isEditing ? (
                                <select name="karat" value={formData.karat} onChange={handleChange} className="edit-input">
                                    <option value="24">24K</option>
                                    <option value="22">22K</option>
                                    <option value="21">21K</option>
                                    <option value="18">18K</option>
                                </select>
                            ) : (
                                <p className="info-value text-gold">{item.karat}K</p>
                            )}
                        </div>

                        <div className="info-group">
                            <label>Weight (grams)</label>
                            {isEditing ? (
                                <input 
                                    type="number" 
                                    step="0.001" 
                                    name="weight" 
                                    value={formData.weight} 
                                    onChange={handleChange} 
                                    className="edit-input"
                                />
                            ) : (
                                <p className="info-value">{item.weight} g</p>
                            )}
                        </div>

                        <div className="info-group">
                            <label>Buy Price (per gram)</label>
                            {isEditing ? (
                                <input 
                                    type="number" 
                                    step="0.001" 
                                    name="buy_price_per_gram" 
                                    value={formData.buy_price_per_gram} 
                                    onChange={handleChange} 
                                    className="edit-input"
                                />
                            ) : (
                                <p className="info-value">{item.buy_price_per_gram} KWD</p>
                            )}
                        </div>

                        <div className="info-group">
                            <label>Store ID</label>
                            <p className="info-value disabled">{item.store_id}</p>
                        </div>

                        <div className="info-group">
                            <label>Date Added</label>
                            <p className="info-value disabled">{new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="status-badge">
                        <CheckCircle size={16} /> In Stock
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailsPage;