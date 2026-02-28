/**
 * GEM 4.0 ENGINE - Core Calculator
 * File completo e unificato
 */

// ============================================================================
// SEZIONE 1: TYPES & INTERFACES
// ============================================================================

export interface MatchInput {
  homeTeam: TeamData;
  awayTeam: TeamData;
  h2h: H2HData;
  referee?: RefereeData;
  isKnockout: boolean;
  competition: string;
  stakes?: { homeNeedWin: boolean; awayNeedWin: boolean };
}

export interface TeamData {
  name: string;
  xG: number;
  xGA: number;
  form: FormData;
  formationStatus: 'official' | 'probable' | 'uncertain';
  injuries: string[];
  homeAwayFactor?: number;
  style: 'attacking' | 'balanced' | 'defensive';
  avgShots: number;
  avgShotsOnTarget: number;
  avgFouls: number;
  avgCards: number;
}

export interface FormData {
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  firstHalfGoals: number;
  bothTeamsScored: number;
  cleanSheets: number;
}

export interface H2HData {
  matches: H2HMatch[];
  avgGoals: number;
  bothTeamsScoredPct: number;
  over25Pct: number;
  firstHalfOver15Pct: number;
}

export interface H2HMatch {
  date: string;
  homeGoals: number;
  awayGoals: number;
  firstHalfGoals: number;
}

export interface RefereeData {
  name: string;
  avgCards: number;
  avgFouls: number;
  strictness: 'strict' | 'normal' | 'lenient';
}

export interface MarketScore {
  probability: number;
  score: number;
  edge?: number;
  isValue?: boolean;
  details: Record<string, number | boolean>;
}

export interface GEMOutput {
  matchId: string;
  timestamp: string;
  patchesApplied: string[];
  markets: {
    '1X2': { home: MarketScore; draw: MarketScore; away: MarketScore };
    overUnder25: { over: MarketScore; under: MarketScore };
    ggNg: { gg: MarketScore; ng: MarketScore };
    firstHalfOver15: MarketScore;
    exactResult: Array<{ result: string; score: number; probability: number }>;
    handicap: { homeMinus1: MarketScore; awayPlus1: MarketScore };
    cleanSheet: { home: MarketScore; away: MarketScore };
    corners?: { over: MarketScore; under: MarketScore };
    playerProps: {
      scorers: PlayerPropScore[];
      assists: PlayerPropScore[];
      cards: PlayerPropScore[];
      shots: PlayerPropScore[];
    };
  };
  topPick: { market: string; selection: string; probability: number; edge: number };
  valueBets: Array<{ market: string; selection: string; probability: number; odds: number; edge: number }>;
  combos?: Array<{ name: string; combinedProb: number; edge: number; isValue: boolean }>;
}

export interface PlayerData {
  name: string;
  team: 'home' | 'away';
  xG: number;
  xA: number;
  conversionRate: number;
  formGoals: number;
  formAssists: number;
  role: 'CF' | 'SS' | 'Winger' | 'AM' | 'CM' | 'FB';
  h2hGoals: number;
  avgShots: number;
  foulsCommitted: number;
  cardsThisSeason: number;
  keyPasses: number;
}

export interface PlayerPropScore {
  player: PlayerData;
  score: number;
  probability: number;
  edge?: number;
  isValue?: boolean;
  breakdown: Record<string, number>;
}

export interface CornerData {
  avgCornersFor: number;
  avgCornersAgainst: number;
  homeAdvantage: number;
}

// ============================================================================
// SEZIONE 2: LE 4 PATCH - HARDCODED
// ============================================================================

export const PATCHES = {
  P1_KNOCKOUT: {
    id: 'P1',
    name: 'Knockout Correction',
    apply: (xG: number, isKnockout: boolean): number => {
      return isKnockout ? xG * 0.80 : xG;
    },
    checkOver25Threshold: (prob: number, isKnockout: boolean): boolean => {
      return !(isKnockout && prob < 0.60);
    }
  },

  P2_FOULS: {
    id: 'P2',
    name: 'Falli Bassa Affidabilità',
    applyRefAvg: (refAvg: number, isCL: boolean): number => {
      return isCL ? refAvg * 0.70 : refAvg;
    },
    edgeThreshold: 0.08,
    excludeFromTopPick: true
  },

  P3_HIERARCHY: {
    id: 'P3',
    name: 'Gerarchia TOP PICK',
    order: ['1X2', 'PlayerProps', 'Corners', 'OverGoals', 'Handicap', 'Fouls'],
    getPriority: (marketType: string): number => {
      const idx = PATCHES.P3_HIERARCHY.order.indexOf(marketType);
      return idx === -1 ? 99 : idx;
    }
  },

  P4_CORNERS: {
    id: 'P4',
    name: 'Angoli Priorità CL',
    apply: (edge: number, isCL: boolean, isKnockout: boolean): { forceTop5: boolean; priority: number } => {
      const isEuropeanKnockout = isCL && isKnockout;
      if (isEuropeanKnockout && edge >= 0.05) {
        return { forceTop5: true, priority: 2 };
      }
      return { forceTop5: false, priority: 5 };
    }
  }
};

