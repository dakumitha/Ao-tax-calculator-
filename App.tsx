import React, { useState, useReducer, useMemo, useEffect } from 'react';
import { TaxData, TaxRegime, IncomeSource, ComputationResult, AssessmentType, AdditionItem, DetailedIncomeBreakdown, SetOffDetail, PresumptiveScheme, Vehicle44AE, ResidentialStatus, InternationalIncomeItem, InternationalIncomeNature, ComplianceStatus, TrustData, SalaryDetails, HouseProperty } from './types';
import { INCOME_HEADS, ASSESSMENT_YEARS, YEARLY_CONFIGS, FILING_DUE_DATES, AUDIT_TAXPAYER_TYPES } from './constants';
import { calculateTax } from './services/taxCalculator';

// Helper to get today's date in yyyy-mm-dd format
const getTodayYYYYMMDD = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const newAdditionItem = (): AdditionItem => ({
  id: Date.now().toString(36) + Math.random().toString(36).substring(2),
  amount: null,
  location: 'India',
});

const newIncomeSource = (): IncomeSource => ({
    additions: [newAdditionItem()],
});


const newVehicle44AE = (): Vehicle44AE => ({
  id: Date.now().toString(36) + Math.random().toString(36).substring(2),
  type: 'other',
  tonnage: null,
  months: null,
});

const newInternationalIncomeItem = (): InternationalIncomeItem => ({
    id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    country: '',
    nature: InternationalIncomeNature.Salary,
    amountInINR: null,
    taxPaidInINR: null,
    taxRateOutsideIndia: null,
    taxPayableUnder115JBJC: null,
    dtaaApplicable: false,
    applicableDtaaArticle: '15', // Default for Salary
    taxRateAsPerDtaa: null,
    isLTCG: false,
    specialSection: 'None',
    transferPricing: {
        isAssociatedEnterprise: false,
        armsLengthPrice: null,
        form3CEBStatus: ComplianceStatus.NotApplicable,
    },
    form67Filed: false,
    refundClaimed: false,
    creditUnderDispute: false,
});

const newTrustData = (): TrustData => ({
    disallowedReceipts12A: newIncomeSource(),
    disallowedReceipts10_23C: newIncomeSource(),
});

const newSalaryDetails = (): SalaryDetails => ({
    employeeType: 'non-government',
    wasStandardDeductionAllowedPreviously: false,
    basicSalary: newIncomeSource(),
    allowances: newIncomeSource(),
    bonusAndCommission: newIncomeSource(),
    perquisites: {
        rentFreeAccommodation: newIncomeSource(),
        motorCar: newIncomeSource(),
        otherPerquisites: newIncomeSource(),
    },
    profitsInLieu: {
        terminationCompensation: newIncomeSource(),
        commutedPension: newIncomeSource(),
        retrenchmentCompensation: newIncomeSource(),
        vrsCompensation: newIncomeSource(),
        otherProfitsInLieu: newIncomeSource(),
    },
    exemptions: {
        hra: newIncomeSource(),
        lta: newIncomeSource(),
        gratuity: newIncomeSource(),
        leaveEncashment: newIncomeSource(),
        commutedPension: newIncomeSource(),
        retrenchmentCompensation: newIncomeSource(),
        vrsCompensation: newIncomeSource(),
        providentFund: newIncomeSource(),
        superannuationFund: newIncomeSource(),
        specialAllowances: newIncomeSource(),
        otherExemptions: newIncomeSource(),
    },
    deductions: {
        professionalTax: newIncomeSource(),
        entertainmentAllowance: newIncomeSource(),
    },
});

const newHouseProperty = (): HouseProperty => ({
    id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    grossRent: newIncomeSource(),
    municipalTaxes: newIncomeSource(),
    interestOnLoan: newIncomeSource(),
    isSelfOccupied: false,
});


