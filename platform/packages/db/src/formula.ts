export interface V62CalculationInput {
  netCost: number;
  marginRate?: number; // e.g. 12 for 12%
  marginType?: 'percentage' | 'fixed';
  ancillaryCosts?: number;
  ancillaryCharges?: number;
  gstPct?: number; // default 5%
  tcsPct?: number; // default 5%
  tdsPaid?: number;
  tdsPayable?: number;
}

export interface V62CalculationResult {
  netCost: number;
  marginAmount: number;
  ancillaryCosts: number;
  ancillaryCharges: number;
  ancillaryMargin: number;
  subtotal: number;
  gstAmount: number;
  tcsAmount: number;
  totalCustomerPrice: number;
  grossProfit: number;
  cashProfit: number;
}

/**
 * V62 Binding Cost Formula implementation
 * PRD Rule R8: selling = (net × markup) + ancillary; agent margin = 12% default, configurable
 */
export function calculateV62Deal(input: V62CalculationInput): V62CalculationResult {
  const net = Math.max(0, input.netCost || 0);
  const rate = input.marginRate !== undefined ? input.marginRate : 12;
  const isFixed = input.marginType === 'fixed';

  const marginAmount = isFixed ? Math.max(0, rate) : Math.round(((net * rate) / 100) * 100) / 100;
  const ancCost = Math.max(0, input.ancillaryCosts || 0);
  const ancCharge = Math.max(0, input.ancillaryCharges || 0);
  const ancMargin = Math.round((ancCharge - ancCost) * 100) / 100;

  const subtotal = Math.round((net + marginAmount + ancCharge) * 100) / 100;
  const gstPct = input.gstPct !== undefined ? input.gstPct : 5;
  const gstAmount = Math.round(((subtotal * gstPct) / 100) * 100) / 100;

  const tcsPct = input.tcsPct !== undefined ? input.tcsPct : 5;
  const tcsAmount = Math.round((((subtotal + gstAmount) * tcsPct) / 100) * 100) / 100;

  const totalCustomerPrice = Math.round((subtotal + gstAmount + tcsAmount) * 100) / 100;

  const grossProfit = Math.round((marginAmount + ancMargin) * 100) / 100;
  const tdsPaid = Math.max(0, input.tdsPaid || 0);
  const tdsPayable = Math.max(0, input.tdsPayable || 0);
  const cashProfit = Math.round((grossProfit - tdsPaid - tdsPayable) * 100) / 100;

  return {
    netCost: net,
    marginAmount,
    ancillaryCosts: ancCost,
    ancillaryCharges: ancCharge,
    ancillaryMargin: ancMargin,
    subtotal,
    gstAmount,
    tcsAmount,
    totalCustomerPrice,
    grossProfit,
    cashProfit,
  };
}

/**
 * Format currency with Indian digit grouping (₹1,42,800)
 * PRD Rule R3: money in mono, tabular, Indian digit grouping
 */
export function formatINR(amount: number): string {
  const rounded = Math.round(amount);
  return '₹' + rounded.toLocaleString('en-IN');
}