// ============================================================================
// SEZIONE 3: UTILITY FUNCTIONS
// ============================================================================

export const applyFormationPenalty = (
  score: number,
  status: 'official' | 'probable' | 'uncertain'
): number => {
  const multipliers = { official: 1.0, probable: 0.90, uncertain: 0.75 };
  return score * multipliers[status];
};

export const calculateEdge = (calculatedProb: number, bookmakerOdds: number): number => {
  const impliedProb = 1 / bookmakerOdds;
  return calculatedProb - impliedProb;
};

export const isValueBet = (edge: number, marketType: string = 'default'): boolean => {
  if (marketType === 'fouls') return edge >= PATCHES.P2_FOULS.edgeThreshold;
  return edge >= 0.05;
};

// ============================================================================
// SEZIONE 4: MODULO 1X2 (VERSIONE UNICA - TABELLA ESATTA)
// ============================================================================

export const calculate1X2 = (input: MatchInput): {
  home: MarketScore;
  draw: MarketScore;
  away: MarketScore;
} => {
  const { homeTeam, awayTeam, h2h, isKnockout } = input;
  
  const homeXg = PATCHES.P1_KNOCKOUT.apply(homeTeam.xG, isKnockout);
  const awayXg = PATCHES.P1_KNOCKOUT.apply(awayTeam.xG, isKnockout);
  
  const xGDiff = (homeXg - awayTeam.xGA) - (awayXg - homeTeam.xGA);
  const xGScore = Math.max(-25, Math.min(25, xGDiff * 10));
  
  const homeFormPts = (homeTeam.form.wins * 3 + homeTeam.form.draws) / 
    (homeTeam.form.matches * 3) * 20;
  const awayFormPts = (awayTeam.form.wins * 3 + awayTeam.form.draws) / 
    (awayTeam.form.matches * 3) * 20;
  const formScore = homeFormPts - awayFormPts;
  
  const h2hHomeWins = h2h.matches.filter(m => m.homeGoals > m.awayGoals).length;
  const h2hScore = ((h2hHomeWins / h2h.matches.length) - 0.5) * 30;
  
  let homeAdvantage = 10;
  if (input.stakes?.homeNeedWin) homeAdvantage += 5;
  if (input.stakes?.awayNeedWin) homeAdvantage -= 5;
  if (homeTeam.formationStatus !== 'official') homeAdvantage -= 5;
  
  let styleScore = 0;
  if (homeTeam.style === 'attacking') styleScore += 5;
  if (awayTeam.style === 'defensive') styleScore += 5;
  if (homeTeam.injuries.length > 2) styleScore -= 10;
  if (awayTeam.injuries.length > 2) styleScore += 5;
  
  const totalScore = xGScore + formScore + h2hScore + homeAdvantage + styleScore;
  
  let homeProb: number, drawProb: number, awayProb: number;
  
  if (totalScore >= 40) {
    homeProb = 0.75; drawProb = 0.18; awayProb = 0.07;
  } else if (totalScore >= 25) {
    homeProb = 0.65; drawProb = 0.22; awayProb = 0.13;
  } else if (totalScore >= 10) {
    homeProb = 0.55; drawProb = 0.25; awayProb = 0.20;
  } else if (totalScore >= 0) {
    homeProb = 0.45; drawProb = 0.27; awayProb = 0.28;
  } else if (totalScore >= -10) {
    homeProb = 0.35; drawProb = 0.27; awayProb = 0.38;
  } else if (totalScore >= -25) {
    homeProb = 0.25; drawProb = 0.22; awayProb = 0.53;
  } else {
    homeProb = 0.15; drawProb = 0.18; awayProb = 0.67;
  }
  
  const homeMultiplier = { official: 1.0, probable: 0.95, uncertain: 0.875 }[homeTeam.formationStatus];
  const awayMultiplier = { official: 1.0, probable: 0.95, uncertain: 0.875 }[awayTeam.formationStatus];
  
  const adjustedHome = homeProb * homeMultiplier;
  const adjustedAway = awayProb * awayMultiplier;
  const adjustedDraw = 1 - adjustedHome - adjustedAway;
  const sum = adjustedHome + adjustedDraw + adjustedAway;
  
  return {
    home: {
      probability: adjustedHome / sum,
      score: totalScore + 50,
      details: { xG: xGScore, form: formScore, h2h: h2hScore, homeAdv: homeAdvantage, style: styleScore, rawScore: totalScore }
    },
    draw: {
      probability: Math.max(0.05, adjustedDraw / sum),
      score: 50 - Math.abs(totalScore),
      details: { base: drawProb }
    },
    away: {
      probability: adjustedAway / sum,
      score: 50 - totalScore,
      details: { total: -totalScore }
    }
  };
};

