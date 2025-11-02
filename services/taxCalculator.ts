
import { TaxData, ComputationResult, CapitalGainsBreakdown, TaxRegime, InterestResult, IncomeSource, DetailedIncomeBreakdown, SetOffDetail, PresumptiveScheme, ResidentialStatus, AdditionItem, InternationalIncomeNature, InternationalIncomeItem, InternationalIncomeComputation, TrustData, TrustComputationResult } from '../types';
import { YEARLY_CONFIGS } from '../constants';

const getTaxableValue = (
    source: IncomeSource | undefined,
    residentialStatus: ResidentialStatus,
    isPgbpControlledFromIndia: boolean = false,
    incomeType: 'pgbp' | 'other' = 'other'
): number => {
    if (!source || !source.additions) return 0;
    
    const taxableItems = source.additions.filter((item: AdditionItem) => {
        switch (residentialStatus) {
            case 'resident_ordinarily_resident':
                return true;
            case 'resident_not_ordinarily_resident':
                return item.location === 'India' || (incomeType === 'pgbp' && isPgbpControlledFromIndia);
            case 'non_resident':
                return item.location === 'India';
            default:
                return false;
        }
    });

    return taxableItems.reduce((acc, item) => acc + (item.amount ?? 0), 0);
};


// Helper to get a breakdown of an income source
const getIncomeSourceBreakdown = (assessedValue: number): DetailedIncomeBreakdown => {
    return { baseAmount: 0, totalAdditions: assessedValue, assessed: assessedValue };
};


function calculateHousePropertyIncome(
    hpData: TaxData['houseProperty'],
    residentialStatus: ResidentialStatus,
    yearConfig: any 
): { income: number, breakdown: DetailedIncomeBreakdown, nav: number, standardDeduction24a: number } {
    const assessedGrossRent = getTaxableValue(hpData.grossRent, residentialStatus);
    const assessedMunicipalTaxes = getTaxableValue(hpData.municipalTaxes, residentialStatus);
    const assessedInterest = getTaxableValue(hpData.interestOnLoan, residentialStatus);

    let nav = 0;
    let standardDeduction24a = 0;
    let interestDeduction24b = 0;
    let income = 0;

    if (hpData.isSelfOccupied) {
        // GAV and NAV are nil for self-occupied property as per Sec 23(2)
        nav = 0;
        standardDeduction24a = 0;
        // Interest deduction u/s 24(b) is capped for SOP
        const limit = yearConfig.DEDUCTION_LIMITS.HP_INTEREST_DEDUCTION_LIMIT_SOP || 200000;
        interestDeduction24b = Math.min(assessedInterest, limit);
        income = nav - standardDeduction24a - interestDeduction24b;
    } else { // Let-out property
        const gav = assessedGrossRent; // Assuming Gross Rent is GAV for simplicity
        nav = Math.max(0, gav - assessedMunicipalTaxes);
        standardDeduction24a = nav * 0.30; // 30% of NAV u/s 24(a)
        interestDeduction24b = assessedInterest; // No limit on interest for LOP
        income = nav - standardDeduction24a - interestDeduction24b;
    }
    
    const finalIncome = Math.round(income);
    const breakdown: DetailedIncomeBreakdown = {
        baseAmount: 0,
        totalAdditions: finalIncome,
        assessed: finalIncome,
    };

    return { income: finalIncome, breakdown, nav: Math.round(nav), standardDeduction24a: Math.round(standardDeduction24a) };
}


function parseYYYYMMDD(dateStr: string | undefined): Date {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(NaN);
    
    const [year, month, day] = dateStr.split('-').map(Number);

    // Month is 1-indexed in string, 0-indexed in Date.UTC
    const date = new Date(Date.UTC(year, month - 1, day));
    
    // Final validation to ensure date is valid
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        return new Date(NaN);
    }
    return date;
}


function calculateInterestMonths(periodStartDate: Date, periodEndDate: Date): number {
    // Calculates interest months using UTC to avoid timezone issues. 
    // Any part of a month is treated as a full month.
    if (periodEndDate < periodStartDate || isNaN(periodStartDate.getTime()) || isNaN(periodEndDate.getTime())) {
        return 0;
    }

    const startYear = periodStartDate.getUTCFullYear();
    const startMonth = periodStartDate.getUTCMonth();
    const endYear = periodEndDate.getUTCFullYear();
    const endMonth = periodEndDate.getUTCMonth();
    
    const months = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
    
    return months;
}


