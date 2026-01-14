import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useTheme } from '../../context/ThemeContext';
import { useReactToPrint } from 'react-to-print';
import { InvoiceReceipt } from '../../components/invoice/invoiceReceipt/InvoiceReceipt';
import './SalesPage.css';
import { 
    Barcode, User, DollarSign, MessageCircle, 
    Trash2, Printer 
} from 'lucide-react';

const SalesPage = () => {
    const { theme } = useTheme();
    
    const [barcode, setBarcode] = useState('');
    const [customer, setCustomer] = useState({ name: '', phone: '', civilId: '' });
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('K-Net');
    const [whatsappLink, setWhatsappLink] = useState('');
    
    const [printData, setPrintData] = useState(null);
    
    const componentRef = useRef();
    const barcodeInputRef = useRef(null);

    useEffect(() => {
        if(barcodeInputRef.current) barcodeInputRef.current.focus();
    }, []);

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        onAfterPrint: () => {
            alert("Transaction Complete!");
            setCart([]);
            setCustomer({ name: '', phone: '', civilId: '' });
            setPrintData(null);
            setBarcode('');
            if(barcodeInputRef.current) barcodeInputRef.current.focus();
        }
    });

    useEffect(() => {
        if (printData) {
            handlePrint();
        }
    }, [printData]);

    const handleScan = async (e) => {
        if (e.key === 'Enter') {
            if (!barcode.trim()) return;
            try {
                const res = await api.get(`/gold/barcode/${barcode}`);
                const { item, analysis } = res.data;

                if (cart.find(c => c.gold_item_id === item.id)) {
                    alert("This item is already in the cart!");
                    setBarcode('');
                    return;
                }

                const newItem = {
                    gold_item_id: item.id,
                    name: item.item_name,
                    weight: parseFloat(item.weight),
                    karat: item.karat,
                    price_per_gram: analysis.current_market_price,
                    labor_cost: 3.000,
                    image_url: `http://localhost:5000/api/gold/image/${item.id}`
                };
                
                setCart([...cart, newItem]);
                setBarcode('');
            } catch (err) {
                alert("Item not found or already sold!");
                setBarcode('');
            }
        }
    };

    const removeFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const updateLaborCost = (index, newCost) => {
        const newCart = [...cart];
        newCart[index].labor_cost = parseFloat(newCost) || 0;
        setCart(newCart);
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => {
            const goldPrice = item.weight * item.price_per_gram;
            const laborPrice = item.weight * item.labor_cost;
            return sum + goldPrice + laborPrice;
        }, 0).toFixed(3);
    };

    const handleSubmitInvoice = async () => {
        if (cart.length === 0) return alert("Cart is empty!");

        const totalAmt = calculateTotal();

        const payload = {
            customer_name: customer.name,
            customer_phone: customer.phone,
            customer_civil_id: customer.civilId,
            payment_method: paymentMethod,
            items: cart.map(item => ({
                gold_item_id: item.gold_item_id,
                sell_price_per_gram: item.price_per_gram,
                labor_cost_per_gram: item.labor_cost,
                total_price: (item.weight * (item.price_per_gram + item.labor_cost))
            })),
            total_amount: totalAmt
        };

        try {
            const res = await api.post('/invoices/create', payload);
            setWhatsappLink(res.data.whatsappLink);
            
            setPrintData({
                invoiceId: res.data.invoice.id,
                date: new Date(),
                customer: customer,
                items: cart,
                total: totalAmt,
                paymentMethod: paymentMethod,
                user: { name: 'Admin' } 
            });

        } catch (err) {
            console.error(err);
            alert("Error saving invoice");
        }
    };

    return (
        <div className={`sales-page sales-page--${theme}`}>
            <div className="sales-header">
                <h1 className="sales-title">Point of Sale (POS)</h1>
                <div className="date-display">{new Date().toLocaleDateString()}</div>
            </div>

            <div className="sales-layout">
                <div className="sales-left-panel">
                    <section className={`sales-card sales-card--${theme}`}>
                        <h3 className="card-title"><User size={18}/> Customer Info</h3>
                        <div className="form-grid">
                            <input className="sales-input" placeholder="Civil ID / Mobile (Auto-fetch)" 
                                value={customer.civilId} onChange={e => setCustomer({...customer, civilId: e.target.value})} />
                            <input className="sales-input" placeholder="Customer Name" 
                                value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                            <input className="sales-input" placeholder="Phone Number" 
                                value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                        </div>
                    </section>

                    <section className={`sales-card sales-card--${theme} scanner-section`}>
                        <Barcode size={24} className="scanner-icon"/>
                        <input 
                            ref={barcodeInputRef}
                            className="scanner-input"
                            value={barcode}
                            onChange={e => setBarcode(e.target.value)}
                            onKeyDown={handleScan}
                            placeholder="Scan Barcode Here..."
                            autoFocus
                        />
                    </section>

                    <section className={`sales-card sales-card--${theme}`}>
                        <h3 className="card-title"><DollarSign size={18}/> Payment Method</h3>
                        <div className="payment-options">
                            {['K-Net', 'Cash', 'Visa/Master', 'Link'].map(method => (
                                <button 
                                    key={method}
                                    className={`payment-btn ${paymentMethod === method ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod(method)}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="sales-right-panel">
                    <section className={`sales-card sales-card--${theme} cart-section`}>
                        <div className="cart-table-wrapper">
                            <table className="cart-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Wt(g)</th>
                                        <th>Gold Pr.</th>
                                        <th>Labor/g</th>
                                        <th>Total</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="cart-item-info">
                                                    <img src={item.image_url} alt="" className="cart-thumb"/>
                                                    <div>
                                                        <div className="item-name">{item.name}</div>
                                                        <div className="item-karat">{item.karat}K</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{item.weight}</td>
                                            <td>{item.price_per_gram.toFixed(3)}</td>
                                            <td>
                                                <input 
                                                    type="number" 
                                                    step="0.1"
                                                    className="labor-input"
                                                    value={item.labor_cost}
                                                    onChange={(e) => updateLaborCost(index, e.target.value)}
                                                />
                                            </td>
                                            <td className="item-total">
                                                {(item.weight * (item.price_per_gram + item.labor_cost)).toFixed(3)}
                                            </td>
                                            <td>
                                                <button className="btn-remove" onClick={() => removeFromCart(index)}>
                                                    <Trash2 size={16}/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {cart.length === 0 && <div className="empty-cart">Cart is empty. Scan an item.</div>}
                        </div>

                        <div className="cart-footer">
                            <div className="total-row">
                                <span>Grand Total:</span>
                                <span className="total-amount">{calculateTotal()} <small>KWD</small></span>
                            </div>
                            
                            <div className="action-buttons">
                                {whatsappLink && (
                                    <button className="btn-action btn-whatsapp" onClick={() => window.open(whatsappLink, '_blank')}>
                                        <MessageCircle size={20}/> Send
                                    </button>
                                )}
                                <button className="btn-action btn-checkout" onClick={handleSubmitInvoice}>
                                    <Printer size={20}/> Checkout & Print
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <div style={{ display: "none" }}>
                <InvoiceReceipt ref={componentRef} data={printData} />
            </div>
        </div>
    );
};

export default SalesPage;