/**
 * Calculation Engine for Trade Partner HQ
 * Pure functions for all 16 business intelligence tools
 * No side effects, no API calls
 * STANDARDIZED OUTPUT FORMAT for all tools
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function n(val: any): number {
  const parsed = Number(val);
  return isNaN(parsed) ? 0 : parsed;
}

export function fmtCurrency(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

export function fmtPct(val: number): string {
  return `${(val * 100).toFixed(1)}%`;
}

// ============================================================================
// STANDARDIZED OUTPUT FORMAT
// ============================================================================

export interface CalculationResult {
  primaryMetrics: Array<{
    label: string;
    value: string;
    subtext: string;
  }>;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  summary: string;
  scoreBreakdown: Array<{
    label: string;
    value: number; // 0-100
  }>;
  recommendations: string[];
  detailedAnalysis: {
    sections: Array<{
      title: string;
      items: string[];
    }>;
  };
}

// ============================================================================
// TOOL 1: CASH FLOW GAP ANALYZER
// ============================================================================

export function calculateCashFlowGapAnalyzer(inputs: Record<string, any>): CalculationResult {
  const monthlyRevenue = n(inputs.monthlyRevenue);
  const avgCollectionDays = n(inputs.avgCollectionDays);
  const upcomingPayroll = n(inputs.upcomingPayroll);
  const equipmentCosts = n(inputs.equipmentCosts);
  const retainagePercent = n(inputs.retainagePercent);
  const openReceivables = n(inputs.openReceivables);

  // Calculate 90-day cash flow
  const totalNeeds = upcomingPayroll + equipmentCosts;
  const retainageHeld = openReceivables * (retainagePercent / 100);
  const availableCash = openReceivables - retainageHeld;
  const gap = Math.max(0, totalNeeds - availableCash);
  const gapDays = monthlyRevenue > 0 ? Math.round((gap / monthlyRevenue) * 30) : 0;

  const riskLevel = gap === 0 ? 'Low' : gap < monthlyRevenue * 0.25 ? 'Medium' : gap < monthlyRevenue * 0.5 ? 'High' : 'Critical';
  const healthScore = Math.max(0, Math.min(100, 100 - (gap / monthlyRevenue) * 200));
  const collectionScore = Math.max(0, Math.min(100, 100 - avgCollectionDays));
  const retainageScore = Math.max(0, Math.min(100, 100 - retainagePercent));

  return {
    primaryMetrics: [
      {
        label: 'Cash Gap',
        value: fmtCurrency(gap),
        subtext: gap === 0 ? 'No shortfall projected' : `${gapDays} days to critical`,
      },
      {
        label: 'Available Cash',
        value: fmtCurrency(availableCash),
        subtext: `${fmtPct(availableCash / (monthlyRevenue || 1))} of monthly revenue`,
      },
      {
        label: '90-Day Needs',
        value: fmtCurrency(totalNeeds),
        subtext: `${fmtCurrency(upcomingPayroll)} payroll + ${fmtCurrency(equipmentCosts)} equipment`,
      },
      {
        label: 'Retainage Held',
        value: fmtCurrency(retainageHeld),
        subtext: `${retainagePercent}% of receivables`,
      },
    ],
    riskLevel,
    summary: gap === 0
      ? 'Strong cash position with no projected 90-day shortfalls. Continue monitoring collection cycles.'
      : `${gapDays > 0 ? gapDays + ' days until potential shortfall' : 'Cash gap exists'}. Address collection velocity and retainage timing.`,
    scoreBreakdown: [
      { label: 'Cash Health', value: healthScore },
      { label: 'Collection Efficiency', value: collectionScore },
      { label: 'Retainage Risk', value: retainageScore },
      { label: 'Payroll Coverage', value: availableCash > upcomingPayroll ? 100 : Math.min(100, (availableCash / upcomingPayroll) * 100) },
    ],
    recommendations: [
      gap > monthlyRevenue * 0.25 ? `Establish $${fmtCurrency(gap * 1.2)} credit line for buffer` : 'Current credit facilities appear adequate',
      avgCollectionDays > 45 ? 'Focus on reducing collection days to 30—accelerate follow-up' : 'Collection cycle is healthy',
      retainagePercent > 10 ? 'Negotiate retainage release schedules monthly' : 'Retainage percentage is manageable',
      equipmentCosts > monthlyRevenue * 0.2 ? 'Stagger equipment purchases to smooth cash flow' : 'Equipment spending is balanced',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Cash Position Analysis',
          items: [
            `Monthly Revenue: ${fmtCurrency(monthlyRevenue)}`,
            `Collection Days: ${avgCollectionDays} days (target: 30-40)`,
            `Open Receivables: ${fmtCurrency(openReceivables)}`,
            `Realizable from AR: ${fmtCurrency(availableCash)}`,
          ],
        },
        {
          title: '90-Day Obligations',
          items: [
            `Payroll Commitment: ${fmtCurrency(upcomingPayroll)}`,
            `Equipment Investment: ${fmtCurrency(equipmentCosts)}`,
            `Total Needs: ${fmtCurrency(totalNeeds)}`,
            `Gap Position: ${gap === 0 ? 'Covered' : fmtCurrency(gap) + ' shortfall'}`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 2: MARGIN EROSION MONITOR
// ============================================================================

export function calculateMarginErosionMonitor(inputs: Record<string, any>): CalculationResult {
  const contractValue = n(inputs.contractValue);
  const estimatedMarginPercent = n(inputs.estimatedMarginPercent);
  const laborCost = n(inputs.laborCost);
  const materialCost = n(inputs.materialCost);
  const equipmentCost = n(inputs.equipmentCost);
  const subcontractorCost = n(inputs.subcontractorCost);
  const changeOrderValue = n(inputs.changeOrderValue);

  const budgetedMargin = contractValue * (estimatedMarginPercent / 100);
  const totalCosts = laborCost + materialCost + equipmentCost + subcontractorCost;
  const currentMargin = contractValue + changeOrderValue - totalCosts;
  const currentMarginPercent = (contractValue + changeOrderValue) > 0 ? (currentMargin / (contractValue + changeOrderValue)) * 100 : 0;
  const erosion = estimatedMarginPercent - currentMarginPercent;

  const riskLevel = erosion <= 0 ? 'Low' : erosion < 3 ? 'Medium' : erosion < 7 ? 'High' : 'Critical';
  const marginHealth = Math.max(0, Math.min(100, (currentMarginPercent / Math.max(estimatedMarginPercent, 1)) * 100));

  return {
    primaryMetrics: [
      {
        label: 'Current Margin %',
        value: currentMarginPercent.toFixed(1) + '%',
        subtext: `${erosion > 0 ? 'Eroded by ' + erosion.toFixed(1) + '%' : 'On track'}`,
      },
      {
        label: 'Margin Dollars',
        value: fmtCurrency(currentMargin),
        subtext: `Budgeted: ${fmtCurrency(budgetedMargin)}`,
      },
      {
        label: 'Total Costs',
        value: fmtCurrency(totalCosts),
        subtext: `${fmtPct(totalCosts / (contractValue || 1))} of contract`,
      },
      {
        label: 'At-Risk Items',
        value: laborCost > contractValue * 0.4 ? 'Labor ⚠️' : materialCost > contractValue * 0.3 ? 'Materials ⚠️' : 'None',
        subtext: 'Highest cost line items',
      },
    ],
    riskLevel,
    summary: erosion <= 2
      ? `Margin is ${currentMarginPercent.toFixed(1)}%. Within acceptable tolerance.`
      : `Margin eroded ${erosion.toFixed(1)}% from budget. Cost control critical.`,
    scoreBreakdown: [
      { label: 'Margin Health', value: marginHealth },
      { label: 'Labor Cost Control', value: Math.min(100, Math.max(0, 100 - (laborCost / (contractValue * 0.4)) * 100)) },
      { label: 'Material Cost Control', value: Math.min(100, Math.max(0, 100 - (materialCost / (contractValue * 0.3)) * 100)) },
      { label: 'Subcontractor Management', value: Math.min(100, Math.max(0, 100 - (subcontractorCost / (contractValue * 0.25)) * 100)) },
    ],
    recommendations: [
      erosion > 5 ? 'Implement immediate cost freeze on discretionary expenses' : 'Continue current cost monitoring',
      laborCost > contractValue * 0.45 ? 'Review labor efficiency and scheduling' : 'Labor productivity is acceptable',
      changeOrderValue > contractValue * 0.1 ? 'Escalate scope changes to client' : 'Scope creep is controlled',
      totalCosts > contractValue * 0.9 ? 'Prepare change order request immediately' : 'Proceed to completion as planned',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Margin Comparison',
          items: [
            `Budget Margin: ${estimatedMarginPercent.toFixed(1)}% (${fmtCurrency(budgetedMargin)})`,
            `Actual Margin: ${currentMarginPercent.toFixed(1)}% (${fmtCurrency(currentMargin)})`,
            `Erosion: ${erosion.toFixed(1)}%`,
            `Change Orders: ${fmtCurrency(changeOrderValue)}`,
          ],
        },
        {
          title: 'Cost Breakdown',
          items: [
            `Labor: ${fmtCurrency(laborCost)} (${fmtPct(laborCost / (contractValue || 1))})`,
            `Materials: ${fmtCurrency(materialCost)} (${fmtPct(materialCost / (contractValue || 1))})`,
            `Equipment: ${fmtCurrency(equipmentCost)} (${fmtPct(equipmentCost / (contractValue || 1))})`,
            `Subcontractors: ${fmtCurrency(subcontractorCost)} (${fmtPct(subcontractorCost / (contractValue || 1))})`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 3: OVERHEAD BENCHMARKER
// ============================================================================

export function calculateOverheadBenchmarker(inputs: Record<string, any>): CalculationResult {
  const annualRevenue = n(inputs.annualRevenue);
  const totalOverhead = n(inputs.totalOverhead);
  const officeRent = n(inputs.officeRent);
  const insurance = n(inputs.insurance);
  const adminSalaries = n(inputs.adminSalaries);
  const vehicleCosts = n(inputs.vehicleCosts);
  const softwareCosts = n(inputs.softwareCosts);

  const overheadPercent = annualRevenue > 0 ? (totalOverhead / annualRevenue) * 100 : 0;
  const industryBenchmark = 15; // Industry std for construction
  const gap = overheadPercent - industryBenchmark;
  const riskLevel = overheadPercent <= 12 ? 'Low' : overheadPercent <= 18 ? 'Medium' : overheadPercent <= 25 ? 'High' : 'Critical';

  return {
    primaryMetrics: [
      {
        label: 'Overhead Ratio',
        value: overheadPercent.toFixed(1) + '%',
        subtext: `${gap > 0 ? '+' : ''}${gap.toFixed(1)}% vs industry`,
      },
      {
        label: 'Annual Overhead',
        value: fmtCurrency(totalOverhead),
        subtext: `${fmtCurrency(totalOverhead / 12)} per month`,
      },
      {
        label: 'Largest Category',
        value: adminSalaries > insurance && adminSalaries > vehicleCosts ? 'Admin Salaries' : insurance > vehicleCosts ? 'Insurance' : 'Vehicle Costs',
        subtext: fmtCurrency(Math.max(adminSalaries, insurance, vehicleCosts)),
      },
      {
        label: 'Target Overhead',
        value: fmtCurrency(annualRevenue * 0.15),
        subtext: `To reach 15% benchmark`,
      },
    ],
    riskLevel,
    summary: gap <= 2
      ? `Overhead at ${overheadPercent.toFixed(1)}%. In line with industry standards.`
      : `Overhead is ${gap.toFixed(1)}% above benchmark. Cost optimization recommended.`,
    scoreBreakdown: [
      { label: 'Overhead Efficiency', value: Math.min(100, Math.max(0, 100 - (gap * 5))) },
      { label: 'Fixed Cost Ratio', value: Math.min(100, Math.max(0, 100 - ((totalOverhead / annualRevenue) * 200))) },
      { label: 'Admin Cost Control', value: Math.min(100, Math.max(0, 100 - (adminSalaries / (annualRevenue * 0.08)) * 100)) },
    ],
    recommendations: [
      gap > 5 ? `Reduce overhead by ${fmtCurrency((totalOverhead - (annualRevenue * 0.15)))} to hit 15% target` : 'Overhead is competitive',
      officeRent > annualRevenue * 0.03 ? 'Review office space—consider downsizing or subletting' : 'Office rent is reasonable',
      adminSalaries > annualRevenue * 0.08 ? 'Evaluate admin staffing levels' : 'Admin headcount is lean',
      insurance > annualRevenue * 0.05 ? 'Request insurance quotes from competing brokers' : 'Insurance costs are fair',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Overhead Composition',
          items: [
            `Office Rent: ${fmtCurrency(officeRent)} (${fmtPct(officeRent / (totalOverhead || 1))})`,
            `Insurance: ${fmtCurrency(insurance)} (${fmtPct(insurance / (totalOverhead || 1))})`,
            `Admin Salaries: ${fmtCurrency(adminSalaries)} (${fmtPct(adminSalaries / (totalOverhead || 1))})`,
            `Vehicle Costs: ${fmtCurrency(vehicleCosts)} (${fmtPct(vehicleCosts / (totalOverhead || 1))})`,
            `Software & Tech: ${fmtCurrency(softwareCosts)} (${fmtPct(softwareCosts / (totalOverhead || 1))})`,
          ],
        },
        {
          title: 'Benchmark Analysis',
          items: [
            `Your Ratio: ${overheadPercent.toFixed(1)}%`,
            `Industry Target: 15%`,
            `Gap: ${gap > 0 ? '+' : ''}${gap.toFixed(1)}%`,
            `Annual Impact: ${fmtCurrency(Math.abs(gap * annualRevenue / 100))}`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 4: WIN RATE TRACKER
// ============================================================================

export function calculateWinRateTracker(inputs: Record<string, any>): CalculationResult {
  const totalBidsSubmitted = n(inputs.totalBidsSubmitted);
  const bidsWon = n(inputs.bidsWon);
  const avgBidValue = n(inputs.avgBidValue);

  const winRate = totalBidsSubmitted > 0 ? (bidsWon / totalBidsSubmitted) * 100 : 0;
  const pipelineValue = totalBidsSubmitted * avgBidValue;
  const expectedWinValue = pipelineValue * (winRate / 100);
  const industryBenchmark = 20; // 20% is typical
  const gap = winRate - industryBenchmark;
  const riskLevel = winRate >= 25 ? 'Low' : winRate >= 15 ? 'Medium' : 'High';

  return {
    primaryMetrics: [
      {
        label: 'Win Rate',
        value: winRate.toFixed(1) + '%',
        subtext: `${gap >= 0 ? '+' : ''}${gap.toFixed(1)}% vs industry (20%)`,
      },
      {
        label: 'Bids This Period',
        value: `${bidsWon} of ${totalBidsSubmitted}`,
        subtext: `${fmtCurrency(expectedWinValue)} expected value`,
      },
      {
        label: 'Pipeline Value',
        value: fmtCurrency(pipelineValue),
        subtext: `Avg ${fmtCurrency(avgBidValue)} per bid`,
      },
      {
        label: 'Performance vs Target',
        value: gap >= 0 ? '✓ Above Benchmark' : '⚠️ Below Target',
        subtext: `${Math.abs(gap).toFixed(1)}% difference`,
      },
    ],
    riskLevel,
    summary: winRate >= 20
      ? `Win rate of ${winRate.toFixed(1)}% exceeds benchmarks. Bid quality is strong.`
      : `Win rate of ${winRate.toFixed(1)}% is below target. Review bid strategy.`,
    scoreBreakdown: [
      { label: 'Win Rate Performance', value: Math.min(100, (winRate / industryBenchmark) * 100) },
      { label: 'Bid Volume Consistency', value: Math.min(100, Math.max(50, totalBidsSubmitted / 3)) },
      { label: 'Execution on Wins', value: bidsWon >= 5 ? 100 : Math.max(0, (bidsWon / 5) * 100) },
    ],
    recommendations: [
      winRate < 15 ? 'Audit bid process—higher margins or more selective bidding' : 'Win rate is healthy',
      totalBidsSubmitted < 10 ? 'Increase bid pipeline volume by 20%' : 'Bid volume is appropriate',
      gap < -10 ? 'Analyze lost bids to identify pricing or positioning gaps' : 'Competitiveness is good',
      expectedWinValue < avgBidValue * 5 ? 'Target higher-value projects to grow backlog' : 'Backlog trajectory is positive',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Win Rate Analysis',
          items: [
            `Total Bids Submitted: ${totalBidsSubmitted}`,
            `Bids Won: ${bidsWon}`,
            `Win Rate: ${winRate.toFixed(1)}%`,
            `Industry Benchmark: ${industryBenchmark}%`,
          ],
        },
        {
          title: 'Pipeline Metrics',
          items: [
            `Average Bid Value: ${fmtCurrency(avgBidValue)}`,
            `Total Pipeline: ${fmtCurrency(pipelineValue)}`,
            `Expected Win Value: ${fmtCurrency(expectedWinValue)}`,
            `Bids in Flight: ${totalBidsSubmitted - bidsWon}`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 5: BID/NO-BID DECISION TOOL
// ============================================================================

export function calculateBidNoBidDecisionTool(inputs: Record<string, any>): CalculationResult {
  const projectValue = n(inputs.projectValue);
  const paymentTerms = inputs.paymentTerms || 'net30';
  const gcReputation = inputs.gcReputation || 'neutral';
  const bonding = inputs.bonding || 'no';
  const geoDistance = n(inputs.geoDistance);
  const crewAvailability = n(inputs.crewAvailability);
  const projectType = inputs.projectType || 'commercial';
  const competitionLevel = inputs.competitionLevel || 'moderate';

  let score = 100;
  const factors: { name: string; impact: number }[] = [];

  // Payment terms scoring
  const paymentScores: Record<string, number> = { net30: 10, net45: 5, net60: 0, net90: -10, progress: 15, retainage: -15 };
  const paymentImpact = paymentScores[paymentTerms] || 0;
  score += paymentImpact;
  factors.push({ name: `Payment Terms (${paymentTerms})`, impact: paymentImpact });

  // GC Reputation
  const gcScores: Record<string, number> = { excellent: 15, good: 10, neutral: 0, poor: -20, unknown: -10 };
  const gcImpact = gcScores[gcReputation] || 0;
  score += gcImpact;
  factors.push({ name: `GC Reputation (${gcReputation})`, impact: gcImpact });

  // Bonding
  const bondingImpact = bonding === 'yes' ? -5 : 5;
  score += bondingImpact;
  factors.push({ name: `Bonding (${bonding})`, impact: bondingImpact });

  // Distance
  const distanceImpact = geoDistance <= 10 ? 10 : geoDistance <= 30 ? 5 : geoDistance <= 60 ? 0 : -10;
  score += distanceImpact;
  factors.push({ name: `Distance (${geoDistance} mi)`, impact: distanceImpact });

  // Crew Availability
  const crewImpact = crewAvailability >= 80 ? 10 : crewAvailability >= 60 ? 5 : -15;
  score += crewImpact;
  factors.push({ name: `Crew Availability (${crewAvailability}%)`, impact: crewImpact });

  // Competition
  const compScores: Record<string, number> = { low: 15, moderate: 5, high: -10 };
  const compImpact = compScores[competitionLevel] || 0;
  score += compImpact;
  factors.push({ name: `Competition (${competitionLevel})`, impact: compImpact });

  const finalScore = Math.max(0, Math.min(100, score));
  const recommendation = finalScore >= 70 ? 'BID' : finalScore >= 40 ? 'CONDITIONAL BID' : 'NO-BID';
  const riskLevel = finalScore >= 70 ? 'Low' : finalScore >= 40 ? 'Medium' : 'High';

  return {
    primaryMetrics: [
      {
        label: 'Decision Score',
        value: finalScore.toFixed(0) + '/100',
        subtext: recommendation,
      },
      {
        label: 'Recommendation',
        value: recommendation,
        subtext: finalScore >= 70 ? 'Strong opportunity' : finalScore >= 40 ? 'Negotiate terms first' : 'Pass on this project',
      },
      {
        label: 'Top Risk',
        value: paymentTerms === 'retainage' ? 'Cash Flow' : gcReputation === 'poor' ? 'Payment Risk' : crewAvailability < 70 ? 'Resource' : 'Competitive',
        subtext: 'Primary concern',
      },
      {
        label: 'Project Value',
        value: fmtCurrency(projectValue),
        subtext: `Strategic ${projectType} work`,
      },
    ],
    riskLevel,
    summary: recommendation === 'BID'
      ? `Strong bid opportunity. Score: ${finalScore.toFixed(0)}/100. Terms and crew available.`
      : recommendation === 'CONDITIONAL BID'
      ? `Moderate opportunity. Negotiate payment terms or crew before committing.`
      : `Recommend no-bid. Unfavorable factors outweigh project value.`,
    scoreBreakdown: [
      { label: 'Financial Terms', value: Math.max(0, Math.min(100, 50 + paymentImpact + gcImpact)) },
      { label: 'Resource Readiness', value: Math.max(0, Math.min(100, 50 + crewImpact + distanceImpact)) },
      { label: 'Market Competitiveness', value: Math.max(0, Math.min(100, 50 + compImpact)) },
    ],
    recommendations: [
      recommendation === 'BID' ? 'Submit bid with current pricing and terms' : 'Negotiate payment to net-30 or progress billing',
      gcReputation === 'poor' || gcReputation === 'unknown' ? 'Request references or require deposits' : 'GC reputation acceptable',
      bonding === 'yes' ? 'Verify bonding capacity before committing' : 'No bonding requirement—favorable',
      competitionLevel === 'high' ? 'Consider competitive pricing strategy' : 'Standard pricing appropriate',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Scoring Factors',
          items: factors.map(f => `${f.name}: ${f.impact > 0 ? '+' : ''}${f.impact}`),
        },
        {
          title: 'Key Considerations',
          items: [
            `Project Value: ${fmtCurrency(projectValue)}`,
            `Type: ${projectType}`,
            `Payment Terms: ${paymentTerms}`,
            `GC Track Record: ${gcReputation}`,
            `Crew Available: ${crewAvailability}%`,
            `Travel Distance: ${geoDistance} miles`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 6: PREQUALIFICATION SCORECARD
// ============================================================================

export function calculatePrequalificationScorecard(inputs: Record<string, any>): CalculationResult {
  const projectValue = n(inputs.projectValue);
  const clientType = inputs.clientType || 'corporation';
  const bonding = inputs.bonding || 'no';
  const safetyRequirements = inputs.safetyRequirements || 'standard';
  const scheduleWeeks = n(inputs.scheduleWeeks);
  const locationDistance = n(inputs.locationDistance);
  const tradeAlignment = inputs.tradeAlignment || 'good';

  let score = 100;
  const reasons: string[] = [];

  // Client type scoring
  const clientScores: Record<string, number> = { government: -5, developer: 10, corporation: 5, individual: 0, nonprofit: 0 };
  const clientScore = clientScores[clientType] || 0;
  score += clientScore;
  reasons.push(`Client Type (${clientType}): ${clientScore > 0 ? '+' : ''}${clientScore}`);

  // Bonding requirement
  const bondingScore = bonding === 'no' ? 10 : 0;
  score += bondingScore;
  reasons.push(`Bonding Req: ${bondingScore > 0 ? 'No ✓' : 'Yes ✓'}`);

  // Safety requirements
  const safetyScores: Record<string, number> = { standard: 10, enhanced: 5, specialized: -5, union: 0 };
  const safetyScore = safetyScores[safetyRequirements] || 0;
  score += safetyScore;
  reasons.push(`Safety Req (${safetyRequirements}): ${safetyScore > 0 ? '+' : ''}${safetyScore}`);

  // Schedule fit
  const scheduleScore = scheduleWeeks >= 4 && scheduleWeeks <= 16 ? 10 : scheduleWeeks < 4 ? -10 : 5;
  score += scheduleScore;
  reasons.push(`Schedule (${scheduleWeeks}w): ${scheduleScore > 0 ? '+' : ''}${scheduleScore}`);

  // Distance
  const distScore = locationDistance <= 15 ? 10 : locationDistance <= 30 ? 5 : locationDistance <= 60 ? 0 : -5;
  score += distScore;
  reasons.push(`Distance (${locationDistance}mi): ${distScore > 0 ? '+' : ''}${distScore}`);

  // Trade alignment
  const alignmentScores: Record<string, number> = { perfect: 15, good: 10, possible: 0, poor: -20 };
  const alignmentScore = alignmentScores[tradeAlignment] || 0;
  score += alignmentScore;
  reasons.push(`Trade Fit (${tradeAlignment}): ${alignmentScore > 0 ? '+' : ''}${alignmentScore}`);

  const finalScore = Math.max(0, Math.min(100, score));
  const fitGrade = finalScore >= 80 ? 'A - Go' : finalScore >= 60 ? 'B - Qualified' : finalScore >= 40 ? 'C - Conditional' : 'D - Pass';
  const riskLevel = finalScore >= 80 ? 'Low' : finalScore >= 60 ? 'Medium' : 'High';

  return {
    primaryMetrics: [
      {
        label: 'Fit Score',
        value: finalScore.toFixed(0) + '/100',
        subtext: fitGrade,
      },
      {
        label: 'Go/No-Go',
        value: finalScore >= 60 ? '✓ GO' : '✗ NO-GO',
        subtext: fitGrade,
      },
      {
        label: 'Biggest Risk',
        value: tradeAlignment === 'poor' ? 'Trade Fit' : scheduleWeeks < 4 ? 'Tight Schedule' : bonding === 'yes' ? 'Bonding' : 'Market Factors',
        subtext: 'Primary concern',
      },
      {
        label: 'Project Value',
        value: fmtCurrency(projectValue),
        subtext: `${safetyRequirements} safety req`,
      },
    ],
    riskLevel,
    summary: finalScore >= 60
      ? `Score ${finalScore.toFixed(0)}/100. Project is qualified for pursuit.`
      : `Score ${finalScore.toFixed(0)}/100. Project does not meet qualification criteria.`,
    scoreBreakdown: [
      { label: 'Strategic Fit', value: Math.max(0, Math.min(100, 50 + clientScore)) },
      { label: 'Operational Readiness', value: Math.max(0, Math.min(100, 50 + scheduleScore + distScore)) },
      { label: 'Capability Match', value: Math.max(0, Math.min(100, 50 + alignmentScore + safetyScore)) },
    ],
    recommendations: [
      finalScore >= 60 ? 'Proceed with prequalification submission' : 'Pass on this opportunity',
      tradeAlignment === 'poor' ? 'Do not bid—outside core capabilities' : 'Trade alignment is acceptable',
      scheduleWeeks < 4 ? 'Confirm crew availability for fast-track work' : 'Timeline is feasible',
      safetyRequirements !== 'standard' ? 'Verify training and certification status' : 'Standard OSHA compliance sufficient',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Qualification Summary',
          items: [
            `Fit Score: ${finalScore.toFixed(0)}/100 (${fitGrade})`,
            `Project Value: ${fmtCurrency(projectValue)}`,
            `Client Type: ${clientType}`,
            `Schedule: ${scheduleWeeks} weeks`,
          ],
        },
        {
          title: 'Scoring Details',
          items: reasons,
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 7: BONDING CAPACITY CALCULATOR
// ============================================================================

export function calculateBondingCapacityCalculator(inputs: Record<string, any>): CalculationResult {
  const workingCapital = n(inputs.workingCapital);
  const netWorth = n(inputs.netWorth);
  const annualRevenue = n(inputs.annualRevenue);
  const currentBacklog = n(inputs.currentBacklog);
  const largestProject = n(inputs.largestProject);
  const lineOfCredit = n(inputs.lineOfCredit);

  // Standard bonding formulas
  const workingCapitalCapacity = (workingCapital + lineOfCredit) * 6; // 6x working capital + credit
  const netWorthCapacity = netWorth * 3; // 3x net worth
  const revenueCapacity = annualRevenue * 1.5; // 1.5x revenue

  const bondsInUse = currentBacklog;
  const availableBonds = Math.min(workingCapitalCapacity, netWorthCapacity, revenueCapacity) - bondsInUse;
  const maxSingleProject = Math.min(largestProject * 1.5, availableBonds);
  const aggregateLimit = Math.min(workingCapitalCapacity, netWorthCapacity, revenueCapacity);

  const utilizationPercent = aggregateLimit > 0 ? (bondsInUse / aggregateLimit) * 100 : 0;
  const riskLevel = utilizationPercent >= 80 ? 'Critical' : utilizationPercent >= 60 ? 'High' : utilizationPercent >= 40 ? 'Medium' : 'Low';

  return {
    primaryMetrics: [
      {
        label: 'Available Bonding',
        value: fmtCurrency(Math.max(0, availableBonds)),
        subtext: `${utilizationPercent.toFixed(0)}% of capacity used`,
      },
      {
        label: 'Bonding Capacity',
        value: fmtCurrency(aggregateLimit),
        subtext: 'Total bonding limit',
      },
      {
        label: 'Max Single Project',
        value: fmtCurrency(maxSingleProject),
        subtext: `Current backlog: ${fmtCurrency(bondsInUse)}`,
      },
      {
        label: 'Headroom',
        value: availableBonds > 0 ? '✓ Available' : '✗ Limited',
        subtext: `${fmtCurrency(Math.max(0, availableBonds))} unused capacity`,
      },
    ],
    riskLevel,
    summary: availableBonds > annualRevenue * 0.5
      ? `Strong bonding position. ${fmtCurrency(availableBonds)} available for growth.`
      : `Bonding capacity constrained. Focus on backlog completion.`,
    scoreBreakdown: [
      { label: 'Working Capital Strength', value: Math.min(100, (workingCapital / (annualRevenue * 0.2)) * 100) },
      { label: 'Net Worth Health', value: Math.min(100, (netWorth / (annualRevenue * 0.5)) * 100) },
      { label: 'Capacity Utilization', value: Math.max(0, Math.min(100, 100 - utilizationPercent)) },
    ],
    recommendations: [
      utilizationPercent >= 70 ? 'Focus on current projects—limit new bonded work' : 'Bonding capacity available for growth',
      workingCapital < annualRevenue * 0.15 ? 'Improve working capital before expanding backlog' : 'Working capital is adequate',
      netWorth < annualRevenue * 0.3 ? 'Strengthen equity position to increase capacity' : 'Net worth supports growth',
      availableBonds < annualRevenue * 0.25 ? 'Consider surety bond facility increase' : 'Current bonding sufficient',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Bonding Capacity Analysis',
          items: [
            `Working Capital: ${fmtCurrency(workingCapital)} → ${fmtCurrency(workingCapitalCapacity)} capacity (6x)`,
            `Net Worth: ${fmtCurrency(netWorth)} → ${fmtCurrency(netWorthCapacity)} capacity (3x)`,
            `Annual Revenue: ${fmtCurrency(annualRevenue)} → ${fmtCurrency(revenueCapacity)} capacity (1.5x)`,
            `Limiting Factor: ${Math.min(workingCapitalCapacity, netWorthCapacity, revenueCapacity) === workingCapitalCapacity ? 'Working Capital' : 'Net Worth'}`,
          ],
        },
        {
          title: 'Current Utilization',
          items: [
            `Aggregate Limit: ${fmtCurrency(aggregateLimit)}`,
            `Bonds Outstanding: ${fmtCurrency(bondsInUse)}`,
            `Available Capacity: ${fmtCurrency(Math.max(0, availableBonds))}`,
            `Utilization Rate: ${utilizationPercent.toFixed(1)}%`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 8: INSURANCE GAP ANALYZER
// ============================================================================

export function calculateInsuranceGapAnalyzer(inputs: Record<string, any>): CalculationResult {
  const annualRevenue = n(inputs.annualRevenue);
  const employeeCount = n(inputs.employees);
  const glLimit = n(inputs.glLimit);
  const workerCompLimit = n(inputs.workerCompLimit);
  const autoLimit = n(inputs.autoLimit);
  const umbrellaLimit = n(inputs.umbrellaLimit);
  const professionalLiability = inputs.professionalLiability || 'none';
  const projectTypes = inputs.projectTypes || 'commercial';

  // Recommended minimums for construction
  const recGL = annualRevenue * 0.4;
  const recWC = annualRevenue * 0.3;
  const recAuto = annualRevenue * 0.2;
  const recUmbrella = annualRevenue * 0.5;

  let coverageScore = 0;
  const gaps: string[] = [];

  // GL Analysis
  const glGap = recGL - glLimit;
  const glScore = glLimit >= recGL ? 20 : glLimit >= recGL * 0.75 ? 15 : 10;
  coverageScore += glScore;
  if (glGap > 0) gaps.push(`GL: ${fmtCurrency(glGap)} underinsured`);

  // WC Analysis
  const wcGap = recWC - workerCompLimit;
  const wcScore = workerCompLimit >= recWC ? 20 : workerCompLimit >= recWC * 0.75 ? 15 : 10;
  coverageScore += wcScore;
  if (wcGap > 0) gaps.push(`WC: ${fmtCurrency(wcGap)} gap`);

  // Auto Analysis
  const autoGap = recAuto - autoLimit;
  const autoScore = autoLimit >= recAuto ? 20 : autoLimit >= recAuto * 0.75 ? 15 : 10;
  coverageScore += autoScore;
  if (autoGap > 0) gaps.push(`Auto: ${fmtCurrency(autoGap)} underinsured`);

  // Umbrella Analysis
  const umbrellaGap = recUmbrella - umbrellaLimit;
  const umbrellaScore = umbrellaLimit >= recUmbrella ? 20 : umbrellaLimit >= recUmbrella * 0.75 ? 15 : 5;
  coverageScore += umbrellaScore;
  if (umbrellaGap > 0) gaps.push(`Umbrella: ${fmtCurrency(umbrellaGap)} gap`);

  // Professional Liability
  const hasProLiab = professionalLiability !== 'none';
  const proLiabScore = hasProLiab ? 20 : projectTypes !== 'residential' ? 0 : 5;
  coverageScore += proLiabScore;
  if (!hasProLiab && projectTypes !== 'residential') gaps.push('Missing Professional Liability coverage');

  const normalizedScore = Math.min(100, (coverageScore / 100) * 100);
  const riskLevel = normalizedScore >= 90 ? 'Low' : normalizedScore >= 70 ? 'Medium' : normalizedScore >= 50 ? 'High' : 'Critical';

  return {
    primaryMetrics: [
      {
        label: 'Coverage Score',
        value: normalizedScore.toFixed(0) + '/100',
        subtext: gaps.length === 0 ? 'All adequate' : gaps.length + ' gaps identified',
      },
      {
        label: 'Gap Areas',
        value: gaps.length === 0 ? 'None' : gaps[0],
        subtext: gaps.length > 1 ? `+${gaps.length - 1} more` : 'Primary gap',
      },
      {
        label: 'Est. Underinsured Risk',
        value: fmtCurrency(glGap + wcGap + autoGap + umbrellaGap),
        subtext: 'Across all policies',
      },
      {
        label: 'Professional Liability',
        value: hasProLiab ? 'Covered' : 'Missing',
        subtext: professionalLiability || 'None',
      },
    ],
    riskLevel,
    summary: normalizedScore >= 85
      ? 'Insurance coverage is comprehensive and adequate.'
      : `${gaps.length} coverage gaps identified. Address underinsured areas.`,
    scoreBreakdown: [
      { label: 'GL Coverage', value: glScore * 5 },
      { label: 'Workers Comp', value: wcScore * 5 },
      { label: 'Commercial Auto', value: autoScore * 5 },
      { label: 'Umbrella/Excess', value: umbrellaScore * 5 },
    ],
    recommendations: [
      glGap > 0 ? `Increase GL to ${fmtCurrency(recGL)}` : 'GL coverage is adequate',
      wcGap > 0 ? `Increase WC to ${fmtCurrency(recWC)}` : 'WC coverage is adequate',
      autoGap > 0 ? `Increase auto coverage to ${fmtCurrency(recAuto)}` : 'Auto coverage is adequate',
      !hasProLiab && projectTypes !== 'residential' ? 'Add Professional Liability ($500k-$1M)' : 'Pro Liability coverage adequate',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Current Coverage',
          items: [
            `GL Limit: ${fmtCurrency(glLimit)} (Rec: ${fmtCurrency(recGL)})`,
            `WC Limit: ${fmtCurrency(workerCompLimit)} (Rec: ${fmtCurrency(recWC)})`,
            `Auto Limit: ${fmtCurrency(autoLimit)} (Rec: ${fmtCurrency(recAuto)})`,
            `Umbrella Limit: ${fmtCurrency(umbrellaLimit)} (Rec: ${fmtCurrency(recUmbrella)})`,
          ],
        },
        {
          title: 'Company Profile',
          items: [
            `Annual Revenue: ${fmtCurrency(annualRevenue)}`,
            `Employees: ${employeeCount}`,
            `Primary Project Type: ${projectTypes}`,
            `Workers Comp per Employee: ${fmtCurrency(employeeCount > 0 ? workerCompLimit / employeeCount : 0)}`,
          ],
        },
        {
          title: 'Coverage Assessment',
          items: gaps.length > 0 ? gaps : ['All insurance categories adequately covered for your business'],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 9: EMR SIMULATOR
// ============================================================================

export function calculateEMRSimulator(inputs: Record<string, any>): CalculationResult {
  const totalHours = n(inputs.totalHours);
  const lostTimeCases = n(inputs.lostTimeCases);
  const restrictedDuty = n(inputs.restrictedDuty);
  const medicalOnly = n(inputs.medicalOnly);
  const fatalities = n(inputs.fatalities);
  const dartCases = n(inputs.dartCases);

  // Calculate incident rates (per 200,000 hours)
  const totalIncidents = lostTimeCases + restrictedDuty + medicalOnly + fatalities;
  const tir = totalHours > 0 ? (totalIncidents / totalHours) * 200000 : 0;
  const dartRate = totalHours > 0 ? (dartCases / totalHours) * 200000 : 0;
  const dfrRate = totalHours > 0 ? ((lostTimeCases + restrictedDuty) / totalHours) * 200000 : 0;

  // EMR calculation (simplified)
  const baseEMR = 1.0;
  const severityFactor = fatalities > 0 ? 0.3 : lostTimeCases > 3 ? 0.15 : medicalOnly > 5 ? 0.05 : -0.1;
  const incidentAdjustment = Math.max(0.7, Math.min(1.5, 1.0 + severityFactor - (totalHours > 50000 ? 0.1 : 0)));
  const projectedEMR = baseEMR * incidentAdjustment;
  const premiumImpact = projectedEMR < 1.0 ? -10 : projectedEMR > 1.2 ? 25 : 5;

  const industryAvgTIR = 4.5;
  const industryAvgDFR = 2.1;
  const riskLevel = projectedEMR >= 1.3 ? 'Critical' : projectedEMR >= 1.1 ? 'High' : projectedEMR >= 0.9 ? 'Medium' : 'Low';

  return {
    primaryMetrics: [
      {
        label: 'Projected EMR',
        value: projectedEMR.toFixed(2),
        subtext: projectedEMR < 1.0 ? 'Discount eligible' : projectedEMR > 1.1 ? 'Surcharge risk' : 'Standard rate',
      },
      {
        label: 'DART Rate',
        value: dartRate.toFixed(2),
        subtext: `${dartCases} DART cases total`,
      },
      {
        label: 'Total Incident Rate',
        value: tir.toFixed(2),
        subtext: `vs ${industryAvgTIR} industry avg`,
      },
      {
        label: 'Premium Impact',
        value: premiumImpact >= 0 ? `+${premiumImpact}%` : `${premiumImpact}%`,
        subtext: `${fmtCurrency((premiumImpact / 100) * 200000)} on $200k premium`,
      },
    ],
    riskLevel,
    summary: projectedEMR < 1.0
      ? `EMR of ${projectedEMR.toFixed(2)} qualifies for premium discount.`
      : projectedEMR > 1.1
      ? `EMR of ${projectedEMR.toFixed(2)} will result in surcharge.`
      : `EMR of ${projectedEMR.toFixed(2)} is at standard rate.`,
    scoreBreakdown: [
      { label: 'Safety Performance', value: Math.max(0, Math.min(100, 100 - (tir * 10))) },
      { label: 'Lost Time Control', value: Math.max(0, Math.min(100, 100 - (lostTimeCases * 15))) },
      { label: 'DART Management', value: Math.max(0, Math.min(100, 100 - (dartCases * 5))) },
    ],
    recommendations: [
      projectedEMR < 1.0 ? 'Maintain current safety practices to preserve discount' : 'Implement enhanced safety program',
      lostTimeCases > 2 ? 'Investigate root causes of lost time incidents' : 'Lost time control is strong',
      tir > industryAvgTIR ? 'Benchmark against similar contractors' : 'Safety performance is above average',
      fatalities > 0 ? 'Emergency: Conduct immediate safety audit' : 'Continue proactive safety management',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'EMR Analysis',
          items: [
            `Base EMR: ${baseEMR.toFixed(2)}`,
            `Incident Adjustment: ${incidentAdjustment.toFixed(2)}`,
            `Projected EMR: ${projectedEMR.toFixed(2)}`,
            `Premium Impact: ${premiumImpact > 0 ? '+' : ''}${premiumImpact}%`,
          ],
        },
        {
          title: 'Incident Rates',
          items: [
            `Total Hours: ${totalHours.toLocaleString()}`,
            `TIR (Total): ${tir.toFixed(2)} (Industry: ${industryAvgTIR})`,
            `DFR (Disabling): ${dfrRate.toFixed(2)} (Industry: ${industryAvgDFR})`,
            `DART Cases: ${dartCases} (Lost Time: ${lostTimeCases}, Restricted: ${restrictedDuty})`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 10: SAFETY MATURITY ASSESSOR
// ============================================================================

export function calculateSafetyMaturityAssessor(inputs: Record<string, any>): CalculationResult {
  const writtenSafetyPlan = inputs.writtenSafetyPlan === 'yes';
  const incidentFrequencyRate = n(inputs.incidentFrequencyRate);
  const trainingHours = n(inputs.trainingHours);
  const nearMissReporting = inputs.nearMissReporting || 'none';
  const safetyBudget = n(inputs.safetyBudget);
  const mgmtInvolvement = inputs.mgmtInvolvement || 'minimal';

  // Maturity scoring
  let maturityScore = 0;
  maturityScore += writtenSafetyPlan ? 20 : 5;
  maturityScore += trainingHours >= 16 ? 20 : trainingHours >= 8 ? 10 : 0;
  maturityScore += nearMissReporting === 'incentivized' ? 20 : nearMissReporting === 'formal' ? 15 : nearMissReporting === 'informal' ? 5 : 0;
  maturityScore += safetyBudget >= 2.5 ? 20 : safetyBudget >= 1.5 ? 10 : 0;
  maturityScore += mgmtInvolvement === 'exceptional' ? 20 : mgmtInvolvement === 'strong' ? 15 : mgmtInvolvement === 'moderate' ? 10 : 0;

  const normalizedScore = Math.min(100, maturityScore);
  const maturityLevel = normalizedScore >= 85 ? 'Mature' : normalizedScore >= 70 ? 'Developing' : normalizedScore >= 50 ? 'Basic' : 'Reactive';
  const industryPercentile = Math.round((normalizedScore / 100) * 100);
  const riskLevel = normalizedScore >= 80 ? 'Low' : normalizedScore >= 60 ? 'Medium' : 'High';

  return {
    primaryMetrics: [
      {
        label: 'Maturity Level',
        value: maturityLevel,
        subtext: `Score: ${normalizedScore.toFixed(0)}/100`,
      },
      {
        label: 'Industry Percentile',
        value: `${industryPercentile}th`,
        subtext: writtenSafetyPlan ? 'Formal program in place' : 'Ad-hoc approach',
      },
      {
        label: 'Strongest Area',
        value: trainingHours >= 16 ? 'Training' : nearMissReporting === 'incentivized' ? 'Reporting Culture' : mgmtInvolvement === 'exceptional' ? 'Leadership' : 'Plan Documentation',
        subtext: 'Where you excel',
      },
      {
        label: 'Key Gap',
        value: !writtenSafetyPlan ? 'No Formal Plan' : trainingHours < 8 ? 'Training Hours' : mgmtInvolvement === 'minimal' ? 'Management' : 'Budget',
        subtext: 'Primary opportunity',
      },
    ],
    riskLevel,
    summary: maturityLevel === 'Mature'
      ? `Safety program is mature and proactive. Score: ${normalizedScore.toFixed(0)}/100.`
      : `Safety maturity at ${maturityLevel} level. Focus on ${!writtenSafetyPlan ? 'formalizing program' : 'engagement and training'}.`,
    scoreBreakdown: [
      { label: 'Program Formality', value: writtenSafetyPlan ? 100 : 30 },
      { label: 'Training Investment', value: Math.min(100, (trainingHours / 20) * 100) },
      { label: 'Near-Miss Culture', value: nearMissReporting === 'incentivized' ? 100 : nearMissReporting === 'formal' ? 75 : nearMissReporting === 'informal' ? 40 : 0 },
      { label: 'Management Engagement', value: mgmtInvolvement === 'exceptional' ? 100 : mgmtInvolvement === 'strong' ? 80 : mgmtInvolvement === 'moderate' ? 60 : 20 },
    ],
    recommendations: [
      !writtenSafetyPlan ? 'Develop formal written safety plan (OSHA requirement)' : 'Safety plan established and documented',
      trainingHours < 16 ? 'Increase training to 16+ hours/year per employee' : 'Training program is robust',
      nearMissReporting === 'none' ? 'Implement formal near-miss reporting system' : 'Near-miss reporting is active',
      mgmtInvolvement === 'minimal' ? 'Establish monthly job site safety audits by leadership' : 'Management engagement is strong',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Maturity Assessment',
          items: [
            `Level: ${maturityLevel}`,
            `Score: ${normalizedScore.toFixed(0)}/100`,
            `Industry Percentile: ${industryPercentile}th`,
            `Incident Frequency Rate: ${incidentFrequencyRate.toFixed(1)} per 200k hours`,
          ],
        },
        {
          title: 'Program Components',
          items: [
            `Written Safety Plan: ${writtenSafetyPlan ? 'Yes ✓' : 'No ✗'}`,
            `Training Hours/Year: ${trainingHours} (Target: 16+)`,
            `Near-Miss Reporting: ${nearMissReporting}`,
            `Safety Budget: ${safetyBudget.toFixed(1)}% of revenue (Target: 2-3%)`,
            `Management Involvement: ${mgmtInvolvement}`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 11: TOOLBOX TALK GENERATOR
// ============================================================================

export function calculateToolboxTalkGenerator(inputs: Record<string, any>): CalculationResult {
  const tradeType = inputs.tradeType || 'electrical';
  const hazardType = inputs.hazardType || 'fall';
  const season = inputs.season || 'spring';
  const jobSiteType = inputs.jobSiteType || 'commercial';
  const crewSize = n(inputs.crewSize);

  // Generate context-specific content
  const talkTopics: Record<string, string> = {
    fall: 'Fall protection requirements and harness inspection',
    electrical: 'Electrical hazards, lockout/tagout, and grounding',
    loto: 'Safe shutdown and lockout procedures',
    excavation: 'Trench safety, shoring, and access protection',
    'fall-equip': 'Inspection of fall arrest equipment',
    housekeeping: 'Site debris management and trip hazards',
    fatigue: 'Fatigue recognition and safety breaks',
    weather: 'Seasonal weather hazards and adaptations',
  };

  const topic = talkTopics[hazardType] || 'General Safety';
  const durationMin = crewSize <= 5 ? 10 : crewSize <= 15 ? 15 : 20;

  return {
    primaryMetrics: [
      {
        label: 'Talk Topic',
        value: topic.split(' ')[0],
        subtext: topic,
      },
      {
        label: 'Crew Size',
        value: `${crewSize}`,
        subtext: 'Participants',
      },
      {
        label: 'Duration',
        value: `${durationMin} min`,
        subtext: 'Recommended time',
      },
      {
        label: 'Relevance',
        value: '✓ High',
        subtext: `${tradeType} + ${season}`,
      },
    ],
    riskLevel: 'Medium',
    summary: `${durationMin}-minute toolbox talk on ${topic} customized for ${crewSize}-person ${tradeType} crew.`,
    scoreBreakdown: [
      { label: 'Hazard Relevance', value: 85 },
      { label: 'Crew Engagement Level', value: crewSize <= 8 ? 90 : crewSize <= 15 ? 75 : 60 },
      { label: 'Seasonal Applicability', value: 80 },
    ],
    recommendations: [
      'Schedule talk before crew starts critical work phase',
      'Include equipment inspection if applicable',
      'Document attendance for compliance',
      crewSize > 15 ? 'Consider splitting into two groups' : 'Group size is optimal for engagement',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Talk Details',
          items: [
            `Topic: ${topic}`,
            `Trade: ${tradeType}`,
            `Site Type: ${jobSiteType}`,
            `Season: ${season}`,
            `Duration: ${durationMin} minutes`,
          ],
        },
        {
          title: 'Key Discussion Points',
          items: [
            `Equipment needs and inspection procedures`,
            `Common mistakes and how to avoid them`,
            `Seasonal considerations for ${season}`,
            `Legal requirements and standards`,
            `Question and answer period`,
          ],
        },
        {
          title: 'Implementation Tips',
          items: [
            `Hold at start of shift or work phase`,
            `Make it interactive—encourage questions`,
            `Use real examples from your jobsites`,
            `Document attendance and dates`,
            `Tailor to your crew's experience level`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 12: REVENUE CONCENTRATION ANALYZER
// ============================================================================

export function calculateRevenueConcentrationAnalyzer(inputs: Record<string, any>): CalculationResult {
  const totalRevenue = n(inputs.totalRevenue);
  const topClientRevenue = n(inputs.topClientRevenue);
  const secondClientRevenue = n(inputs.secondClientRevenue);
  const thirdClientRevenue = n(inputs.thirdClientRevenue);
  const primaryMarketPercent = n(inputs.primaryMarketPercent);
  const geoConcentration = inputs.geoConcentration || 'region';

  // Calculate metrics
  const top3Total = topClientRevenue + secondClientRevenue + thirdClientRevenue;
  const top3Percent = totalRevenue > 0 ? (top3Total / totalRevenue) * 100 : 0;
  const topClientPercent = totalRevenue > 0 ? (topClientRevenue / totalRevenue) * 100 : 0;

  // Herfindahl-Hirschman Index (simplified)
  const hhi = (topClientPercent ** 2 + ((top3Total - topClientRevenue) / totalRevenue * 100) ** 2 + ((totalRevenue - top3Total) / totalRevenue * 100) ** 2) / 10000;

  const riskLevel = hhi >= 0.25 || primaryMarketPercent >= 70 ? 'Critical' : hhi >= 0.18 || primaryMarketPercent >= 60 ? 'High' : hhi >= 0.10 ? 'Medium' : 'Low';
  const riskSummary = top3Percent >= 50 ? 'Highly concentrated' : top3Percent >= 40 ? 'Moderately concentrated' : 'Well diversified';

  return {
    primaryMetrics: [
      {
        label: 'Concentration Risk',
        value: riskSummary,
        subtext: `Top 3: ${top3Percent.toFixed(1)}% of revenue`,
      },
      {
        label: 'Top Client %',
        value: topClientPercent.toFixed(1) + '%',
        subtext: fmtCurrency(topClientRevenue),
      },
      {
        label: 'Geographic Risk',
        value: primaryMarketPercent.toFixed(0) + '%',
        subtext: `in ${geoConcentration} market`,
      },
      {
        label: 'Diversification',
        value: (100 - top3Percent).toFixed(0) + '%',
        subtext: `from other clients`,
      },
    ],
    riskLevel,
    summary: top3Percent >= 50
      ? `High concentration: top 3 clients = ${top3Percent.toFixed(1)}% of revenue. Diversification critical.`
      : `Healthy mix: top 3 clients = ${top3Percent.toFixed(1)}% of revenue.`,
    scoreBreakdown: [
      { label: 'Customer Diversification', value: Math.max(0, Math.min(100, 100 - (top3Percent / 2))) },
      { label: 'Geographic Diversification', value: 100 - primaryMarketPercent },
      { label: 'Concentration Index', value: Math.max(0, Math.min(100, 100 - (hhi * 400))) },
    ],
    recommendations: [
      top3Percent > 50 ? 'Target 5+ key clients to reach 40% concentration' : 'Current customer base is well balanced',
      topClientPercent > 30 ? 'Develop exit plan if largest client relationship ends' : 'No single client dependency risk',
      primaryMarketPercent > 70 ? 'Expand geographically to reduce market risk' : 'Geographic diversification is healthy',
      geoConcentration === 'single' ? 'Develop presence in adjacent markets' : 'Multi-market presence provides stability',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Revenue Concentration',
          items: [
            `Total Revenue: ${fmtCurrency(totalRevenue)}`,
            `Top Client: ${fmtCurrency(topClientRevenue)} (${topClientPercent.toFixed(1)}%)`,
            `Second: ${fmtCurrency(secondClientRevenue)} (${((secondClientRevenue / totalRevenue) * 100).toFixed(1)}%)`,
            `Third: ${fmtCurrency(thirdClientRevenue)} (${((thirdClientRevenue / totalRevenue) * 100).toFixed(1)}%)`,
            `Top 3 Total: ${fmtCurrency(top3Total)} (${top3Percent.toFixed(1)}%)`,
          ],
        },
        {
          title: 'Geographic Exposure',
          items: [
            `Primary Market: ${primaryMarketPercent.toFixed(0)}%`,
            `Concentration Level: ${geoConcentration}`,
            `Risk Assessment: ${riskLevel}`,
            `Other Markets: ${(100 - primaryMarketPercent).toFixed(0)}%`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 13: GROWTH READINESS ASSESSOR
// ============================================================================

export function calculateGrowthReadinessAssessor(inputs: Record<string, any>): CalculationResult {
  const currentRevenue = n(inputs.currentRevenue);
  const revenueGrowthRate = n(inputs.revenueGrowthRate);
  const backlogMonths = n(inputs.backlogMonths);
  const keyEmployees = n(inputs.keyEmployees);
  const systemsMaturity = inputs.systemsMaturity || 'basic';
  const capitalAccess = inputs.capitalAccess || 'limited';

  // Readiness scoring
  let score = 50;
  score += revenueGrowthRate >= 15 ? 15 : revenueGrowthRate >= 10 ? 10 : 0;
  score += backlogMonths >= 3 ? 15 : backlogMonths >= 1.5 ? 10 : 0;
  score += keyEmployees >= 5 ? 15 : keyEmployees >= 3 ? 10 : 0;
  score += systemsMaturity === 'optimized' ? 15 : systemsMaturity === 'structured' ? 10 : systemsMaturity === 'basic' ? 5 : 0;
  score += capitalAccess === 'strong' ? 15 : capitalAccess === 'moderate' ? 10 : capitalAccess === 'limited' ? 5 : 0;

  const normalizedScore = Math.max(0, Math.min(100, score));
  const readinesLevel = normalizedScore >= 85 ? 'Highly Ready' : normalizedScore >= 70 ? 'Ready' : normalizedScore >= 50 ? 'Developing' : 'Not Ready';
  const riskLevel = normalizedScore >= 75 ? 'Low' : normalizedScore >= 60 ? 'Medium' : 'High';

  const projectedRevenue = currentRevenue * (1 + (revenueGrowthRate / 100)) * (backlogMonths >= 3 ? 1.2 : 1.0);

  return {
    primaryMetrics: [
      {
        label: 'Readiness Score',
        value: normalizedScore.toFixed(0) + '/100',
        subtext: readinesLevel,
      },
      {
        label: 'Growth Potential',
        value: `${revenueGrowthRate.toFixed(0)}% YoY`,
        subtext: `${fmtCurrency(currentRevenue)} → ${fmtCurrency(projectedRevenue)}`,
      },
      {
        label: 'Backlog Strength',
        value: `${backlogMonths.toFixed(1)} months`,
        subtext: backlogMonths >= 3 ? 'Strong foundation' : 'Needs growth',
      },
      {
        label: 'Key Bottleneck',
        value: systemsMaturity === 'ad-hoc' ? 'Systems' : capitalAccess === 'none' ? 'Capital' : keyEmployees < 3 ? 'Talent' : 'Operations',
        subtext: 'Primary constraint',
      },
    ],
    riskLevel,
    summary: normalizedScore >= 75
      ? `Strong growth readiness. Can support ${revenueGrowthRate.toFixed(0)}% growth with current infrastructure.`
      : `Growth capacity limited. Address ${systemsMaturity === 'ad-hoc' ? 'systems' : 'capital'} before scaling.`,
    scoreBreakdown: [
      { label: 'Revenue Momentum', value: Math.min(100, (revenueGrowthRate / 25) * 100) },
      { label: 'Backlog Coverage', value: Math.min(100, (backlogMonths / 4) * 100) },
      { label: 'Talent Bench Strength', value: Math.min(100, (keyEmployees / 8) * 100) },
      { label: 'Systems Maturity', value: systemsMaturity === 'optimized' ? 100 : systemsMaturity === 'structured' ? 75 : systemsMaturity === 'basic' ? 50 : 25 },
    ],
    recommendations: [
      normalizedScore < 60 ? 'Hold growth plans until readiness improves' : `Pursue growth—target ${(projectedRevenue * 1.3).toLocaleString()} in 18 months`,
      systemsMaturity === 'ad-hoc' ? 'Implement documented processes (PM, accounting, HR)' : 'Systems foundation is adequate',
      capitalAccess === 'none' ? 'Establish credit line before scaling' : 'Capital access supports growth',
      keyEmployees < 3 ? 'Recruit/develop operational leaders' : 'Key staff is in place',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Growth Readiness Assessment',
          items: [
            `Current Revenue: ${fmtCurrency(currentRevenue)}`,
            `Growth Rate: ${revenueGrowthRate.toFixed(1)}% YoY`,
            `Projected Year 1 Revenue: ${fmtCurrency(projectedRevenue)}`,
            `Readiness Level: ${readinesLevel}`,
          ],
        },
        {
          title: 'Key Factors',
          items: [
            `Backlog: ${backlogMonths.toFixed(1)} months (Target: 3+)`,
            `Key Leaders: ${keyEmployees} in place`,
            `Systems Maturity: ${systemsMaturity}`,
            `Capital Access: ${capitalAccess}`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 14: TECH STACK GRADER
// ============================================================================

export function calculateTechStackGrader(inputs: Record<string, any>): CalculationResult {
  const projectManagement = inputs.projectManagement === 'yes';
  const estimatingTool = inputs.estimatingTool === 'yes';
  const timeTracking = inputs.timeTracking === 'yes';
  const accountingSoftware = inputs.accountingSoftware === 'yes';
  const fieldReporting = inputs.fieldReporting === 'yes';
  const integrationLevel = inputs.integrationLevel || 'standalone';

  // Grading
  let toolsCount = 0;
  if (projectManagement) toolsCount++;
  if (estimatingTool) toolsCount++;
  if (timeTracking) toolsCount++;
  if (accountingSoftware) toolsCount++;
  if (fieldReporting) toolsCount++;

  const coverageScore = (toolsCount / 5) * 100;

  const integrationScores: Record<string, number> = { standalone: 20, manual: 40, integrated: 70, automated: 100 };
  const integrationScore = integrationScores[integrationLevel] || 0;

  const maturityScore = (coverageScore + integrationScore) / 2;
  const grade = maturityScore >= 90 ? 'A' : maturityScore >= 80 ? 'B' : maturityScore >= 70 ? 'C' : maturityScore >= 60 ? 'D' : 'F';
  const riskLevel = grade === 'A' || grade === 'B' ? 'Low' : grade === 'C' ? 'Medium' : 'High';

  return {
    primaryMetrics: [
      {
        label: 'Tech Maturity Grade',
        value: grade,
        subtext: `Score: ${maturityScore.toFixed(0)}/100`,
      },
      {
        label: 'Tools Coverage',
        value: `${toolsCount}/5`,
        subtext: `${coverageScore.toFixed(0)}% adoption`,
      },
      {
        label: 'Integration Level',
        value: integrationLevel.charAt(0).toUpperCase() + integrationLevel.slice(1),
        subtext: `${integrationScore.toFixed(0)}/100`,
      },
      {
        label: 'Biggest Gap',
        value: !projectManagement ? 'Project Mgmt' : !fieldReporting ? 'Field Tools' : !estimatingTool ? 'Estimating' : 'Integration',
        subtext: 'Highest priority',
      },
    ],
    riskLevel,
    summary: grade >= 'B'
      ? `Tech stack is mature. Grade: ${grade}. Focus on integration.`
      : `Tech stack is fragmented. Grade: ${grade}. Consolidation needed.`,
    scoreBreakdown: [
      { label: 'Tool Coverage', value: coverageScore },
      { label: 'Integration Maturity', value: integrationScore },
      { label: 'Operational Efficiency', value: Math.max(0, Math.min(100, (toolsCount * 20) - (integrationLevel === 'standalone' ? 30 : 0))) },
    ],
    recommendations: [
      !projectManagement ? 'Implement project management software (Procore, Touchplan)' : 'Project management tool in use',
      !fieldReporting ? 'Add mobile field reporting app' : 'Field reporting active',
      integrationLevel === 'standalone' ? 'Integrate tools via API or middleware' : 'Tools are integrated',
      grade < 'B' ? `Upgrade to integrated platform (Procore, Viewpoint)` : `Maintain current stack maturity`,
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Tool Adoption Status',
          items: [
            `Project Management: ${projectManagement ? '✓ Yes' : '✗ No'}`,
            `Estimating Tool: ${estimatingTool ? '✓ Yes' : '✗ No'}`,
            `Time Tracking: ${timeTracking ? '✓ Yes' : '✗ No'}`,
            `Accounting Software: ${accountingSoftware ? '✓ Yes' : '✗ No'}`,
            `Field Reporting: ${fieldReporting ? '✓ Yes' : '✗ No'}`,
          ],
        },
        {
          title: 'Integration Assessment',
          items: [
            `Coverage Score: ${coverageScore.toFixed(0)}/100`,
            `Integration: ${integrationLevel}`,
            `Overall Grade: ${grade}`,
            `Maturity Level: ${grade >= 'A' ? 'Excellent' : grade >= 'C' ? 'Adequate' : 'Needs Work'}`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 15: CHANGE ORDER TREND TRACKER
// ============================================================================

export function calculateChangeOrderTrendTracker(inputs: Record<string, any>): CalculationResult {
  const totalContractValue = n(inputs.totalContractValue);
  const totalChangeOrders = n(inputs.totalChangeOrders);
  const approvedCOs = n(inputs.approvedCOs);
  const deniedCOs = n(inputs.deniedCOs);
  const avgProcessingDays = n(inputs.avgProcessingDays);
  const primaryCOReason = inputs.primaryCOReason || 'scope';

  const coPercent = totalContractValue > 0 ? (totalChangeOrders / totalContractValue) * 100 : 0;
  const approvalRate = totalChangeOrders > 0 ? (approvedCOs / totalChangeOrders) * 100 : 0;
  const denialRate = totalChangeOrders > 0 ? (deniedCOs / totalChangeOrders) * 100 : 0;

  const riskLevel = coPercent >= 15 ? 'High' : coPercent >= 10 ? 'Medium' : 'Low';
  const efficiency = avgProcessingDays <= 5 ? 100 : avgProcessingDays <= 10 ? 75 : avgProcessingDays <= 15 ? 50 : 25;

  return {
    primaryMetrics: [
      {
        label: 'CO as % of Contract',
        value: coPercent.toFixed(1) + '%',
        subtext: `${fmtCurrency(totalChangeOrders)} of ${fmtCurrency(totalContractValue)}`,
      },
      {
        label: 'Approval Rate',
        value: approvalRate.toFixed(0) + '%',
        subtext: `${fmtCurrency(approvedCOs)} approved`,
      },
      {
        label: 'Processing Time',
        value: avgProcessingDays.toFixed(0) + ' days',
        subtext: `Avg turnaround`,
      },
      {
        label: 'Primary Reason',
        value: primaryCOReason === 'scope' ? 'Scope Clarification' : primaryCOReason === 'owner' ? 'Owner Requests' : 'Site Conditions',
        subtext: 'Root cause',
      },
    ],
    riskLevel,
    summary: coPercent < 10
      ? `Change orders are well controlled at ${coPercent.toFixed(1)}% of contract.`
      : `Change orders at ${coPercent.toFixed(1)}% signal scope creep. Improve scoping.`,
    scoreBreakdown: [
      { label: 'CO Control (% of Contract)', value: Math.max(0, Math.min(100, 100 - (coPercent * 5))) },
      { label: 'Approval Efficiency', value: Math.min(100, approvalRate) },
      { label: 'Processing Speed', value: efficiency },
      { label: 'Denial Rate Health', value: denialRate >= 10 ? 75 : 100 },
    ],
    recommendations: [
      coPercent > 10 ? 'Improve scope definition and owner communication at bidding' : 'Scope control is strong',
      avgProcessingDays > 10 ? 'Streamline CO approval process—target 5 days' : 'CO processing is efficient',
      approvalRate < 80 ? 'Review denied COs to identify scope vs. cost issues' : 'Approval rate is healthy',
      primaryCOReason === 'scope' ? 'Focus on better initial scoping and specifications' : 'Continue current practices',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Change Order Analysis',
          items: [
            `Total Contract Value: ${fmtCurrency(totalContractValue)}`,
            `Total Change Orders: ${fmtCurrency(totalChangeOrders)}`,
            `CO as % of Contract: ${coPercent.toFixed(1)}%`,
            `Approved: ${fmtCurrency(approvedCOs)} (${approvalRate.toFixed(0)}%)`,
            `Denied: ${fmtCurrency(deniedCOs)} (${denialRate.toFixed(0)}%)`,
          ],
        },
        {
          title: 'Process Metrics',
          items: [
            `Average Processing Time: ${avgProcessingDays.toFixed(0)} days`,
            `Primary Reason: ${primaryCOReason}`,
            `Industry Benchmark: <5% of contract`,
            `Your Status: ${coPercent <= 5 ? 'Excellent' : coPercent <= 10 ? 'Good' : 'Needs Improvement'}`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL 16: CREW UTILIZATION OPTIMIZER
// ============================================================================

export function calculateCrewUtilizationOptimizer(inputs: Record<string, any>): CalculationResult {
  const totalCrewHours = n(inputs.totalCrewHours);
  const billableHours = n(inputs.billableHours);
  const travelHours = n(inputs.travelHours);
  const idleHours = n(inputs.idleHours);
  const reworkHours = n(inputs.reworkHours);
  const trainingHours = n(inputs.trainingHours);

  const utilizationRate = totalCrewHours > 0 ? (billableHours / totalCrewHours) * 100 : 0;
  const nonBillable = totalCrewHours - billableHours;
  const idleCost = idleHours * 50; // Assume $50/hr loaded cost
  const reworkCost = reworkHours * 50;

  const riskLevel = utilizationRate >= 75 ? 'Low' : utilizationRate >= 60 ? 'Medium' : 'High';
  const industryBenchmark = 75;

  return {
    primaryMetrics: [
      {
        label: 'Utilization Rate',
        value: utilizationRate.toFixed(1) + '%',
        subtext: utilizationRate >= industryBenchmark ? 'Above benchmark' : 'Below 75% target',
      },
      {
        label: 'Cost of Idle Time',
        value: fmtCurrency(idleCost),
        subtext: `${idleHours.toFixed(0)} hours`,
      },
      {
        label: 'Rework Impact',
        value: fmtCurrency(reworkCost),
        subtext: `${reworkHours.toFixed(0)} hours`,
      },
      {
        label: 'Billable Hours',
        value: billableHours.toFixed(0),
        subtext: `of ${totalCrewHours.toFixed(0)} total`,
      },
    ],
    riskLevel,
    summary: utilizationRate >= 75
      ? `Crew utilization is strong at ${utilizationRate.toFixed(1)}%.`
      : `Utilization is ${(industryBenchmark - utilizationRate).toFixed(1)}% below benchmark. Address scheduling.`,
    scoreBreakdown: [
      { label: 'Billable Utilization', value: utilizationRate },
      { label: 'Idle Time Control', value: Math.max(0, Math.min(100, 100 - (idleHours / (totalCrewHours * 0.15)) * 100)) },
      { label: 'Quality (Rework)', value: Math.max(0, Math.min(100, 100 - (reworkHours / (totalCrewHours * 0.1)) * 100)) },
    ],
    recommendations: [
      utilizationRate < 70 ? `Improve scheduling to reach 75%—${fmtCurrency(idleCost)} at stake` : 'Utilization is strong',
      idleHours > totalCrewHours * 0.1 ? 'Reduce idle time through better job sequencing' : 'Idle time is controlled',
      reworkHours > totalCrewHours * 0.05 ? 'Address quality issues causing rework' : 'Quality is strong',
      travelHours > totalCrewHours * 0.2 ? 'Consolidate job sites to reduce travel time' : 'Travel time is managed',
    ],
    detailedAnalysis: {
      sections: [
        {
          title: 'Utilization Breakdown',
          items: [
            `Total Crew Hours: ${totalCrewHours.toFixed(0)}`,
            `Billable Hours: ${billableHours.toFixed(0)} (${utilizationRate.toFixed(1)}%)`,
            `Non-Billable: ${nonBillable.toFixed(0)} (${((nonBillable / totalCrewHours) * 100).toFixed(1)}%)`,
            `Industry Benchmark: 75%`,
          ],
        },
        {
          title: 'Cost Impact Analysis',
          items: [
            `Travel Hours: ${travelHours.toFixed(0)} hours`,
            `Idle/Waiting Hours: ${idleHours.toFixed(0)} hours (${fmtCurrency(idleCost)})`,
            `Rework Hours: ${reworkHours.toFixed(0)} hours (${fmtCurrency(reworkCost)})`,
            `Training Hours: ${trainingHours.toFixed(0)} hours`,
            `Total Non-Billable Cost: ${fmtCurrency((nonBillable) * 50)}`,
          ],
        },
      ],
    },
  };
}

// ============================================================================
// TOOL DISPATCHER
// ============================================================================

export function calculateTool(toolSlug: string, inputs: Record<string, any>): CalculationResult {
  switch (toolSlug) {
    case 'cash-flow-gap-analyzer':
      return calculateCashFlowGapAnalyzer(inputs);
    case 'margin-erosion-monitor':
      return calculateMarginErosionMonitor(inputs);
    case 'overhead-benchmarker':
      return calculateOverheadBenchmarker(inputs);
    case 'win-rate-tracker':
      return calculateWinRateTracker(inputs);
    case 'bid-no-bid-decision-tool':
      return calculateBidNoBidDecisionTool(inputs);
    case 'prequalification-scorecard':
      return calculatePrequalificationScorecard(inputs);
    case 'bonding-capacity-calculator':
      return calculateBondingCapacityCalculator(inputs);
    case 'insurance-gap-analyzer':
      return calculateInsuranceGapAnalyzer(inputs);
    case 'emr-simulator':
      return calculateEMRSimulator(inputs);
    case 'safety-maturity-assessor':
      return calculateSafetyMaturityAssessor(inputs);
    case 'toolbox-talk-generator':
      return calculateToolboxTalkGenerator(inputs);
    case 'revenue-concentration-analyzer':
      return calculateRevenueConcentrationAnalyzer(inputs);
    case 'growth-readiness-assessor':
      return calculateGrowthReadinessAssessor(inputs);
    case 'tech-stack-grader':
      return calculateTechStackGrader(inputs);
    case 'change-order-trend-tracker':
      return calculateChangeOrderTrendTracker(inputs);
    case 'crew-utilization-optimizer':
      return calculateCrewUtilizationOptimizer(inputs);
    default:
      throw new Error(`Unknown tool: ${toolSlug}`);
  }
}
