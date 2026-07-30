import React from "react";

export const Logo = ({ size = 40, animated = true }) => {
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
          <linearGradient id="flowGradMain1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BDB2FF" />
            <stop offset="50%" stopColor="#00C2A8" />
            <stop offset="100%" stopColor="#A0C4FF" />
          </linearGradient>
          <linearGradient id="flowGradMain2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C2A8" />
            <stop offset="100%" stopColor="#FFD6A5" />
          </linearGradient>

          <style>{`
            .logo-infinity-loop {
              transform-origin: 50px 50px;
              ${animated ? "animation: floatInfinity 3.5s ease-in-out infinite alternate;" : ""}
            }
            .logo-center-node {
              transform-origin: 50px 50px;
              ${animated ? "animation: pulseCenter 2s ease-in-out infinite alternate;" : ""}
            }
            .logo-arrow-head {
              transform-origin: 62px 20px;
              ${animated ? "animation: floatArrow 2.5s ease-in-out infinite alternate;" : ""}
            }

            @keyframes floatInfinity {
              from { opacity: 0.95; transform: scale(0.98); }
              to { opacity: 1; transform: scale(1.02); }
            }
            @keyframes pulseCenter {
              from { transform: scale(0.9); }
              to { transform: scale(1.12); }
            }
            @keyframes floatArrow {
              from { transform: translate(0px, 0px); }
              to { transform: translate(2px, -2px); }
            }
          `}</style>
        </defs>

        <g className="logo-infinity-loop">
          {/* Main Expanded Infinity Flow Loop (Edge-to-Edge) */}
          <path
            d="M 22,50 C 6,24 6,76 22,50 C 38,24 62,76 78,50 C 94,24 94,76 78,50 C 62,24 38,76 22,50 Z"
            fill="none"
            stroke="url(#flowGradMain1)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 22,50 C 6,24 6,76 22,50 C 38,24 62,76 78,50 C 94,24 94,76 78,50 C 62,24 38,76 22,50 Z"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Overlapping Dashed Asset Stream */}
          <path
            d="M 16,50 C 30,18 70,18 84,50 C 70,82 30,82 16,50"
            fill="none"
            stroke="url(#flowGradMain2)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 16,50 C 30,18 70,18 84,50 C 70,82 30,82 16,50"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="3"
            strokeDasharray="8 5"
            strokeLinecap="round"
          />

          {/* Left Asset Node */}
          <circle cx="16" cy="50" r="9" fill="#BDB2FF" stroke="#1A1A1A" strokeWidth="4" />
          <circle cx="16" cy="50" r="3.2" fill="#1A1A1A" />

          {/* Core Central Sync Node */}
          <g className="logo-center-node">
            <circle cx="50" cy="50" r="12" fill="#00C2A8" stroke="#1A1A1A" strokeWidth="4" />
            <circle cx="50" cy="50" r="4.5" fill="#FFFFFF" />
          </g>

          {/* Right Asset Node */}
          <circle cx="84" cy="50" r="9" fill="#A0C4FF" stroke="#1A1A1A" strokeWidth="4" />
          <circle cx="84" cy="50" r="3.2" fill="#1A1A1A" />

          {/* Dynamic Flow Arrow Head */}
          <g className="logo-arrow-head">
            <path
              d="M 58,14 L 72,21 L 62,32 Z"
              fill="#FFD6A5"
              stroke="#1A1A1A"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
