import React from 'react';
import { formatCurrency } from '../utils/formatters';

const SummaryRow: React.FC<{ label: React.ReactNode; value: number; isNegative?: boolean; isBold?: boolean; isAccent?: boolean }> = ({ label, value, isNegative, isBold, isAccent }) => {
    const format = (val: number) => {
        if (isNegative) { // For deductions, etc., which are always subtracted
            return `(${formatCurrency(Math.abs(val))})`;
        }
        if (val < 0) { // For income heads that are losses
            return `(${formatCurrency(Math.abs(val))})`
        }
        return formatCurrency(val);
    };

    return (
        <tr className={`${isBold ? 'font-bold' : ''} ${isAccent ? 'bg-gray-50' : 'border-b'}`}>
            <td className="p-2 text-left">{label}</td>
            <td className="p-2 text-right">{format(value)}</td>
        </tr>
    )
};

export default SummaryRow;
