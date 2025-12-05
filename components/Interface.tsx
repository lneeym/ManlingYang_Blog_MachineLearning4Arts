import React from 'react';
import { PlantState, GestureType, PlantSpecies } from '../types';

interface InterfaceProps {
  state: PlantState;
  gesture: GestureType;
  advice: string;
  loadingGemini: boolean;
  species: PlantSpecies;
  onHelp: () => void;
  onNextSpecies: () => void;
  onPrevSpecies: () => void;
  onNextDay: () => void;
}

const ProgressBar: React.FC<{ label: string; value: number; target: number; tolerance: number; color: string; showTarget?: boolean }> = ({ label, value, target, tolerance, color, showTarget = true }) => {
  const minGood = Math.max(0, target - tolerance);
  const maxGood = Math.min(100, target + tolerance);
  
  return (
    <div className="mb-3 group">
      <div className="flex justify-between text-[10px] text-gray-400 mb-1 uppercase tracking-widest font-mono group-hover:text-white transition-colors">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-800/50 rounded-full overflow-hidden border border-white/5 relative backdrop-blur-sm">
        {/* Ideal Zone Marker */}
        {showTarget && (
          <div 
            className="absolute top-0 bottom-0 bg-white/20" 
            style={{ left: `${minGood}%`, width: `${maxGood - minGood}%` }} 
          />
        )}
        <div 
          className={`h-full transition-all duration-700 ease-out ${color} shadow-[0_0_8px_currentColor]`} 
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-black/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl ${className}`}>
    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-2">{title}</h3>
    {children}
  </div>
);

export const Interface: React.FC<InterfaceProps> = ({ state, gesture, advice, loadingGemini, species, onHelp, onNextSpecies, onPrevSpecies, onNextDay }) => {
  return (
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none overflow-hidden">
      
      {/* --- TOP HEADER --- */}
      <header className="pt-8 pb-16 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-auto flex flex-col items-center z-10">
        <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-[0.4em] font-mono blur-[0.5px]">AETHER FLORA</h1>
            <div className="absolute -bottom-2 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>
        </div>
        
        <div className="mt-6 flex items-center space-x-6 bg-black/40 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 hover:border-green-500/30 transition-colors shadow-lg">
          <button onClick={onPrevSpecies} className="text-gray-500 hover:text-white transition-colors text-xl font-mono hover:scale-125 transform duration-200">
            &lt;
          </button>
          
          <div className="text-center w-48">
             <div className="text-xs text-green-400 font-mono tracking-widest uppercase mb-1">Subject No. {species.id.toUpperCase().slice(0,3)}</div>
             <div className="text-white font-bold tracking-wider text-lg">{species.name}</div>
          </div>

          <button onClick={onNextSpecies} className="text-gray-500 hover:text-white transition-colors text-xl font-mono hover:scale-125 transform duration-200">
            &gt;
          </button>
        </div>
        
        <div className="mt-2 text-[10px] text-gray-400 font-mono tracking-wider max-w-md text-center opacity-70">
            {species.description}
        </div>
      </header>


      {/* --- BOTTOM DASHBOARD --- */}
      <footer className="p-6 md:p-10 flex flex-col md:flex-row items-end justify-between gap-6 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-auto">
        
        {/* LEFT: SENSORS & GUIDE */}
        <StatCard title="Input Sensors" className="w-full md:w-72 hidden md:block">
          <ul className="space-y-3 font-mono text-xs">
            <li className={`flex items-center justify-between transition-colors ${gesture === GestureType.WATERING ? 'text-blue-400' : 'text-gray-400'}`}>
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${gesture === GestureType.WATERING ? 'bg-blue-400 animate-pulse' : 'bg-gray-700'}`}></span>
                Watering
              </span>
              <span className="opacity-50">[Right Hand]</span>
            </li>
            <li className={`flex items-center justify-between transition-colors ${gesture === GestureType.SUNLIGHT ? 'text-yellow-400' : 'text-gray-400'}`}>
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${gesture === GestureType.SUNLIGHT ? 'bg-yellow-400 animate-pulse' : 'bg-gray-700'}`}></span>
                Sunlight
              </span>
              <span className="opacity-50">[Left Hand]</span>
            </li>
            <li className={`flex items-center justify-between transition-colors ${gesture === GestureType.WEEDING ? 'text-red-400' : 'text-gray-400'}`}>
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${gesture === GestureType.WEEDING ? 'bg-red-400 animate-pulse' : 'bg-gray-700'}`}></span>
                Weeding
              </span>
              <span className="opacity-50">[Wave]</span>
            </li>
          </ul>
          <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-gray-500 flex justify-between">
            <span>SENSOR STATUS</span>
            <span className={gesture !== GestureType.NONE ? "text-green-500" : "text-gray-600"}>
                {gesture !== GestureType.NONE ? "ACTIVE" : "STANDBY"}
            </span>
          </div>
        </StatCard>


        {/* CENTER: CONSOLE & ACTION */}
        <div className="flex-1 w-full max-w-3xl flex flex-col gap-4">
            {/* AI Console */}
            <div 
                onClick={onHelp}
                className="relative bg-black/80 backdrop-blur-md border border-green-900/50 p-6 rounded-lg min-h-[120px] flex items-center justify-center cursor-pointer group hover:border-green-500/50 transition-all overflow-hidden"
            >
                {/* Scanline effect */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,0,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
                
                <div className="relative z-10 text-center">
                    <div className="text-[10px] text-green-600 uppercase tracking-widest mb-2 font-mono">
                        System Message • Day {state.day}
                    </div>
                    {loadingGemini ? (
                         <div className="font-mono text-green-400 text-sm animate-pulse flex flex-col items-center gap-2">
                            <span>ANALYZING BIO-METRICS...</span>
                            <span className="h-0.5 w-24 bg-green-900 overflow-hidden">
                                <span className="block h-full bg-green-400 w-1/2 animate-[shimmer_1s_infinite]"></span>
                            </span>
                         </div>
                    ) : (
                        <p className="font-mono text-white/80 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
                            <span className="text-green-500 mr-2">{">"}</span>
                            {advice}
                            <span className="animate-pulse ml-1 text-green-500">_</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Main Action Button */}
            <button 
                onClick={onNextDay}
                className="w-full bg-green-600/20 hover:bg-green-600/40 text-green-400 hover:text-white border border-green-500/30 hover:border-green-400 py-4 rounded-lg backdrop-blur-sm transition-all duration-300 uppercase tracking-[0.3em] font-bold text-sm shadow-[0_0_30px_rgba(34,197,94,0.1)] hover:shadow-[0_0_50px_rgba(34,197,94,0.3)] group relative overflow-hidden"
            >
                <span className="relative z-10">Initialize Sleep Cycle</span>
                <div className="absolute inset-0 bg-green-500/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
            </button>
        </div>


        {/* RIGHT: VITAL STATS */}
        <StatCard title="Bio-Metrics" className="w-full md:w-72">
            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                <div className="text-xs text-gray-400 font-mono">MATURITY</div>
                <div className="text-right">
                    <div className="text-purple-400 font-bold text-lg">{state.stage}</div>
                    <div className="text-[10px] text-gray-600 font-mono">Cycle: {state.growth}%</div>
                </div>
            </div>

            <ProgressBar 
              label="H2O Saturation" 
              value={state.water} 
              target={species.idealWater}
              tolerance={species.tolerance}
              color="bg-blue-500" 
            />
            <ProgressBar 
              label="Photon Exposure" 
              value={state.sun} 
              target={species.idealSun}
              tolerance={species.tolerance}
              color="bg-yellow-400" 
            />
            
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Integrity</span>
                    <span className={`text-xl font-bold ${state.health > 50 ? "text-white" : "text-red-500"}`}>{Math.round(state.health)}%</span>
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${state.health > 50 ? "bg-gradient-to-r from-green-500 to-green-300" : "bg-red-500 animate-pulse"}`} 
                        style={{ width: `${state.health}%` }}
                    />
                </div>
            </div>
        </StatCard>

      </footer>
    </div>
  );
};
