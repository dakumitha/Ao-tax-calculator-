export const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(value));

export const formatInputValue = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '';
  // Handle negative sign correctly
  const sign = value < 0 ? '-' : '';
  const numStr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.abs(value));
  return sign + numStr;
};

export const parseFormattedValue = (val: string): number | null => {
  if (val.trim() === '' || val.trim() === '-') return null;
  const num = parseFloat(val.replace(/,/g, ''));
  return isNaN(num) ? null : num;
};

export const format234CMonths = (months: { q1: number, q2: number, q3: number, q4: number }) => {
    const parts = [];
    if (months.q1 > 0) parts.push(`Q1`);
    if (months.q2 > 0) parts.push(`Q2`);
    if (months.q3 > 0) parts.push(`Q3`);
    if (months.q4 > 0) parts.push(`Q4`);
    if (parts.length === 0) return '';
    return `(on ${parts.join(', ')} shortfall)`;
};
