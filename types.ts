

export enum TaxRegime {
  Old = 'Old',
  New = 'New',
}

export type ResidentialStatus = 'resident_ordinarily_resident' | 'resident_not_ordinarily_resident' | 'non_resident';

export interface AdditionItem {
  id: string;
  amount: number | null;
  location: 'India' | 'Outside India';
}

export interface IncomeSource {
  additions: AdditionItem[];
}

export interface SalaryDetails {
  employeeType: 'government' | 'non-government';
  wasStandardDeductionAllowedPreviously: boolean;
  // Sec 17(1) - Salary Components
  basicSalary: IncomeSource;
  allowances: IncomeSource;
  bonusAndCommission: IncomeSource;

  // Sec 17(2) - Perquisites
  perquisites: {
      rentFreeAccommodation: IncomeSource;
      motorCar: IncomeSource;
      otherPerquisites: IncomeSource;
  };

  // Sec 17(3) - Profits in Lieu of Salary
  profitsInLieu: {
      terminationCompensation: IncomeSource;
      commutedPension: IncomeSource;
      retrenchmentCompensation: IncomeSource;
      vrsCompensation: IncomeSource;
      otherProfitsInLieu: IncomeSource;
  };

  // Sec 10 - Exemptions (treated as reductions)
  exemptions: {
    hra: IncomeSource; // 10(13A)
    lta: IncomeSource; // 10(5)
    gratuity: IncomeSource; // 10(10)
    leaveEncashment: IncomeSource; // 10(10AA)
    commutedPension: IncomeSource; // 10(10A)
    retrenchmentCompensation: IncomeSource; // 10(10B)
    vrsCompensation: IncomeSource; // 10(10C)
    providentFund: IncomeSource; // 10(11), 10(12)
    superannuationFund: IncomeSource; // 10(13)
    specialAllowances: IncomeSource; // 10(14)
    otherExemptions: IncomeSource;
  };

  // Sec 16 - Deductions (treated as reductions)
  deductions: {
    professionalTax: IncomeSource;
    entertainmentAllowance: IncomeSource;
  };
}


export interface HouseProperty {
  id: string;
  grossRent: IncomeSource;
  municipalTaxes: IncomeSource;
  interestOnLoan: IncomeSource;
  isSelfOccupied: boolean;
}

export enum PresumptiveScheme {
    None = 'None',
    AD = '44AD',
    ADA = '44ADA',
    AE = '44AE',
    B = '44B',
    BB = '44BB',
    BBA = '44BBA',
    BBB = '44BBB',
}

export interface Vehicle44AE {
    id: string;
    type: 'heavy' | 'other';
    tonnage: number | null;
    months: number | null;
}

export interface PGBP {
  isControlledFromIndia: boolean;
  // Regular PGBP
  netProfit: IncomeSource;
  // This will remain separate as presumptive income is non-speculative
  speculativeIncome: IncomeSource;
  
  // Additions to profit
  additions: {
    // Income Additions
    unreportedSales: IncomeSource;
    unaccountedBusinessIncome: IncomeSource;
    bogusPurchases: IncomeSource;
    unrecordedCredits: IncomeSource;
    gpNpRatioDifference: IncomeSource;
    stockSuppression: IncomeSource;
    
    // Expense Disallowances
    disallowance36_employeeContrib: IncomeSource;
    disallowance36_1_vii_provisions: IncomeSource;
    disallowance36_1_iii_interest: IncomeSource;
    disallowance37_1_nonBusiness: IncomeSource;
    disallowance37_1_personal: IncomeSource;
    disallowance37_1_capital: IncomeSource;
    disallowance40a_tds: IncomeSource;
    disallowance40b_partnerPayments: IncomeSource;
    disallowance40A2_relatedParty: IncomeSource;
    disallowance40A3_cashPayment: IncomeSource;
    disallowance40A7_gratuity: IncomeSource;
    disallowance40A9_unapprovedFunds: IncomeSource;
    disallowance43B_statutoryDues: IncomeSource;
    disallowance14A_exemptIncome: IncomeSource;
    
    // Other Additions
    incorrectDepreciation: IncomeSource;
    unexplainedExpenditure: IncomeSource;
    otherDisallowances: IncomeSource;
  };

