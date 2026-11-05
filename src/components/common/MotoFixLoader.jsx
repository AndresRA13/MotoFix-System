import React from 'react';

/**
 * MotoFixLoader - Loader premium temático de motocicletas y taller mecánico.
 * Cuenta con silueta de motocicleta animada, efecto de aceleración en pista de neón ámbar,
 * tacómetro / engranaje giratorio con resplandor cyberpunk y barra de progreso de bucle suave.
 */
export default function MotoFixLoader({
  message = 'Sincronizando Taller MotoFix Pro...',
  subMessage = 'Calentando motores y cargando datos en tiempo real'
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070b13] select-none overflow-hidden">
      {/* Background ambient neon glows */}
      <div className="absolute w-96 h-96 bg-amber-500/10 rounded-full blur-[110px] pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-24 w-72 h-72 bg-amber-600/10 rounded-full blur-[90px] pointer-events-none"></div>

      {/* Grid line pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #f59e0b 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      ></div>

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        {/* Moto & Gear Stage */}
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
          {/* Outer rotating mechanical sprocket / brake disc */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/30 animate-[spin_6s_linear_infinite]"></div>

          {/* Glowing neon ring pulse */}
          <div className="absolute inset-1.5 rounded-full border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.35)] animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>

          {/* Central dark metallic hub */}
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#151c2e] to-[#0a0f1d] border border-amber-500/40 shadow-inner flex items-center justify-center">
            {/* Motorcycle vibrating with throttle */}
            <div className="animate-[bounce_0.6s_ease-in-out_infinite] flex items-center justify-center">
              <i className="fa-solid fa-motorcycle text-3xl text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"></i>
            </div>

            {/* Spark plug / speed trail */}
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-[10px] text-amber-400 font-black animate-spin">
              <i className="fa-solid fa-gear"></i>
            </span>
          </div>
        </div>

        {/* Speed Track / Asphalt Stripes Effect */}
        <div className="relative w-44 h-1.5 bg-white/[0.04] rounded-full overflow-hidden border border-white/5 mb-5 shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent w-1/2 rounded-full animate-[shimmer_1.2s_infinite]"></div>
        </div>

        {/* Brand Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
            MOTOFIX PRO
          </span>
        </div>

        {/* Main message */}
        <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
          {message}
        </h2>

        {/* Subtitle / RPM status */}
        <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
          {subMessage}
        </p>
      </div>
    </div>
  );
}

