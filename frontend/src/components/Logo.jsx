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
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <defs>
          <style>{`
            .logo-gear-group {
              transform-origin: 50px 42px;
              ${animated ? "animation: spinGear 12s linear infinite;" : ""}
            }
            .logo-hand-left {
              transform-origin: 25px 76px;
              ${animated ? "animation: floatHandLeft 3s ease-in-out infinite alternate;" : ""}
            }
            .logo-hand-right {
              transform-origin: 75px 76px;
              ${animated ? "animation: floatHandRight 3s ease-in-out infinite alternate;" : ""}
            }
            .logo-dollar {
              transform-origin: 50px 42px;
              ${animated ? "animation: pulseDollar 3s ease-in-out infinite alternate;" : ""}
            }
            @keyframes spinGear {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes floatHandLeft {
              from { transform: translateY(0px) rotate(0deg); }
              to { transform: translateY(-1.5px) rotate(-1deg); }
            }
            @keyframes floatHandRight {
              from { transform: translateY(0px) rotate(0deg); }
              to { transform: translateY(-1.5px) rotate(1deg); }
            }
            @keyframes pulseDollar {
              from { transform: scale(0.95); }
              to { transform: scale(1.05); }
            }
          `}</style>
        </defs>

        {/* Left Hand Group */}
        <g className="logo-hand-left" style={{ color: "var(--text-primary)" }}>
          <path
            d="M 25,80 L 21,80 C 19,80 17,78 17,76 L 17,46 C 17,43 21,43 21,46 L 21,56 C 21,58 23,59 25,59 C 27,59 28,58 29,56 L 29,53 C 29,50 33,50 33,53 L 33,76 C 33,78 31,80 29,80 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="21"
            y1="84"
            x2="33"
            y2="84"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>

        {/* Right Hand Group */}
        <g className="logo-hand-right" style={{ color: "var(--text-primary)" }}>
          <path
            d="M 75,80 L 79,80 C 81,80 83,78 83,76 L 83,46 C 83,43 79,43 79,46 L 79,56 C 79,58 77,59 75,59 C 73,59 72,58 71,56 L 71,53 C 71,50 67,50 67,53 L 67,76 C 67,78 69,80 71,80 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="67"
            y1="84"
            x2="79"
            y2="84"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>

        {/* Gear Group */}
        <g className="logo-gear-group">
          {/* Main Gear Ring */}
          <circle
            cx="50"
            cy="42"
            r="15"
            fill="none"
            stroke="#00C2A8"
            strokeWidth="3.5"
          />
          
          {/* Gear Cutout Ring */}
          <circle
            cx="50"
            cy="42"
            r="9.5"
            fill="none"
            stroke="#00C2A8"
            strokeWidth="2"
          />

          {/* Gear Teeth */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <rect
              key={angle}
              x="47.5"
              y="22.5"
              width="5"
              height="5.5"
              rx="1.5"
              transform={`rotate(${angle}, 50, 42)`}
              fill="#00C2A8"
            />
          ))}
        </g>

        {/* Centered Dollar Sign */}
        <g className="logo-dollar" style={{ color: "var(--text-primary)" }}>
          {/* Dollar Vertical Line */}
          <line
            x1="50"
            y1="31"
            x2="50"
            y2="53"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Dollar 'S' Curves */}
          <path
            d="M 53.5,35.5 C 53.5,32.5 46.5,32.5 46.5,36 C 46.5,39 53.5,40.5 53.5,43.5 C 53.5,47 46.5,47 46.5,44"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};
