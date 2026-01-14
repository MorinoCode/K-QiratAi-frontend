import React from 'react';
import './InvoiceReceipt.css';

// استفاده از forwardRef برای دسترسی به DOM جهت پرینت
export const InvoiceReceipt = React.forwardRef(({ data }, ref) => {
    if (!data) return null;

    const { customer, items, total, invoiceId, date, user } = data;

    return (
        <div ref={ref} className="receipt-box">
            {/* Header */}
            <div className="receipt-header">
                <h2 className="shop-name">K-QIRAT JEWELRY</h2>
                <p className="shop-address">Salmiya, Kuwait</p>
                <p className="shop-phone">+965 1234 5678</p>
                <div className="dashed-line">--------------------------------</div>
                <p className="invoice-meta">
                    <strong>Date:</strong> {new Date(date).toLocaleString()}<br/>
                    <strong>Inv #:</strong> {invoiceId}<br/>
                    <strong>Salesman:</strong> {user?.name || 'Admin'}
                </p>
            </div>

            <div className="dashed-line">--------------------------------</div>

            {/* Customer Info (Optional on receipt) */}
            <div className="customer-info">
                <p><strong>Customer:</strong> {customer.name || 'Walk-in'}</p>
                {customer.civilId && <p><strong>Civil ID:</strong> {customer.civilId}</p>}
            </div>

            <div className="dashed-line">--------------------------------</div>

            {/* Items Table */}
            <table className="receipt-table">
                <thead>
                    <tr>
                        <th className="qty-col">Item</th>
                        <th className="desc-col">Desc</th>
                        <th className="price-col">Price</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td>{item.weight}g</td>
                            <td>
                                {item.karat}K {item.name}
                                <br/>
                                <small>@{item.price_per_gram.toFixed(3)} + Labor</small>
                            </td>
                            <td className="text-right">
                                {((item.weight * (item.price_per_gram + item.labor_cost))).toFixed(3)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="dashed-line">--------------------------------</div>

            {/* Totals */}
            <div className="receipt-footer">
                <div className="total-row">
                    <span>TOTAL (KWD):</span>
                    <span className="big-total">{total}</span>
                </div>
                <p className="payment-method">Paid via: {data.paymentMethod}</p>
            </div>

            <div className="dashed-line">--------------------------------</div>

            {/* Terms & Barcode */}
            <div className="receipt-terms">
                <p>No refund after 24 hours.</p>
                <p>Exchange within 3 days with original invoice.</p>
                <p className="thank-you">*** THANK YOU ***</p>
            </div>
            
            {/* فضایی برای بارکد فاکتور (بعداً می‌توانیم بارکد واقعی بگذاریم) */}
            <div className="receipt-barcode">
                ||| || |||| || |||| |||
                <br/>
                {invoiceId}
            </div>
        </div>
    );
});