import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const typeColors = {
  Hard: 'bg-red-500/10 border-red-500/50 hover:border-red-400',
  Neutral: 'bg-amber-500/10 border-amber-500/50 hover:border-amber-400',
  Easy: 'bg-emerald-500/10 border-emerald-500/50 hover:border-emerald-400',
};

const Board = ({ world, onPlaceClick, humanMove, computerMove, isHumanSeeker }) => {
  const numCols = world[0]?.length || 4;

  return (
    <div 
      className="grid gap-3 sm:gap-4 p-4 sm:p-6 bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-600/50"
      style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}
    >
      {world.map((row, rIndex) => (
        row.map((placeType, cIndex) => {
          const isHumanHere = humanMove?.row === rIndex && humanMove?.col === cIndex;
          const isComputerHere = computerMove?.row === rIndex && computerMove?.col === cIndex;

          const seekerHere = isHumanSeeker ? isHumanHere : isComputerHere;
          const hiderHere = !isHumanSeeker ? isHumanHere : isComputerHere;

          const shouldShake = seekerHere;
          const bothHere = isHumanHere && isComputerHere; // This means Seeker found Hider

          return (
            <motion.div
              key={`${rIndex}-${cIndex}`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPlaceClick(rIndex, cIndex)}
              animate={shouldShake ? {
                x: [0, -8, 8, -8, 8, 0],
                transition: { duration: 0.3 }
              } : {}}
              className={`
                relative h-20 sm:h-28 lg:h-32 rounded-xl border-2 flex items-center justify-center cursor-pointer
                transition-colors duration-300 overflow-visible shadow-inner
                ${typeColors[placeType]}
                ${bothHere ? 'ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.8)]' : ''}
              `}
            >
              <div className="absolute top-2 left-2 text-[10px] sm:text-xs font-bold opacity-60 uppercase tracking-widest z-10">
                {placeType}
              </div>

              <div className="flex gap-1 sm:gap-2 z-10 relative items-center justify-center h-full w-full">
                <AnimatePresence>
                  {seekerHere && (
                    <motion.div
                      key="hammer"
                      initial={{ scale: 5, y: -200, opacity: 0, rotate: -45 }}
                      animate={{ scale: 1.5, y: 0, opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="absolute z-30 pointer-events-none"
                    >
                      <img src="/hammer.png" alt="Thor Hammer" className="w-20 h-20 sm:w-28 sm:h-28 drop-shadow-[0_0_25px_rgba(56,189,248,1)] object-contain" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <AnimatePresence>
                  {bothHere && (
                    <motion.div
                      key="explosion"
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: [0, 2.5, 1], opacity: [1, 1, 0] }}
                      transition={{ duration: 1, ease: "easeOut", times: [0, 0.4, 1] }}
                      className="absolute z-40 text-6xl pointer-events-none drop-shadow-2xl flex items-center justify-center"
                    >
                      <span className="text-7xl">⚡</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {seekerHere && (
                    <motion.div
                      key="thor"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.15, type: "spring" }}
                      className="rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)] overflow-hidden border-2 border-blue-400 w-10 h-10 sm:w-14 sm:h-14 z-20 bg-slate-900"
                      title="Thor (Seeker)"
                    >
                      <img src="/thor.png" alt="Thor" className="w-full h-full object-cover" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {hiderHere && (
                    <motion.div
                      key="loki"
                      initial={{ scale: 0, opacity: 0, rotate: 180 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ type: "spring" }}
                      className="rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] overflow-hidden border-2 border-emerald-400 w-10 h-10 sm:w-14 sm:h-14 z-10 bg-slate-900"
                      title="Loki (Hider)"
                    >
                      <img src="/loki.png" alt="Loki" className="w-full h-full object-cover" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })
      ))}
    </div>
  );
};

export default Board;