function calculateInterest(data: TaxData, totalTaxPayable: number, taxBreakdown: ComputationResult['breakdown']['tax']): InterestResult {
    const interest: InterestResult = { 
        u_s_234A: 0, 
        u_s_234B: 0, 
        u_s_234C: 0, 
        totalInterest: 0,
        months_234A: 0,
        months_234B: 0,
        months_234C: { q1: 0, q2: 0, q3: 0, q4: 0 }
    };
    const { interestCalc } = data;
    const actualDate = parseYYYYMMDD(interestCalc.actualDateOfFiling);
    
    const otherReliefs = 0; // Reliefs u/s 89, 90, 91 removed from UI
    const taxBaseForInterest = Math.max(0, totalTaxPayable - otherReliefs);

    // --- Section 234A: Interest for delay in filing ITR ---
    let startDateFor234A_raw: Date | null = null;
    let endDateFor234A: Date | null = null;
    let taxBaseFor234A = 0;

    switch (interestCalc.assessmentType) {
        case 'reassessment_147_post_assessment': // Case 3: Reassessment after earlier assessment
            startDateFor234A_raw = parseYYYYMMDD(interestCalc.dueDate148Notice) || parseYYYYMMDD(interestCalc.dueDateOfFiling);
            endDateFor234A = actualDate;
            // Base is the differential tax amount from the reassessment.
            taxBaseFor234A = Math.max(0, taxBaseForInterest - (interestCalc.taxOnEarlierAssessment ?? 0));
            break;

        case 'best_judgment_144': // Case 2: No return filed, assessed u/s 144
            startDateFor234A_raw = parseYYYYMMDD(interestCalc.dueDateOfFiling);
            // 'actualDateOfFiling' is used as the 'date of completion of assessment'
            endDateFor234A = actualDate; 
            // Base is tax on total income minus pre-paid taxes.
            taxBaseFor234A = Math.max(0, taxBaseForInterest - (data.advanceTax ?? 0) - (data.tds ?? 0));
            break;
            
        case 'regular': // Case 1 & 4: Regular late filing or first return in response to notice
        default:
            startDateFor234A_raw = parseYYYYMMDD(interestCalc.dueDateOfFiling);
            endDateFor234A = actualDate;
             // Base is tax on total income minus pre-paid taxes.
            taxBaseFor234A = Math.max(0, taxBaseForInterest - (data.advanceTax ?? 0) - (data.tds ?? 0));
            break;
    }
    
    if (startDateFor234A_raw && !isNaN(startDateFor234A_raw.getTime()) && endDateFor234A && !isNaN(endDateFor234A.getTime()) && taxBaseFor234A > 0) {
        const periodStart = new Date(startDateFor234A_raw.getTime());
        // Interest starts from the day after the due/notice date
        periodStart.setUTCDate(periodStart.getUTCDate() + 1); 

        if (endDateFor234A >= periodStart) {
            const monthsDelay234A = calculateInterestMonths(periodStart, endDateFor234A);
            interest.months_234A = monthsDelay234A;
            interest.u_s_234A = taxBaseFor234A * 0.01 * monthsDelay234A;
        }
    }


    // --- Section 234B: Interest for default in payment of Advance Tax ---
    // "Assessed tax" for 234B is defined as (Tax on Total Income) reduced by TDS and specified reliefs.
    const assessedTax_234B = Math.max(0, taxBaseForInterest - (data.tds ?? 0));
    const advanceTaxPaid = data.advanceTax ?? 0;
    
    if (advanceTaxPaid < (assessedTax_234B * 0.9)) {
        const shortfall = assessedTax_234B - advanceTaxPaid;
        if (shortfall > 0) {
            const yearStart = new Date(Date.UTC(parseInt(data.assessmentYear.split('-')[0], 10), 3, 1)); // April 1st of AY
            // Period is from 1st April of AY to date of filing/assessment.
            const periodEndFor234B = !isNaN(actualDate.getTime()) && actualDate > yearStart ? actualDate : yearStart;
            const months = calculateInterestMonths(yearStart, periodEndFor234B);
            interest.months_234B = months;
            interest.u_s_234B = shortfall * 0.01 * months;
        }
    }


    // --- Section 234C: Interest for deferment of Advance Tax installments ---
    // "Tax due" for 234C is the same as "Assessed tax" for 234B.
    const taxDue_234C = assessedTax_234B; 
    const { q1, q2, q3, q4 } = interestCalc.advanceTaxInstallments;
    let interest234C = 0;
    const paidQ1 = q1 ?? 0;
    const paidQ2 = paidQ1 + (q2 ?? 0);
    const paidQ3 = paidQ2 + (q3 ?? 0);
    const paidQ4 = paidQ3 + (q4 ?? 0);

    // Handle Presumptive Income Case (Sec 44AD/ADA) - single installment
    const isPresumptive44AD_ADA = [PresumptiveScheme.AD, PresumptiveScheme.ADA].includes(data.pgbp.presumptiveScheme);
    if (isPresumptive44AD_ADA) {
        const requiredQ4 = taxDue_234C * 1.00;
        if (paidQ4 < requiredQ4) {
            interest234C += (requiredQ4 - paidQ4) * 0.01 * 1;
            interest.months_234C.q4 = 1;
        }
    } else {
        // Handle Non-Presumptive Case

        // Per proviso to 234C(1), shortfall on account of Capital Gains or Winnings
        // is not considered for earlier installments if paid in later installments.
        const taxOnCapitalGains = taxBreakdown.onSTCG111A + taxBreakdown.onLTCG112A + taxBreakdown.onLTCGOther;
        const taxOnWinnings = taxBreakdown.onWinnings;
        const taxOnExcludedIncome = taxOnCapitalGains + taxOnWinnings + taxBreakdown.onForeignIncome;
        const adjustedTaxDueForInstallments = Math.max(0, taxDue_234C - taxOnExcludedIncome);

        // Q1: By 15th June
        const requiredQ1 = adjustedTaxDueForInstallments * 0.15;
        if (paidQ1 < requiredQ1) {
            const isRelaxedQ1 = paidQ1 >= (adjustedTaxDueForInstallments * 0.12);
            if (!isRelaxedQ1) {
                interest234C += (requiredQ1 - paidQ1) * 0.01 * 3;
                interest.months_234C.q1 = 3;
            }
        }

        // Q2: By 15th September
        const requiredQ2 = adjustedTaxDueForInstallments * 0.45;
        if (paidQ2 < requiredQ2) {
            const isRelaxedQ2 = paidQ2 >= (adjustedTaxDueForInstallments * 0.36);
            if (!isRelaxedQ2) {
                interest234C += (requiredQ2 - paidQ2) * 0.01 * 3;
                interest.months_234C.q2 = 3;
            }
        }

        // Q3: By 15th December
        const requiredQ3 = adjustedTaxDueForInstallments * 0.75;
        if (paidQ3 < requiredQ3) {
            interest234C += (requiredQ3 - paidQ3) * 0.01 * 3;
            interest.months_234C.q3 = 3;
        }
        
        // Q4: By 15th March - Full tax due is considered here
        const requiredQ4 = taxDue_234C * 1.00;
        if (paidQ4 < requiredQ4) {
            interest234C += (requiredQ4 - paidQ4) * 0.01 * 1;
            interest.months_234C.q4 = 1;
        }
    }
    
    interest.u_s_234C = interest234C;

    interest.totalInterest = Math.round(interest.u_s_234A + interest.u_s_234B + interest.u_s_234C);
    return interest;
}

const calculateTaxOnIncome = (
    incomeToTax: number,
    slabs: { limit: number; rate: number }[]
): number => {
    let tax = 0;
    let remainingIncome = incomeToTax;
    for (let i = 0; i < slabs.length; i++) {
        const prevLimit = i === 0 ? 0 : slabs[i - 1].limit;
        if (remainingIncome > 0) {
            const taxableInSlab = Math.min(remainingIncome, slabs[i].limit - prevLimit);
            tax += taxableInSlab * slabs[i].rate;
            remainingIncome -= taxableInSlab;
        }
    }
    return tax;
};


function calculateTotalDisallowedDeductions(data: TaxData): number {
    const { deductions } = data;
    let totalDisallowance = 0;
    // Iterate over all properties in the deductions object and sum their assessed values
    for (const key in deductions) {
        if (Object.prototype.hasOwnProperty.call(deductions, key)) {
            const incomeSource = (deductions as any)[key] as IncomeSource;
            totalDisallowance += getTaxableValue(incomeSource, data.residentialStatus);
        }
    }
    return totalDisallowance;
}