// ============================================================================
// SEZIONE 5: MODULO OVER/UNDER 2.5
// ============================================================================

export const calculateOverUnder25 = (input: MatchInput): {
  over: MarketScore;
  under: MarketScore;
} => {
  const { homeTeam, awayTeam, h2h, isKnockout } = input;
  
  const homeXg = PATCHES.P1_KNOCKOUT.apply(homeTeam.xG, isKnockout);
  const awayXg = PATCHES.P1_KNOCKOUT.apply(awayTeam.xG, isKnockout);
  
  const xGCombined = homeXg + awayXg;
  const xGComponent = Math.min(40, xGCombined * 10);
  const h2hComponent = Math.min(25, h2h.avgGoals * 8);
  
  let styleComponent = 0;
  if (homeTeam.style === 'attacking') styleComponent += 10;
  if (awayTeam.style === 'attacking') styleComponent += 10;
  if (homeTeam.style === 'defensive') styleComponent -= 5;
  if (awayTeam.style === 'defensive') styleComponent -= 5;
  
  const recentGoals = (homeTeam.form.goalsScored + awayTeam.form.goalsScored) / 
    (homeTeam.form.matches + awayTeam.form.matches);
  const formComponent = Math.min(15, recentGoals * 5);
  
  const overScore = xGComponent + h2hComponent + styleComponent + formComponent;
  
  let overProb: number;
  if (xGCombined > 3.5) overProb = 0.70 + (overScore - 70) / 200;
  else if (xGCombined > 2.5) overProb = 0.55 + (overScore - 55) / 150;
  else overProb = overScore / 120;
  
  overProb = Math.min(0.85, Math.max(0.15, overProb));
  
  if (isKnockout && overProb < 0.60) overProb = 0.50;
  
  return {
    over: {
      probability: overProb,
      score: overScore,
      details: { xG: xGComponent, h2h: h2hComponent, style: styleComponent, form: formComponent }
    },
    under: {
      probability: 1 - overProb,
      score: 100 - overScore,
      details: { inverse: true }
    }
  };
};

// ============================================================================
// SEZIONE 6: MODULO GG/NG
// ============================================================================

export const calculateGGNG = (input: MatchInput): {
  gg: MarketScore;
  ng: MarketScore;
} => {
  const { homeTeam, awayTeam, h2h, isKnockout } = input;
  
  const homeBTTS = (homeTeam.form.bothTeamsScored / homeTeam.form.matches) * 30;
  const awayBTTS = (awayTeam.form.bothTeamsScored / awayTeam.form.matches) * 30;
  const bttsComponent = (homeBTTS + awayBTTS) / 2;
  
  const h2hBttsPct = h2h.bothTeamsScoredPct * 25;
  
  const homeDefQuality = (homeTeam.xGA / 1.5) * 12.5;
  const awayDefQuality = (awayTeam.xGA / 1.5) * 12.5;
  const defenseComponent = 25 - ((homeDefQuality + awayDefQuality) / 2);
  
  const attackComponent = ((homeTeam.xG + awayTeam.xG) / 3) * 20;
  
  const ggScore = bttsComponent + h2hBttsPct + defenseComponent + attackComponent;
  let ggProb = ggScore / 100;
  
  const avgGoals = (homeTeam.xG + awayTeam.xG) / 2;
  if (avgGoals > 1.2) ggProb = Math.max(ggProb, 0.65);
  if (homeTeam.xGA < 0.8 || awayTeam.xGA < 0.8) ggProb = Math.min(ggProb, 0.40);
  
  if (isKnockout) ggProb *= 0.90;
  ggProb = Math.min(0.80, Math.max(0.20, ggProb));
  
  return {
    gg: {
      probability: ggProb,
      score: ggScore,
      details: { btts: bttsComponent, h2h: h2hBttsPct, defense: defenseComponent, attack: attackComponent }
    },
    ng: {
      probability: 1 - ggProb,
      score: 100 - ggScore,
      details: {}
    }
  };
};