const initialTaxData: TaxData = {
  assesseeName: '',
  pan: '',
  assessmentYear: '2024-25',
  taxpayerType: 'individual',
  residentialStatus: 'resident_ordinarily_resident',
  age: 'below60',
  gender: 'male',
  isGovernedByPortugueseCivilCode: false,
  taxRegime: TaxRegime.Old, // Default to Old, as selection is removed. Comparison view handles both.
  companyType: 'domestic',
  companySubType: '',
  previousYearTurnover: null,
  trustData: newTrustData(),
  salary: newSalaryDetails(),
  houseProperty: [newHouseProperty()],
  pgbp: {
    isControlledFromIndia: false,
    netProfit: newIncomeSource(),
    speculativeIncome: newIncomeSource(),
    presumptiveScheme: PresumptiveScheme.None,
    turnover44AD_digital: newIncomeSource(),
    turnover44AD_other: newIncomeSource(),
    grossReceipts44ADA: newIncomeSource(),
    vehicles44AE: [],
    aggregateReceipts44B: newIncomeSource(),
    aggregateReceipts44BB: newIncomeSource(),
    aggregateReceipts44BBA: newIncomeSource(),
    aggregateReceipts44BBB: newIncomeSource(),
    additions: {
        unreportedSales: newIncomeSource(),
        unaccountedBusinessIncome: newIncomeSource(),
        bogusPurchases: newIncomeSource(),
        unrecordedCredits: newIncomeSource(),
        gpNpRatioDifference: newIncomeSource(),
        stockSuppression: newIncomeSource(),
        disallowance36_employeeContrib: newIncomeSource(),
        disallowance36_1_vii_provisions: newIncomeSource(),
        disallowance36_1_iii_interest: newIncomeSource(),
        disallowance37_1_nonBusiness: newIncomeSource(),
        disallowance37_1_personal: newIncomeSource(),
        disallowance37_1_capital: newIncomeSource(),
        disallowance40a_tds: newIncomeSource(),
        disallowance40b_partnerPayments: newIncomeSource(),
        disallowance40A2_relatedParty: newIncomeSource(),
        disallowance40A3_cashPayment: newIncomeSource(),
        disallowance40A7_gratuity: newIncomeSource(),
        disallowance40A9_unapprovedFunds: newIncomeSource(),
        disallowance43B_statutoryDues: newIncomeSource(),
        disallowance14A_exemptIncome: newIncomeSource(),
        incorrectDepreciation: newIncomeSource(),
        unexplainedExpenditure: newIncomeSource(),
        otherDisallowances: newIncomeSource(),
    }
  },
  capitalGains: { 
    stcg111A: newIncomeSource(), 
    stcgOther: newIncomeSource(), 
    ltcg112A: newIncomeSource(), 
    ltcgOther: newIncomeSource(), 
    adjustment50C: newIncomeSource(),
    costOfImprovement: newIncomeSource(),
    exemption54: newIncomeSource(),
    exemption54B_ltcg: newIncomeSource(),
    exemption54B_stcg: newIncomeSource(),
    exemption54D: newIncomeSource(),
    exemption54EC: newIncomeSource(),
    exemption54EE: newIncomeSource(),
    exemption54F: newIncomeSource(),
    exemption54G: newIncomeSource(),
    exemption54GA: newIncomeSource(),
    exemption54GB: newIncomeSource(),
    adjustment50: newIncomeSource(),
    adjustment50CA: newIncomeSource(),
    adjustment50D: newIncomeSource(),
    adjustment43CA: newIncomeSource(),
  },
  otherSources: { otherIncomes: newIncomeSource(), winnings: newIncomeSource(), exemptIncome: newIncomeSource(), otherExemptIncomeSec10: newIncomeSource(), disallowance14A: newIncomeSource(), deemedDividend2_22_e: newIncomeSource(), gifts56_2_x: newIncomeSource(), familyPension: newIncomeSource(), interestOnEnhancedCompensation: newIncomeSource(), raceHorseIncome: newIncomeSource() },
  deemedIncome: { sec68_cashCredits: newIncomeSource(), sec69_unexplainedInvestments: newIncomeSource(), sec69A_unexplainedMoney: newIncomeSource(), sec69B_investmentsNotDisclosed: newIncomeSource(), sec69C_unexplainedExpenditure: newIncomeSource(), sec69D_hundiBorrowing: newIncomeSource() },
  internationalIncome: [],
  deductions: { 
    c80: newIncomeSource(), ccd1b80: newIncomeSource(), ccd2_80: newIncomeSource(), d80: newIncomeSource(), dd80: newIncomeSource(), ddb80: newIncomeSource(), e80: newIncomeSource(), g80: newIncomeSource(), ggc80: newIncomeSource(), tta80: newIncomeSource(), ttb80: newIncomeSource(), u80: newIncomeSource(), jjaa80: newIncomeSource(), gg80: newIncomeSource(), gga80: newIncomeSource(), qqb80: newIncomeSource(), rrb80: newIncomeSource(), ia80: newIncomeSource()
  },
  losses: { 
    broughtForward: { houseProperty: null, businessNonSpeculative: null, businessSpeculative: null, ltcl: null, stcl: null, raceHorses: null, unabsorbedDepreciation: null }, 
    currentYear: { houseProperty: null, businessNonSpeculative: null, businessSpeculative: null, ltcl: null, stcl: null, raceHorses: null } 
  },
  interestCalc: { 
    dueDateOfFiling: FILING_DUE_DATES['2024-25']['non-audit'], 
    actualDateOfFiling: getTodayYYYYMMDD(), 
    assessmentType: 'regular',
    dueDate148Notice: '',
    taxOnEarlierAssessment: null,
    incomeAsPerEarlierAssessment: null,
    noReturnFurnishedForReassessment: false,
    advanceTaxInstallments: { q1: null, q2: null, q3: null, q4: null } 
  },
  tds: null,
  advanceTax: null,
};