  // Presumptive Taxation
  presumptiveScheme: PresumptiveScheme;

  // 44AD
  turnover44AD_digital: IncomeSource;
  turnover44AD_other: IncomeSource;

  // 44ADA
  grossReceipts44ADA: IncomeSource;

  // 44AE
  vehicles44AE: Vehicle44AE[];

  // Others
  aggregateReceipts44B: IncomeSource;
  aggregateReceipts44BB: IncomeSource;
  aggregateReceipts44BBA: IncomeSource;
  aggregateReceipts44BBB: IncomeSource;
}

export interface CapitalGains {
  stcg111A: IncomeSource;
  stcgOther: IncomeSource;
  ltcg112A: IncomeSource;
  ltcgOther: IncomeSource;
  adjustment50C: IncomeSource;
  costOfImprovement: IncomeSource;
  exemption54: IncomeSource;
  exemption54B_ltcg: IncomeSource;
  exemption54B_stcg: IncomeSource;
  exemption54D: IncomeSource;
  exemption54EC: IncomeSource;
  exemption54EE: IncomeSource;
  exemption54F: IncomeSource;
  exemption54G: IncomeSource;
  exemption54GA: IncomeSource;
  exemption54GB: IncomeSource;
  adjustment50: IncomeSource;
  adjustment50CA: IncomeSource;
  adjustment50D: IncomeSource;
  adjustment43CA: IncomeSource;
}

export interface OtherSources {
  otherIncomes: IncomeSource;
  winnings: IncomeSource;
  exemptIncome: IncomeSource; // Agricultural
  otherExemptIncomeSec10: IncomeSource;
  disallowance14A: IncomeSource;
  deemedDividend2_22_e: IncomeSource;
  gifts56_2_x: IncomeSource;
  familyPension: IncomeSource;
  interestOnEnhancedCompensation: IncomeSource;
  raceHorseIncome: IncomeSource;
}

export interface DeemedIncome {
    sec68_cashCredits: IncomeSource;
    sec69_unexplainedInvestments: IncomeSource;
    sec69A_unexplainedMoney: IncomeSource;
    sec69B_investmentsNotDisclosed: IncomeSource;
    sec69C_unexplainedExpenditure: IncomeSource;
    sec69D_hundiBorrowing: IncomeSource;
}

export interface Deductions {
  c80: IncomeSource; // 80C, 80CCC, 80CCD(1)
  ccd1b80: IncomeSource; // 80CCD(1B) - NPS Contribution
  ccd1b80_minor: IncomeSource; // 80CCD(1B) - For Minor
  ccd2_80: IncomeSource; // 80CCD(2) - Employer NPS Contribution
  d80: IncomeSource; // 80D - Health Insurance Premium
  dd80: IncomeSource; // 80DD - Disabled Dependent
  ddb80: IncomeSource; // 80DDB - Medical Treatment
  e80: IncomeSource; // 80E - Interest on Education Loan
  g80: IncomeSource; // 80G - Donations
  gg80: IncomeSource; // 80GG - Rent Paid
  gga80: IncomeSource; // 80GGA - Donation for Scientific Research
  ggc80: IncomeSource; // 80GGC - Donation to Political Parties
  tta80: IncomeSource; // 80TTA - Interest on Savings Account
  ttb80: IncomeSource; // 80TTB - Interest for Senior Citizens
  u80: IncomeSource; // 80U - Self Disability
  jjaa80: IncomeSource; // 80JJAA - New Employment
  qqb80: IncomeSource; // 80QQB - Royalty Income of Authors
  rrb80: IncomeSource; // 80RRB - Royalty on Patents
  ia80: IncomeSource; // 80IA/IB/P etc. - Business Deductions
}