function calculateTrustTax(trustData: TrustData, totalIncome: number, residentialStatus: ResidentialStatus, yearConfig: any): TrustComputationResult {
    
    const disallowed12A = getTaxableValue(trustData.disallowedReceipts12A, residentialStatus);
    const disallowed10_23C = getTaxableValue(trustData.disallowedReceipts10_23C, residentialStatus);

    const taxableIncome = totalIncome + disallowed12A + disallowed10_23C;
    
    const MMR_RATE = yearConfig.TAX_RATES.AOP_MMR || 0.30;
    
    const finalTax = taxableIncome * MMR_RATE;
    
    const result: TrustComputationResult = {
        typeOfTrust: 'Trust / Institution',
        sectionApplied: 'Taxable as AOP',
        totalIncomeBeforeExemption: totalIncome,
        exemptIncome: 0, // No exemption logic, only disallowances
        taxableIncome: taxableIncome,
        applicableRate: MMR_RATE,
        applicableRateDisplay: 'MMR',
        violationFlags: [],
        finalTax: finalTax,
    };

    if(disallowed12A > 0) result.violationFlags.push(`Receipts disallowed u/s 12A/12AA/12AB: ${disallowed12A.toFixed(2)}`);
    if(disallowed10_23C > 0) result.violationFlags.push(`Receipts disallowed u/s 10(23C): ${disallowed10_23C.toFixed(2)}`);

    return result;
}


