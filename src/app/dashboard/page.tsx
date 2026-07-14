// /app/dashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { 
  calculateGEM, 
  MatchInput, 
  GEMOutput
} from '@/lib/engine/gem-calculator';

// ============================================================================
// DATI MOCK - Benfica vs Real Madrid UCL Playoff
// ============================================================================

const MOCK_MATCH: MatchInput = {
  homeTeam: {
    name: 'Benfica',
    xG: 1.4,
    xGA: 1.2,
    form: {
      matches: 5,
      wins: 2,
      draws: 1,
      losses: 2,
      goalsScored: 6,
      goalsConceded: 7,
      firstHalfGoals: 2,
      bothTeamsScored: 3,
      cleanSheets: 1
    },
    formationStatus: 'probable',
    injuries: ['Otamendi', 'Bah'],
    style: 'attacking',
    avgShots: 12,
    avgShotsOnTarget: 4.5,
    avgFouls: 13,
    avgCards: 2.1
  },
  awayTeam: {
    name: 'Real Madrid',
    xG: 1.9,
    xGA: 0.7,
    form: {
      matches: 5,
      wins: 4,
      draws: 1,
      losses: 0,
      goalsScored: 12,
      goalsConceded: 3,
      firstHalfGoals: 5,
      bothTeamsScored: 2,
      cleanSheets: 3
    },
    formationStatus: 'official',
    injuries: [],
    style: 'balanced',
    avgShots: 14,
    avgShotsOnTarget: 5.2,
    avgFouls: 10,
    avgCards: 1.4
  },
  h2h: {
    matches: [
      { date: '2024-03', homeGoals: 0, awayGoals: 2, firstHalfGoals: 1 },
      { date: '2023-10', homeGoals: 1, awayGoals: 1, firstHalfGoals: 0 },
      { date: '2022-10', homeGoals: 1, awayGoals: 3, firstHalfGoals: 2 }
    ],
    avgGoals: 2.3,
    bothTeamsScoredPct: 0.67,
    over25Pct: 0.67,
    firstHalfOver15Pct: 0.45
  },
  referee: {
    name: 'François Letexier',
    avgCards: 4.2,
    avgFouls: 26,
    strictness: 'strict'
  },
  isKnockout: true,
  competition: 'UEFA Champions League - Playoff',
  stakes: { homeNeedWin: true, awayNeedWin: false }
};

const MOCK_ODDS: Record<string, number> = {
  '1X2_HOME': 2.80,
  '1X2_DRAW': 3.20,
  '1X2_AWAY': 2.40,
  'O25': 1.90,
  'U25': 1.95,
  'GG': 1.75,
  'NG': 2.05,
  'AH1_-1': 4.50,
  'AH2_+1': 1.60,
  'CS_HOME': 3.40,
  'CS_AWAY': 2.20,
  'CO_OVER': 1.85
};

const CORNER_DATA = {
  home: { avgCornersFor: 5.2, avgCornersAgainst: 4.8, homeAdvantage: 1.15 },
  away: { avgCornersFor: 5.8, avgCornersAgainst: 4.2, homeAdvantage: 1.0 }
};

// ============================================================================
// COMPONENTI UI
// ============================================================================

