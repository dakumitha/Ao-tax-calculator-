import { TaxData, TaxRegime, IncomeSource, AdditionItem, PresumptiveScheme, Vehicle44AE, InternationalIncomeItem, InternationalIncomeNature, ComplianceStatus, TrustData, SalaryDetails, HouseProperty } from '../types';
import { FILING_DUE_DATES, YEARLY_CONFIGS, AUDIT_TAXPAYER_TYPES } from '../constants';

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

export const initialTaxData: TaxData = {
  assesseeName: '',
  pan: '',
  assessmentYear: '2026-27',
  taxpayerType: 'individual',
  residentialStatus: 'resident_ordinarily_resident',
  age: 'below60',
  gender: 'male',
  isGovernedByPortugueseCivilCode: false,
  taxRegime: TaxRegime.Old, // Default to Old, as selection is removed. Comparison view handles both.
  companyType: 'domestic',
  companySubType: '',
  firmSubType: 'partnership_firm',
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
    c80: newIncomeSource(), ccd1b80: newIncomeSource(), ccd1b80_minor: newIncomeSource(), ccd2_80: newIncomeSource(), d80: newIncomeSource(), dd80: newIncomeSource(), ddb80: newIncomeSource(), e80: newIncomeSource(), g80: newIncomeSource(), ggc80: newIncomeSource(), tta80: newIncomeSource(), ttb80: newIncomeSource(), u80: newIncomeSource(), jjaa80: newIncomeSource(), gg80: newIncomeSource(), gga80: newIncomeSource(), qqb80: newIncomeSource(), rrb80: newIncomeSource(), ia80: newIncomeSource()
  },
  losses: { 
    broughtForward: { houseProperty: null, businessNonSpeculative: null, businessSpeculative: null, ltcl: null, stcl: null, raceHorses: null, unabsorbedDepreciation: null }, 
    currentYear: { houseProperty: null, businessNonSpeculative: null, businessSpeculative: null, ltcl: null, stcl: null, raceHorses: null } 
  },
  interestCalc: { 
    dueDateOfFiling: FILING_DUE_DATES['2026-27']['non-audit'], 
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

export type Action = 
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


export function taxDataReducer(state: TaxData, action: Action): TaxData {
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