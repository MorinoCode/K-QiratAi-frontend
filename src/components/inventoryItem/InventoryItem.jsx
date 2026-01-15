import React from 'react';
import { Printer, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './InventoryItem.css';

const InventoryItem = ({ item, calculateLivePrice, calculateProfit, onDelete, theme }) => {
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
        alert(t('print_coming_soon'));
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
        <tr className={`inventory-row inventory-row--${theme}`} onClick={handleRowClick}>
            <td className="inventory-row__cell inventory-row__cell--image">
                <div className="inventory-row__img-wrapper">
                    <img 
                        src={thumbnail} 
                        alt={item.item_name}
                        className="inventory-row__img"
                        onError={(e) => {e.target.src = 'https://via.placeholder.com/50?text=Error'}} 
                    />
                </div>
            </td>
            <td className="inventory-row__cell inventory-row__cell--info">
                <div className="inventory-row__info">
                    <span className="inventory-row__name">{item.item_name}</span>
                    <div className="inventory-row__meta">
                        <span className="inventory-row__barcode">{item.barcode}</span>
                        <span className="inventory-row__separator">•</span>
                        <span className="inventory-row__category">{item.category}</span>
                    </div>
                </div>
            </td>
            <td className="inventory-row__cell inventory-row__cell--metal" data-label={t('metal_type')}>
                {item.metal_type}
            </td>
            <td className="inventory-row__cell inventory-row__cell--karat" data-label={t('karat')}>
                <span className={`inventory-row__badge inventory-row__badge--${item.karat}k`}>
                    {item.karat}K
                </span>
            </td>
            <td className="inventory-row__cell inventory-row__cell--weight" data-label={t('weight')}>
                {item.weight} <small>g</small>
            </td>
            <td className="inventory-row__cell inventory-row__cell--qty" data-label={t('quantity')}>
                {item.quantity}
            </td>
            <td className="inventory-row__cell inventory-row__cell--cost" data-label={t('cost_price')}>
                {parseFloat(item.buy_price_per_gram).toFixed(3)}
            </td>
            <td className="inventory-row__cell inventory-row__cell--live" data-label={t('live_price')}>
                <span className="inventory-row__live-price">{livePrice}</span>
            </td>
            <td className="inventory-row__cell inventory-row__cell--profit" data-label={t('profit')}>
                <span className={`inventory-row__profit ${isProfitPositive ? 'inventory-row__profit--pos' : 'inventory-row__profit--neg'}`}>
                    {profit}
                </span>
            </td>
            <td className="inventory-row__cell inventory-row__cell--actions">
                <div className="inventory-row__actions-group">
                    <button className="inventory-row__action-btn inventory-row__action-btn--print" onClick={handlePrint} title={t('print_barcode')}>
                        <Printer size={16} />
                    </button>
                    <button className="inventory-row__action-btn inventory-row__action-btn--edit" onClick={handleEdit} title={t('edit')}>
                        <Edit size={16} />
                    </button>
                    <button className="inventory-row__action-btn inventory-row__action-btn--delete" onClick={handleDelete} title={t('delete')}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default InventoryItem;