export interface Losses {
  broughtForward: {
    houseProperty: number | null;
    businessNonSpeculative: number | null;
    businessSpeculative: number | null;
    ltcl: number | null;
    stcl: number | null;
    raceHorses: number | null;
    unabsorbedDepreciation: number | null;
  };
  currentYear: {
    houseProperty: number | null; // auto-calculated
    businessNonSpeculative: number | null;
    businessSpeculative: number | null;
    ltcl: number | null;
    stcl: number | null;
    raceHorses: number | null;
  };
}


export type AssessmentType = 'regular' | 'best_judgment_144' | 'reassessment_147_post_assessment';

export interface InterestCalculation {
    dueDateOfFiling: string;
    actualDateOfFiling: string;
    assessmentType: AssessmentType;
    dueDate148Notice?: string;
    taxOnEarlierAssessment?: number | null;
    incomeAsPerEarlierAssessment?: number | null;
    noReturnFurnishedForReassessment?: boolean;
    advanceTaxInstallments: {
        q1: number | null; // Jun 15
        q2: number | null; // Sep 15
        q3: number | null; // Dec 15
        q4: number | null; // Mar 15
    }
}

export enum InternationalIncomeNature {
    Salary = 'Salary',
    HouseProperty = 'House property',
    BusinessProfessionalIncome = 'Business/professional income',
    LongTermCapitalGain = 'Long term capital gain',
    ShortTermCapitalGain = 'Short term capital gain',
    InterestIncome = 'Interest income',
    Dividend = 'Dividend',
    Royalty = 'Royalty not being part of business income',
    FeesForTechnicalServices = 'Fees for technical services not being part of business income',
    Others = 'Others (specify)',
}


export enum ComplianceStatus {
    Compliant = 'Compliant',
    NotApplicable = 'Not Applicable',
    DeviationFound = 'Deviation Found (TPO Reference)',
    NotFiled = 'Form 3CEB Not Filed',
}

export interface TransferPricingDetails {
    isAssociatedEnterprise: boolean;
    armsLengthPrice: number | null;
    form3CEBStatus: ComplianceStatus;
}

export interface InternationalIncomeItem {
    id: string;
    country: string;
    nature: InternationalIncomeNature;
    amountInINR: number | null;
    taxPaidInINR: number | null;
    taxRateOutsideIndia: number | null; // As a decimal
    taxPayableUnder115JBJC: number | null;
    dtaaApplicable: boolean;
    applicableDtaaArticle: string;
    taxRateAsPerDtaa: number | null; // As a decimal, e.g., 0.15 for 15%
    isLTCG: boolean;
    specialSection: 'None' | '115A' | '115AB' | '115AC' | '115AD' | '115AE' | '115ACA' | '115BBA';
    transferPricing: TransferPricingDetails;
    form67Filed: boolean;
    // New fields from Form 67 Part B
    refundClaimed: boolean;
    refundDetails?: {
        lossYear: string;
        setOffYear: string;
        refundAmount: number | null;
        previousYearRelates: string;
    };
    creditUnderDispute: boolean;
    disputeDetails?: {
        natureAndAmountOfIncome: string;
        amountOfTaxDisputed: number | null;
    };
}

export interface TrustData {
    disallowedReceipts12A: IncomeSource;
    disallowedReceipts10_23C: IncomeSource;
}

export interface TrustComputationResult {
    typeOfTrust: string;
    sectionApplied: string;
    totalIncomeBeforeExemption: number;
    exemptIncome: number;
    taxableIncome: number;
    applicableRate: number; // as decimal
    applicableRateDisplay: string;
    violationFlags: string[];
    finalTax: number;
}


export interface TaxData {
  assesseeName: string;
  pan: string;
  assessmentYear: string;
  taxpayerType: 'individual' | 'huf' | 'company' | 'firm' | 'llp' | 'aop' | 'boi' | 'local authority' | 'artificial juridical person' | 'trust' | 'exempt_entity' | 'co-operative society';
  residentialStatus: ResidentialStatus;
  companyType?: 'domestic' | 'foreign';
  companySubType?: string;
  firmSubType?: 'partnership_firm' | 'llp_firm';
  previousYearTurnover?: number | null;
  age: 'below60' | '60to80' | 'above80';
  gender?: 'male' | 'female';
  isGovernedByPortugueseCivilCode?: boolean;
  taxRegime: TaxRegime;
  
