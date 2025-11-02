import { TaxRegime } from './types';

export const ASSESSMENT_YEARS = [
  '2024-25', '2023-24', '2022-23', '2021-22', '2020-21',
  '2019-20', '2018-19', '2017-18', '2016-17', '2015-16',
  '2014-15', '2013-14', '2012-13', '2011-12', '2010-11'
];

export const TABS = [
  'Assessee Details',
  'Salary',
  'House Property',
  'PGBP',
  'Capital Gains',
  'Other Sources',
  'International Income',
  'Set Off and Carry Forward',
  'Deductions',
  'Interest & Filing Details',
  'Income and Tax Calculator',
];

export const FILING_DUE_DATES: { [key: string]: { [key: string]: string } } = {
    '2024-25': { 'non-audit': '2024-07-31', 'audit': '2024-10-31' },
    '2023-24': { 'non-audit': '2023-07-31', 'audit': '2023-10-31' },
    '2022-23': { 'non-audit': '2022-07-31', 'audit': '2022-10-31' },
    '2021-22': { 'non-audit': '2021-07-31', 'audit': '2021-10-31' },
    '2020-21': { 'non-audit': '2020-11-30', 'audit': '2021-01-31' },
    '2019-20': { 'non-audit': '2019-08-31', 'audit': '2019-10-31' },
    '2018-19': { 'non-audit': '2018-07-31', 'audit': '2018-10-31' },
    '2017-18': { 'non-audit': '2017-07-31', 'audit': '2017-10-31' },
    '2016-17': { 'non-audit': '2016-07-31', 'audit': '2016-10-31' },
    '2015-16': { 'non-audit': '2015-08-31', 'audit': '2015-09-30' },
    '2014-15': { 'non-audit': '2014-07-31', 'audit': '2014-09-30' },
    '2013-14': { 'non-audit': '2013-07-31', 'audit': '2013-09-30' },
    '2012-13': { 'non-audit': '2012-07-31', 'audit': '2012-09-30' },
    '2011-12': { 'non-audit': '2011-07-31', 'audit': '2011-09-30' },
    '2010-11': { 'non-audit': '2010-07-31', 'audit': '2010-09-30' },
};

export const AUDIT_TAXPAYER_TYPES = ['company', 'firm', 'llp', 'local authority', 'co-operative society'];


const commonConfig = {
    DEDUCTION_LIMITS: {
      C80: 150000,
      CCD1B80: 50000,
      CCD2_80_PERCENT: 0.10, // 10% of salary
      D80: { self: 25000, senior: 50000, parents: 25000, seniorParents: 50000 },
      DD80: { normal: 75000, severe: 125000 },
      DDB80: { normal: 40000, senior: 100000 },
      U80: { normal: 75000, severe: 125000 },
      TTA80: 10000,
      TTB80: 50000,
      HP_LOSS_SETOFF_LIMIT: 200000,
      HP_INTEREST_DEDUCTION_LIMIT_SOP: 200000,
    },
    TAX_RATES: {
      WINNINGS: 0.30,
      DEEMED_INCOME_115BBE: 0.60,
      DEEMED_INCOME_SURCHARGE: 0.25,
      STCG_111A: 0.15,
      LTCG_112A_EXEMPTION: 100000,
      LTCG_112A_RATE: 0.10,
      LTCG_OTHER_RATE: 0.20,
      FOREIGN_INCOME_115A_DIVIDEND_INTEREST: 0.20,
      FOREIGN_INCOME_115A_ROYALTY_FTS: 0.10,
      FOREIGN_INCOME_115BBA: 0.20,
      FII_FPI_INTEREST_115AD: 0.20,
      FII_FPI_LTCG_115AD: 0.10,
      FII_FPI_STCG_OTHER_115AD: 0.30,
      GDR_FCCB_INCOME_115AC_ACA: 0.10,
      GDR_FCCB_LTCG_115AC_ACA: 0.10,
      OFFSHORE_FUND_UNITS_INCOME_115AB: 0.10,
      OFFSHORE_FUND_UNITS_LTCG_115AB: 0.10,
      SPECIFIED_FUND_UNITS_INCOME_115AE: 0.10,
      AOP_MMR: 0.30,
    },
};

