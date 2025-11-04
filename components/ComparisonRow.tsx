import React from 'react';
import { formatCurrency } from '../utils/formatters';

const ComparisonRow: React.FC<{ 
    label: React.ReactNode; 
    oldVal: number; 
    newVal: number; 
    isNegative?: boolean; 
    isBold?: boolean; 
    isAccent?: boolean;
    showSavings?: boolean; 
}> = ({ label, oldVal, newVal, isNegative, isBold, isAccent, showSavings = true }) => {
    const format = (val: number) => {
        if (isNegative) { // For deductions, etc., which are always subtracted
            return `(${formatCurrency(Math.abs(val))})`;
        }
        if (val < 0) { // For income heads that are losses
            return `(${formatCurrency(Math.abs(val))})`
        }
        return formatCurrency(val);
    };

    const savings = oldVal - newVal;
    const savingsText = savings > 0 
        ? `${formatCurrency(savings)}` 
        : `(${formatCurrency(Math.abs(savings))})`;
    const savingsColor = savings > 0 ? 'text-green-600 font-medium' : savings < 0 ? 'text-red-600 font-medium' : 'text-gray-600';

    return (
        <tr className={`${isBold ? 'font-bold' : ''} ${isAccent ? 'bg-gray-50' : 'border-b'}`}>
            <td className="p-2 text-left">{label}</td>
            <td className="p-2 text-right" data-label="Old Regime (₹)">{format(oldVal)}</td>
            <td className="p-2 text-right" data-label="New Regime (₹)">{format(newVal)}</td>
            {showSavings ? (
                 <td className={`p-2 text-right ${savingsColor}`} data-label="Savings (₹)">
                    {savings !== 0 ? savingsText : '-'}
                 </td>
            ) : (
                <td className="p-2 text-right" data-label="Savings (₹)">-</td>
            )}
        </tr>
    )
};

export default ComparisonRow;