// ============================================================================
// SEZIONE 7: MODULO FH O1.5
// ============================================================================

export const calculateFirstHalfOver15 = (input: MatchInput): MarketScore => {
  const { homeTeam, awayTeam, h2h, isKnockout } = input;
  
  const homeFHFreq = (homeTeam.form.firstHalfGoals / homeTeam.form.goalsScored) || 0.5;
  const awayFHFreq = (awayTeam.form.firstHalfGoals / awayTeam.form.goalsScored) || 0.5;
  const freqComponent = ((homeFHFreq + awayFHFreq) / 2) * 35;
  
  const totalFHGoals = homeTeam.form.firstHalfGoals + (awayTeam.form.firstHalfGoals * 0.8);
  const formComponent = Math.min(20, (totalFHGoals / 10) * 20);
  
  const h2hFHComponent = h2h.firstHalfOver15Pct * 15;
  
  let contextComponent = 0;
  if (input.stakes?.homeNeedWin || input.stakes?.awayNeedWin) contextComponent += 5;
  if (homeTeam.style === 'attacking' && awayTeam.style === 'attacking') contextComponent += 5;
  if (h2h.matches.length > 5) contextComponent += 5;
  
  let mismatchComponent = 0;
  if (homeTeam.xG > 1.8 && awayTeam.xGA > 1.5) mismatchComponent += 8;
  if (awayTeam.xG > 1.5 && homeTeam.xGA > 1.5) mismatchComponent += 7;
  
  const totalScore = freqComponent + formComponent + h2hFHComponent + contextComponent + mismatchComponent;
  
  let probability: number;
  if (totalScore >= 90) probability = 0.55;
  else if (totalScore >= 75) probability = 0.45;
  else if (totalScore >= 60) probability = 0.35;
  else probability = 0.25;
  
  if (isKnockout) probability *= 0.85;
  
  return {
    probability,
    score: totalScore,
    details: { frequency: freqComponent, form: formComponent, h2h: h2hFHComponent, context: contextComponent, mismatch: mismatchComponent }
  };
};

// ============================================================================
// SEZIONE 8: MODULO RISULTATO ESATTO
// ============================================================================

const poisson = (k: number, lambda: number): number => {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
};

const factorial = (n: number): number => {
  if (n === 0) return 1;
  return n * factorial(n - 1);
};

export const calculateExactResult = (input: MatchInput): Array<{ result: string; score: number; probability: number }> => {
  const { homeTeam, awayTeam, isKnockout } = input;
  
  const lambdaHome = PATCHES.P1_KNOCKOUT.apply(homeTeam.xG, isKnockout);
  const lambdaAway = PATCHES.P1_KNOCKOUT.apply(awayTeam.xG, isKnockout);
  
  const results: Array<{ result: string; probability: number }> = [];
  
  for (let h = 0; h <= 4; h++) {
    for (let a = 0; a <= 4; a++) {
      const prob = poisson(h, lambdaHome) * poisson(a, lambdaAway);
      results.push({ result: `${h}-${a}`, probability: prob });
    }
  }
  
  return results
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5)
    .map(r => ({ result: r.result, score: r.probability * 100, probability: r.probability }));
};

// ============================================================================
// SEZIONE 9: MODULO HANDICAP
// ============================================================================

export const calculateHandicap = (input: MatchInput): {
  homeMinus1: MarketScore;
  awayPlus1: MarketScore;
} => {
  const { homeTeam, awayTeam } = input;

  const score1X2 = calculate1X2(input);
  const homeWinProb = score1X2.home.probability;
  const awayWinProb = score1X2.away.probability;
  const drawProb = score1X2.draw.probability;
  
  const homeMinus1Prob = Math.max(0, homeWinProb - drawProb * 0.5 - awayWinProb * 0.3);
  const awayPlus1Prob = awayWinProb + drawProb;
  
  const strengthDiff = (homeTeam.xG - awayTeam.xG) + (homeTeam.xGA - awayTeam.xGA) * -1;
  
  return {
    homeMinus1: {
      probability: homeMinus1Prob,
      score: strengthDiff > 20 ? 65 : 45,
      details: { strengthDiff, baseProb: homeMinus1Prob }
    },
    awayPlus1: {
      probability: awayPlus1Prob,
      score: 70,
      details: { strengthDiff, baseProb: awayPlus1Prob }
    }
  };
};