// --- Historical Slabs ---
const slabs_1011_to_1112 = {
    male:      [ { limit: 160000, rate: 0 }, { limit: 500000, rate: 0.10 }, { limit: 800000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
    female:    [ { limit: 190000, rate: 0 }, { limit: 500000, rate: 0.10 }, { limit: 800000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
    senior:    [ { limit: 240000, rate: 0 }, { limit: 500000, rate: 0.10 }, { limit: 800000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
};

const slabs_1213 = {
    male:   [ { limit: 180000, rate: 0 }, { limit: 500000, rate: 0.10 }, { limit: 800000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
    female: [ { limit: 190000, rate: 0 }, { limit: 500000, rate: 0.10 }, { limit: 800000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
    senior: [ { limit: 250000, rate: 0 }, { limit: 500000, rate: 0.10 }, { limit: 800000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
};

const slabs_1314_and_1415 = {
    below60: [ { limit: 200000, rate: 0 }, { limit: 500000, rate: 0.10 }, { limit: 1000000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
    '60to80': [ { limit: 250000, rate: 0 }, { limit: 500000, rate: 0.10 }, { limit: 1000000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
    above80: [ { limit: 500000, rate: 0 }, { limit: 1000000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
};

const coop_slabs = [ { limit: 10000, rate: 0.10 }, { limit: 20000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ];

const slabs_pre_1718 = {
    below60: [ { limit: 250000, rate: 0 }, { limit: 500000, rate: 0.10 }, { limit: 1000000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
    '60to80': [ { limit: 300000, rate: 0 }, { limit: 500000, rate: 0.10 }, { limit: 1000000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
    above80: [ { limit: 500000, rate: 0 }, { limit: 1000000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
};
const slabs_1718 = {
    below60: [ { limit: 250000, rate: 0 }, { limit: 500000, rate: 0.05 }, { limit: 1000000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
    '60to80': [ { limit: 300000, rate: 0 }, { limit: 500000, rate: 0.05 }, { limit: 1000000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
    above80: [ { limit: 500000, rate: 0 }, { limit: 1000000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
};
const slabs_2122_new = {
    below60: [ { limit: 250000, rate: 0 }, { limit: 500000, rate: 0.05 }, { limit: 750000, rate: 0.10 }, { limit: 1000000, rate: 0.15 }, { limit: 1250000, rate: 0.20 }, { limit: 1500000, rate: 0.25 }, { limit: Infinity, rate: 0.30 } ], '60to80': [ { limit: 250000, rate: 0 }, { limit: 500000, rate: 0.05 }, { limit: 750000, rate: 0.10 }, { limit: 1000000, rate: 0.15 }, { limit: 1250000, rate: 0.20 }, { limit: 1500000, rate: 0.25 }, { limit: Infinity, rate: 0.30 } ], above80: [ { limit: 250000, rate: 0 }, { limit: 500000, rate: 0.05 }, { limit: 750000, rate: 0.10 }, { limit: 1000000, rate: 0.15 }, { limit: 1250000, rate: 0.20 }, { limit: 1500000, rate: 0.25 }, { limit: Infinity, rate: 0.30 } ],
};
const slabs_2425_new = {
    below60: [ { limit: 300000, rate: 0 }, { limit: 600000, rate: 0.05 }, { limit: 900000, rate: 0.10 }, { limit: 1200000, rate: 0.15 }, { limit: 1500000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ], '60to80': [ { limit: 300000, rate: 0 }, { limit: 600000, rate: 0.05 }, { limit: 900000, rate: 0.10 }, { limit: 1200000, rate: 0.15 }, { limit: 1500000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ], above80: [ { limit: 300000, rate: 0 }, { limit: 600000, rate: 0.05 }, { limit: 900000, rate: 0.10 }, { limit: 1200000, rate: 0.15 }, { limit: 1500000, rate: 0.20 }, { limit: Infinity, rate: 0.30 } ],
};

const commonSlabbedEntityConfig = (slabs: any, surcharge: any[]) => ({
    SLABS: { [TaxRegime.Old]: slabs, [TaxRegime.New]: {} }, SURCHARGE_RATES: surcharge
});
const commonFlatRateEntityConfig = (rate: number, surcharge: any[]) => ({
    RATE: rate, SURCHARGE_RATES: surcharge
});

const companyConfig1617 = {
    domestic: { RATE: 0.30, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.07 }, { limit: 100000000, rate: 0.12 }] },
    foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.02 }, { limit: 100000000, rate: 0.05 }] }
};


const configs: { [key: string]: any } = {
  '2010-11': {
    ...commonConfig, DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, C80: 100000 }, NEW_REGIME_AVAILABLE: false, TAX_RATES: { ...commonConfig.TAX_RATES, DEEMED_INCOME_115BBE: 0.30, DEEMED_INCOME_SURCHARGE: 0, CESS: 0.03 },
    individual: { DEDUCTION_LIMITS: { STANDARD_DEDUCTION: 0 }, REBATE_87A: { LIMIT: 0, INCOME_CEILING: 0 }, SLABS: { male: slabs_1011_to_1112.male, female: slabs_1011_to_1112.female, senior: slabs_1011_to_1112.senior }, SURCHARGE_RATES: [] },
    huf: { SLABS: { male: slabs_1011_to_1112.male }, SURCHARGE_RATES: [] },
    aop: { SLABS: { male: slabs_1011_to_1112.male }, SURCHARGE_RATES: [] },
    boi: { SLABS: { male: slabs_1011_to_1112.male }, SURCHARGE_RATES: [] },
    'artificial juridical person': { SLABS: { male: slabs_1011_to_1112.male }, SURCHARGE_RATES: [] },
    firm: commonFlatRateEntityConfig(0.30, []), llp: commonFlatRateEntityConfig(0.30, []), 'local authority': commonFlatRateEntityConfig(0.30, []),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [] },
    company: { domestic: { RATE: 0.30, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.10 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.025 }] } },
  },
  '2011-12': {
    ...commonConfig, DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, C80: 100000 }, NEW_REGIME_AVAILABLE: false, TAX_RATES: { ...commonConfig.TAX_RATES, DEEMED_INCOME_115BBE: 0.30, DEEMED_INCOME_SURCHARGE: 0, CESS: 0.03 },
    individual: { DEDUCTION_LIMITS: { STANDARD_DEDUCTION: 0 }, REBATE_87A: { LIMIT: 0, INCOME_CEILING: 0 }, SLABS: { male: slabs_1011_to_1112.male, female: slabs_1011_to_1112.female, senior: slabs_1011_to_1112.senior }, SURCHARGE_RATES: [] },
    huf: { SLABS: { male: slabs_1011_to_1112.male }, SURCHARGE_RATES: [] },
    aop: { SLABS: { male: slabs_1011_to_1112.male }, SURCHARGE_RATES: [] },
    boi: { SLABS: { male: slabs_1011_to_1112.male }, SURCHARGE_RATES: [] },
    'artificial juridical person': { SLABS: { male: slabs_1011_to_1112.male }, SURCHARGE_RATES: [] },
    firm: commonFlatRateEntityConfig(0.30, []), llp: commonFlatRateEntityConfig(0.30, []), 'local authority': commonFlatRateEntityConfig(0.30, []),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [] },
    company: { domestic: { RATE: 0.30, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.075 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.025 }] } },
  },
  '2012-13': {
    ...commonConfig, DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, C80: 100000 }, NEW_REGIME_AVAILABLE: false, TAX_RATES: { ...commonConfig.TAX_RATES, DEEMED_INCOME_115BBE: 0.30, DEEMED_INCOME_SURCHARGE: 0, CESS: 0.03 },
    individual: { DEDUCTION_LIMITS: { STANDARD_DEDUCTION: 0 }, REBATE_87A: { LIMIT: 0, INCOME_CEILING: 0 }, SLABS: { male: slabs_1213.male, female: slabs_1213.female, senior: slabs_1213.senior }, SURCHARGE_RATES: [] },
    huf: { SLABS: { male: slabs_1213.male }, SURCHARGE_RATES: [] },
    aop: { SLABS: { male: slabs_1213.male }, SURCHARGE_RATES: [] },
    boi: { SLABS: { male: slabs_1213.male }, SURCHARGE_RATES: [] },
    'artificial juridical person': { SLABS: { male: slabs_1213.male }, SURCHARGE_RATES: [] },
    firm: commonFlatRateEntityConfig(0.30, []), llp: commonFlatRateEntityConfig(0.30, []), 'local authority': commonFlatRateEntityConfig(0.30, []),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [] },
    company: { domestic: { RATE: 0.30, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.05 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.02 }] } },
  },
  '2013-14': {
    ...commonConfig, DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, C80: 100000 }, NEW_REGIME_AVAILABLE: false, TAX_RATES: { ...commonConfig.TAX_RATES, DEEMED_INCOME_115BBE: 0.30, DEEMED_INCOME_SURCHARGE: 0, CESS: 0.03 },
    individual: { DEDUCTION_LIMITS: { STANDARD_DEDUCTION: 0 }, REBATE_87A: { LIMIT: 2000, INCOME_CEILING: 500000 }, SLABS: { [TaxRegime.Old]: slabs_1314_and_1415 }, SURCHARGE_RATES: [{ limit: 100000000, rate: 0.10 }] },
    huf: { SLABS: { [TaxRegime.Old]: { below60: slabs_1314_and_1415.below60 } }, SURCHARGE_RATES: [{ limit: 100000000, rate: 0.10 }] },
    aop: { SLABS: { [TaxRegime.Old]: { below60: slabs_1314_and_1415.below60 } }, SURCHARGE_RATES: [{ limit: 100000000, rate: 0.10 }] },
    boi: { SLABS: { [TaxRegime.Old]: { below60: slabs_1314_and_1415.below60 } }, SURCHARGE_RATES: [{ limit: 100000000, rate: 0.10 }] },
    'artificial juridical person': { SLABS: { [TaxRegime.Old]: { below60: slabs_1314_and_1415.below60 } }, SURCHARGE_RATES: [{ limit: 100000000, rate: 0.10 }] },
    firm: commonFlatRateEntityConfig(0.30, []), llp: commonFlatRateEntityConfig(0.30, []), 
    'local authority': commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.10 }]),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.10 }] },
    company: { domestic: { RATE: 0.30, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.05 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.02 }, { limit: 100000000, rate: 0.05 }] } },
  },
  '2014-15': {
    ...commonConfig, DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, C80: 100000 }, NEW_REGIME_AVAILABLE: false, TAX_RATES: { ...commonConfig.TAX_RATES, DEEMED_INCOME_115BBE: 0.30, DEEMED_INCOME_SURCHARGE: 0, CESS: 0.03 },
    individual: { DEDUCTION_LIMITS: { STANDARD_DEDUCTION: 0 }, REBATE_87A: { LIMIT: 2000, INCOME_CEILING: 500000 }, SLABS: { [TaxRegime.Old]: slabs_1314_and_1415 }, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.10 }] },
    huf: { SLABS: { [TaxRegime.Old]: { below60: slabs_1314_and_1415.below60 } }, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.10 }] },
    aop: { SLABS: { [TaxRegime.Old]: { below60: slabs_1314_and_1415.below60 } }, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.10 }] },
    boi: { SLABS: { [TaxRegime.Old]: { below60: slabs_1314_and_1415.below60 } }, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.10 }] },
    'artificial juridical person': { SLABS: { [TaxRegime.Old]: { below60: slabs_1314_and_1415.below60 } }, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.10 }] },
    firm: commonFlatRateEntityConfig(0.30, []), llp: commonFlatRateEntityConfig(0.30, []),
    'local authority': commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.10 }]),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.10 }] },
    company: { domestic: { RATE: 0.30, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.05 }, { limit: 100000000, rate: 0.10 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.02 }, { limit: 100000000, rate: 0.05 }] } },
  },
  '2015-16': {
    ...commonConfig,
    NEW_REGIME_AVAILABLE: false,
    TAX_RATES: { ...commonConfig.TAX_RATES, DEEMED_INCOME_115BBE: 0.30, DEEMED_INCOME_SURCHARGE: 0, CESS: 0.03 },
    individual: { DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, STANDARD_DEDUCTION: 0 }, REBATE_87A: { LIMIT: 2000, INCOME_CEILING: 500000 }, ...commonSlabbedEntityConfig(slabs_pre_1718, [{ limit: 10000000, rate: 0.12 }]) },
    huf: commonSlabbedEntityConfig({ below60: slabs_pre_1718.below60 }, [{ limit: 10000000, rate: 0.12 }]), aop: commonSlabbedEntityConfig({ below60: slabs_pre_1718.below60 }, [{ limit: 10000000, rate: 0.12 }]), boi: commonSlabbedEntityConfig({ below60: slabs_pre_1718.below60 }, [{ limit: 10000000, rate: 0.12 }]), 'artificial juridical person': commonSlabbedEntityConfig({ below60: slabs_pre_1718.below60 }, [{ limit: 10000000, rate: 0.12 }]),
    firm: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), llp: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), 'local authority': commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.12 }] },
    company: { domestic: { RATE: 0.30, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.07 }, { limit: 100000000, rate: 0.12 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.02 }, { limit: 100000000, rate: 0.05 }] } }
  },
  '2016-17': {
    ...commonConfig,
    NEW_REGIME_AVAILABLE: false,
    TAX_RATES: { ...commonConfig.TAX_RATES, DEEMED_INCOME_115BBE: 0.30, DEEMED_INCOME_SURCHARGE: 0, CESS: 0.03 },
    individual: { DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, STANDARD_DEDUCTION: 0 }, REBATE_87A: { LIMIT: 5000, INCOME_CEILING: 500000 }, ...commonSlabbedEntityConfig(slabs_pre_1718, [{ limit: 10000000, rate: 0.15 }]) },
    huf: commonSlabbedEntityConfig({ below60: slabs_pre_1718.below60 }, [{ limit: 10000000, rate: 0.15 }]), aop: commonSlabbedEntityConfig({ below60: slabs_pre_1718.below60 }, [{ limit: 10000000, rate: 0.15 }]), boi: commonSlabbedEntityConfig({ below60: slabs_pre_1718.below60 }, [{ limit: 10000000, rate: 0.15 }]), 'artificial juridical person': commonSlabbedEntityConfig({ below60: slabs_pre_1718.below60 }, [{ limit: 10000000, rate: 0.15 }]),
    firm: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), llp: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), 'local authority': commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.12 }] },
    company: companyConfig1617,
  },
  '2017-18': {
    ...commonConfig,
    NEW_REGIME_AVAILABLE: false,
    TAX_RATES: { ...commonConfig.TAX_RATES, CESS: 0.03 },
    individual: { DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, STANDARD_DEDUCTION: 0 }, REBATE_87A: { LIMIT: 2500, INCOME_CEILING: 350000 }, ...commonSlabbedEntityConfig(slabs_1718, [{ limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }]) },
    huf: commonSlabbedEntityConfig({ below60: slabs_1718.below60 }, [{ limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }]), aop: commonSlabbedEntityConfig({ below60: slabs_1718.below60 }, [{ limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }]), boi: commonSlabbedEntityConfig({ below60: slabs_1718.below60 }, [{ limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }]), 'artificial juridical person': commonSlabbedEntityConfig({ below60: slabs_1718.below60 }, [{ limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }]),
    firm: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), llp: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), 'local authority': commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.12 }] },
    company: { domestic: { turnoverBasedRates: { threshold: 50000000, rate_lte: 0.29, rate_gt: 0.30 }, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.07 }, { limit: 100000000, rate: 0.12 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.02 }, { limit: 100000000, rate: 0.05 }] } }
  },
   '2018-19': {
    ...commonConfig,
    NEW_REGIME_AVAILABLE: false,
    TAX_RATES: { ...commonConfig.TAX_RATES, CESS: 0.04 },
    individual: { DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, STANDARD_DEDUCTION: 40000 }, REBATE_87A: { LIMIT: 2500, INCOME_CEILING: 350000 }, ...commonSlabbedEntityConfig(slabs_1718, [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 } ]) },
    huf: commonSlabbedEntityConfig({ below60: slabs_1718.below60 }, [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 } ]), aop: commonSlabbedEntityConfig({ below60: slabs_1718.below60 }, [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 } ]), boi: commonSlabbedEntityConfig({ below60: slabs_1718.below60 }, [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 } ]), 'artificial juridical person': commonSlabbedEntityConfig({ below60: slabs_1718.below60 }, [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 } ]),
    firm: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), llp: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), 'local authority': commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.12 }] },
    company: { domestic: { turnoverBasedRates: { threshold: 2500000000, rate_lte: 0.25, rate_gt: 0.30 }, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.07 }, { limit: 100000000, rate: 0.12 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.02 }, { limit: 100000000, rate: 0.05 }] } }
  },
  '2019-20': {
    ...commonConfig,
    NEW_REGIME_AVAILABLE: false,
    TAX_RATES: { ...commonConfig.TAX_RATES, CESS: 0.04 },
    individual: { DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, STANDARD_DEDUCTION: 50000 }, REBATE_87A: { LIMIT: 12500, INCOME_CEILING: 500000 }, ...commonSlabbedEntityConfig(slabs_1718, [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 } ]) },
    huf: commonSlabbedEntityConfig({ below60: slabs_1718.below60 }, [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 } ]), aop: commonSlabbedEntityConfig({ below60: slabs_1718.below60 }, [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 } ]), boi: commonSlabbedEntityConfig({ below60: slabs_1718.below60 }, [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 } ]), 'artificial juridical person': commonSlabbedEntityConfig({ below60: slabs_1718.below60 }, [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 } ]),
    firm: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), llp: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), 'local authority': commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.12 }] },
    company: { domestic: { turnoverBasedRates: { threshold: 4000000000, rate_lte: 0.25, rate_gt: 0.30 }, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.07 }, { limit: 100000000, rate: 0.12 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.02 }, { limit: 100000000, rate: 0.05 }] } }
  },
  '2020-21': {
    ...commonConfig,
    NEW_REGIME_AVAILABLE: true,
    TAX_RATES: { ...commonConfig.TAX_RATES, CESS: 0.04 },
    individual: { DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, STANDARD_DEDUCTION: 50000 }, REBATE_87A: { LIMIT: 12500, INCOME_CEILING: 500000 }, SLABS: { [TaxRegime.Old]: slabs_1718, [TaxRegime.New]: slabs_2122_new }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ]},
    huf: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] }, aop: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] }, boi: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] }, 'artificial juridical person': { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] },
    firm: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), llp: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), 'local authority': commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.12 }] },
    company: { domestic: { turnoverBasedRates: { threshold: 4000000000, rate_lte: 0.25, rate_gt: 0.30 }, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.07 }, { limit: 100000000, rate: 0.12 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.02 }, { limit: 100000000, rate: 0.05 }] } }
  },
  '2021-22': {
    ...commonConfig,
    NEW_REGIME_AVAILABLE: true,
    TAX_RATES: { ...commonConfig.TAX_RATES, CESS: 0.04 },
    individual: { DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, STANDARD_DEDUCTION: 50000 }, REBATE_87A: { LIMIT: 12500, INCOME_CEILING: 500000 }, REBATE_87A_NEW: { LIMIT: 12500, INCOME_CEILING: 500000 }, SLABS: { [TaxRegime.Old]: slabs_1718, [TaxRegime.New]: slabs_2122_new }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ], SURCHARGE_RATES_NEW: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ], },
    huf: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] }, aop: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] }, boi: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] }, 'artificial juridical person': { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] },
    firm: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), llp: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), 'local authority': commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.12 }] },
    company: { domestic: { turnoverBasedRates: { threshold: 4000000000, rate_lte: 0.25, rate_gt: 0.30 }, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.07 }, { limit: 100000000, rate: 0.12 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.02 }, { limit: 100000000, rate: 0.05 }] } }
  },
  '2022-23': {
    ...commonConfig,
    NEW_REGIME_AVAILABLE: true,
    TAX_RATES: { ...commonConfig.TAX_RATES, CESS: 0.04 },
    individual: { DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, STANDARD_DEDUCTION: 50000 }, REBATE_87A: { LIMIT: 12500, INCOME_CEILING: 500000 }, REBATE_87A_NEW: { LIMIT: 12500, INCOME_CEILING: 500000 }, SLABS: { [TaxRegime.Old]: slabs_1718, [TaxRegime.New]: slabs_2122_new }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ], SURCHARGE_RATES_NEW: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ], },
    huf: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] }, aop: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] }, boi: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] }, 'artificial juridical person': { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] },
    firm: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), llp: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), 'local authority': commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.12 }] },
    company: { domestic: { turnoverBasedRates: { threshold: 4000000000, rate_lte: 0.25, rate_gt: 0.30 }, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.07 }, { limit: 100000000, rate: 0.12 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.02 }, { limit: 100000000, rate: 0.05 }] } }
  },
  '2023-24': {
    ...commonConfig,
    NEW_REGIME_AVAILABLE: true,
    TAX_RATES: { ...commonConfig.TAX_RATES, CESS: 0.04 },
    individual: { DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, STANDARD_DEDUCTION: 50000 }, REBATE_87A: { LIMIT: 12500, INCOME_CEILING: 500000 }, REBATE_87A_NEW: { LIMIT: 12500, INCOME_CEILING: 500000 }, SLABS: { [TaxRegime.Old]: slabs_1718, [TaxRegime.New]: slabs_2122_new }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ], SURCHARGE_RATES_NEW: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ], },
    huf: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] }, aop: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] }, boi: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] }, 'artificial juridical person': { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2122_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ] },
    firm: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), llp: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), 'local authority': commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.12 }] },
    company: { domestic: { turnoverBasedRates: { threshold: 4000000000, rate_lte: 0.25, rate_gt: 0.30 }, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.07 }, { limit: 100000000, rate: 0.12 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.02 }, { limit: 100000000, rate: 0.05 }] } }
  },
  '2024-25': {
    ...commonConfig,
    NEW_REGIME_AVAILABLE: true,
    TAX_RATES: { ...commonConfig.TAX_RATES, CESS: 0.04 },
    individual: { DEDUCTION_LIMITS: { ...commonConfig.DEDUCTION_LIMITS, STANDARD_DEDUCTION: 50000, STANDARD_DEDUCTION_NEW_REGIME: 50000 }, REBATE_87A: { LIMIT: 12500, INCOME_CEILING: 500000 }, REBATE_87A_NEW: { LIMIT: 25000, INCOME_CEILING: 700000 }, SLABS: { [TaxRegime.Old]: slabs_1718, [TaxRegime.New]: slabs_2425_new }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ], SURCHARGE_RATES_NEW: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: Infinity, rate: 0.25 } ], },
    huf: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2425_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ], },
    aop: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2425_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ], },
    boi: { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2425_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ], },
   'artificial juridical person': { SLABS: { [TaxRegime.Old]: { below60: slabs_1718.below60 }, [TaxRegime.New]: { below60: slabs_2425_new.below60 } }, SURCHARGE_RATES: [ { limit: 5000000, rate: 0.10 }, { limit: 10000000, rate: 0.15 }, { limit: 20000000, rate: 0.25 }, { limit: 50000000, rate: 0.37 } ], },
    firm: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), llp: commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]), 'local authority': commonFlatRateEntityConfig(0.30, [{ limit: 10000000, rate: 0.12 }]),
    'co-operative society': { SLABS: coop_slabs, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.12 }] },
    company: { domestic: { turnoverBasedRates: { threshold: 4000000000, rate_lte: 0.25, rate_gt: 0.30 }, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.07 }, { limit: 100000000, rate: 0.12 }] }, foreign: { RATE: 0.40, SURCHARGE_RATES: [{ limit: 10000000, rate: 0.02 }, { limit: 100000000, rate: 0.05 }] } }
  }
};

export const YEARLY_CONFIGS = configs;
