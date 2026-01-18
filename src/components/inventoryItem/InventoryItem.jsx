import React from 'react';
import { Printer, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './InventoryItem.css';

const InventoryItem = ({ item, calculateLivePrice, calculateProfit, onDelete, onPrint, theme }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const API_URL = 'http://localhost:5000';

    const handleRowClick = () => {
        navigate(`/inventory/item/${item.id}`);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate(`/inventory/item/${item.id}`);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(item.id);
    };

    const handlePrint = (e) => {
        e.stopPropagation();
        if (onPrint) onPrint(item);
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/50?text=No+Img';
        if (url.startsWith('http')) return url;
        return `${API_URL}${url}`;
    };

    const thumbnail = (item.images && item.images.length > 0) 
        ? getImageUrl(item.images[0])
        : 'https://via.placeholder.com/50?text=No+Img';

    const livePrice = calculateLivePrice(item);
    const profit = calculateProfit(item);
    const isProfitPositive = parseFloat(profit) >= 0;

    return (
        <tr className={`inventory-item inventory-item--${theme}`} onClick={handleRowClick}>
            <td className="inventory-item__cell inventory-item__cell--image">
                <div className="inventory-item__img-wrapper">
                    <img 
                        src={thumbnail} 
                        alt={item.item_name}
                        className="inventory-item__img"
                        onError={(e) => {e.target.src = 'https://via.placeholder.com/50?text=Error'}} 
                    />
                </div>
            </td>
            <td className="inventory-item__cell inventory-item__cell--info">
                <div className="inventory-item__info">
                    <span className="inventory-item__name">{item.item_name}</span>
                    <div className="inventory-item__meta">
                        <span className="inventory-item__barcode">{item.barcode}</span>
                        <span className="inventory-item__separator">•</span>
                        <span className="inventory-item__category">{item.category}</span>
                    </div>
                </div>
            </td>
            <td className="inventory-item__cell" data-label={t('metal_type')}>
                {item.metal_type}
            </td>
            <td className="inventory-item__cell" data-label={t('karat')}>
                <span className={`inventory-item__badge inventory-item__badge--${item.karat}k`}>
                    {item.karat}K
                </span>
            </td>
            <td className="inventory-item__cell" data-label={t('weight')}>
                {item.weight} <small>g</small>
            </td>
            <td className="inventory-item__cell" data-label={t('quantity')}>
                {item.quantity}
            </td>
            <td className="inventory-item__cell inventory-item__cell--mono" data-label={t('cost_price')}>
                {parseFloat(item.buy_price_per_gram).toFixed(3)}
            </td>
            <td className="inventory-item__cell inventory-item__cell--bold" data-label={t('live_price')}>
                {livePrice}
            </td>
            <td className="inventory-item__cell" data-label={t('profit')}>
                <span className={`inventory-item__profit ${isProfitPositive ? 'inventory-item__profit--pos' : 'inventory-item__profit--neg'}`}>
                    {profit}
                </span>
            </td>
            <td className="inventory-item__cell inventory-item__cell--actions">
                <div className="inventory-item__actions-group">
                    <button className="inventory-item__action-btn" onClick={handlePrint} title={t('print_barcode')}>
                        <Printer size={16} />
                    </button>
                    <button className="inventory-item__action-btn" onClick={handleEdit} title={t('edit')}>
                        <Edit size={16} />
                    </button>
                    <button className="inventory-item__action-btn inventory-item__action-btn--delete" onClick={handleDelete} title={t('delete')}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default InventoryItem;