  trustData: TrustData;

  salary: SalaryDetails;
  houseProperty: HouseProperty[];
  pgbp: PGBP;
  capitalGains: CapitalGains;
  otherSources: OtherSources;
  deemedIncome: DeemedIncome;
  internationalIncome: InternationalIncomeItem[];
  deductions: Deductions;
  losses: Losses;
  interestCalc: InterestCalculation;
  tds: number | null;
  advanceTax: number | null;
}

export interface HeadWiseIncome {
    salary: number;
    houseProperty: number;
    pgbp: number;
    capitalGains: number;
    otherSources: number;
    deemed: number;
}
export interface CapitalGainsBreakdown {
    stcg111A: number;
    stcgOther: number;
    ltcg112A: number;
    ltcgOther: number;
}


export interface InterestResult {
    u_s_234A: number;
    u_s_234B: number;
    u_s_234C: number;
    totalInterest: number;
    months_234A: number;
    months_234B: number;
    months_234C: {
        q1: number; // 0 or 3
        q2: number; // 0 or 3
        q3: number; // 0 or 3
        q4: number; // 0 or 1
    };
}

export interface DetailedIncomeBreakdown {
    baseAmount: number;
    totalAdditions: number;
    assessed: number;
}

export interface SetOffDetail {
    source: string;
    against: string;
    amount: number;
}

export interface InternationalIncomeComputation {
    id: string;
    country: string;
    nature: InternationalIncomeNature;
    amountInINR: number;
    taxPaidInINR: number;
    applicableRule: string;
    indianTax: number;
    ftc90_90A: number;
    ftc91: number;
    totalFtc: number;
    netTax: number;
    applicableRate: number;
}

export interface ComputationResult {
  grossTotalIncome: number;
  totalDeductions: number;
  netTaxableIncome: number;
  agriculturalIncome: number;
  taxLiability: number; // Base tax on total income
  surcharge: number; // Net surcharge after marginal relief
  marginalRelief: number;
  healthAndEducationCess: number;
  totalTaxPayable: number;
  rebate87A: number;
  relief: number; // Reliefs u/s 89, 90, 91
  tds: number;
  advanceTax: number;
  netPayable: number;
  interest: InterestResult;
  trustComputation: TrustComputationResult | null;
  breakdown: {
    income: {
      salary: DetailedIncomeBreakdown;
      houseProperty: DetailedIncomeBreakdown;
      pgbp: DetailedIncomeBreakdown & { netProfit: number };
      capitalGains: DetailedIncomeBreakdown;
      capitalGainsBreakdown: CapitalGainsBreakdown; // This remains based on assessed values
      otherSources: DetailedIncomeBreakdown;
      winnings: DetailedIncomeBreakdown;
      deemed: number; // Deemed income is always an addition
      international: {
          netIncomeAdded: number;
          taxOnIncome: number;
          totalFtcAllowed: number;
          itemized: InternationalIncomeComputation[];
      };
    },
    tax: {
        onNormalIncome: number;
        onSTCG111A: number;
        onLTCG112A: number;
        onLTCGOther: number;
        onWinnings: number;
        onDeemedIncome: number;
        onForeignIncome: number;
    },
    surchargeBreakdown: {
        onDeemedIncome: number;
        onOtherIncomeGross: number;
    },
    standardDeduction: number;
    professionalTax: number;
    entertainmentAllowance: number;
    nav: number;
    standardDeduction24a: number;
  };
  setOffSummary: SetOffDetail[];
  lossesCarriedForward: {
    houseProperty: number;
    businessNonSpeculative: number;
    businessSpeculative: number;
    ltcl: number;
    stcl: number;
    raceHorses: number;
    unabsorbedDepreciation: number;
  };
}