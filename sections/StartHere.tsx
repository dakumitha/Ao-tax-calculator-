import React, { useState, useEffect } from 'react';
import { TaxData, ResidentialStatus } from '../types';
import { Action } from '../state/reducer';
import Card from '../components/Card';
import { SingleInputField } from '../components/InputFields';
import { INCOME_HEADS, RESIDENTIAL_STATUS_OPTIONS } from '../constants';

interface StartHereProps {
    taxData: TaxData;
    dispatch: React.Dispatch<Action>;
    panError: string;
    handlePanChange: (pan: string) => void;
    selectedIncomeHeads: Set<string>;
    handleIncomeHeadToggle: (head: string) => void;
}

const StartHere: React.FC<StartHereProps> = ({ taxData, dispatch, panError, handlePanChange, selectedIncomeHeads, handleIncomeHeadToggle }) => {
    const [detailedStatusCategory, setDetailedStatusCategory] = useState<'resident' | 'rnor' | 'non_resident' | ''>('');
    const [detailedStatusReason, setDetailedStatusReason] = useState<string>('');

    useEffect(() => {
        if (taxData.taxpayerType === 'individual') {
            switch (taxData.residentialStatus) {
                case 'resident_ordinarily_resident': setDetailedStatusCategory('resident'); break;
                case 'resident_not_ordinarily_resident': setDetailedStatusCategory('rnor'); break;
                case 'non_resident': setDetailedStatusCategory('non_resident'); break;
                default: setDetailedStatusCategory('');
            }
        } else {
            setDetailedStatusCategory('');
            setDetailedStatusReason('');
        }
    }, [taxData.taxpayerType, taxData.residentialStatus]);
    
    const handleResidentialStatusCategoryChange = (category: 'resident' | 'rnor' | 'non_resident') => {
        setDetailedStatusCategory(category);
        setDetailedStatusReason(''); // Reset reason when category changes
        let statusValue: ResidentialStatus;
        switch (category) {
            case 'resident': statusValue = 'resident_ordinarily_resident'; break;
            case 'rnor': statusValue = 'resident_not_ordinarily_resident'; break;
            case 'non_resident': statusValue = 'non_resident'; break;
        }
        dispatch({ type: 'UPDATE_FIELD', payload: { path: 'residentialStatus', value: statusValue } });
    };

    return (
        <Card title="Start Here: Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
               <SingleInputField label="Name of Taxpayer" path="assesseeName" value={taxData.assesseeName} dispatch={dispatch} type="text" />
               <div>
                 <label className="block text-sm font-medium text-gray-700">PAN</label>
                 <input type="text" value={taxData.pan} onChange={e => handlePanChange(e.target.value)} className={`mt-1 w-full p-2 border rounded-md uppercase ${panError ? 'border-red-500' : 'border-gray-300'}`} maxLength={10} />
                 {panError && <p className="text-red-500 text-xs mt-1">{panError}</p>}
               </div>
               
                <div>
                    <label className="block text-sm font-medium text-gray-700">Taxpayer Type</label>
                    <select value={taxData.taxpayerType} onChange={e => dispatch({ type: 'UPDATE_FIELD', payload: { path: 'taxpayerType', value: e.target.value } })} className="mt-1 w-full p-2 border rounded-md">
                        <option value="individual">Individuals</option>
                        <option value="huf">HUFs</option>
                        <option value="firm">Firms &amp; LLP</option>
                        <option value="company">Companies</option>
                        <option value="aop">Associations &amp; Societies</option>
                        <option value="local authority">Authorities &amp; Juridical Persons</option>
                        <option value="trust">Trusts, Estates &amp; Funds</option>
                        <option value="exempt_entity">Exempt Entities (ITR-7 Filers)</option>
                    </select>
                </div>
               
               {taxData.taxpayerType === 'firm' && (
                   <div>
                       <label className="block text-sm font-medium text-gray-700">Firm / LLP Sub-Category</label>
                       <select
                           value={taxData.firmSubType}
                           onChange={e => dispatch({ type: 'UPDATE_FIELD', payload: { path: 'firmSubType', value: e.target.value as 'partnership_firm' | 'llp_firm' } })}
                           className="mt-1 w-full p-2 border rounded-md">
                           <option value="partnership_firm">Firm - Partnership Firm (under 1932 Act)</option>
                           <option value="llp_firm">Firm - Limited Liability Partnership (LLP) (under 2008 Act)</option>
                       </select>
                   </div>
               )}

               {taxData.taxpayerType === 'individual' &&
                (<>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Age Group</label>
                        <select value={taxData.age} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'age', value: e.target.value}})} className="mt-1 w-full p-2 border rounded-md">
                            <option value="below60">Below 60</option>
                            <option value="60to80">60 to 80 (Senior)</option>
                            <option value="above80">Above 80 (Super Senior)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select value={taxData.gender} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'gender', value: e.target.value as 'male' | 'female'}})} className="mt-1 w-full p-2 border rounded-md">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Relevant for special tax slab for resident women in AY 2012-13 and earlier.</p>
                    </div>
                    <div className="md:col-span-2">
                         <fieldset>
                            <legend className="block text-sm font-medium text-gray-700 mb-2">Residential Status</legend>
                            <div className="flex flex-wrap gap-4 mb-3">
                                {(Object.keys(RESIDENTIAL_STATUS_OPTIONS) as Array<keyof typeof RESIDENTIAL_STATUS_OPTIONS>).map(cat => (
                                    <div key={cat} className="flex items-center">
                                        <input
                                            id={`cat-${cat}`}
                                            type="radio"
                                            name="statusCategory"
                                            checked={detailedStatusCategory === cat}
                                            onChange={() => handleResidentialStatusCategoryChange(cat)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`cat-${cat}`} className="ml-2 block text-sm text-gray-900 capitalize">{cat.replace('_', ' ')}</label>
                                    </div>
                                ))}
                            </div>
                         </fieldset>
                         {detailedStatusCategory && (
                            <div className="mt-2 pl-2 border-l-2 border-blue-200">
                                <p className="text-sm font-medium text-gray-700 mb-2">Please select the applicable condition:</p>
                                <div className="space-y-2">
                                    {RESIDENTIAL_STATUS_OPTIONS[detailedStatusCategory].map(option => (
                                        <div key={option.id} className="flex items-start">
                                            <input
                                                id={option.id}
                                                type="radio"
                                                name="statusReason"
                                                value={option.id}
                                                checked={detailedStatusReason === option.id}
                                                onChange={(e) => setDetailedStatusReason(e.target.value)}
                                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                                            />
                                            <label htmlFor={option.id} className="ml-3 block text-sm text-gray-700">{option.text}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         )}
                    </div>
                     <div className="md:col-span-2 flex items-center">
                        <input
                            type="checkbox"
                            id="portugueseCode"
                            checked={taxData.isGovernedByPortugueseCivilCode || false}
                            onChange={(e) => dispatch({ type: 'UPDATE_FIELD', payload: { path: 'isGovernedByPortugueseCivilCode', value: e.target.checked } })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="portugueseCode" className="ml-2 block text-sm text-gray-900">
                            Are you governed by Portuguese Civil Code as per section 5A?
                        </label>
                    </div>
                </>)
               }
            </div>
            <div className="mt-6 border-t pt-6">
                 <fieldset>
                    <legend className="text-lg font-medium text-gray-900">Select Your Income Sources</legend>
                    <p className="text-sm text-gray-600 mb-4">Select all that apply. Tabs for each selected source will appear for data entry.</p>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                        {INCOME_HEADS.map(head => (
                            <div key={head} className="relative flex items-start">
                                <div className="flex h-6 items-center">
                                    <input
                                        id={`income-head-${head}`}
                                        name={`income-head-${head}`}
                                        type="checkbox"
                                        checked={selectedIncomeHeads.has(head)}
                                        onChange={() => handleIncomeHeadToggle(head)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="ml-3 text-sm leading-6">
                                    <label htmlFor={`income-head-${head}`} className="font-medium text-gray-900">{head}</label>
                                </div>
                            </div>
                        ))}
                    </div>
                </fieldset>
            </div>
             <div className="mt-6 border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <SingleInputField label="TDS / TCS Deducted" path="tds" value={taxData.tds} dispatch={dispatch} />
                <SingleInputField label="Advance Tax Paid" path="advanceTax" value={taxData.advanceTax} dispatch={dispatch} />
            </div>
        </Card>
    );
};

export default StartHere;
