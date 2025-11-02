
import React, { useState, useReducer, useMemo, useEffect } from 'react';
import { TaxData, TaxRegime, IncomeSource, ComputationResult, AssessmentType, AdditionItem, DetailedIncomeBreakdown, SetOffDetail, PresumptiveScheme, Vehicle44AE, ResidentialStatus, InternationalIncomeItem, InternationalIncomeNature, ComplianceStatus, TrustData } from './types';
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
    additions: [],
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


const initialTaxData: TaxData = {
  assesseeName: '',
  pan: '',
  assessmentYear: '2024-25',
  taxpayerType: 'individual',
  residentialStatus: 'resident_ordinarily_resident',
  age: 'below60',
  taxRegime: TaxRegime.Old, // Default to Old, as selection is removed. Comparison view handles both.
  companyType: 'domestic',
  previousYearTurnover: null,
  trustData: newTrustData(),
  salary: {
    employeeType: 'non-government',
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
  },
  houseProperty: { grossRent: newIncomeSource(), municipalTaxes: newIncomeSource(), interestOnLoan: newIncomeSource(), isSelfOccupied: false },
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
  | { type: 'RESET_STATE'; payload: TaxData };


function taxDataReducer(state: TaxData, action: Action): TaxData {
    let newState = JSON.parse(JSON.stringify(state)); // Deep copy for safety
    
    // Handle specific actions first
    switch (action.type) {
        case 'RESET_STATE':
            return action.payload;
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
}> = ({ label, path, value, dispatch, helpText, disabled = false }) => {
    
    useEffect(() => {
        // This effect ensures that every IncomeSource always has at least one AdditionItem.
        // The check for `value` is a safeguard against it being transiently undefined.
        if (value && (!value.additions || value.additions.length === 0)) {
            dispatch({ type: 'ADD_ITEM', payload: { path } });
        }
    }, [path, value, dispatch]);

    const handleItemChange = (id: string, field: 'amount' | 'location', val: any) => {
        const value = field === 'amount' ? parseFormattedValue(val) : val;
        dispatch({ type: 'UPDATE_ITEM', payload: { path, id, field, value } });
    };

    // Before the useEffect runs for the first time, `value.additions` might be empty.
    // We get the first item to bind to the input.
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
                    // Render a disabled input as a placeholder until the item is added by the effect.
                    <input type="text" disabled className="p-2 border rounded-md text-left w-full text-sm bg-gray-200" />
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
            setWarning(`Note: Disallowance for ${found.text} (${ex.section}) should be entered in the 'Salary' tab for accurate computation.`);
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


const Card: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md mb-6 ${className}`}>
    <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-4">{title}</h2>
    {children}
  </div>
);

const ComparisonRow: React.FC<{ label: React.ReactNode; oldVal: number; newVal: number; isNegative?: boolean; isBold?: boolean; isAccent?: boolean }> = ({ label, oldVal, newVal, isNegative, isBold, isAccent }) => {
    const format = (val: number) => isNegative ? `(${formatCurrency(Math.abs(val))})` : formatCurrency(val);

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
                 <div className="print-only">
                    <h2 className="text-2xl font-bold mb-2">Computation of Total Income</h2>
                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div><strong>Assessee:</strong> {data.assesseeName}</div>
                        <div><strong>PAN:</strong> {data.pan}</div>
                        <div><strong>Assessment Year:</strong> {data.assessmentYear}</div>
                    </div>
                </div>
                <Card title="Computation Summary & Comparison" className="card-for-print">
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

    const Row: React.FC<{ label: React.ReactNode; amount: number; isBold?: boolean; isNegative?: boolean; isAccent?: boolean }> = ({ label, amount, isBold = false, isNegative = false, isAccent = false }) => (
        <tr className={`${isBold ? 'font-bold' : ''} ${isAccent ? 'bg-gray-100' : 'border-b'}`}>
            <td className="p-2 text-left">{label}</td>
            <td className="p-2 text-right">{isNegative ? `(${formatCurrency(Math.abs(amount))})` : formatCurrency(amount)}</td>
        </tr>
    );
    
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
        <div className="print-only">
            <h2 className="text-2xl font-bold mb-2">Computation of Total Income</h2>
            <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div><strong>Assessee:</strong> {data.assesseeName}</div>
                <div><strong>PAN:</strong> {data.pan}</div>
                <div><strong>Assessment Year:</strong> {data.assessmentYear}</div>
            </div>
        </div>

        {trustResult && data.taxpayerType === 'trust' && (
             <Card title="Trust Assessment Output" className="bg-blue-50 card-for-print">
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
             </Card>
        )}

        <Card title={`Computation Summary ${data.taxpayerType !== 'trust' ? `(${data.taxRegime} Regime)` : ''}`} className="card-for-print">
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
                {data.taxpayerType !== 'trust' && renderIncomeHead("Income from Salary", result.breakdown.income.salary)}
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

export default function App() {
  const [activeTab, setActiveTab] = useState('Assessee Details');
  const [taxData, dispatch] = useReducer(taxDataReducer, initialTaxData);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      dispatch({ type: 'RESET_STATE', payload: initialTaxData });
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
  const salaryIsApplicable = ['individual', 'huf'].includes(taxData.taxpayerType);


  const dynamicTabs = TABS.filter(tab => {
    if (tab === 'Salary' && !salaryIsApplicable) return false;
    return true;
  });

  const renderContent = () => {
    const tableHeader = (
        <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
            <tr>
                <th className="p-2 text-left font-semibold w-2/5">Particulars</th>
                <th className="p-2 text-left font-semibold w-3/5">Entry (Amount)</th>
            </tr>
        </thead>
    );

    switch (activeTab) {
      case 'Assessee Details':
        const { trustData } = taxData;

        return (<>
          <Card title="Assessee Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-gray-600 font-medium text-sm mb-1">Name of Assessee</label>
                 <input type="text" value={taxData.assesseeName} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'assesseeName', value: e.target.value}})} className="w-full p-2 border rounded-md" />
               </div>
               <div>
                 <label className="block text-gray-600 font-medium text-sm mb-1">PAN</label>
                 <input type="text" value={taxData.pan} onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'pan', value: e.target.value.toUpperCase()}})} className="w-full p-2 border rounded-md uppercase" maxLength={10} />
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
            </div>
            <div className="mt-6 border-t pt-6">
                <SingleInputField label="TDS / TCS" path="tds" value={taxData.tds} dispatch={dispatch} />
                <SingleInputField label="Advance Tax Paid (Total)" path="advanceTax" value={taxData.advanceTax} dispatch={dispatch} />
            </div>
          </Card>
          
           <Card title="Profile Adjustments">
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
                  {tableHeader}
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
        return (
          <>
            <Card title="Income from Salary Details">
                 <div className="mb-6 flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                     <label className="font-medium text-gray-700">Employee Type:</label>
                     <div className="flex items-center gap-4">
                         <label className="flex items-center cursor-pointer">
                             <input
                                 type="radio"
                                 name="employeeType"
                                 value="non-government"
                                 checked={taxData.salary.employeeType === 'non-government'}
                                 onChange={e => dispatch({ type: 'UPDATE_FIELD', payload: { path: 'salary.employeeType', value: e.target.value } })}
                                 className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                             />
                             <span className="ml-2 text-sm text-gray-800">Non-Government</span>
                         </label>
                         <label className="flex items-center cursor-pointer">
                             <input
                                 type="radio"
                                 name="employeeType"
                                 value="government"
                                 checked={taxData.salary.employeeType === 'government'}
                                 onChange={e => dispatch({ type: 'UPDATE_FIELD', payload: { path: 'salary.employeeType', value: e.target.value } })}
                                 className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                             />
                             <span className="ml-2 text-sm text-gray-800">Government</span>
                         </label>
                     </div>
                 </div>

                <h3 className="font-bold text-md text-gray-800 mb-2">Assessable Salary Components (u/s 17)</h3>
                 <table className="w-full table-fixed mb-6">
                     {tableHeader}
                     <tbody>
                        <IncomeTableRow label="Basic Salary / Wages (Sec 17(1))" path="salary.basicSalary" value={taxData.salary.basicSalary} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Allowances (Sec 17(1))" path="salary.allowances" value={taxData.salary.allowances} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Bonus / Commission (Sec 17(1))" path="salary.bonusAndCommission" value={taxData.salary.bonusAndCommission} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                    </tbody>
                 </table>
                
                <h4 className="font-semibold text-base text-gray-700 mt-4 mb-2">Perquisites (Sec 17(2))</h4>
                <table className="w-full table-fixed mb-6">
                     {tableHeader}
                     <tbody>
                        <IncomeTableRow label="Rent Free Accommodation (Rule 3)" path="salary.perquisites.rentFreeAccommodation" value={taxData.salary.perquisites.rentFreeAccommodation} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Motor Car (Rule 3)" path="salary.perquisites.motorCar" value={taxData.salary.perquisites.motorCar} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Other Perquisites" path="salary.perquisites.otherPerquisites" value={taxData.salary.perquisites.otherPerquisites} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                    </tbody>
                </table>
                
                <h4 className="font-semibold text-base text-gray-700 mt-4 mb-2">Profits in Lieu of Salary (Sec 17(3))</h4>
                <table className="w-full table-fixed mb-6">
                     {tableHeader}
                     <tbody>
                        <IncomeTableRow label="Compensation on Termination" path="salary.profitsInLieu.terminationCompensation" value={taxData.salary.profitsInLieu.terminationCompensation} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Commuted Pension (Unexempt Portion)" path="salary.profitsInLieu.commutedPension" value={taxData.salary.profitsInLieu.commutedPension} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Retrenchment Compensation" path="salary.profitsInLieu.retrenchmentCompensation" value={taxData.salary.profitsInLieu.retrenchmentCompensation} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="VRS Compensation" path="salary.profitsInLieu.vrsCompensation" value={taxData.salary.profitsInLieu.vrsCompensation} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Other" path="salary.profitsInLieu.otherProfitsInLieu" value={taxData.salary.profitsInLieu.otherProfitsInLieu} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                    </tbody>
                </table>


                <h3 className="font-bold text-md text-gray-800 mt-6 mb-2 pt-4 border-t">Additions: Disallowed Salary Exemptions (u/s 10)</h3>
                 <table className="w-full table-fixed mb-6">
                     {tableHeader}
                     <tbody>
                        <IncomeTableRow label="House Rent Allowance (Sec 10(13A))" path="salary.exemptions.hra" value={taxData.salary.exemptions.hra} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Leave Travel Allowance (Sec 10(5))" path="salary.exemptions.lta" value={taxData.salary.exemptions.lta} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Gratuity (Sec 10(10))" path="salary.exemptions.gratuity" value={taxData.salary.exemptions.gratuity} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Leave Encashment (Sec 10(10AA))" path="salary.exemptions.leaveEncashment" value={taxData.salary.exemptions.leaveEncashment} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Commuted Pension (Sec 10(10A))" path="salary.exemptions.commutedPension" value={taxData.salary.exemptions.commutedPension} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Retrenchment Compensation (Sec 10(10B))" path="salary.exemptions.retrenchmentCompensation" value={taxData.salary.exemptions.retrenchmentCompensation} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="VRS Compensation (Sec 10(10C))" path="salary.exemptions.vrsCompensation" value={taxData.salary.exemptions.vrsCompensation} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Provident/Superannuation Fund (Sec 10(11-13))" path="salary.exemptions.providentFund" value={taxData.salary.exemptions.providentFund} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Special Allowances (Sec 10(14))" path="salary.exemptions.specialAllowances" value={taxData.salary.exemptions.specialAllowances} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Other Exemptions (Sec 10)" path="salary.exemptions.otherExemptions" value={taxData.salary.exemptions.otherExemptions} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                    </tbody>
                 </table>
                
                <h3 className="font-bold text-md text-gray-800 mt-6 mb-2 pt-4 border-t">Additions: Disallowed Salary Deductions (u/s 16)</h3>
                 <table className="w-full table-fixed mb-6">
                     {tableHeader}
                     <tbody>
                        <IncomeTableRow label="Professional Tax (Sec 16(iii))" path="salary.deductions.professionalTax" value={taxData.salary.deductions.professionalTax} dispatch={dispatch} helpText={salaryAdditionHelpText} />
                        <IncomeTableRow label="Entertainment Allowance (Sec 16(ii))" path="salary.deductions.entertainmentAllowance" value={taxData.salary.deductions.entertainmentAllowance} dispatch={dispatch} helpText={salaryAdditionHelpText}/>
                    </tbody>
                 </table>
             
                <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-800">Total Income from Salary</h3>
                        <span className="text-xl font-bold font-mono text-gray-900">
                            ₹ {computationResult.breakdown.income.salary.assessed < 0 ? `(${formatCurrency(Math.abs(computationResult.breakdown.income.salary.assessed))})` : formatCurrency(computationResult.breakdown.income.salary.assessed)}
                        </span>
                    </div>
                </div>
            </Card>
          </>
        );
      }
      case 'House Property': return <Card title="Income from House Property Details">
          <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-md">
              <input
                  type="checkbox"
                  id="isSelfOccupied"
                  checked={taxData.houseProperty.isSelfOccupied}
                  onChange={e => dispatch({ type: 'UPDATE_FIELD', payload: { path: 'houseProperty.isSelfOccupied', value: e.target.checked } })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isSelfOccupied" className="ml-2 block text-sm font-medium text-gray-900">
                  Property is Self-Occupied
              </label>
          </div>
          <table className="w-full table-fixed">
                {tableHeader}
                <tbody>
                  <IncomeTableRow 
                      label="Gross Rental Income" 
                      path="houseProperty.grossRent" 
                      value={taxData.houseProperty.grossRent} 
                      dispatch={dispatch}
                      disabled={taxData.houseProperty.isSelfOccupied}
                      helpText={taxData.houseProperty.isSelfOccupied ? "Not applicable (GAV is nil for SOP)" : ""}
                    />
                  <IncomeTableRow 
                      label="Municipal Taxes Paid" 
                      path="houseProperty.municipalTaxes" 
                      value={taxData.houseProperty.municipalTaxes} 
                      dispatch={dispatch} 
                      disabled={taxData.houseProperty.isSelfOccupied}
                      helpText={taxData.houseProperty.isSelfOccupied ? "Not applicable for SOP" : ""}
                  />
                   <tr className="border-b bg-gray-50">
                      <td className="p-2 align-top pt-3">
                          <p className="font-medium text-sm text-gray-700">Net Annual Value (NAV)</p>
                          <p className="text-xs text-gray-500">(Gross Rent - Municipal Taxes)</p>
                      </td>
                      <td className="p-2 align-top pt-3">
                          <div className="p-2 bg-gray-200 rounded-md text-left font-mono">
                              {formatCurrency(computationResult.breakdown.nav)}
                          </div>
                      </td>
                  </tr>
                  <tr className="border-b bg-gray-50">
                      <td className="p-2 align-top pt-3">
                          <p className="font-medium text-sm text-gray-700">Standard Deduction u/s 24(a)</p>
                          <p className="text-xs text-gray-500">(30% of NAV)</p>
                      </td>
                      <td className="p-2 align-top pt-3">
                          <div className="p-2 bg-gray-200 rounded-md text-left font-mono text-red-600">
                              ({formatCurrency(computationResult.breakdown.standardDeduction24a)})
                          </div>
                      </td>
                  </tr>
                  <IncomeTableRow 
                      label="Interest on Housing Loan (Sec 24(b))" 
                      path="houseProperty.interestOnLoan" 
                      value={taxData.houseProperty.interestOnLoan} 
                      dispatch={dispatch}
                      helpText={taxData.houseProperty.isSelfOccupied ? "Deduction is limited to ₹2,00,000" : "No limit on deduction for let-out property"}
                    />
              </tbody>
            </table>
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800">Income / (Loss) from House Property</h3>
                  <span className="text-xl font-bold font-mono text-gray-900">
                      ₹ {computationResult.breakdown.income.houseProperty.assessed < 0 ? `(${formatCurrency(Math.abs(computationResult.breakdown.income.houseProperty.assessed))})` : formatCurrency(computationResult.breakdown.income.houseProperty.assessed)}
                  </span>
              </div>
          </div>
      </Card>;
      case 'PGBP': {
          const { pgbp } = taxData;
          const isPresumptiveActive = pgbp.presumptiveScheme !== PresumptiveScheme.None;

          const handleSchemeChange = (scheme: PresumptiveScheme) => {
              dispatch({ type: 'UPDATE_FIELD', payload: { path: 'pgbp.presumptiveScheme', value: scheme } });
          };

          const renderPresumptiveInputs = () => {
              switch(pgbp.presumptiveScheme) {
                  case PresumptiveScheme.AD:
                      return <div className="p-4 border rounded-md mt-4 bg-white">
                          <h4 className="font-semibold text-gray-700">Sec 44AD - Small Businesses</h4>
                          <p className="text-xs text-gray-500 mb-4">Turnover ≤ ₹2 crore. Income is 8% of turnover (6% for digital receipts).</p>
                          <table className="w-full table-fixed"><tbody>
                            <IncomeTableRow label="Turnover/Receipts (Digital)" path="pgbp.turnover44AD_digital" value={pgbp.turnover44AD_digital} dispatch={dispatch} />
                            <IncomeTableRow label="Turnover/Receipts (Other)" path="pgbp.turnover44AD_other" value={pgbp.turnover44AD_other} dispatch={dispatch} />
                          </tbody></table>
                      </div>;
                  case PresumptiveScheme.ADA:
                      return <div className="p-4 border rounded-md mt-4 bg-white">
                          <h4 className="font-semibold text-gray-700">Sec 44ADA - Specified Professionals</h4>
                          <p className="text-xs text-gray-500 mb-4">Gross Receipts ≤ ₹50 lakh. Income is 50% of receipts.</p>
                          <table className="w-full table-fixed"><tbody>
                            <IncomeTableRow label="Gross Receipts" path="pgbp.grossReceipts44ADA" value={pgbp.grossReceipts44ADA} dispatch={dispatch} />
                          </tbody></table>
                      </div>;
                  case PresumptiveScheme.AE:
                      return <div className="p-4 border rounded-md mt-4 bg-white">
                          <h4 className="font-semibold text-gray-700">Sec 44AE - Goods Carriage Business</h4>
                          <p className="text-xs text-gray-500 mb-4">Max 10 vehicles. Income: ₹7,500/month (light vehicle) or ₹1,000/ton/month (heavy vehicle).</p>
                          <table className="w-full text-sm text-left">
                              <thead className="bg-gray-100"><tr>
                                  <th className="p-2">Vehicle Type</th><th className="p-2">Tonnage (if heavy)</th><th className="p-2">Months Owned</th><th className="p-2">Actions</th>
                              </tr></thead>
                              <tbody>
                                  {pgbp.vehicles44AE.map(v => <tr key={v.id} className="border-b">
                                      <td className="p-2"><select value={v.type} onChange={e => dispatch({ type: 'UPDATE_VEHICLE', payload: { id: v.id, field: 'type', value: e.target.value }})} className="p-1 border rounded w-full"><option value="other">Other Vehicle</option><option value="heavy">Heavy Vehicle</option></select></td>
                                      <td className="p-2"><input type="number" value={v.tonnage ?? ''} disabled={v.type !== 'heavy'} onChange={e => dispatch({ type: 'UPDATE_VEHICLE', payload: { id: v.id, field: 'tonnage', value: e.target.value ? parseFloat(e.target.value) : null }})} className={`p-1 border rounded w-full ${v.type !== 'heavy' ? 'bg-gray-200' : ''}`} /></td>
                                      <td className="p-2"><input type="number" min="0" max="12" value={v.months ?? ''} onChange={e => dispatch({ type: 'UPDATE_VEHICLE', payload: { id: v.id, field: 'months', value: e.target.value ? parseInt(e.target.value) : null }})} className="p-1 border rounded w-full" /></td>
                                      <td className="p-2"><button onClick={() => dispatch({type: 'REMOVE_VEHICLE', payload: {id: v.id}})} className="text-red-500 p-1">Remove</button></td>
                                  </tr>)}
                              </tbody>
                          </table>
                          <button onClick={() => dispatch({type: 'ADD_VEHICLE'})} className="mt-4 bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600">Add Vehicle</button>
                      </div>;
                   case PresumptiveScheme.B:
                        return <div className="p-4 border rounded-md mt-4 bg-white">
                            <h4 className="font-semibold text-gray-700">Sec 44B - Non-resident Shipping</h4>
                            <p className="text-xs text-gray-500 mb-4">Income is 7.5% of aggregate receipts.</p>
                            <table className="w-full table-fixed"><tbody><IncomeTableRow label="Aggregate Receipts" path="pgbp.aggregateReceipts44B" value={pgbp.aggregateReceipts44B} dispatch={dispatch} /></tbody></table>
                        </div>;
                   case PresumptiveScheme.BB:
                        return <div className="p-4 border rounded-md mt-4 bg-white">
                            <h4 className="font-semibold text-gray-700">Sec 44BB - Non-resident (Mineral Oils)</h4>
                            <p className="text-xs text-gray-500 mb-4">Income is 10% of aggregate receipts.</p>
                            <table className="w-full table-fixed"><tbody><IncomeTableRow label="Aggregate Receipts" path="pgbp.aggregateReceipts44BB" value={pgbp.aggregateReceipts44BB} dispatch={dispatch} /></tbody></table>
                        </div>;
                   case PresumptiveScheme.BBA:
                        return <div className="p-4 border rounded-md mt-4 bg-white">
                            <h4 className="font-semibold text-gray-700">Sec 44BBA - Non-resident (Aircraft)</h4>
                            <p className="text-xs text-gray-500 mb-4">Income is 5% of aggregate receipts.</p>
                            <table className="w-full table-fixed"><tbody><IncomeTableRow label="Aggregate Receipts" path="pgbp.aggregateReceipts44BBA" value={pgbp.aggregateReceipts44BBA} dispatch={dispatch} /></tbody></table>
                        </div>;
                   case PresumptiveScheme.BBB:
                        return <div className="p-4 border rounded-md mt-4 bg-white">
                            <h4 className="font-semibold text-gray-700">Sec 44BBB - Foreign Co. (Turnkey Power Projects)</h4>
                            <p className="text-xs text-gray-500 mb-4">Income is 10% of aggregate receipts.</p>
                            <table className="w-full table-fixed"><tbody><IncomeTableRow label="Aggregate Receipts" path="pgbp.aggregateReceipts44BBB" value={pgbp.aggregateReceipts44BBB} dispatch={dispatch} /></tbody></table>
                        </div>;
                  default: return null;
              }
          }

          return (
              <Card title="Profits and Gains of Business or Profession Details">
                   {taxData.residentialStatus === 'resident_not_ordinarily_resident' && (
                        <div className="flex items-center mb-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                            <input
                                type="checkbox"
                                id="isControlledFromIndia"
                                checked={taxData.pgbp.isControlledFromIndia}
                                onChange={e => dispatch({ type: 'UPDATE_FIELD', payload: { path: 'pgbp.isControlledFromIndia', value: e.target.checked } })}
                                className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                            />
                            <label htmlFor="isControlledFromIndia" className="ml-3 block text-sm font-medium text-yellow-800">
                                For business income from 'Outside India', is the business controlled from India?
                                <span className="block text-xs"> (Relevant for RNOR status)</span>
                            </label>
                        </div>
                   )}
                  <div className="p-4 bg-gray-50 rounded-lg mb-6">
                      <h3 className="font-semibold text-lg mb-3 text-gray-800">Taxation Method</h3>
                      <div className="flex items-center gap-6">
                          <label className="flex items-center cursor-pointer"><input type="radio" name="pgbpMethod" checked={!isPresumptiveActive} onChange={() => handleSchemeChange(PresumptiveScheme.None)} className="h-4 w-4" /><span className="ml-2">Regular PGBP Calculation</span></label>
                          <label className="flex items-center cursor-pointer"><input type="radio" name="pgbpMethod" checked={isPresumptiveActive} onChange={() => handleSchemeChange(PresumptiveScheme.AD)} className="h-4 w-4" /><span className="ml-2">Presumptive Taxation</span></label>
                      </div>
                      {isPresumptiveActive && (
                          <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Select Presumptive Scheme</label>
                              <select value={pgbp.presumptiveScheme} onChange={e => handleSchemeChange(e.target.value as PresumptiveScheme)} className="w-full p-2 border rounded-md">
                                  <option value={PresumptiveScheme.AD}>44AD - Small Business</option>
                                  <option value={PresumptiveScheme.ADA}>44ADA - Specified Professionals</option>
                                  <option value={PresumptiveScheme.AE}>44AE - Goods Carriage</option>
                                  <option value={PresumptiveScheme.B}>44B - Non-resident Shipping</option>
                                  <option value={PresumptiveScheme.BB}>44BB - Non-resident Mineral Oils</option>
                                  <option value={PresumptiveScheme.BBA}>44BBA - Non-resident Aircraft Operation</option>
                                  <option value={PresumptiveScheme.BBB}>44BBB - Foreign Co. Turnkey Power Projects</option>
                              </select>
                          </div>
                      )}
                  </div>

                  {isPresumptiveActive && <div className="mb-6">{renderPresumptiveInputs()}</div>}

                  <div className={`transition-opacity ${isPresumptiveActive ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                      <h3 className="font-bold text-md text-gray-800 mb-2 pt-4 border-t">Regular PGBP Calculation</h3>
                      {isPresumptiveActive && <p className="text-sm text-gray-500 mb-4 italic">Disabled because a presumptive scheme is selected.</p>}
                      <table className="w-full table-fixed mb-6">
                          {tableHeader}
                          <tbody>
                              <IncomeTableRow label="Net Profit as per Books (Non-Speculative)" path="pgbp.netProfit" value={pgbp.netProfit} dispatch={dispatch} disabled={isPresumptiveActive} />
                          </tbody>
                      </table>
                      <h3 className="font-bold text-md text-gray-800 mt-6 mb-2 pt-4 border-t">Additions / Disallowances</h3>
                      <table className="w-full table-fixed">
                          {tableHeader}
                          <tbody>
                            <IncomeTableRow label="Unreported / Unrecorded Sales or Receipts" path="pgbp.additions.unreportedSales" value={taxData.pgbp.additions.unreportedSales} dispatch={dispatch} helpText="Point 10" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Unaccounted Business Income" path="pgbp.additions.unaccountedBusinessIncome" value={taxData.pgbp.additions.unaccountedBusinessIncome} dispatch={dispatch} helpText="Point 17" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Bogus Purchases / Hawala Transactions" path="pgbp.additions.bogusPurchases" value={taxData.pgbp.additions.bogusPurchases} dispatch={dispatch} helpText="Point 19" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Unrecorded Advances, Loans, Credits" path="pgbp.additions.unrecordedCredits" value={taxData.pgbp.additions.unrecordedCredits} dispatch={dispatch} helpText="Point 20" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="GP/NP Ratio Difference" path="pgbp.additions.gpNpRatioDifference" value={taxData.pgbp.additions.gpNpRatioDifference} dispatch={dispatch} helpText="Point 18" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Stock Suppression / Valuation Difference" path="pgbp.additions.stockSuppression" value={taxData.pgbp.additions.stockSuppression} dispatch={dispatch} helpText="Point 11" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Incorrect Depreciation Claim (Sec 32)" path="pgbp.additions.incorrectDepreciation" value={taxData.pgbp.additions.incorrectDepreciation} dispatch={dispatch} helpText="Point 12" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Personal Expenses (Sec 37(1) Proviso)" path="pgbp.additions.disallowance37_1_personal" value={taxData.pgbp.additions.disallowance37_1_personal} dispatch={dispatch} helpText="Point 2" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Capital Expenditure (Sec 37(1))" path="pgbp.additions.disallowance37_1_capital" value={taxData.pgbp.additions.disallowance37_1_capital} dispatch={dispatch} helpText="Point 3" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Expenses not for Business (Sec 37(1))" path="pgbp.additions.disallowance37_1_nonBusiness" value={taxData.pgbp.additions.disallowance37_1_nonBusiness} dispatch={dispatch} helpText="Point 1" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Provision for Doubtful Debts (Sec 36(1)(vii))" path="pgbp.additions.disallowance36_1_vii_provisions" value={taxData.pgbp.additions.disallowance36_1_vii_provisions} dispatch={dispatch} helpText="Point 13" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Interest on Interest-Free Loans to Relatives (Sec 36(1)(iii))" path="pgbp.additions.disallowance36_1_iii_interest" value={taxData.pgbp.additions.disallowance36_1_iii_interest} dispatch={dispatch} helpText="Point 14" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Late Employees' PF/ESI Contribution (Sec 36(1)(va))" path="pgbp.additions.disallowance36_employeeContrib" value={taxData.pgbp.additions.disallowance36_employeeContrib} dispatch={dispatch} helpText="Point 16" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="TDS Non-compliance (Sec 40(a))" path="pgbp.additions.disallowance40a_tds" value={taxData.pgbp.additions.disallowance40a_tds} dispatch={dispatch} helpText="Point 4" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Partner Remuneration/Interest (Sec 40(b))" path="pgbp.additions.disallowance40b_partnerPayments" value={taxData.pgbp.additions.disallowance40b_partnerPayments} dispatch={dispatch} helpText="Point 8" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Related Party Payments (Sec 40A(2))" path="pgbp.additions.disallowance40A2_relatedParty" value={taxData.pgbp.additions.disallowance40A2_relatedParty} dispatch={dispatch} disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Cash Payments > ₹10,000 (Sec 40A(3))" path="pgbp.additions.disallowance40A3_cashPayment" value={taxData.pgbp.additions.disallowance40A3_cashPayment} dispatch={dispatch} helpText="Point 5" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Unapproved Gratuity Provision (Sec 40A(7))" path="pgbp.additions.disallowance40A7_gratuity" value={taxData.pgbp.additions.disallowance40A7_gratuity} dispatch={dispatch} helpText="Point 6" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Contribution to Unapproved Funds (Sec 40A(9))" path="pgbp.additions.disallowance40A9_unapprovedFunds" value={taxData.pgbp.additions.disallowance40A9_unapprovedFunds} dispatch={dispatch} helpText="Point 7" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Statutory Dues Unpaid (Sec 43B)" path="pgbp.additions.disallowance43B_statutoryDues" value={taxData.pgbp.additions.disallowance43B_statutoryDues} dispatch={dispatch} disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Expenses for Exempt Income (Sec 14A)" path="pgbp.additions.disallowance14A_exemptIncome" value={taxData.pgbp.additions.disallowance14A_exemptIncome} dispatch={dispatch} helpText="Point 15" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Unexplained/Unvouched Expenditure" path="pgbp.additions.unexplainedExpenditure" value={taxData.pgbp.additions.unexplainedExpenditure} dispatch={dispatch} helpText="Point 9" disabled={isPresumptiveActive} />
                            <IncomeTableRow label="Other Disallowances" path="pgbp.additions.otherDisallowances" value={taxData.pgbp.additions.otherDisallowances} dispatch={dispatch} disabled={isPresumptiveActive} />
                          </tbody>
                      </table>
                  </div>

                   <h3 className="font-bold text-md text-gray-800 mt-6 mb-2 pt-4 border-t">Speculative Income</h3>
                   <table className="w-full table-fixed mb-6">
                        {tableHeader}
                        <tbody>
                            <IncomeTableRow label="Speculative Business Income (Sec 43(5))" path="pgbp.speculativeIncome" value={pgbp.speculativeIncome} dispatch={dispatch} />
                        </tbody>
                    </table>

                  <div className="mt-6 border-t pt-4">
                      <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                          <h3 className="text-lg font-bold text-gray-800">Total Income from PGBP</h3>
                          <span className="text-xl font-bold font-mono text-gray-900">
                              ₹ {formatCurrency(computationResult.breakdown.income.pgbp.assessed)}
                          </span>
                      </div>
                  </div>
              </Card>
          );
      }
      case 'Capital Gains': {
          return <Card title="Capital Gains Details">
            <table className="w-full table-fixed">
                {tableHeader}
                <tbody>
                  <IncomeTableRow label="STCG (Sec 111A)" path="capitalGains.stcg111A" value={taxData.capitalGains.stcg111A} dispatch={dispatch} helpText="Taxable @ 15%"/>
                  <IncomeTableRow label="STCG (Other)" path="capitalGains.stcgOther" value={taxData.capitalGains.stcgOther} dispatch={dispatch} helpText="Taxable at normal rates"/>
                  <IncomeTableRow label="LTCG (Sec 112A)" path="capitalGains.ltcg112A" value={taxData.capitalGains.ltcg112A} dispatch={dispatch} helpText="Taxable @ 10% > 1 Lakh"/>
                  <IncomeTableRow label="LTCG (Other)" path="capitalGains.ltcgOther" value={taxData.capitalGains.ltcgOther} dispatch={dispatch} helpText="Taxable @ 20%"/>
                  <IncomeTableRow label="Deemed Gain (Sec 50C)" path="capitalGains.adjustment50C" value={taxData.capitalGains.adjustment50C} dispatch={dispatch} />
                  <IncomeTableRow label="Deemed STCG on Depreciable Assets (Sec 50)" path="capitalGains.adjustment50" value={taxData.capitalGains.adjustment50} dispatch={dispatch} />
                  <IncomeTableRow label="Deemed Gain (Sec 50CA - Unlisted Shares)" path="capitalGains.adjustment50CA" value={taxData.capitalGains.adjustment50CA} dispatch={dispatch} />
                  <IncomeTableRow label="Deemed Gain (Sec 50D - Indeterminable Consideration)" path="capitalGains.adjustment50D" value={taxData.capitalGains.adjustment50D} dispatch={dispatch} />
                  <IncomeTableRow label="Deemed Business Income (Sec 43CA - Stock-in-Trade)" path="capitalGains.adjustment43CA" value={taxData.capitalGains.adjustment43CA} dispatch={dispatch} helpText="Note: This is taxed under PGBP but entered here for convenience." />
                  <IncomeTableRow label="Disallowed Cost of Improvement" path="capitalGains.costOfImprovement" value={taxData.capitalGains.costOfImprovement} dispatch={dispatch} />
                  <IncomeTableRow label="Disallowed Exemption u/s 54" path="capitalGains.exemption54" value={taxData.capitalGains.exemption54} dispatch={dispatch} />
                  <IncomeTableRow label="Disallowed Exemption u/s 54B (against LTCG)" path="capitalGains.exemption54B_ltcg" value={taxData.capitalGains.exemption54B_ltcg} dispatch={dispatch} />
                  <IncomeTableRow label="Disallowed Exemption u/s 54B (against STCG)" path="capitalGains.exemption54B_stcg" value={taxData.capitalGains.exemption54B_stcg} dispatch={dispatch} />
                  <IncomeTableRow label="Disallowed Exemption u/s 54D" path="capitalGains.exemption54D" value={taxData.capitalGains.exemption54D} dispatch={dispatch} />
                  <IncomeTableRow label="Disallowed Exemption u/s 54EC" path="capitalGains.exemption54EC" value={taxData.capitalGains.exemption54EC} dispatch={dispatch} />
                  <IncomeTableRow label="Disallowed Exemption u/s 54EE" path="capitalGains.exemption54EE" value={taxData.capitalGains.exemption54EE} dispatch={dispatch} />
                  <IncomeTableRow label="Disallowed Exemption u/s 54F" path="capitalGains.exemption54F" value={taxData.capitalGains.exemption54F} dispatch={dispatch} />
                  <IncomeTableRow label="Disallowed Exemption u/s 54G" path="capitalGains.exemption54G" value={taxData.capitalGains.exemption54G} dispatch={dispatch} />
                  <IncomeTableRow label="Disallowed Exemption u/s 54GA" path="capitalGains.exemption54GA" value={taxData.capitalGains.exemption54GA} dispatch={dispatch} />
                  <IncomeTableRow label="Disallowed Exemption u/s 54GB" path="capitalGains.exemption54GB" value={taxData.capitalGains.exemption54GB} dispatch={dispatch} />
              </tbody>
            </table>
             <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-800">Total Additions under Capital Gains</h3>
                    <span className="text-xl font-bold font-mono text-gray-900">
                        ₹ {formatCurrency(totalCapitalGainsAdditions)}
                    </span>
                </div>
            </div>
      </Card>;
    }
      case 'Other Sources': {
        const totalHeadIncome = computationResult.breakdown.income.otherSources.assessed +
                              computationResult.breakdown.income.winnings.assessed +
                              computationResult.breakdown.income.deemed;
        return <>
            <Card title="Income from Other Sources Details">
              <table className="w-full table-fixed mb-6">
                    {tableHeader}
                    <tbody>
                      <IncomeTableRow label="Other Incomes (Interest, etc.)" path="otherSources.otherIncomes" value={taxData.otherSources.otherIncomes} dispatch={dispatch} />
                      <IncomeTableRow label="Family Pension" path="otherSources.familyPension" value={taxData.otherSources.familyPension} dispatch={dispatch} helpText="Deduction is 1/3rd or ₹15,000, whichever is less"/>
                      <IncomeTableRow label="Interest on Enhanced Compensation" path="otherSources.interestOnEnhancedCompensation" value={taxData.otherSources.interestOnEnhancedCompensation} dispatch={dispatch} helpText="50% is deductible u/s 57(iv)"/>
                      <IncomeTableRow label="Income from Owning & Maintaining Race Horses" path="otherSources.raceHorseIncome" value={taxData.otherSources.raceHorseIncome} dispatch={dispatch} />
                      <IncomeTableRow label="Winnings from Lottery, etc." path="otherSources.winnings" value={taxData.otherSources.winnings} dispatch={dispatch} helpText="Taxable @ 30%" />
                      <IncomeTableRow label="Deemed Dividend (Sec 2(22)(e))" path="otherSources.deemedDividend2_22_e" value={taxData.otherSources.deemedDividend2_22_e} dispatch={dispatch} />
                      <IncomeTableRow label="Gifts (Sec 56(2)(x))" path="otherSources.gifts56_2_x" value={taxData.otherSources.gifts56_2_x} dispatch={dispatch} helpText="Taxable if aggregate > ₹50,000"/>
                      <IncomeTableRow label="Agricultural Income (for rate purposes)" path="otherSources.exemptIncome" value={taxData.otherSources.exemptIncome} dispatch={dispatch} />
                      <IncomeTableRow label="Disallowance u/s 14A" path="otherSources.disallowance14A" value={taxData.otherSources.disallowance14A} dispatch={dispatch} />
                  </tbody>
              </table>
            </Card>
            <Card title="Deemed Income (Taxable at Special Rates u/s 115BBE)">
                <table className="w-full table-fixed">
                    {tableHeader}
                    <tbody>
                      <IncomeTableRow label="Unexplained Cash Credits (Sec 68)" path="deemedIncome.sec68_cashCredits" value={taxData.deemedIncome.sec68_cashCredits} dispatch={dispatch} />
                      <IncomeTableRow label="Unexplained Investments (Sec 69)" path="deemedIncome.sec69_unexplainedInvestments" value={taxData.deemedIncome.sec69_unexplainedInvestments} dispatch={dispatch} />
                      <IncomeTableRow label="Unexplained Money, etc. (Sec 69A)" path="deemedIncome.sec69A_unexplainedMoney" value={taxData.deemedIncome.sec69A_unexplainedMoney} dispatch={dispatch} />
                      <IncomeTableRow label="Investments not fully disclosed (Sec 69B)" path="deemedIncome.sec69B_investmentsNotDisclosed" value={taxData.deemedIncome.sec69B_investmentsNotDisclosed} dispatch={dispatch} />
                      <IncomeTableRow label="Unexplained Expenditure (Sec 69C)" path="deemedIncome.sec69C_unexplainedExpenditure" value={taxData.deemedIncome.sec69C_unexplainedExpenditure} dispatch={dispatch} />
                      <IncomeTableRow label="Hundi Borrowings (Sec 69D)" path="deemedIncome.sec69D_hundiBorrowing" value={taxData.deemedIncome.sec69D_hundiBorrowing} dispatch={dispatch} />
                    </tbody>
                </table>
                 <div className="mt-6 border-t pt-4">
                    <div className="space-y-2 p-4 bg-amber-50 rounded-lg">
                        <div className="flex justify-between font-semibold">
                            <span>Total Deemed Income</span>
                            <span className="font-mono">₹ {formatCurrency(computationResult.breakdown.income.deemed)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tax @ 60%</span>
                            <span className="font-mono">₹ {formatCurrency(computationResult.breakdown.income.deemed * 0.60)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Surcharge @ 25% on Tax</span>
                            <span className="font-mono">₹ {formatCurrency(computationResult.breakdown.income.deemed * 0.60 * 0.25)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2 font-bold text-red-700">
                            <span>Tax on Deemed Income (excluding Cess)</span>
                            <span className="font-mono">₹ {formatCurrency(computationResult.breakdown.tax.onDeemedIncome)}</span>
                        </div>
                    </div>
                </div>
            </Card>
            <div className="mt-6">
                <div className="flex justify-between items-center p-4 bg-blue-100 rounded-lg shadow">
                    <h3 className="text-lg font-bold text-blue-800">Total Income Addition under 'Other Sources' Head</h3>
                    <span className="text-xl font-bold font-mono text-blue-900">
                        ₹ {formatCurrency(totalHeadIncome)}
                    </span>
                </div>
            </div>
          </>;
        }
      case 'International Income': {
        const { internationalIncome } = taxData;
        const { international: intlResult } = computationResult.breakdown.income;

        const handleUpdate = (id: string, path: string, value: any) => {
            dispatch({ type: 'UPDATE_INTERNATIONAL_INCOME_ITEM', payload: { id, path, value } });
        };
        
        const DTAA_ARTICLE_MAP: { [key in InternationalIncomeNature]?: string } = {
            [InternationalIncomeNature.Salary]: '15',
            [InternationalIncomeNature.InterestIncome]: '11',
            [InternationalIncomeNature.Dividend]: '10',
            [InternationalIncomeNature.Royalty]: '12',
            [InternationalIncomeNature.FeesForTechnicalServices]: '12',
            [InternationalIncomeNature.BusinessProfessionalIncome]: '7',
            [InternationalIncomeNature.LongTermCapitalGain]: '13',
            [InternationalIncomeNature.ShortTermCapitalGain]: '13',
            [InternationalIncomeNature.HouseProperty]: '6',
            [InternationalIncomeNature.Others]: '21',
        };

        const handleNatureChange = (id: string, newNature: InternationalIncomeNature) => {
            let defaultSection: InternationalIncomeItem['specialSection'] = 'None';
            switch (newNature) {
                case InternationalIncomeNature.Royalty:
                case InternationalIncomeNature.FeesForTechnicalServices:
                case InternationalIncomeNature.InterestIncome:
                case InternationalIncomeNature.Dividend:
                    defaultSection = '115A';
                    break;
            }
            const defaultArticle = DTAA_ARTICLE_MAP[newNature] || '';
            
            dispatch({ type: 'UPDATE_INTERNATIONAL_INCOME_ITEM', payload: { id, path: 'nature', value: newNature } });
            dispatch({ type: 'UPDATE_INTERNATIONAL_INCOME_ITEM', payload: { id, path: 'specialSection', value: defaultSection } });
            dispatch({ type: 'UPDATE_INTERNATIONAL_INCOME_ITEM', payload: { id, path: 'applicableDtaaArticle', value: defaultArticle } });
        }

        const natureOptions = Object.values(InternationalIncomeNature).map(value => ({
            value: value,
            label: value
        }));
        
        return (
            <Card title="International Income & Foreign Tax Credit (Form 67)">
              <div className="space-y-6">
                {internationalIncome.map((item, index) => (
                    <div key={item.id} className="border p-4 rounded-lg bg-gray-50/50 relative shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-md text-gray-800">Foreign Income Source #{index + 1}</h3>
                             <button onClick={() => dispatch({type: 'REMOVE_INTERNATIONAL_INCOME', payload: {id: item.id}})} className="text-red-500 hover:text-red-700 font-bold p-1 text-2xl leading-none" aria-label="Remove Foreign Income Item">&times;</button>
                        </div>
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <FormField label="Country / Specified Territory">
                                <input type="text" value={item.country} onChange={e => handleUpdate(item.id, 'country', e.target.value)} className="w-full p-2 border rounded-md text-sm" />
                            </FormField>
                            <FormField label="Source of Income">
                                <select value={item.nature} onChange={e => handleNatureChange(item.id, e.target.value as InternationalIncomeNature)} className="w-full p-2 border rounded-md text-sm">
                                    {natureOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Income outside India (INR)">
                                <input type="text" value={formatInputValue(item.amountInINR)} onChange={e => handleUpdate(item.id, 'amountInINR', parseFormattedValue(e.target.value))} className="w-full p-2 border rounded-md text-sm text-left" />
                            </FormField>
                            <FormField label="Tax paid outside India (INR)">
                                <input type="text" value={formatInputValue(item.taxPaidInINR)} onChange={e => handleUpdate(item.id, 'taxPaidInINR', parseFormattedValue(e.target.value))} className="w-full p-2 border rounded-md text-sm text-left" />
                            </FormField>
                             <FormField label="Tax payable u/s 115JB/JC">
                                <input type="text" value={formatInputValue(item.taxPayableUnder115JBJC)} onChange={e => handleUpdate(item.id, 'taxPayableUnder115JBJC', parseFormattedValue(e.target.value))} className="w-full p-2 border rounded-md text-sm text-left" />
                            </FormField>
                            <div className="flex items-center gap-3 bg-white p-2 border rounded-md h-full mt-auto mb-1">
                                <input type="checkbox" id={`form67Filed_${item.id}`} checked={item.form67Filed} onChange={e => handleUpdate(item.id, 'form67Filed', e.target.checked)} className="h-4 w-4" />
                                <label htmlFor={`form67Filed_${item.id}`} className="text-sm font-medium text-gray-700">Form 67 Filed?</label>
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <h4 className="font-semibold text-gray-700 mb-2">Foreign Tax Credit Details</h4>
                            <div className="flex items-center gap-3 bg-white p-2 border rounded-md mb-3">
                                <input type="checkbox" id={`dtaaApplicable_${item.id}`} checked={item.dtaaApplicable} onChange={e => handleUpdate(item.id, 'dtaaApplicable', e.target.checked)} className="h-4 w-4" />
                                <label htmlFor={`dtaaApplicable_${item.id}`} className="text-sm font-medium text-gray-700">DTAA is Applicable (Credit u/s 90/90A)</label>
                            </div>
                            {item.dtaaApplicable && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Article No. of DTAA">
                                    <input type="text" value={item.applicableDtaaArticle} onChange={e => handleUpdate(item.id, 'applicableDtaaArticle', e.target.value)} className="w-full p-2 border rounded-md text-sm" />
                                </FormField>
                                <FormField label="Rate as per DTAA (%)">
                                    <input type="number" step="0.01" value={item.taxRateAsPerDtaa != null ? item.taxRateAsPerDtaa * 100 : ''} onChange={e => handleUpdate(item.id, 'taxRateAsPerDtaa', e.target.value ? parseFloat(e.target.value)/100 : null)} className="w-full p-2 border rounded-md text-sm text-left" />
                                </FormField>
                            </div>}
                        </div>
                        <div className="border-t pt-4 mt-4">
                             <h4 className="font-semibold text-gray-700 mb-2">Part B Details</h4>
                             <div className="space-y-3">
                                <div className="flex items-center gap-3 bg-white p-2 border rounded-md">
                                    <input type="checkbox" id={`refundClaimed_${item.id}`} checked={item.refundClaimed} onChange={e => handleUpdate(item.id, 'refundClaimed', e.target.checked)} className="h-4 w-4" />
                                    <label htmlFor={`refundClaimed_${item.id}`} className="text-sm font-medium text-gray-700">Has any refund of foreign tax been claimed?</label>
                                </div>
                                {item.refundClaimed && <div className="p-3 border rounded-md bg-white ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Accounting year of loss"><input type="text" value={item.refundDetails?.lossYear ?? ''} onChange={e => handleUpdate(item.id, 'refundDetails.lossYear', e.target.value)} className="w-full p-2 border rounded-md text-sm" /></FormField>
                                    <FormField label="Year(s) of set-off"><input type="text" value={item.refundDetails?.setOffYear ?? ''} onChange={e => handleUpdate(item.id, 'refundDetails.setOffYear', e.target.value)} className="w-full p-2 border rounded-md text-sm" /></FormField>
                                    <FormField label="Refund claimed (₹)"><input type="text" value={formatInputValue(item.refundDetails?.refundAmount)} onChange={e => handleUpdate(item.id, 'refundDetails.refundAmount', parseFormattedValue(e.target.value))} className="w-full p-2 border rounded-md text-sm text-left" /></FormField>
                                    <FormField label="Previous year it relates to"><input type="text" value={item.refundDetails?.previousYearRelates ?? ''} onChange={e => handleUpdate(item.id, 'refundDetails.previousYearRelates', e.target.value)} className="w-full p-2 border rounded-md text-sm" /></FormField>
                                </div>}

                                <div className="flex items-center gap-3 bg-white p-2 border rounded-md">
                                    <input type="checkbox" id={`creditDisputed_${item.id}`} checked={item.creditUnderDispute} onChange={e => handleUpdate(item.id, 'creditUnderDispute', e.target.checked)} className="h-4 w-4" />
                                    <label htmlFor={`creditDisputed_${item.id}`} className="text-sm font-medium text-gray-700">Is the foreign tax credit under dispute?</label>
                                </div>
                                {item.creditUnderDispute && <div className="p-3 border rounded-md bg-white ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField label="Nature and amount of income in dispute"><input type="text" value={item.disputeDetails?.natureAndAmountOfIncome ?? ''} onChange={e => handleUpdate(item.id, 'disputeDetails.natureAndAmountOfIncome', e.target.value)} className="w-full p-2 border rounded-md text-sm" /></FormField>
                                     <FormField label="Amount of tax in dispute (₹)"><input type="text" value={formatInputValue(item.disputeDetails?.amountOfTaxDisputed)} onChange={e => handleUpdate(item.id, 'disputeDetails.amountOfTaxDisputed', parseFormattedValue(e.target.value))} className="w-full p-2 border rounded-md text-sm text-left" /></FormField>
                                </div>}
                             </div>
                        </div>

                    </div>
                ))}
              </div>
                <button onClick={() => dispatch({type: 'ADD_INTERNATIONAL_INCOME'})} className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">Add Foreign Income Source</button>
                
                {internationalIncome.length > 0 && 
                <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2 text-gray-800">FTC Computation Summary</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="p-2 text-left">Country</th>
                                    <th className="p-2 text-right">Indian Tax on Foreign Income</th>
                                    <th className="p-2 text-right">FTC u/s 90/90A (DTAA)</th>
                                    <th className="p-2 text-right">FTC u/s 91 (Non-DTAA)</th>
                                    <th className="p-2 text-right">Total FTC Allowed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {internationalIncome.map(item => {
                                    const itemResult = intlResult.itemized.find(r => r.id === item.id);
                                    if (!itemResult) return <tr key={item.id}><td colSpan={5} className="p-2 text-center text-gray-500">Calculating...</td></tr>;
                                    return (
                                        <tr key={item.id} className="border-b">
                                            <td className="p-2">{item.country || 'N/A'}</td>
                                            <td className="p-2 text-right">{formatCurrency(itemResult.indianTax)}</td>
                                            <td className="p-2 text-right">{formatCurrency(itemResult.ftc90_90A)}</td>
                                            <td className="p-2 text-right">{formatCurrency(itemResult.ftc91)}</td>
                                            <td className="p-2 text-right font-bold">{formatCurrency(itemResult.totalFtc)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                             <tfoot className="font-bold bg-gray-200">
                                <tr>
                                    <td className="p-2 text-left">Total</td>
                                    <td className="p-2 text-right">{formatCurrency(intlResult.taxOnIncome)}</td>
                                    <td colSpan={2} className="p-2"></td>
                                    <td className="p-2 text-right">{formatCurrency(intlResult.totalFtcAllowed)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                     <div className="mt-4 space-y-2 p-4 bg-gray-100 rounded-lg">
                         <div className="flex justify-between font-semibold"><span>Total Net Foreign Income Added</span><span className="font-mono">₹ {formatCurrency(intlResult.netIncomeAdded)}</span></div>
                         <div className="flex justify-between"><span>Total Indian Tax on Foreign Income</span><span className="font-mono">₹ {formatCurrency(intlResult.taxOnIncome)}</span></div>
                         <div className="flex justify-between font-bold text-green-700"><span>Total Foreign Tax Credit (FTC) Allowed</span><span className="font-mono">₹ {formatCurrency(intlResult.totalFtcAllowed)}</span></div>
                    </div>
                </div>
                }
            </Card>
        );
      }
      case 'Set Off and Carry Forward': return (
        <Card title="Loss Details for Set Off & Carry Forward">
            <h3 className="font-semibold text-lg mb-2 text-gray-700">Brought Forward Losses</h3>
            <SingleInputField label="Unabsorbed Depreciation (Sec 32(2))" path="losses.broughtForward.unabsorbedDepreciation" value={taxData.losses.broughtForward.unabsorbedDepreciation} dispatch={dispatch} helpText="Can be set-off against any income except salary."/>
            <SingleInputField label="House Property Loss" path="losses.broughtForward.houseProperty" value={taxData.losses.broughtForward.houseProperty} dispatch={dispatch} helpText="Set-off only against House Property income." />
            <SingleInputField label="Business Loss (Non-speculative)" path="losses.broughtForward.businessNonSpeculative" value={taxData.losses.broughtForward.businessNonSpeculative} dispatch={dispatch} helpText="Set-off only against Business income." />
            <SingleInputField label="Speculative Business Loss" path="losses.broughtForward.businessSpeculative" value={taxData.losses.broughtForward.businessSpeculative} dispatch={dispatch} helpText="Set-off only against Speculative income."/>
            <SingleInputField label="Long-Term Capital Loss" path="losses.broughtForward.ltcl" value={taxData.losses.broughtForward.ltcl} dispatch={dispatch} helpText="Set-off only against Long-Term Capital Gains." />
            <SingleInputField label="Short-Term Capital Loss" path="losses.broughtForward.stcl" value={taxData.losses.broughtForward.stcl} dispatch={dispatch} helpText="Set-off against any Capital Gains." />
            <SingleInputField label="Loss from Owning & Maintaining Race Horses" path="losses.broughtForward.raceHorses" value={taxData.losses.broughtForward.raceHorses} dispatch={dispatch} helpText="Set-off only against same income." />
            
            <h3 className="font-semibold text-lg mt-6 mb-2 text-gray-700 border-t pt-4">Current Year Losses</h3>
            <p className="text-xs text-gray-500 mb-2">Note: Current year House Property loss is calculated automatically from the 'House Property' tab. Enter other current year losses below.</p>
            <SingleInputField label="Business Loss (Non-speculative)" path="losses.currentYear.businessNonSpeculative" value={taxData.losses.currentYear.businessNonSpeculative} dispatch={dispatch} />
            <SingleInputField label="Speculative Business Loss" path="losses.currentYear.businessSpeculative" value={taxData.losses.currentYear.businessSpeculative} dispatch={dispatch} />
            <SingleInputField label="Long-Term Capital Loss" path="losses.currentYear.ltcl" value={taxData.losses.currentYear.ltcl} dispatch={dispatch} />
            <SingleInputField label="Short-Term Capital Loss" path="losses.currentYear.stcl" value={taxData.losses.currentYear.stcl} dispatch={dispatch} />
            <SingleInputField label="Loss from Owning & Maintaining Race Horses" path="losses.currentYear.raceHorses" value={taxData.losses.currentYear.raceHorses} dispatch={dispatch} />
        </Card>
      );
      case 'Deductions': {
        const commonHelpText = "Enter amount of claimed deduction to be disallowed and added to income.";
        return (<>
            <Card title="Additions on Account of Disallowed Chapter VI-A Deductions">
                <div className="p-4 mb-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm rounded-r-lg">
                    <p className="font-bold">Assessing Officer Note:</p>
                    <p>Enter the amount of any deduction claimed by the assessee that is being disallowed. These amounts will be added back to the total income.</p>
                </div>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-md text-gray-800 mb-2">Savings & Investments</h3>
                        <table className="w-full table-fixed">
                            {tableHeader}
                            <tbody>
                                <IncomeTableRow label="u/s 80C, 80CCC, 80CCD(1)" path="deductions.c80" value={taxData.deductions.c80} dispatch={dispatch} helpText={commonHelpText}/>
                                <IncomeTableRow label="u/s 80CCD(1B) - NPS" path="deductions.ccd1b80" value={taxData.deductions.ccd1b80} dispatch={dispatch} helpText={commonHelpText}/>
                                <IncomeTableRow label="u/s 80TTA - Savings Interest" path="deductions.tta80" value={taxData.deductions.tta80} dispatch={dispatch} helpText={commonHelpText}/>
                                <IncomeTableRow label="u/s 80TTB - Sr. Citizen Interest" path="deductions.ttb80" value={taxData.deductions.ttb80} dispatch={dispatch} helpText={commonHelpText}/>
                            </tbody>
                        </table>
                    </div>
                    
                     <div>
                        <h3 className="font-semibold text-md text-gray-800 mb-2 pt-4 border-t">Employer Contributions</h3>
                        <table className="w-full table-fixed">
                            {tableHeader}
                             <tbody>
                                <IncomeTableRow label="u/s 80CCD(2) - Employer NPS" path="deductions.ccd2_80" value={taxData.deductions.ccd2_80} dispatch={dispatch} helpText={commonHelpText}/>
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <h3 className="font-semibold text-md text-gray-800 mb-2 pt-4 border-t">Health & Wellbeing</h3>
                        <table className="w-full table-fixed">
                            {tableHeader}
                            <tbody>
                                <IncomeTableRow label="u/s 80D - Health Insurance" path="deductions.d80" value={taxData.deductions.d80} dispatch={dispatch} helpText={commonHelpText}/>
                                <IncomeTableRow label="u/s 80DD - Disabled Dependent" path="deductions.dd80" value={taxData.deductions.dd80} dispatch={dispatch} helpText={commonHelpText}/>
                                <IncomeTableRow label="u/s 80DDB - Medical Treatment" path="deductions.ddb80" value={taxData.deductions.ddb80} dispatch={dispatch} helpText={commonHelpText}/>
                                <IncomeTableRow label="u/s 80U - Self Disability" path="deductions.u80" value={taxData.deductions.u80} dispatch={dispatch} helpText={commonHelpText}/>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <h3 className="font-semibold text-md text-gray-800 mb-2 pt-4 border-t">Donations</h3>
                        <table className="w-full table-fixed">
                            {tableHeader}
                            <tbody>
                                <IncomeTableRow label="u/s 80G - Donations" path="deductions.g80" value={taxData.deductions.g80} dispatch={dispatch} helpText={commonHelpText}/>
                                <IncomeTableRow label="u/s 80GGA - Scientific Research" path="deductions.gga80" value={taxData.deductions.gga80} dispatch={dispatch} helpText={commonHelpText}/>
                                <IncomeTableRow label="u/s 80GGC - Political Donation" path="deductions.ggc80" value={taxData.deductions.ggc80} dispatch={dispatch} helpText={commonHelpText}/>
                            </tbody>
                        </table>
                    </div>
                     <div>
                        <h3 className="font-semibold text-md text-gray-800 mb-2 pt-4 border-t">Other Deductions</h3>
                        <table className="w-full table-fixed">
                            {tableHeader}
                            <tbody>
                                <IncomeTableRow label="u/s 80E - Education Loan Interest" path="deductions.e80" value={taxData.deductions.e80} dispatch={dispatch} helpText={commonHelpText}/>
                                <IncomeTableRow label="u/s 80GG - Rent Paid" path="deductions.gg80" value={taxData.deductions.gg80} dispatch={dispatch} helpText={commonHelpText}/>
                                <IncomeTableRow label="u/s 80JJAA - New Employment" path="deductions.jjaa80" value={taxData.deductions.jjaa80} dispatch={dispatch} helpText={commonHelpText}/>
                                <IncomeTableRow label="u/s 80QQB - Royalty (Authors)" path="deductions.qqb80" value={taxData.deductions.qqb80} dispatch={dispatch} helpText={commonHelpText}/>
                                <IncomeTableRow label="u/s 80RRB - Royalty (Patents)" path="deductions.rrb80" value={taxData.deductions.rrb80} dispatch={dispatch} helpText={commonHelpText}/>
                                <IncomeTableRow label="u/s 80-IA/IB/P etc. - Business Deductions" path="deductions.ia80" value={taxData.deductions.ia80} dispatch={dispatch} helpText={commonHelpText}/>
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>
        </>);
      }
      case 'Interest & Filing Details': {
        const { interestCalc } = taxData;
        const isPresumptive44AD_ADA = [PresumptiveScheme.AD, PresumptiveScheme.ADA].includes(taxData.pgbp.presumptiveScheme);
        return(<>
            <Card title="Details for Interest Calculation (u/s 234A, 234B, 234C)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-600 font-medium text-sm mb-1">Assessment Type</label>
                        <select 
                            value={interestCalc.assessmentType} 
                            onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'interestCalc.assessmentType', value: e.target.value as AssessmentType}})}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="regular">Regular / Self-Assessment</option>
                            <option value="best_judgment_144">Best Judgment (u/s 144)</option>
                            <option value="reassessment_147_post_assessment">Reassessment (u/s 147)</option>
                        </select>
                    </div>
                    {interestCalc.assessmentType === 'reassessment_147_post_assessment' && 
                        <DateInput 
                            label="Due Date of Notice u/s 148"
                            value={interestCalc.dueDate148Notice ?? ''}
                            onChange={val => dispatch({type: 'UPDATE_FIELD', payload: {path: 'interestCalc.dueDate148Notice', value: val}})}
                        />
                    }
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DateInput 
                            label="Statutory Due Date of Filing"
                            value={interestCalc.dueDateOfFiling}
                            onChange={val => dispatch({type: 'UPDATE_FIELD', payload: {path: 'interestCalc.dueDateOfFiling', value: val}})}
                        />
                        <DateInput 
                            label="Actual Date of Filing"
                            value={interestCalc.actualDateOfFiling}
                            onChange={val => dispatch({type: 'UPDATE_FIELD', payload: {path: 'interestCalc.actualDateOfFiling', value: val}})}
                        />
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold text-lg text-gray-700 mb-3">Advance Tax Installments Paid</h3>
                     {isPresumptive44AD_ADA && (
                        <div className="p-3 mb-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-md">
                            For Presumptive Income under 44AD/ADA, only the last installment (Q4 - March 15th) is applicable.
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <SingleInputField label={isPresumptive44AD_ADA ? "Q1 (Not Applicable)" : "Q1 (by Jun 15)"} path="interestCalc.advanceTaxInstallments.q1" value={interestCalc.advanceTaxInstallments.q1} dispatch={dispatch} />
                        <SingleInputField label={isPresumptive44AD_ADA ? "Q2 (Not Applicable)" : "Q2 (by Sep 15)"} path="interestCalc.advanceTaxInstallments.q2" value={interestCalc.advanceTaxInstallments.q2} dispatch={dispatch} />
                        <SingleInputField label={isPresumptive44AD_ADA ? "Q3 (Not Applicable)" : "Q3 (by Dec 15)"} path="interestCalc.advanceTaxInstallments.q3" value={interestCalc.advanceTaxInstallments.q3} dispatch={dispatch} />
                        <SingleInputField label="Q4 (by Mar 15)" path="interestCalc.advanceTaxInstallments.q4" value={interestCalc.advanceTaxInstallments.q4} dispatch={dispatch} />
                    </div>
                </div>
            </Card>
            <Card title="Interest Calculation Summary">
                <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                            <span className="font-semibold text-gray-700">Interest u/s 234A</span>
                            <span className="text-sm text-gray-500 ml-2">({computationResult.interest.months_234A} months)</span>
                        </div>
                        <span className="font-mono text-gray-800">₹ {formatCurrency(computationResult.interest.u_s_234A)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                            <span className="font-semibold text-gray-700">Interest u/s 234B</span>
                            <span className="text-sm text-gray-500 ml-2">({computationResult.interest.months_234B} months)</span>
                        </div>
                        <span className="font-mono text-gray-800">₹ {formatCurrency(computationResult.interest.u_s_234B)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                            <span className="font-semibold text-gray-700">Interest u/s 234C</span>
                            <span className="text-sm text-gray-500 ml-2">{format234CMonths(computationResult.interest.months_234C)}</span>
                        </div>
                        <span className="font-mono text-gray-800">₹ {formatCurrency(computationResult.interest.u_s_234C)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-200 rounded mt-2 border-t border-gray-300">
                        <span className="font-bold text-lg text-gray-800">Total Interest Payable</span>
                        <span className="font-mono font-bold text-lg text-gray-900">₹ {formatCurrency(computationResult.interest.totalInterest)}</span>
                    </div>
                </div>
            </Card>
        </>);
      }
      case 'Income and Tax Calculator': return <SummaryView data={taxData} result={computationResult} />;
      default: return <div>Select a tab</div>;
    }
  };


  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-gray-800 text-white shadow-md no-print">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-2xl font-bold">AO Tax Tool: <span className="text-blue-300 capitalize">{taxData.taxpayerType.replace('_', ' / ')}</span></h1>
             <div className="flex items-center gap-4">
                <button onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm">Reset</button>
                <div className="text-right">
                    <label htmlFor="ay-select" className="text-xs text-gray-400 block">Assessment Year</label>
                    <select 
                        id="ay-select"
                        value={taxData.assessmentYear}
                        onChange={e => dispatch({type: 'UPDATE_FIELD', payload: {path: 'assessmentYear', value: e.target.value}})}
                        className="bg-gray-700 border border-gray-600 rounded-md p-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        {ASSESSMENT_YEARS.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
            </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
          <nav className="container mx-auto px-2 -mb-px flex space-x-1 sm:space-x-4 overflow-x-auto">
              {dynamicTabs.map(tab => (
                  <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap py-4 px-2 sm:px-3 border-b-2 font-medium text-sm transition-colors duration-200 ${
                          activeTab === tab
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                      {tab}
                  </button>
              ))}
          </nav>
      </div>
       <main className="container mx-auto p-4 md:p-6">
          {renderContent()}
      </main>
    </div>
  );
}
