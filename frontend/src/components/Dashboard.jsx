import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = ({ 
  humanScore, 
  computerScore, 
  humanWins,
  computerWins,
  probabilities, 
  onReset, 
  onSimulate, 
  onGoBack,
  simulationStats,
  humanRole
}) => {
  const chartData = probabilities.map((p, i) => ({
    name: `P${i}`,
    probability: p
  }));

  const compRole = humanRole === 'Seeker' ? 'Loki (Hider)' : 'Thor (Seeker)';
  const hRole = humanRole === 'Seeker' ? 'Thor (Seeker)' : 'Loki (Hider)';

  return (
    <div className="flex flex-col gap-6 bg-slate-800 p-6 rounded-xl border border-slate-700 w-full lg:w-96 shadow-2xl relative z-10">
      
      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-center shadow-inner relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 opacity-50"></div>
          <h3 className="text-sm text-slate-400 font-semibold mb-1 uppercase tracking-wider">You ({hRole})</h3>
          <p className="text-xs font-medium text-slate-300 mb-1">Wins: <span className="text-emerald-400 font-bold">{humanWins}</span></p>
          <p className="text-3xl font-bold text-blue-400">{humanScore.toFixed(1)}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-center shadow-inner relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500 opacity-50"></div>
          <h3 className="text-sm text-slate-400 font-semibold mb-1 uppercase tracking-wider">AI ({compRole})</h3>
          <p className="text-xs font-medium text-slate-300 mb-1">Wins: <span className="text-emerald-400 font-bold">{computerWins}</span></p>
          <p className="text-3xl font-bold text-red-400">{computerScore.toFixed(1)}</p>
        </div>
      </div>

      {/* Probabilities Chart */}
      <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 h-64 shadow-inner">
        <h3 className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-widest text-center">Simplex AI Strategy</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 10}} />
            <YAxis tick={{fill: '#64748b', fontSize: 10}} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
              formatter={(value) => value.toFixed(3)}
              cursor={{fill: '#1e293b'}}
            />
            <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.probability > 0.05 ? '#818cf8' : '#334155'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Simulation Stats */}
      {simulationStats && (
        <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 p-4 rounded-lg border border-emerald-500/30 shadow-inner">
          <h3 className="text-xs text-emerald-400 font-bold mb-3 uppercase tracking-widest text-center border-b border-emerald-500/20 pb-2">100-Round Sim Results</h3>
          <div className="text-sm text-slate-300 flex justify-between mb-1.5 font-medium">
            <span>Human Wins:</span> <span className="text-emerald-300 font-bold">{simulationStats.human_wins}</span>
          </div>
          <div className="text-sm text-slate-300 flex justify-between mb-1.5 font-medium">
            <span>AI Wins:</span> <span className="text-red-400 font-bold">{simulationStats.computer_wins}</span>
          </div>
          <div className="text-sm text-slate-300 flex justify-between font-medium">
            <span>Draws:</span> <span className="text-amber-400 font-bold">{simulationStats.draws}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-700/50">
        <button 
          onClick={onSimulate}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wider uppercase text-sm rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
        >
          Simulate 100 Rounds
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={onReset}
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-colors shadow-md"
          >
            Reset Game
          </button>
          <button 
            onClick={onGoBack}
            className="w-full py-3 px-4 border border-slate-600 hover:bg-slate-800 text-slate-300 font-bold uppercase tracking-wider text-xs rounded-lg transition-colors shadow-md"
          >
            Change Map
          </button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
