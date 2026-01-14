import React from 'react';
import { Printer, Edit, Trash2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InventoryItem = ({ item, calculateLivePrice, calculateProfit, theme }) => {
    const navigate = useNavigate();

    // رفتن به صفحه جزئیات
    const handleRowClick = () => {
        navigate(`/inventory/item/${item.id}`);
    };

    // جلوگیری از اینکه وقتی دکمه حذف را می‌زنیم، وارد صفحه جزئیات شود
    const handleActionClick = (e, action) => {
        e.stopPropagation();
        action();
    };

    return (
        <tr className={`inventory-table__row inventory-table__row--${theme}`} onClick={handleRowClick}>
            <td>
                <div className="item-img-wrapper">
                    <img 
                        src={`http://localhost:5000/api/gold/image/${item.id}`} 
                        alt={item.item_name}
                        onError={(e) => {e.target.src = 'https://via.placeholder.com/50?text=Gold'}} 
                    />
                </div>
            </td>
            <td>
                <div className="item-info">
                    <span className="item-name">{item.item_name}</span>
                    <span className="item-barcode">{item.barcode}</span>
                    <span className="item-category-tag">{item.category}</span> {/* نمایش دسته‌بندی */}
                </div>
            </td>
            <td><span className={`badge-karat k${item.karat}`}>{item.karat}K</span></td>
            <td>{item.weight} g</td>
            <td className="text-muted">{parseFloat(item.buy_price_per_gram).toFixed(3)}</td>
            <td className="text-bold">{calculateLivePrice(item)}</td>
            <td>
                <span className={`profit-val ${calculateProfit(item) >= 0 ? 'pos' : 'neg'}`}>
                    {calculateProfit(item)}
                </span>
            </td>
            <td>
                <div className="action-buttons">
                    <button onClick={(e) => handleActionClick(e, () => alert('Print'))} title="Print Barcode">
                        <Printer size={16} />
                    </button>
                    <button onClick={(e) => handleActionClick(e, () => alert('Edit'))} title="Edit">
                        <Edit size={16} />
                    </button>
                    <button 
                        onClick={(e) => handleActionClick(e, () => alert('Delete logic here'))} 
                        title="Delete" 
                        className="btn-delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default InventoryItem;