type Action = 
  | { type: 'UPDATE_FIELD'; payload: { path: string; value: any } }
  | { type: 'ADD_ITEM'; payload: { path: string; afterId?: string } }
  | { type: 'REMOVE_ITEM'; payload: { path: string, id: string } }
  | { type: 'UPDATE_ITEM'; payload: { path: string, id: string, field: 'amount' | 'location', value: any } }
  | { type: 'ADD_VEHICLE' }
  | { type: 'REMOVE_VEHICLE'; payload: { id: string } }
  | { type: 'UPDATE_VEHICLE'; payload: { id: string, field: keyof Omit<Vehicle44AE, 'id'>, value: any } }
  | { type: 'ADD_INTERNATIONAL_INCOME' }
  | { type: 'REMOVE_INTERNATIONAL_INCOME'; payload: { id: string } }
  | { type: 'UPDATE_INTERNATIONAL_INCOME_ITEM'; payload: { id: string; path: string; value: any } }
  | { type: 'ADD_HOUSE_PROPERTY' }
  | { type: 'REMOVE_HOUSE_PROPERTY'; payload: { id: string } }
  | { type: 'RESET_STATE'; payload: TaxData };


function taxDataReducer(state: TaxData, action: Action): TaxData {
    let newState = JSON.parse(JSON.stringify(state)); // Deep copy for safety
    
    // Handle specific actions first
    switch (action.type) {
        case 'RESET_STATE':
            return action.payload;
        case 'ADD_HOUSE_PROPERTY':
            newState.houseProperty.push(newHouseProperty());
            return newState;
        case 'REMOVE_HOUSE_PROPERTY':
            newState.houseProperty = newState.houseProperty.filter((hp: HouseProperty) => hp.id !== action.payload.id);
            if (newState.houseProperty.length === 0) {
                newState.houseProperty.push(newHouseProperty());
            }
            return newState;
        case 'ADD_VEHICLE':
            newState.pgbp.vehicles44AE.push(newVehicle44AE());
            return newState;
        case 'REMOVE_VEHICLE':
            newState.pgbp.vehicles44AE = newState.pgbp.vehicles44AE.filter((v: Vehicle44AE) => v.id !== action.payload.id);
            return newState;
        case 'UPDATE_VEHICLE': {
            const vehicleIndex = newState.pgbp.vehicles44AE.findIndex((v: Vehicle44AE) => v.id === action.payload.id);
            if (vehicleIndex > -1) {
                (newState.pgbp.vehicles44AE[vehicleIndex] as any)[action.payload.field] = action.payload.value;
            }
            return newState;
        }
        case 'ADD_INTERNATIONAL_INCOME':
            newState.internationalIncome.push(newInternationalIncomeItem());
            return newState;
        case 'REMOVE_INTERNATIONAL_INCOME':
            newState.internationalIncome = newState.internationalIncome.filter((item: InternationalIncomeItem) => item.id !== action.payload.id);
            return newState;
        case 'UPDATE_INTERNATIONAL_INCOME_ITEM': {
             const itemIndex = newState.internationalIncome.findIndex((item: InternationalIncomeItem) => item.id === action.payload.id);
             if (itemIndex > -1) {
                 const keys = action.payload.path.split('.');
                 let current = newState.internationalIncome[itemIndex];
                 for (let i = 0; i < keys.length - 1; i++) {
                     if (current[keys[i]] === undefined) current[keys[i]] = {};
                     current = (current as any)[keys[i]];
                 }
                 (current as any)[keys[keys.length - 1]] = action.payload.value;

                 if (action.payload.path === 'nature') {
                    const newNature = action.payload.value as InternationalIncomeNature;
                    if (newNature === InternationalIncomeNature.LongTermCapitalGain) {
                        newState.internationalIncome[itemIndex].isLTCG = true;
                    } else if (newNature === InternationalIncomeNature.ShortTermCapitalGain) {
                        newState.internationalIncome[itemIndex].isLTCG = false;
                    }
                 }
             }
             return newState;
        }
    }

    // Generic path-based updates for other actions
    const keys = action.payload.path.split('.');
    let current: any = newState;

    for (let i = 0; i < keys.length; i++) {
        if (i === keys.length - 1) {
             switch (action.type) {
                case 'UPDATE_FIELD':
                    current[keys[i]] = action.payload.value;
                    break;
                case 'ADD_ITEM':
                    if (current[keys[i]] && Array.isArray(current[keys[i]].additions)) {
                        const list = current[keys[i]].additions;
                        const newItem = newAdditionItem();
                        if (action.payload.afterId) {
                            const index = list.findIndex((item: AdditionItem) => item.id === action.payload.afterId);
                            if (index > -1) {
                                list.splice(index + 1, 0, newItem);
                            } else {
                                list.push(newItem); // fallback
                            }
                        } else {
                            list.push(newItem);
                        }
                    }
                    break;
                case 'REMOVE_ITEM':
                    if (current[keys[i]] && Array.isArray(current[keys[i]].additions)) {
                        current[keys[i]].additions = current[keys[i]].additions.filter((item: AdditionItem) => item.id !== action.payload.id);
                    }
                    break;
                case 'UPDATE_ITEM':
                     if (current[keys[i]] && Array.isArray(current[keys[i]].additions)) {
                        const itemIndex = current[keys[i]].additions.findIndex((item: AdditionItem) => item.id === action.payload.id);
                        if (itemIndex > -1) {
                            (current[keys[i]].additions[itemIndex] as any)[action.payload.field] = action.payload.value;
                        }
                    }
                    break;
            }
        } else {
             if (current[keys[i]] === undefined) current[keys[i]] = {}; // Create path if not exist
             current = current[keys[i]];
        }
    }
    
    // Handle special cases after main update
    if (action.type === 'UPDATE_FIELD' && (action.payload.path === 'assessmentYear' || action.payload.path === 'taxpayerType')) {
        const year = newState.assessmentYear;
        const type = newState.taxpayerType;
        const isAuditCase = AUDIT_TAXPAYER_TYPES.includes(type);
        const newDueDate = FILING_DUE_DATES[year]?.[isAuditCase ? 'audit' : 'non-audit'] || '';
        newState.interestCalc.dueDateOfFiling = newDueDate;
        if (action.payload.path === 'assessmentYear' && !YEARLY_CONFIGS[year].NEW_REGIME_AVAILABLE && newState.taxRegime === TaxRegime.New) {
            newState.taxRegime = TaxRegime.Old;
        }
        if (action.payload.path === 'taxpayerType' && action.payload.value === 'trust') {
            newState.taxpayerType = 'trust';
        }
    }


    return newState;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(value));

const formatInputValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '';
  // Handle negative sign correctly
  const sign = value < 0 ? '-' : '';
  const numStr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.abs(value));
  return sign + numStr;
};

const parseFormattedValue = (val: string): number | null => {
  if (val.trim() === '' || val.trim() === '-') return null;
  const num = parseFloat(val.replace(/,/g, ''));
  return isNaN(num) ? null : num;
};


const format234CMonths = (months: { q1: number, q2: number, q3: number, q4: number }) => {
    const parts = [];
    if (months.q1 > 0) parts.push(`Q1`);
    if (months.q2 > 0) parts.push(`Q2`);
    if (months.q3 > 0) parts.push(`Q3`);
    if (months.q4 > 0) parts.push(`Q4`);
    if (parts.length === 0) return '';
    return `(on ${parts.join(', ')} shortfall)`;
};

const SingleInputField: React.FC<{ label: string; path: string; value: number | null | string; dispatch: React.Dispatch<Action>; helpText?: string, type?: 'text' | 'number' }> = ({ label, path, value, dispatch, helpText, type = 'number' }) => {
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

const IncomeSourceField: React.FC<{
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

const IncomeTableRow: React.FC<{
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

const Card: React.FC<{ title: React.ReactNode; children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
  <div className={`bg-white p-4 md:p-6 rounded-lg shadow-md mb-6 ${className}`}>
    <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 no-print">{title}</h2>
    {children}
  </div>
);

const ComparisonRow: React.FC<{ label: React.ReactNode; oldVal: number; newVal: number; isNegative?: boolean; isBold?: boolean; isAccent?: boolean }> = ({ label, oldVal, newVal, isNegative, isBold, isAccent }) => {
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
            <td className="p-2 text-right" data-label="Old Regime (₹)">{format(oldVal)}</td>
            <td className="p-2 text-right" data-label="New Regime (₹)">{format(newVal)}</td>
        </tr>
    )
};


const SummaryView: React.FC<{ data: TaxData; result: ComputationResult }> = ({ data, result }) => {
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

    if (isComparisonAvailable && comparisonResults) {
        const { old: oldResult, new: newResult } = comparisonResults;
        
        return (<>
            <div className="flex justify-end mb-4 no-print">
                <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                    Export to PDF
                </button>
            </div>
            <div id="printable-area">
                <Card title="Tax Computation Summary & Comparison" className="card-for-print">
                    <div className="print-only mb-4 border-b pb-4">
                        <h2 className="text-xl font-bold mb-2">Computation of Total Income</h2>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div><strong>Assessee:</strong> {data.assesseeName}</div>
                            <div><strong>PAN:</strong> {data.pan}</div>
                            <div><strong>Assessment Year:</strong> {data.assessmentYear}</div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm responsive-summary-table">
                            <thead>
                                <tr className="bg-gray-200 text-gray-700">
                                    <th className="p-2 text-left">Particulars</th>
                                    <th className="p-2 text-right">Old Regime (₹)</th>
                                    <th className="p-2 text-right">New Regime (₹)</th>
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
                                
                                <ComparisonRow label="Tax on Total Income (before Surcharge)" oldVal={oldResult.taxLiability} newVal={newResult.taxLiability} />
                                <ComparisonRow label="Add: Surcharge" oldVal={oldResult.surcharge} newVal={newResult.surcharge} />
                                { (oldResult.marginalRelief > 0 || newResult.marginalRelief > 0) &&
                                <ComparisonRow label="Less: Marginal Relief" oldVal={oldResult.marginalRelief} newVal={newResult.marginalRelief} isNegative />
                                }
                                <ComparisonRow label="Less: Rebate u/s 87A" oldVal={oldResult.rebate87A} newVal={newResult.rebate87A} isNegative />
                                <ComparisonRow label="Health & Education Cess" oldVal={oldResult.healthAndEducationCess} newVal={newResult.healthAndEducationCess} />
                                <ComparisonRow label="Final Tax Liability" oldVal={oldResult.totalTaxPayable} newVal={newResult.totalTaxPayable} isBold isAccent/>
                                
                                <ComparisonRow label="Less: TDS / TCS" oldVal={data.tds ?? 0} newVal={data.tds ?? 0} isNegative />
                                <ComparisonRow label="Less: Advance Tax" oldVal={data.advanceTax ?? 0} newVal={data.advanceTax ?? 0} isNegative />

                                <tr className="font-bold text-lg bg-blue-100 final-total-row">
                                    <td className="p-3 text-left">Net Tax Payable</td>
                                    <td className="p-3 text-right" data-label="Old Regime (₹)">{formatCurrency(oldResult.netPayable)}</td>
                                    <td className="p-3 text-right" data-label="New Regime (₹)">{formatCurrency(newResult.netPayable)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </>);
    }

    return <div>Summary not available for this assessee type yet.</div>;
};

const COMPANY_SUB_TYPES = {
  domestic: [
    'Company - Domestic (Turnover > ₹400 Cr)',
    'Company - Domestic (Turnover ≤ ₹400 Cr)',
    'Company - Domestic (Opting for Sec 115BAA)',
    'Company - Domestic (Opting for Sec 115BAB)',
  ],
  legal: [
    'Legal Sub-type: Private Limited Company',
    'Legal Sub-type: Public Limited Company',
    'Legal Sub-type: One Person Company (OPC)',
  ],
  foreign: [
    'Company - Foreign (Resident - POEM in India)',
    'Company - Foreign (Non-Resident, with PE)',
    'Company - Foreign (Non-Resident, with SEP)',
    'Company - Foreign (Non-Resident, Other Income)',
  ],
};

const RESIDENTIAL_STATUS_OPTIONS = {
  resident: [
    { id: 'res1', text: 'You were in India for 182 days or more during the previous year [section 6(1)(a)]' },
    { id: 'res2', text: 'You were in India for 60 days or more during the previous year, and have been in India for 365 days or more within the 4 preceding years [section (6)(1)(c)] [where Explanation 1 is not applicable]' },
    { id: 'res3', text: 'You are a citizen of India, who left India, for the purpose of employment, as a member of the crew of an Indian ship and were in India for 182 days or more during the previous year and 365 days or more within the preceding 4 years [Explanation 1(a) of section (6)(1)(c)]' },
    { id: 'res4', text: 'You are a citizen of India or a person of Indian origin and have come on a visit to India during the previous year and were in India for a) 182 days or more during the previous year and 365 days or more within the preceding 4 years; or b) 120 days or more during the previous year and 365 days or more within the preceding 4 years if the total income, other than income from foreign sources, exceeds Rs. 15 lakh. [Explanation 1(b) of section (6)(1)(c)]' },
  ],
  rnor: [
    { id: 'rnor1', text: 'You have been a non-resident in India in 9 out of 10 preceding years [section 6(6)(a)]' },
    { id: 'rnor2', text: 'You have been in India for 729 days or less during the 7 preceding years [section 6(6)(a)]' },
    { id: 'rnor3', text: 'You are a citizen of India or person of Indian origin, who comes on a visit to India, having total income, other than the income from foreign sources, exceeding Rs. 15 lakh and have been in India for 120 days or more but less than 182 days during the previous year [section 6(6)(c)]' },
    { id: 'rnor4', text: 'You are a citizen of India having total income, other than the income from foreign sources, exceeding Rs. 15 lakh during the previous year and not liable to tax in any other country or territory by reason of your domicile or residence or any other criteria of similar nature [section 6(6)(d) rws 6(1A)]' },
  ],
  non_resident: [
    { id: 'nr1', text: 'You were a non-resident during the previous year.' },
  ],
};


export default function App() {
  const [activeTab, setActiveTab] = useState('Start Here');
  const [taxData, dispatch] = useReducer(taxDataReducer, initialTaxData);
  const [panError, setPanError] = useState('');
  const [selectedIncomeHeads, setSelectedIncomeHeads] = useState<Set<string>>(new Set());

  // State for detailed residential status UI
  const [detailedStatusCategory, setDetailedStatusCategory] = useState<'resident' | 'rnor' | 'non_resident' | ''>('');
  const [detailedStatusReason, setDetailedStatusReason] = useState<string>('');


  useEffect(() => {
    // Sync detailed residential status UI state for individuals
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


  const handlePanChange = (pan: string) => {
    const upperPan = pan.toUpperCase();
    dispatch({type: 'UPDATE_FIELD', payload: {path: 'pan', value: upperPan}});
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;
    if (upperPan && !panRegex.test(upperPan)) {
        setPanError('Invalid PAN format. Should be ABCDE1234F.');
    } else {
        setPanError('');
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      dispatch({ type: 'RESET_STATE', payload: initialTaxData });
      setSelectedIncomeHeads(new Set());
      setPanError('');
      setActiveTab('Start Here');
    }
  };
  
  const handleIncomeHeadToggle = (head: string) => {
    setSelectedIncomeHeads(prev => {
        const newSet = new Set(prev);
        if (newSet.has(head)) {
            newSet.delete(head);
            if(activeTab === head) {
                setActiveTab('Start Here');
            }
        } else {
            newSet.add(head);
        }
        return newSet;
    });
  };

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


  const computationResult = useMemo(() => calculateTax(taxData), [taxData]);

  const dynamicTabs = useMemo(() => {
    const sortedHeads = INCOME_HEADS.filter(head => selectedIncomeHeads.has(head));
    return ['Start Here', ...sortedHeads, 'Deductions', 'Tax Summary'];
  }, [selectedIncomeHeads]);


  const renderContent = () => {
    const tableHeader = () => (
        <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
            <tr>
                <th className="p-2 text-left font-semibold w-2/5">Particulars</th>
                <th className="p-2 text-left font-semibold">Amount Claimed (₹)</th>
            </tr>
        </thead>
    );

    switch (activeTab) {
      case 'Start Here':
        return (<>
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
        </>);
      case 'Salary': {
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
      }
       case 'House Property':
       case 'PGBP':
       case 'Capital Gains':
       case 'Other Sources':
        return (
            <Card title={`Income from ${activeTab}`}>
                 <div className="p-4 bg-gray-100 rounded-md text-center text-gray-600">
                    <p className="font-semibold">This section will be enabled in a future update.</p>
                </div>
            </Card>
        );
      case 'Deductions':
        const { deductions } = taxData;
        const isNewRegimeAvailable = YEARLY_CONFIGS[taxData.assessmentYear].NEW_REGIME_AVAILABLE;
        
        return (<>
            <Card title="Deductions under Chapter VI-A">
                {isNewRegimeAvailable && <p className="text-sm bg-blue-50 text-blue-800 p-3 rounded-md mb-6">Note: Most deductions are not available under the New Tax Regime. The summary page will show a comparison.</p>}
                <table className="w-full table-fixed responsive-table">
                    {tableHeader()}
                    <tbody>
                        <IncomeTableRow label="Sec 80C, 80CCC, 80CCD(1)" path="deductions.c80" value={deductions.c80} dispatch={dispatch} helpText="e.g., LIC, PPF, NSC, ELSS, etc."/>
                        <IncomeTableRow label="Sec 80CCD(1B) - NPS Contribution" path="deductions.ccd1b80" value={deductions.ccd1b80} dispatch={dispatch}/>
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
        </>);
      case 'Tax Summary':
        return <SummaryView data={taxData} result={computationResult} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white shadow-md p-4 no-print">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center md:text-left">Income Tax Calculator</h1>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-center">
             <select value={taxData.assessmentYear} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'assessmentYear', value: e.target.value}})} className="p-2 border rounded-md font-semibold bg-gray-50 w-full md:w-auto flex-grow">
                {ASSESSMENT_YEARS.map(year => <option key={year} value={year}>{year}</option>)}
             </select>
             <button onClick={handleReset} className="text-sm bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors flex-shrink-0">Reset</button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8">
        <nav className="mb-4 md:mb-8 overflow-x-auto whitespace-nowrap no-print">
          <ul className="flex border-b">
            {dynamicTabs.map(tab => (
              <li key={tab} className="-mb-px mr-1">
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`inline-block py-2 px-4 font-semibold ${activeTab === tab ? 'text-blue-600 border-l border-t border-r rounded-t' : 'text-gray-500 hover:text-blue-800'}`}
                >
                  {tab}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div>{renderContent()}</div>
      </main>
    </div>
  );
}