// ============================================================================
// SEZIONE 10: MODULO CLEAN SHEET
// ============================================================================

export const calculateCleanSheet = (team: TeamData, opponent: TeamData, isKnockout: boolean): MarketScore => {
  const defenseQuality = Math.min(40, (2 - team.xGA) * 20);
  const oppAttack = Math.max(0, 30 - opponent.xG * 10);
  const formDefense = (team.form.cleanSheets / team.form.matches) * 20;
  const h2hClean = 10;
  
  const totalScore = defenseQuality + oppAttack + formDefense + h2hClean;
  
  let probability: number;
  if (totalScore >= 70) probability = 0.45;
  else if (totalScore >= 55) probability = 0.35;
  else if (totalScore >= 40) probability = 0.25;
  else probability = 0.15;
  
  if (isKnockout) probability *= 1.1;
  
  return {
    probability: Math.min(0.50, probability),
    score: totalScore,
    details: { defense: defenseQuality, oppAttack: oppAttack, form: formDefense, h2h: h2hClean }
  };
};

// ============================================================================
// SEZIONE 11: MODULO ANGOLI (con PATCH P4)
// ============================================================================

export const calculateCornersScore = (
  homeTeam: TeamData & CornerData,
  awayTeam: TeamData & CornerData,
  isCL: boolean,
  isKnockout: boolean
): { over: MarketScore; under: MarketScore } => {
  
  const homeTotal = homeTeam.avgCornersFor + homeTeam.avgCornersAgainst;
  const awayTotal = awayTeam.avgCornersFor + awayTeam.avgCornersAgainst;
  const avgComponent = Math.min(40, ((homeTotal + awayTotal) / 2) * 8);
  
  let styleComponent = 0;
  if (homeTeam.style === 'attacking') styleComponent += 15;
  if (awayTeam.style === 'attacking') styleComponent += 15;
  if (homeTeam.style === 'defensive') styleComponent -= 10;
  
  const homeAdvComponent = (homeTeam.homeAdvantage - 1) * 50;
  
  let pressingComponent = 0;
  if (homeTeam.avgFouls > 12) pressingComponent += 5;
  if (awayTeam.avgFouls > 12) pressingComponent += 5;
  
  const overScore = avgComponent + styleComponent + homeAdvComponent + pressingComponent;
  
  let overProb: number;
  if (overScore >= 75) overProb = 0.65;
  else if (overScore >= 60) overProb = 0.55;
  else if (overScore >= 45) overProb = 0.45;
  else overProb = 0.35;
  
  return {
    over: {
      probability: overProb,
      score: overScore,
      details: { avg: avgComponent, style: styleComponent, homeAdv: homeAdvComponent, pressing: pressingComponent, patchP4: isCL && isKnockout }
    },
    under: {
      probability: 1 - overProb,
      score: 100 - overScore,
      details: { inverse: true }
    }
  };
};

// ============================================================================
// SEZIONE 12: MODULO COMBO CROSS-MARKET
// ============================================================================

export const calculateCombos = (input: MatchInput, bookmakerOdds: Record<string, number>): Array<{ name: string; combinedProb: number; edge: number; isValue: boolean }> => {
  const score1X2 = calculate1X2(input);
  const ou25 = calculateOverUnder25(input);
  const ggNg = calculateGGNG(input);
  
  const combos: Array<{ name: string; combinedProb: number; edge: number; isValue: boolean }> = [];
  
  const homeWinOver = score1X2.home.probability * ou25.over.probability * 1.2;
  const homeWinUnder = score1X2.home.probability * ou25.under.probability * 0.9;
  const drawOver = score1X2.draw.probability * ou25.over.probability * 1.1;
  const homeWinGG = score1X2.home.probability * ggNg.gg.probability * 1.3;
  const awayWinGG = score1X2.away.probability * ggNg.gg.probability * 1.3;
  
  const comboDefs = [
    { name: '1+Over', prob: homeWinOver, key: 'COMBO_1_OVER' },
    { name: '1+Under', prob: homeWinUnder, key: 'COMBO_1_UNDER' },
    { name: 'X+Over', prob: drawOver, key: 'COMBO_X_OVER' },
    { name: '1+GG', prob: homeWinGG, key: 'COMBO_1_GG' },
    { name: '2+GG', prob: awayWinGG, key: 'COMBO_2_GG' }
  ];
  
  comboDefs.forEach(combo => {
    const odds = bookmakerOdds[combo.key];
    if (odds) {
      const edge = calculateEdge(combo.prob, odds);
      combos.push({ name: combo.name, combinedProb: combo.prob, edge, isValue: edge >= 0.05 });
    }
  });
  
  return combos.sort((a, b) => b.edge - a.edge);
};

