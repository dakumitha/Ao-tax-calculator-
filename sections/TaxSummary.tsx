import React, { useMemo, useState } from 'react';
import { TaxData, ComputationResult, TaxRegime, DetailedIncomeBreakdown } from '../types';
import Card from '../components/Card';
import ComparisonRow from '../components/ComparisonRow';
import { YEARLY_CONFIGS } from '../constants';
import { calculateTax } from '../services/taxCalculator';
import { formatCurrency } from '../utils/formatters';
import SummaryRow from '../components/SummaryRow';

interface TaxSummaryProps {
    data: TaxData;
    result: ComputationResult;
}

const TaxSummary: React.FC<TaxSummaryProps> = ({ data, result }) => {
    const [summaryView, setSummaryView] = useState<'comparison' | 'old' | 'new'>('comparison');

    const isIndividualLike = ['individual', 'huf', 'aop', 'boi', 'artificial juridical person'].includes(data.taxpayerType);
    const isNewRegimeAvailable = YEARLY_CONFIGS[data.assessmentYear].NEW_REGIME_AVAILABLE;
    const isComparisonAvailable = (data.taxpayerType !== 'trust' && data.taxpayerType !== 'exempt_entity') && isIndividualLike && isNewRegimeAvailable;
    
    const handlePrint = () => {
        window.print();
    };

    const comparisonResults = useMemo(() => {
        if (isComparisonAvailable) {
            const oldRegimeData = { ...JSON.parse(JSON.stringify(data)), taxRegime: TaxRegime.Old };
            const newRegimeData = { ...JSON.parse(JSON.stringify(data)), taxRegime: TaxRegime.New };
            return {
                old: calculateTax(oldRegimeData),
                new: calculateTax(newRegimeData),
            };
        }
        return null;
    }, [data, isComparisonAvailable]);

    const renderDetailedIncomeHead = (label: string, oldBreakdown: DetailedIncomeBreakdown, newBreakdown: DetailedIncomeBreakdown) => (
        <ComparisonRow label={label} oldVal={oldBreakdown.assessed} newVal={newBreakdown.assessed} isBold />
    );

    const Switcher = () => (
        <div className="flex items-center rounded-full bg-gray-100 p-1 shadow-inner text-sm">
            {(['comparison', 'old', 'new'] as const).map((view) => (
                <button
                    key={view}
                    onClick={() => setSummaryView(view)}
                    className={`px-4 py-1.5 rounded-full font-semibold transition-all duration-300 ease-in-out ${
                        summaryView === view
                            ? 'bg-white shadow text-blue-600'
                            : 'text-gray-500 hover:text-gray-800'
                    }`}
                    aria-pressed={summaryView === view}
                >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
            ))}
        </div>
    );

    const CardTitle: React.FC<{ text: string }> = ({ text }) => (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
            <h2 className="text-xl font-semibold text-gray-800">{text}</h2>
            <Switcher />
        </div>
    );

    const renderComparisonView = () => {
        if (!comparisonResults) return null;
        const { old: oldResult, new: newResult } = comparisonResults;
        const netSavings = oldResult.netPayable - newResult.netPayable;

        const getHighlightClass = (regime: 'old' | 'new') => {
            if (netSavings === 0) return 'bg-blue-100';
            if (regime === 'new' && netSavings > 0) return 'bg-green-100 text-green-800';
            if (regime === 'old' && netSavings < 0) return 'bg-green-100 text-green-800';
            return 'bg-blue-100';
        };
        
        const savingsText = netSavings > 0 
            ? `${formatCurrency(netSavings)}` 
            : `(${formatCurrency(Math.abs(netSavings))})`;
        const savingsColor = netSavings > 0 ? 'text-green-700' : netSavings < 0 ? 'text-red-700' : '';

        return (
            <Card title={<CardTitle text="Tax Computation Summary & Comparison" />} className="card-for-print">
                <div className="print-only mb-4 border-b pb-4">
                    <h2 className="text-xl font-bold mb-2">Computation of Total Income</h2>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><strong>Assessee:</strong> {data.assesseeName}</div>
                        <div><strong>PAN:</strong> {data.pan}</div>
                        <div><strong>Assessment Year:</strong> {data.assessmentYear}</div>
                    </div>
                </div>

                <div className="text-center mb-6 p-4 rounded-lg bg-indigo-50 text-indigo-900 no-print border border-indigo-200">
                    {netSavings > 0 ? (
                        <p className="text-base">Choosing the <strong>New Regime</strong> could potentially save you <strong className="text-green-700">{formatCurrency(netSavings)}</strong>.</p>
                    ) : netSavings < 0 ? (
                        <p className="text-base">Choosing the <strong>Old Regime</strong> could potentially save you <strong className="text-green-700">{formatCurrency(Math.abs(netSavings))}</strong>.</p>
                    ) : (
                        <p className="text-base">The tax liability is the same under both regimes.</p>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm responsive-summary-table">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700">
                                <th className="p-2 text-left w-2/5">Particulars</th>
                                <th className="p-2 text-right">Old Regime (₹)</th>
                                <th className="p-2 text-right">New Regime (₹)</th>
                                <th className="p-2 text-right">Savings (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderDetailedIncomeHead("Income from Salary", oldResult.breakdown.income.salary, newResult.breakdown.income.salary)}
                            { (oldResult.breakdown.income.houseProperty.assessed !== 0 || newResult.breakdown.income.houseProperty.assessed !== 0) &&
                                renderDetailedIncomeHead("Income from House Property", oldResult.breakdown.income.houseProperty, newResult.breakdown.income.houseProperty)
                            }
                            <ComparisonRow label="Gross Total Income" oldVal={oldResult.grossTotalIncome} newVal={newResult.grossTotalIncome} isBold isAccent />
                            {(oldResult.breakdown.standardDeduction > 0 || newResult.breakdown.standardDeduction > 0) &&
                                <ComparisonRow label="Less: Standard Deduction u/s 16" oldVal={oldResult.breakdown.standardDeduction} newVal={newResult.breakdown.standardDeduction} isNegative />
                            }
                            {(oldResult.totalDeductions > 0 || newResult.totalDeductions > 0) &&
                                <ComparisonRow label="Less: Deductions under Chapter VI-A" oldVal={oldResult.totalDeductions} newVal={newResult.totalDeductions} isNegative />
                            }
                            <ComparisonRow label="Net Taxable Income" oldVal={oldResult.netTaxableIncome} newVal={newResult.netTaxableIncome} isBold isAccent />
                            
                            <ComparisonRow label="Tax on Total Income" oldVal={oldResult.taxLiability} newVal={newResult.taxLiability} showSavings={false} />
                            <ComparisonRow label="Add: Surcharge" oldVal={oldResult.surcharge} newVal={newResult.surcharge} showSavings={false} />
                            { (oldResult.marginalRelief > 0 || newResult.marginalRelief > 0) &&
                            <ComparisonRow label="Less: Marginal Relief" oldVal={oldResult.marginalRelief} newVal={newResult.marginalRelief} isNegative showSavings={false} />
                            }
                            <ComparisonRow label="Less: Rebate u/s 87A" oldVal={oldResult.rebate87A} newVal={newResult.rebate87A} isNegative showSavings={false} />
                            <ComparisonRow label="Health & Education Cess" oldVal={oldResult.healthAndEducationCess} newVal={newResult.healthAndEducationCess} showSavings={false} />
                            <ComparisonRow label="Final Tax Liability" oldVal={oldResult.totalTaxPayable} newVal={newResult.totalTaxPayable} isBold isAccent/>
                            
                            <ComparisonRow label="Less: TDS / TCS" oldVal={data.tds ?? 0} newVal={data.tds ?? 0} isNegative showSavings={false} />
                            <ComparisonRow label="Less: Advance Tax" oldVal={data.advanceTax ?? 0} newVal={data.advanceTax ?? 0} isNegative showSavings={false} />

                            <tr className="font-bold text-lg final-total-row">
                                <td className="p-3 text-left bg-blue-100">Net Tax Payable</td>
                                <td className={`p-3 text-right ${getHighlightClass('old')}`} data-label="Old Regime (₹)">{formatCurrency(oldResult.netPayable)}</td>
                                <td className={`p-3 text-right ${getHighlightClass('new')}`} data-label="New Regime (₹)">{formatCurrency(newResult.netPayable)}</td>
                                <td className={`p-3 text-right ${savingsColor} bg-blue-100`} data-label="Savings (₹)">
                                    {netSavings !== 0 ? savingsText : '-'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        );
    };

    const renderSingleRegimeView = () => {
        if (!comparisonResults) return null;
        const regime = summaryView === 'old' ? TaxRegime.Old : TaxRegime.New;
        const resultToShow = summaryView === 'old' ? comparisonResults.old : comparisonResults.new;

        return (
            <Card title={<CardTitle text={`Tax Computation (${regime} Regime)`} />} className="card-for-print">
               <div className="print-only mb-4 border-b pb-4">
                   <h2 className="text-xl font-bold mb-2">Computation of Total Income</h2>
                   <div className="grid grid-cols-3 gap-4 text-sm">
                       <div><strong>Assessee:</strong> {data.assesseeName}</div>
                       <div><strong>PAN:</strong> {data.pan}</div>
                       <div><strong>Assessment Year:</strong> {data.assessmentYear}</div>
                   </div>
               </div>
               <div className="overflow-x-auto">
                   <table className="w-full text-sm">
                       <thead>
                           <tr className="bg-gray-200 text-gray-700">
                               <th className="p-2 text-left">Particulars</th>
                               <th className="p-2 text-right">Amount (₹)</th>
                           </tr>
                       </thead>
                       <tbody>
                           <SummaryRow label="Income from Salary" value={resultToShow.breakdown.income.salary.assessed} isBold />
                           {(resultToShow.breakdown.income.houseProperty.assessed !== 0) &&
                               <SummaryRow label="Income from House Property" value={resultToShow.breakdown.income.houseProperty.assessed} isBold />
                           }
                           <SummaryRow label="Gross Total Income" value={resultToShow.grossTotalIncome} isBold isAccent />
                           {(resultToShow.breakdown.standardDeduction > 0) &&
                               <SummaryRow label="Less: Standard Deduction u/s 16" value={resultToShow.breakdown.standardDeduction} isNegative />
                           }
                           {(resultToShow.totalDeductions > 0) &&
                               <SummaryRow label="Less: Deductions under Chapter VI-A" value={resultToShow.totalDeductions} isNegative />
                           }
                           <SummaryRow label="Net Taxable Income" value={resultToShow.netTaxableIncome} isBold isAccent />
                           
                           <SummaryRow label="Tax on Total Income (before Surcharge)" value={resultToShow.taxLiability} />
                           <SummaryRow label="Add: Surcharge" value={resultToShow.surcharge} />
                           {(resultToShow.marginalRelief > 0) &&
                               <SummaryRow label="Less: Marginal Relief" value={resultToShow.marginalRelief} isNegative />
                           }
                           <SummaryRow label="Less: Rebate u/s 87A" value={resultToShow.rebate87A} isNegative />
                           <SummaryRow label="Health & Education Cess" value={resultToShow.healthAndEducationCess} />
                           <SummaryRow label="Final Tax Liability" value={resultToShow.totalTaxPayable} isBold isAccent/>
                           
                           <SummaryRow label="Less: TDS / TCS" value={data.tds ?? 0} isNegative />
                           <SummaryRow label="Less: Advance Tax" value={data.advanceTax ?? 0} isNegative />

                           <tr className="font-bold text-lg bg-blue-100">
                               <td className="p-3 text-left">Net Tax Payable</td>
                               <td className="p-3 text-right">{formatCurrency(resultToShow.netPayable)}</td>
                           </tr>
                       </tbody>
                   </table>
               </div>
           </Card>
        );
    };

    if (isComparisonAvailable && comparisonResults) {
        return (<>
            <div className="flex justify-end items-center mb-4 no-print">
                <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                    Export to PDF
                </button>
            </div>
            <div id="printable-area">
                {summaryView === 'comparison' ? renderComparisonView() : renderSingleRegimeView()}
            </div>
        </>);
    }

    return <div>Summary not available for this assessee type yet.</div>;
};

export default TaxSummary;