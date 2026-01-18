import React from 'react';
import Barcode from 'react-barcode';
import './BarcodeLabel.css';

export const BarcodeLabel = React.forwardRef(({ item, currency = 'KWD' }, ref) => {
    if (!item) return null;

    return (
        <div ref={ref} className="barcode-label-container">
            <div className="barcode-label__wing barcode-label__wing--left">
                <span className="barcode-label__price">
                    {(parseFloat(item.weight) * (item.buy_price_per_gram || 0)).toFixed(3)} {currency}
                </span>
                <div className="barcode-label__details">
                    <span>{item.weight}g</span>
                    <span>{item.karat}K</span>
                </div>
            </div>

            <div className="barcode-label__gap"></div>

            <div className="barcode-label__wing barcode-label__wing--right">
                <div className="barcode-label__barcode-wrapper">
                    <Barcode 
                        value={item.barcode}
                        width={1}
                        height={20}
                        fontSize={9}
                        format="CODE128"
                        displayValue={false}
                        margin={0}
                        background="transparent"
                    />
                </div>
                <span className="barcode-label__code">{item.barcode}</span>
                <span className="barcode-label__name">{item.metal_type} - {item.category}</span>
            </div>
        </div>
    );
});