// ============================================================================
// SEZIONE 13: PLAYER PROPS (Scorer, Assist, Cards, Shots)
// ============================================================================

export const calculateScorerScore = (player: PlayerData, opponentDefense: number, isKnockout: boolean): PlayerPropScore => {
  const xGComponent = Math.min(10, player.xG * 10);
  const convComponent = Math.min(15, player.conversionRate * 15);
  const formConvComponent = Math.min(10, (player.formGoals / 5) * 10);
  const componentA = xGComponent + convComponent + formConvComponent;
  
  const rolePoints: Record<string, number> = { 'CF': 25, 'SS': 20, 'Winger': 15, 'AM': 12, 'CM': 8, 'FB': 5 };
  const componentB = rolePoints[player.role] || 10;
  
  let componentC = 0;
  if (player.formGoals >= 3) componentC = 20;
  else if (player.formGoals === 2) componentC = 14;
  else if (player.formGoals === 1) componentC = 8;
  
  let componentD = 8;
  if (opponentDefense > 1.4) componentD = 15;
  else if (opponentDefense < 1.0) componentD = 0;
  
  let componentE = 0;
  if (player.h2hGoals >= 2) componentE = 5;
  else if (player.h2hGoals === 1) componentE = 3;
  
  const totalScore = componentA + componentB + componentC + componentD + componentE;
  
  let probability: number;
  if (totalScore >= 85) probability = 0.625;
  else if (totalScore >= 70) probability = 0.47;
  else if (totalScore >= 55) probability = 0.32;
  else probability = 0.20;
  
  if (isKnockout) probability *= 0.90;
  
  return { player, score: totalScore, probability, breakdown: { xG: componentA, role: componentB, form: componentC, matchup: componentD, h2h: componentE } };
};

export const calculateAssistScore = (player: PlayerData, targetStriker: { xG: number }, isKnockout: boolean): PlayerPropScore => {
  const xAComponent = Math.min(12, player.xA * 12);
  const keyPComponent = Math.min(13, player.keyPasses * 3);
  const formComponentA = Math.min(10, (player.formAssists / 3) * 10);
  const componentA = xAComponent + keyPComponent + formComponentA;
  
  const rolePoints: Record<string, number> = { 'AM': 30, 'Winger': 25, 'CM': 20, 'FB': 12 };
  const componentB = rolePoints[player.role] || 15;
  
  let componentC = 5;
  if (targetStriker.xG > 0.60) componentC = 20;
  else if (targetStriker.xG > 0.40) componentC = 12;
  
  let componentD = 0;
  if (player.formAssists >= 3) componentD = 15;
  else if (player.formAssists === 2) componentD = 11;
  else if (player.formAssists === 1) componentD = 6;
  
  const totalScore = componentA + componentB + componentC + componentD;
  
  let probability: number;
  if (totalScore >= 80) probability = 0.425;
  else if (totalScore >= 65) probability = 0.295;
  else if (totalScore >= 50) probability = 0.195;
  else probability = 0.10;
  
  if (isKnockout) probability *= 0.90;
  
  return { player, score: totalScore, probability, breakdown: { xA: componentA, role: componentB, target: componentC, form: componentD } };
};

