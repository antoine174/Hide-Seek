import React, { useState } from 'react';
import axios from 'axios';
import Board from './components/Board';
import Dashboard from './components/Dashboard';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [gameState, setGameState] = useState('start'); // 'start' or 'playing'
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(4);
  
  const [world, setWorld] = useState([]);
  const [humanRole, setHumanRole] = useState('Seeker');
  const [computerProbs, setComputerProbs] = useState([]);
  
  const [humanScore, setHumanScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  
  const [humanWins, setHumanWins] = useState(0);
  const [computerWins, setComputerWins] = useState(0);
  
  const [humanMove, setHumanMove] = useState(null);
  const [computerMove, setComputerMove] = useState(null);
  
  const [simulationStats, setSimulationStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/init`, {
        rows: parseInt(rows),
        cols: parseInt(cols),
        human_role: humanRole
      });
      setWorld(res.data.world);
      setComputerProbs(res.data.computer_probs);
      setHumanScore(0);
      setComputerScore(0);
      setHumanWins(0);
      setComputerWins(0);
      setHumanMove(null);
      setComputerMove(null);
      setSimulationStats(null);
      setGameState('playing');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceClick = async (row, col) => {
    if (loading || world.length === 0) return;
    try {
      const res = await axios.post(`${API_BASE}/play`, {
        human_move: { row, col },
        human_role: humanRole,
        world: world
      });
      
      setHumanMove({ row, col });
      setComputerMove(res.data.computer_move);
      setHumanScore(prev => prev + res.data.human_score_delta);
      setComputerScore(prev => prev + res.data.computer_score_delta);
      
      if (res.data.human_score_delta > res.data.computer_score_delta) {
        setHumanWins(prev => prev + 1);
      } else if (res.data.computer_score_delta > res.data.human_score_delta) {
        setComputerWins(prev => prev + 1);
      }

      setComputerProbs(res.data.computer_probs);
      setSimulationStats(null); 
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulate = async () => {
    if (loading || world.length === 0) return;
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/simulate`, {
        world: world,
        human_role: humanRole,
        rounds: 100
      });
      
      setHumanScore(prev => prev + res.data.human_score);
      setComputerScore(prev => prev + res.data.computer_score);
      setSimulationStats({
        human_wins: res.data.human_wins,
        computer_wins: res.data.computer_wins,
        draws: res.data.draws
      });
      setHumanMove(null);
      setComputerMove(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (gameState === 'start') {
    return (
      <div 
        className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center font-sans selection:bg-blue-500/30 relative overflow-hidden animated-bg"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.95)), url("/asgard.png")',
        }}
      >
        <div className="absolute inset-0 lightning-flash z-0"></div>

        <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_0_50px_rgba(56,189,248,0.2)] border border-slate-700/50 z-10">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black bg-gradient-to-br from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-2xl mb-2">
              RAGNAROK
            </h1>
            <p className="text-slate-300 font-bold tracking-[0.3em] uppercase text-xs">Hide & Seek</p>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest text-center">Select Your Champion</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setHumanRole('Seeker')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${humanRole === 'Seeker' ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_20px_rgba(56,189,248,0.4)] scale-105' : 'border-slate-700/50 hover:border-slate-500 bg-slate-800/50'}`}
                >
                  <img src="/thor.png" className="w-16 h-16 rounded-full mb-3 border-2 border-slate-700 shadow-lg" alt="Thor" />
                  <span className={`font-bold text-sm ${humanRole === 'Seeker' ? 'text-blue-400' : 'text-slate-400'}`}>Thor (Seeker)</span>
                </button>
                <button 
                  onClick={() => setHumanRole('Hider')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${humanRole === 'Hider' ? 'border-emerald-500 bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105' : 'border-slate-700/50 hover:border-slate-500 bg-slate-800/50'}`}
                >
                  <img src="/loki.png" className="w-16 h-16 rounded-full mb-3 border-2 border-slate-700 shadow-lg" alt="Loki" />
                  <span className={`font-bold text-sm ${humanRole === 'Hider' ? 'text-emerald-400' : 'text-slate-400'}`}>Loki (Hider)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest text-center">Rows</label>
                <input 
                  type="number" 
                  min="1" max="8"
                  value={rows}
                  onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900/80 border border-slate-600 rounded-xl px-4 py-2 text-xl font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center text-white"
                />
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest text-center">Columns</label>
                <input 
                  type="number" 
                  min="2" max="12"
                  value={cols}
                  onChange={(e) => setCols(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-full bg-slate-900/80 border border-slate-600 rounded-xl px-4 py-2 text-xl font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center text-white"
                />
              </div>
            </div>

            <button 
              onClick={startGame}
              disabled={loading}
              className="w-full mt-4 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-lg font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:shadow-[0_0_40px_rgba(79,70,229,0.7)] uppercase tracking-[0.2em] transform hover:-translate-y-1 active:scale-95 z-10 relative"
            >
              {loading ? 'Forging Matrix...' : 'Enter the Grid'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30 relative overflow-hidden animated-bg"
      style={{
        backgroundImage: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.95)), url("/asgard.png")',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 lightning-flash z-0"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-slate-700/50 pb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setGameState('start')}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors"
              title="Back to Start"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-md">
                RAGNAROK
              </h1>
              <p className="text-slate-400 mt-1 font-semibold text-xs tracking-widest uppercase">Grid Engaged</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur p-2 rounded-xl border border-slate-600 shadow-lg">
            <span className="text-xs font-bold text-slate-400 pl-2 uppercase tracking-wider">Role:</span>
            <div className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-1.5 text-sm font-bold text-white flex items-center gap-2">
              <img src={humanRole === 'Seeker' ? '/thor.png' : '/loki.png'} className="w-5 h-5 rounded-full" />
              {humanRole === 'Seeker' ? 'Thor' : 'Loki'}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <Board 
              world={world} 
              onPlaceClick={handlePlaceClick}
              humanMove={humanMove}
              computerMove={computerMove}
              isHumanSeeker={humanRole === 'Seeker'}
            />
          </div>
          
          <Dashboard 
            humanScore={humanScore}
            computerScore={computerScore}
            humanWins={humanWins}
            computerWins={computerWins}
            probabilities={computerProbs}
            onReset={() => {
              // Quick reset with same config
              setLoading(true);
              axios.post(`${API_BASE}/init`, {
                rows: parseInt(rows),
                cols: parseInt(cols),
                human_role: humanRole
              }).then(res => {
                setWorld(res.data.world);
                setComputerProbs(res.data.computer_probs);
                setHumanScore(0);
                setComputerScore(0);
                setHumanWins(0);
                setComputerWins(0);
                setHumanMove(null);
                setComputerMove(null);
                setSimulationStats(null);
                setLoading(false);
              }).catch(err => {
                console.error(err);
                setLoading(false);
              });
            }}
            onSimulate={handleSimulate}
            onGoBack={() => setGameState('start')}
            simulationStats={simulationStats}
            humanRole={humanRole}
          />
        </div>
      </div>
    </div>
  );
}

export default App;