import React from 'react';
import { TaxData } from '../types';
import { Action } from '../state/reducer';
import Card from '../components/Card';
import { IncomeTableRow } from '../components/InputFields';
import { YEARLY_CONFIGS } from '../constants';

interface DeductionsProps {
    taxData: TaxData;
    dispatch: React.Dispatch<Action>;
}

const Deductions: React.FC<DeductionsProps> = ({ taxData, dispatch }) => {
    const { deductions, assessmentYear } = taxData;
    const isNewRegimeAvailable = YEARLY_CONFIGS[assessmentYear].NEW_REGIME_AVAILABLE;
    const ayNum = parseInt(assessmentYear.split('-')[0], 10);

    const tableHeader = () => (
        <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
            <tr>
                <th className="p-2 text-left font-semibold w-2/5">Particulars</th>
                <th className="p-2 text-left font-semibold">Amount Claimed (₹)</th>
            </tr>
        </thead>
    );
    
    return (
        <Card title="Deductions under Chapter VI-A">
            {isNewRegimeAvailable && <p className="text-sm bg-blue-50 text-blue-800 p-3 rounded-md mb-6">Note: Most deductions are not available under the New Tax Regime. The summary page will show a comparison.</p>}
            <table className="w-full table-fixed responsive-table">
                {tableHeader()}
                <tbody>
                    <IncomeTableRow label="Sec 80C, 80CCC, 80CCD(1)" path="deductions.c80" value={deductions.c80} dispatch={dispatch} helpText="e.g., LIC, PPF, NSC, ELSS, etc."/>
                    <IncomeTableRow label="Sec 80CCD(1B) - NPS Contribution (Self)" path="deductions.ccd1b80" value={deductions.ccd1b80} dispatch={dispatch}/>
                    <IncomeTableRow 
                        label="Sec 80CCD(1B) - Contribution to Minor's NPS Account" 
                        path="deductions.ccd1b80_minor" 
                        value={deductions.ccd1b80_minor} 
                        dispatch={dispatch} 
                        helpText="Deduction available from AY 2027-28. Combined limit with self-contribution is ₹50,000."
                        disabled={ayNum < 2027}
                    />
                    <IncomeTableRow label="Sec 80CCD(2) - Employer NPS Contribution" path="deductions.ccd2_80" value={deductions.ccd2_80} dispatch={dispatch} helpText="Allowed under both regimes."/>
                    <IncomeTableRow label="Sec 80D - Health Insurance" path="deductions.d80" value={deductions.d80} dispatch={dispatch}/>
                    <IncomeTableRow label="Sec 80DD - Disabled Dependent" path="deductions.dd80" value={deductions.dd80} dispatch={dispatch}/>
                    <IncomeTableRow label="Sec 80DDB - Medical Treatment" path="deductions.ddb80" value={deductions.ddb80} dispatch={dispatch}/>
                    <IncomeTableRow label="Sec 80E - Interest on Education Loan" path="deductions.e80" value={deductions.e80} dispatch={dispatch}/>
                    <IncomeTableRow label="Sec 80G - Donations" path="deductions.g80" value={deductions.g80} dispatch={dispatch}/>
                    <IncomeTableRow label="Sec 80GG - Rent Paid" path="deductions.gg80" value={deductions.gg80} dispatch={dispatch}/>
                    <IncomeTableRow label="Sec 80TTA - Interest on Savings Account" path="deductions.tta80" value={deductions.tta80} dispatch={dispatch}/>
                    <IncomeTableRow label="Sec 80TTB - Interest (Senior Citizens)" path="deductions.ttb80" value={deductions.ttb80} dispatch={dispatch}/>
                    <IncomeTableRow label="Sec 80U - Self Disability" path="deductions.u80" value={deductions.u80} dispatch={dispatch}/>
                </tbody>
            </table>
        </Card>
    );
};

export default Deductions;