const Badge = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span className={`px-2 py-1 rounded text-xs font-bold ${color}`}>
    {children}
  </span>
);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${className}`}>
    {children}
  </div>
);

const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <div className="w-full bg-gray-700 rounded-full h-2">
    <div 
      className={`h-2 rounded-full ${color}`} 
      style={{ width: `${Math.min(100, value)}%` }}
    />
  </div>
);

// ============================================================================
// PAGINA PRINCIPALE
// ============================================================================

export default function DashboardPage() {
  // 🔧 FIX HYDRATION: Stato iniziale null, calcolo in useEffect
  const [result, setResult] = useState<GEMOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calcolo eseguito SOLO client-side dopo il mount
    const analysis = calculateGEM(MOCK_MATCH, MOCK_ODDS, CORNER_DATA);
    setResult(analysis);
    setLoading(false);
  }, []); // [] = esegui solo al mount

  // Helper per colori edge
  const getEdgeColor = (edge: number) => {
    if (edge >= 0.08) return 'bg-green-500 text-white';
    if (edge >= 0.05) return 'bg-yellow-500 text-black';
    return 'bg-gray-600 text-gray-300';
  };

  // Loading state
  if (loading || !result) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Calcolo analisi GEM in corso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div>
            <h1 className="text-3xl font-bold">
              {MOCK_MATCH.homeTeam.name} vs {MOCK_MATCH.awayTeam.name}
            </h1>
            <p className="text-gray-400 mt-1">
              {MOCK_MATCH.competition} • Knockout Phase
            </p>
            <div className="flex gap-2 mt-3 text-sm">
              <span className="text-orange-400">
                ⚠️ Formazioni: {MOCK_MATCH.homeTeam.formationStatus} / {MOCK_MATCH.awayTeam.formationStatus}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {result.patchesApplied.map(patch => (
              <Badge key={patch} color={
                patch === 'P1_KNOCKOUT' ? 'bg-red-600 text-white' :
                patch === 'P2_FOULS' ? 'bg-orange-600 text-white' :
                patch === 'P4_CORNERS' ? 'bg-blue-600 text-white' :
                'bg-purple-600 text-white'
              }>
                {patch.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* TOP PICK */}
        {result.topPick.market !== 'N/A' && (
          <Card className="border-2 border-green-500 bg-gradient-to-r from-green-900/50 to-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-bold uppercase tracking-wider">🏆 TOP PICK</p>
                <h2 className="text-4xl font-bold mt-2">{result.topPick.selection}</h2>
                <p className="text-xl text-gray-300 mt-1">{result.topPick.market}</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-green-400">
                  +{Math.round(result.topPick.edge * 100)}%
                </div>
                <div className="text-gray-400 mt-1">Edge</div>
                <div className="text-2xl font-semibold mt-2">
                  {Math.round(result.topPick.probability * 100)}%
                </div>
                <div className="text-gray-400 text-sm">Probabilità</div>
              </div>
            </div>
          </Card>
        )}

        {/* VALUE BETS */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            💎 VALUE BETS (Edge ≥+5%)
            <span className="text-sm font-normal text-gray-400">Top 5 per gerarchia GEM</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.valueBets.map((bet) => (
              <Card 
                key={`${bet.market}-${bet.selection}`}
                className={`border-l-4 ${bet.edge >= 0.08 ? 'border-l-green-500' : 'border-l-yellow-500'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm">{bet.market}</p>
                    <p className="text-xl font-bold">{bet.selection}</p>
                  </div>
                  <Badge color={getEdgeColor(bet.edge)}>
                    +{Math.round(bet.edge * 100)}%
                  </Badge>
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-gray-400">Prob: {Math.round(bet.probability * 100)}%</span>
                  <span className="text-gray-400">Quota: {bet.odds.toFixed(2)}</span>
                </div>
                <ProgressBar 
                  value={bet.probability * 100} 
                  color={bet.edge >= 0.08 ? 'bg-green-500' : 'bg-yellow-500'} 
                />
              </Card>
            ))}
            {result.valueBets.length === 0 && (
              <p className="text-gray-500 col-span-3">Nessun value bet rilevato</p>
            )}
          </div>
        </div>

        {/* MERCATI BASE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 1X2 */}
          <Card>
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">1X2</h3>
            <div className="space-y-3">
              {[
                { label: MOCK_MATCH.homeTeam.name, ...result.markets['1X2'].home, key: '1X2_HOME' },
                { label: 'Pareggio', ...result.markets['1X2'].draw, key: '1X2_DRAW' },
                { label: MOCK_MATCH.awayTeam.name, ...result.markets['1X2'].away, key: '1X2_AWAY' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-2 rounded bg-gray-700/50">
                  <span className="font-medium">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">{Math.round(item.probability * 100)}%</span>
                    <span className="text-gray-500 text-sm">@{MOCK_ODDS[item.key]?.toFixed(2)}</span>
                    {item.isValue ? (
                      <Badge color={item.edge && item.edge >= 0.08 ? 'bg-green-500' : 'bg-yellow-500'}>
                        +{Math.round((item.edge || 0) * 100)}%
                      </Badge>
                    ) : (
                      <span className="text-gray-600 text-sm">--</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Over/Under 2.5 */}
          <Card>
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Over/Under 2.5</h3>
            <div className="space-y-3">
              {[
                { label: 'Over 2.5', ...result.markets.overUnder25.over, key: 'O25' },
                { label: 'Under 2.5', ...result.markets.overUnder25.under, key: 'U25' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded bg-gray-700/50">
                  <span className="font-medium">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold">{Math.round(item.probability * 100)}%</div>
                      <div className="text-xs text-gray-400">Score: {Math.round(item.score)}/100</div>
                    </div>
                    <span className="text-gray-500">@{MOCK_ODDS[item.key]?.toFixed(2)}</span>
                    {item.isValue && (
                      <Badge color="bg-green-500">+{Math.round((item.edge || 0) * 100)}%</Badge>
                    )}
                  </div>
                </div>
              ))}
              {result.patchesApplied.includes('P1_KNOCKOUT') && (
                <p className="text-xs text-orange-400 mt-2">⚠️ Patch P1: xG corretto ×0.80</p>
              )}
            </div>
          </Card>

          {/* GG/NG */}
          <Card>
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">GG/NG</h3>
            <div className="space-y-3">
              {[
                { label: 'Goal Goal', ...result.markets.ggNg.gg, key: 'GG' },
                { label: 'No Goal', ...result.markets.ggNg.ng, key: 'NG' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded bg-gray-700/50">
                  <span className="font-medium">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{Math.round(item.probability * 100)}%</span>
                    <span className="text-gray-500">@{MOCK_ODDS[item.key]?.toFixed(2)}</span>
                    {item.isValue && (
                      <Badge color="bg-green-500">+{Math.round((item.edge || 0) * 100)}%</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RISULTATO ESATTO */}
        <Card>
          <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">🎯 Risultato Esatto (Top 5)</h3>
          <div className="space-y-3">
            {result.markets.exactResult.map((res, idx) => (
              <div key={res.result} className="flex items-center gap-4">
                <span className="w-12 text-center font-bold text-xl">{res.result}</span>
                <div className="flex-1">
                  <ProgressBar 
                    value={res.probability * 100} 
                    color={idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-blue-500' : 'bg-gray-500'} 
                  />
                </div>
                <span className="w-16 text-right font-mono">{(res.probability * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* HANDICAP & CLEAN SHEET */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Handicap Asiatico</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-700/50 rounded">
                <span>{MOCK_MATCH.homeTeam.name} -1</span>
                <div className="flex gap-3">
                  <span>{Math.round(result.markets.handicap.homeMinus1.probability * 100)}%</span>
                  <span className="text-gray-500">@{MOCK_ODDS['AH1_-1']?.toFixed(2)}</span>
                  {result.markets.handicap.homeMinus1.isValue && (
                    <Badge color="bg-green-500">+{Math.round((result.markets.handicap.homeMinus1.edge || 0) * 100)}%</Badge>
                  )}
                </div>
              </div>
              <div className="flex justify-between p-3 bg-gray-700/50 rounded">
                <span>{MOCK_MATCH.awayTeam.name} +1</span>
                <div className="flex gap-3">
                  <span>{Math.round(result.markets.handicap.awayPlus1.probability * 100)}%</span>
                  <span className="text-gray-500">@{MOCK_ODDS['AH2_+1']?.toFixed(2)}</span>
                  {result.markets.handicap.awayPlus1.isValue && (
                    <Badge color="bg-green-500">+{Math.round((result.markets.handicap.awayPlus1.edge || 0) * 100)}%</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Clean Sheet</h3>
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-700/50 rounded">
                <span>{MOCK_MATCH.homeTeam.name}</span>
                <div className="flex gap-3">
                  <span>{Math.round(result.markets.cleanSheet.home.probability * 100)}%</span>
                  <span className="text-gray-500">@{MOCK_ODDS['CS_HOME']?.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between p-3 bg-gray-700/50 rounded">
                <span>{MOCK_MATCH.awayTeam.name}</span>
                <div className="flex gap-3">
                  <span>{Math.round(result.markets.cleanSheet.away.probability * 100)}%</span>
                  <span className="text-gray-500">@{MOCK_ODDS['CS_AWAY']?.toFixed(2)}</span>
                  {result.markets.cleanSheet.away.isValue && (
                    <Badge color="bg-green-500">+{Math.round((result.markets.cleanSheet.away.edge || 0) * 100)}%</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* PLAYER PROPS PLACEHOLDER */}
        <Card className="border-dashed border-2 border-gray-600">
          <h3 className="text-lg font-bold mb-4 text-gray-400">👤 Player Props (Placeholder)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-gray-500">
            <div className="p-4 bg-gray-800/50 rounded">
              <p className="font-medium">Marcatori</p>
              <p className="text-sm mt-1">Richiede dati giocatori</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded">
              <p className="font-medium">Assist</p>
              <p className="text-sm mt-1">Richiede dati giocatori</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded">
              <p className="font-medium">Ammoniti</p>
              <p className="text-sm mt-1">Arbitro: {MOCK_MATCH.referee?.name}</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded">
              <p className="font-medium">Tiri</p>
              <p className="text-sm mt-1">Richiede dati giocatori</p>
            </div>
          </div>
        </Card>

        {/* DEBUG INFO */}
        <details className="text-sm text-gray-500">
          <summary className="cursor-pointer hover:text-gray-300">Debug: Raw Data</summary>
          <pre className="mt-2 p-4 bg-gray-950 rounded overflow-auto text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>

      </div>
    </div>
  );
}