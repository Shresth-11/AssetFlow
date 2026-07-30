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
          <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BDB2FF" />
            <stop offset="100%" stopColor="#00C2A8" />
          </linearGradient>
          <linearGradient id="flowGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C2A8" />
            <stop offset="100%" stopColor="#A0C4FF" />
          </linearGradient>

          <style>{`
            .logo-infinity-loop {
              transform-origin: 50px 50px;
              ${animated ? "animation: pulseLoop 4s ease-in-out infinite alternate;" : ""}
            }
            .logo-center-node {
              transform-origin: 50px 50px;
              ${animated ? "animation: pulseCenter 2s ease-in-out infinite alternate;" : ""}
            }
            .logo-arrow-head {
              transform-origin: 57px 29px;
              ${animated ? "animation: floatArrow 3s ease-in-out infinite alternate;" : ""}
            }

            @keyframes pulseLoop {
              from { opacity: 0.92; transform: scale(0.98); }
              to { opacity: 1; transform: scale(1.02); }
            }
            @keyframes pulseCenter {
              from { transform: scale(0.9); }
              to { transform: scale(1.1); }
            }
            @keyframes floatArrow {
              from { transform: translate(0px, 0px); }
              to { transform: translate(1.5px, -1.5px); }
            }
          `}</style>
        </defs>

        <g className="logo-infinity-loop">
          {/* Outer Continuous Infinity Flow Loop */}
          <path
            d="M 32,50 C 18,30 18,70 32,50 C 46,30 54,70 68,50 C 82,30 82,70 68,50 C 54,30 46,70 32,50 Z"
            fill="none"
            stroke="url(#flowGrad1)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 32,50 C 18,30 18,70 32,50 C 46,30 54,70 68,50 C 82,30 82,70 68,50 C 54,30 46,70 32,50 Z"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Overlapping Asset Stream Pathway */}
          <path
            d="M 28,50 C 38,26 62,26 72,50 C 62,74 38,74 28,50"
            fill="none"
            stroke="url(#flowGrad2)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 28,50 C 38,26 62,26 72,50 C 62,74 38,74 28,50"
            fill="none"
            stroke="#1A1A1A"
            strokeWidth="2.5"
            strokeDasharray="7 4"
            strokeLinecap="round"
          />

          {/* Left Asset Node */}
          <circle cx="28" cy="50" r="7" fill="#BDB2FF" stroke="#1A1A1A" strokeWidth="3" />
          <circle cx="28" cy="50" r="2.5" fill="#1A1A1A" />

          {/* Core Central Sync Node */}
          <g className="logo-center-node">
            <circle cx="50" cy="50" r="9" fill="#00C2A8" stroke="#1A1A1A" strokeWidth="3.5" />
            <circle cx="50" cy="50" r="3.2" fill="#FFFFFF" />
          </g>

          {/* Right Asset Node */}
          <circle cx="72" cy="50" r="7" fill="#A0C4FF" stroke="#1A1A1A" strokeWidth="3" />
          <circle cx="72" cy="50" r="2.5" fill="#1A1A1A" />

          {/* Dynamic Flow Arrow Head */}
          <g className="logo-arrow-head">
            <path
              d="M 54,22 L 65,27 L 57,36 Z"
              fill="#FFD6A5"
              stroke="#1A1A1A"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};
