import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import './ItemDetailsPage.css';
import { 
    ArrowLeft, Save, Trash2, Printer, Edit3, 
    Upload, X, Image as ImageIcon, ChevronLeft, ChevronRight 
} from 'lucide-react';

const ItemDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { t } = useTranslation();
    const API_URL = 'http://localhost:5000';
    
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [newImages, setNewImages] = useState([]); 
    const fileInputRef = useRef(null);
    
    // Swipe logic state
    const touchStartX = useRef(null);
    const touchEndX = useRef(null);

    useEffect(() => {
        fetchItem();
    }, [id]);

    const fetchItem = async () => {
        try {
            const res = await api.get(`/inventory/${id}`);
            const data = res.data.data || res.data;
            setItem(data);
            setFormData(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching item:", err);
            navigate('/inventory');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setNewImages(prev => [...prev, ...files]);
        }
    };

    const handleSave = async () => {
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'images') data.append(key, formData[key] || '');
            });
            
            newImages.forEach(file => {
                data.append('images', file);
            });

            await api.put(`/inventory/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert(t('item_updated_success'));
            setIsEditing(false);
            setNewImages([]); 
            fetchItem(); 
        } catch (err) {
            alert(t('item_update_failed'));
        }
    };

    const handleDeleteImage = async (imageUrl) => {
        if (!window.confirm(t('confirm_delete_image'))) return;
        try {
            await api.post(`/inventory/${id}/delete-image`, { imageUrl });
            fetchItem(); 
        } catch (err) {
            alert(t('delete_image_failed'));
        }
    };

    const handleDeleteItem = async () => {
        if (window.confirm(t('confirm_delete_item_permanent'))) {
            try {
                await api.delete(`/inventory/${id}`);
                navigate('/inventory');
            } catch (err) {
                alert(t('delete_item_failed'));
            }
        }
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${API_URL}${url}`;
    };

    const handleNextImage = () => {
        const totalImages = (item?.images?.length || 0) + newImages.length;
        if (totalImages <= 1) return;
        setSelectedImageIndex((prev) => (prev + 1) % totalImages);
    };

    const handlePrevImage = () => {
        const totalImages = (item?.images?.length || 0) + newImages.length;
        if (totalImages <= 1) return;
        setSelectedImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    };

    // Touch handlers for swipe
    const onTouchStart = (e) => {
        touchEndX.current = null;
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const onTouchMove = (e) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) handleNextImage();
        if (isRightSwipe) handlePrevImage();
    };

    if (loading) return <div className={`item-details item-details--${theme} item-details--loading`}>{t('loading')}</div>;

    const currentImages = item.images || [];
    const previewNewImages = newImages.map(file => URL.createObjectURL(file));
    const allImages = [...currentImages, ...previewNewImages];
    
    const mainImageSrc = allImages.length > 0 
        ? (selectedImageIndex < currentImages.length 
            ? getImageUrl(currentImages[selectedImageIndex]) 
            : previewNewImages[selectedImageIndex - currentImages.length])
        : null;

    return (
        <div className={`item-details item-details--${theme}`}>
            <header className="item-details__header">
                <button className="item-details__back-btn" onClick={() => navigate('/inventory')}>
                    <ArrowLeft size={20} /> {t('back')}
                </button>
                <div className="item-details__actions">
                    {!isEditing ? (
                        <>
                            <button className="item-action-btn" onClick={() => window.print()}>
                                <Printer size={18} /> {t('print')}
                            </button>
                            <button className="item-action-btn item-action-btn--primary" onClick={() => setIsEditing(true)}>
                                <Edit3 size={18} /> {t('edit')}
                            </button>
                            <button className="item-action-btn item-action-btn--danger" onClick={handleDeleteItem}>
                                <Trash2 size={18} /> {t('delete')}
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="item-action-btn" onClick={() => { setIsEditing(false); setNewImages([]); }}>
                                <X size={18} /> {t('cancel')}
                            </button>
                            <button className="item-action-btn item-action-btn--success" onClick={handleSave}>
                                <Save size={18} /> {t('save')}
                            </button>
                        </>
                    )}
                </div>
            </header>

            <div className="item-details__content">
                <div className="item-gallery">
                    <div 
                        className="item-gallery__main"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {allImages.length > 0 ? (
                            <>
                                <img src={mainImageSrc} alt="Main Item" onError={(e) => e.target.src='https://via.placeholder.com/400?text=Error'}/>
                                {allImages.length > 1 && (
                                    <>
                                        <button className="item-gallery__arrow item-gallery__arrow--prev" onClick={handlePrevImage}><ChevronLeft size={24}/></button>
                                        <button className="item-gallery__arrow item-gallery__arrow--next" onClick={handleNextImage}><ChevronRight size={24}/></button>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="item-gallery__placeholder"><ImageIcon size={48}/> {t('no_images')}</div>
                        )}
                        
                        {isEditing && currentImages.length > 0 && selectedImageIndex < currentImages.length && (
                            <button className="item-gallery__delete-btn" onClick={() => handleDeleteImage(currentImages[selectedImageIndex])}>
                                <Trash2 size={16}/> {t('remove_photo')}
                            </button>
                        )}
                    </div>

                    <div className="item-gallery__thumbnails">
                        {currentImages.map((img, idx) => (
                            <div 
                                key={idx} 
                                className={`item-gallery__thumb ${selectedImageIndex === idx ? 'item-gallery__thumb--active' : ''}`}
                                onClick={() => setSelectedImageIndex(idx)}
                            >
                                <img src={getImageUrl(img)} alt={`thumb-${idx}`} />
                            </div>
                        ))}
                        {previewNewImages.map((src, idx) => (
                            <div 
                                key={`new-${idx}`} 
                                className={`item-gallery__thumb item-gallery__thumb--new ${selectedImageIndex === (currentImages.length + idx) ? 'item-gallery__thumb--active' : ''}`}
                                onClick={() => setSelectedImageIndex(currentImages.length + idx)}
                            >
                                <img src={src} alt="new-thumb" />
                            </div>
                        ))}
                        
                        {isEditing && (
                            <button className="item-gallery__add-btn" onClick={() => fileInputRef.current.click()}>
                                <Upload size={20}/>
                            </button>
                        )}
                        <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleImageSelect} />
                    </div>

                    <div className="item-details__barcode">
                        <p>{t('barcode')}: <strong>{item.barcode}</strong></p>
                    </div>
                </div>

                <div className="item-info">
                    <h1 className="item-info__title">
                        {isEditing ? (
                            <input name="item_name" value={formData.item_name} onChange={handleChange} className="item-info__input item-info__input--title"/>
                        ) : item.item_name}
                    </h1>
                    
                    <div className="item-info__grid">
                        <div className="item-info__group">
                            <label>{t('category')}</label>
                            {isEditing ? (
                                <select name="category" value={formData.category} onChange={handleChange} className="item-info__input">
                                    <option value="Ring">{t('ring')}</option>
                                    <option value="Necklace">{t('necklace')}</option>
                                    <option value="Bracelet">{t('bracelet')}</option>
                                    <option value="Set">{t('set')}</option>
                                    <option value="Earring">{t('earring')}</option>
                                    <option value="Bangle">{t('bangle')}</option>
                                    <option value="Pendant">{t('pendant')}</option>
                                </select>
                            ) : <p className="item-info__value">{item.category}</p>}
                        </div>

                         <div className="item-info__group">
                            <label>{t('country')}</label>
                            {isEditing ? (
                                <select name="country_of_origin" value={formData.country_of_origin} onChange={handleChange} className="item-info__input">
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
                            ) : <p className="item-info__value">{item.country_of_origin || t('na')}</p>}
                        </div>

                        <div className="item-info__group">
                            <label>{t('karat')}</label>
                            {isEditing ? (
                                <select name="karat" value={formData.karat} onChange={handleChange} className="item-info__input">
                                    <option value="24">24K</option>
                                    <option value="22">22K</option>
                                    <option value="21">21K</option>
                                    <option value="18">18K</option>
                                </select>
                            ) : <p className="item-info__value">{item.karat}K</p>}
                        </div>

                         <div className="item-info__group">
                            <label>{t('weight')}</label>
                            {isEditing ? <input name="weight" value={formData.weight} onChange={handleChange} className="item-info__input"/> : <p className="item-info__value">{item.weight} {t('g')}</p>}
                        </div>
                    </div>

                    <div className="item-info__desc">
                        <label>{t('description_en')}</label>
                        {isEditing ? (
                            <textarea name="description" value={formData.description} onChange={handleChange} className="item-info__input item-info__input--textarea"/>
                        ) : (
                            <p className="item-info__text-box">{item.description || '-'}</p>
                        )}
                    </div>
                      <div className="item-info__desc">
                        <label>{t('description_ar')}</label>
                        {isEditing ? (
                            <textarea name="description_ar" value={formData.description_ar} onChange={handleChange} className="item-info__input item-info__input--textarea item-info__input--rtl"/>
                        ) : (
                            <p className="item-info__text-box item-info__text-box--rtl">{item.description_ar || '-'}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailsPage;