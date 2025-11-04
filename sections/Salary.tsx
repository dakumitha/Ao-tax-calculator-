import React from 'react';
import { TaxData } from '../types';
import { Action } from '../state/reducer';
import Card from '../components/Card';
import { IncomeTableRow } from '../components/InputFields';

interface SalaryProps {
    taxData: TaxData;
    dispatch: React.Dispatch<Action>;
}

const Salary: React.FC<SalaryProps> = ({ taxData, dispatch }) => {
    return (
      <>
        <Card title="Income from Salary">
            <p className="text-sm text-gray-600 mb-4">Enter your salary components. If a component is not applicable, leave it blank.</p>
            <table className="w-full responsive-table">
                <tbody>
                    <IncomeTableRow label="1. Basic Salary" path="salary.basicSalary" value={taxData.salary.basicSalary} dispatch={dispatch} />
                    <IncomeTableRow label="2. Taxable Allowances" path="salary.allowances" value={taxData.salary.allowances} dispatch={dispatch} helpText="Enter the taxable portion of allowances like HRA, LTA, etc." />
                    <IncomeTableRow label="3. Taxable Perquisites" path="salary.perquisites.otherPerquisites" value={taxData.salary.perquisites.otherPerquisites} dispatch={dispatch} helpText="e.g., Value of rent-free accommodation, car facility, etc." />
                    <IncomeTableRow label="4. Bonuses, Commissions, etc." path="salary.bonusAndCommission" value={taxData.salary.bonusAndCommission} dispatch={dispatch} />
                    <IncomeTableRow label="5. Profits in lieu of Salary" path="salary.profitsInLieu.otherProfitsInLieu" value={taxData.salary.profitsInLieu.otherProfitsInLieu} dispatch={dispatch} />
                </tbody>
            </table>
        </Card>
        <Card title="Deductions from Salary (u/s 16)">
            <p className="text-sm text-gray-600 mb-4">Standard Deduction is calculated automatically and shown in the summary. You can enter other applicable deductions below.</p>
             <table className="w-full responsive-table">
                <tbody>
                    <IncomeTableRow label="1. Professional Tax" path="salary.deductions.professionalTax" value={taxData.salary.deductions.professionalTax} dispatch={dispatch} />
                    <IncomeTableRow 
                      label="2. Entertainment Allowance" 
                      path="salary.deductions.entertainmentAllowance" 
                      value={taxData.salary.deductions.entertainmentAllowance} 
                      dispatch={dispatch} 
                      helpText="Deduction is available only for government employees."
                    />
                </tbody>
            </table>
        </Card>
      </>
    );
};

export default Salary;
