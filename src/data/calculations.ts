/**
 * Calculation Engine for Trade Partner HQ
 * Pure functions for all 16 business intelligence tools
 * No side effects, no API calls
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
// TOOL 1: CASH FLOW GAP ANALYZER
// ============================================================================

export function calculateCashFlowGapAnalyzer(inputs: Record<string, any>): Record<string, any> {
  const currentCash = n(inputs.currentCashPosition);
  const monthlyRevenue = n(inputs.monthlyRevenue);
  const monthlyExpenses = n(inputs.monthlyExpenses);
  const upcomingPayables = n(inputs.upcomingPayables);
  const retainageHeld = n(inputs.retainageHeld);

  const monthlyBurn = monthlyExpenses - monthlyRevenue;
  const weeklyBurnRate = monthlyBurn / 4.33;
  const projectedGap = monthlyBurn * 3 - currentCash;
  const daysToShortfall = currentCash > 0 ? Math.ceil((currentCash / Math.max(weeklyBurnRate, 1)) * 7) : 0;
  const retainageImpact = retainageHeld * 0.15; // Avg 15% of revenue held as retainage

  const recommendations: string[] = [];
  if (projectedGap > 0) {
    recommendations.push(`Establish $${fmtCurrency(projectedGap)} credit line to cover 90-day gap`);
  }
  if (retainageHeld > currentCash * 0.2) {
    recommendations.push('Negotiate retainage release schedule with customers');
  }
  if (weeklyBurnRate > 0) {
    recommendations.push('Accelerate receivables collection—target 15-day improvement');
  }
  if (monthlyExpenses > monthlyRevenue * 0.85) {
    recommendations.push('Review headcount and fixed costs for Q2 restructuring');
  }
  if (upcomingPayables > currentCash * 0.5) {
    recommendations.push('Negotiate 30-day payment terms extension with suppliers');
  }

  return {
    currentCashPosition: fmtCurrency(currentCash),
    projectedGap: fmtCurrency(Math.max(projectedGap, 0)),
    weeklyBurnRate: fmtCurrency(weeklyBurnRate),
    daysToShortfall: daysToShortfall > 0 ? daysToShortfall : null,
    retainageImpact: fmtCurrency(retainageImpact),
    recommendations,
  };
}

// ============================================================================
// TOOL 2: MARGIN EROSION MONITOR
// ============================================================================

export function calculateMarginErosionMonitor(inputs: Record<string, any>): Record<string, any> {
  const estimatedRevenue = n(inputs.estimatedRevenue);
  const estimatedCosts = n(inputs.estimatedCosts);
  const actualRevenue = n(inputs.actualRevenue);
  const laborCostActual = n(inputs.laborCostActual);
  const materialsCostActual = n(inputs.materialsCostActual);
  const equipmentCostActual = n(inputs.equipmentCostActual);
  const subcontractorCostActual = n(inputs.subcontractorCostActual);
  const otherCostActual = n(inputs.otherCostActual);

  const estimatedMarginDollars = estimatedRevenue - estimatedCosts;
  const estimatedMarginPct = estimatedRevenue > 0 ? estimatedMarginDollars / estimatedRevenue : 0;

  const actualCostTotal = laborCostActual + materialsCostActual + equipmentCostActual + subcontractorCostActual + otherCostActual;
  const actualMarginDollars = actualRevenue - actualCostTotal;
  const actualMarginPct = actualRevenue > 0 ? actualMarginDollars / actualRevenue : 0;

  const marginErosion = estimatedMarginPct - actualMarginPct;

  const totalActual = actualCostTotal || 1;
  const costBreakdown = {
    labor: laborCostActual / totalActual,
    materials: materialsCostActual / totalActual,
    equipment: equipmentCostActual / totalActual,
    subcontractors: subcontractorCostActual / totalActual,
    other: otherCostActual / totalActual,
  };

  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  if (marginErosion > 0.15) riskLevel = 'Critical';
  else if (marginErosion > 0.1) riskLevel = 'High';
  else if (marginErosion > 0.05) riskLevel = 'Medium';

  const recommendations: string[] = [];
  if (riskLevel !== 'Low') {
    recommendations.push(`Address ${marginErosion > 0.1 ? 'critical' : 'significant'} margin erosion of ${fmtPct(marginErosion)}`);
  }
  if (costBreakdown.labor > 0.5) {
    recommendations.push('Review labor productivity and staffing model');
  }
  if (costBreakdown.materials > 0.3) {
    recommendations.push('Renegotiate supplier pricing or source alternative vendors');
  }
  if (costBreakdown.subcontractors > 0.25) {
    recommendations.push('Evaluate subcontractor performance and rates');
  }
  if (actualRevenue < estimatedRevenue * 0.95) {
    recommendations.push('Implement change order tracking to capture scope increases');
  }

  return {
    estimatedMarginDollars: fmtCurrency(estimatedMarginDollars),
    estimatedMarginPct: fmtPct(estimatedMarginPct),
    actualCostTotal: fmtCurrency(actualCostTotal),
    actualMarginDollars: fmtCurrency(actualMarginDollars),
    actualMarginPct: fmtPct(actualMarginPct),
    marginErosion: fmtPct(marginErosion),
    costBreakdown: {
      labor: fmtPct(costBreakdown.labor),
      materials: fmtPct(costBreakdown.materials),
      equipment: fmtPct(costBreakdown.equipment),
      subcontractors: fmtPct(costBreakdown.subcontractors),
      other: fmtPct(costBreakdown.other),
    },
    riskLevel,
    recommendations,
  };
}

// ============================================================================
// TOOL 3: OVERHEAD BENCHMARKER
// ============================================================================

export function calculateOverheadBenchmarker(inputs: Record<string, any>): Record<string, any> {
  const annualRevenue = n(inputs.annualRevenue);
  const salariesAdministrative = n(inputs.salariesAdministrative);
  const officeRent = n(inputs.officeRent);
  const utilities = n(inputs.utilities);
  const insurance = n(inputs.insurance);
  const softwareTools = n(inputs.softwareTools);
  const vehicleMaintenance = n(inputs.vehicleMaintenance);
  const otherOverhead = n(inputs.otherOverhead);

  const totalOverhead = salariesAdministrative + officeRent + utilities + insurance + softwareTools + vehicleMaintenance + otherOverhead;
  const overheadRate = annualRevenue > 0 ? totalOverhead / annualRevenue : 0;

  const industryBenchmark = 0.165; // 16.5% typical for specialty contractors
  const variance = overheadRate - industryBenchmark;

  const overheadBreakdown = {
    salaries: annualRevenue > 0 ? salariesAdministrative / annualRevenue : 0,
    rent: annualRevenue > 0 ? officeRent / annualRevenue : 0,
    utilities: annualRevenue > 0 ? utilities / annualRevenue : 0,
    insurance: annualRevenue > 0 ? insurance / annualRevenue : 0,
    software: annualRevenue > 0 ? softwareTools / annualRevenue : 0,
    vehicles: annualRevenue > 0 ? vehicleMaintenance / annualRevenue : 0,
    other: annualRevenue > 0 ? otherOverhead / annualRevenue : 0,
  };

  const recommendations: string[] = [];
  if (overheadRate > industryBenchmark * 1.15) {
    recommendations.push(`Reduce overhead by ${fmtPct(variance)} to match industry benchmark`);
  }
  if (salariesAdministrative / annualRevenue > 0.08) {
    recommendations.push('Review administrative staffing—target 7-8% of revenue');
  }
  if (officeRent / annualRevenue > 0.04) {
    recommendations.push('Explore office consolidation or remote work options');
  }
  if (softwareTools / annualRevenue > 0.02) {
    recommendations.push('Conduct software license audit and eliminate redundancies');
  }
  recommendations.push(`Monitor overhead quarterly against ${fmtPct(industryBenchmark)} target`);

  return {
    overheadRate: fmtPct(overheadRate),
    industryBenchmark: fmtPct(industryBenchmark),
    variance: fmtPct(variance),
    annualOverheadDollars: fmtCurrency(totalOverhead),
    overheadBreakdown: {
      salaries: fmtPct(overheadBreakdown.salaries),
      rent: fmtPct(overheadBreakdown.rent),
      utilities: fmtPct(overheadBreakdown.utilities),
      insurance: fmtPct(overheadBreakdown.insurance),
      software: fmtPct(overheadBreakdown.software),
      vehicles: fmtPct(overheadBreakdown.vehicles),
      other: fmtPct(overheadBreakdown.other),
    },
    recommendations,
  };
}

// ============================================================================
// TOOL 4: WIN-RATE TRACKER
// ============================================================================

export function calculateWinRateTracker(inputs: Record<string, any>): Record<string, any> {
  const bidsSubmitted = n(inputs.bidsSubmitted);
  const bidWins = n(inputs.bidWins);
  const totalBidValue = n(inputs.totalBidValue);
  const winBidValue = n(inputs.winBidValue);

  const winRate = bidsSubmitted > 0 ? bidWins / bidsSubmitted : 0;
  const industryAvg = 0.20; // 15-25% typical, using 20%
  const avgBidValue = bidsSubmitted > 0 ? totalBidValue / bidsSubmitted : 0;
  const estimatedRevenue = winBidValue || (bidWins * avgBidValue);

  const efficiencyScore = winRate / industryAvg * 100;

  const recommendations: string[] = [];
  if (winRate < industryAvg * 0.8) {
    recommendations.push('Improve bid strategy—conduct win/loss analysis on 10 recent losses');
  }
  if (winRate > industryAvg * 1.2) {
    recommendations.push('Scale proposal team to handle higher bid volume');
  }
  if (avgBidValue < 50000) {
    recommendations.push('Target higher-value opportunities ($50K+) to improve margins');
  }
  if (bidsSubmitted < 24) {
    recommendations.push('Increase bid activity to 24+ bids/year for sustainable revenue');
  }
  recommendations.push(`Current win rate ${fmtPct(winRate)} vs. industry avg ${fmtPct(industryAvg)}`);

  return {
    winRate: fmtPct(winRate),
    industryAvg: fmtPct(industryAvg),
    bidsSubmitted,
    bidWins,
    avgBidValue: fmtCurrency(avgBidValue),
    totalBidValue: fmtCurrency(totalBidValue),
    estimatedRevenue: fmtCurrency(estimatedRevenue),
    efficiencyScore: Math.round(efficiencyScore),
    recommendations,
  };
}

// ============================================================================
// TOOL 5: BID/NO-BID DECISION TOOL
// ============================================================================

export function calculateBidNobidDecisionTool(inputs: Record<string, any>): Record<string, any> {
  const alignment = n(inputs.alignment); // 0-25 points
  const capability = n(inputs.capability); // 0-20 points
  const profitability = n(inputs.profitability); // 0-20 points
  const risk = n(inputs.risk); // 0-20 points
  const timing = n(inputs.timing); // 0-15 points

  const totalScore = alignment + capability + profitability + risk + timing;

  let recommendation: 'Strong Bid' | 'Conditional Bid' | 'No Bid' = 'No Bid';
  if (totalScore >= 75) recommendation = 'Strong Bid';
  else if (totalScore >= 50) recommendation = 'Conditional Bid';

  const scoringBreakdown = {
    alignment,
    capability,
    profitability,
    risk,
    timing,
  };

  const riskFactors: string[] = [];
  if (risk < 10) riskFactors.push('High project risk—significant exposure to schedule or cost overruns');
  if (capability < 12) riskFactors.push('Limited capability match—may require external resources');
  if (timing < 8) riskFactors.push('Aggressive timeline—high probability of rework or delays');
  if (profitability < 12) riskFactors.push('Thin margins—limited buffer for cost contingencies');
  if (alignment < 15) riskFactors.push('Poor customer/project fit—potential culture or scope issues');

  const recommendations: string[] = [];
  if (recommendation === 'Conditional Bid') {
    recommendations.push('Bid conditionally—include contingency pricing and risk mitigation plan');
    recommendations.push('Establish clear scope and change order process with customer');
  }
  if (recommendation === 'No Bid') {
    recommendations.push('Pass on this opportunity—misalignment with core competencies');
    recommendations.push('Request RFQ when timing or scope aligns better with capacity');
  }
  if (recommendation === 'Strong Bid') {
    recommendations.push('Proceed with aggressive pursuit—this is a good fit');
    recommendations.push('Allocate dedicated PM and key resources to ensure success');
  }
  recommendations.push(`Total score: ${totalScore}/100`);

  return {
    totalScore,
    recommendation,
    scoringBreakdown,
    riskFactors,
    recommendations,
  };
}

// ============================================================================
// TOOL 6: PREQUALIFICATION SCORECARD
// ============================================================================

export function calculatePrequalificationScorecard(inputs: Record<string, any>): Record<string, any> {
  const safetyRecord = n(inputs.safetyRecord); // 0-15
  const financialStability = n(inputs.financialStability); // 0-15
  const bonding = n(inputs.bonding); // 0-15
  const experience = n(inputs.experience); // 0-15
  const insurance = n(inputs.insurance); // 0-10
  const references = n(inputs.references); // 0-10
  const compliance = n(inputs.compliance); // 0-5

  const overallScore = safetyRecord + financialStability + bonding + experience + insurance + references + compliance;

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (overallScore >= 90) grade = 'A';
  else if (overallScore >= 80) grade = 'B';
  else if (overallScore >= 70) grade = 'C';
  else if (overallScore >= 60) grade = 'D';

  const categoryScores = {
    safetyRecord,
    financialStability,
    bonding,
    experience,
    insurance,
    references,
    compliance,
  };

  let recommendation = 'Proceed with caution';
  if (grade === 'A') recommendation = 'Approved for all project types';
  else if (grade === 'B') recommendation = 'Approved with standard terms';
  else if (grade === 'C') recommendation = 'Conditional approval—additional monitoring required';
  else if (grade === 'D' || grade === 'F') recommendation = 'Not recommended for prequalification';

  const recommendations: string[] = [];
  if (safetyRecord < 10) recommendations.push('Safety record is weak—request injury prevention plan');
  if (financialStability < 10) recommendations.push('Financial stability is concerning—request 3 years of tax returns');
  if (bonding < 10) recommendations.push('Bonding capacity is insufficient for large projects');
  if (experience < 10) recommendations.push('Experience level may not match project complexity');
  recommendations.push(`Prequalification status: ${recommendation}`);

  return {
    overallScore,
    grade,
    recommendation,
    categoryScores,
    recommendations,
  };
}

// ============================================================================
// TOOL 7: BONDING CAPACITY CALCULATOR
// ============================================================================

export function calculateBondingCapacityCalculator(inputs: Record<string, any>): Record<string, any> {
  const annualRevenue = n(inputs.annualRevenue);
  const netWorth = n(inputs.netWorth);
  const workingCapital = n(inputs.workingCapital);
  const currentBondedProjects = n(inputs.currentBondedProjects);
  const outstandingBondValue = n(inputs.outstandingBondValue);

  // Industry standard: typical surety limit is 10-15x annual revenue
  const revenueBasedLimit = annualRevenue * 12.5;

  // Net worth based: typically 5-10x net worth
  const netWorthBasedLimit = netWorth * 7.5;

  // Working capital based: 1.25:1 to 2:1 ratio
  const workingCapitalBasedLimit = workingCapital * 1.5;

  const estimatedSingleLimit = Math.min(revenueBasedLimit, netWorthBasedLimit, workingCapitalBasedLimit);
  const estimatedAggregateLimit = estimatedSingleLimit * 2;

  const utilizationRate = outstandingBondValue > 0 ? outstandingBondValue / estimatedAggregateLimit : 0;
  const availableCapacity = estimatedAggregateLimit - outstandingBondValue;

  const currentAssets = workingCapital;
  const currentLiabilities = outstandingBondValue;
  const liquidityRatio = currentAssets > 0 ? currentLiabilities / currentAssets : 0;
  const debtToEquity = netWorth > 0 ? currentLiabilities / netWorth : 0;

  const keyRatios = {
    utilizationRate: fmtPct(utilizationRate),
    liquidityRatio: liquidityRatio.toFixed(2),
    debtToEquity: debtToEquity.toFixed(2),
  };

  const recommendations: string[] = [];
  if (utilizationRate > 0.75) {
    recommendations.push('Bonding capacity is highly utilized—consider expanding credit lines or reducing bid volume');
  }
  if (utilizationRate > 0.5) {
    recommendations.push('Increase working capital to improve bonding capacity availability');
  }
  if (availableCapacity < annualRevenue * 0.25) {
    recommendations.push('Develop $X growth plan with surety—schedule annual review meeting');
  }
  if (currentBondedProjects > 5) {
    recommendations.push('Monitor project completion schedule to free up bonding capacity');
  }
  recommendations.push(`Current aggregate limit: ${fmtCurrency(estimatedAggregateLimit)}`);

  return {
    estimatedSingleLimit: fmtCurrency(estimatedSingleLimit),
    estimatedAggregateLimit: fmtCurrency(estimatedAggregateLimit),
    currentBondedValue: fmtCurrency(outstandingBondValue),
    utilizationRate: fmtPct(utilizationRate),
    availableCapacity: fmtCurrency(Math.max(availableCapacity, 0)),
    keyRatios,
    recommendations,
  };
}

// ============================================================================
// TOOL 8: INSURANCE GAP ANALYZER
// ============================================================================

export function calculateInsuranceGapAnalyzer(inputs: Record<string, any>): Record<string, any> {
  const generalLiability = n(inputs.generalLiability) / 1000000; // Convert to millions
  const workersCompRequired = n(inputs.workersCompRequired);
  const workersCompCurrent = n(inputs.workersCompCurrent);
  const professionalLiability = n(inputs.professionalLiability) / 1000000;
  const umbrellaLiability = n(inputs.umbrellaLiability) / 1000000;
  const propertyInsurance = n(inputs.propertyInsurance) / 1000000;
  const vehicleInsurance = n(inputs.vehicleInsurance) / 1000000;

  const gaps: Array<{
    area: string;
    current: string;
    recommended: string;
    risk: string;
  }> = [];

  // Typical recommendations
  const glRecommended = 2;
  const umbrellaRecommended = 5;

  if (generalLiability < glRecommended) {
    gaps.push({
      area: 'General Liability',
      current: `$${generalLiability.toFixed(1)}M`,
      recommended: `$${glRecommended}M`,
      risk: 'High—inadequate coverage for major claims',
    });
  }

  if (workersCompCurrent < workersCompRequired) {
    gaps.push({
      area: 'Workers Compensation',
      current: workersCompCurrent ? 'Partial' : 'None',
      recommended: 'Full coverage per state requirements',
      risk: 'Critical—legal liability and fines',
    });
  }

  if (umbrellaLiability < umbrellaRecommended) {
    gaps.push({
      area: 'Umbrella/Excess Liability',
      current: umbrellaLiability > 0 ? `$${umbrellaLiability.toFixed(1)}M` : 'None',
      recommended: `$${umbrellaRecommended}M`,
      risk: 'Medium—exposure beyond GL limits',
    });
  }

  if (!professionalLiability && generalLiability < 5) {
    gaps.push({
      area: 'Professional Liability (E&O)',
      current: 'None',
      recommended: '$1-2M',
      risk: 'Medium—design/specification errors',
    });
  }

  const overallCoverageScore = Math.min(
    (generalLiability / glRecommended) * 25,
    25
  ) + Math.min(
    (workersCompCurrent / Math.max(workersCompRequired, 1)) * 25,
    25
  ) + Math.min(
    (umbrellaLiability / umbrellaRecommended) * 25,
    25
  ) + Math.min(
    (propertyInsurance > 0 ? 1 : 0) * 12.5 +
    (vehicleInsurance > 0 ? 1 : 0) * 12.5,
    25
  );

  const estimatedPremiumLow = (generalLiability * 0.012 + umbrellaLiability * 0.004) * 1000000 * 0.85;
  const estimatedPremiumHigh = (generalLiability * 0.015 + umbrellaLiability * 0.005) * 1000000 * 1.15;

  const recommendations: string[] = [];
  if (gaps.length > 0) {
    recommendations.push(`Address ${gaps.length} insurance gaps immediately`);
  }
  recommendations.push('Schedule annual insurance audit with broker');
  recommendations.push('Increase GL limits as revenue scales');
  recommendations.push('Review policy exclusions with broker quarterly');
  if (!workersCompCurrent && workersCompRequired) {
    recommendations.push('Obtain workers compensation coverage—this is mandatory');
  }

  return {
    overallCoverageScore: Math.round(overallCoverageScore),
    gaps,
    estimatedPremiumRange: `${fmtCurrency(estimatedPremiumLow)} - ${fmtCurrency(estimatedPremiumHigh)}/year`,
    recommendations,
  };
}

// ============================================================================
// TOOL 9: EMR SIMULATOR
// ============================================================================

export function calculateEMRSimulator(inputs: Record<string, any>): Record<string, any> {
  const injuriesPerYear = n(inputs.injuriesPerYear);
  const hoursWorkedPerYear = n(inputs.hoursWorkedPerYear);
  const projectedProjections = n(inputs.projectedProjections);

  // EMR = (Actual Loss / Expected Loss) * 100
  // Expected loss based on industry benchmarks
  const injuryRate = hoursWorkedPerYear > 0 ? (injuriesPerYear / hoursWorkedPerYear) * 200000 : 0;
  const industryAvg = 1.0;
  const currentEMR = injuryRate > 0 ? (injuryRate / industryAvg) : industryAvg;

  // Projected EMR based on safety improvements
  const projectedInjuries = Math.max(injuriesPerYear - projectedProjections, 0);
  const projectedInjuryRate = hoursWorkedPerYear > 0 ? (projectedInjuries / hoursWorkedPerYear) * 200000 : 0;
  const projectedEMR = projectedInjuryRate > 0 ? (projectedInjuryRate / industryAvg) : industryAvg;

  const incidentRate = injuryRate;
  const dartRate = incidentRate * 0.65; // ~65% of injuries are lost time

  // Premium impact: typically 5-15% per 0.1 EMR variance
  const emrVariance = currentEMR - industryAvg;
  const premiumMultiplier = 1 + emrVariance * 0.15;

  const recommendations: string[] = [];
  if (currentEMR > 1.5) {
    recommendations.push('Implement comprehensive safety program—EMR is critically high');
  }
  if (currentEMR > industryAvg * 1.15) {
    recommendations.push('Target ${Math.ceil(projectedProjections)} injury reduction over 12 months');
  }
  if (currentEMR < 0.8) {
    recommendations.push('Maintain current safety culture—better than industry average');
  }
  recommendations.push('Conduct root cause analysis on all reportable incidents');
  recommendations.push('Schedule EMR review meeting with insurance broker quarterly');

  return {
    currentEMR: currentEMR.toFixed(2),
    projectedEMR: projectedEMR.toFixed(2),
    incidentRate: incidentRate.toFixed(2),
    dartRate: dartRate.toFixed(2),
    industryAvg: industryAvg.toFixed(2),
    premiumMultiplier: premiumMultiplier.toFixed(3),
    recommendations,
  };
}

// ============================================================================
// TOOL 10: SAFETY MATURITY ASSESSOR
// ============================================================================

export function calculateSafetyMaturityAssessor(inputs: Record<string, any>): Record<string, any> {
  const leadership = n(inputs.leadership); // 0-15
  const hazardManagement = n(inputs.hazardManagement); // 0-20
  const training = n(inputs.training); // 0-15
  const reporting = n(inputs.reporting); // 0-15
  const accountability = n(inputs.accountability); // 0-15
  const worksite = n(inputs.worksite); // 0-10
  const culture = n(inputs.culture); // 0-10

  const maturityScore = leadership + hazardManagement + training + reporting + accountability + worksite + culture;

  let maturityLevel: 'Reactive' | 'Compliant' | 'Proactive' | 'Leading' = 'Reactive';
  if (maturityScore >= 85) maturityLevel = 'Leading';
  else if (maturityScore >= 70) maturityLevel = 'Proactive';
  else if (maturityScore >= 55) maturityLevel = 'Compliant';

  const categoryScores = {
    leadership,
    hazardManagement,
    training,
    reporting,
    accountability,
    worksite,
    culture,
  };

  const recommendations: string[] = [];
  if (maturityLevel === 'Reactive') {
    recommendations.push('Establish formal safety program with documented procedures');
    recommendations.push('Implement monthly toolbox talks and safety training');
  }
  if (maturityLevel === 'Compliant') {
    recommendations.push('Move beyond compliance—develop proactive hazard identification');
    recommendations.push('Empower crew to report near-misses and unsafe conditions');
  }
  if (maturityLevel === 'Proactive' || maturityLevel === 'Leading') {
    recommendations.push('Maintain current safety culture—focus on continuous improvement');
  }
  if (hazardManagement < 15) {
    recommendations.push('Conduct comprehensive job hazard analysis (JHA) for all tasks');
  }
  if (culture < 7) {
    recommendations.push('Link safety performance to compensation and advancement');
  }

  return {
    maturityScore,
    maturityLevel,
    categoryScores,
    recommendations,
  };
}

// ============================================================================
// TOOL 11: TOOLBOX TALK GENERATOR
// ============================================================================

export function calculateToolboxTalkGenerator(inputs: Record<string, any>): Record<string, any> {
  const topic = inputs.topic || 'General Safety';
  const crewSize = n(inputs.crewSize) || 10;
  const hazardLevel = inputs.hazardLevel || 'Medium';

  // Generate contextual talk based on topic
  const talkLibrary: Record<string, {
    topics: string[];
    keyPoints: string[];
    questions: string[];
  }> = {
    'Fall Protection': {
      topics: ['Fall hazards', 'PPE requirements', 'Anchor points', 'Inspection procedures'],
      keyPoints: [
        'Use fall arrest systems on all work 6+ feet above ground',
        'Inspect harnesses, lanyards, and anchors before each use',
        'Maintain 100% tie-off at all times',
        'Never tie off to unsafe anchors (pipes, bars, wires)',
      ],
      questions: [
        'What are 3 common fall hazards on this project?',
        'How often should we inspect fall protection equipment?',
        'What should you do if you find damaged equipment?',
      ],
    },
    'Heat Illness Prevention': {
      topics: ['Heat stress', 'Hydration', 'Work/rest cycles', 'Heat exhaustion symptoms'],
      keyPoints: [
        'Drink water every 15-20 minutes, even if not thirsty',
        'Work in shade or use cooling systems during peak heat',
        'Take 15-min breaks every 2 hours in heat above 90°F',
        'Watch for signs: dizziness, nausea, weakness, rapid pulse',
      ],
      questions: [
        'What are warning signs of heat exhaustion?',
        'How much water should you drink daily in hot weather?',
        'Who is most at risk for heat illness?',
      ],
    },
    'Electrical Safety': {
      topics: ['Shock hazards', 'Grounding', 'GFCI protection', 'Lockout/tagout'],
      keyPoints: [
        'Never work on energized circuits—always de-energize first',
        'Use GFCI-protected equipment on all temporary power',
        'Keep electricity away from water and wet conditions',
        'Follow LOTO procedures and verify power is off',
      ],
      questions: [
        'When do we need to use GFCI protection?',
        'What does LOTO stand for and why is it important?',
        'What distance should we maintain from overhead power lines?',
      ],
    },
    'General Safety': {
      topics: ['Hazard recognition', 'PPE usage', 'Communication', 'Incident reporting'],
      keyPoints: [
        'Identify hazards before starting work',
        'Wear required PPE 100% of the time',
        'Communicate clearly with team about hazards',
        'Report all incidents, injuries, and near-misses immediately',
      ],
      questions: [
        'What hazards do you see in your work area today?',
        'Why is incident reporting important for everyone?',
        'How can we prevent similar incidents in the future?',
      ],
    },
  };

  const talk = talkLibrary[topic] || talkLibrary['General Safety'];

  const title = `Safety Toolbox Talk: ${topic}`;
  const topics = talk.topics;
  const keyPoints = talk.keyPoints;
  const discussionQuestions = talk.questions;
  const documentationNotes = [
    `Conducted with ${crewSize} crew members`,
    `Hazard level: ${hazardLevel}`,
    `Topics covered: ${topics.join(', ')}`,
    'All attendees acknowledged understanding of content',
    'No questions or concerns raised',
  ];

  const recommendations: string[] = [
    'Conduct this talk at start of shift or before high-risk work',
    'Document attendance and ensure all crew members participate',
    'Tailor questions to specific site conditions and tasks',
    'Encourage crew to share experiences and near-misses',
  ];

  return {
    title,
    topics,
    keyPoints,
    discussionQuestions,
    documentationNotes,
    recommendations,
  };
}

// ============================================================================
// TOOL 12: REVENUE CONCENTRATION ANALYZER
// ============================================================================

export function calculateRevenueConcentrationAnalyzer(inputs: Record<string, any>): Record<string, any> {
  const client1Revenue = n(inputs.client1Revenue);
  const client2Revenue = n(inputs.client2Revenue);
  const client3Revenue = n(inputs.client3Revenue);
  const totalRevenue = n(inputs.totalRevenue);

  const client1Pct = totalRevenue > 0 ? client1Revenue / totalRevenue : 0;
  const client2Pct = totalRevenue > 0 ? client2Revenue / totalRevenue : 0;
  const client3Pct = totalRevenue > 0 ? client3Revenue / totalRevenue : 0;

  // Herfindahl–Hirschman Index: sum of squared market shares
  // Lower = more diversified, Higher = more concentrated
  const herfindahlIndex = client1Pct ** 2 + client2Pct ** 2 + client3Pct ** 2;

  let concentrationRisk: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Low';
  if (herfindahlIndex > 0.3) concentrationRisk = 'Critical';
  else if (herfindahlIndex > 0.2) concentrationRisk = 'High';
  else if (herfindahlIndex > 0.1) concentrationRisk = 'Moderate';

  const topClientPct = client1Pct;
  const top3ClientPct = client1Pct + client2Pct + client3Pct;

  // Diversification score: inverse of concentration
  const diversificationScore = Math.max(0, 100 - (herfindahlIndex * 333));

  const recommendations: string[] = [];
  if (concentrationRisk !== 'Low') {
    recommendations.push(`Reduce concentration risk—top client at ${fmtPct(topClientPct)} of revenue`);
  }
  if (top3ClientPct > 0.6) {
    recommendations.push('Top 3 clients represent 60%+ of revenue—develop new customer strategy');
  }
  if (topClientPct > 0.4) {
    recommendations.push('Largest client exceeds 40%—significant business risk if relationship ends');
  }
  recommendations.push(`Target: no single customer >25% of annual revenue`);
  recommendations.push(`Build pipeline to acquire 3-5 new customers this quarter`);

  return {
    herfindahlIndex: herfindahlIndex.toFixed(3),
    concentrationRisk,
    topClientPct: fmtPct(topClientPct),
    top3ClientPct: fmtPct(top3ClientPct),
    diversificationScore: Math.round(diversificationScore),
    recommendations,
  };
}

// ============================================================================
// TOOL 13: GROWTH READINESS ASSESSOR
// ============================================================================

export function calculateGrowthReadinessAssessor(inputs: Record<string, any>): Record<string, any> {
  const peopleScore = n(inputs.peopleScore); // 0-25
  const systemsScore = n(inputs.systemsScore); // 0-25
  const capitalScore = n(inputs.capitalScore); // 0-25
  const backlogScore = n(inputs.backlogScore); // 0-25

  const readinessScore = peopleScore + systemsScore + capitalScore + backlogScore;

  let readinessLevel = 'Not Ready';
  if (readinessScore >= 90) readinessLevel = 'Highly Ready';
  else if (readinessScore >= 75) readinessLevel = 'Ready';
  else if (readinessScore >= 60) readinessLevel = 'Moderately Ready';
  else if (readinessScore >= 45) readinessLevel = 'Partially Ready';

  const categoryScores = {
    people: peopleScore,
    systems: systemsScore,
    capital: capitalScore,
    backlog: backlogScore,
  };

  const recommendations: string[] = [];
  if (peopleScore < 18) {
    recommendations.push('Hire senior project manager and build supervisory bench strength');
  }
  if (systemsScore < 18) {
    recommendations.push('Implement project management software (Procore, Touchplan, etc.)');
  }
  if (capitalScore < 18) {
    recommendations.push('Establish $X credit line or increase working capital before scaling');
  }
  if (backlogScore < 20) {
    recommendations.push('Build sales pipeline—cannot grow without consistent opportunity flow');
  }
  recommendations.push(`Growth readiness: ${readinessLevel} — focus on weakest areas`);

  return {
    readinessScore,
    readinessLevel,
    categoryScores,
    recommendations,
  };
}

// ============================================================================
// TOOL 14: TECH STACK GRADER
// ============================================================================

export function calculateTechStackGrader(inputs: Record<string, any>): Record<string, any> {
  const projectMgmt = n(inputs.projectMgmt); // 0-15
  const accounting = n(inputs.accounting); // 0-15
  const estimating = n(inputs.estimating); // 0-15
  const crm = n(inputs.crm); // 0-15
  const docMgmt = n(inputs.docMgmt); // 0-15
  const integration = n(inputs.integration); // 0-10

  const overallGrade = projectMgmt + accounting + estimating + crm + docMgmt + integration;

  let letterGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (overallGrade >= 85) letterGrade = 'A';
  else if (overallGrade >= 75) letterGrade = 'B';
  else if (overallGrade >= 65) letterGrade = 'C';
  else if (overallGrade >= 55) letterGrade = 'D';

  const categoryScores = {
    projectManagement: projectMgmt,
    accounting: accounting,
    estimating: estimating,
    crm: crm,
    documentManagement: docMgmt,
    integration: integration,
  };

  const missingCapabilities: string[] = [];
  if (projectMgmt < 12) missingCapabilities.push('Project management (lack of field visibility)');
  if (accounting < 12) missingCapabilities.push('Financial management (job costing, accounting)');
  if (estimating < 12) missingCapabilities.push('Estimating (takeoff, labor rates)');
  if (crm < 12) missingCapabilities.push('Sales/CRM (opportunity pipeline, customer tracking)');
  if (docMgmt < 12) missingCapabilities.push('Document management (plans, RFIs, CO tracking)');
  if (integration < 6) missingCapabilities.push('System integration (manual data entry between systems)');

  const recommendations: string[] = [];
  if (letterGrade < 'B') {
    recommendations.push(`Upgrade tech stack—current grade ${letterGrade} is limiting operational efficiency`);
  }
  if (missingCapabilities.length > 0) {
    recommendations.push(`Add missing capabilities: ${missingCapabilities.slice(0, 2).join(', ')}`);
  }
  recommendations.push('Evaluate Procore, Touchplan, or Bridgit for integrated platform');
  recommendations.push('Conduct staff training and establish change management process');
  recommendations.push(`Target: Grade A tech stack supporting $X+ annual revenue`);

  return {
    overallGrade,
    letterGrade,
    categoryScores,
    missingCapabilities,
    recommendations,
  };
}

// ============================================================================
// TOOL 15: CHANGE ORDER TREND TRACKER
// ============================================================================

export function calculateChangeOrderTrendTracker(inputs: Record<string, any>): Record<string, any> {
  const totalChangeOrders = n(inputs.totalChangeOrders);
  const approvedChangeOrders = n(inputs.approvedChangeOrders);
  const totalCOValue = n(inputs.totalCOValue);
  const pendingCOValue = n(inputs.pendingCOValue);
  const avgDaysToApprove = n(inputs.avgDaysToApprove);
  const projectCount = n(inputs.projectCount) || 1;

  const coRate = projectCount > 0 ? totalChangeOrders / projectCount : 0;
  const approvalRate = totalChangeOrders > 0 ? approvedChangeOrders / totalChangeOrders : 0;
  const avgProcessingDays = avgDaysToApprove || 0;

  // Determine if CO rate is healthy
  // Industry avg: 3-5 COs per project
  const costImpact = totalCOValue + pendingCOValue;
  const costImpactPct = (costImpact > 0 && inputs.totalProjectValue) ? costImpact / n(inputs.totalProjectValue) : 0;

  let trendAssessment = 'Controlled';
  if (coRate > 8) trendAssessment = 'Excessive';
  else if (coRate > 5) trendAssessment = 'Elevated';

  const recommendations: string[] = [];
  if (coRate > 5) {
    recommendations.push('High CO rate (${coRate.toFixed(1)} per project)—improve scope definition');
  }
  if (approvalRate < 0.8) {
    recommendations.push('Reduce pending COs—establish 10-day approval SLA');
  }
  if (avgProcessingDays > 14) {
    recommendations.push('Streamline CO approval process—target 7-10 day turnaround');
  }
  if (costImpactPct > 0.1) {
    recommendations.push(`COs impacting ${fmtPct(costImpactPct)} of revenue—improve estimating accuracy`);
  }
  recommendations.push('Implement CO tracking system (Touchplan, Procore)');

  return {
    totalChangeOrders,
    approvedChangeOrders,
    coRate: coRate.toFixed(1),
    approvalRate: fmtPct(approvalRate),
    avgProcessingDays,
    totalCOValue: fmtCurrency(totalCOValue),
    pendingCOValue: fmtCurrency(pendingCOValue),
    costImpact: fmtCurrency(costImpact),
    costImpactPct: fmtPct(costImpactPct),
    trendAssessment,
    recommendations,
  };
}

// ============================================================================
// TOOL 16: CREW UTILIZATION OPTIMIZER
// ============================================================================

export function calculateCrewUtilizationOptimizer(inputs: Record<string, any>): Record<string, any> {
  const totalHours = n(inputs.totalHours);
  const billableHours = n(inputs.billableHours);
  const productiveNonBillableHours = n(inputs.productiveNonBillableHours);
  const nonProductiveHours = n(inputs.nonProductiveHours);
  const hourlyRate = n(inputs.hourlyRate) || 75;
  const crewCount = n(inputs.crewCount) || 1;

  const utilizationRate = totalHours > 0 ? billableHours / totalHours : 0;
  const billableRate = totalHours > 0 ? (billableHours + productiveNonBillableHours) / totalHours : 0;

  // Calculate lost productivity cost
  const lostProductivityCost = nonProductiveHours * hourlyRate * crewCount;

  // Inefficiency breakdown
  const inefficiencyBreakdown = {
    waiting: n(inputs.waitingHours),
    travel: n(inputs.travelHours),
    rework: n(inputs.reworkHours),
    admin: n(inputs.adminHours),
    other: Math.max(nonProductiveHours - (n(inputs.waitingHours) + n(inputs.travelHours) + n(inputs.reworkHours) + n(inputs.adminHours)), 0),
  };

  // Annualized savings if inefficiency is eliminated
  const annualizedSavings = lostProductivityCost * 52;

  // Industry target: 85%+ utilization
  const industryTarget = 0.85;
  const utilizationGap = Math.max(industryTarget - utilizationRate, 0);
  const potentialRevenue = utilizationGap * totalHours * 52 * hourlyRate * crewCount;

  const recommendations: string[] = [];
  if (utilizationRate < 0.75) {
    recommendations.push(`Improve crew utilization to 85%—currently at ${fmtPct(utilizationRate)}`);
  }
  if (inefficiencyBreakdown.waiting > nonProductiveHours * 0.2) {
    recommendations.push('Reduce wait time—pre-stage materials and coordinate with GC');
  }
  if (inefficiencyBreakdown.travel > nonProductiveHours * 0.2) {
    recommendations.push('Consolidate job sites to reduce travel time between projects');
  }
  if (inefficiencyBreakdown.rework > nonProductiveHours * 0.1) {
    recommendations.push('Conduct quality audit—rework indicates training or process gap');
  }
  recommendations.push(`Potential annual upside: ${fmtCurrency(potentialRevenue)}`);

  return {
    utilizationRate: fmtPct(utilizationRate),
    billableRate: fmtPct(billableRate),
    totalHours,
    billableHours,
    nonProductiveHours,
    lostProductivityCost: fmtCurrency(lostProductivityCost),
    annualizedSavings: fmtCurrency(annualizedSavings),
    potentialRevenue: fmtCurrency(potentialRevenue),
    inefficiencyBreakdown: {
      waiting: inefficiencyBreakdown.waiting,
      travel: inefficiencyBreakdown.travel,
      rework: inefficiencyBreakdown.rework,
      admin: inefficiencyBreakdown.admin,
      other: inefficiencyBreakdown.other,
    },
    recommendations,
  };
}

// ============================================================================
// DISPATCHER FUNCTION
// ============================================================================

export function calculateTool(slug: string, inputs: Record<string, any>): Record<string, any> {
  const toolMap: Record<string, (inputs: Record<string, any>) => Record<string, any>> = {
    'cash-flow-gap-analyzer': calculateCashFlowGapAnalyzer,
    'margin-erosion-monitor': calculateMarginErosionMonitor,
    'overhead-benchmarker': calculateOverheadBenchmarker,
    'win-rate-tracker': calculateWinRateTracker,
    'bid-no-bid-decision-tool': calculateBidNobidDecisionTool,
    'prequalification-scorecard': calculatePrequalificationScorecard,
    'bonding-capacity-calculator': calculateBondingCapacityCalculator,
    'insurance-gap-analyzer': calculateInsuranceGapAnalyzer,
    'emr-simulator': calculateEMRSimulator,
    'safety-maturity-assessor': calculateSafetyMaturityAssessor,
    'toolbox-talk-generator': calculateToolboxTalkGenerator,
    'revenue-concentration-analyzer': calculateRevenueConcentrationAnalyzer,
    'growth-readiness-assessor': calculateGrowthReadinessAssessor,
    'tech-stack-grader': calculateTechStackGrader,
    'change-order-trend-tracker': calculateChangeOrderTrendTracker,
    'crew-utilization-optimizer': calculateCrewUtilizationOptimizer,
  };

  const calculator = toolMap[slug];
  if (!calculator) {
    return {
      error: `Unknown tool: ${slug}`,
      availableTools: Object.keys(toolMap),
    };
  }

  try {
    return calculator(inputs);
  } catch (err) {
    return {
      error: `Calculation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}
