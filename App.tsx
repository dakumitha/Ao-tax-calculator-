import React, { useState, useReducer, useMemo, useEffect } from 'react';
import { TaxData, TaxRegime, IncomeSource, ComputationResult, AssessmentType, AdditionItem, DetailedIncomeBreakdown, SetOffDetail, PresumptiveScheme, Vehicle44AE, ResidentialStatus, InternationalIncomeItem, InternationalIncomeNature, ComplianceStatus, TrustData, SalaryDetails, HouseProperty } from './types';
import { TABS, ASSESSMENT_YEARS, YEARLY_CONFIGS, FILING_DUE_DATES, AUDIT_TAXPAYER_TYPES } from './constants';
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
  taxRegime: TaxRegime.Old, // Default to Old, as selection is removed. Comparison view handles both.
  companyType: 'domestic',
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-2 border-b py-2 last:border-0">
      <div>
        <label className="text-gray-600 font-medium text-sm">{label}</label>
        {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
      </div>
      <input type="text" value={displayValue as string} onChange={(e) => handleChange(e.target.value)} className="p-2 border rounded-md bg-white text-left" />
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
    multiEntry?: boolean;
}> = ({ label, path, value, dispatch, helpText, disabled = false, multiEntry = false }) => {
    
    useEffect(() => {
        // Ensure there's always one item for single-entry rows
        if (!multiEntry && value && (!value.additions || value.additions.length === 0)) {
            dispatch({ type: 'ADD_ITEM', payload: { path } });
        }
    }, [path, value, dispatch, multiEntry]);

    const handleItemChange = (id: string, field: 'amount', val: any) => {
        const value = parseFormattedValue(val);
        dispatch({ type: 'UPDATE_ITEM', payload: { path, id, field, value } });
    };

    const handleAdd = () => {
        dispatch({ type: 'ADD_ITEM', payload: { path } });
    };

    const handleRemove = (id: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { path, id } });
    };

    const firstItem = value?.additions?.[0];

    return (
        <tr className="border-b last:border-0 align-top">
            <td className="p-2 align-top pt-4">
                <p className={`font-medium text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</p>
                {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
            </td>
            <td className="p-2">
                 {multiEntry ? (
                    <div className="space-y-2">
                        {value?.additions?.map(item => (
                            <div key={item.id} className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Amount" 
                                    value={disabled ? '' : formatInputValue(item.amount)}
                                    onChange={e => handleItemChange(item.id, 'amount', e.target.value)}
                                    disabled={disabled}
                                    className={`p-2 border rounded-md text-left flex-grow text-sm ${disabled ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'}`}
                                />
                            </div>
                        ))}
                        <div className="mt-2 flex items-center gap-4">
                            <button
                                onClick={handleAdd}
                                disabled={disabled}
                                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                                + Add Entry
                            </button>
                            {value?.additions?.length > 1 && (
                                 <button 
                                    onClick={() => handleRemove(value.additions[value.additions.length - 1].id)} 
                                    disabled={disabled}
                                    className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                                    aria-label="Remove last entry"
                                >
                                    - Remove Last
                                </button>
                            )}
                        </div>
                    </div>
                 ) : (
                    firstItem ? (
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
                    )
                 )}
            </td>
        </tr>
    );
};