export const calculateCardScore = (player: PlayerData, opponent: { dribblers: number; tackleSuccess: number }, referee: RefereeData | undefined, isDerby: boolean, highStakes: boolean): PlayerPropScore | null => {
  if (!referee) return null;
  
  let componentA = 0;
  if (player.foulsCommitted > 2.5) componentA += 15;
  if (player.cardsThisSeason / 20 > 0.25) componentA += 10;
  
  let componentB = 0;
  if (opponent.dribblers > 3) componentB += 15;
  if (opponent.tackleSuccess < 0.50) componentB += 10;
  if (['CM', 'FB'].includes(player.role)) componentB += 5;
  
  let componentC = 0;
  if (referee.avgCards > 4.5) componentC += 15;
  if (referee.strictness === 'strict') componentC += 5;
  
  let componentD = 0;
  if (isDerby) componentD += 10;
  if (highStakes) componentD += 5;
  
  const totalScore = componentA + componentB + componentC + componentD;
  
  let probability: number;
  if (totalScore >= 90) probability = 0.50;
  else if (totalScore >= 75) probability = 0.395;
  else if (totalScore >= 60) probability = 0.295;
  else probability = 0.20;
  
  return { player, score: totalScore, probability, breakdown: { profile: componentA, mismatch: componentB, referee: componentC, context: componentD } };
};

export const calculateShotsScore = (team: TeamData, opponent: TeamData, isKnockout: boolean): MarketScore => {
  const sotComponent = Math.min(30, (team.avgShotsOnTarget / 7) * 30);
  
  let oppDefenseComponent = 15;
  if (opponent.avgShotsOnTarget > 6) oppDefenseComponent = 25;
  else if (opponent.avgShotsOnTarget < 4) oppDefenseComponent = 5;
  
  const shotsComponent = Math.min(25, (team.avgShots / 16) * 25);
  
  const stylePoints = { attacking: 20, balanced: 12, defensive: 5 };
  const styleComponent = stylePoints[team.style];
  
  const totalScore = sotComponent + oppDefenseComponent + shotsComponent + styleComponent;
  
  let probability: number;
  if (totalScore >= 80) probability = 0.70;
  else if (totalScore >= 65) probability = 0.57;
  else if (totalScore >= 50) probability = 0.42;
  else probability = 0.30;
  
  if (isKnockout) probability *= 0.90;
  
  return { probability, score: totalScore, details: { sot: sotComponent, oppDefense: oppDefenseComponent, shots: shotsComponent, style: styleComponent } };
};

export const calculateFoulsScore = (team: TeamData, opponent: TeamData, referee: RefereeData | undefined, isCL: boolean, opponentStyle: 'technical' | 'normal' | 'static'): MarketScore | null => {
  if (!referee) return null;
  
  const refAvg = PATCHES.P2_FOULS.applyRefAvg(referee.avgFouls, isCL);
  
  const profileComponent = Math.min(30, (team.avgFouls / 16) * 30);
  
  let refComponent = 25;
  if (refAvg > 28) refComponent = 35;
  else if (refAvg < 24) refComponent = 10;
  
  const stylePoints = { attacking: 20, balanced: 12, defensive: 5 };
  const styleComponent = stylePoints[team.style];
  
  const matchupPoints = { technical: 15, normal: 8, static: 3 };
  const matchupComponent = matchupPoints[opponentStyle];
  
  const totalScore = profileComponent + refComponent + styleComponent + matchupComponent;
  
  let probability: number;
  if (totalScore >= 80) probability = 0.70;
  else if (totalScore >= 65) probability = 0.57;
  else if (totalScore >= 50) probability = 0.42;
  else probability = 0.30;
  
  return { probability, score: totalScore, details: { profile: profileComponent, referee: refComponent, style: styleComponent, matchup: matchupComponent, patchP2Applied: isCL } };
};

// ============================================================================
// SEZIONE 14: FUNZIONE PRINCIPALE calculateGEM
// ============================================================================

