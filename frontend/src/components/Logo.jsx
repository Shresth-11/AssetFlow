import React from "react";

export const Logo = ({ size = 32, animated = true }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="assetFlowGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BDB2FF" />
            <stop offset="50%" stopColor="#00C2A8" />
            <stop offset="100%" stopColor="#A0C4FF" />
          </linearGradient>

          <style>{`
            .logo-box-group {
              transform-origin: 50px 50px;
              ${animated ? "animation: floatBox 3.5s ease-in-out infinite alternate;" : ""}
            }
            .logo-flow-arrow {
              transform-origin: 50px 48px;
              ${animated ? "animation: flowPulse 2.5s ease-in-out infinite alternate;" : ""}
            }
            .logo-sparkle {
              transform-origin: 50px 44px;
              ${animated ? "animation: sparkleScale 2s ease-in-out infinite alternate;" : ""}
            }

            @keyframes floatBox {
              from { transform: translateY(0px); }
              to { transform: translateY(-3px); }
            }
            @keyframes flowPulse {
              from { opacity: 0.88; transform: scale(0.98); }
              to { opacity: 1; transform: scale(1.02); }
            }
            @keyframes sparkleScale {
              from { transform: scale(0.85) rotate(0deg); }
              to { transform: scale(1.15) rotate(12deg); }
            }
          `}</style>
        </defs>

        {/* Isometric Asset Box & Custody Shield */}
        <g className="logo-box-group">
          {/* Main Gradient Box Outer Boundary */}
          <path
            d="M 50,14 L 84,32 L 84,68 L 50,86 L 16,68 L 16,32 Z"
            fill="url(#assetFlowGradMain)"
            stroke="#1A1A1A"
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Top Face (Highlight Layer) */}
          <path
            d="M 50,14 L 84,32 L 50,48 L 16,32 Z"
            fill="#FFFFFF"
            fillOpacity="0.35"
            stroke="#1A1A1A"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Isometric Inner Edges */}
          <path
            d="M 50,48 L 84,32 M 50,48 L 50,86 M 50,48 L 16,32"
            stroke="#1A1A1A"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </g>

        {/* Dynamic Asset Flow Vector (Lifecycle Movement Loop) */}
        <g className="logo-flow-arrow">
          <path
            d="M 30,58 C 30,38 48,26 66,34 C 74,38 76,50 68,56 C 60,64 36,60 36,46 C 36,34 52,22 72,26"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 30,58 C 30,38 48,26 66,34 C 74,38 76,50 68,56 C 60,64 36,60 36,46 C 36,34 52,22 72,26"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Flow Arrow Head */}
          <path
            d="M 62,21 L 74,26 L 70,38"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Core Intelligence Sparkle Node */}
        <g className="logo-sparkle" fill="#FFD6A5" stroke="#1A1A1A" strokeWidth="2.5">
          <path d="M 50,38 Q 50,44 56,44 Q 50,44 50,50 Q 50,44 44,44 Q 50,44 50,38 Z" />
        </g>
      </svg>
    </div>
  );
};
