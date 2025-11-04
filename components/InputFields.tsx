import React, { useEffect } from 'react';
// FIX: The 'Action' type is defined in the reducer, not the general types file.
import { Action } from '../state/reducer';
import { IncomeSource } from '../types';
import { formatInputValue, parseFormattedValue } from '../utils/formatters';

export const SingleInputField: React.FC<{ label: string; path: string; value: number | null | string; dispatch: React.Dispatch<Action>; helpText?: string, type?: 'text' | 'number' }> = ({ label, path, value, dispatch, helpText, type = 'number' }) => {
  const handleChange = (val: string) => {
    const processedValue = type === 'number' ? parseFormattedValue(val) : val;
    dispatch({ type: 'UPDATE_FIELD', payload: { path, value: processedValue } });
  };
  
  const displayValue = type === 'number' ? formatInputValue(value as number) : value;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
       <input type="text" value={displayValue as string} onChange={(e) => handleChange(e.target.value)} className="mt-1 p-2 border rounded-md bg-white text-left w-full" />
       {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export const IncomeSourceField: React.FC<{
    label: string;
    path: string;
    value: IncomeSource;
    dispatch: React.Dispatch<Action>;
    helpText?: string;
}> = ({ label, path, value, dispatch, helpText }) => {

    useEffect(() => {
        if (!value || !value.additions || value.additions.length === 0) {
            dispatch({ type: 'ADD_ITEM', payload: { path } });
        }
    }, [path, value, dispatch]);

    const firstItem = value?.additions?.[0];

    const handleChange = (val: string) => {
        if (!firstItem) return;
        const processedValue = parseFormattedValue(val);
        dispatch({
            type: 'UPDATE_ITEM',
            payload: { path, id: firstItem.id, field: 'amount', value: processedValue }
        });
    };
    
    if (!firstItem) {
        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input type="text" disabled className="mt-1 p-2 border rounded-md bg-gray-100 text-left w-full" />
            </div>
        );
    }

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type="text"
                value={formatInputValue(firstItem.amount)}
                onChange={(e) => handleChange(e.target.value)}
                className="mt-1 p-2 border rounded-md bg-white text-left w-full"
            />
            {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
        </div>
    );
};

export const IncomeTableRow: React.FC<{
    label: React.ReactNode;
    path: string;
    value: IncomeSource;
    dispatch: React.Dispatch<Action>;
    helpText?: string;
    disabled?: boolean;
}> = ({ label, path, value, dispatch, helpText, disabled = false }) => {
    
    useEffect(() => {
        if (value && (!value.additions || value.additions.length === 0)) {
            dispatch({ type: 'ADD_ITEM', payload: { path } });
        }
    }, [path, value, dispatch]);

    const handleItemChange = (id: string, field: 'amount', val: any) => {
        const value = parseFormattedValue(val);
        dispatch({ type: 'UPDATE_ITEM', payload: { path, id, field, value } });
    };

    const firstItem = value?.additions?.[0];

    return (
        <tr className="border-b last:border-0 align-top">
            <td className="p-2 align-top pt-4">
                <p className={`font-medium text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</p>
                {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
            </td>
            <td className="p-2">
                {firstItem ? (
                    <input 
                        type="text" 
                        placeholder="Amount" 
                        value={disabled ? '' : formatInputValue(firstItem.amount)}
                        onChange={e => handleItemChange(firstItem.id, 'amount', e.target.value)}
                        disabled={disabled}
                        className={`p-2 border rounded-md text-left w-full text-sm ${disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}`}
                    />
                ) : (
                    <input type="text" disabled className="p-2 border rounded-md text-left w-full text-sm bg-gray-200" />
                )}
            </td>
        </tr>
    );
};