export const calculateGEM = (input: MatchInput, bookmakerOdds: Record<string, number>, cornerData?: { home: CornerData; away: CornerData }): GEMOutput => {
  const patchesApplied: string[] = [];
  if (input.isKnockout) patchesApplied.push('P1_KNOCKOUT');
  
  const isCL = input.competition.includes('Champions League') || input.competition.includes('Europa League');
  if (isCL) patchesApplied.push('P2_FOULS', 'P4_CORNERS');
  
  const markets1X2 = calculate1X2(input);
  const overUnder = calculateOverUnder25(input);
  const ggNg = calculateGGNG(input);
  const fhOver = calculateFirstHalfOver15(input);
  const exactResult = calculateExactResult(input);
  const handicap = calculateHandicap(input);
  const cleanSheetHome = calculateCleanSheet(input.homeTeam, input.awayTeam, input.isKnockout);
  const cleanSheetAway = calculateCleanSheet(input.awayTeam, input.homeTeam, input.isKnockout);
  
  let corners;
  if (cornerData) {
    corners = calculateCornersScore({ ...input.homeTeam, ...cornerData.home }, { ...input.awayTeam, ...cornerData.away }, isCL, input.isKnockout);
  }
  
  const playerProps = { scorers: [], assists: [], cards: [], shots: [] };
  
  const addEdge = (market: MarketScore, oddsKey: string, marketType: string = 'default') => {
    const odds = bookmakerOdds[oddsKey];
    if (odds) {
      market.edge = calculateEdge(market.probability, odds);
      market.isValue = isValueBet(market.edge, marketType);
    }
    return market;
  };
  
  addEdge(markets1X2.home, '1X2_HOME', '1X2');
  addEdge(markets1X2.draw, '1X2_DRAW', '1X2');
  addEdge(markets1X2.away, '1X2_AWAY', '1X2');
  addEdge(overUnder.over, 'O25', 'overUnder');
  addEdge(overUnder.under, 'U25', 'overUnder');
  addEdge(ggNg.gg, 'GG', 'ggNg');
  addEdge(ggNg.ng, 'NG', 'ggNg');
  addEdge(handicap.homeMinus1, 'AH1_-1', 'handicap');
  addEdge(handicap.awayPlus1, 'AH2_+1', 'handicap');
  addEdge(cleanSheetHome, 'CS_HOME', 'cleanSheet');
  addEdge(cleanSheetAway, 'CS_AWAY', 'cleanSheet');
  if (corners) addEdge(corners.over, 'CO_OVER', 'corners');
  
  const combos = calculateCombos(input, bookmakerOdds);
  
  const valueBets: GEMOutput['valueBets'] = [];
  const checkValue = (market: MarketScore, name: string, selection: string) => {
    if (market.isValue && market.edge !== undefined) {
      valueBets.push({ market: name, selection, probability: market.probability, odds: bookmakerOdds[`${name}_${selection}`] || 0, edge: market.edge });
    }
  };
  
  checkValue(markets1X2.home, '1X2', 'HOME');
  checkValue(markets1X2.draw, '1X2', 'DRAW');
  checkValue(markets1X2.away, '1X2', 'AWAY');
  checkValue(overUnder.over, 'O/U 2.5', 'OVER');
  checkValue(ggNg.gg, 'GG/NG', 'GG');
  checkValue(handicap.homeMinus1, 'AH -1', 'HOME');
  checkValue(handicap.awayPlus1, 'AH +1', 'AWAY');
  if (corners) checkValue(corners.over, 'Corners', 'OVER');
  
  combos.filter(c => c.isValue).forEach(combo => {
    valueBets.push({ market: `COMBO ${combo.name}`, selection: combo.name, probability: combo.combinedProb, odds: bookmakerOdds[`COMBO_${combo.name}`] || 0, edge: combo.edge });
  });
  
  valueBets.sort((a, b) => {
    const priorityA = PATCHES.P3_HIERARCHY.getPriority(a.market.split(' ')[0]);
    const priorityB = PATCHES.P3_HIERARCHY.getPriority(b.market.split(' ')[0]);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return b.edge - a.edge;
  });
  
  const top5ValueBets = valueBets.filter(vb => !vb.market.includes('Fouls')).slice(0, 5);
  
  if (isCL && input.isKnockout && corners?.over.isValue) {
    const cornerBet = valueBets.find(vb => vb.market === 'Corners');
    if (cornerBet && !top5ValueBets.includes(cornerBet)) {
      top5ValueBets.pop();
      top5ValueBets.push(cornerBet);
      top5ValueBets.sort((a, b) => b.edge - a.edge);
    }
  }
  
  const topPick = top5ValueBets[0] || { market: 'N/A', selection: 'N/A', probability: 0, edge: 0 };
  
  return {
    matchId: `${input.homeTeam.name}-${input.awayTeam.name}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    patchesApplied,
    markets: { '1X2': markets1X2, overUnder25: overUnder, ggNg: ggNg, firstHalfOver15: fhOver, exactResult, handicap, cleanSheet: { home: cleanSheetHome, away: cleanSheetAway }, corners, playerProps },
    topPick: { market: topPick.market, selection: topPick.selection, probability: topPick.probability, edge: topPick.edge },
    valueBets: top5ValueBets,
    combos: combos.slice(0, 3)
  };
};

export default calculateGEM;