const DescribedIncomeTableRow: React.FC<{
    label: string;
    path: string;
    value: IncomeSource;
    dispatch: React.Dispatch<Action>;
    helpText?: string;
}> = ({ label, path, value, dispatch, helpText }) => {
    const [description, setDescription] = useState('');
    const [warning, setWarning] = useState('');
    const KNOWN_SALARY_EXEMPTIONS = useMemo(() => [
        { key: 'hra', text: 'HRA', section: '10(13A)' },
        { key: 'lta', text: 'LTA', section: '10(5)' },
        { key: 'gratuity', text: 'Gratuity', section: '10(10)' },
        { key: 'leave', text: 'Leave Encashment', section: '10(10AA)' },
        { key: 'pension', text: 'Pension', section: '10(10A)' },
        { key: 'retrenchment', text: 'Retrenchment', section: '10(10B)' },
        { key: 'vrs', text: 'VRS', section: '10(10C)' },
        { key: 'provident', text: 'Provident Fund', section: '10(11)' },
        { key: 'superannuation', text: 'Superannuation', section: '10(13)' },
        { key: 'allowance', text: 'Special Allowances', section: '10(14)' },
    ], []);

    useEffect(() => {
        if (!description) {
            setWarning('');
            return;
        }
        const lowerDesc = description.toLowerCase();
        const found = KNOWN_SALARY_EXEMPTIONS.find(ex => 
            lowerDesc.includes(ex.text.toLowerCase()) || lowerDesc.includes(ex.section)
        );
        if (found) {
            // FIX: Use `found.section` instead of `ex.section`
            setWarning(`Note: Disallowance for ${found.text} (${found.section}) should be entered in the 'Salary' tab for accurate computation.`);
        } else {
            setWarning('');
        }
    }, [description, KNOWN_SALARY_EXEMPTIONS]);
    
    useEffect(() => {
        if (value && (!value.additions || value.additions.length === 0)) {
            dispatch({ type: 'ADD_ITEM', payload: { path } });
        }
    }, [path, value, dispatch]);

    const handleItemChange = (id: string, val: string) => {
        const parsedValue = parseFormattedValue(val);
        dispatch({ type: 'UPDATE_ITEM', payload: { path, id, field: 'amount', value: parsedValue } });
    };

    const firstItem = value?.additions?.[0];

    return (
        <tr className="border-b last:border-0 align-top">
            <td className="p-2 align-top pt-4">
                <p className="font-medium text-sm text-gray-700">{label}</p>
                {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
            </td>
            <td className="p-2">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        placeholder="Description of exemption (e.g., Sec 10(1))"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="p-2 border rounded-md text-left w-full sm:w-2/3 text-sm"
                    />
                    {firstItem ? (
                        <input 
                            type="text" 
                            placeholder="Amount" 
                            value={formatInputValue(firstItem.amount)}
                            onChange={e => handleItemChange(firstItem.id, e.target.value)}
                            className="p-2 border rounded-md text-left w-full sm:w-1/3 text-sm"
                        />
                    ) : (
                        <input type="text" disabled className="p-2 border rounded-md text-left w-full sm:w-1/3 text-sm bg-gray-200" />
                    )}
                </div>
                {warning && <p className="text-xs text-amber-700 mt-1">{warning}</p>}
            </td>
        </tr>
    );
};


const Card: React.FC<{ title: React.ReactNode; children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md mb-6 ${className}`}>
    <div className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4 no-print">{title}</div>
    {children}
  </div>
);

const ComparisonRow: React.FC<{ label: React.ReactNode; oldVal: number; newVal: number; isNegative?: boolean; isBold?: boolean; isAccent?: boolean }> = ({ label, oldVal, newVal, isNegative, isBold, isAccent }) => {
    const format = (val: number) => {
        if (isNegative) { // For deductions, etc., which are always subtracted
            return `(${formatCurrency(Math.abs(val))})`;
        }
        if (val < 0) { // For income heads that are losses
            return `(${formatCurrency(Math.abs(val))})`;
        }
        return formatCurrency(val);
    };

    return (
        <tr className={`${isBold ? 'font-bold' : ''} ${isAccent ? 'bg-gray-50' : 'border-b'}`}>
            <td className="p-2 text-left">{label}</td>
            <td className="p-2 text-right">{format(oldVal)}</td>
            <td className="p-2 text-right">{format(newVal)}</td>
        </tr>
    )
};


const SummaryView: React.FC<{ data: TaxData; result: ComputationResult }> = ({ data, result }) => {
    const isIndividualLike = ['individual', 'huf', 'aop', 'boi', 'artificial juridical person'].includes(data.taxpayerType);
    const isNewRegimeAvailable = YEARLY_CONFIGS[data.assessmentYear].NEW_REGIME_AVAILABLE;
    const isComparisonAvailable = data.taxpayerType !== 'trust' && isIndividualLike && isNewRegimeAvailable;
    
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

    const renderDetailedIncomeHead = (label: string, oldBreakdown: DetailedIncomeBreakdown, newBreakdown: DetailedIncomeBreakdown) => {
        const netProfitOld = (oldBreakdown as any).netProfit ?? null;
        const netProfitNew = (newBreakdown as any).netProfit ?? null;

        return (<>
            <ComparisonRow label={label} oldVal={oldBreakdown.assessed} newVal={newBreakdown.assessed} isBold />
            {netProfitOld != null && <ComparisonRow label="&nbsp;&nbsp;Net Profit / Base" oldVal={netProfitOld} newVal={netProfitNew} />}
            <ComparisonRow label="&nbsp;&nbsp;Add: Additions / Disallowances" oldVal={oldBreakdown.totalAdditions} newVal={newBreakdown.totalAdditions} />
        </>)
    };


    if (isComparisonAvailable && comparisonResults) {
        const { old: oldResult, new: newResult } = comparisonResults;
        const anyLossesToCarryForwardOld = Object.values(oldResult.lossesCarriedForward).some(loss => typeof loss === 'number' && loss > 0);
        const anyLossesToCarryForwardNew = Object.values(newResult.lossesCarriedForward).some(loss => typeof loss === 'number' && loss > 0);
        
        return (<>
            <div className="flex justify-end mb-4 no-print">
                <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                    Export to PDF
                </button>
            </div>
            <div id="printable-area">
                <Card title="Computation Summary & Comparison" className="card-for-print">
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
                                    <th className="p-2 text-right">Old Regime (₹)</th>
                                    <th className="p-2 text-right">New Regime (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.interestCalc.incomeAsPerEarlierAssessment != null && (
                                    <ComparisonRow label="Income as per Earlier Assessment" oldVal={data.interestCalc.incomeAsPerEarlierAssessment} newVal={data.interestCalc.incomeAsPerEarlierAssessment} isBold isAccent />
                                )}
                                {renderDetailedIncomeHead("Income from Salary", oldResult.breakdown.income.salary, newResult.breakdown.income.salary)}
                                {renderDetailedIncomeHead("Income from House Property", oldResult.breakdown.income.houseProperty, newResult.breakdown.income.houseProperty)}
                                {renderDetailedIncomeHead("Profits and Gains of Business or Profession", oldResult.breakdown.income.pgbp, newResult.breakdown.income.pgbp)}
                                {renderDetailedIncomeHead("Capital Gains", oldResult.breakdown.income.capitalGains, newResult.breakdown.income.capitalGains)}
                                {renderDetailedIncomeHead("Income from Other Sources", oldResult.breakdown.income.otherSources, newResult.breakdown.income.otherSources)}
                                { (oldResult.breakdown.income.international.netIncomeAdded > 0 || newResult.breakdown.income.international.netIncomeAdded > 0) &&
                                    <ComparisonRow label="International Income" oldVal={oldResult.breakdown.income.international.netIncomeAdded} newVal={newResult.breakdown.income.international.netIncomeAdded} isBold />
                                }
                                <ComparisonRow label="Winnings from Lottery, etc." oldVal={oldResult.breakdown.income.winnings.assessed} newVal={newResult.breakdown.income.winnings.assessed} isBold />
                                { (oldResult.breakdown.income.deemed > 0 || newResult.breakdown.income.deemed > 0) &&
                                    <ComparisonRow label="Deemed Income (Sec 68-69D)" oldVal={oldResult.breakdown.income.deemed} newVal={newResult.breakdown.income.deemed} isBold />
                                }
                                <ComparisonRow label="Gross Total Income" oldVal={oldResult.grossTotalIncome} newVal={newResult.grossTotalIncome} isBold isAccent />
                                {(oldResult.breakdown.standardDeduction > 0 || newResult.breakdown.standardDeduction > 0) &&
                                    <ComparisonRow label="Less: Standard Deduction u/s 16" oldVal={oldResult.breakdown.standardDeduction} newVal={newResult.breakdown.standardDeduction} isNegative />
                                }
                                {(oldResult.totalDeductions > 0 || newResult.totalDeductions > 0) &&
                                    <ComparisonRow label="Add: Disallowed Deductions under Chapter VI-A" oldVal={oldResult.totalDeductions} newVal={newResult.totalDeductions} />
                                }
                                <ComparisonRow label="Net Taxable Income" oldVal={oldResult.netTaxableIncome} newVal={newResult.netTaxableIncome} isBold isAccent />
                                
                                <ComparisonRow label="Tax on Total Income (before Surcharge)" oldVal={oldResult.taxLiability} newVal={newResult.taxLiability} />
                                <ComparisonRow label="Add: Surcharge" oldVal={oldResult.surcharge} newVal={newResult.surcharge} />
                                { (oldResult.marginalRelief > 0 || newResult.marginalRelief > 0) &&
                                <ComparisonRow label="Less: Marginal Relief" oldVal={oldResult.marginalRelief} newVal={newResult.marginalRelief} isNegative />
                                }
                                <ComparisonRow label="Less: Rebate u/s 87A" oldVal={oldResult.rebate87A} newVal={newResult.rebate87A} isNegative />
                                <ComparisonRow label="Health & Education Cess" oldVal={oldResult.healthAndEducationCess} newVal={newResult.healthAndEducationCess} />
                                <ComparisonRow label="Total Tax Liability (before FTC)" oldVal={oldResult.totalTaxPayable + oldResult.relief} newVal={newResult.totalTaxPayable + newResult.relief} isBold isAccent/>
                                { (oldResult.relief > 0 || newResult.relief > 0) &&
                                    <ComparisonRow label="Less: Reliefs (FTC)" oldVal={oldResult.relief} newVal={newResult.relief} isNegative />
                                }
                                <ComparisonRow label="Final Tax Liability" oldVal={oldResult.totalTaxPayable} newVal={newResult.totalTaxPayable} isBold isAccent/>
                                <ComparisonRow label="Interest u/s 234A" oldVal={oldResult.interest.u_s_234A} newVal={newResult.interest.u_s_234A} />
                                <ComparisonRow label="Interest u/s 234B" oldVal={oldResult.interest.u_s_234B} newVal={newResult.interest.u_s_234B} />
                                <ComparisonRow label="Interest u/s 234C" oldVal={oldResult.interest.u_s_234C} newVal={newResult.interest.u_s_234C} />
                                <ComparisonRow label="Total Interest" oldVal={oldResult.interest.totalInterest} newVal={newResult.interest.totalInterest} isBold isAccent />
                                <ComparisonRow label="Less: TDS / TCS" oldVal={data.tds ?? 0} newVal={data.tds ?? 0} isNegative />
                                <ComparisonRow label="Less: Advance Tax" oldVal={data.advanceTax ?? 0} newVal={data.advanceTax ?? 0} isNegative />

                                <tr className="font-bold text-lg bg-blue-100">
                                    <td className="p-3 text-left">Net Tax Payable</td>
                                    <td className="p-3 text-right">{formatCurrency(oldResult.netPayable)}</td>
                                    <td className="p-3 text-right">{formatCurrency(newResult.netPayable)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
                
                {oldResult.setOffSummary.length > 0 &&
                <Card title="Loss Set-Off Details (Old Regime)" className="card-for-print">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-200 text-gray-700">
                            <tr>
                                <th className="p-2 text-left">Loss Source</th>
                                <th className="p-2 text-left">Set-off Against</th>
                                <th className="p-2 text-right">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {oldResult.setOffSummary.map((item, index) => (
                                <tr key={index} className="border-b">
                                    <td className="p-2">{item.source}</td>
                                    <td className="p-2">{item.against}</td>
                                    <td className="p-2 text-right">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
                }
                {newResult.setOffSummary.length > 0 &&
                <Card title="Loss Set-Off Details (New Regime)" className="card-for-print">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-200 text-gray-700">
                            <tr>
                                <th className="p-2 text-left">Loss Source</th>
                                <th className="p-2 text-left">Set-off Against</th>
                                <th className="p-2 text-right">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {newResult.setOffSummary.map((item, index) => (
                                <tr key={index} className="border-b">
                                    <td className="p-2">{item.source}</td>
                                    <td className="p-2">{item.against}</td>
                                    <td className="p-2 text-right">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
                }
                {anyLossesToCarryForwardOld && 
                    <Card title="Losses to be Carried Forward (Old Regime)" className="card-for-print">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-200 text-gray-700">
                                <tr>
                                    <th className="p-2 text-left">Loss Type</th>
                                    <th className="p-2 text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(oldResult.lossesCarriedForward).map(([key, value]) => {
                                    if (typeof value !== 'number' || value <= 0) return null;
                                    const label = { houseProperty: 'House Property Loss', businessNonSpeculative: 'Business Loss (Non-Speculative)', businessSpeculative: 'Speculative Business Loss', ltcl: 'Long-Term Capital Loss', stcl: 'Short-Term Capital Loss', raceHorses: 'Loss from Race Horses', unabsorbedDepreciation: 'Unabsorbed Depreciation' }[key] || key;
                                    return ( <tr key={key} className="border-b"><td className="p-2">{label}</td><td className="p-2 text-right">{formatCurrency(value)}</td></tr> );
                                })}
                            </tbody>
                        </table>
                    </Card>
                }
                {anyLossesToCarryForwardNew && 
                    <Card title="Losses to be Carried Forward (New Regime)" className="card-for-print">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-200 text-gray-700">
                                <tr>
                                    <th className="p-2 text-left">Loss Type</th>
                                    <th className="p-2 text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(newResult.lossesCarriedForward).map(([key, value]) => {
                                    if (typeof value !== 'number' || value <= 0) return null;
                                    const label = { houseProperty: 'House Property Loss', businessNonSpeculative: 'Business Loss (Non-Speculative)', businessSpeculative: 'Speculative Business Loss', ltcl: 'Long-Term Capital Loss', stcl: 'Short-Term Capital Loss', raceHorses: 'Loss from Race Horses', unabsorbedDepreciation: 'Unabsorbed Depreciation' }[key] || key;
                                    return ( <tr key={key} className="border-b"><td className="p-2">{label}</td><td className="p-2 text-right">{formatCurrency(value)}</td></tr> );
                                })}
                            </tbody>
                        </table>
                    </Card>
                }
            </div>
        </>);
    }

    // Fallback for non-comparison cases (e.g., companies, firms, older AYs, trusts)
    const renderIncomeHead = (label: string, breakdown: DetailedIncomeBreakdown) => (
        <>
            <tr className="font-bold bg-gray-50 border-b">
                <td className="p-2 text-left">{label}</td>
                <td className="p-2 text-right">{breakdown.assessed < 0 ? `(${formatCurrency(Math.abs(breakdown.assessed))})` : formatCurrency(breakdown.assessed)}</td>
            </tr>
             {(breakdown as any).netProfit != null && 
                <Row label="&nbsp;&nbsp;Net Profit / Base" amount={(breakdown as any).netProfit} />
             }
             {breakdown.totalAdditions !== 0 && 
                <Row label="&nbsp;&nbsp;Add: Additions / Disallowances" amount={breakdown.totalAdditions} />
             }
        </>
    );

    const Row: React.FC<{ label: React.ReactNode; amount: number; isBold?: boolean; isNegative?: boolean; isAccent?: boolean }> = ({ label, amount, isBold = false, isNegative = false, isAccent = false }) => {
        const format = (val: number) => {
            if (isNegative) { // For deductions, etc., which are always subtracted
                return `(${formatCurrency(Math.abs(val))})`;
            }
            if (val < 0) { // For income heads that are losses
                return `(${formatCurrency(Math.abs(val))})`;
            }
            return formatCurrency(val);
        };
        
        return (
            <tr className={`${isBold ? 'font-bold' : ''} ${isAccent ? 'bg-gray-100' : 'border-b'}`}>
                <td className="p-2 text-left">{label}</td>
                <td className="p-2 text-right">{format(amount)}</td>
            </tr>
        )
    };
    
    const anyLossesToCarryForward = Object.values(result.lossesCarriedForward).some(loss => typeof loss === 'number' && loss > 0);
    const trustResult = result.trustComputation;

    return (<>
     <div className="flex justify-end mb-4 no-print">
        <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
            Export to PDF
        </button>
    </div>
    <div id="printable-area">
        <Card title={`Computation Summary ${data.taxpayerType !== 'trust' ? `(${data.taxRegime} Regime)` : ''}`} className="card-for-print">
            <div className="print-only mb-4 border-b pb-4">
                <h2 className="text-xl font-bold mb-2">Computation of Total Income</h2>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><strong>Assessee:</strong> {data.assesseeName}</div>
                    <div><strong>PAN:</strong> {data.pan}</div>
                    <div><strong>Assessment Year:</strong> {data.assessmentYear}</div>
                </div>
            </div>

            {trustResult && data.taxpayerType === 'trust' && (
                 <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-bold text-blue-800 mb-2">Trust Assessment Output</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between p-2 rounded"><strong className="text-gray-600">Type of Trust:</strong> <span className="font-semibold text-gray-900">{trustResult.typeOfTrust}</span></div>
                        <div className="flex justify-between p-2 rounded bg-white"><strong className="text-gray-600">Section Applied:</strong> <span className="font-semibold text-gray-900">{trustResult.sectionApplied}</span></div>
                        <div className="flex justify-between p-2 rounded"><strong className="text-gray-600">Total Income before Disallowances:</strong> <span className="font-mono">{formatCurrency(trustResult.totalIncomeBeforeExemption)}</span></div>
                        <div className="flex justify-between p-2 rounded bg-white"><strong className="text-gray-600">Exempt Income:</strong> <span className="font-mono text-green-700">{formatCurrency(trustResult.exemptIncome)}</span></div>
                        <div className="flex justify-between p-2 rounded"><strong className="text-gray-600">Taxable Income:</strong> <span className="font-mono font-bold text-red-700">{formatCurrency(trustResult.taxableIncome)}</span></div>
                        <div className="flex justify-between p-2 rounded bg-white"><strong className="text-gray-600">Applicable Rate:</strong> <span className="font-semibold text-gray-900">{trustResult.applicableRateDisplay}</span></div>
                    </div>
                    {trustResult.violationFlags.length > 0 && (
                        <div className="mt-4 p-4 border-t border-blue-200">
                            <h4 className="font-bold text-red-600 mb-2">Assessment Notes:</h4>
                            <ul className="list-disc list-inside space-y-1 text-red-700 text-sm">
                                {trustResult.violationFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                            </ul>
                        </div>
                    )}
                 </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-200 text-gray-700">
                    <th className="p-2 text-left">Particulars</th>
                    <th className="p-2 text-right">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    {data.interestCalc.incomeAsPerEarlierAssessment != null && (
                        <Row label="Income as per Earlier Assessment" amount={data.interestCalc.incomeAsPerEarlierAssessment} isBold isAccent />
                    )}
                    {data.taxpayerType !== 'trust' && data.taxpayerType !== 'huf' && renderIncomeHead("Income from Salary", result.breakdown.income.salary)}
                    {renderIncomeHead("Income from House Property", result.breakdown.income.houseProperty)}
                    {renderIncomeHead("Profits and Gains of Business or Profession", result.breakdown.income.pgbp)}
                    {renderIncomeHead("Capital Gains", result.breakdown.income.capitalGains)}
                    {renderIncomeHead("Income from Other Sources", result.breakdown.income.otherSources)}
                    { result.breakdown.income.international.netIncomeAdded > 0 &&
                        <Row label="International Income" amount={result.breakdown.income.international.netIncomeAdded} isBold />
                    }
                    {renderIncomeHead("Winnings from Lottery, etc.", result.breakdown.income.winnings)}
                    {result.breakdown.income.deemed > 0 && <Row label="Deemed Income (Sec 68-69D)" amount={result.breakdown.income.deemed} isBold isAccent />}
                    <Row label="Gross Total Income" amount={result.grossTotalIncome} isBold isAccent />
                    {result.breakdown.standardDeduction > 0 && 
                        <Row label="Less: Standard Deduction u/s 16" amount={result.breakdown.standardDeduction} isNegative />
                    }
                    {result.totalDeductions > 0 &&
                        <Row label="Add: Disallowed Deductions under Chapter VI-A" amount={result.totalDeductions} />
                    }
                    <Row label="Net Taxable Income" amount={result.netTaxableIncome} isBold isAccent />
                    
                    <Row label="Tax on Total Income (before Surcharge)" amount={result.taxLiability} />
                    {result.breakdown.surchargeBreakdown?.onOtherIncomeGross > 0 && (
                        <Row label="Add: Surcharge on Other Income" amount={result.breakdown.surchargeBreakdown.onOtherIncomeGross} />
                    )}
                    {result.breakdown.surchargeBreakdown?.onDeemedIncome > 0 && (
                        <Row label="Add: Surcharge on Deemed Income" amount={result.breakdown.surchargeBreakdown.onDeemedIncome} />
                    )}
                    {result.marginalRelief > 0 && <Row label="Less: Marginal Relief" amount={result.marginalRelief} isNegative />}
                    {(result.breakdown.surchargeBreakdown?.onOtherIncomeGross > 0 || result.breakdown.surchargeBreakdown?.onDeemedIncome > 0) &&
                    <Row label="Tax and Surcharge" amount={result.taxLiability + result.surcharge} isBold />
                    }
                    
                    {result.rebate87A > 0 && <Row label="Less: Rebate u/s 87A" amount={result.rebate87A} isNegative />}
                    <Row label="Health & Education Cess" amount={result.healthAndEducationCess} />
                    <Row label="Total Tax Liability (before FTC)" amount={result.totalTaxPayable + result.relief} isBold isAccent/>
                    {result.relief > 0 && <Row label="Less: Reliefs (FTC)" amount={result.relief} isNegative />}
                    <Row label="Final Tax Liability" amount={result.totalTaxPayable} isBold isAccent/>

                    <Row label={<>Interest u/s 234A <span className="text-gray-500 text-xs">({result.interest.months_234A} mos)</span></>} amount={result.interest.u_s_234A} />
                    <Row label={<>Interest u/s 234B <span className="text-gray-500 text-xs">({result.interest.months_234B} mos)</span></>} amount={result.interest.u_s_234B} />
                    <Row label={<>Interest u/s 234C <span className="text-gray-500 text-xs">{format234CMonths(result.interest.months_234C)}</span></>} amount={result.interest.u_s_234C} />
                    <Row label="Total Interest" amount={result.interest.totalInterest} isBold isAccent />
                    <Row label="Less: TDS / TCS" amount={data.tds ?? 0} isNegative />
                    <Row label="Less: Advance Tax" amount={data.advanceTax ?? 0} isNegative />
                    <tr className="font-bold text-lg bg-blue-100">
                    <td className="p-3 text-left">{result.netPayable >= 0 ? 'Net Tax Payable' : 'Refund Due'}</td>
                    <td className="p-3 text-right">{formatCurrency(Math.abs(result.netPayable))}</td>
                    </tr>
                </tbody>
                </table>
            </div>
        </Card>

        {result.setOffSummary.length > 0 &&
        <Card title="Loss Set-Off Details" className="card-for-print">
            <table className="w-full text-sm">
                <thead className="bg-gray-200 text-gray-700">
                    <tr>
                        <th className="p-2 text-left">Loss Source</th>
                        <th className="p-2 text-left">Set-off Against</th>
                        <th className="p-2 text-right">Amount (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    {result.setOffSummary.map((item, index) => (
                        <tr key={index} className="border-b">
                            <td className="p-2">{item.source}</td>
                            <td className="p-2">{item.against}</td>
                            <td className="p-2 text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
        }
        {anyLossesToCarryForward && 
            <Card title="Losses to be Carried Forward" className="card-for-print">
                <table className="w-full text-sm">
                    <thead className="bg-gray-200 text-gray-700">
                        <tr>
                            <th className="p-2 text-left">Loss Type</th>
                            <th className="p-2 text-right">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(result.lossesCarriedForward).map(([key, value]) => {
                            if (typeof value !== 'number' || value <= 0) return null;
                            const label = {
                                houseProperty: 'House Property Loss',
                                businessNonSpeculative: 'Business Loss (Non-Speculative)',
                                businessSpeculative: 'Speculative Business Loss',
                                ltcl: 'Long-Term Capital Loss',
                                stcl: 'Short-Term Capital Loss',
                                raceHorses: 'Loss from Race Horses',
                                unabsorbedDepreciation: 'Unabsorbed Depreciation',
                            }[key] || key;
                            return (
                                <tr key={key} className="border-b">
                                    <td className="p-2">{label}</td>
                                    <td className="p-2 text-right">{formatCurrency(value)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
        }
    </div>
    </>
  );
};

// --- Hybrid Date Input Component ---
const yyyymmddToDdmmyyyy = (isoDate: string): string => {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
};

interface DateInputProps {
  label: string;
  value: string; // Expects YYYY-MM-DD from parent
  onChange: (value: string) => void; // Sends YYYY-MM-DD to parent
}

const DateInput: React.FC<DateInputProps> = ({ label, value, onChange }) => {
    const displayValue = yyyymmddToDdmmyyyy(value);

    return (
        <div>
            <label className="block text-gray-600 font-medium text-sm mb-1">{label}</label>
            <div className="relative">
                <input type="text" placeholder="dd/mm/yyyy" value={displayValue} readOnly className="w-full p-2 border rounded-md bg-white pr-8" aria-hidden="true" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" aria-label={label} />
            </div>
        </div>
    );
};

const FormField: React.FC<{ label: string; children: React.ReactNode; helpText?: string; className?: string }> = ({ label, children, helpText, className }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
);

const RadioGroup: React.FC<{ label: string, path: string, value: boolean | null, dispatch: React.Dispatch<Action> }> = ({ label, path, value, dispatch }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-4 mt-1">
            <label className="flex items-center"><input type="radio" name={path} checked={value === true} onChange={() => dispatch({ type: 'UPDATE_FIELD', payload: { path, value: true } })} className="h-4 w-4" /> <span className="ml-2">Yes</span></label>
            <label className="flex items-center"><input type="radio" name={path} checked={value === false} onChange={() => dispatch({ type: 'UPDATE_FIELD', payload: { path, value: false } })} className="h-4 w-4" /> <span className="ml-2">No</span></label>
        </div>
    </div>
);

const getIncomeSourceAmount = (source: IncomeSource | undefined): number => {
    if (!source || !source.additions) return 0;
    return source.additions.reduce((acc, item) => acc + (item.amount ?? 0), 0);
};

const CalculatedDisplayRow: React.FC<{ label: string; value: number; helpText?: string; }> = ({ label, value, helpText }) => (
    <tr className="border-b last:border-0 align-top">
        <td className="p-2 align-top pt-4">
            <p className="font-medium text-sm text-gray-500">{label}</p>
            {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
        </td>
        <td className="p-2 pt-4">
            <div className="p-2 bg-gray-100 rounded-md text-left text-sm text-gray-800 font-mono">
                {formatCurrency(value)}
            </div>
        </td>
    </tr>
);

const SummaryCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-blue-800 p-4 border-b border-blue-200">{title}</h3>
    <table className="w-full text-sm">
      <tbody>
        {children}
      </tbody>
    </table>
  </div>
);

const SummaryRow: React.FC<{ label: string; value: number; isNegative?: boolean; isBold?: boolean }> = ({ label, value, isNegative, isBold }) => (
    <tr className={`${isBold ? 'font-semibold text-blue-900' : ''} border-t border-blue-100 last:border-0`}>
        <td className="p-3 text-left text-gray-700">{label}</td>
        <td className="p-3 text-right font-mono">{isNegative ? `(${formatCurrency(Math.abs(value))})` : formatCurrency(value)}</td>
    </tr>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('Assessee Details');
  const [taxData, dispatch] = useReducer(taxDataReducer, initialTaxData);
  const [panError, setPanError] = useState('');

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
      setPanError('');
      setActiveTab('Assessee Details');
    }
  };

  const computationResult = useMemo(() => calculateTax(taxData), [taxData]);

  const totalCapitalGainsAdditions = useMemo(() => {
    const { capitalGains } = taxData;
    const getSourceValue = (source: IncomeSource) => {
        if (!source || !source.additions) return 0;
        return source.additions.reduce((acc, item) => acc + (item.amount ?? 0), 0);
    };
    
    return getSourceValue(capitalGains.adjustment50C) +
           getSourceValue(capitalGains.costOfImprovement) +
           getSourceValue(capitalGains.exemption54) +
           getSourceValue(capitalGains.exemption54B_ltcg) +
           getSourceValue(capitalGains.exemption54B_stcg) +
           getSourceValue(capitalGains.exemption54D) +
           getSourceValue(capitalGains.exemption54EC) +
           getSourceValue(capitalGains.exemption54EE) +
           getSourceValue(capitalGains.exemption54F) +
           getSourceValue(capitalGains.exemption54G) +
           getSourceValue(capitalGains.exemption54GA) +
           getSourceValue(capitalGains.exemption54GB) +
           getSourceValue(capitalGains.adjustment50) +
           getSourceValue(capitalGains.adjustment50CA) +
           getSourceValue(capitalGains.adjustment50D);
}, [taxData.capitalGains]);

  
  const isIndividualLike = ['individual', 'huf', 'aop', 'boi', 'artificial juridical person'].includes(taxData.taxpayerType);
  const salaryIsApplicable = taxData.taxpayerType === 'individual'; // HUF also doesn't have salary income.
  const salaryTabVisible = taxData.taxpayerType === 'individual';


  const dynamicTabs = TABS.filter(tab => {
    if (tab === 'Salary' && !salaryTabVisible) return false;
    return true;
  });

  const renderContent = () => {
    const tableHeader = () => (
        <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
            <tr>
                <th className="p-2 text-left font-semibold w-2/5">Particulars</th>
                <th className="p-2 text-left font-semibold">Entry (Amount)</th>
            </tr>
        </thead>
    );

    switch (activeTab) {
      case 'Assessee Details':
        const { trustData } = taxData;
        const isWomanSlabApplicable = taxData.taxpayerType === 'individual' && parseInt(taxData.assessmentYear.split('-')[0]) <= 2012;

        return (<>
          <Card title="Assessee Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-gray-600 font-medium text-sm mb-1">Name of Assessee</label>
                 <input type="text" value={taxData.assesseeName} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'assesseeName', value: e.target.value}})} className="w-full p-2 border rounded-md" />
               </div>
               <div>
                 <label className="block text-gray-600 font-medium text-sm mb-1">PAN</label>
                 <input type="text" value={taxData.pan} onChange={e => handlePanChange(e.target.value)} className={`w-full p-2 border rounded-md uppercase ${panError ? 'border-red-500' : 'border-gray-300'}`} maxLength={10} />
                 {panError && <p className="text-red-500 text-xs mt-1">{panError}</p>}
               </div>
               
                <div>
                 <label className="block text-gray-600 font-medium text-sm mb-1">Taxpayer Type</label>
                 <select value={taxData.taxpayerType} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'taxpayerType', value: e.target.value}})} className="w-full p-2 border rounded-md capitalize">
                   <option value="individual">Individual</option>
                   <option value="huf">HUF</option>
                   <option value="company">Company</option>
                   <option value="firm">Firm</option>
                   <option value="llp">LLP</option>
                   <option value="aop">Association of Persons (AOP)</option>
                   <option value="boi">Body of Individuals (BOI)</option>
                   <option value="co-operative society">Co-operative Society</option>
                   <option value="local authority">Local Authority</option>
                   <option value="artificial juridical person">Artificial Juridical Person</option>
                   <option value="trust">Trust / Institution</option>
                 </select>
               </div>
                <div>
                    <label className="block text-gray-600 font-medium text-sm mb-1">Residential Status</label>
                    <select value={taxData.residentialStatus} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'residentialStatus', value: e.target.value}})} className="w-full p-2 border rounded-md">
                        <option value="resident_ordinarily_resident">Resident and Ordinarily Resident (ROR)</option>
                        <option value="resident_not_ordinarily_resident">Resident but Not Ordinarily Resident (RNOR)</option>
                        <option value="non_resident">Non-Resident (NR)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Determines the taxability of foreign income.</p>
                </div>
               
               {taxData.taxpayerType === 'company' && (
                <>
                    <div>
                        <label className="block text-gray-600 font-medium text-sm mb-1">Company Type</label>
                        <select value={taxData.companyType} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'companyType', value: e.target.value}})} className="w-full p-2 border rounded-md">
                            <option value="domestic">Domestic</option>
                            <option value="foreign">Foreign</option>
                        </select>
                    </div>
                    <SingleInputField label="Turnover in PY 22-23 (for AY 24-25)" path="previousYearTurnover" value={taxData.previousYearTurnover} dispatch={dispatch} />
                </>
               )}
               {taxData.taxpayerType === 'individual' &&
                <div>
                    <label className="block text-gray-600 font-medium text-sm mb-1">Age Group</label>
                    <select value={taxData.age} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'age', value: e.target.value}})} className="w-full p-2 border rounded-md">
                    <option value="below60">Below 60</option>
                    <option value="60to80">60 to 80 (Senior)</option>
                    <option value="above80">Above 80 (Super Senior)</option>
                    </select>
                </div>
               }
               {isWomanSlabApplicable &&
                <div>
                    <label className="block text-gray-600 font-medium text-sm mb-1">Gender</label>
                    <select value={taxData.gender} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'gender', value: e.target.value as 'male' | 'female'}})} className="w-full p-2 border rounded-md">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Relevant for special tax slab for resident women in AY 2012-13 and earlier.</p>
                </div>
               }
            </div>
            <div className="mt-6 border-t pt-6">
                <SingleInputField label="TDS / TCS" path="tds" value={taxData.tds} dispatch={dispatch} />
                <SingleInputField label="Advance Tax Paid (Total)" path="advanceTax" value={taxData.advanceTax} dispatch={dispatch} />
            </div>
          </Card>
          
           <Card title="Exempt Income u/s 10 Disallowed">
                <table className="w-full table-fixed">
                     <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
                        <tr>
                            <th className="p-2 text-left font-semibold w-2/5">Particulars</th>
                            <th className="p-2 text-left font-semibold w-3/5">Entry (Description & Amount)</th>
                        </tr>
                    </thead>
                    <tbody>
                         <DescribedIncomeTableRow
                            label="Disallowed Other Exempt Income (u/s 10)" 
                            path="otherSources.otherExemptIncomeSec10" 
                            value={taxData.otherSources.otherExemptIncomeSec10} 
                            dispatch={dispatch} 
                            helpText="Enter any Sec 10 exemption not covered elsewhere (e.g., Salary tab)."
                        />
                    </tbody>
                </table>
           </Card>

          {taxData.taxpayerType === 'trust' && (
              <Card title="Trust / Institution Disallowances">
                <table className="w-full table-fixed">
                  {tableHeader()}
                  <tbody>
                    <IncomeTableRow
                      label={<>Receipts Disallowed u/s 12A/12AA/12AB</>}
                      path="trustData.disallowedReceipts12A"
                      value={trustData.disallowedReceipts12A}
                      dispatch={dispatch}
                      helpText="Enter amount of income to be disallowed due to violation of Sec 11, 12, or 13."
                    />
                    <IncomeTableRow
                      label={<>Receipts Disallowed u/s 10(23C)</>}
                      path="trustData.disallowedReceipts10_23C"
                      value={trustData.disallowedReceipts10_23C}
                      dispatch={dispatch}
                      helpText="Enter amount of income to be disallowed due to violation of conditions under Sec 10(23C)."
                    />
                  </tbody>
                </table>
              </Card>
          )}

           <Card title="Prior Assessment Details">
                <SingleInputField 
                    label="Net Income as per 143(1) / Earlier Assessment" 
                    path="interestCalc.incomeAsPerEarlierAssessment" 
                    value={taxData.interestCalc.incomeAsPerEarlierAssessment} 
                    dispatch={dispatch} 
                />
                <SingleInputField 
                    label="Tax as per 143(1) / Earlier Assessment (incl. Surcharge & Cess)" 
                    path="interestCalc.taxOnEarlierAssessment" 
                    value={taxData.interestCalc.taxOnEarlierAssessment} 
                    dispatch={dispatch} 
                />
                <p className="text-xs text-gray-500 mt-2">
                    Enter the total income and tax determined from a prior assessment or intimation. This is required for interest calculation in reassessment cases (u/s 147).
                </p>
           </Card>
        </>
        );
      case 'Salary': {
        const salaryAdditionHelpText = "Enter the amount to be added to the total salary income.";
        const { salary } = taxData;
        return (
          <>
            <Card title="Income from Salary">
                 <div className="mb-6 flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                     <label className="font-medium text-gray-700">Employee Type:</label>
                     <div className="flex items-center gap-4">
                         <label className="flex items-center cursor-pointer">
                             <input
                                 type="radio"
                                 name={`employeeType`}
                                 value="non-government"
                                 checked={salary.employeeType === 'non-government'}
                                 onChange={e => dispatch({ type: 'UPDATE_FIELD', payload: { path: `salary.employeeType`, value: e.target.value } })}
                                 className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                             />
                             <span className="ml-2 text-sm text-gray-800">Non-Government</span>
                         </label>
                         <label className="flex items-center cursor-pointer">
                             <input
                                 type="radio"
                                 name={`employeeType`}
                                 value="government"
                                 checked={salary.employeeType === 'government'}
                                 onChange={e => dispatch({ type: 'UPDATE_FIELD', payload: { path: `salary.employeeType`, value: e.target.value } })}
                                 className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                             />
                             <span className="ml-2 text-sm text-gray-800">Government</span>
                         </label>
                     </div>
                 </div>

                 <div className="mb-6 flex items-center gap-6 p-4 bg-yellow-50 rounded-lg border border-yellow-300">
                    <label className="font-medium text-gray-700 text-sm">Was Standard Deduction u/s 16 already allowed in 143(1)/earlier assessment?</label>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name={`wasStandardDeductionAllowedPreviously`}
                                checked={salary.wasStandardDeductionAllowedPreviously === true}
                                onChange={() => dispatch({ type: 'UPDATE_FIELD', payload: { path: `salary.wasStandardDeductionAllowedPreviously`, value: true } })}
                                className="h-4 w-4"
                            />
                            <span className="ml-2 text-sm text-gray-800">Yes</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name={`wasStandardDeductionAllowedPreviously`}
                                checked={salary.wasStandardDeductionAllowedPreviously === false}
                                onChange={() => dispatch({ type: 'UPDATE_FIELD', payload: { path: `salary.wasStandardDeductionAllowedPreviously`, value: false } })}
                                className="h-4 w-4"
                            />
                            <span className="ml-2 text-sm text-gray-800">No</span>
                        </label>
                    </div>
                </div>

                <h3 className="font-bold text-md text-gray-800 mb-2">Assessable Salary Components (u/s 17)</h3>
                 <table className="w-full table-fixed mb-6">
                     {tableHeader()}
                     <tbody>
                        <IncomeTableRow multiEntry label="Basic Salary / Wages (Sec 17(1))" path={`salary.basicSalary`} value={salary.basicSalary} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow multiEntry label="Allowances (Sec 17(1))" path={`salary.allowances`} value={salary.allowances} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow multiEntry label="Bonus / Commission (Sec 17(1))" path={`salary.bonusAndCommission`} value={salary.bonusAndCommission} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                    </tbody>
                 </table>
                
                <h4 className="font-semibold text-base text-gray-700 mt-4 mb-2">Perquisites (Sec 17(2))</h4>
                <table className="w-full table-fixed mb-6">
                     {tableHeader()}
                     <tbody>
                        <IncomeTableRow multiEntry label="Rent Free Accommodation (Rule 3)" path={`salary.perquisites.rentFreeAccommodation`} value={salary.perquisites.rentFreeAccommodation} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow multiEntry label="Motor Car (Rule 3(2))" path={`salary.perquisites.motorCar`} value={salary.perquisites.motorCar} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow multiEntry label="Other Perquisites" path={`salary.perquisites.otherPerquisites`} value={salary.perquisites.otherPerquisites} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                    </tbody>
                </table>

                <h4 className="font-semibold text-base text-gray-700 mt-4 mb-2">Profits in Lieu of Salary (Sec 17(3))</h4>
                <table className="w-full table-fixed mb-6">
                     {tableHeader()}
                     <tbody>
                        <IncomeTableRow multiEntry label="Compensation on Termination" path={`salary.profitsInLieu.terminationCompensation`} value={salary.profitsInLieu.terminationCompensation} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow multiEntry label="Commuted Pension" path={`salary.profitsInLieu.commutedPension`} value={salary.profitsInLieu.commutedPension} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow multiEntry label="Retrenchment Compensation" path={`salary.profitsInLieu.retrenchmentCompensation`} value={salary.profitsInLieu.retrenchmentCompensation} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow multiEntry label="VRS Compensation" path={`salary.profitsInLieu.vrsCompensation`} value={salary.profitsInLieu.vrsCompensation} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow multiEntry label="Other Profits in Lieu" path={`salary.profitsInLieu.otherProfitsInLieu`} value={salary.profitsInLieu.otherProfitsInLieu} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                    </tbody>
                </table>
            </Card>
            <Card title="Disallowance of Exemptions u/s 10">
                <table className="w-full table-fixed mb-6">
                    {tableHeader()}
                    <tbody>
                        <IncomeTableRow label="HRA (Sec 10(13A))" path={`salary.exemptions.hra`} value={salary.exemptions.hra} dispatch={dispatch} helpText="Disallowance of HRA exemption claimed." />
                        <IncomeTableRow label="LTA (Sec 10(5))" path={`salary.exemptions.lta`} value={salary.exemptions.lta} dispatch={dispatch} helpText="Disallowance of LTA exemption claimed." />
                        <IncomeTableRow label="Gratuity (Sec 10(10))" path={`salary.exemptions.gratuity`} value={salary.exemptions.gratuity} dispatch={dispatch} />
                        <IncomeTableRow label="Leave Encashment (Sec 10(10AA))" path={`salary.exemptions.leaveEncashment`} value={salary.exemptions.leaveEncashment} dispatch={dispatch} />
                        <IncomeTableRow label="Commuted Pension (Sec 10(10A))" path={`salary.exemptions.commutedPension`} value={salary.exemptions.commutedPension} dispatch={dispatch} />
                        <IncomeTableRow label="Retrenchment Compensation (Sec 10(10B))" path={`salary.exemptions.retrenchmentCompensation`} value={salary.exemptions.retrenchmentCompensation} dispatch={dispatch} />
                        <IncomeTableRow label="VRS Compensation (Sec 10(10C))" path={`salary.exemptions.vrsCompensation`} value={salary.exemptions.vrsCompensation} dispatch={dispatch} />
                        <IncomeTableRow label="PF / Superannuation (Sec 10(11-13))" path={`salary.exemptions.providentFund`} value={salary.exemptions.providentFund} dispatch={dispatch} />
                        <IncomeTableRow label="Special Allowances (Sec 10(14))" path={`salary.exemptions.specialAllowances`} value={salary.exemptions.specialAllowances} dispatch={dispatch} />
                        <IncomeTableRow multiEntry label="Other Disallowed Exemptions" path={`salary.exemptions.otherExemptions`} value={salary.exemptions.otherExemptions} dispatch={dispatch} />
                    </tbody>
                </table>
            </Card>
            <Card title="Disallowance of Deductions u/s 16">
                <table className="w-full table-fixed mb-6">
                    {tableHeader()}
                    <tbody>
                        <IncomeTableRow label="Professional Tax (Sec 16(iii))" path={`salary.deductions.professionalTax`} value={salary.deductions.professionalTax} dispatch={dispatch} helpText="Disallowance of deduction for professional tax." />
                        <IncomeTableRow label="Entertainment Allowance (Sec 16(ii))" path={`salary.deductions.entertainmentAllowance`} value={salary.deductions.entertainmentAllowance} dispatch={dispatch} helpText="Disallowance of deduction for entertainment allowance (Govt. employees)." />
                    </tbody>
                </table>
            </Card>
            <SummaryCard title="Salary Computation Summary">
                <SummaryRow label="Gross Assessable Salary" value={computationResult.breakdown.income.salary.totalAdditions} />
                <SummaryRow label="Net Income from Salary (after set-off)" value={computationResult.breakdown.income.salary.assessed} isBold />
            </SummaryCard>
          </>
        );
      }
      case 'House Property': {
        const ayNum = parseInt(taxData.assessmentYear.split('-')[0], 10);
        const maxSOPs = (ayNum >= 2020) ? 2 : 1;
        let sopCount = 0;

        return (<>
          {taxData.houseProperty.map((hp, index) => {
            let isExcessSop = false;
            if (hp.isSelfOccupied) {
                sopCount++;
                if (sopCount > maxSOPs) {
                    isExcessSop = true;
                }
            }

            return (
            <Card 
                key={hp.id} 
                title={
                    <div className="flex justify-between items-center">
                        <span>House Property {index + 1}</span>
                    </div>
                }
            >
                 {isExcessSop && (
                    <div className="p-3 mb-4 text-sm text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-md" role="alert">
                        Note: As more than {maxSOPs} {maxSOPs > 1 ? 'properties are' : 'property is'} marked as self-occupied, this property will be treated as 'Deemed to be Let Out' for calculation purposes. Its NAV will be computed based on rental value.
                    </div>
                )}
                <div className="mb-4">
                    <label className="flex items-center">
                        <input 
                            type="checkbox" 
                            checked={hp.isSelfOccupied}
                            onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: `houseProperty.${index}.isSelfOccupied`, value: e.target.checked}})}
                            className="h-4 w-4 rounded"
                        />
                        <span className="ml-2 text-sm font-medium">This property is Self-Occupied (SOP)</span>
                    </label>
                </div>

                <table className="w-full table-fixed">
                    {tableHeader()}
                    <tbody>
                        <IncomeTableRow label="Gross Rent Received / Receivable" path={`houseProperty.${index}.grossRent`} value={hp.grossRent} dispatch={dispatch} disabled={hp.isSelfOccupied && !isExcessSop} />
                        <IncomeTableRow label="Municipal Taxes Paid" path={`houseProperty.${index}.municipalTaxes`} value={hp.municipalTaxes} dispatch={dispatch} disabled={hp.isSelfOccupied && !isExcessSop} />
                        <CalculatedDisplayRow 
                            label="Net Annual Value (NAV)" 
                            value={(hp.isSelfOccupied && !isExcessSop) ? 0 : Math.max(0, getIncomeSourceAmount(hp.grossRent) - getIncomeSourceAmount(hp.municipalTaxes))}
                        />
                         <CalculatedDisplayRow 
                            label="Less: Standard Deduction u/s 24(a) (30% of NAV)" 
                            value={(hp.isSelfOccupied && !isExcessSop) ? 0 : Math.max(0, getIncomeSourceAmount(hp.grossRent) - getIncomeSourceAmount(hp.municipalTaxes)) * 0.3}
                        />
                        <IncomeTableRow label="Interest on Borrowed Capital u/s 24(b)" path={`houseProperty.${index}.interestOnLoan`} value={hp.interestOnLoan} dispatch={dispatch} />
                    </tbody>
                </table>
            </Card>
          )})}
          <div className="flex justify-start no-print gap-4">
            <button 
                onClick={() => dispatch({ type: 'ADD_HOUSE_PROPERTY' })} 
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
                + Add Another Property
            </button>
            {taxData.houseProperty.length > 1 &&
                <button 
                    onClick={() => dispatch({ type: 'REMOVE_HOUSE_PROPERTY', payload: { id: taxData.houseProperty[taxData.houseProperty.length - 1].id } })} 
                    className="text-sm bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 no-print"
                >
                    - Remove Last Property
                </button>
            }
          </div>
          <SummaryCard title="House Property Computation Summary">
            <SummaryRow label="Total Net Annual Value (NAV) of all LOPs" value={computationResult.breakdown.nav} />
            <SummaryRow label="Total Standard Deduction u/s 24(a)" value={computationResult.breakdown.standardDeduction24a} isNegative />
            <SummaryRow label="Net Income/Loss from House Property (after set-off)" value={computationResult.breakdown.income.houseProperty.assessed} isBold />
          </SummaryCard>
        </>
        );
      }
      case 'PGBP': {
        const { pgbp } = taxData;
        const isPresumptive = pgbp.presumptiveScheme !== PresumptiveScheme.None;
        return (<>
            <Card title="Business Details">
                 <RadioGroup label="Is the business/profession controlled from India?" path="pgbp.isControlledFromIndia" value={pgbp.isControlledFromIndia} dispatch={dispatch} />
            </Card>
            <Card title="Profits and Gains of Business or Profession (PGBP)">
                 <div className="mb-6">
                    <label className="block text-gray-600 font-medium text-sm mb-1">Taxation Scheme</label>
                    <select value={pgbp.presumptiveScheme} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'pgbp.presumptiveScheme', value: e.target.value}})} className="w-full p-2 border rounded-md">
                        <option value={PresumptiveScheme.None}>Regular / Normal Provisions</option>
                        <option value={PresumptiveScheme.AD}>Presumptive u/s 44AD</option>
                        <option value={PresumptiveScheme.ADA}>Presumptive u/s 44ADA</option>
                        <option value={PresumptiveScheme.AE}>Presumptive u/s 44AE</option>
                        <option value={PresumptiveScheme.B}>Presumptive u/s 44B (Shipping)</option>
                        <option value={PresumptiveScheme.BB}>Presumptive u/s 44BB (Mineral Oils)</option>
                        <option value={PresumptiveScheme.BBA}>Presumptive u/s 44BBA (Aircraft)</option>
                        <option value={PresumptiveScheme.BBB}>Presumptive u/s 44BBB (Civil Construction)</option>
                    </select>
                </div>
                
                {pgbp.presumptiveScheme === PresumptiveScheme.None && (
                    <table className="w-full table-fixed">
                        {tableHeader()}
                        <tbody>
                            <IncomeTableRow label="Net Profit as per P&L Account" path="pgbp.netProfit" value={pgbp.netProfit} dispatch={dispatch} helpText="Enter the base profit to which additions will be made."/>
                        </tbody>
                    </table>
                )}

                 {pgbp.presumptiveScheme === PresumptiveScheme.AD && (
                    <table className="w-full table-fixed">
                        {tableHeader()}
                        <tbody>
                            <IncomeTableRow label="Turnover (Digital/Banking)" path="pgbp.turnover44AD_digital" value={pgbp.turnover44AD_digital} dispatch={dispatch} helpText="Taxable at 6%"/>
                            <IncomeTableRow label="Turnover (Other)" path="pgbp.turnover44AD_other" value={pgbp.turnover44AD_other} dispatch={dispatch} helpText="Taxable at 8%"/>
                        </tbody>
                    </table>
                )}

                 {pgbp.presumptiveScheme === PresumptiveScheme.ADA && (
                    <table className="w-full table-fixed">
                        {tableHeader()}
                        <tbody>
                            <IncomeTableRow label="Gross Receipts" path="pgbp.grossReceipts44ADA" value={pgbp.grossReceipts44ADA} dispatch={dispatch} helpText="Taxable at 50%"/>
                        </tbody>
                    </table>
                )}
                 {pgbp.presumptiveScheme === PresumptiveScheme.AE && (
                   <div className="border rounded-lg p-4">
                     <h3 className="font-semibold mb-2">Vehicles u/s 44AE</h3>
                     {pgbp.vehicles44AE.map(v => (
                        <div key={v.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4 p-3 bg-gray-50 rounded">
                            <FormField label="Vehicle Type">
                                <select value={v.type} onChange={e => dispatch({type: 'UPDATE_VEHICLE', payload: {id: v.id, field: 'type', value: e.target.value}})} className="p-2 border rounded-md w-full">
                                    <option value="heavy">Heavy Goods Vehicle</option>
                                    <option value="other">Other Vehicle</option>
                                </select>
                            </FormField>
                             <FormField label="Tonnage (for Heavy)">
                                 <input type="number" value={v.tonnage ?? ''} onChange={e => dispatch({type: 'UPDATE_VEHICLE', payload: {id: v.id, field: 'tonnage', value: parseInt(e.target.value) || null }})} disabled={v.type !== 'heavy'} className="p-2 border rounded-md w-full disabled:bg-gray-200" />
                            </FormField>
                             <FormField label="No. of Months">
                                 <input type="number" min="0" max="12" value={v.months ?? ''} onChange={e => dispatch({type: 'UPDATE_VEHICLE', payload: {id: v.id, field: 'months', value: parseInt(e.target.value) || null }})} className="p-2 border rounded-md w-full" />
                            </FormField>
                            <div className="font-mono bg-white p-2 rounded-md text-sm text-center">
                               {formatCurrency(v.type === 'heavy' ? (v.tonnage ?? 0) * (v.months ?? 0) * 1000 : (v.months ?? 0) * 7500)}
                            </div>
                        </div>
                     ))}
                     <div className="flex items-center gap-4">
                        <button onClick={() => dispatch({type: 'ADD_VEHICLE'})} className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm">+ Add Vehicle</button>
                        {pgbp.vehicles44AE.length > 0 &&
                            <button onClick={() => dispatch({type: 'REMOVE_VEHICLE', payload: {id: pgbp.vehicles44AE[pgbp.vehicles44AE.length - 1].id}})} className="bg-red-500 text-white px-3 py-2 rounded-md text-sm">- Remove Last Vehicle</button>
                        }
                    </div>
                   </div>
                )}
                
                 {[PresumptiveScheme.B, PresumptiveScheme.BB, PresumptiveScheme.BBA, PresumptiveScheme.BBB].includes(pgbp.presumptiveScheme) && (
                    <table className="w-full table-fixed">
                        {tableHeader()}
                        <tbody>
                            <IncomeTableRow label="Aggregate Receipts" path={`pgbp.aggregateReceipts${pgbp.presumptiveScheme.slice(2)}`} value={(pgbp as any)[`aggregateReceipts${pgbp.presumptiveScheme.slice(2)}`]} dispatch={dispatch} />
                        </tbody>
                    </table>
                 )}

                <table className="w-full table-fixed mt-6">
                   {tableHeader()}
                   <tbody>
                      <IncomeTableRow label="Speculative Income" path="pgbp.speculativeIncome" value={pgbp.speculativeIncome} dispatch={dispatch} helpText="Enter net positive income from speculative transactions." />
                   </tbody>
                </table>
            </Card>
            <Card title="PGBP Additions / Disallowances">
                 <h4 className="font-semibold text-base text-gray-700 mt-4 mb-2">Income Additions</h4>
                <table className="w-full table-fixed mb-6">
                    {tableHeader()}
                    <tbody>
                        <IncomeTableRow multiEntry label="Unreported Sales / Receipts" path="pgbp.additions.unreportedSales" value={pgbp.additions.unreportedSales} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow multiEntry label="Unaccounted Business Income" path="pgbp.additions.unaccountedBusinessIncome" value={pgbp.additions.unaccountedBusinessIncome} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow multiEntry label="Bogus Purchases" path="pgbp.additions.bogusPurchases" value={pgbp.additions.bogusPurchases} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow multiEntry label="Unrecorded Credits" path="pgbp.additions.unrecordedCredits" value={pgbp.additions.unrecordedCredits} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="GP/NP Ratio Difference" path="pgbp.additions.gpNpRatioDifference" value={pgbp.additions.gpNpRatioDifference} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="Stock Suppression / Undervaluation" path="pgbp.additions.stockSuppression" value={pgbp.additions.stockSuppression} dispatch={dispatch} disabled={isPresumptive} />
                    </tbody>
                </table>
                 <h4 className="font-semibold text-base text-gray-700 mt-4 mb-2">Expense Disallowances</h4>
                 <table className="w-full table-fixed">
                    {tableHeader()}
                    <tbody>
                        <IncomeTableRow label="Employee Contribution to PF/ESI (Sec 36)" path="pgbp.additions.disallowance36_employeeContrib" value={pgbp.additions.disallowance36_employeeContrib} dispatch={dispatch} disabled={isPresumptive} helpText="If deposited after due date."/>
                        <IncomeTableRow label="Provision for Bad/Doubtful Debts (Sec 36(1)(vii))" path="pgbp.additions.disallowance36_1_vii_provisions" value={pgbp.additions.disallowance36_1_vii_provisions} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="Interest on Borrowed Capital (Sec 36(1)(iii))" path="pgbp.additions.disallowance36_1_iii_interest" value={pgbp.additions.disallowance36_1_iii_interest} dispatch={dispatch} disabled={isPresumptive} helpText="E.g., for acquisition of capital asset not yet put to use."/>
                        <IncomeTableRow label="Non-Business Expenditure (Sec 37(1))" path="pgbp.additions.disallowance37_1_nonBusiness" value={pgbp.additions.disallowance37_1_nonBusiness} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="Personal Expenditure (Sec 37(1))" path="pgbp.additions.disallowance37_1_personal" value={pgbp.additions.disallowance37_1_personal} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="Capital Expenditure (Sec 37(1))" path="pgbp.additions.disallowance37_1_capital" value={pgbp.additions.disallowance37_1_capital} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="TDS Non-Compliance (Sec 40(a))" path="pgbp.additions.disallowance40a_tds" value={pgbp.additions.disallowance40a_tds} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="Excess Partner Payments (Sec 40(b))" path="pgbp.additions.disallowance40b_partnerPayments" value={pgbp.additions.disallowance40b_partnerPayments} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="Related Party Payments (Sec 40A(2))" path="pgbp.additions.disallowance40A2_relatedParty" value={pgbp.additions.disallowance40A2_relatedParty} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="Cash Payments > 10,000 (Sec 40A(3))" path="pgbp.additions.disallowance40A3_cashPayment" value={pgbp.additions.disallowance40A3_cashPayment} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="Unapproved Gratuity Fund (Sec 40A(7))" path="pgbp.additions.disallowance40A7_gratuity" value={pgbp.additions.disallowance40A7_gratuity} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="Contributions to Unapproved Funds (Sec 40A(9))" path="pgbp.additions.disallowance40A9_unapprovedFunds" value={pgbp.additions.disallowance40A9_unapprovedFunds} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="Delayed Statutory Dues (Sec 43B)" path="pgbp.additions.disallowance43B_statutoryDues" value={pgbp.additions.disallowance43B_statutoryDues} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="Expense for Exempt Income (Sec 14A)" path="pgbp.additions.disallowance14A_exemptIncome" value={pgbp.additions.disallowance14A_exemptIncome} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="Incorrect Depreciation Claim" path="pgbp.additions.incorrectDepreciation" value={pgbp.additions.incorrectDepreciation} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow label="Unexplained Expenditure (Sec 69C)" path="pgbp.additions.unexplainedExpenditure" value={pgbp.additions.unexplainedExpenditure} dispatch={dispatch} disabled={isPresumptive} />
                        <IncomeTableRow multiEntry label="Other Disallowances" path="pgbp.additions.otherDisallowances" value={pgbp.additions.otherDisallowances} dispatch={dispatch} disabled={isPresumptive} />
                    </tbody>
                </table>
            </Card>
            <SummaryCard title="PGBP Computation Summary">
                <SummaryRow label="Net Profit / Presumptive Income" value={computationResult.breakdown.income.pgbp.netProfit} />
                <SummaryRow label="Total Additions / Disallowances" value={computationResult.breakdown.income.pgbp.totalAdditions} />
                <SummaryRow label="Net PGBP Income (after set-off)" value={computationResult.breakdown.income.pgbp.assessed} isBold />
            </SummaryCard>
        </>
        );
      }
      case 'Capital Gains': {
          const { capitalGains } = taxData;
          return (<>
            <Card title="Capital Gains Income">
                <table className="w-full table-fixed">
                    {tableHeader()}
                    <tbody>
                        <IncomeTableRow label="Short Term Capital Gains (STCG) u/s 111A" path="capitalGains.stcg111A" value={capitalGains.stcg111A} dispatch={dispatch} />
                        <IncomeTableRow label="Short Term Capital Gains (STCG) - Other" path="capitalGains.stcgOther" value={capitalGains.stcgOther} dispatch={dispatch} />
                        <IncomeTableRow label="Long Term Capital Gains (LTCG) u/s 112A" path="capitalGains.ltcg112A" value={capitalGains.ltcg112A} dispatch={dispatch} />
                        <IncomeTableRow label="Long Term Capital Gains (LTCG) - Other" path="capitalGains.ltcgOther" value={capitalGains.ltcgOther} dispatch={dispatch} />
                    </tbody>
                </table>
            </Card>
            <Card title="Capital Gains Additions / Disallowances">
                 <table className="w-full table-fixed">
                    {tableHeader()}
                    <tbody>
                        <IncomeTableRow label="Adjustment u/s 50 (Depreciable Assets)" path="capitalGains.adjustment50" value={capitalGains.adjustment50} dispatch={dispatch}/>
                        <IncomeTableRow label="Adjustment u/s 43CA (Land/Building as Stock)" path="capitalGains.adjustment43CA" value={capitalGains.adjustment43CA} dispatch={dispatch}/>
                        <IncomeTableRow label="Adjustment u/s 50C (Land/Building)" path="capitalGains.adjustment50C" value={capitalGains.adjustment50C} dispatch={dispatch} helpText="Difference between Stamp Duty Value and Sale Consideration."/>
                        <IncomeTableRow label="Adjustment u/s 50CA (Unquoted Shares)" path="capitalGains.adjustment50CA" value={capitalGains.adjustment50CA} dispatch={dispatch} helpText="Difference between FMV and Sale Consideration."/>
                        <IncomeTableRow label="Adjustment u/s 50D (FMV as Sale Consideration)" path="capitalGains.adjustment50D" value={capitalGains.adjustment50D} dispatch={dispatch}/>
                        <IncomeTableRow label="Disallowance of Cost of Improvement" path="capitalGains.costOfImprovement" value={capitalGains.costOfImprovement} dispatch={dispatch}/>
                        <IncomeTableRow multiEntry label="Disallowance of Exemption u/s 54" path="capitalGains.exemption54" value={capitalGains.exemption54} dispatch={dispatch}/>
                        <IncomeTableRow label="Disallowance u/s 54B (LTCG)" path="capitalGains.exemption54B_ltcg" value={capitalGains.exemption54B_ltcg} dispatch={dispatch}/>
                        <IncomeTableRow label="Disallowance u/s 54B (STCG)" path="capitalGains.exemption54B_stcg" value={capitalGains.exemption54B_stcg} dispatch={dispatch}/>
                        <IncomeTableRow label="Disallowance u/s 54D" path="capitalGains.exemption54D" value={capitalGains.exemption54D} dispatch={dispatch}/>
                        <IncomeTableRow label="Disallowance u/s 54EC" path="capitalGains.exemption54EC" value={capitalGains.exemption54EC} dispatch={dispatch}/>
                        <IncomeTableRow label="Disallowance u/s 54EE" path="capitalGains.exemption54EE" value={capitalGains.exemption54EE} dispatch={dispatch}/>
                        <IncomeTableRow label="Disallowance u/s 54F" path="capitalGains.exemption54F" value={capitalGains.exemption54F} dispatch={dispatch}/>
                        <IncomeTableRow label="Disallowance u/s 54G/GA/GB" path="capitalGains.exemption54G" value={capitalGains.exemption54G} dispatch={dispatch}/>
                    </tbody>
                     <tfoot>
                        <CalculatedDisplayRow label="Total Additions to Capital Gains" value={totalCapitalGainsAdditions} />
                     </tfoot>
                </table>
            </Card>
             <SummaryCard title="Capital Gains Computation Summary">
                <SummaryRow label="STCG u/s 111A" value={computationResult.breakdown.income.capitalGainsBreakdown.stcg111A} />
                <SummaryRow label="STCG (Other)" value={computationResult.breakdown.income.capitalGainsBreakdown.stcgOther} />
                <SummaryRow label="LTCG u/s 112A" value={computationResult.breakdown.income.capitalGainsBreakdown.ltcg112A} />
                <SummaryRow label="LTCG (Other)" value={computationResult.breakdown.income.capitalGainsBreakdown.ltcgOther} />
                <SummaryRow label="Total Additions / Disallowances" value={computationResult.breakdown.income.capitalGains.totalAdditions} />
                <SummaryRow label="Net Capital Gains (after set-off)" value={computationResult.breakdown.income.capitalGains.assessed} isBold />
            </SummaryCard>
          </>);
      }
      case 'Other Sources': {
        const { otherSources, deemedIncome } = taxData;
        const totalOtherSources = computationResult.breakdown.income.otherSources.assessed + computationResult.breakdown.income.winnings.assessed + computationResult.breakdown.income.deemed;
        return (
          <>
            <Card title="Income from Other Sources">
                <table className="w-full table-fixed">
                    {tableHeader()}
                    <tbody>
                        <IncomeTableRow multiEntry label="Other Incomes" path="otherSources.otherIncomes" value={otherSources.otherIncomes} dispatch={dispatch} helpText="e.g., Interest, Dividends (post AY 20-21), etc." />
                        <IncomeTableRow label="Winnings from Lottery, Games, etc." path="otherSources.winnings" value={otherSources.winnings} dispatch={dispatch} />
                        <IncomeTableRow label="Agricultural Income (for rate purposes)" path="otherSources.exemptIncome" value={otherSources.exemptIncome} dispatch={dispatch} />
                        <IncomeTableRow label="Deemed Dividend u/s 2(22)(e)" path="otherSources.deemedDividend2_22_e" value={otherSources.deemedDividend2_22_e} dispatch={dispatch} />
                        <IncomeTableRow label="Gifts taxable u/s 56(2)(x)" path="otherSources.gifts56_2_x" value={otherSources.gifts56_2_x} dispatch={dispatch} />
                        <IncomeTableRow label="Family Pension" path="otherSources.familyPension" value={otherSources.familyPension} dispatch={dispatch} />
                        <IncomeTableRow label="Interest on Enhanced Compensation" path="otherSources.interestOnEnhancedCompensation" value={otherSources.interestOnEnhancedCompensation} dispatch={dispatch} />
                        <IncomeTableRow label="Income from Race Horses" path="otherSources.raceHorseIncome" value={otherSources.raceHorseIncome} dispatch={dispatch} />
                        <IncomeTableRow label="Disallowance u/s 14A" path="otherSources.disallowance14A" value={otherSources.disallowance14A} dispatch={dispatch} />
                    </tbody>
                </table>
            </Card>
            <Card title="Deemed Income (u/s 68, 69, etc.)">
                <table className="w-full table-fixed">
                     {tableHeader()}
                    <tbody>
                        <IncomeTableRow multiEntry label="Cash Credits (Sec 68)" path="deemedIncome.sec68_cashCredits" value={deemedIncome.sec68_cashCredits} dispatch={dispatch} />
                        <IncomeTableRow multiEntry label="Unexplained Investments (Sec 69)" path="deemedIncome.sec69_unexplainedInvestments" value={deemedIncome.sec69_unexplainedInvestments} dispatch={dispatch} />
                        <IncomeTableRow multiEntry label="Unexplained Money (Sec 69A)" path="deemedIncome.sec69A_unexplainedMoney" value={deemedIncome.sec69A_unexplainedMoney} dispatch={dispatch} />
                        <IncomeTableRow multiEntry label="Undisclosed Investments (Sec 69B)" path="deemedIncome.sec69B_investmentsNotDisclosed" value={deemedIncome.sec69B_investmentsNotDisclosed} dispatch={dispatch} />
                        <IncomeTableRow multiEntry label="Unexplained Expenditure (Sec 69C)" path="deemedIncome.sec69C_unexplainedExpenditure" value={deemedIncome.sec69C_unexplainedExpenditure} dispatch={dispatch} />
                        <IncomeTableRow multiEntry label="Hundi Borrowings (Sec 69D)" path="deemedIncome.sec69D_hundiBorrowing" value={deemedIncome.sec69D_hundiBorrowing} dispatch={dispatch} />
                    </tbody>
                </table>
            </Card>
            <SummaryCard title="Other Sources Computation Summary">
                <SummaryRow label="Income from Other Sources" value={computationResult.breakdown.income.otherSources.assessed} />
                <SummaryRow label="Winnings from Lottery, etc." value={computationResult.breakdown.income.winnings.assessed} />
                <SummaryRow label="Deemed Income" value={computationResult.breakdown.income.deemed} />
                <SummaryRow label="Total Income from Other Sources" value={totalOtherSources} isBold />
            </SummaryCard>
          </>
        )
      }
      case 'International Income':
        return (<>
        <Card title="International Income & Foreign Tax Credit">
          {taxData.internationalIncome.map((item, index) => (
             <div key={item.id} className="border p-4 rounded-lg mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Entry {index + 1}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   <FormField label="Country">
                      <input type="text" value={item.country} onChange={e => dispatch({type: 'UPDATE_INTERNATIONAL_INCOME_ITEM', payload: {id: item.id, path: 'country', value: e.target.value}})} className="p-2 border rounded w-full"/>
                   </FormField>
                   <FormField label="Nature of Income">
                      <select value={item.nature} onChange={e => dispatch({type: 'UPDATE_INTERNATIONAL_INCOME_ITEM', payload: {id: item.id, path: 'nature', value: e.target.value}})} className="p-2 border rounded w-full">
                        {Object.values(InternationalIncomeNature).map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                   </FormField>
                   <FormField label="Amount in Foreign Country (in INR)">
                     <input type="text" value={formatInputValue(item.amountInINR)} onChange={e => dispatch({type: 'UPDATE_INTERNATIONAL_INCOME_ITEM', payload: {id: item.id, path: 'amountInINR', value: parseFormattedValue(e.target.value)}})} className="p-2 border rounded w-full"/>
                   </FormField>
                   <FormField label="Tax Paid in Foreign Country (in INR)">
                     <input type="text" value={formatInputValue(item.taxPaidInINR)} onChange={e => dispatch({type: 'UPDATE_INTERNATIONAL_INCOME_ITEM', payload: {id: item.id, path: 'taxPaidInINR', value: parseFormattedValue(e.target.value)}})} className="p-2 border rounded w-full"/>
                   </FormField>
                   <FormField label="Special Section for Tax Rate">
                     <select value={item.specialSection} onChange={e => dispatch({type: 'UPDATE_INTERNATIONAL_INCOME_ITEM', payload: {id: item.id, path: 'specialSection', value: e.target.value}})} className="p-2 border rounded w-full">
                        <option value="None">None (Taxed at normal rates)</option>
                        <option value="115A">115A</option><option value="115AB">115AB</option><option value="115AC">115AC</option><option value="115AD">115AD</option><option value="115AE">115AE</option><option value="115ACA">115ACA</option><option value="115BBA">115BBA</option>
                     </select>
                   </FormField>
                   <FormField label="Is DTAA Applicable?">
                       <RadioGroup path={`internationalIncome.${index}.dtaaApplicable`} value={item.dtaaApplicable} dispatch={dispatch} label=""/>
                   </FormField>
                   {item.dtaaApplicable && <>
                     <FormField label="Applicable DTAA Article">
                        <input type="text" value={item.applicableDtaaArticle} onChange={e => dispatch({type: 'UPDATE_INTERNATIONAL_INCOME_ITEM', payload: {id: item.id, path: 'applicableDtaaArticle', value: e.target.value}})} className="p-2 border rounded w-full"/>
                     </FormField>
                     <FormField label="Tax Rate as per DTAA (%)">
                        <input type="number" value={item.taxRateAsPerDtaa != null ? item.taxRateAsPerDtaa * 100 : ''} onChange={e => dispatch({type: 'UPDATE_INTERNATIONAL_INCOME_ITEM', payload: {id: item.id, path: 'taxRateAsPerDtaa', value: e.target.value ? parseFloat(e.target.value)/100 : null }})} className="p-2 border rounded w-full"/>
                     </FormField>
                   </>}
                   <FormField label="Form 67 Filed for FTC?">
                       <RadioGroup path={`internationalIncome.${index}.form67Filed`} value={item.form67Filed} dispatch={dispatch} label=""/>
                   </FormField>
                   <div className="col-span-full border-t mt-4 pt-4">
                      <h4 className="font-semibold mb-2">Transfer Pricing</h4>
                       <FormField label="Is the transaction with an Associated Enterprise?">
                           <RadioGroup path={`internationalIncome.${index}.transferPricing.isAssociatedEnterprise`} value={item.transferPricing.isAssociatedEnterprise} dispatch={dispatch} label=""/>
                       </FormField>
                       {item.transferPricing.isAssociatedEnterprise && <>
                         <FormField label="Arm's Length Price (ALP)">
                           <input type="text" value={formatInputValue(item.transferPricing.armsLengthPrice)} onChange={e => dispatch({type: 'UPDATE_INTERNATIONAL_INCOME_ITEM', payload: {id: item.id, path: 'transferPricing.armsLengthPrice', value: parseFormattedValue(e.target.value)}})} className="p-2 border rounded w-full"/>
                         </FormField>
                         <FormField label="Form 3CEB Compliance Status">
                           <select value={item.transferPricing.form3CEBStatus} onChange={e => dispatch({type: 'UPDATE_INTERNATIONAL_INCOME_ITEM', payload: {id: item.id, path: 'transferPricing.form3CEBStatus', value: e.target.value}})} className="p-2 border rounded w-full">
                                {Object.values(ComplianceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                           </select>
                         </FormField>
                       </>}
                   </div>
                </div>
             </div>
          ))}
          <div className="flex items-center gap-4">
            <button onClick={() => dispatch({type: 'ADD_INTERNATIONAL_INCOME'})} className="bg-green-600 text-white px-4 py-2 rounded">+ Add International Income Entry</button>
            {taxData.internationalIncome.length > 0 &&
                <button onClick={() => dispatch({type: 'REMOVE_INTERNATIONAL_INCOME', payload: {id: taxData.internationalIncome[taxData.internationalIncome.length - 1].id}})} className="bg-red-500 text-white px-3 py-2 rounded">- Remove Last Entry</button>
            }
          </div>
        </Card>
        <SummaryCard title="International Income Summary">
            <SummaryRow label="Net Foreign Income Added to GTI" value={computationResult.breakdown.income.international.netIncomeAdded} />
            <SummaryRow label="Tax on Foreign Income" value={computationResult.breakdown.income.international.taxOnIncome} />
            <SummaryRow label="Total Foreign Tax Credit (FTC) Allowed" value={computationResult.breakdown.income.international.totalFtcAllowed} isBold />
        </SummaryCard>
        </>);
      case 'Set Off and Carry Forward':
          const { losses } = taxData;
          const { breakdown } = computationResult;
          const anyLossesToCarryForward = Object.values(computationResult.lossesCarriedForward).some(loss => typeof loss === 'number' && loss > 0);
          return (<>
            <Card title="Current Year Losses (to be set-off)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SingleInputField label="Business Loss (Non-Speculative)" path="losses.currentYear.businessNonSpeculative" value={losses.currentYear.businessNonSpeculative} dispatch={dispatch} />
                    <SingleInputField label="Speculative Business Loss" path="losses.currentYear.businessSpeculative" value={losses.currentYear.businessSpeculative} dispatch={dispatch} />
                    <SingleInputField label="Short-Term Capital Loss (STCL)" path="losses.currentYear.stcl" value={losses.currentYear.stcl} dispatch={dispatch} />
                    <SingleInputField label="Long-Term Capital Loss (LTCL)" path="losses.currentYear.ltcl" value={losses.currentYear.ltcl} dispatch={dispatch} />
                    <SingleInputField label="Loss from Owning and Maintaining Race Horses" path="losses.currentYear.raceHorses" value={losses.currentYear.raceHorses} dispatch={dispatch} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-2 border-b py-2 last:border-0">
                        <div><label className="text-gray-600 font-medium text-sm">House Property Loss</label></div>
                        <div className="p-2 border rounded-md bg-gray-100 text-left">{formatCurrency(breakdown.income.houseProperty.assessed < 0 ? Math.abs(breakdown.income.houseProperty.assessed) : 0)}</div>
                    </div>
                </div>
            </Card>
            <Card title="Brought Forward Losses (from prior years)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SingleInputField label="House Property Loss" path="losses.broughtForward.houseProperty" value={losses.broughtForward.houseProperty} dispatch={dispatch} />
                    <SingleInputField label="Business Loss (Non-Speculative)" path="losses.broughtForward.businessNonSpeculative" value={losses.broughtForward.businessNonSpeculative} dispatch={dispatch} />
                    <SingleInputField label="Speculative Business Loss" path="losses.broughtForward.businessSpeculative" value={losses.broughtForward.businessSpeculative} dispatch={dispatch} />
                    <SingleInputField label="Short-Term Capital Loss (STCL)" path="losses.broughtForward.stcl" value={losses.broughtForward.stcl} dispatch={dispatch} />
                    <SingleInputField label="Long-Term Capital Loss (LTCL)" path="losses.broughtForward.ltcl" value={losses.broughtForward.ltcl} dispatch={dispatch} />
                    <SingleInputField label="Loss from Owning and Maintaining Race Horses" path="losses.broughtForward.raceHorses" value={losses.broughtForward.raceHorses} dispatch={dispatch} />
                    <SingleInputField label="Unabsorbed Depreciation" path="losses.broughtForward.unabsorbedDepreciation" value={losses.broughtForward.unabsorbedDepreciation} dispatch={dispatch} />
                </div>
            </Card>
             <SummaryCard title="Loss Set-off & Carry Forward Summary">
                {computationResult.setOffSummary.length > 0 ? (
                    computationResult.setOffSummary.map((item, index) => (
                        <SummaryRow key={index} label={`Set-off: ${item.source} against ${item.against}`} value={item.amount} />
                    ))
                ) : (
                    <SummaryRow label="No losses set off in the current year" value={0} />
                )}
                {anyLossesToCarryForward && Object.entries(computationResult.lossesCarriedForward).map(([key, value]) => {
                    if (typeof value !== 'number' || value <= 0) return null;
                    const label = { houseProperty: 'CF: House Property Loss', businessNonSpeculative: 'CF: Business Loss', businessSpeculative: 'CF: Speculative Loss', ltcl: 'CF: LTCL', stcl: 'CF: STCL', raceHorses: 'CF: Race Horse Loss', unabsorbedDepreciation: 'CF: Unabsorbed Depreciation' }[key] || key;
                    return <SummaryRow key={key} label={label} value={value} isBold/>;
                })}
             </SummaryCard>
          </>);
      case 'Deductions':
        const { deductions } = taxData;
        const deductionsDisabled = taxData.taxRegime === TaxRegime.New;
        const deductionsNote = deductionsDisabled ? "Deductions under Chapter VI-A are not available under the New Tax Regime (except 80CCD(2) and 80JJAA)." : "";
        
        return (<>
            <Card title="Deductions under Chapter VI-A">
                {deductionsNote && <p className="text-sm bg-yellow-100 text-yellow-800 p-3 rounded-md mb-4">{deductionsNote}</p>}
                <table className="w-full table-fixed">
                    {tableHeader()}
                    <tbody>
                        <IncomeTableRow label="Sec 80C, 80CCC, 80CCD(1)" path="deductions.c80" value={deductions.c80} dispatch={dispatch} disabled={deductionsDisabled} helpText="e.g., LIC, PPF, NSC, ELSS, etc."/>
                        <IncomeTableRow label="Sec 80CCD(1B) - NPS Contribution" path="deductions.ccd1b80" value={deductions.ccd1b80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80CCD(2) - Employer NPS Contribution" path="deductions.ccd2_80" value={deductions.ccd2_80} dispatch={dispatch} helpText="Allowed under both regimes."/>
                        <IncomeTableRow label="Sec 80D - Health Insurance" path="deductions.d80" value={deductions.d80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80DD - Disabled Dependent" path="deductions.dd80" value={deductions.dd80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80DDB - Medical Treatment" path="deductions.ddb80" value={deductions.ddb80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80E - Interest on Education Loan" path="deductions.e80" value={deductions.e80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80G - Donations" path="deductions.g80" value={deductions.g80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80GG - Rent Paid" path="deductions.gg80" value={deductions.gg80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80GGA - Donation for Scientific Research" path="deductions.gga80" value={deductions.gga80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80GGC - Donation to Political Parties" path="deductions.ggc80" value={deductions.ggc80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80TTA - Interest on Savings Account" path="deductions.tta80" value={deductions.tta80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80TTB - Interest (Senior Citizens)" path="deductions.ttb80" value={deductions.ttb80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80U - Self Disability" path="deductions.u80" value={deductions.u80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80JJAA - New Employment" path="deductions.jjaa80" value={deductions.jjaa80} dispatch={dispatch} helpText="Allowed under both regimes."/>
                        <IncomeTableRow label="Sec 80QQB - Royalty of Authors" path="deductions.qqb80" value={deductions.qqb80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80RRB - Royalty on Patents" path="deductions.rrb80" value={deductions.rrb80} dispatch={dispatch} disabled={deductionsDisabled}/>
                        <IncomeTableRow label="Sec 80-IA, 80-IB, etc." path="deductions.ia80" value={deductions.ia80} dispatch={dispatch} disabled={deductionsDisabled} helpText="Profit-linked business deductions."/>
                    </tbody>
                </table>
            </Card>
            <SummaryCard title="Deductions Summary">
                <SummaryRow label="Total Disallowed Deductions" value={computationResult.totalDeductions} isBold />
            </SummaryCard>
        </>);
      case 'Interest & Filing Details':
          const { interestCalc } = taxData;
          const { interest } = computationResult;
          return (<>
            <Card title="Filing & Assessment Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <DateInput label="Due Date of Filing" value={interestCalc.dueDateOfFiling} onChange={val => dispatch({type: 'UPDATE_FIELD', payload: {path: 'interestCalc.dueDateOfFiling', value: val}})} />
                     <DateInput label="Actual Date of Filing" value={interestCalc.actualDateOfFiling} onChange={val => dispatch({type: 'UPDATE_FIELD', payload: {path: 'interestCalc.actualDateOfFiling', value: val}})} />
                     <FormField label="Type of Assessment">
                        <select value={interestCalc.assessmentType} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'interestCalc.assessmentType', value: e.target.value}})} className="w-full p-2 border rounded-md">
                            <option value="regular">Regular Assessment (u/s 143(3))</option>
                            <option value="best_judgment_144">Best Judgment Assessment (u/s 144)</option>
                            <option value="reassessment_147_post_assessment">Reassessment (u/s 147)</option>
                        </select>
                     </FormField>
                      {interestCalc.assessmentType === 'reassessment_147_post_assessment' &&
                        <DateInput label="Due Date specified in 148 Notice" value={interestCalc.dueDate148Notice ?? ''} onChange={val => dispatch({type: 'UPDATE_FIELD', payload: {path: 'interestCalc.dueDate148Notice', value: val}})} />
                      }
                </div>
            </Card>
            <Card title="Advance Tax Installments">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <SingleInputField label="By 15th June" path="interestCalc.advanceTaxInstallments.q1" value={interestCalc.advanceTaxInstallments.q1} dispatch={dispatch} />
                    <SingleInputField label="By 15th September" path="interestCalc.advanceTaxInstallments.q2" value={interestCalc.advanceTaxInstallments.q2} dispatch={dispatch} />
                    <SingleInputField label="By 15th December" path="interestCalc.advanceTaxInstallments.q3" value={interestCalc.advanceTaxInstallments.q3} dispatch={dispatch} />
                    <SingleInputField label="By 15th March" path="interestCalc.advanceTaxInstallments.q4" value={interestCalc.advanceTaxInstallments.q4} dispatch={dispatch} />
                </div>
                <p className="text-xs text-gray-500 mt-4">Enter installment amounts (not cumulative).</p>
            </Card>
            <SummaryCard title="Interest Calculation Summary">
                <SummaryRow label={`Interest u/s 234A (${interest.months_234A} mos)`} value={interest.u_s_234A} />
                <SummaryRow label={`Interest u/s 234B (${interest.months_234B} mos)`} value={interest.u_s_234B} />
                <SummaryRow label={`Interest u/s 234C ${format234CMonths(interest.months_234C)}`} value={interest.u_s_234C} />
                <SummaryRow label="Total Interest Payable" value={interest.totalInterest} isBold />
            </SummaryCard>
          </>);
      case 'Income and Tax Calculator':
        return <SummaryView data={taxData} result={computationResult} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white shadow-md p-4 no-print">
        <div className="container mx-auto flex justify-between items-center flex-wrap">
          <h1 className="text-2xl font-bold">Comprehensive Tax Computation Framework</h1>
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 36 24" className="h-8 w-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="24" fill="white"/>
                <rect width="36" height="8" fill="#FF9933"/>
                <rect y="16" width="36" height="8" fill="#138808"/>
                <circle cx="18" cy="12" r="3.5" fill="none" stroke="#000080" strokeWidth="1"/>
                <circle cx="18" cy="12" r="0.5" fill="#000080"/>
                <path d="M18 12L18 8.5M18 12L18 15.5M18 12L21.031 10.25M18 12L14.969 13.75M18 12L21.031 13.75M18 12L14.969 10.25M18 12L21.5 12M18 12L14.5 12M18 12L19.75 14.531M18 12L16.25 9.469M18 12L19.75 9.469M18 12L16.25 14.531" stroke="#000080" strokeWidth="0.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex items-center gap-4">
             <select value={taxData.assessmentYear} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'assessmentYear', value: e.target.value}})} className="p-2 border rounded-md font-semibold bg-gray-50">
                {ASSESSMENT_YEARS.map(year => <option key={year} value={year}>AY {year}</option>)}
             </select>
             <button onClick={handleReset} className="text-sm bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors">Reset All Data</button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-8 max-w-7xl">
        <nav className="mb-8 overflow-x-auto whitespace-nowrap no-print">
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