export function calculateTax(data: TaxData): ComputationResult {
  const yearConfig = YEARLY_CONFIGS[data.assessmentYear];
  if (!yearConfig) {
      throw new Error(`Tax configuration for assessment year ${data.assessmentYear} not found.`);
  }

  const individualConfig = yearConfig.individual;
  let setOffSummary: SetOffDetail[] = [];
  const { residentialStatus } = data;

  // --- Calculate Income from Salary ---
  const allSalarySources = [
    data.salary.basicSalary, data.salary.allowances, data.salary.bonusAndCommission,
    data.salary.perquisites.rentFreeAccommodation, data.salary.perquisites.motorCar,
    data.salary.perquisites.otherPerquisites, data.salary.profitsInLieu.terminationCompensation,
    data.salary.profitsInLieu.commutedPension, data.salary.profitsInLieu.retrenchmentCompensation,
    data.salary.profitsInLieu.vrsCompensation, data.salary.profitsInLieu.otherProfitsInLieu,
    data.salary.exemptions.hra, data.salary.exemptions.lta, data.salary.exemptions.gratuity,
    data.salary.exemptions.leaveEncashment, data.salary.exemptions.commutedPension,
    data.salary.exemptions.retrenchmentCompensation, data.salary.exemptions.vrsCompensation,
    data.salary.exemptions.providentFund, data.salary.exemptions.superannuationFund,
    data.salary.exemptions.specialAllowances, data.salary.exemptions.otherExemptions,
    data.salary.deductions.professionalTax, data.salary.deductions.entertainmentAllowance
  ];

  const totalSalaryAdditions = allSalarySources.reduce((acc, source) => {
    return acc + getTaxableValue(source, residentialStatus);
  }, 0);
  const assessedSalaryNet = totalSalaryAdditions;

  // All deductions are now treated as additions, so these specific variables are zeroed out
  const standardDeduction = 0;
  const assessedProfessionalTax = 0;
  const assessedEntertainmentAllowance = 0;
  

  // --- Calculate Income from Other Heads ---
  const housePropertyResult = calculateHousePropertyIncome(data.houseProperty, residentialStatus, yearConfig);
  const assessedSpeculativeIncome = getTaxableValue(data.pgbp.speculativeIncome, residentialStatus, data.pgbp.isControlledFromIndia, 'pgbp');
  
  let assessedPgbpNonSpeculativeIncome = 0;
  let pgbpBaseAmount = 0;
  let pgbpTotalAdditions = 0;

  switch (data.pgbp.presumptiveScheme) {
      case PresumptiveScheme.None: {
          const assessedNetProfit = getTaxableValue(data.pgbp.netProfit, residentialStatus, data.pgbp.isControlledFromIndia, 'pgbp');
          const totalDisallowances = Object.values(data.pgbp.additions).reduce(
              (acc, source) => acc + getTaxableValue(source, residentialStatus, data.pgbp.isControlledFromIndia, 'pgbp'),
              0
          );
          pgbpBaseAmount = assessedNetProfit;
          pgbpTotalAdditions = totalDisallowances;
          assessedPgbpNonSpeculativeIncome = pgbpBaseAmount + pgbpTotalAdditions;
          break;
      }
      case PresumptiveScheme.AD: {
          const digital = getTaxableValue(data.pgbp.turnover44AD_digital, residentialStatus, data.pgbp.isControlledFromIndia, 'pgbp') ?? 0;
          const other = getTaxableValue(data.pgbp.turnover44AD_other, residentialStatus, data.pgbp.isControlledFromIndia, 'pgbp') ?? 0;
          assessedPgbpNonSpeculativeIncome = (digital * 0.06) + (other * 0.08);
          pgbpBaseAmount = assessedPgbpNonSpeculativeIncome; // For presumptive, base is the final income
          break;
      }
      case PresumptiveScheme.ADA: {
          const receipts = getTaxableValue(data.pgbp.grossReceipts44ADA, residentialStatus, data.pgbp.isControlledFromIndia, 'pgbp') ?? 0;
          assessedPgbpNonSpeculativeIncome = receipts * 0.50;
          pgbpBaseAmount = assessedPgbpNonSpeculativeIncome;
          break;
      }
      case PresumptiveScheme.AE: {
          const income44AE = data.pgbp.vehicles44AE.reduce((total, vehicle) => {
              const months = Math.min(12, Math.max(0, vehicle.months ?? 0));
              let incomePerVehicle = 0;
              if (vehicle.type === 'heavy') {
                  const tonnage = vehicle.tonnage ?? 0;
                  incomePerVehicle = tonnage * 1000 * months;
              } else { // 'other'
                  incomePerVehicle = 7500 * months;
              }
              return total + incomePerVehicle;
          }, 0);
          assessedPgbpNonSpeculativeIncome = (residentialStatus !== 'non_resident' || data.pgbp.vehicles44AE.length > 0) ? income44AE : 0;
          pgbpBaseAmount = assessedPgbpNonSpeculativeIncome;
          break;
      }
       case PresumptiveScheme.B:
          assessedPgbpNonSpeculativeIncome = (getTaxableValue(data.pgbp.aggregateReceipts44B, residentialStatus, data.pgbp.isControlledFromIndia, 'pgbp') ?? 0) * 0.075;
          pgbpBaseAmount = assessedPgbpNonSpeculativeIncome;
          break;
      case PresumptiveScheme.BB:
          assessedPgbpNonSpeculativeIncome = (getTaxableValue(data.pgbp.aggregateReceipts44BB, residentialStatus, data.pgbp.isControlledFromIndia, 'pgbp') ?? 0) * 0.10;
          pgbpBaseAmount = assessedPgbpNonSpeculativeIncome;
          break;
      case PresumptiveScheme.BBA:
          assessedPgbpNonSpeculativeIncome = (getTaxableValue(data.pgbp.aggregateReceipts44BBA, residentialStatus, data.pgbp.isControlledFromIndia, 'pgbp') ?? 0) * 0.05;
          pgbpBaseAmount = assessedPgbpNonSpeculativeIncome;
          break;
      case PresumptiveScheme.BBB:
          assessedPgbpNonSpeculativeIncome = (getTaxableValue(data.pgbp.aggregateReceipts44BBB, residentialStatus, data.pgbp.isControlledFromIndia, 'pgbp') ?? 0) * 0.10;
          pgbpBaseAmount = assessedPgbpNonSpeculativeIncome;
          break;
  }
  
  const adjustment43CA = getTaxableValue(data.capitalGains.adjustment43CA, residentialStatus, data.pgbp.isControlledFromIndia, 'pgbp');
  assessedPgbpNonSpeculativeIncome += adjustment43CA;
  pgbpTotalAdditions += adjustment43CA;

  const capitalGainsAdditionsSources = [
    data.capitalGains.adjustment50C, data.capitalGains.adjustment50CA, data.capitalGains.adjustment50D,
    data.capitalGains.costOfImprovement, data.capitalGains.exemption54, data.capitalGains.exemption54B_ltcg,
    data.capitalGains.exemption54B_stcg, data.capitalGains.exemption54D, data.capitalGains.exemption54EC,
    data.capitalGains.exemption54EE, data.capitalGains.exemption54F, data.capitalGains.exemption54G,
    data.capitalGains.exemption54GA, data.capitalGains.exemption54GB, data.capitalGains.adjustment50
  ];
  const totalCapitalGainsAdditions = capitalGainsAdditionsSources.reduce((acc, source) => acc + getTaxableValue(source, residentialStatus), 0);

  const otherSourcesAdditionsSources = [
    data.otherSources.otherIncomes, data.otherSources.deemedDividend2_22_e, data.otherSources.gifts56_2_x,
    data.otherSources.familyPension, data.otherSources.interestOnEnhancedCompensation, data.otherSources.disallowance14A,
    data.otherSources.otherExemptIncomeSec10
  ];
  const totalOtherSourcesAdditions = otherSourcesAdditionsSources.reduce((acc, source) => acc + getTaxableValue(source, residentialStatus), 0);
  const assessedRaceHorseIncome = getTaxableValue(data.otherSources.raceHorseIncome, residentialStatus);
  const totalOtherSourcesAssessed = totalOtherSourcesAdditions;
  

  const agriculturalIncome = getTaxableValue(data.otherSources.exemptIncome, residentialStatus);
  const deemedIncome = Object.values(data.deemedIncome).reduce((acc, val) => acc + getTaxableValue(val, residentialStatus), 0);

  // --- Process International Income (Part 1: Segregate into pools) ---
    let netForeignIncomeAdded = 0;
    const foreignSlabIncomePool = { salary: 0, pgbp: 0, stcg: 0, ltcg: 0, other: 0 };
    const processedIntlItems: any[] = []; // Store items with their calculated taxable amount and rate type

    data.internationalIncome.forEach(item => {
        const incomeInr = item.amountInINR ?? 0;
        let taxableAmountInr = incomeInr;

        // Apply Transfer Pricing Adjustment for Business Income
        if (item.nature === InternationalIncomeNature.BusinessProfessionalIncome && item.transferPricing.isAssociatedEnterprise) {
            taxableAmountInr = item.transferPricing.armsLengthPrice ?? incomeInr;
        }
        
        netForeignIncomeAdded += taxableAmountInr;

        let indianTaxRate = 0;
        let isSpecialRate = true;
        
        switch (item.specialSection) {
            case '115A':
                if ([InternationalIncomeNature.Dividend, InternationalIncomeNature.InterestIncome].includes(item.nature)) {
                    indianTaxRate = yearConfig.TAX_RATES.FOREIGN_INCOME_115A_DIVIDEND_INTEREST;
                } else if (item.nature === InternationalIncomeNature.Royalty || item.nature === InternationalIncomeNature.FeesForTechnicalServices) {
                    indianTaxRate = yearConfig.TAX_RATES.FOREIGN_INCOME_115A_ROYALTY_FTS;
                }
                break;
            case '115AB':
                 if (item.nature === InternationalIncomeNature.LongTermCapitalGain || item.nature === InternationalIncomeNature.ShortTermCapitalGain) {
                    indianTaxRate = yearConfig.TAX_RATES.OFFSHORE_FUND_UNITS_LTCG_115AB;
                 } else { // Units Income
                    indianTaxRate = yearConfig.TAX_RATES.OFFSHORE_FUND_UNITS_INCOME_115AB;
                 }
                break;
            case '115AC': case '115ACA':
                 if (item.nature === InternationalIncomeNature.LongTermCapitalGain || item.nature === InternationalIncomeNature.ShortTermCapitalGain) {
                    indianTaxRate = yearConfig.TAX_RATES.GDR_FCCB_LTCG_115AC_ACA;
                 } else { // GDR/Bond Income
                    indianTaxRate = yearConfig.TAX_RATES.GDR_FCCB_INCOME_115AC_ACA;
                 }
                break;
            case '115AD': // FII / FPI
                 if (item.nature === InternationalIncomeNature.LongTermCapitalGain || item.nature === InternationalIncomeNature.ShortTermCapitalGain) {
                    indianTaxRate = item.isLTCG ? yearConfig.TAX_RATES.FII_FPI_LTCG_115AD : yearConfig.TAX_RATES.FII_FPI_STCG_OTHER_115AD;
                 } else if (item.nature === InternationalIncomeNature.InterestIncome) {
                    indianTaxRate = yearConfig.TAX_RATES.FII_FPI_INTEREST_115AD;
                 }
                break;
            case '115AE':
                indianTaxRate = yearConfig.TAX_RATES.SPECIFIED_FUND_UNITS_INCOME_115AE;
                break;
            case '115BBA':
                indianTaxRate = yearConfig.TAX_RATES.FOREIGN_INCOME_115BBA;
                break;
        }
        
        if (indianTaxRate === 0) {
            isSpecialRate = false;
        }

        processedIntlItems.push({ ...item, taxableAmountInr, isSpecialRate, indianTaxRate });
        
        if (!isSpecialRate) {
            switch(item.nature) {
                case InternationalIncomeNature.Salary: foreignSlabIncomePool.salary += taxableAmountInr; break;
                case InternationalIncomeNature.BusinessProfessionalIncome: foreignSlabIncomePool.pgbp += taxableAmountInr; break;
                case InternationalIncomeNature.LongTermCapitalGain:
                    foreignSlabIncomePool.ltcg += taxableAmountInr;
                    break;
                case InternationalIncomeNature.ShortTermCapitalGain:
                    foreignSlabIncomePool.stcg += taxableAmountInr;
                    break;
                case InternationalIncomeNature.HouseProperty:
                case InternationalIncomeNature.InterestIncome:
                case InternationalIncomeNature.Dividend:
                case InternationalIncomeNature.Royalty:
                case InternationalIncomeNature.FeesForTechnicalServices:
                case InternationalIncomeNature.Others:
                    foreignSlabIncomePool.other += taxableAmountInr;
                    break;
            }
        }
    });

  // --- Loss Set-off Logic ---
  const incomePool = {
    salary: Math.max(0, assessedSalaryNet) + foreignSlabIncomePool.salary,
    hp: Math.max(0, housePropertyResult.income),
    pgbpNonSpeculative: Math.max(0, assessedPgbpNonSpeculativeIncome) + foreignSlabIncomePool.pgbp,
    pgbpSpeculative: Math.max(0, assessedSpeculativeIncome),
    stcg111A: getTaxableValue(data.capitalGains.stcg111A, residentialStatus),
    stcgOther: getTaxableValue(data.capitalGains.stcgOther, residentialStatus) + foreignSlabIncomePool.stcg,
    ltcg112A: getTaxableValue(data.capitalGains.ltcg112A, residentialStatus),
    ltcgOther: getTaxableValue(data.capitalGains.ltcgOther, residentialStatus) + foreignSlabIncomePool.ltcg,
    otherSources: totalOtherSourcesAssessed + foreignSlabIncomePool.other,
    raceHorseIncome: Math.max(0, assessedRaceHorseIncome),
    winnings: getTaxableValue(data.otherSources.winnings, residentialStatus),
  };
   // Add additions to respective pools
  incomePool.stcgOther += totalCapitalGainsAdditions; // Assuming all additions are 'other' for simplicity
  
  const lossPool = {
      current: {
          hp: Math.abs(Math.min(0, housePropertyResult.income)),
          businessNonSpeculative: data.losses.currentYear.businessNonSpeculative ?? 0,
          businessSpeculative: data.losses.currentYear.businessSpeculative ?? 0,
          stcl: data.losses.currentYear.stcl ?? 0,
          ltcl: data.losses.currentYear.ltcl ?? 0,
          raceHorses: data.losses.currentYear.raceHorses ?? 0,
      },
      broughtForward: {
          hp: data.losses.broughtForward.houseProperty ?? 0,
          businessNonSpeculative: data.losses.broughtForward.businessNonSpeculative ?? 0,
          businessSpeculative: data.losses.broughtForward.businessSpeculative ?? 0,
          stcl: data.losses.broughtForward.stcl ?? 0,
          ltcl: data.losses.broughtForward.ltcl ?? 0,
          raceHorses: data.losses.broughtForward.raceHorses ?? 0,
          unabsorbedDepreciation: data.losses.broughtForward.unabsorbedDepreciation ?? 0,
      },
  };

  const humanReadable: { [key in keyof typeof incomePool]: string } = {
      salary: "Salary", hp: "House Property", pgbpNonSpeculative: "Business Income", pgbpSpeculative: "Speculative Income",
      stcg111A: "STCG (111A)", stcgOther: "STCG (Other)", ltcg112A: "LTCG (112A)",
      ltcgOther: "LTCG (Other)", otherSources: "Other Sources", raceHorseIncome: "Race Horse Income", winnings: "Winnings"
  };

  const reduceIncome = (lossSource: string, lossAmount: number, incomeKey: keyof typeof incomePool) => {
      const reduction = Math.min(lossAmount, incomePool[incomeKey]);
      if (reduction > 0) {
          incomePool[incomeKey] -= reduction;
          setOffSummary.push({ source: lossSource, against: humanReadable[incomeKey], amount: reduction });
      }
      return reduction;
  };

  // 1. Current Year Intra-Head Set-off
  let used = reduceIncome("CY Speculative Loss", lossPool.current.businessSpeculative, 'pgbpSpeculative'); lossPool.current.businessSpeculative -= used;
  used = reduceIncome("CY Race Horse Loss", lossPool.current.raceHorses, 'raceHorseIncome'); lossPool.current.raceHorses -= used;
  used = reduceIncome("CY STCL", lossPool.current.stcl, 'stcgOther'); lossPool.current.stcl -= used;
  used = reduceIncome("CY STCL", lossPool.current.stcl, 'stcg111A'); lossPool.current.stcl -= used;
  used = reduceIncome("CY STCL", lossPool.current.stcl, 'ltcgOther'); lossPool.current.stcl -= used;
  used = reduceIncome("CY STCL", lossPool.current.stcl, 'ltcg112A'); lossPool.current.stcl -= used;
  used = reduceIncome("CY LTCL", lossPool.current.ltcl, 'ltcgOther'); lossPool.current.ltcl -= used;
  used = reduceIncome("CY LTCL", lossPool.current.ltcl, 'ltcg112A'); lossPool.current.ltcl -= used;
  
  // 2. Current Year Inter-Head Set-off
  let hpLossToSetOff = Math.min(lossPool.current.hp, yearConfig.DEDUCTION_LIMITS.HP_LOSS_SETOFF_LIMIT || 200000);
  const hpSetoffOrder: (keyof typeof incomePool)[] = ['pgbpNonSpeculative', 'pgbpSpeculative', 'stcgOther', 'ltcgOther', 'otherSources', 'raceHorseIncome', 'salary', 'stcg111A', 'ltcg112A', 'winnings'];
  for (const head of hpSetoffOrder) {
      if (hpLossToSetOff <= 0) break;
      hpLossToSetOff -= reduceIncome("CY HP Loss", hpLossToSetOff, head);
  }
  lossPool.current.hp = Math.max(0, lossPool.current.hp - (yearConfig.DEDUCTION_LIMITS.HP_LOSS_SETOFF_LIMIT || 200000) + hpLossToSetOff);
  
  let businessLossToSetOff = lossPool.current.businessNonSpeculative;
  const businessSetoffOrder: (keyof typeof incomePool)[] = ['hp', 'pgbpSpeculative', 'stcgOther', 'ltcgOther', 'otherSources', 'raceHorseIncome', 'stcg111A', 'ltcg112A', 'winnings']; // No salary
  for (const head of businessSetoffOrder) {
      if (businessLossToSetOff <= 0) break;
      businessLossToSetOff -= reduceIncome("CY Business Loss", businessLossToSetOff, head);
  }
  lossPool.current.businessNonSpeculative = businessLossToSetOff;

  // 3. Brought Forward Loss Set-off
  const unabsorbedDepreciationSetoffOrder: (keyof typeof incomePool)[] = ['hp', 'pgbpNonSpeculative', 'pgbpSpeculative', 'stcgOther', 'ltcgOther', 'otherSources', 'raceHorseIncome', 'stcg111A', 'ltcg112A', 'winnings'];
  for (const head of unabsorbedDepreciationSetoffOrder) {
      if (lossPool.broughtForward.unabsorbedDepreciation <= 0) break;
      used = reduceIncome("BF Unabsorbed Depreciation", lossPool.broughtForward.unabsorbedDepreciation, head);
      lossPool.broughtForward.unabsorbedDepreciation -= used;
  }
  
  used = reduceIncome("BF Business Loss", lossPool.broughtForward.businessNonSpeculative, 'pgbpNonSpeculative'); lossPool.broughtForward.businessNonSpeculative -= used;
  used = reduceIncome("BF Speculative Loss", lossPool.broughtForward.businessSpeculative, 'pgbpSpeculative'); lossPool.broughtForward.businessSpeculative -= used;
  used = reduceIncome("BF HP Loss", lossPool.broughtForward.hp, 'hp'); lossPool.broughtForward.hp -= used;
  used = reduceIncome("BF Race Horse Loss", lossPool.broughtForward.raceHorses, 'raceHorseIncome'); lossPool.broughtForward.raceHorses -= used;
  used = reduceIncome("BF STCL", lossPool.broughtForward.stcl, 'stcgOther'); lossPool.broughtForward.stcl -= used;
  used = reduceIncome("BF STCL", lossPool.broughtForward.stcl, 'stcg111A'); lossPool.broughtForward.stcl -= used;
  used = reduceIncome("BF STCL", lossPool.broughtForward.stcl, 'ltcgOther'); lossPool.broughtForward.stcl -= used;
  used = reduceIncome("BF STCL", lossPool.broughtForward.stcl, 'ltcg112A'); lossPool.broughtForward.stcl -= used;
  used = reduceIncome("BF LTCL", lossPool.broughtForward.ltcl, 'ltcgOther'); lossPool.broughtForward.ltcl -= used;
  used = reduceIncome("BF LTCL", lossPool.broughtForward.ltcl, 'ltcg112A'); lossPool.broughtForward.ltcl -= used;

  // --- Gross Total Income after set-off ---
  const gtiFromCurrentInputs = Object.values(incomePool).reduce((a, b) => a + b, 0) + deemedIncome;
  let grossTotalIncome = gtiFromCurrentInputs;
  if (data.interestCalc.incomeAsPerEarlierAssessment != null) {
      grossTotalIncome += data.interestCalc.incomeAsPerEarlierAssessment;
  }
  
  const totalDisallowedDeductions = calculateTotalDisallowedDeductions(data);
  let netTaxableIncome = grossTotalIncome + totalDisallowedDeductions;
  
  // --- Bifurcate logic for Trusts vs Standard Taxpayers ---
  let trustComputation: TrustComputationResult | null = null;
  let baseTaxBeforeSurcharge = 0;
  let totalSurcharge = 0;
  let rebate87A = 0;
  let marginalRelief = 0;
  const taxBreakdownForInterest: ComputationResult['breakdown']['tax'] = { onNormalIncome: 0, onSTCG111A: 0, onLTCG112A: 0, onLTCGOther: 0, onWinnings: 0, onDeemedIncome: 0, onForeignIncome: 0 };
  
  // Initialize international results here to be available in both branches
  const itemizedInternationalResults: InternationalIncomeComputation[] = [];
  let totalFtcAllowed = 0;


  if (data.taxpayerType === 'trust') {
      trustComputation = calculateTrustTax(data.trustData, grossTotalIncome, residentialStatus, yearConfig);
      netTaxableIncome = trustComputation.taxableIncome;
      baseTaxBeforeSurcharge = trustComputation.finalTax;
      // Surcharge for Trusts/AOPs needs to be calculated
      const trustSurchargeRates = yearConfig.aop.SURCHARGE_RATES;
      let applicableRate = 0;
      for (const slab of [...trustSurchargeRates].reverse()) {
        if (netTaxableIncome > slab.limit) {
            applicableRate = slab.rate;
            break;
        }
      }
      totalSurcharge = baseTaxBeforeSurcharge * applicableRate;
      // Note: Marginal relief and rebate for trusts are complex and not fully implemented here.

  } else { // Standard Taxpayer Logic
      const taxOnDeemedIncomeRaw = deemedIncome * yearConfig.TAX_RATES.DEEMED_INCOME_115BBE;
      const surchargeOnDeemedIncome = taxOnDeemedIncomeRaw * yearConfig.TAX_RATES.DEEMED_INCOME_SURCHARGE;
      const taxOnDeemedIncome = taxOnDeemedIncomeRaw + surchargeOnDeemedIncome;
      taxBreakdownForInterest.onDeemedIncome = taxOnDeemedIncome;

      const taxOnWinnings = incomePool.winnings * yearConfig.TAX_RATES.WINNINGS;
      taxBreakdownForInterest.onWinnings = taxOnWinnings;
      const taxableLTCG112A = Math.max(0, incomePool.ltcg112A - yearConfig.TAX_RATES.LTCG_112A_EXEMPTION);
      const taxOnLTCG112A = taxableLTCG112A * yearConfig.TAX_RATES.LTCG_112A_RATE;
      taxBreakdownForInterest.onLTCG112A = taxOnLTCG112A;
      const taxOnLTCGOther = incomePool.ltcgOther * yearConfig.TAX_RATES.LTCG_OTHER_RATE;
      taxBreakdownForInterest.onLTCGOther = taxOnLTCGOther;
      const taxOnSTCG111A = incomePool.stcg111A * yearConfig.TAX_RATES.STCG_111A;
      taxBreakdownForInterest.onSTCG111A = taxOnSTCG111A;

      const domesticSpecialIncome = incomePool.winnings + incomePool.ltcg112A + incomePool.ltcgOther + incomePool.stcg111A + deemedIncome;
      const normalIncome = Math.max(0, netTaxableIncome - domesticSpecialIncome - netForeignIncomeAdded);

      let taxOnNormalIncome = 0;
      
      switch (data.taxpayerType) {
        case 'individual': case 'huf': case 'aop': case 'boi': case 'artificial juridical person':
            const entityConfig = yearConfig[data.taxpayerType] || yearConfig.individual;
            const ageKey = data.taxpayerType === 'individual' ? data.age : 'below60';
            const slabs = entityConfig.SLABS[data.taxRegime][ageKey];
            taxOnNormalIncome = calculateTaxOnIncome(normalIncome, slabs);
            break;
        case 'firm': case 'llp': case 'local authority':
            taxOnNormalIncome = normalIncome * yearConfig[data.taxpayerType].RATE;
            break;
        case 'company':
            const companyConfig = yearConfig.company[data.companyType];
            const rate = data.companyType === 'domestic' 
                ? ((data.previousYearTurnover ?? 0) <= 4000000000 ? companyConfig.turnover_lte_400cr : companyConfig.turnover_gt_400cr)
                : companyConfig.RATE;
            taxOnNormalIncome = normalIncome * rate;
            break;
      }
      taxBreakdownForInterest.onNormalIncome = taxOnNormalIncome;

      // --- Process International Income (Part 2: Calculate Tax) ---
      const averageTaxRateOnNormalIncome = normalIncome > 0 ? taxOnNormalIncome / normalIncome : 0;
      let taxOnForeignIncome = 0;
      const taxedIntlItems: any[] = [];

        processedIntlItems.forEach(item => {
            let finalApplicableRate = 0;
            if (item.isSpecialRate) {
                finalApplicableRate = item.indianTaxRate;
            } else {
                finalApplicableRate = averageTaxRateOnNormalIncome;
            }

            if (item.form67Filed && item.dtaaApplicable && item.taxRateAsPerDtaa != null) {
                finalApplicableRate = Math.min(finalApplicableRate, item.taxRateAsPerDtaa);
            }
            
            const taxOnThisItem = item.taxableAmountInr * finalApplicableRate;
            taxOnForeignIncome += taxOnThisItem;
            taxedIntlItems.push({ ...item, taxOnThisItem, finalApplicableRate });
        });
      taxBreakdownForInterest.onForeignIncome = taxOnForeignIncome;

      const taxOnOtherIncomes = taxOnNormalIncome + taxOnSTCG111A + taxOnLTCG112A + taxOnLTCGOther + taxOnWinnings + taxOnForeignIncome;
      baseTaxBeforeSurcharge = taxOnOtherIncomes + taxOnDeemedIncomeRaw;

      // Surcharge & Marginal Relief Calculation
      let surchargeRates;
      let grossSurcharge = 0;
      
      switch (data.taxpayerType) {
          case 'individual': case 'huf': case 'aop': case 'boi': case 'artificial juridical person':
              const entityConfig = yearConfig[data.taxpayerType] || yearConfig.individual;
              surchargeRates = (data.taxRegime === 'New' && entityConfig.SURCHARGE_RATES_NEW) ? entityConfig.SURCHARGE_RATES_NEW : entityConfig.SURCHARGE_RATES;
              break;
          case 'firm': case 'llp': case 'local authority':
              surchargeRates = yearConfig[data.taxpayerType].SURCHARGE_RATES;
              break;
          case 'company':
              surchargeRates = yearConfig.company[data.companyType].SURCHARGE_RATES;
              break;
      }

      if (surchargeRates) {
        let applicableRate = 0;
        let threshold = 0;
        for (const slab of [...surchargeRates].reverse()) {
            if (netTaxableIncome > slab.limit) {
                applicableRate = slab.rate;
                threshold = slab.limit;
                break;
            }
        }
        if (applicableRate > 0) {
            grossSurcharge = taxOnOtherIncomes * applicableRate;
            const incomeAboveThreshold = netTaxableIncome - threshold;
            const taxPlusSurcharge = taxOnOtherIncomes + grossSurcharge + taxOnDeemedIncome;
            const normalIncomeAtThreshold = Math.max(0, threshold - domesticSpecialIncome - netForeignIncomeAdded);
            const slabsForThreshold = (yearConfig.individual || yearConfig.huf).SLABS[data.taxRegime][data.age || 'below60'];
            const taxOnThresholdNormalIncome = calculateTaxOnIncome(normalIncomeAtThreshold, slabsForThreshold);
            const taxOnThresholdOtherIncomes = taxOnThresholdNormalIncome + taxOnSTCG111A + taxOnLTCG112A + taxOnLTCGOther + taxOnWinnings + taxOnForeignIncome;

            let surchargeOnThreshold = 0;
            let thresholdRate = 0;
            for (const slab of [...surchargeRates].reverse()) {
                if (threshold > slab.limit) {
                    thresholdRate = slab.rate;
                    break;
                }
            }
            if (thresholdRate > 0) {
                surchargeOnThreshold = taxOnThresholdOtherIncomes * thresholdRate;
            }

            const taxOnThresholdWithSurcharges = taxOnThresholdOtherIncomes + surchargeOnThreshold + taxOnDeemedIncome;
            const cappedTax = taxOnThresholdWithSurcharges + incomeAboveThreshold;
            
            if (taxPlusSurcharge > cappedTax) {
                marginalRelief = taxPlusSurcharge - cappedTax;
            }
        }
      }

      const netSurchargeOnOtherIncomes = grossSurcharge - marginalRelief;
      totalSurcharge = netSurchargeOnOtherIncomes + surchargeOnDeemedIncome;
      
      const taxBeforeRebateAndCess = baseTaxBeforeSurcharge + totalSurcharge;

      if (data.taxpayerType === 'individual') {
        const rebateConfig = (data.taxRegime === 'New' && individualConfig.REBATE_87A_NEW) ? individualConfig.REBATE_87A_NEW : individualConfig.REBATE_87A;
        if (rebateConfig && netTaxableIncome <= rebateConfig.INCOME_CEILING) {
            const taxOnSpecialOtherIncomes = taxOnWinnings + taxOnSTCG111A + taxOnLTCGOther + taxOnLTCG112A + taxOnForeignIncome;
            let surchargeOnSpecialOtherIncomes = 0;
            if (taxOnOtherIncomes > 0) {
                surchargeOnSpecialOtherIncomes = netSurchargeOnOtherIncomes * (taxOnSpecialOtherIncomes / taxOnOtherIncomes);
            }
            const totalTaxOnExcludedIncomes = taxOnDeemedIncome + taxOnSpecialOtherIncomes + surchargeOnSpecialOtherIncomes;
            const taxEligibleForRebate = Math.max(0, taxBeforeRebateAndCess - totalTaxOnExcludedIncomes);
            rebate87A = Math.min(taxEligibleForRebate, rebateConfig.LIMIT);
        }
      }

      // --- Process International Income (Part 3: Calculate FTC) ---
      const taxAfterRebateForFTC = Math.max(0, baseTaxBeforeSurcharge + totalSurcharge - rebate87A);
      const cessForFTC = taxAfterRebateForFTC * yearConfig.TAX_RATES.CESS;
      const totalTaxPayableBeforeReliefForFTC = taxAfterRebateForFTC + cessForFTC;
      const averageRate = netTaxableIncome > 0 ? totalTaxPayableBeforeReliefForFTC / netTaxableIncome : 0;
    
      taxedIntlItems.forEach(item => {
          const taxPaidInr = item.taxPaidInINR ?? 0;
          let ftc90_90A = 0, ftc91 = 0;
          const taxOnThisItem = (item.taxOnThisItem ?? 0);
          
          if (item.form67Filed) {
              if (item.dtaaApplicable) { // Sec 90/90A
                  ftc90_90A = Math.min(taxPaidInr, taxOnThisItem);
              } else { // Sec 91
                  const indianTaxOnThisItemAtAvgRate = item.taxableAmountInr * averageRate;
                  ftc91 = Math.min(taxPaidInr, indianTaxOnThisItemAtAvgRate);
              }
          }
          
          const totalFtc = ftc90_90A + ftc91;
          totalFtcAllowed += totalFtc;

          itemizedInternationalResults.push({
              id: item.id,
              indianTax: taxOnThisItem,
              ftc90_90A,
              ftc91,
              totalFtc,
              netTax: taxOnThisItem - totalFtc,
              applicableRate: (item.finalApplicableRate ?? 0),
          });
      });
  }
  
  const taxAfterRebate = Math.max(0, baseTaxBeforeSurcharge + totalSurcharge - rebate87A);
  const healthAndEducationCess = taxAfterRebate * yearConfig.TAX_RATES.CESS;
  const totalTaxPayableBeforeRelief = taxAfterRebate + healthAndEducationCess;
  
  const otherReliefs = totalFtcAllowed;
  const finalTaxPayable = Math.max(0, totalTaxPayableBeforeRelief - otherReliefs);
    
  const interest = calculateInterest(data, finalTaxPayable, taxBreakdownForInterest);
  const netPayable = finalTaxPayable + interest.totalInterest - (data.tds ?? 0) - (data.advanceTax ?? 0);

  const lossesCarriedForward = {
      houseProperty: lossPool.current.hp + lossPool.broughtForward.hp,
      businessNonSpeculative: lossPool.current.businessNonSpeculative + lossPool.broughtForward.businessNonSpeculative,
      businessSpeculative: lossPool.current.businessSpeculative + lossPool.broughtForward.businessSpeculative,
      ltcl: lossPool.current.ltcl + lossPool.broughtForward.ltcl,
      stcl: lossPool.current.stcl + lossPool.broughtForward.stcl,
      raceHorses: lossPool.current.raceHorses + lossPool.broughtForward.raceHorses,
      unabsorbedDepreciation: lossPool.broughtForward.unabsorbedDepreciation,
  };

  const finalPgbpIncome = incomePool.pgbpNonSpeculative + incomePool.pgbpSpeculative;
  const finalCapitalGains = incomePool.stcg111A + incomePool.stcgOther + incomePool.ltcg112A + incomePool.ltcgOther;
  const finalOtherSources = incomePool.otherSources + incomePool.raceHorseIncome;

  return {
    grossTotalIncome,
    totalDeductions: totalDisallowedDeductions,
    netTaxableIncome: Math.max(0, netTaxableIncome),
    agriculturalIncome,
    taxLiability: baseTaxBeforeSurcharge,
    surcharge: totalSurcharge,
    marginalRelief,
    healthAndEducationCess,
    totalTaxPayable: finalTaxPayable,
    rebate87A,
    relief: otherReliefs,
    tds: data.tds ?? 0,
    advanceTax: data.advanceTax ?? 0,
    netPayable,
    interest,
    trustComputation,
    breakdown: {
      income: {
        salary: { baseAmount: 0, totalAdditions: totalSalaryAdditions, assessed: incomePool.salary },
        houseProperty: { baseAmount: 0, totalAdditions: housePropertyResult.breakdown.totalAdditions, assessed: incomePool.hp },
        pgbp: { netProfit: pgbpBaseAmount, baseAmount: pgbpBaseAmount, totalAdditions: pgbpTotalAdditions + assessedSpeculativeIncome, assessed: finalPgbpIncome },
        capitalGains: { baseAmount: 0, totalAdditions: totalCapitalGainsAdditions, assessed: finalCapitalGains },
        capitalGainsBreakdown: { stcg111A: incomePool.stcg111A, stcgOther: incomePool.stcgOther, ltcg112A: incomePool.ltcg112A, ltcgOther: incomePool.ltcgOther },
        otherSources: { baseAmount: 0, totalAdditions: totalOtherSourcesAdditions, assessed: finalOtherSources },
        winnings: { baseAmount: 0, totalAdditions: incomePool.winnings, assessed: incomePool.winnings },
        deemed: deemedIncome,
        international: { netIncomeAdded: netForeignIncomeAdded, taxOnIncome: taxBreakdownForInterest.onForeignIncome, totalFtcAllowed: totalFtcAllowed, itemized: itemizedInternationalResults },
      },
      tax: taxBreakdownForInterest,
      surchargeBreakdown: { onDeemedIncome: taxBreakdownForInterest.onDeemedIncome > 0 ? totalSurcharge : 0, onOtherIncomeGross: taxBreakdownForInterest.onDeemedIncome === 0 ? totalSurcharge : 0 },
      standardDeduction, professionalTax: assessedProfessionalTax, entertainmentAllowance: assessedEntertainmentAllowance,
      nav: housePropertyResult.nav,
      standardDeduction24a: housePropertyResult.standardDeduction24a,
    },
    setOffSummary,
    lossesCarriedForward,
  };
}
