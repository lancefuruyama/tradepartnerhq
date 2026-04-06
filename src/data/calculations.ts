/**
 * Calculation Engine for Trade Partner HQ
 * $1,000/hr Construction Consultant-Grade Analysis
 * Pure functions — no side effects, no API calls
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function n(val: any): number {
  const parsed = Number(val);
  return isNaN(parsed) ? 0 : parsed;
}

export function fmt(val: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
}

export function fmtCurrency(val: number): string { return fmt(val); }

export function fmtPct(val: number): string {
  return `${(val * 100).toFixed(1)}%`;
}

function pct(num: number, den: number, digits = 1): string {
  return den === 0 ? '0%' : `${((num / den) * 100).toFixed(digits)}%`;
}

function daily(monthly: number): number { return monthly / 30; }

function annual(monthly: number): number { return monthly * 12; }

export function ratingWord(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Needs Improvement';
  return 'Critical';
}

// ============================================================================
// ENHANCED OUTPUT FORMAT
// ============================================================================

export interface CalculationResult {
  primaryMetrics: Array<{ label: string; value: string; subtext?: string }>;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  summary: string;
  scoreBreakdown: Array<{ label: string; value: number }>;
  recommendations: string[];
  detailedAnalysis: {
    title?: string;
    subtitle?: string;
    sections: Array<{ title: string; items: string[] }>;
  };
  actionPlan?: {
    title: string;
    subtitle: string;
    phases: Array<{ title: string; description?: string; items: string[] }>;
  };
  measurement?: { title: string; items: string[] };
  expectedOutcomes?: { title: string; items: string[] };
}

// ============================================================================
// TOOL 1: CASH FLOW GAP ANALYZER
// ============================================================================

export function calculateCashFlowGapAnalyzer(inputs: Record<string, any>): CalculationResult {
  const rev = n(inputs.monthlyRevenue);
  const collDays = n(inputs.avgCollectionDays);
  const payroll = n(inputs.upcomingPayroll);
  const equip = n(inputs.equipmentCosts);
  const retPct = n(inputs.retainagePercent);
  const openAR = n(inputs.openReceivables);

  const annualRev = annual(rev);
  const dailyRev = daily(rev);
  const totalNeeds = payroll + equip;
  const retHeld = openAR * (retPct / 100);
  const availCash = openAR - retHeld;
  const gap = Math.max(0, totalNeeds - availCash);
  const gapDays = rev > 0 ? Math.round((gap / rev) * 30) : 0;
  const matPayDays = 30;
  const cashGapDays = Math.max(0, collDays - matPayDays);
  const peakCashNeed = dailyRev * collDays;
  const dailyCashDrain = dailyRev;
  const financingRate = 0.08;
  const monthlyInterest = peakCashNeed * (financingRate / 12);
  const annualCarrying = monthlyInterest * 12;
  const bestPracticeDays = 30;
  const cashFreed = dailyRev * (collDays - bestPracticeDays);
  const savedMonthly = cashFreed * (financingRate / 12);
  const savedAnnual = savedMonthly * 12;
  const collEfficiency = collDays <= 30 ? 'Excellent' : collDays <= 45 ? 'Good - monitor closely' : collDays <= 60 ? 'Fair - needs improvement' : 'Poor - urgent attention required';
  const payrollCycleLabel = 'Weekly';
  const payrollCycleDays = 7;
  const wcPctRev = rev > 0 ? ((peakCashNeed / rev) * 100).toFixed(1) : '0';

  const riskLevel: CalculationResult['riskLevel'] = gap === 0 ? 'Low' : gap < rev * 0.25 ? 'Medium' : gap < rev * 0.5 ? 'High' : 'Critical';

  return {
    primaryMetrics: [
      { label: 'CASH GAP', value: `${fmt(peakCashNeed)} in operating cash reserves needed` },
      { label: 'MONTHLY SHORTFALL', value: `Collect in ${collDays} days | Pay materials in ${matPayDays} days | Gap: ${cashGapDays} days` },
      { label: 'FINANCING COST', value: `${fmt(dailyRev)}/day revenue | ${fmt(dailyCashDrain)}/day cash drain during gap` },
      { label: 'CASH POSITION', value: `Reduce cash need by ${fmt(cashFreed)} with faster collections` },
    ],
    riskLevel,
    summary: gap === 0 ? 'Strong cash position with no projected shortfalls.' : `Cash gap of ${fmt(gap)} projected within ${gapDays} days.`,
    scoreBreakdown: [
      { label: 'Cash Health', value: Math.max(0, Math.min(100, 100 - (gap / (rev || 1)) * 200)) },
      { label: 'Collection Efficiency', value: Math.max(0, Math.min(100, 100 - collDays)) },
      { label: 'Retainage Risk', value: Math.max(0, Math.min(100, 100 - retPct * 5)) },
      { label: 'Payroll Coverage', value: availCash > payroll ? 100 : Math.min(100, (availCash / (payroll || 1)) * 100) },
    ],
    recommendations: [
      gap > rev * 0.25 ? `Establish ${fmt(peakCashNeed * 1.2)} credit line for buffer` : 'Current credit facilities appear adequate',
      collDays > 45 ? 'Reduce collection days to 30 — accelerate invoicing and follow-up' : 'Collection cycle is healthy',
      retPct > 10 ? 'Negotiate monthly retainage release schedules' : 'Retainage percentage is manageable',
      equip > rev * 0.2 ? 'Stagger equipment purchases to smooth cash flow' : 'Equipment spending is balanced',
      `Implement daily cash-flow tracking dashboard to improve visibility`,
      `Build reserves in strong months to cover seasonal variance`,
    ],
    detailedAnalysis: {
      title: 'DETAILED ANALYSIS',
      subtitle: 'WORKING CAPITAL & CASH FLOW CYCLE ANALYSIS',
      sections: [
        {
          title: 'BUSINESS PROFILE:',
          items: [
            `Monthly revenue: ${fmt(rev)}`,
            `Annual estimated revenue: ${fmt(annualRev)}`,
            `Current open receivables: ${fmt(openAR)}`,
            `Cash reserves target: <1 month`,
            `Cash flow visibility: ${collDays > 45 ? 'Limited visibility' : 'Moderate visibility'}`,
            `Seasonal revenue pattern: Moderate fluctuation`,
          ],
        },
        {
          title: 'BUSINESS CASH CYCLE:',
          items: [
            `Daily revenue: ${fmt(dailyRev)}/day`,
            `Collection cycle: ${collDays} days to receive payment (${collEfficiency})`,
            `Material payment terms: Net ${matPayDays} (estimate 38% of revenue)`,
            `Payroll cycle: Every ${payrollCycleDays} days (${payrollCycleLabel})`,
            `Subcontractor payment: Net 30 (8% retention typical)`,
            `Retention holdback: ~${retPct}% of project revenue (${fmt(retHeld)})`,
          ],
        },
        {
          title: 'CASH FLOW GAP:',
          items: [
            `You invoice today (Day 0)`,
            `You pay materials by Day ${matPayDays}`,
            `You receive payment by Day ${collDays}`,
            `CASH GAP: ${cashGapDays} days without customer payment`,
            `Daily cash drain during gap: ${fmt(dailyCashDrain)}/day`,
            `Peak cash requirement: ${fmt(peakCashNeed)}`,
          ],
        },
        {
          title: 'CASH CYCLE PRESSURE POINTS:',
          items: [
            `Payroll must be paid every ${payrollCycleDays} days (non-negotiable)`,
            `Materials due in ${matPayDays} days (negotiate with suppliers?)`,
            `GC payment arrives in ${collDays} days (negotiable?)`,
            `If all timing aligns worst-case: ${fmt(peakCashNeed)} gap between payroll outflow and customer payment`,
          ],
        },
        {
          title: 'FINANCIAL IMPACT:',
          items: [
            `Working capital tied up: ${fmt(peakCashNeed)}`,
            `If financed via line of credit @ ${(financingRate * 100).toFixed(0)}%: ${fmt(monthlyInterest)}/month in interest costs`,
            `Annual carrying cost: ${fmt(annualCarrying)}/year`,
          ],
        },
        {
          title: 'IMPROVEMENT OPPORTUNITY:',
          items: [
            `Industry best practice: Collect in ${bestPracticeDays} days (you're at ${collDays})`,
            `If you improved to ${bestPracticeDays}-day collection: ${fmt(cashFreed)} cash freed up`,
            `Savings from reduced financing costs: ${fmt(savedMonthly)}/month (${fmt(savedAnnual)}/year)`,
          ],
        },
      ],
    },
    actionPlan: {
      title: 'ACTION PLAN',
      subtitle: 'WORKING CAPITAL OPTIMIZATION & CASH FLOW STRATEGY',
      phases: [
        {
          title: 'PHASE 1: CURRENT STATE AUDIT (Week 1)',
          description: 'Identify cash cycle bottlenecks:',
          items: [
            `Pull last 12 invoices -- verify actual collection time vs. ${collDays}-day assumption`,
            `Are any customers paying late? (Collection effectiveness currently: ${collEfficiency})`,
            `Review supplier terms -- can you negotiate early pay discounts on material costs?`,
            `Check payroll schedule -- currently ${payrollCycleLabel} (${payrollCycleDays} days); can you align to job completion instead?`,
            `Assess credit line capacity and availability`,
            `Document retention holdback (${retPct}%) impact on cash timing`,
            `CRITICAL: Plan for seasonal revenue swings`,
            `Map all upcoming equipment expenditures: ${fmt(equip)} over 90 days`,
          ],
        },
        {
          title: `PHASE 2: ACCELERATE COLLECTIONS (Week 2-4)`,
          description: `Reduce ${collDays}-day collection cycle:`,
          items: [
            `Target: ${bestPracticeDays}-day collection (saves ${fmt(cashFreed)} cash)`,
            `Invoice immediately upon project completion/milestone (don't wait for paperwork)`,
            `Invoice weekly on long projects (don't batch at end)`,
            `Establish 10-day net payment terms in contracts (vs. standard 30)`,
            `Offer 2% early pay discount if paid within 10 days`,
            `Follow up on unpaid invoices within 5 days (before they age)`,
            `Escalate 30+ day overdue invoices to owner/GC`,
            `GC Payment Terms Negotiation:`,
            `  Standard: Net 30-45 from invoice date`,
            `  Better: Net 30 from receipt/completion`,
            `  Best: Recurring invoicing (weekly draws = faster payment)`,
            `  Request: Joint check to subs to reduce holdback risk`,
          ],
        },
        {
          title: 'PHASE 3: EXTEND PAYABLES (Week 3-5)',
          description: 'Stretch outflows to match inflows:',
          items: [
            `Material payment: Current Net ${matPayDays} -- Target Net 45 (negotiate extended terms)`,
            `Or: Pay via credit card (extends 30 days + earn cashback)`,
            `Savings: Additional float from extended material terms`,
            `Payroll optimization: Currently ${payrollCycleLabel} (${payrollCycleDays}-day cycle)`,
            `If possible: Bi-weekly (stretch to 14 days)`,
            `Cash freed from payroll timing: ${fmt(payroll / 6)}`,
          ],
        },
        {
          title: 'PHASE 4: LINE OF CREDIT BACKUP (Week 4-5)',
          description: 'Secure financing to bridge gap:',
          items: [
            `Establish revolving line of credit NOW (before you need it desperately)`,
            `Target: ${fmt(peakCashNeed)} available`,
            `Typical rate: 8-12% for contractor lines (better than factoring at 3-5%/month)`,
            `Use only to bridge the ${cashGapDays}-day gap`,
            `Pay off monthly once collections arrive`,
            `Cost: ~${fmt(monthlyInterest)}/month interest if fully drawn`,
          ],
        },
        {
          title: 'PHASE 5: GROWTH PLANNING (Ongoing)',
          description: 'As you grow revenue:',
          items: [
            `Monitor cash cycle pressure: ${fmt(rev)} x (${cashGapDays} days) = working capital needed`,
            `Every $100K revenue growth = ${fmt(100000 * (cashGapDays / 30))} additional cash required`,
            `Build cash reserves in strong months for slower periods`,
            `Plan for seasonal swings: Account for 10-15% seasonal variance`,
            `Implement daily cash flow tracking to improve visibility`,
          ],
        },
      ],
    },
    measurement: {
      title: 'MEASUREMENT:',
      items: [
        `Monthly KPIs:`,
        `Days sales outstanding (DSO): Track actual collection days (target: ${bestPracticeDays})`,
        `Days payable outstanding (DPO): Track payment timing (target: extend by 5-10 days)`,
        `Working capital as % of revenue: ${wcPctRev}% (target: <15%)`,
      ],
    },
    expectedOutcomes: {
      title: 'EXPECTED OUTCOMES:',
      items: [
        `Reduce cash gap from ${fmt(peakCashNeed)} to ${fmt(0)}`,
        `Improve cash position by ${fmt(cashFreed)}`,
        `Eliminate need for expensive factoring/financing`,
        `Reduce financing costs by ${fmt(savedMonthly)}/month`,
        `Build reserves for seasonal slowdowns and unexpected costs`,
      ],
    },
  };
}

// ============================================================================
// TOOL 2: MARGIN EROSION MONITOR
// ============================================================================

export function calculateMarginErosionMonitor(inputs: Record<string, any>): CalculationResult {
  const contract = n(inputs.contractValue);
  const targetPct = n(inputs.estimatedMarginPercent);
  const labor = n(inputs.laborCost);
  const material = n(inputs.materialCost);
  const equipment = n(inputs.equipmentCost);
  const sub = n(inputs.subcontractorCost);
  const co = n(inputs.changeOrderValue);

  const adjustedContract = contract + co;
  const totalCost = labor + material + equipment + sub;
  const targetProfit = contract * (targetPct / 100);
  const actualProfit = adjustedContract - totalCost;
  const actualPct = adjustedContract > 0 ? (actualProfit / adjustedContract) * 100 : 0;
  const marginGap = targetPct - actualPct;
  const dollarLoss = targetProfit - actualProfit;
  const overrun = totalCost - (contract * (1 - targetPct / 100));

  const budgetedLabor = contract * 0.40;
  const budgetedMat = contract * 0.25;
  const budgetedEquip = contract * 0.10;
  void (contract * (1 - targetPct / 100) - budgetedLabor - budgetedMat - budgetedEquip);

  const laborVar = budgetedLabor > 0 ? ((labor - budgetedLabor) / budgetedLabor * 100) : 0;
  const matVar = budgetedMat > 0 ? ((material - budgetedMat) / budgetedMat * 100) : 0;
  const laborImpact = Math.max(0, labor - budgetedLabor);
  const matImpact = Math.max(0, material - budgetedMat);

  const erosionCause = laborVar > matVar ? 'Labor productivity and cost overruns' : 'Material cost escalation and waste';
  const patternFreq = marginGap > 5 ? 'Frequent (>50% of projects)' : marginGap > 2 ? 'Occasional (25-50%)' : 'Rare (<25%)';
  const lostPctOfIntended = targetProfit > 0 ? ((dollarLoss / targetProfit) * 100).toFixed(1) : '0';
  const schedDays = Math.round(marginGap * 2);

  const riskLevel: CalculationResult['riskLevel'] = marginGap <= 0 ? 'Low' : marginGap < 3 ? 'Medium' : marginGap < 7 ? 'High' : 'Critical';

  return {
    primaryMetrics: [
      { label: 'MARGIN GAP', value: `Target: ${targetPct.toFixed(1)}% | Actual: ${actualPct.toFixed(1)}% | Gap: ${marginGap.toFixed(1)}% (${fmt(Math.abs(dollarLoss))} ${dollarLoss > 0 ? 'lost' : 'gained'})` },
      { label: 'EROSION FACTORS', value: `Contract: ${fmt(contract)} at ${targetPct.toFixed(1)}% margin | Current value: ${fmt(adjustedContract)} | Overrun: ${fmt(Math.max(0, overrun))} | Labor variance: ${laborVar.toFixed(1)}%, Material variance: ${matVar.toFixed(1)}%` },
      { label: 'PROFIT IMPACT', value: `Contracted profit: ${fmt(targetProfit)} | Actual profit: ${fmt(actualProfit)} | Shortfall: ${fmt(Math.max(0, dollarLoss))} | Primary cause: ${erosionCause}` },
      { label: 'RECOVERY ACTIONS', value: `Primary cause: ${erosionCause}. Pattern: ${patternFreq}. Process maturity: Basic spreadsheet-based` },
    ],
    riskLevel,
    summary: marginGap <= 2 ? `Margin is ${actualPct.toFixed(1)}%. Within acceptable tolerance.` : `Margin eroded ${marginGap.toFixed(1)}% from budget. Immediate cost control required.`,
    scoreBreakdown: [
      { label: 'Margin Health', value: Math.max(0, Math.min(100, (actualPct / Math.max(targetPct, 1)) * 100)) },
      { label: 'Labor Cost Control', value: Math.max(0, Math.min(100, 100 - Math.max(0, laborVar))) },
      { label: 'Material Cost Control', value: Math.max(0, Math.min(100, 100 - Math.max(0, matVar))) },
      { label: 'Change Order Recovery', value: co > 0 ? Math.min(100, (co / Math.max(overrun, 1)) * 100) : 50 },
    ],
    recommendations: [
      marginGap > 5 ? 'Implement immediate cost freeze on discretionary expenses' : 'Continue current cost monitoring',
      laborVar > 5 ? `Labor is ${laborVar.toFixed(1)}% over budget — implement daily task tracking` : 'Labor costs are controlled',
      matVar > 5 ? `Material costs ${matVar.toFixed(1)}% over — lock supplier pricing immediately` : 'Material costs tracking well',
      `Establish weekly cost-to-complete reviews on all active projects`,
      `Create earned-value tracking dashboard for real-time margin visibility`,
    ],
    detailedAnalysis: {
      title: 'DETAILED BREAKDOWN',
      subtitle: 'MARGIN EROSION ANALYSIS',
      sections: [
        {
          title: 'MARGIN EROSION ANALYSIS',
          items: [
            `Contract Value: ${fmt(contract)} | Target Margin: ${targetPct.toFixed(1)}% | Target Profit: ${fmt(targetProfit)}`,
            `Current Project Value: ${fmt(adjustedContract)} | Cost Overrun: ${fmt(Math.max(0, overrun))}`,
            `Actual Profit: ${fmt(actualProfit)} | Actual Margin: ${actualPct.toFixed(1)}% | Margin Gap: ${marginGap.toFixed(1)}%`,
          ],
        },
        {
          title: 'VARIANCE BREAKDOWN:',
          items: [
            `Labor Cost Variance: ${laborVar.toFixed(1)}% (Impact: ${fmt(laborImpact)})`,
            `Material Cost Variance: ${matVar.toFixed(1)}% (Impact: ${fmt(matImpact)})`,
            `Schedule Impact: ${schedDays} days (Overhead: ${fmt(schedDays * 333)})`,
            `Total Estimate Variance: ${marginGap.toFixed(1)}% (Impact: ${fmt(Math.max(0, dollarLoss))})`,
            ``,
            `PRIMARY EROSION CAUSE: ${erosionCause}`,
            `PROJECT COMPLEXITY: ${contract > 1000000 ? 'High' : contract > 500000 ? 'Medium' : 'Standard'}`,
            `PATTERN FREQUENCY: ${patternFreq}`,
            `PROCESS MATURITY: Basic spreadsheet-based`,
            `ACCOUNTING CAPABILITY: Limited real-time visibility`,
            ``,
            `This project ${dollarLoss > 0 ? 'lost' : 'gained'} ${fmt(Math.abs(dollarLoss))} in profit (${lostPctOfIntended}% of intended).`,
          ],
        },
      ],
    },
    actionPlan: {
      title: 'RECOVERY PLAN',
      subtitle: `ROOT CAUSE: ${erosionCause} | PATTERN: ${patternFreq} | PROCESS LEVEL: Basic spreadsheet-based`,
      phases: [
        {
          title: 'IMMEDIATE DIAGNOSTICS:',
          items: [
            `1. Analyze variance by category - Labor: ${laborVar.toFixed(1)}%, Materials: ${matVar.toFixed(1)}%, Schedule: ${schedDays}d`,
            `2. Pull last 5 similar projects for pattern analysis`,
            `3. Trace cost overrun of ${fmt(Math.max(0, overrun))} to specific line items`,
          ],
        },
        {
          title: 'RECOVERY TARGETS (60 days):',
          items: [
            `Reduce margin gap from ${marginGap.toFixed(1)}% to ${(marginGap / 2).toFixed(1)}%`,
            `Recover ${fmt(dollarLoss > 0 ? dollarLoss * 0.4 : 0)} of lost profit`,
            `Implement cost controls for ${erosionCause}`,
            ``,
            `LABOR FOCUS: ${laborVar.toFixed(1)}% variance = ${fmt(laborImpact)} impact. Implement daily task tracking, analyze which activities overran.`,
            `MATERIAL FOCUS: ${matVar.toFixed(1)}% variance = ${fmt(matImpact)} impact. Lock supplier pricing, implement inventory controls.`,
            `SCHEDULE FOCUS: ${schedDays} day overrun = ${fmt(schedDays * 333)} overhead. Add 10% buffer on similar projects.`,
          ],
        },
      ],
    },
    measurement: {
      title: 'MEASUREMENT:',
      items: [
        `Weekly margin tracking per project (target: ${targetPct}% minimum)`,
        `Labor productivity rate (hours per unit of work installed)`,
        `Material waste factor (target: <5% of material budget)`,
        `Change order capture rate (target: 100% of out-of-scope work)`,
      ],
    },
    expectedOutcomes: {
      title: 'EXPECTED OUTCOMES:',
      items: [
        `Recover ${fmt(dollarLoss > 0 ? dollarLoss * 0.4 : 0)} in lost margin within 60 days`,
        `Reduce labor variance from ${laborVar.toFixed(1)}% to <5%`,
        `Establish real-time cost visibility across all active projects`,
        `Prevent margin erosion on future projects through proactive monitoring`,
      ],
    },
  };
}

// ============================================================================
// TOOL 3: OVERHEAD BENCHMARKER
// ============================================================================

export function calculateOverheadBenchmarker(inputs: Record<string, any>): CalculationResult {
  const rev = n(inputs.annualRevenue);
  const oh = n(inputs.totalOverhead);
  const rent = n(inputs.officeRent);
  const ins = n(inputs.insurance);
  const admin = n(inputs.adminSalaries);
  const vehicles = n(inputs.vehicleCosts);
  const software = n(inputs.softwareCosts);

  const ohPct = rev > 0 ? (oh / rev) * 100 : 0;
  const benchLow = 16;
  const benchHigh = 18;
  const benchTarget = (benchLow + benchHigh) / 2;
  const gapPct = ohPct - benchTarget;
  const gapDollar = rev * (gapPct / 100);
  const rentPct = rev > 0 ? (rent / rev) * 100 : 0;
  const insPct = rev > 0 ? (ins / rev) * 100 : 0;
  const adminPct = rev > 0 ? (admin / rev) * 100 : 0;
  const vehPct = rev > 0 ? (vehicles / rev) * 100 : 0;
  const swPct = rev > 0 ? (software / rev) * 100 : 0;
  const otherOH = oh - rent - ins - admin - vehicles - software;

  const rentBench = 2.5;
  const insBench = 4.0;
  const adminBench = 6.0;
  const vehBench = 1.5;
  const swBench = 1.0;

  const rentSavings = Math.max(0, (rentPct - rentBench) / 100 * rev);
  const insSavings = Math.max(0, (insPct - insBench) / 100 * rev);
  const adminSavings = Math.max(0, (adminPct - adminBench) / 100 * rev);
  const vehSavings = Math.max(0, (vehPct - vehBench) / 100 * rev);
  const totalPotentialSavings = rentSavings + insSavings + adminSavings + vehSavings;

  const tier = rev < 5000000 ? 'Small ($1-5M)' : rev < 15000000 ? 'Mid-Market ($5-15M)' : rev < 50000000 ? 'Upper Mid-Market ($15-50M)' : 'Large ($50M+)';
  const riskLevel: CalculationResult['riskLevel'] = ohPct <= benchHigh ? 'Low' : ohPct <= 22 ? 'Medium' : ohPct <= 26 ? 'High' : 'Critical';

  return {
    primaryMetrics: [
      { label: 'OVERHEAD RATIO', value: `${ohPct.toFixed(1)}% of revenue (${fmt(oh)} on ${fmt(rev)})` },
      { label: 'INDUSTRY BENCHMARK', value: `${benchLow}-${benchHigh}% for ${tier} contractors | You are ${gapPct > 0 ? gapPct.toFixed(1) + '% above' : Math.abs(gapPct).toFixed(1) + '% below'} benchmark` },
      { label: 'GAP ANALYSIS', value: `${gapPct > 0 ? fmt(gapDollar) + ' excess overhead vs. peers' : 'Within benchmark range'}` },
      { label: 'SAVINGS OPPORTUNITY', value: `${fmt(totalPotentialSavings)} annual savings identified across ${[rentSavings > 0, insSavings > 0, adminSavings > 0, vehSavings > 0].filter(Boolean).length} categories` },
    ],
    riskLevel,
    summary: ohPct <= benchHigh ? `Overhead at ${ohPct.toFixed(1)}% is within industry benchmark.` : `Overhead is ${gapPct.toFixed(1)}% above benchmark. ${fmt(totalPotentialSavings)} in potential annual savings.`,
    scoreBreakdown: [
      { label: 'Overall Overhead', value: Math.max(0, Math.min(100, (1 - ohPct / 30) * 100)) },
      { label: 'Rent Efficiency', value: Math.max(0, Math.min(100, (1 - rentPct / 5) * 100)) },
      { label: 'Insurance Optimization', value: Math.max(0, Math.min(100, (1 - insPct / 8) * 100)) },
      { label: 'Admin Efficiency', value: Math.max(0, Math.min(100, (1 - adminPct / 10) * 100)) },
    ],
    recommendations: [
      gapPct > 3 ? `Target ${fmt(totalPotentialSavings)} in annual overhead reductions` : 'Overhead is competitive — maintain current cost discipline',
      rentPct > rentBench ? `Office rent at ${rentPct.toFixed(1)}% vs. ${rentBench}% benchmark — consider consolidation (save ${fmt(rentSavings)}/year)` : 'Rent costs are in line',
      insPct > insBench ? `Insurance at ${insPct.toFixed(1)}% vs. ${insBench}% benchmark — renegotiate or shop carriers (save ${fmt(insSavings)}/year)` : 'Insurance costs are competitive',
      adminPct > adminBench ? `Admin salaries at ${adminPct.toFixed(1)}% — automate manual processes to reduce headcount needs` : 'Admin costs are efficient',
      `Implement monthly overhead-to-revenue tracking dashboard`,
    ],
    detailedAnalysis: {
      title: 'DETAILED ANALYSIS',
      subtitle: 'OVERHEAD COST BENCHMARKING & OPTIMIZATION',
      sections: [
        {
          title: 'COMPANY PROFILE:',
          items: [
            `Annual Revenue: ${fmt(rev)}`,
            `Revenue Tier: ${tier}`,
            `Total Overhead: ${fmt(oh)} (${ohPct.toFixed(1)}% of revenue)`,
            `Industry Benchmark: ${benchLow}-${benchHigh}% for your revenue tier`,
            `Gap to Benchmark: ${gapPct > 0 ? '+' : ''}${gapPct.toFixed(1)}% (${gapPct > 0 ? fmt(gapDollar) + ' excess' : 'within range'})`,
          ],
        },
        {
          title: 'OVERHEAD BREAKDOWN BY CATEGORY:',
          items: [
            `Office Rent: ${fmt(rent)} (${rentPct.toFixed(1)}% of revenue | Benchmark: ${rentBench}%)`,
            `Insurance (all types): ${fmt(ins)} (${insPct.toFixed(1)}% | Benchmark: ${insBench}%)`,
            `Admin Salaries: ${fmt(admin)} (${adminPct.toFixed(1)}% | Benchmark: ${adminBench}%)`,
            `Vehicle Costs: ${fmt(vehicles)} (${vehPct.toFixed(1)}% | Benchmark: ${vehBench}%)`,
            `Software & Tech: ${fmt(software)} (${swPct.toFixed(1)}% | Benchmark: ${swBench}%)`,
            `Other Overhead: ${fmt(otherOH)} (${rev > 0 ? ((otherOH / rev) * 100).toFixed(1) : 0}%)`,
          ],
        },
        {
          title: 'SAVINGS OPPORTUNITY BY CATEGORY:',
          items: [
            `Rent: ${rentSavings > 0 ? fmt(rentSavings) + '/year — consolidate locations or renegotiate lease' : 'At or below benchmark'}`,
            `Insurance: ${insSavings > 0 ? fmt(insSavings) + '/year — shop carriers, improve EMR, raise deductibles' : 'At or below benchmark'}`,
            `Admin: ${adminSavings > 0 ? fmt(adminSavings) + '/year — automate with integrated ERP/PM software' : 'At or below benchmark'}`,
            `Vehicles: ${vehSavings > 0 ? fmt(vehSavings) + '/year — optimize fleet, evaluate leasing vs. ownership' : 'At or below benchmark'}`,
            `TOTAL POTENTIAL SAVINGS: ${fmt(totalPotentialSavings)}/year`,
          ],
        },
        {
          title: 'FINANCIAL IMPACT:',
          items: [
            `Every 1% overhead reduction = ${fmt(rev * 0.01)} straight to bottom line`,
            `If overhead reduced to ${benchTarget}%: ${fmt(Math.max(0, gapDollar))} additional profit annually`,
            `Overhead dollars per employee: ${fmt(oh / 45)} (assuming ~45 employees)`,
            `Overhead dollars per $1M revenue: ${fmt(oh / (rev / 1000000))}`,
          ],
        },
      ],
    },
    actionPlan: {
      title: 'ACTION PLAN',
      subtitle: 'OVERHEAD REDUCTION & OPTIMIZATION STRATEGY',
      phases: [
        {
          title: 'PHASE 1: COST AUDIT (Week 1-2)',
          items: [
            `Pull 12-month P&L and categorize every overhead line item`,
            `Identify top 5 overhead costs by dollar amount`,
            `Benchmark each category against industry standards`,
            `Flag any costs that have increased >10% year-over-year`,
            `Review all contracts and subscriptions for unused/redundant services`,
          ],
        },
        {
          title: 'PHASE 2: QUICK WINS (Week 3-6)',
          description: 'Target: ${fmt(totalPotentialSavings * 0.3)} in immediate savings',
          items: [
            `Renegotiate insurance premiums — get 3 competitive quotes`,
            `Cancel unused software subscriptions and consolidate tools`,
            `Review vehicle fleet — eliminate underutilized vehicles`,
            `Negotiate early-pay discounts with key vendors`,
            `Implement purchase approval thresholds to control spending`,
          ],
        },
        {
          title: 'PHASE 3: STRUCTURAL CHANGES (Month 2-4)',
          items: [
            `Evaluate office space needs — can you downsize or share?`,
            `Implement integrated construction ERP to reduce admin headcount`,
            `Cross-train admin staff to improve flexibility and reduce redundancy`,
            `Establish overhead budget with monthly variance reporting`,
            `Set overhead-to-revenue target: ${benchTarget}% by year-end`,
          ],
        },
      ],
    },
    measurement: {
      title: 'MEASUREMENT:',
      items: [
        `Monthly overhead ratio tracking (target: ${benchTarget}%)`,
        `Category-level spend vs. budget variance`,
        `Overhead per revenue dollar trend (quarterly)`,
        `Admin headcount ratio: 1 admin per ${fmt(rev / Math.max(admin / 60000, 1))} revenue`,
      ],
    },
    expectedOutcomes: {
      title: 'EXPECTED OUTCOMES:',
      items: [
        `Reduce overhead ratio from ${ohPct.toFixed(1)}% to ${benchTarget}%`,
        `Save ${fmt(totalPotentialSavings)} annually in overhead costs`,
        `Improve net profit margin by ${gapPct > 0 ? gapPct.toFixed(1) : '0'}%`,
        `Free up capital for growth investment and bonding capacity`,
        `Establish sustainable cost discipline culture`,
      ],
    },
  };
}

// ============================================================================
// TOOL 4: WIN RATE TRACKER
// ============================================================================

export function calculateWinRateTracker(inputs: Record<string, any>): CalculationResult {
  const bids = n(inputs.totalBidsSubmitted);
  const wins = n(inputs.bidsWon);
  const avgBid = n(inputs.avgBidValue);
  const trade = inputs.primaryTradeType || 'general';
  const period = inputs.timePeriod || '1year';

  const winRate = bids > 0 ? (wins / bids) * 100 : 0;
  const losses = bids - wins;
  const pipelineValue = wins * avgBid;
  const totalBidValue = bids * avgBid;
  const lostValue = losses * avgBid;
  const bidCostPerBid = avgBid * 0.015;
  const totalBidCost = bidCostPerBid * bids;
  const costPerWin = wins > 0 ? totalBidCost / wins : 0;

  const tradeBench: Record<string, number> = { electrical: 28, plumbing: 26, carpentry: 30, concrete: 25, masonry: 22, painting: 32, roofing: 27, general: 25 };
  const bench = tradeBench[trade] || 25;
  const gapToBench = winRate - bench;
  const periodLabel: Record<string, string> = { '30days': 'Last 30 Days', '90days': 'Last 90 Days', '6months': 'Last 6 Months', '1year': 'Last Year', ytd: 'Year to Date' };
  const tradeLabel: Record<string, string> = { electrical: 'Electrical', plumbing: 'Plumbing & HVAC', carpentry: 'Carpentry & Framing', concrete: 'Concrete', masonry: 'Masonry', painting: 'Painting & Drywall', roofing: 'Roofing', general: 'General Contracting' };

  const additionalWinsIfBench = Math.max(0, Math.round(bids * (bench / 100) - wins));
  const additionalRevenue = additionalWinsIfBench * avgBid;
  const riskLevel: CalculationResult['riskLevel'] = winRate >= bench ? 'Low' : winRate >= bench * 0.7 ? 'Medium' : winRate >= bench * 0.5 ? 'High' : 'Critical';

  return {
    primaryMetrics: [
      { label: 'WIN RATE', value: `${winRate.toFixed(1)}% (${wins} of ${bids} bids won) | ${tradeLabel[trade] || trade} benchmark: ${bench}%` },
      { label: 'PIPELINE VALUE', value: `${fmt(pipelineValue)} awarded from ${fmt(totalBidValue)} total bid volume | ${fmt(lostValue)} in lost opportunities` },
      { label: 'BID ECONOMICS', value: `${fmt(totalBidCost)} total estimating investment | ${fmt(costPerWin)} cost-per-win | ROI: ${wins > 0 ? ((pipelineValue / totalBidCost) * 100).toFixed(0) : 0}%` },
      { label: 'IMPROVEMENT OPPORTUNITY', value: `${additionalWinsIfBench} additional wins worth ${fmt(additionalRevenue)} if you reach ${bench}% benchmark` },
    ],
    riskLevel,
    summary: gapToBench >= 0 ? `Win rate of ${winRate.toFixed(1)}% exceeds ${tradeLabel[trade] || trade} benchmark of ${bench}%.` : `Win rate ${Math.abs(gapToBench).toFixed(1)}% below benchmark. Estimating process review recommended.`,
    scoreBreakdown: [
      { label: 'Win Rate vs. Benchmark', value: Math.min(100, (winRate / bench) * 100) },
      { label: 'Bid Volume', value: Math.min(100, (bids / 40) * 100) },
      { label: 'Pipeline Conversion', value: Math.min(100, winRate * 2.5) },
      { label: 'Bid ROI', value: Math.min(100, wins > 0 ? (pipelineValue / totalBidCost / 10) * 100 : 0) },
    ],
    recommendations: [
      winRate < bench ? `Focus estimating effort on ${tradeLabel[trade] || trade} strengths — your best win probability` : 'Win rate is strong — maintain current bid strategy',
      wins < 5 ? 'Increase bid volume — small sample size makes trends unreliable' : 'Sample size is adequate for trend analysis',
      avgBid > 500000 ? 'Consider breaking large bids into phased proposals to improve close rate' : 'Bid sizing is appropriate for your market',
      `Implement post-bid analysis on losses — track why you lost each bid`,
      `Create a bid/no-bid scorecard to filter out low-probability pursuits`,
      `Target hit-rate of ${bench}% by focusing on repeat clients and core competencies`,
    ],
    detailedAnalysis: {
      title: 'DETAILED ANALYSIS',
      subtitle: 'BID PERFORMANCE & CONVERSION ANALYSIS',
      sections: [
        {
          title: 'BID PERFORMANCE SUMMARY:',
          items: [
            `Period: ${periodLabel[period] || period}`,
            `Total Bids Submitted: ${bids}`,
            `Bids Won: ${wins} (${winRate.toFixed(1)}%)`,
            `Bids Lost: ${losses} (${(100 - winRate).toFixed(1)}%)`,
            `Average Bid Value: ${fmt(avgBid)}`,
            `Total Bid Volume: ${fmt(totalBidValue)}`,
            `Awarded Volume: ${fmt(pipelineValue)}`,
          ],
        },
        {
          title: 'BENCHMARK COMPARISON:',
          items: [
            `Your Win Rate: ${winRate.toFixed(1)}%`,
            `${tradeLabel[trade] || trade} Industry Benchmark: ${bench}%`,
            `Gap to Benchmark: ${gapToBench > 0 ? '+' : ''}${gapToBench.toFixed(1)}%`,
            `Performance Rating: ${gapToBench >= 5 ? 'Excellent — top-quartile performer' : gapToBench >= 0 ? 'Good — at or above benchmark' : gapToBench >= -5 ? 'Below average — improvement needed' : 'Critical — fundamental review needed'}`,
          ],
        },
        {
          title: 'ESTIMATING ECONOMICS:',
          items: [
            `Estimated cost per bid: ${fmt(bidCostPerBid)} (1.5% of bid value in estimating labor)`,
            `Total estimating investment: ${fmt(totalBidCost)} over ${periodLabel[period] || period}`,
            `Cost per win: ${fmt(costPerWin)}`,
            `Bid ROI: ${fmt(pipelineValue)} won ÷ ${fmt(totalBidCost)} invested = ${wins > 0 ? ((pipelineValue / totalBidCost)).toFixed(0) : 0}x return`,
            `Lost bid cost (sunk): ${fmt(totalBidCost - (wins > 0 ? totalBidCost * (wins / bids) : 0))}`,
          ],
        },
        {
          title: 'REVENUE IMPACT:',
          items: [
            `If win rate improved to ${bench}%: ${additionalWinsIfBench} additional projects = ${fmt(additionalRevenue)}`,
            `If win rate improved to ${bench + 5}%: ${Math.round(bids * ((bench + 5) / 100) - wins)} additional projects = ${fmt(Math.round(bids * ((bench + 5) / 100) - wins) * avgBid)}`,
            `Every 1% improvement in win rate = ${fmt(Math.round(bids * 0.01) * avgBid)} additional revenue`,
          ],
        },
      ],
    },
    actionPlan: {
      title: 'ACTION PLAN',
      subtitle: 'BID STRATEGY & WIN RATE OPTIMIZATION',
      phases: [
        {
          title: 'PHASE 1: BID ANALYSIS (Week 1-2)',
          items: [
            `Review last ${losses} lost bids — categorize by reason (price, scope, timing, relationship)`,
            `Identify your highest-probability bid types (trade, size, client type)`,
            `Calculate true cost-to-bid for each opportunity type`,
            `Establish bid/no-bid criteria to filter low-probability pursuits`,
            `Review competitor landscape — who are you losing to and why?`,
          ],
        },
        {
          title: 'PHASE 2: ESTIMATING IMPROVEMENT (Week 3-6)',
          items: [
            `Standardize estimating templates by project type`,
            `Build historical cost database from completed projects`,
            `Implement pre-bid site visits for all opportunities over ${fmt(avgBid)}`,
            `Assign estimators to trade specialties for deeper expertise`,
            `Target ${bench}% win rate through better bid selection`,
          ],
        },
        {
          title: 'PHASE 3: RELATIONSHIP BUILDING (Ongoing)',
          items: [
            `Identify top 10 GCs/clients by repeat-business potential`,
            `Schedule quarterly relationship meetings with key decision-makers`,
            `Build pre-qualified preferred bidder status with target clients`,
            `Track post-bid feedback and adjust approach accordingly`,
            `Focus on becoming the "go-to" sub for your core ${tradeLabel[trade] || trade} specialty`,
          ],
        },
      ],
    },
    measurement: {
      title: 'MEASUREMENT:',
      items: [
        `Win rate by trade type (target: ${bench}%)`,
        `Win rate by client/GC (identify best relationships)`,
        `Cost-per-win trend (target: reduce by 15%)`,
        `Bid volume vs. capacity (avoid over-bidding)`,
        `Average bid margin vs. actual margin on won work`,
      ],
    },
    expectedOutcomes: {
      title: 'EXPECTED OUTCOMES:',
      items: [
        `Improve win rate from ${winRate.toFixed(1)}% to ${bench}%`,
        `Add ${fmt(additionalRevenue)} in annual awarded revenue`,
        `Reduce cost-per-win by focusing estimating effort`,
        `Build stronger client relationships for repeat business`,
        `Optimize bid volume to match available crew capacity`,
      ],
    },
  };
}

// ============================================================================
// TOOL 5: BID/NO-BID DECISION TOOL
// ============================================================================

export function calculateBidNoBidDecisionTool(inputs: Record<string, any>): CalculationResult {
  const projVal = n(inputs.projectValue);
  const terms = inputs.paymentTerms || 'net45';
  const gcRep = inputs.gcReputation || 'neutral';
  const bonding = inputs.bonding || 'no';
  const dist = n(inputs.geoDistance);
  const crew = n(inputs.crewAvailability);
  void (inputs.projectType || 'commercial');
  const comp = inputs.competitionLevel || 'moderate';

  const margin = 0.12;
  const profit = projVal * margin;
  const costOfWork = projVal - profit;

  const termScore: Record<string, number> = { net30: 90, net45: 70, net60: 50, net90: 20, progress: 100, retainage: 15 };
  const gcScore: Record<string, number> = { excellent: 100, good: 80, neutral: 50, poor: 20, unknown: 30 };
  const compWinProb: Record<string, number> = { low: 40, moderate: 25, high: 12 };
  const compCount: Record<string, number> = { low: 4, moderate: 7, high: 12 };

  const winProb = compWinProb[comp] || 25;
  const competitors = compCount[comp] || 7;
  const ev = profit * (winProb / 100);
  const crewWeeksNeeded = Math.ceil(projVal / 85000);
  const availableWeeks = Math.ceil(crewWeeksNeeded * (crew / 100));
  const capacityDeficit = Math.max(0, crewWeeksNeeded - availableWeeks);
  const subContractingCost = capacityDeficit * 85000 * 0.15;
  const profitAfterSub = profit - subContractingCost;
  const bidHours = Math.max(16, Math.round(projVal / 25000));
  const bidCost = bidHours * 90;
  const riskAdj = gcRep === 'poor' || gcRep === 'unknown' ? 1.3 : gcRep === 'neutral' ? 1.15 : 1.0;
  const riskAdjProfit = profit * riskAdj;
  const riskAdjEV = riskAdjProfit * (winProb / 100);
  const wcRequired = projVal * 0.25;
  const dailyCost = costOfWork / (crewWeeksNeeded * 5);
  const dailyRev = projVal / (crewWeeksNeeded * 5);
  const projDuration = crewWeeksNeeded + Math.ceil(capacityDeficit * 0.6);
  const payDelay: Record<string, number> = { net30: 30, net45: 45, net60: 60, net90: 90, progress: 14, retainage: 60 };
  const payDays = payDelay[terms] || 45;

  const totalScore = Math.round(
    (termScore[terms] || 50) * 0.2 +
    (gcScore[gcRep] || 50) * 0.2 +
    (winProb / 40 * 100) * 0.15 +
    (crew) * 0.2 +
    Math.max(0, 100 - dist * 1.5) * 0.1 +
    (bonding === 'no' ? 80 : 50) * 0.15
  );

  const recommendation = totalScore >= 70 ? 'BID — Strong opportunity aligned with capabilities'
    : totalScore >= 45 ? 'CONDITIONAL — Consider strategic value or negotiate terms'
    : 'NO-BID — Risk exceeds return potential';

  const riskLevel: CalculationResult['riskLevel'] = totalScore >= 70 ? 'Low' : totalScore >= 45 ? 'Medium' : totalScore >= 25 ? 'High' : 'Critical';
  const capRisk = capacityDeficit > 0 ? 'HIGH' : crew >= 90 ? 'LOW' : 'MODERATE';

  return {
    primaryMetrics: [
      { label: 'DECISION SCORE', value: `${totalScore}/100 decision score | ${recommendation}` },
      { label: 'RISK ASSESSMENT', value: `${capRisk} capacity risk | ${crewWeeksNeeded} weeks needed, ${availableWeeks} available | Competitive position: ${winProb}% win probability` },
      { label: 'RESOURCE REQUIREMENTS', value: `${crewWeeksNeeded} weeks crew time (${capacityDeficit > 0 ? '+ ' + capacityDeficit + 'wks subcontracting' : 'fully staffed'}) | ${bidHours} hours to estimate | ${fmt(bidCost)} estimating cost` },
      { label: 'EXPECTED VALUE', value: `Base EV: ${fmt(ev)} (${winProb}% x ${fmt(profit)}) | Risk-adjusted: ${fmt(riskAdjEV)} | Strategic EV: ${fmt(ev)}` },
    ],
    riskLevel,
    summary: `Decision score ${totalScore}/100. ${recommendation}.`,
    scoreBreakdown: [
      { label: 'Payment Terms', value: termScore[terms] || 50 },
      { label: 'GC Reputation', value: gcScore[gcRep] || 50 },
      { label: 'Win Probability', value: winProb * 2.5 },
      { label: 'Crew Availability', value: crew },
    ],
    recommendations: [
      totalScore < 45 ? 'Pass on this opportunity — risk exceeds return' : 'Consider pursuing with negotiated terms',
      gcRep === 'poor' || gcRep === 'unknown' ? 'Request credit references and payment history from GC before bidding' : 'GC reputation is acceptable',
      capacityDeficit > 0 ? `${capacityDeficit} weeks must be subcontracted at ${fmt(subContractingCost)} premium` : 'Crew capacity is sufficient',
      dist > 30 ? `${dist}-mile distance adds significant travel cost — factor into bid` : 'Distance is manageable',
      bonding === 'yes' ? 'Verify bonding capacity before committing estimating resources' : 'No bonding required',
    ],
    detailedAnalysis: {
      title: 'DETAILED ANALYSIS',
      subtitle: 'BID DECISION ANALYSIS & GO/NO-GO FRAMEWORK',
      sections: [
        {
          title: 'EXECUTIVE SUMMARY:',
          items: [
            `Bid value: ${fmt(projVal)}`,
            `Profit margin: ${(margin * 100).toFixed(1)}% (${fmt(profit)})`,
            `Expected value: ${fmt(ev)} (${(ev / projVal * 100).toFixed(1)}% of bid)`,
            `Decision score: ${totalScore}/100`,
            `Recommendation: ${recommendation}`,
          ],
        },
        {
          title: 'BID FINANCIAL METRICS:',
          items: [
            `Contract value: ${fmt(projVal)}`,
            `Target margin: ${(margin * 100).toFixed(0)}%`,
            `Projected profit: ${fmt(profit)}`,
            `Estimated cost of work: ${fmt(costOfWork)}`,
            `Profit after subcontracting: ${fmt(profitAfterSub)}`,
          ],
        },
        {
          title: 'COMPETITIVE ANALYSIS & WIN PROBABILITY:',
          items: [
            `Estimated win probability: ${winProb}%`,
            `Estimated competitors: ${competitors}`,
            `Competitive position: ${comp.toUpperCase()}`,
            ``,
            `Probability Sensitivity Analysis:`,
            `  If bid is favored: ${Math.min(60, winProb * 1.6).toFixed(0)}% win probability | ${fmt(profit * Math.min(60, winProb * 1.6) / 100)} EV`,
            `  If bid is standard: ${winProb}% win probability | ${fmt(ev)} EV`,
            `  If bid is unfavored: ${Math.max(5, winProb * 0.4).toFixed(0)}% win probability | ${fmt(profit * Math.max(5, winProb * 0.4) / 100)} EV`,
          ],
        },
        {
          title: 'ESTIMATING INVESTMENT & COST-TO-BID:',
          items: [
            `Hours required to bid: ${bidHours}`,
            `Labor rate: $90/hour`,
            `Direct bid cost: ${fmt(bidCost)}`,
            `Cost-to-bid as % of profit: ${(bidCost / profit * 100).toFixed(0)}% of ${fmt(profit)} = ${fmt(bidCost)}`,
            `ROI on bid cost: ${((profit / bidCost) * 100).toFixed(0)}%`,
            `Bid breakeven: Win probability needed for EV = bid cost = ${(bidCost / profit * 100).toFixed(1)}%`,
          ],
        },
        {
          title: 'CAPACITY & RESOURCE ANALYSIS:',
          items: [
            `Field crew weeks required: ${crewWeeksNeeded}`,
            `Available capacity weeks: ${availableWeeks}`,
            `Capacity surplus/deficit: ${capacityDeficit > 0 ? '-' : '+'}${Math.abs(crewWeeksNeeded - availableWeeks)} weeks`,
            `Capacity risk level: ${capRisk}`,
            `Subcontracting needed: ${capacityDeficit > 0 ? 'YES - ' + capacityDeficit + ' weeks @ ~15% premium' : 'NO'}`,
            `Subcontracting cost impact: ${fmt(subContractingCost)}`,
            `Project duration: ${projDuration} weeks`,
          ],
        },
        {
          title: 'WORKING CAPITAL & CASH FLOW IMPACT:',
          items: [
            `Working capital required: ${fmt(wcRequired)}`,
            `Daily cost outflow: ${fmt(dailyCost)}`,
            `Daily revenue inflow: ${fmt(dailyRev)}`,
            `Payment cycle impact: ${payDays} days delay in customer payment`,
            `Total capital at risk: ${fmt(wcRequired)}`,
            ``,
            `Cash Flow Stress Test:`,
            `  If project runs 20% over: ${fmt(wcRequired * 1.2)} capital needed`,
            `  If payment delayed additional 30 days: ${fmt(wcRequired + dailyCost * 30)} capital needed`,
            `  Liquidity buffer recommended: ${fmt(wcRequired * 1.3)}`,
          ],
        },
      ],
    },
    actionPlan: {
      title: 'RECOMMENDATION',
      subtitle: `FINAL RECOMMENDATION: ${recommendation}`,
      phases: [
        {
          title: 'DECISION FACTORS:',
          items: [
            `${totalScore < 50 ? '[X]' : '[OK]'} Decision score: ${totalScore}/100`,
            `${ev < bidCost ? '[X] Expected value below bid cost' : '[OK] Expected value exceeds bid cost'}`,
            `${capacityDeficit > 0 ? '[X] Capacity constrained (need ' + capacityDeficit + ' weeks subcontracting @ ' + fmt(subContractingCost) + ')' : '[OK] Capacity available'}`,
            `${winProb >= 20 ? '[OK]' : '[X]'} Win probability: ${winProb}%`,
            `${margin >= 0.10 ? '[OK]' : '[X]'} Margin: ${(margin * 100).toFixed(0)}%`,
          ],
        },
        {
          title: 'SUBMISSION STRATEGY:',
          items: [
            totalScore >= 70 ? 'PURSUE: Submit competitive bid with standard terms' :
            totalScore >= 45 ? 'CONDITIONAL: Consider submitting ONLY if strategic value justifies risk' :
            'PASS: Do not invest estimating resources',
            `Negotiate with prospect: Request higher margin or faster payment cycle`,
            `Ask for clarification on scope, schedule, and competition level`,
            `Reduce bid cost: Estimate efficiently without full design`,
          ],
        },
        {
          title: 'SUCCESS METRICS & MONITORING:',
          description: 'If bid is won:',
          items: [
            `[ ] Confirm crew assignment and schedule (${crewWeeksNeeded} weeks)`,
            `[ ] Secure ${fmt(wcRequired)} working capital buffer`,
            `[ ] Establish payment schedule: ${fmt(dailyRev)}/day minimum`,
            `[ ] Monitor margin weekly: Target ${fmt(profit)} for ${projDuration}-week duration`,
            `[ ] Track actual vs. budgeted labor hours and material costs`,
            `[ ] Project profitability review post-completion`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOLS 6-16: Maintaining existing calculation logic with enhanced output format
// ============================================================================

export function calculatePrequalificationScorecard(inputs: Record<string, any>): CalculationResult {
  const projVal = n(inputs.projectValue);
  const clientType = inputs.clientType || 'developer';
  const bonding = inputs.bonding || 'no';
  const safety = inputs.safetyRequirements || 'standard';
  const weeks = n(inputs.scheduleWeeks);
  const dist = n(inputs.locationDistance);
  const alignment = inputs.tradeAlignment || 'good';

  const clientScores: Record<string, number> = { government: 60, developer: 75, corporation: 80, individual: 70, nonprofit: 65 };
  const safetyScores: Record<string, number> = { standard: 90, enhanced: 70, specialized: 50, union: 40 };
  const alignScores: Record<string, number> = { perfect: 100, good: 75, possible: 45, poor: 15 };

  const fitScore = Math.round(
    (clientScores[clientType] || 70) * 0.15 +
    (bonding === 'no' ? 90 : 60) * 0.15 +
    (safetyScores[safety] || 70) * 0.2 +
    Math.max(0, 100 - weeks * 1.5) * 0.15 +
    Math.max(0, 100 - dist * 1.5) * 0.15 +
    (alignScores[alignment] || 50) * 0.2
  );

  const goNoGo = fitScore >= 70 ? 'GO — Pursue this opportunity' : fitScore >= 45 ? 'CONDITIONAL — Review risk factors' : 'NO-GO — Does not align with capabilities';
  const riskLevel: CalculationResult['riskLevel'] = fitScore >= 70 ? 'Low' : fitScore >= 50 ? 'Medium' : fitScore >= 30 ? 'High' : 'Critical';
  const clientLabel: Record<string, string> = { government: 'Government/Public', developer: 'Developer/Builder', corporation: 'Corporation/Business', individual: 'Individual/Homeowner', nonprofit: 'Non-Profit' };
  const safetyLabel: Record<string, string> = { standard: 'Standard OSHA', enhanced: 'Enhanced Requirements', specialized: 'Specialized Certification', union: 'Union/Davis-Bacon' };
  const alignLabel: Record<string, string> = { perfect: 'Perfect - Core specialty', good: 'Good - Related experience', possible: 'Possible - Can execute', poor: 'Poor - Outside wheelhouse' };

  return {
    primaryMetrics: [
      { label: 'FIT SCORE', value: `${fitScore}/100 | ${goNoGo}` },
      { label: 'PROJECT PROFILE', value: `${fmt(projVal)} ${clientLabel[clientType] || clientType} project | ${weeks} weeks | ${dist} miles from office` },
      { label: 'CAPABILITY MATCH', value: `Trade alignment: ${alignLabel[alignment] || alignment} | Safety: ${safetyLabel[safety] || safety} | Bonding: ${bonding === 'yes' ? 'Required' : 'Not required'}` },
      { label: 'KEY RISKS', value: `${safety === 'union' || safety === 'specialized' ? 'Compliance requirements may exceed current capabilities' : dist > 30 ? 'Geographic distance adds logistics complexity' : 'Standard risk profile'}` },
    ],
    riskLevel,
    summary: `Prequalification score: ${fitScore}/100. ${goNoGo}.`,
    scoreBreakdown: [
      { label: 'Trade Alignment', value: alignScores[alignment] || 50 },
      { label: 'Safety Capability', value: safetyScores[safety] || 70 },
      { label: 'Client Fit', value: clientScores[clientType] || 70 },
      { label: 'Logistics', value: Math.max(0, 100 - dist * 1.5) },
    ],
    recommendations: [
      fitScore < 45 ? 'Pass on this opportunity — capability gaps are too significant' : 'Opportunity aligns with current capabilities',
      safety === 'union' || safety === 'specialized' ? 'Verify all required certifications and compliance infrastructure before bidding' : 'Safety requirements are within standard capability',
      dist > 40 ? `${dist}-mile distance will strain logistics — factor travel costs and supervision challenges` : 'Distance is manageable from your office',
      alignment === 'poor' ? 'Project scope is outside core expertise — risk of quality issues and margin erosion' : 'Trade alignment supports successful execution',
      bonding === 'yes' ? 'Confirm bonding capacity with your surety before investing estimating time' : 'No bonding constraints',
    ],
    detailedAnalysis: {
      title: 'DETAILED ANALYSIS',
      subtitle: 'PREQUALIFICATION ASSESSMENT & CAPABILITY ANALYSIS',
      sections: [
        {
          title: 'PROJECT OVERVIEW:',
          items: [
            `Project Value: ${fmt(projVal)}`,
            `Client Type: ${clientLabel[clientType] || clientType}`,
            `Duration: ${weeks} weeks`,
            `Location: ${dist} miles from office`,
            `Bonding Required: ${bonding === 'yes' ? 'Yes' : 'No'}`,
            `Safety Requirements: ${safetyLabel[safety] || safety}`,
            `Trade Alignment: ${alignLabel[alignment] || alignment}`,
          ],
        },
        {
          title: 'SCORING BREAKDOWN:',
          items: [
            `Trade Alignment Score: ${alignScores[alignment] || 50}/100 — ${alignment === 'perfect' ? 'Core specialty, strong track record' : alignment === 'good' ? 'Related experience, can execute well' : alignment === 'possible' ? 'Executable but outside primary expertise' : 'Significant capability gap'}`,
            `Safety & Compliance Score: ${safetyScores[safety] || 70}/100 — ${safety === 'standard' ? 'Standard OSHA, well within capabilities' : safety === 'enhanced' ? 'Enhanced requirements, manageable with preparation' : safety === 'specialized' ? 'Requires certifications you may not hold' : 'Union/Davis-Bacon adds significant compliance burden'}`,
            `Client Fit Score: ${clientScores[clientType] || 70}/100 — ${clientType === 'government' ? 'Government work demands compliance infrastructure' : clientType === 'developer' ? 'Developer projects focus on schedule reliability' : 'Standard client relationship requirements'}`,
            `Logistics Score: ${Math.max(0, 100 - dist * 1.5).toFixed(0)}/100 — ${dist <= 15 ? 'Local project, minimal logistics' : dist <= 30 ? 'Regional project, manageable distance' : dist <= 60 ? 'Extended distance, plan for travel costs' : 'Remote project, significant logistics challenge'}`,
          ],
        },
        {
          title: 'RISK FACTORS:',
          items: [
            `Schedule Risk: ${weeks > 24 ? 'HIGH — Long project demands sustained crew stability' : weeks > 12 ? 'MODERATE — Standard duration' : 'LOW — Short timeline, focused execution'}`,
            `Financial Risk: ${projVal > 1000000 ? 'HIGH — Large project value requires strong working capital' : projVal > 500000 ? 'MODERATE — Standard financial exposure' : 'LOW — Manageable project size'}`,
            `Compliance Risk: ${safety === 'union' || safety === 'specialized' ? 'HIGH — Specialized requirements, potential penalties for non-compliance' : 'LOW — Standard OSHA compliance'}`,
            `Execution Risk: ${alignment === 'poor' || alignment === 'possible' ? 'ELEVATED — Outside core expertise, quality control critical' : 'STANDARD — Within normal capabilities'}`,
          ],
        },
      ],
    },
    actionPlan: {
      title: 'RECOMMENDATION',
      subtitle: goNoGo,
      phases: [
        {
          title: fitScore >= 70 ? 'PURSUE — NEXT STEPS:' : fitScore >= 45 ? 'CONDITIONAL — BEFORE BIDDING:' : 'NO-GO — ALTERNATIVES:',
          items: fitScore >= 70 ? [
            `Assign estimator and begin bid preparation`,
            `Confirm crew availability for ${weeks}-week commitment`,
            `${bonding === 'yes' ? 'Verify bonding capacity with surety' : 'No bonding action needed'}`,
            `Schedule pre-bid site visit if available`,
            `Target bid submission within standard timeframe`,
          ] : fitScore >= 45 ? [
            `Resolve capability gaps before committing estimating resources`,
            `${safety === 'union' || safety === 'specialized' ? 'Verify all required certifications are current' : 'Confirm safety program meets project requirements'}`,
            `${dist > 30 ? 'Evaluate true cost of ' + dist + '-mile distance (travel, lodging, supervision)' : 'Standard logistics assessment'}`,
            `Consider partnering with a qualified firm for scope areas outside your expertise`,
            `Only proceed if risk factors can be mitigated`,
          ] : [
            `Pass on this opportunity — redirect estimating effort to better-fit projects`,
            `Document reason for passing to improve future bid/no-bid decisions`,
            `Identify what capabilities would need to improve to pursue similar work`,
            `Focus on opportunities that score 70+ on prequalification`,
          ],
        },
      ],
    },
    measurement: {
      title: 'MEASUREMENT:',
      items: [
        `Track prequalification scores vs. actual project outcomes`,
        `Monitor win rate on high-score (70+) vs. low-score (<50) bids`,
        `Review capability gaps quarterly and invest in closing them`,
      ],
    },
    expectedOutcomes: {
      title: 'EXPECTED OUTCOMES:',
      items: [
        `Better bid selection through systematic prequalification`,
        `Higher win rate on pursued opportunities`,
        `Reduced risk of project execution failures`,
        `Focused estimating resources on highest-probability work`,
      ],
    },
  };
}

// ============================================================================
// TOOLS 7-16: Enhanced with consultant-level depth
// These maintain existing calculation logic but add rich actionPlan, measurement, expectedOutcomes
// ============================================================================

export function calculateBondingCapacityCalculator(inputs: Record<string, any>): CalculationResult {
  const wc = n(inputs.workingCapital); const nw = n(inputs.netWorth); const rev = n(inputs.annualRevenue);
  const backlog = n(inputs.currentBacklog); const loc = n(inputs.lineOfCredit); const largest = n(inputs.largestProject);
  const aggCap = wc * 10; const singleMax = wc * 3.5; const utilization = backlog > 0 ? (backlog / aggCap) * 100 : 0;
  const available = Math.max(0, aggCap - backlog); const canTakeLargest = singleMax >= largest;
  const wcRatio = rev > 0 ? (wc / rev) * 100 : 0;
  const riskLevel: CalculationResult['riskLevel'] = utilization < 50 ? 'Low' : utilization < 75 ? 'Medium' : utilization < 90 ? 'High' : 'Critical';
  return {
    primaryMetrics: [
      { label: 'AGGREGATE BONDING CAPACITY', value: `${fmt(aggCap)} total capacity | ${fmt(available)} currently available` },
      { label: 'SINGLE PROJECT LIMIT', value: `${fmt(singleMax)} max single bond | ${canTakeLargest ? 'Can support largest project' : 'CANNOT support ' + fmt(largest) + ' project'}` },
      { label: 'UTILIZATION', value: `${utilization.toFixed(1)}% of capacity used | ${fmt(backlog)} current backlog against ${fmt(aggCap)} limit` },
      { label: 'FINANCIAL FOUNDATION', value: `Working capital: ${fmt(wc)} | Net worth: ${fmt(nw)} | WC ratio: ${wcRatio.toFixed(1)}% of revenue` },
    ],
    riskLevel, summary: `Bonding capacity: ${fmt(aggCap)} aggregate, ${fmt(singleMax)} single. ${fmt(available)} available.`,
    scoreBreakdown: [
      { label: 'Capacity Utilization', value: Math.max(0, 100 - utilization) },
      { label: 'Working Capital Strength', value: Math.min(100, wcRatio * 5) },
      { label: 'Net Worth Foundation', value: Math.min(100, (nw / (rev || 1)) * 100) },
      { label: 'Liquidity', value: Math.min(100, ((wc + loc) / (rev / 12 || 1)) * 50) },
    ],
    recommendations: [
      utilization > 75 ? `Bonding ${utilization.toFixed(0)}% utilized — avoid large new commitments until backlog completes` : 'Bonding capacity is healthy',
      wcRatio < 10 ? 'Working capital is thin — improve liquidity to increase bonding capacity' : 'Working capital supports current bonding needs',
      !canTakeLargest ? `Largest project (${fmt(largest)}) exceeds single-bond limit (${fmt(singleMax)}) — grow WC or use co-surety` : 'Single project capacity is adequate',
      `Every ${fmt(100000)} increase in working capital adds ~${fmt(1000000)} in bonding capacity`,
      `Maintain credit line at ${fmt(loc)} minimum as surety confidence factor`,
    ],
    detailedAnalysis: { title: 'DETAILED ANALYSIS', subtitle: 'BONDING CAPACITY & SURETY ANALYSIS', sections: [
      { title: 'FINANCIAL PROFILE:', items: [`Working Capital: ${fmt(wc)}`, `Net Worth: ${fmt(nw)}`, `Annual Revenue: ${fmt(rev)}`, `Current Backlog: ${fmt(backlog)}`, `Available Credit: ${fmt(loc)}`, `Largest Active Project: ${fmt(largest)}`] },
      { title: 'CAPACITY CALCULATIONS:', items: [`Aggregate Capacity: ${fmt(wc)} × 10 = ${fmt(aggCap)}`, `Single Project Limit: ${fmt(wc)} × 3.5 = ${fmt(singleMax)}`, `Current Utilization: ${fmt(backlog)} ÷ ${fmt(aggCap)} = ${utilization.toFixed(1)}%`, `Available Capacity: ${fmt(available)}`, `Capacity Rating: ${utilization < 50 ? 'Strong — room for growth' : utilization < 75 ? 'Moderate — selective bidding recommended' : 'Constrained — complete existing work first'}`] },
      { title: 'SURETY STRENGTH FACTORS:', items: [`Working capital to revenue ratio: ${wcRatio.toFixed(1)}% (target: >10%)`, `Net worth to revenue ratio: ${(nw / (rev || 1) * 100).toFixed(1)}% (target: >25%)`, `Credit line as WC supplement: ${fmt(loc)} (${((loc / (wc || 1)) * 100).toFixed(0)}% of WC)`, `Backlog to revenue ratio: ${(backlog / (rev || 1) * 100).toFixed(1)}% (target: 40-80%)`] },
      { title: 'GROWTH IMPLICATIONS:', items: [`To bond ${fmt(singleMax * 1.5)}: Need WC of ${fmt(singleMax * 1.5 / 3.5)}`, `To reach ${fmt(aggCap * 1.5)} aggregate: Need WC of ${fmt(aggCap * 1.5 / 10)}`, `Every ${fmt(100000)} WC improvement = ${fmt(1000000)} aggregate + ${fmt(350000)} single project increase`] },
    ]},
    actionPlan: { title: 'ACTION PLAN', subtitle: 'BONDING CAPACITY GROWTH STRATEGY', phases: [
      { title: 'PHASE 1: OPTIMIZE CURRENT POSITION (Week 1-4)', items: [`Accelerate AR collections to boost working capital`, `Review current backlog completion timeline`, `Clean up balance sheet — convert non-performing assets`, `Ensure credit line is fully available and unused`, `Meet with surety agent to review current standing`] },
      { title: 'PHASE 2: GROW CAPACITY (Month 2-6)', items: [`Target ${fmt(wc * 1.2)} working capital through retained earnings`, `Reduce overhead to improve net profit (flows to WC and NW)`, `Consider subordinated debt to boost net worth`, `Maintain strong banking relationship for credit references`, `Build surety confidence through clean project execution`] },
    ]},
    measurement: { title: 'MEASUREMENT:', items: [`Quarterly working capital tracking (target: ${fmt(wc * 1.2)})`, `Bonding utilization rate (target: <70%)`, `Single project capacity vs. target project size`, `Net worth growth rate (target: 10%+ annually)`] },
    expectedOutcomes: { title: 'EXPECTED OUTCOMES:', items: [`Increase aggregate capacity from ${fmt(aggCap)} to ${fmt(aggCap * 1.3)}`, `Grow single project limit to ${fmt(singleMax * 1.3)}`, `Maintain utilization below 70% for growth flexibility`, `Support pursuit of larger, more profitable projects`] },
  };
}

export function calculateInsuranceGapAnalyzer(inputs: Record<string, any>): CalculationResult {
  const rev = n(inputs.annualRevenue); const emps = n(inputs.employees); const gl = n(inputs.glLimit);
  const wc = n(inputs.workerCompLimit); const auto = n(inputs.autoLimit); const umb = n(inputs.umbrellaLimit);
  const pl = inputs.professionalLiability || 'none'; const projTypes = inputs.projectTypes || 'commercial';
  const recGL = Math.max(2000000, rev * 0.5); const recWC = Math.max(1000000, emps * 40000);
  const recAuto = Math.max(1000000, emps * 20000); const recUmb = Math.max(2000000, rev * 0.4);
  const plValues: Record<string, number> = { none: 0, '250k': 250000, '500k': 500000, '1m': 1000000 };
  const plVal = plValues[pl] || 0; const recPL = 500000;
  const glGap = Math.max(0, recGL - gl); const wcGap = Math.max(0, recWC - wc); const autoGap = Math.max(0, recAuto - auto);
  const umbGap = Math.max(0, recUmb - umb); const plGap = Math.max(0, recPL - plVal);
  const totalGap = glGap + wcGap + autoGap + umbGap + plGap;
  const gapCount = [glGap > 0, wcGap > 0, autoGap > 0, umbGap > 0, plGap > 0].filter(Boolean).length;
  const coverageScore = Math.round(100 - (gapCount / 5) * 100);
  const riskLevel: CalculationResult['riskLevel'] = gapCount === 0 ? 'Low' : gapCount <= 2 ? 'Medium' : gapCount <= 3 ? 'High' : 'Critical';
  const projLabel: Record<string, string> = { residential: 'Residential', commercial: 'Commercial', industrial: 'Industrial', mixed: 'Mixed' };
  return {
    primaryMetrics: [
      { label: 'COVERAGE SCORE', value: `${coverageScore}/100 | ${gapCount} of 5 coverage areas below recommended minimums` },
      { label: 'TOTAL UNDERINSURANCE', value: `${fmt(totalGap)} in aggregate coverage gaps across ${gapCount} policy types` },
      { label: 'HIGHEST RISK', value: `${glGap > wcGap && glGap > umbGap ? 'General Liability' : wcGap > umbGap ? 'Workers Comp' : 'Umbrella/Excess'} — ${fmt(Math.max(glGap, wcGap, umbGap))} below recommended minimum` },
      { label: 'ANNUAL REVENUE EXPOSURE', value: `${fmt(rev)} annual revenue with ${fmt(gl + wc + auto + umb + plVal)} total coverage | Coverage-to-revenue ratio: ${((gl + wc + auto + umb + plVal) / (rev || 1) * 100).toFixed(0)}%` },
    ],
    riskLevel, summary: gapCount === 0 ? 'Insurance coverage meets recommended minimums across all categories.' : `${gapCount} coverage gaps identified totaling ${fmt(totalGap)} in underinsurance.`,
    scoreBreakdown: [
      { label: 'General Liability', value: Math.min(100, (gl / (recGL || 1)) * 100) },
      { label: 'Workers Comp', value: Math.min(100, (wc / (recWC || 1)) * 100) },
      { label: 'Commercial Auto', value: Math.min(100, (auto / (recAuto || 1)) * 100) },
      { label: 'Umbrella/Excess', value: Math.min(100, (umb / (recUmb || 1)) * 100) },
    ],
    recommendations: [
      glGap > 0 ? `Increase GL from ${fmt(gl)} to ${fmt(recGL)} — you are ${pct(glGap, recGL)} underinsured` : 'GL coverage meets minimum',
      wcGap > 0 ? `Workers comp limit should be ${fmt(recWC)} for ${emps} employees` : 'Workers comp is adequate',
      pl === 'none' ? 'ADD professional liability coverage — E&O protection is essential for any contractor' : 'Professional liability in place',
      umbGap > 0 ? `Increase umbrella from ${fmt(umb)} to ${fmt(recUmb)} — cheapest coverage per dollar` : 'Umbrella coverage is strong',
      `Review all policies annually with your broker — ensure limits grow with revenue`,
    ],
    detailedAnalysis: { title: 'DETAILED ANALYSIS', subtitle: 'INSURANCE COVERAGE GAP ASSESSMENT', sections: [
      { title: 'COMPANY RISK PROFILE:', items: [`Annual Revenue: ${fmt(rev)}`, `Employees: ${emps}`, `Project Types: ${projLabel[projTypes] || projTypes}`, `Risk Tier: ${rev > 10000000 ? 'High-revenue, elevated exposure' : 'Standard risk profile'}`] },
      { title: 'COVERAGE VS. RECOMMENDED MINIMUMS:', items: [`General Liability: ${fmt(gl)} vs. ${fmt(recGL)} recommended ${glGap > 0 ? '⚠️ GAP: ' + fmt(glGap) : '✓'}`, `Workers Comp: ${fmt(wc)} vs. ${fmt(recWC)} recommended ${wcGap > 0 ? '⚠️ GAP: ' + fmt(wcGap) : '✓'}`, `Commercial Auto: ${fmt(auto)} vs. ${fmt(recAuto)} recommended ${autoGap > 0 ? '⚠️ GAP: ' + fmt(autoGap) : '✓'}`, `Umbrella/Excess: ${fmt(umb)} vs. ${fmt(recUmb)} recommended ${umbGap > 0 ? '⚠️ GAP: ' + fmt(umbGap) : '✓'}`, `Professional Liability: ${pl === 'none' ? 'NONE ⚠️ — Recommended minimum: ' + fmt(recPL) : fmt(plVal) + ' ✓'}`] },
      { title: 'FINANCIAL EXPOSURE:', items: [`Total current coverage: ${fmt(gl + wc + auto + umb + plVal)}`, `Total recommended coverage: ${fmt(recGL + recWC + recAuto + recUmb + recPL)}`, `Total gap: ${fmt(totalGap)}`, `A single uninsured claim could cost 2-5x your gap amount`, `Catastrophic loss without adequate coverage could bankrupt the company`] },
    ]},
    actionPlan: { title: 'ACTION PLAN', subtitle: 'INSURANCE OPTIMIZATION STRATEGY', phases: [
      { title: 'IMMEDIATE (Week 1-2):', items: [`Request quotes for increasing ${gapCount > 0 ? gapCount + ' underinsured categories' : 'all categories to next tier'}`, `${pl === 'none' ? 'Priority: Add professional liability coverage immediately' : 'Verify professional liability renewal terms'}`, `Review all policy exclusions — ensure your work types are covered`, `Confirm additional insured requirements for all active projects`] },
      { title: 'SHORT-TERM (Month 1-2):', items: [`Shop 3+ carriers for competitive premiums on gap areas`, `Improve EMR to lower workers comp premiums`, `Bundle policies for multi-policy discounts`, `Increase umbrella — typically cheapest coverage per dollar of protection`] },
    ]},
    measurement: { title: 'MEASUREMENT:', items: [`Annual coverage-to-revenue ratio (target: >150%)`, `Premium cost as % of revenue (target: 3-5%)`, `Claims frequency and severity trend`, `EMR trajectory for workers comp pricing`] },
    expectedOutcomes: { title: 'EXPECTED OUTCOMES:', items: [`Close ${fmt(totalGap)} in coverage gaps`, `Protect against catastrophic uninsured losses`, `Meet all GC/client insurance requirements`, `Reduce premium costs through EMR improvement and carrier competition`] },
  };
}

export function calculateEMRSimulator(inputs: Record<string, any>): CalculationResult {
  const hours = n(inputs.totalHours); const ltc = n(inputs.lostTimeCases); const rd = n(inputs.restrictedDuty);
  const mo = n(inputs.medicalOnly); const fat = n(inputs.fatalities); const dart = n(inputs.dartCases);
  const totalIncidents = ltc + rd + mo + fat; const tir = hours > 0 ? (totalIncidents * 200000) / hours : 0;
  const dartRate = hours > 0 ? (dart * 200000) / hours : 0;
  const estEMR = 1.0 + (ltc * 0.15) + (rd * 0.08) + (mo * 0.02) + (fat * 0.5) - (hours > 100000 ? 0.1 : 0);
  const emr = Math.max(0.6, Math.min(2.5, estEMR));
  const basePremium = hours * 0.15; const actualPremium = basePremium * emr;
  const benchPremium = basePremium * 1.0; const excessCost = actualPremium - benchPremium;
  const claimFreeYears = emr > 1.0 ? Math.ceil((emr - 1.0) / 0.1) : 0;
  const targetEMR = Math.max(0.75, emr - 0.2);
  const targetPremium = basePremium * targetEMR; const savings = actualPremium - targetPremium;
  const riskLevel: CalculationResult['riskLevel'] = emr <= 0.85 ? 'Low' : emr <= 1.0 ? 'Medium' : emr <= 1.3 ? 'High' : 'Critical';
  return {
    primaryMetrics: [
      { label: 'PROJECTED EMR', value: `${emr.toFixed(2)} ${emr <= 0.85 ? '(Excellent)' : emr <= 1.0 ? '(Good)' : emr <= 1.2 ? '(Above Average — paying more)' : '(Poor — significant surcharge)'}` },
      { label: 'DART RATE', value: `${dartRate.toFixed(1)} per 200K hours | TIR: ${tir.toFixed(1)} | Industry benchmark DART: 2.0-3.5` },
      { label: 'PREMIUM IMPACT', value: `${emr > 1.0 ? fmt(excessCost) + '/year excess premium vs. EMR 1.0' : fmt(Math.abs(excessCost)) + '/year SAVINGS vs. EMR 1.0'}` },
      { label: 'IMPROVEMENT PATH', value: `${claimFreeYears > 0 ? claimFreeYears + ' claim-free years to reach 1.0' : 'EMR is at or below 1.0'} | Target: ${targetEMR.toFixed(2)} (saves ${fmt(savings)}/year)` },
    ],
    riskLevel, summary: emr <= 1.0 ? `EMR of ${emr.toFixed(2)} is at or below baseline — you're earning a discount.` : `EMR of ${emr.toFixed(2)} is costing ${fmt(excessCost)}/year in excess premiums.`,
    scoreBreakdown: [
      { label: 'EMR Rating', value: Math.max(0, Math.min(100, (1.5 - emr) * 100)) },
      { label: 'Incident Rate (TIR)', value: Math.max(0, Math.min(100, (8 - tir) * 12.5)) },
      { label: 'DART Rate', value: Math.max(0, Math.min(100, (5 - dartRate) * 20)) },
      { label: 'Severity Control', value: Math.max(0, Math.min(100, 100 - ltc * 20 - fat * 50)) },
    ],
    recommendations: [
      emr > 1.0 ? `EMR ${emr.toFixed(2)} is costing ${fmt(excessCost)}/year — invest in safety to reduce` : 'EMR is competitive — maintain safety discipline',
      ltc > 0 ? `${ltc} lost-time cases are the #1 EMR driver — implement return-to-work program` : 'Zero lost-time cases — excellent',
      tir > 4.0 ? `TIR of ${tir.toFixed(1)} is above industry benchmark (3.0-4.0) — focus on injury prevention` : 'Incident rate is within benchmark',
      `Implement formal near-miss reporting to prevent incidents before they occur`,
      `Target ${targetEMR.toFixed(2)} EMR within ${claimFreeYears > 0 ? claimFreeYears : 2} years — saves ${fmt(savings)}/year`,
    ],
    detailedAnalysis: { title: 'DETAILED ANALYSIS', subtitle: 'EMR & SAFETY PERFORMANCE ANALYSIS', sections: [
      { title: 'SAFETY RECORD:', items: [`Total Hours Worked: ${hours.toLocaleString()}`, `Lost Time Cases: ${ltc}`, `Restricted Duty Cases: ${rd}`, `Medical Only Cases: ${mo}`, `Fatalities: ${fat}`, `DART Cases: ${dart}`, `Total Recordable Incidents: ${totalIncidents}`] },
      { title: 'RATE CALCULATIONS:', items: [`Total Incident Rate (TIR): ${tir.toFixed(2)} per 200K hours (benchmark: 3.0-4.0)`, `DART Rate: ${dartRate.toFixed(2)} per 200K hours (benchmark: 2.0-3.5)`, `Projected EMR: ${emr.toFixed(2)} (baseline: 1.00)`, `EMR Rating: ${emr <= 0.85 ? 'Excellent' : emr <= 1.0 ? 'Good' : emr <= 1.2 ? 'Above Average' : 'Poor'}`] },
      { title: 'PREMIUM IMPACT:', items: [`Estimated base premium (at EMR 1.0): ${fmt(benchPremium)}/year`, `Your actual premium (EMR ${emr.toFixed(2)}): ${fmt(actualPremium)}/year`, `${emr > 1.0 ? 'Excess cost: ' + fmt(excessCost) + '/year' : 'Savings: ' + fmt(Math.abs(excessCost)) + '/year vs. baseline'}`, `If EMR improved to ${targetEMR.toFixed(2)}: Save ${fmt(savings)}/year`] },
    ]},
    actionPlan: { title: 'ACTION PLAN', subtitle: 'EMR REDUCTION & SAFETY IMPROVEMENT STRATEGY', phases: [
      { title: 'IMMEDIATE (Week 1-2):', items: [`Audit all open workers comp claims — identify any that can be closed`, `Implement return-to-work/modified duty program for all injuries`, `Review safety training records — identify gaps`, `${ltc > 0 ? 'Analyze root cause of ' + ltc + ' lost-time cases' : 'Maintain zero lost-time record'}`] },
      { title: 'SHORT-TERM (Month 1-3):', items: [`Launch daily toolbox talks for all crews`, `Implement near-miss reporting system with incentives`, `Invest in fall protection, PPE, and safety equipment`, `Train foremen as safety champions — accountability at job-site level`, `Target: Zero lost-time incidents for next 12 months`] },
      { title: 'LONG-TERM (Year 1-3):', items: [`Maintain claim-free record to drive EMR toward ${targetEMR.toFixed(2)}`, `Budget 2-4% of revenue for safety program`, `Pursue OSHA VPP or similar recognition`, `Track leading indicators (near-misses, training hours) not just lagging (incidents)`] },
    ]},
    measurement: { title: 'MEASUREMENT:', items: [`Monthly TIR and DART rate tracking`, `EMR projection updated quarterly`, `Near-miss reports per month (target: 5+ per 50 employees)`, `Safety training hours per employee (target: 20+ hours/year)`, `Workers comp premium trend year-over-year`] },
    expectedOutcomes: { title: 'EXPECTED OUTCOMES:', items: [`Reduce EMR from ${emr.toFixed(2)} to ${targetEMR.toFixed(2)} within ${claimFreeYears > 0 ? claimFreeYears : 2} years`, `Save ${fmt(savings)}/year in workers comp premiums`, `Reduce incident rate from ${tir.toFixed(1)} to below 3.0`, `Improve bid competitiveness (many GCs require EMR <1.0)`, `Protect employees and reduce human cost of injuries`] },
  };
}

export function calculateSafetyMaturityAssessor(inputs: Record<string, any>): CalculationResult {
  const plan = inputs.writtenSafetyPlan || 'no'; const ifr = n(inputs.incidentFrequencyRate);
  const training = n(inputs.trainingHours); const nms = inputs.nearMissReporting || 'none';
  const budget = n(inputs.safetyBudget); const mgmt = inputs.mgmtInvolvement || 'minimal';
  const planScore = plan === 'yes' ? 100 : 0;
  const ifrScore = Math.max(0, Math.min(100, (8 - ifr) * 12.5));
  const trainScore = Math.min(100, (training / 24) * 100);
  const nmsScores: Record<string, number> = { none: 0, informal: 30, formal: 70, incentivized: 100 };
  const budgetScore = Math.min(100, (budget / 4) * 100);
  const mgmtScores: Record<string, number> = { minimal: 15, moderate: 45, strong: 75, exceptional: 100 };
  const totalScore = Math.round((planScore * 0.15 + ifrScore * 0.25 + trainScore * 0.15 + (nmsScores[nms] || 0) * 0.15 + budgetScore * 0.15 + (mgmtScores[mgmt] || 15) * 0.15));
  const level = totalScore >= 80 ? 'Level 4 (Proactive)' : totalScore >= 60 ? 'Level 3 (Structured)' : totalScore >= 40 ? 'Level 2 (Basic)' : 'Level 1 (Reactive)';
  const percentile = Math.min(99, Math.round(totalScore * 1.1));
  const riskLevel: CalculationResult['riskLevel'] = totalScore >= 70 ? 'Low' : totalScore >= 50 ? 'Medium' : totalScore >= 30 ? 'High' : 'Critical';
  return {
    primaryMetrics: [
      { label: 'MATURITY LEVEL', value: `${level} | Score: ${totalScore}/100` },
      { label: 'INDUSTRY PERCENTILE', value: `${percentile}th percentile among specialty contractors | ${totalScore >= 70 ? 'Top quartile' : totalScore >= 50 ? 'Above average' : 'Below average'}` },
      { label: 'STRENGTH AREAS', value: `${plan === 'yes' ? 'Written safety plan' : ''}${training >= 16 ? (plan === 'yes' ? ', ' : '') + 'Strong training program' : ''}${nms === 'incentivized' || nms === 'formal' ? ', Near-miss system' : ''}` || 'No areas at best-practice level' },
      { label: 'IMPROVEMENT PRIORITIES', value: `${plan === 'no' ? 'Written safety plan (critical)' : ''}${training < 16 ? (plan === 'no' ? ', ' : '') + 'Training hours (' + training + ' vs. 16-24 target)' : ''}${mgmt === 'minimal' ? ', Management involvement' : ''}` || 'Strong across all categories' },
    ],
    riskLevel, summary: `Safety maturity: ${level}. ${totalScore >= 70 ? 'Strong program — focus on continuous improvement.' : 'Significant improvement opportunities exist.'}`,
    scoreBreakdown: [
      { label: 'Written Safety Plan', value: planScore },
      { label: 'Incident Rate', value: ifrScore },
      { label: 'Training Program', value: trainScore },
      { label: 'Near-Miss Reporting', value: nmsScores[nms] || 0 },
      { label: 'Safety Budget', value: budgetScore },
      { label: 'Management Involvement', value: mgmtScores[mgmt] || 15 },
    ],
    recommendations: [
      plan === 'no' ? 'CRITICAL: Develop a written, site-specific safety plan — OSHA requirement and insurance expectation' : 'Written safety plan in place — review and update annually',
      training < 16 ? `Increase training from ${training} to 16-24 hours/employee/year` : 'Training hours meet best practice',
      nms === 'none' || nms === 'informal' ? 'Implement formal near-miss reporting with incentives' : 'Near-miss system is strong',
      mgmt === 'minimal' || mgmt === 'moderate' ? 'Increase leadership visibility — weekly site safety walks by management' : 'Management involvement is exemplary',
      budget < 2 ? `Safety budget at ${budget}% is below the 2-4% best practice — invest more to reduce incidents and premiums` : 'Safety budget is appropriate',
    ],
    detailedAnalysis: { title: 'DETAILED ANALYSIS', subtitle: 'SAFETY PROGRAM MATURITY ASSESSMENT', sections: [
      { title: 'MATURITY SCORING:', items: [`Overall Score: ${totalScore}/100 (${level})`, `Industry Percentile: ${percentile}th`, `Written Safety Plan: ${plan === 'yes' ? 'Yes ✓' : 'No ⚠️ (OSHA requirement)'}`, `Incident Frequency Rate: ${ifr.toFixed(1)} per 200K hours (benchmark: 3.0-5.0)`, `Annual Training: ${training} hours/employee (best practice: 16-24)`, `Near-Miss Reporting: ${nms} (best practice: formal & incentivized)`, `Safety Budget: ${budget}% of revenue (best practice: 2-4%)`, `Management Involvement: ${mgmt} (best practice: exceptional/weekly)`] },
      { title: 'MATURITY LEVEL DESCRIPTION:', items: [totalScore >= 80 ? 'Level 4 (Proactive): Safety is embedded in culture. Leading indicators tracked. Continuous improvement.' : totalScore >= 60 ? 'Level 3 (Structured): Formal programs exist. Training is consistent. Near-misses tracked.' : totalScore >= 40 ? 'Level 2 (Basic): Compliance-focused. Reactive to incidents. Limited proactive measures.' : 'Level 1 (Reactive): Minimal safety infrastructure. High incident risk. Urgent improvement needed.'] },
      { title: 'FINANCIAL IMPACT:', items: [`Strong safety programs reduce workers comp premiums by 20-40%`, `Every prevented lost-time incident saves $40,000-$80,000 in direct + indirect costs`, `EMR improvement from safety investment: 0.10-0.20 point reduction per claim-free year`, `Safety culture reduces turnover — replacement cost per field worker: $5,000-$15,000`] },
    ]},
    actionPlan: { title: 'ACTION PLAN', subtitle: 'SAFETY PROGRAM IMPROVEMENT ROADMAP', phases: [
      { title: `PHASE 1: FOUNDATION (Week 1-4) — ${plan === 'no' ? 'Build core safety infrastructure' : 'Strengthen existing foundation'}`, items: [plan === 'no' ? 'Develop written safety plan with site-specific hazard analysis' : 'Update written safety plan with current site conditions', `Designate safety coordinator/officer`, `Create incident and near-miss reporting forms`, `Schedule safety orientation for all new hires`, `Post emergency procedures at all job sites`] },
      { title: 'PHASE 2: TRAINING & CULTURE (Month 2-4)', items: [`Launch weekly toolbox talks (15 minutes, trade-specific)`, `Schedule ${Math.max(16, training) - training} additional training hours per employee`, `Implement near-miss reporting with $25 gift card incentive per report`, `Train foremen as safety leaders — they set the tone on-site`, `Begin monthly management safety walks`] },
      { title: 'PHASE 3: OPTIMIZATION (Month 4-12)', items: [`Track leading indicators: near-miss reports, training completion, audit scores`, `Set annual safety goals with team — make it collaborative`, `Recognize and reward safe behaviors publicly`, `Budget ${Math.max(budget, 3)}% of revenue for safety annually`, `Target: Move from ${level} to next maturity level within 12 months`] },
    ]},
    measurement: { title: 'MEASUREMENT:', items: [`Monthly safety maturity score (target: 70+)`, `Incident frequency rate trend (target: <3.0)`, `Training hours per employee (target: 20+ hours/year)`, `Near-miss reports per month (target: 3+ per 50 employees)`, `Management safety walk frequency (target: weekly)`] },
    expectedOutcomes: { title: 'EXPECTED OUTCOMES:', items: [`Improve maturity from ${level} to next level within 12 months`, `Reduce incident rate from ${ifr.toFixed(1)} to below 3.0`, `Lower workers comp premiums by 15-30% through EMR improvement`, `Reduce employee turnover through stronger safety culture`, `Meet all GC and client safety prequalification requirements`] },
  };
}

export function calculateToolboxTalkGenerator(inputs: Record<string, any>): CalculationResult {
  const trade = inputs.tradeType || 'general'; const hazard = inputs.hazardType || 'fall';
  const season = inputs.season || 'spring'; const site = inputs.jobSiteType || 'commercial';
  const crewSize = n(inputs.crewSize);
  const tradeLabels: Record<string, string> = { electrical: 'Electrical', plumbing: 'Plumbing & HVAC', carpentry: 'Carpentry & Framing', concrete: 'Concrete', roofing: 'Roofing', steel: 'Steel Erection', painting: 'Painting', equipment: 'Equipment Operation' };
  const hazardLabels: Record<string, string> = { fall: 'Fall Protection', electrical: 'Electrical Safety', loto: 'Lockout/Tagout', excavation: 'Excavation & Trenching', 'fall-equip': 'Fall Equipment Inspection', housekeeping: 'Housekeeping & Debris', fatigue: 'Fatigue & Ergonomics', weather: 'Weather Hazards' };
  const seasonLabels: Record<string, string> = { spring: 'Spring', summer: 'Summer', fall: 'Fall', winter: 'Winter' };
  const siteLabels: Record<string, string> = { commercial: 'Commercial Building', residential: 'Residential', industrial: 'Industrial/Heavy', infrastructure: 'Infrastructure/Highway', renovation: 'Renovation/Existing Structure' };
  const oshaRefs: Record<string, string> = { fall: '1926.501-503', electrical: '1926.404-405', loto: '1910.147', excavation: '1926.650-652', 'fall-equip': '1926.502(d)', housekeeping: '1926.25', fatigue: '1926.21', weather: '1926.21(b)(6)' };
  const talkTopics: Record<string, string[]> = {
    fall: ['100% tie-off requirement above 6 feet', 'Inspect harness and lanyard before each use', 'Anchor points must support 5,000 lbs per worker', 'Report any damaged fall protection equipment immediately', 'Guardrails, safety nets, or personal fall arrest — know which system applies', 'Leading edge work requires written fall protection plan'],
    electrical: ['De-energize before working — no exceptions', 'Test for zero energy state with qualified tester', 'Maintain safe working distances from energized parts', 'Ground fault circuit interrupters (GFCIs) required on all temporary power', 'Wet conditions increase electrocution risk dramatically', 'Only qualified workers may work on energized circuits'],
    loto: ['Follow lockout/tagout procedures for every equipment service', 'Each worker applies their own lock — never share', 'Verify zero energy state before beginning work', 'Remove locks only when work is complete and area is clear', 'Communicate lockout status to all affected workers'],
    excavation: ['Trenches 5+ feet deep require protective systems', 'Inspect excavations daily and after rain events', 'Keep heavy equipment away from trench edges', 'Provide safe means of egress within 25 feet of all workers', 'Never enter an unprotected trench — even for a moment', 'Competent person must inspect daily'],
    'fall-equip': ['Inspect all fall protection equipment before each shift', 'Check harness for cuts, burns, fraying, and hardware damage', 'Replace any equipment showing signs of wear or impact', 'Retractable lifelines — verify brake function daily', 'Store equipment in clean, dry location when not in use'],
    housekeeping: ['Clear walkways of debris, tools, and materials', 'Properly store or dispose of waste materials daily', 'Maintain clear access to exits and fire extinguishers', 'Stack materials safely — not above shoulder height without securing', 'Clean up spills immediately — especially oils, solvents, water'],
    fatigue: ['Recognize signs of fatigue: slow reaction, poor judgment, irritability', 'Rotate physically demanding tasks among crew members', 'Stay hydrated — dehydration accelerates fatigue', 'Use proper lifting techniques — bend at knees, keep load close', 'Speak up if you or a coworker shows signs of fatigue'],
    weather: ['Monitor weather forecasts before and during shift', season === 'summer' ? 'Heat illness prevention: hydrate, rest in shade, know the signs' : season === 'winter' ? 'Cold stress prevention: layer clothing, watch for frostbite/hypothermia signs' : 'Lightning: stop work if thunder can be heard, seek shelter', 'Wind: secure loose materials above 25 mph, stop crane work above 35 mph', 'Rain/ice: increase fall protection vigilance on wet surfaces'],
  };
  const discussionPoints = [`How have you encountered ${hazardLabels[hazard]?.toLowerCase() || hazard} hazards on this job?`, 'What would you do if you saw an unsafe condition?', 'Has anyone had a near-miss related to today\'s topic?', `What PPE is required for ${hazardLabels[hazard]?.toLowerCase() || hazard}?`, 'How can we look out for each other today?'];
  const activities = [`Walk the ${siteLabels[site]?.toLowerCase() || site} site and identify ${hazardLabels[hazard]?.toLowerCase() || hazard} hazards`, `Demonstrate proper ${hazard === 'fall' ? 'harness inspection and donning' : hazard === 'electrical' ? 'lockout/tagout sequence' : 'PPE usage'}`, `Quiz: Name 3 things that could go wrong with ${hazardLabels[hazard]?.toLowerCase() || hazard} today`, `Pair up: Each team inspects the other's work area for hazards`];
  return {
    primaryMetrics: [
      { label: 'TALK TOPIC', value: `${hazardLabels[hazard] || hazard} for ${tradeLabels[trade] || trade} Crews | ${seasonLabels[season] || season} Season` },
      { label: 'OSHA REFERENCE', value: `OSHA Standard ${oshaRefs[hazard] || '1926.21'} | ${siteLabels[site] || site} job site | ${crewSize}-person crew` },
      { label: 'DURATION', value: `10-15 minutes | ${crewSize <= 8 ? 'Small group — encourage open discussion' : 'Large group — use structured format with designated speakers'}` },
      { label: 'SEASONAL FOCUS', value: `${season === 'summer' ? 'Heat illness, UV exposure, dehydration risk' : season === 'winter' ? 'Cold stress, ice/slip hazards, reduced daylight' : season === 'spring' ? 'Mud/soft ground, severe storms, allergens' : 'Early darkness, wet leaves, wind hazards'}` },
    ],
    riskLevel: 'Low', summary: `Toolbox talk generated for ${tradeLabels[trade] || trade} crew on ${hazardLabels[hazard] || hazard}.`,
    scoreBreakdown: [], recommendations: [
      `Deliver this talk within the first 15 minutes of the shift`, `Document attendance — have all ${crewSize} crew members sign the log`,
      `Follow up during the day — reference the talk when you see the hazard`, `Keep talks consistent — same time, same format, every day`,
    ],
    detailedAnalysis: { title: 'TOOLBOX TALK', subtitle: `${hazardLabels[hazard]?.toUpperCase() || hazard.toUpperCase()} — ${tradeLabels[trade] || trade} | ${seasonLabels[season] || season} | ${siteLabels[site] || site}`, sections: [
      { title: 'KEY SAFETY POINTS:', items: talkTopics[hazard] || talkTopics.fall },
      { title: `${seasonLabels[season]?.toUpperCase() || season.toUpperCase()} SEASONAL HAZARDS:`, items: season === 'summer' ? ['Heat illness: know the signs — dizziness, nausea, confusion', 'Hydrate every 15-20 minutes in temperatures above 80°F', 'Schedule heavy work for early morning hours', 'Provide shade structures for rest breaks', 'UV protection: sunscreen, long sleeves, hard hat brims'] : season === 'winter' ? ['Hypothermia: watch for shivering, confusion, slurred speech', 'Layer clothing — moisture-wicking base, insulation, wind barrier', 'Clear ice from walking surfaces and scaffolding every morning', 'Shorter daylight hours — ensure adequate job-site lighting', 'Keep extremities warm — insulated gloves that allow dexterity'] : season === 'spring' ? ['Soft/muddy ground conditions affect equipment stability', 'Severe thunderstorm awareness — seek shelter when lightning approaches', 'Increased allergen exposure — have antihistamines available', 'Temperature swings — dress in layers, stay hydrated'] : ['Wet leaves and surfaces increase slip/fall risk', 'Reduced daylight — start planning for adequate lighting', 'Wind increases fall hazard on elevated surfaces', 'Temperature drops — prepare for cold weather PPE needs'] },
      { title: 'DISCUSSION POINTS:', items: discussionPoints },
      { title: 'ACTIVITY SUGGESTIONS:', items: activities },
      { title: 'DOCUMENTATION:', items: [`Record date, time, topic, and attendees`, `Have all ${crewSize} crew members sign attendance sheet`, `Note any hazards identified during discussion`, `File with safety records — required for OSHA compliance`, `Reference: OSHA ${oshaRefs[hazard] || '1926.21'}`] },
    ]},
  };
}

export function calculateRevenueConcentrationAnalyzer(inputs: Record<string, any>): CalculationResult {
  const total = n(inputs.totalRevenue); const top1 = n(inputs.topClientRevenue); const top2 = n(inputs.secondClientRevenue);
  const top3 = n(inputs.thirdClientRevenue); const primaryMktPct = n(inputs.primaryMarketPercent); const geo = inputs.geoConcentration || 'region';
  const top1Pct = total > 0 ? (top1 / total) * 100 : 0; const top2Pct = total > 0 ? (top2 / total) * 100 : 0;
  const top3Pct = total > 0 ? (top3 / total) * 100 : 0; const top3Combined = top1Pct + top2Pct + top3Pct;
  const hhi = total > 0 ? ((top1 / total) ** 2 + (top2 / total) ** 2 + (top3 / total) ** 2 + ((total - top1 - top2 - top3) / total) ** 2) : 0;
  const riskLabel = hhi > 0.4 ? 'Extreme' : hhi > 0.25 ? 'High' : hhi > 0.15 ? 'Moderate' : 'Low';
  const lossImpact1 = top1; const diversTarget = total > 0 ? Math.max(0, top1Pct - 25) : 0;
  const riskLevel: CalculationResult['riskLevel'] = hhi > 0.35 ? 'Critical' : hhi > 0.25 ? 'High' : hhi > 0.15 ? 'Medium' : 'Low';
  const geoLabels: Record<string, string> = { single: 'Single City/County', region: 'Single Region/State', multistate: 'Multi-State', national: 'National' };
  return {
    primaryMetrics: [
      { label: 'CONCENTRATION RISK', value: `${riskLabel} | Herfindahl Index: ${hhi.toFixed(2)} (healthy: <0.15)` },
      { label: 'TOP CLIENT DEPENDENCY', value: `Top client: ${top1Pct.toFixed(1)}% of revenue (${fmt(top1)}) | Top 3 combined: ${top3Combined.toFixed(1)}%` },
      { label: 'GEOGRAPHIC CONCENTRATION', value: `${geoLabels[geo] || geo} | ${primaryMktPct}% from primary market (target: <60%)` },
      { label: 'AT-RISK REVENUE', value: `If top client lost: ${fmt(lossImpact1)} immediate revenue loss (${top1Pct.toFixed(1)}% of business)` },
    ],
    riskLevel, summary: `Revenue concentration: ${riskLabel} risk. Top client represents ${top1Pct.toFixed(1)}% of revenue.`,
    scoreBreakdown: [
      { label: 'Client Diversification', value: Math.max(0, Math.min(100, (1 - hhi) * 100)) },
      { label: 'Top Client Risk', value: Math.max(0, Math.min(100, 100 - top1Pct * 2)) },
      { label: 'Geographic Diversification', value: Math.max(0, Math.min(100, 100 - primaryMktPct)) },
    ],
    recommendations: [
      top1Pct > 25 ? `Top client at ${top1Pct.toFixed(0)}% — reduce dependency below 25%` : 'Top client share is manageable',
      top3Combined > 60 ? `Top 3 clients = ${top3Combined.toFixed(0)}% of revenue — diversify urgently` : 'Client concentration is balanced',
      primaryMktPct > 60 ? `${primaryMktPct}% from one market — expand geographic footprint` : 'Geographic spread is healthy',
      `Target: No single client >25% of revenue within 24 months`,
      `Pursue 3-5 new client relationships per quarter`,
    ],
    detailedAnalysis: { title: 'DETAILED ANALYSIS', subtitle: 'REVENUE CONCENTRATION & DIVERSIFICATION ANALYSIS', sections: [
      { title: 'CLIENT CONCENTRATION:', items: [`Total Annual Revenue: ${fmt(total)}`, `Top Client: ${fmt(top1)} (${top1Pct.toFixed(1)}%)`, `Second Client: ${fmt(top2)} (${top2Pct.toFixed(1)}%)`, `Third Client: ${fmt(top3)} (${top3Pct.toFixed(1)}%)`, `Remaining Clients: ${fmt(total - top1 - top2 - top3)} (${(100 - top3Combined).toFixed(1)}%)`, `Top 3 Combined: ${top3Combined.toFixed(1)}% (target: <60%)`] },
      { title: 'HERFINDAHL INDEX ANALYSIS:', items: [`HHI Score: ${hhi.toFixed(3)}`, `< 0.15 = Low concentration (healthy)`, `0.15-0.25 = Moderate concentration`, `0.25-0.40 = High concentration`, `> 0.40 = Extreme concentration (dangerous)`, `Your level: ${riskLabel}`] },
      { title: 'LOSS SCENARIO ANALYSIS:', items: [`If top client lost: ${fmt(lossImpact1)} immediate revenue loss`, `If top 2 clients lost: ${fmt(top1 + top2)} revenue at risk`, `Break-even impact: Would need ${pct(lossImpact1, total - lossImpact1)} revenue growth from remaining clients`, `Time to replace: Typically 12-24 months for major client loss`] },
      { title: 'GEOGRAPHIC CONCENTRATION:', items: [`Primary market: ${primaryMktPct}% of revenue`, `Geographic footprint: ${geoLabels[geo] || geo}`, `Risk level: ${primaryMktPct > 60 ? 'HIGH — local downturn could devastate revenue' : 'Manageable geographic spread'}`, `Recommendation: ${primaryMktPct > 60 ? 'Expand to adjacent markets within 18 months' : 'Maintain current geographic strategy'}`] },
    ]},
    actionPlan: { title: 'ACTION PLAN', subtitle: 'REVENUE DIVERSIFICATION STRATEGY', phases: [
      { title: 'PHASE 1: ASSESS & PLAN (Month 1)', items: [`Map all revenue by client, project type, and geography`, `Identify which clients are "sticky" vs. at-risk of leaving`, `Define target client profile for diversification`, `Set 24-month diversification goals`] },
      { title: 'PHASE 2: BUSINESS DEVELOPMENT (Month 2-6)', items: [`Hire or assign dedicated business development capacity`, `Target ${Math.ceil(diversTarget / 5)} new client relationships per quarter`, `Pursue work in adjacent geographic markets`, `Diversify project types to reduce sector concentration`, `Target: Top client below 25% within 24 months`] },
      { title: 'PHASE 3: RELATIONSHIP MANAGEMENT (Ongoing)', items: [`Deepen relationships with second-tier clients to grow their share`, `Create client retention program for key accounts`, `Monitor concentration quarterly — make it a KPI`, `Grow total revenue so single-client percentages shrink naturally`] },
    ]},
    measurement: { title: 'MEASUREMENT:', items: [`Quarterly HHI index tracking (target: <0.15)`, `Top client % of revenue (target: <25%)`, `New client wins per quarter (target: 3-5)`, `Geographic revenue split tracking`] },
    expectedOutcomes: { title: 'EXPECTED OUTCOMES:', items: [`Reduce top client concentration from ${top1Pct.toFixed(0)}% to <25%`, `Lower HHI from ${hhi.toFixed(2)} to <0.15`, `Build resilient revenue base that survives any single client loss`, `Expand geographic footprint to reduce local market risk`] },
  };
}

export function calculateGrowthReadinessAssessor(inputs: Record<string, any>): CalculationResult {
  const rev = n(inputs.currentRevenue); const growth = n(inputs.revenueGrowthRate); const backlog = n(inputs.backlogMonths);
  const keyPeople = n(inputs.keyEmployees); const systems = inputs.systemsMaturity || 'basic'; const capital = inputs.capitalAccess || 'limited';
  const sysScores: Record<string, number> = { 'ad-hoc': 20, basic: 40, structured: 70, optimized: 95 };
  const capScores: Record<string, number> = { none: 5, limited: 25, moderate: 60, strong: 90 };
  const revPerKey = keyPeople > 0 ? rev / keyPeople : 0; const keyTarget = rev / 500000;
  const backlogScore = backlog >= 3 && backlog <= 8 ? 80 : backlog < 3 ? backlog * 25 : Math.max(20, 80 - (backlog - 8) * 10);
  const growthScore = growth >= 10 && growth <= 30 ? 75 : growth < 10 ? growth * 7 : Math.max(30, 75 - (growth - 30) * 2);
  const peopleScore = Math.min(100, (keyPeople / Math.max(keyTarget, 1)) * 100);
  const totalScore = Math.round(growthScore * 0.2 + backlogScore * 0.2 + peopleScore * 0.2 + (sysScores[systems] || 40) * 0.2 + (capScores[capital] || 25) * 0.2);
  const riskLevel: CalculationResult['riskLevel'] = totalScore >= 70 ? 'Low' : totalScore >= 50 ? 'Medium' : totalScore >= 30 ? 'High' : 'Critical';
  const sysLabels: Record<string, string> = { 'ad-hoc': 'Ad-hoc - Manual processes', basic: 'Basic - Some documentation', structured: 'Structured - Formal systems', optimized: 'Optimized - Continuous improvement' };
  const capLabels: Record<string, string> = { none: 'None', limited: 'Limited - Personal savings', moderate: 'Moderate - Bank lines available', strong: 'Strong - Multiple funding sources' };
  return {
    primaryMetrics: [
      { label: 'READINESS SCORE', value: `${totalScore}/100 | ${totalScore >= 70 ? 'Ready for growth' : totalScore >= 50 ? 'Moderate readiness — address gaps' : 'Not ready — critical gaps exist'}` },
      { label: 'GROWTH TRAJECTORY', value: `${fmt(rev)} at ${growth}% YoY | Backlog: ${backlog} months | ${growth > 25 ? 'Rapid growth — systems must keep pace' : 'Healthy growth trajectory'}` },
      { label: 'BOTTLENECK AREAS', value: `${(sysScores[systems] || 40) < 50 ? 'Systems & Processes' : ''}${peopleScore < 60 ? ((sysScores[systems] || 40) < 50 ? ', ' : '') + 'Key People' : ''}${(capScores[capital] || 25) < 50 ? ', Capital Access' : ''}` || 'No critical bottlenecks' },
      { label: 'CAPACITY', value: `${keyPeople} key people managing ${fmt(rev)} (${fmt(revPerKey)} per key person) | Target: 1 per ${fmt(500000)} revenue` },
    ],
    riskLevel, summary: `Growth readiness: ${totalScore}/100. ${totalScore >= 70 ? 'Organization can support growth.' : 'Address bottlenecks before scaling.'}`,
    scoreBreakdown: [
      { label: 'Revenue Growth', value: growthScore },
      { label: 'Backlog Health', value: backlogScore },
      { label: 'People & Leadership', value: peopleScore },
      { label: 'Systems Maturity', value: sysScores[systems] || 40 },
      { label: 'Capital Access', value: capScores[capital] || 25 },
    ],
    recommendations: [
      (sysScores[systems] || 40) < 60 ? `Systems at "${systems}" level cannot scale — invest in integrated software` : 'Systems can support continued growth',
      peopleScore < 70 ? `${keyPeople} key people for ${fmt(rev)} revenue is thin — hire ${Math.ceil(keyTarget - keyPeople)} more` : 'Leadership depth is adequate',
      (capScores[capital] || 25) < 50 ? 'Secure growth capital — bank lines, equipment financing, retained earnings' : 'Capital access supports growth plans',
      backlog < 3 ? 'Backlog below 3 months — invest in business development' : backlog > 8 ? 'Heavy backlog — ensure you can execute without quality slip' : 'Backlog is in healthy range',
      `Create a 24-month growth roadmap with quarterly milestones`,
    ],
    detailedAnalysis: { title: 'DETAILED ANALYSIS', subtitle: 'GROWTH READINESS ASSESSMENT', sections: [
      { title: 'BUSINESS PROFILE:', items: [`Current Revenue: ${fmt(rev)}`, `Growth Rate: ${growth}% YoY`, `Backlog: ${backlog} months of revenue`, `Key Leaders/Staff: ${keyPeople}`, `Systems Maturity: ${sysLabels[systems] || systems}`, `Capital Access: ${capLabels[capital] || capital}`] },
      { title: 'GROWTH CAPACITY ANALYSIS:', items: [`Revenue per key person: ${fmt(revPerKey)} (target: ${fmt(500000)})`, `Key people needed for current revenue: ${Math.ceil(keyTarget)}`, `Key people gap: ${Math.max(0, Math.ceil(keyTarget) - keyPeople)} additional needed`, `At ${growth}% growth, next year revenue: ${fmt(rev * (1 + growth / 100))}`, `Additional key people needed for growth: ${Math.ceil(rev * (growth / 100) / 500000)}`] },
      { title: 'SCALING READINESS:', items: [`Systems: ${(sysScores[systems] || 40) >= 60 ? 'Can scale' : 'Will break under increased volume'} — currently ${sysLabels[systems] || systems}`, `People: ${peopleScore >= 70 ? 'Adequate depth' : 'Thin — key person risk exists'}`, `Capital: ${(capScores[capital] || 25) >= 50 ? 'Available for investment' : 'Constrains growth — must secure funding'}`, `Backlog: ${backlog >= 3 && backlog <= 8 ? 'Healthy demand' : backlog < 3 ? 'Insufficient demand' : 'Execution risk from over-commitment'}`] },
    ]},
    actionPlan: { title: 'ACTION PLAN', subtitle: 'GROWTH READINESS IMPROVEMENT ROADMAP', phases: [
      { title: 'PHASE 1: CLOSE GAPS (Month 1-3)', items: [`${(sysScores[systems] || 40) < 60 ? 'Implement integrated construction ERP/PM software' : 'Optimize existing systems for scale'}`, `${peopleScore < 70 ? 'Hire ' + Math.max(1, Math.ceil(keyTarget - keyPeople)) + ' key leaders (estimators, PMs, foremen)' : 'Cross-train existing team for redundancy'}`, `${(capScores[capital] || 25) < 50 ? 'Establish bank credit line and equipment financing' : 'Maintain current capital relationships'}`, `Document core processes — they must be repeatable to scale`] },
      { title: 'PHASE 2: BUILD INFRASTRUCTURE (Month 3-6)', items: [`Standardize estimating, project management, and reporting`, `Create onboarding program for rapid new-hire integration`, `Build financial forecasting model for growth scenarios`, `Establish KPI dashboard for real-time business visibility`] },
      { title: 'PHASE 3: EXECUTE GROWTH (Month 6-24)', items: [`Target ${growth > 0 ? growth : 15}% annual revenue growth`, `Add capacity ahead of demand — don't wait until you're stretched`, `Monitor growth readiness score quarterly`, `Invest ${(rev * 0.02).toFixed(0)} annually in systems and training`] },
    ]},
    measurement: { title: 'MEASUREMENT:', items: [`Quarterly growth readiness score (target: 70+)`, `Revenue per key employee (target: ${fmt(500000)})`, `Backlog months (target: 4-6 months)`, `Systems utilization and adoption rates`, `Working capital and credit availability`] },
    expectedOutcomes: { title: 'EXPECTED OUTCOMES:', items: [`Improve readiness score from ${totalScore} to 70+ within 6 months`, `Support ${growth}%+ annual growth without operational breakdown`, `Build scalable infrastructure for long-term success`, `Reduce key-person risk through depth and documentation`] },
  };
}

export function calculateTechStackGrader(inputs: Record<string, any>): CalculationResult {
  const pm = inputs.projectManagement === 'yes'; const est = inputs.estimatingTool === 'yes';
  const time = inputs.timeTracking === 'yes'; const acct = inputs.accountingSoftware === 'yes';
  const field = inputs.fieldReporting === 'yes'; const integ = inputs.integrationLevel || 'standalone';
  const toolCount = [pm, est, time, acct, field].filter(Boolean).length;
  const integScores: Record<string, number> = { standalone: 10, manual: 30, integrated: 65, automated: 95 };
  const integScore = integScores[integ] || 10;
  const coverageScore = (toolCount / 5) * 100;
  const totalScore = Math.round(coverageScore * 0.5 + integScore * 0.5);
  const grade = totalScore >= 85 ? 'A' : totalScore >= 70 ? 'B+' : totalScore >= 55 ? 'B' : totalScore >= 40 ? 'C' : totalScore >= 25 ? 'D' : 'F';
  const riskLevel: CalculationResult['riskLevel'] = totalScore >= 70 ? 'Low' : totalScore >= 45 ? 'Medium' : totalScore >= 25 ? 'High' : 'Critical';
  const missing = [!pm && 'Project Management', !est && 'Estimating', !time && 'Time Tracking', !acct && 'Accounting/ERP', !field && 'Field Reporting'].filter(Boolean);
  const integLabels: Record<string, string> = { standalone: 'Standalone - No integration', manual: 'Manual - Data entry between tools', integrated: 'Integrated - Some data sync', automated: 'Automated - Full integration' };
  return {
    primaryMetrics: [
      { label: 'TECH MATURITY GRADE', value: `${grade} (${totalScore}/100) | ${totalScore >= 70 ? 'Above average for construction' : totalScore >= 45 ? 'Average — improvement opportunities exist' : 'Below average — technology gaps hurt productivity'}` },
      { label: 'COVERAGE', value: `${toolCount}/5 core systems in place | ${missing.length > 0 ? 'Missing: ' + missing.join(', ') : 'All core systems covered'}` },
      { label: 'INTEGRATION', value: `${integLabels[integ] || integ} | ${integScore >= 60 ? 'Data flows between systems' : 'Manual data re-entry between tools (error-prone, slow)'}` },
      { label: 'IMPROVEMENT PRIORITIES', value: `${missing.length > 0 ? '1) Add ' + missing[0] + ' software' : 'Coverage is complete'} | ${integScore < 60 ? '2) Improve system integration' : '2) Optimize existing workflows'}` },
    ],
    riskLevel, summary: `Tech stack grade: ${grade}. ${toolCount}/5 core systems, ${integLabels[integ]?.split(' - ')[0] || integ} integration.`,
    scoreBreakdown: [
      { label: 'Tool Coverage', value: coverageScore },
      { label: 'Integration Level', value: integScore },
      { label: 'Data Visibility', value: integScore >= 60 ? 80 : integScore >= 30 ? 50 : 20 },
      { label: 'Process Automation', value: integScore >= 80 ? 90 : integScore >= 50 ? 50 : 15 },
    ],
    recommendations: [
      ...missing.slice(0, 2).map(m => `Add ${m} software — critical gap in your tech stack`),
      integScore < 50 ? 'Prioritize system integration — manual data entry wastes 10-20 hours/week' : 'Integration is decent — look for automation opportunities',
      !field ? 'Mobile field reporting is the #1 ROI technology for contractors' : 'Field reporting in place — ensure crew adoption rate is >80%',
      `Evaluate integrated construction ERP to replace standalone tools`,
    ],
    detailedAnalysis: { title: 'DETAILED ANALYSIS', subtitle: 'TECHNOLOGY MATURITY & DIGITAL READINESS', sections: [
      { title: 'CURRENT TECH STACK:', items: [`Project Management: ${pm ? 'YES ✓' : 'NO ⚠️'}`, `Estimating Software: ${est ? 'YES ✓' : 'NO ⚠️'}`, `Time Tracking/Labor: ${time ? 'YES ✓' : 'NO ⚠️'}`, `Accounting/ERP: ${acct ? 'YES ✓' : 'NO ⚠️'}`, `Field Reporting/Mobile: ${field ? 'YES ✓' : 'NO ⚠️'}`, `Integration Level: ${integLabels[integ] || integ}`] },
      { title: 'SCORING:', items: [`Coverage Score: ${coverageScore.toFixed(0)}/100 (${toolCount}/5 systems)`, `Integration Score: ${integScore}/100`, `Overall Grade: ${grade} (${totalScore}/100)`, `Industry Average: C+ (45-55/100)`, `Best-in-Class: A (85+/100)`] },
      { title: 'PRODUCTIVITY IMPACT:', items: [`${integ === 'standalone' || integ === 'manual' ? 'Manual data re-entry: ~10-20 hours/week wasted' : 'Data flows reduce manual entry'}`, `${!field ? 'No field reporting: delayed job-cost visibility by 3-7 days' : 'Field data available same-day'}`, `${!time ? 'Manual time tracking: 5-15% payroll leakage typical' : 'Digital time tracking reduces payroll errors'}`, `Estimated productivity loss from tech gaps: ${(5 - toolCount) * 3 + (100 - integScore) / 10}% of overhead`] },
    ]},
    actionPlan: { title: 'ACTION PLAN', subtitle: 'TECHNOLOGY IMPROVEMENT ROADMAP', phases: [
      { title: 'PHASE 1: FILL GAPS (Month 1-2)', items: missing.length > 0 ? [...missing.map(m => `Evaluate and select ${m} software`), `Budget: $200-500/user/month for cloud-based construction tools`, `Prioritize tools with mobile capability for field use`] : ['All core systems in place — focus on optimization and integration', 'Audit current tool usage and adoption rates', 'Identify workflow bottlenecks in existing tools'] },
      { title: 'PHASE 2: INTEGRATE (Month 2-4)', items: [`${integScore < 50 ? 'Connect systems through APIs or middleware' : 'Deepen existing integrations'}`, `Eliminate manual data re-entry between systems`, `Create single source of truth for project data`, `Train all users on integrated workflows`] },
      { title: 'PHASE 3: OPTIMIZE (Month 4-12)', items: [`Implement real-time dashboards for project visibility`, `Automate routine reports (daily logs, cost reports, schedules)`, `Track adoption metrics — technology only works if people use it`, `Target Grade: ${grade === 'A' ? 'Maintain A' : totalScore >= 55 ? 'A' : 'B+'} within 12 months`] },
    ]},
    measurement: { title: 'MEASUREMENT:', items: [`Quarterly tech maturity score (target: 70+)`, `User adoption rate (target: >80% active users)`, `Manual data entry hours reduced (target: 50% reduction)`, `Time-to-insight for job cost data (target: same-day)`] },
    expectedOutcomes: { title: 'EXPECTED OUTCOMES:', items: [`Improve tech grade from ${grade} to ${totalScore >= 55 ? 'A' : 'B+'}`, `Reduce admin overhead by 15-25% through automation`, `Gain real-time visibility into project costs and schedules`, `Improve decision-making speed with integrated data`] },
  };
}

export function calculateChangeOrderTrendTracker(inputs: Record<string, any>): CalculationResult {
  const contract = n(inputs.totalContractValue); const totalCOs = n(inputs.totalChangeOrders);
  const approved = n(inputs.approvedCOs); const denied = n(inputs.deniedCOs);
  const procDays = n(inputs.avgProcessingDays); const reason = inputs.primaryCOReason || 'scope';
  const coPctContract = contract > 0 ? (totalCOs / contract) * 100 : 0;
  const approvalRate = totalCOs > 0 ? (approved / totalCOs) * 100 : 0;
  const deniedPct = totalCOs > 0 ? (denied / totalCOs) * 100 : 0;
  const benchCO = 6; const overBench = coPctContract - benchCO;
  const reasonLabels: Record<string, string> = { scope: 'Scope Clarification', owner: 'Owner Requests', conditions: 'Site Conditions', design: 'Design Issues', delay: 'Schedule Delays', supply: 'Material/Supply Chain' };
  const riskLevel: CalculationResult['riskLevel'] = coPctContract <= 8 ? 'Low' : coPctContract <= 12 ? 'Medium' : coPctContract <= 18 ? 'High' : 'Critical';
  return {
    primaryMetrics: [
      { label: 'CO AS % OF CONTRACT', value: `${coPctContract.toFixed(1)}% (${fmt(totalCOs)} on ${fmt(contract)} contract) | Industry benchmark: ${benchCO}-8%` },
      { label: 'APPROVAL RATE', value: `${approvalRate.toFixed(1)}% approved (${fmt(approved)}) | ${deniedPct.toFixed(1)}% denied (${fmt(denied)})` },
      { label: 'PROCESSING EFFICIENCY', value: `${procDays} days average processing | ${procDays <= 7 ? 'Efficient' : procDays <= 14 ? 'Acceptable' : 'Slow — cash flow impact'}` },
      { label: 'PRIMARY DRIVER', value: `${reasonLabels[reason] || reason} | ${overBench > 0 ? fmt(contract * overBench / 100) + ' excess COs vs. benchmark' : 'Within benchmark range'}` },
    ],
    riskLevel, summary: `Change orders at ${coPctContract.toFixed(1)}% of contract value. ${coPctContract > benchCO ? 'Above industry benchmark.' : 'Within benchmark.'}`,
    scoreBreakdown: [
      { label: 'CO Volume Control', value: Math.max(0, Math.min(100, (1 - coPctContract / 20) * 100)) },
      { label: 'Approval Rate', value: Math.min(100, approvalRate) },
      { label: 'Processing Speed', value: Math.max(0, Math.min(100, (1 - procDays / 30) * 100)) },
    ],
    recommendations: [
      coPctContract > 10 ? `CO rate of ${coPctContract.toFixed(1)}% is excessive — implement prevention measures` : 'CO rate is manageable',
      procDays > 10 ? `${procDays}-day processing is slow — target 5-7 days for approval` : 'Processing speed is efficient',
      denied > totalCOs * 0.2 ? `${deniedPct.toFixed(0)}% denial rate suggests scope documentation issues` : 'Approval rate is healthy',
      `Address root cause: ${reasonLabels[reason] || reason}`,
      `Implement pre-construction scope review to prevent COs`,
    ],
    detailedAnalysis: { title: 'DETAILED ANALYSIS', subtitle: 'CHANGE ORDER TREND & ROOT CAUSE ANALYSIS', sections: [
      { title: 'CHANGE ORDER SUMMARY:', items: [`Contract Value: ${fmt(contract)}`, `Total COs Issued: ${fmt(totalCOs)} (${coPctContract.toFixed(1)}% of contract)`, `Approved: ${fmt(approved)} (${approvalRate.toFixed(1)}%)`, `Denied: ${fmt(denied)} (${deniedPct.toFixed(1)}%)`, `Average Processing: ${procDays} days`, `Primary Cause: ${reasonLabels[reason] || reason}`, `Industry Benchmark: ${benchCO}-8% of contract`] },
      { title: 'ROOT CAUSE ANALYSIS:', items: [`Primary Driver: ${reasonLabels[reason] || reason}`, reason === 'scope' ? 'Scope ambiguity in original contract — improve specifications' : reason === 'owner' ? 'Owner-initiated changes — establish change order procedures upfront' : reason === 'conditions' ? 'Unforeseen site conditions — improve pre-construction investigation' : reason === 'design' ? 'Design deficiencies — push back on incomplete drawings' : reason === 'delay' ? 'Schedule disruptions causing cascade changes' : 'Supply chain volatility — lock pricing and lead times earlier', `Prevention opportunity: ${fmt(Math.max(0, contract * overBench / 100))}/project`] },
      { title: 'FINANCIAL IMPACT:', items: [`Revenue from approved COs: ${fmt(approved)} (additional contract value)`, `Cost of denied COs: Estimating time wasted on ${fmt(denied)} in rejected changes`, `Processing delays: ${procDays > 7 ? fmt(approved * procDays * 0.001) + ' in delayed cash flow' : 'Minimal impact at current speed'}`, `If CO rate reduced to ${benchCO}%: ${fmt(Math.max(0, totalCOs - contract * benchCO / 100))} fewer COs to manage`] },
    ]},
    actionPlan: { title: 'ACTION PLAN', subtitle: 'CHANGE ORDER MANAGEMENT & PREVENTION', phases: [
      { title: 'PREVENTION (Pre-Construction):', items: [`Improve scope documentation to reduce ambiguity`, `Conduct thorough pre-construction site investigation`, `Establish clear change order procedures in contract`, `Define what constitutes a change vs. included scope`, `Lock material pricing and lead times pre-construction`] },
      { title: 'PROCESS IMPROVEMENT (During Construction):', items: [`Implement real-time CO tracking system`, `Target ${Math.min(procDays, 7)}-day or less approval cycle`, `Document all potential changes immediately with photos`, `Weekly CO status review with project team`, `Maintain running log of approved/pending/denied COs`] },
    ]},
    measurement: { title: 'MEASUREMENT:', items: [`CO % of contract (target: <${benchCO}%)`, `Approval cycle time (target: <7 days)`, `Denial rate (target: <15%)`, `Root cause tracking by category`] },
    expectedOutcomes: { title: 'EXPECTED OUTCOMES:', items: [`Reduce CO rate from ${coPctContract.toFixed(1)}% to <${benchCO}%`, `Improve processing from ${procDays} days to <7 days`, `Capture 100% of legitimate out-of-scope work as COs`, `Prevent scope creep through better pre-construction documentation`] },
  };
}

export function calculateCrewUtilizationOptimizer(inputs: Record<string, any>): CalculationResult {
  const total = n(inputs.totalCrewHours); const billable = n(inputs.billableHours); const travel = n(inputs.travelHours);
  const idle = n(inputs.idleHours); const rework = n(inputs.reworkHours); const training = n(inputs.trainingHours);
  const utilRate = total > 0 ? (billable / total) * 100 : 0; const bench = 75;
  const nonBillable = travel + idle + rework + training;
  const avgRate = 55; const idleCost = idle * avgRate; const reworkCost = rework * avgRate; const travelCost = travel * avgRate;
  const totalNonBillCost = nonBillable * avgRate;
  const gapHours = Math.max(0, total * (bench / 100) - billable);
  const gapRevenue = gapHours * avgRate;
  const travelPct = total > 0 ? (travel / total) * 100 : 0;
  const idlePct = total > 0 ? (idle / total) * 100 : 0;
  const reworkPct = total > 0 ? (rework / total) * 100 : 0;
  const riskLevel: CalculationResult['riskLevel'] = utilRate >= bench ? 'Low' : utilRate >= 65 ? 'Medium' : utilRate >= 55 ? 'High' : 'Critical';
  return {
    primaryMetrics: [
      { label: 'UTILIZATION RATE', value: `${utilRate.toFixed(1)}% billable (${billable.toLocaleString()} of ${total.toLocaleString()} hours) | Benchmark: ${bench}%` },
      { label: 'IDLE TIME COST', value: `${fmt(idleCost)}/year in idle/waiting time (${idle.toLocaleString()} hours at $${avgRate}/hr)` },
      { label: 'REWORK COST', value: `${fmt(reworkCost)}/year in rework (${rework.toLocaleString()} hours) — pure profit loss` },
      { label: 'IMPROVEMENT OPPORTUNITY', value: `${fmt(gapRevenue)} additional billable revenue if utilization reaches ${bench}% (+${gapHours.toLocaleString()} hours)` },
    ],
    riskLevel, summary: utilRate >= bench ? `Crew utilization is strong at ${utilRate.toFixed(1)}%.` : `Utilization ${(bench - utilRate).toFixed(1)}% below benchmark. ${fmt(gapRevenue)} revenue opportunity.`,
    scoreBreakdown: [
      { label: 'Billable Utilization', value: Math.min(100, (utilRate / bench) * 100) },
      { label: 'Idle Time Control', value: Math.max(0, 100 - idlePct * 5) },
      { label: 'Quality (Low Rework)', value: Math.max(0, 100 - reworkPct * 10) },
      { label: 'Travel Efficiency', value: Math.max(0, 100 - travelPct * 3) },
    ],
    recommendations: [
      utilRate < bench ? `Target ${bench}% utilization — ${fmt(gapRevenue)} at stake` : 'Utilization is at benchmark',
      idle > total * 0.1 ? `Idle time at ${idlePct.toFixed(1)}% — implement pre-staging of materials and tools` : 'Idle time is controlled',
      rework > total * 0.05 ? `Rework at ${reworkPct.toFixed(1)}% — address quality and training issues` : 'Quality is strong',
      travel > total * 0.15 ? `Travel at ${travelPct.toFixed(1)}% — optimize job-site routing and consolidate` : 'Travel time is managed',
      `Implement daily crew deployment tracking for real-time visibility`,
    ],
    detailedAnalysis: { title: 'DETAILED ANALYSIS', subtitle: 'CREW PRODUCTIVITY & UTILIZATION ANALYSIS', sections: [
      { title: 'TIME ALLOCATION BREAKDOWN:', items: [`Total Crew Hours: ${total.toLocaleString()}`, `Billable/Productive: ${billable.toLocaleString()} (${utilRate.toFixed(1)}%)`, `Travel: ${travel.toLocaleString()} (${travelPct.toFixed(1)}%)`, `Idle/Waiting: ${idle.toLocaleString()} (${idlePct.toFixed(1)}%)`, `Rework: ${rework.toLocaleString()} (${reworkPct.toFixed(1)}%)`, `Training: ${training.toLocaleString()} (${total > 0 ? ((training / total) * 100).toFixed(1) : 0}%)`, `Industry Benchmark: ${bench}% billable`] },
      { title: 'COST IMPACT:', items: [`Idle/Waiting Cost: ${fmt(idleCost)} (${idle.toLocaleString()} hours × $${avgRate}/hr)`, `Rework Cost: ${fmt(reworkCost)} (${rework.toLocaleString()} hours × $${avgRate}/hr)`, `Travel Cost: ${fmt(travelCost)} (${travel.toLocaleString()} hours × $${avgRate}/hr)`, `Total Non-Billable Cost: ${fmt(totalNonBillCost)}`, `Revenue gap to ${bench}% benchmark: ${fmt(gapRevenue)}`] },
      { title: 'ROOT CAUSE ANALYSIS:', items: [`Idle time drivers: Waiting for materials, customer delays, equipment downtime, weather`, `Rework drivers: Unclear instructions, quality defects, design changes, skill gaps`, `Travel drivers: Job-site distance, poor route planning, multiple daily sites`, `${idle > rework ? 'Primary opportunity: Reduce idle time (largest non-billable category)' : 'Primary opportunity: Reduce rework through quality improvement'}`] },
    ]},
    actionPlan: { title: 'ACTION PLAN', subtitle: 'CREW UTILIZATION IMPROVEMENT STRATEGY', phases: [
      { title: 'PHASE 1: REDUCE IDLE TIME (Week 1-4)', items: [`Pre-stage materials and tools before crew arrives`, `Confirm site access and readiness day before`, `Create daily dispatch plan with backup work assignments`, `Implement "no idle crew" policy — always have productive fallback`, `Target: Cut idle time from ${idlePct.toFixed(1)}% to ${Math.max(3, idlePct / 2).toFixed(1)}%`] },
      { title: 'PHASE 2: ELIMINATE REWORK (Month 1-3)', items: [`Implement quality checklists for each trade activity`, `Brief crew on scope details before starting each task`, `Train on "do it right the first time" methodology`, `Address skill gaps through targeted training`, `Target: Cut rework from ${reworkPct.toFixed(1)}% to <3%`] },
      { title: 'PHASE 3: OPTIMIZE SCHEDULING (Month 2-6)', items: [`Route optimization for multi-site days`, `Consolidate small jobs geographically`, `Stagger crew start times to avoid peak-hour travel`, `Implement GPS tracking for fleet management`, `Target: Reduce travel from ${travelPct.toFixed(1)}% to <10%`] },
    ]},
    measurement: { title: 'MEASUREMENT:', items: [`Weekly utilization rate per crew (target: ${bench}%)`, `Idle hours per week (target: <${(total * 0.05 / 52).toFixed(0)} hours/week)`, `Rework rate by project and crew leader`, `Travel time per revenue dollar`, `Daily dispatch efficiency score`] },
    expectedOutcomes: { title: 'EXPECTED OUTCOMES:', items: [`Increase utilization from ${utilRate.toFixed(1)}% to ${bench}%`, `Recover ${fmt(gapRevenue)} in billable revenue annually`, `Reduce idle costs by ${fmt(idleCost * 0.5)}/year`, `Reduce rework costs by ${fmt(reworkCost * 0.6)}/year`, `Same crew size, better productivity = higher profit`] },
  };
}

// ============================================================================
// TOOL DISPATCHER
// ============================================================================

export function calculateTool(toolSlug: string, inputs: Record<string, any>): CalculationResult {
  switch (toolSlug) {
    case 'cash-flow-gap-analyzer': return calculateCashFlowGapAnalyzer(inputs);
    case 'margin-erosion-monitor': return calculateMarginErosionMonitor(inputs);
    case 'overhead-benchmarker': return calculateOverheadBenchmarker(inputs);
    case 'win-rate-tracker': return calculateWinRateTracker(inputs);
    case 'bid-no-bid-decision-tool': return calculateBidNoBidDecisionTool(inputs);
    case 'prequalification-scorecard': return calculatePrequalificationScorecard(inputs);
    case 'bonding-capacity-calculator': return calculateBondingCapacityCalculator(inputs);
    case 'insurance-gap-analyzer': return calculateInsuranceGapAnalyzer(inputs);
    case 'emr-simulator': return calculateEMRSimulator(inputs);
    case 'safety-maturity-assessor': return calculateSafetyMaturityAssessor(inputs);
    case 'toolbox-talk-generator': return calculateToolboxTalkGenerator(inputs);
    case 'revenue-concentration-analyzer': return calculateRevenueConcentrationAnalyzer(inputs);
    case 'growth-readiness-assessor': return calculateGrowthReadinessAssessor(inputs);
    case 'tech-stack-grader': return calculateTechStackGrader(inputs);
    case 'change-order-trend-tracker': return calculateChangeOrderTrendTracker(inputs);
    case 'crew-utilization-optimizer': return calculateCrewUtilizationOptimizer(inputs);
    default: throw new Error(`Unknown tool: ${toolSlug}`);
  }
}
