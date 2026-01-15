import React from 'react';
import './InvoiceReceipt.css';
import { numberToWords } from '../../../utils/numberToWords.js';

export const InvoiceReceipt = React.forwardRef(({ data }, ref) => {
  if (!data) return null;

  const { invoice_number, createdAt, customer, items, total_amount, payments, user } = data;
  
  const totalGoldWeight = items.reduce((sum, item) => sum + parseFloat(item.weight), 0);
  
  // ⭐ FIX: Ensure Image URLs are absolute for the browser to load them correctly
  const API_URL = 'http://localhost:5000'; 
  
  const getFullImgUrl = (url) => {
      if (!url) return null;
      if (url.startsWith('http')) return url; // Cloudinary or absolute
      return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`; // Localhost
  };

  const idFront = getFullImgUrl(customer.id_card_front_url);
  const idBack = getFullImgUrl(customer.id_card_back_url);

  return (
    <div className="invoice-print-container" ref={ref}>
      <div className="invoice-box">
        
        <div className="invoice-header">
          <h1 className="invoice-title">Sell Invoice</h1>
          <p style={{margin:0, fontSize:12}}>{user?.branch?.name || "Main Branch"}</p>
        </div>

        <div className="invoice-info-grid">
          <div className="info-row">
            <div className="info-cell label">Invoice No</div>
            <div className="info-cell value">{invoice_number}</div>
            <div className="info-cell label">Date</div>
            <div className="info-cell value">{new Date(createdAt).toLocaleString()}</div>
          </div>

          <div className="info-row">
            <div className="info-cell label">Name</div>
            <div className="info-cell value wide">{customer.full_name}</div>
            <div className="info-cell label">Phone</div>
            <div className="info-cell value">{customer.phone}</div>
          </div>

          <div className="info-row">
            <div className="info-cell label">Address</div>
            <div className="info-cell value wide">{customer.address || "N/A"}</div>
            <div className="info-cell label">Civil ID</div>
            <div className="info-cell value">{customer.civil_id}</div>
          </div>
        </div>

        <table className="invoice-receipt-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Carat</th>
              <th>Price/g</th>
              <th>Labor</th>
              <th>Weight</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.item_name}</td>
                <td>1</td>
                <td>{item.karat}</td>
                <td>{parseFloat(item.sell_price_per_gram).toFixed(3)}</td>
                <td>{parseFloat(item.labor_cost).toFixed(3)}</td>
                <td>{parseFloat(item.weight).toFixed(3)}</td>
                <td>{parseFloat(item.total_price).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-totals">
          <div className="total-box"><span>Total Wt.</span><strong>{totalGoldWeight.toFixed(3)} g</strong></div>
          <div className="total-box main-total"><span>NET TOTAL</span><strong>{parseFloat(total_amount).toFixed(3)} KD</strong></div>
        </div>

        <div className="payment-breakdown" style={{marginTop:10, fontSize:11}}>
            <strong>Payment: </strong>
            {payments && payments.map((p, i) => (
                <span key={i} style={{marginRight:10}}>{p.method}: {parseFloat(p.amount).toFixed(3)} KD</span>
            ))}
        </div>

        <div className="signatures">
           <div className="sig-block"><span>Seller: {user?.full_name || "Admin"}</span><div className="sig-line"></div></div>
           <div className="sig-block"><span>Customer</span><div className="sig-line"></div></div>
        </div>

        {/* ID Cards Section */}
        {(idFront || idBack) && (
            <div className="id-card-section">
                {idFront && (
                    <img 
                        src={idFront} 
                        alt="ID Front" 
                        className="customer-id-img" 
                        // Prevents broken image icon if loading fails
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                )}
                {idBack && (
                    <img 
                        src={idBack} 
                        alt="ID Back" 
                        className="customer-id-img" 
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                )}
            </div>
        )}

      </div>
    </div>
  );
});