import React from 'react';

interface TreeRootConnectorProps {
  fromStepNumber: number; // 1, 2, 3, 4
  toStepNumber: number;   // 2, 3, 4, 5
  isCompleted: boolean;
  isUnlocked: boolean;
  stageNumber?: number;
  className?: string;
}

/**
 * Natural organic tree root connector linking consecutive learning nodes.
 * Features:
 * - Thick main root vine with wood/bark gradient
 * - Curving fibrous tendrils (nhánh rễ cây phụ)
 * - Fresh leaf sprouts (mầm lá cây xanh biếc)
 * - Golden/emerald life energy pulse when completed
 */
export const TreeRootConnector: React.FC<TreeRootConnectorProps> = ({
  fromStepNumber,
  toStepNumber,
  isCompleted,
  isUnlocked,
  stageNumber = 1,
  className = '',
}) => {
  // Determine direction based on step numbers
  // Step 1 (-16) -> Step 2 (+16): Left to Right
  // Step 2 (+16) -> Step 3 (-12): Right to Left
  // Step 3 (-12) -> Step 4 (+14): Left to Right
  // Step 4 (+14) -> Step 5 (0): Right to Center

  let mainPath = 'M 60 0 C 65 30, 135 30, 140 60';
  let branch1 = 'M 85 20 Q 65 32, 50 42';
  let branch2 = 'M 115 40 Q 140 48, 158 38';
  let leaf1Pos = { x: 48, y: 44, rot: -45 };
  let leaf2Pos = { x: 160, y: 36, rot: 30 };

  if (fromStepNumber === 2 && toStepNumber === 3) {
    // Right to Left
    mainPath = 'M 140 0 C 135 30, 65 30, 60 60';
    branch1 = 'M 120 18 Q 145 28, 158 40';
    branch2 = 'M 80 42 Q 55 48, 42 38';
    leaf1Pos = { x: 160, y: 42, rot: 45 };
    leaf2Pos = { x: 40, y: 36, rot: -30 };
  } else if (fromStepNumber === 4 && toStepNumber === 5) {
    // Right to Center
    mainPath = 'M 135 0 C 130 28, 105 32, 100 60';
    branch1 = 'M 120 22 Q 140 32, 150 44';
    branch2 = 'M 108 42 Q 85 48, 72 40';
    leaf1Pos = { x: 152, y: 46, rot: 35 };
    leaf2Pos = { x: 70, y: 38, rot: -40 };
  } else if (fromStepNumber === 3 && toStepNumber === 4) {
    // Left to Right
    mainPath = 'M 65 0 C 70 30, 130 30, 135 60';
    branch1 = 'M 90 20 Q 70 32, 55 42';
    branch2 = 'M 115 42 Q 138 50, 152 40';
    leaf1Pos = { x: 53, y: 44, rot: -45 };
    leaf2Pos = { x: 154, y: 38, rot: 30 };
  }

  // Gradients and stroke colors
  const gradientId = `root-grad-s${stageNumber}-${fromStepNumber}-${toStepNumber}-${isCompleted ? 'done' : isUnlocked ? 'active' : 'lock'}`;
  
  const mainStrokeColor = isCompleted
    ? `url(#${gradientId})`
    : isUnlocked
    ? `url(#${gradientId})`
    : '#78716C';

  const branchColor = isCompleted ? '#059669' : isUnlocked ? '#854D0E' : '#78716C';
  const leafFill = isCompleted ? '#10B981' : isUnlocked ? '#65A30D' : '#A8A29E';

  return (
    <div className={`w-48 sm:w-60 h-14 sm:h-16 my-[-8px] pointer-events-none relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 60"
        className="w-full h-full overflow-visible drop-shadow-xs"
        fill="none"
      >
        <defs>
          {/* Completed Living Energy Root Gradient */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {isCompleted ? (
              <>
                <stop offset="0%" stopColor="#059669" />
                <stop offset="50%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </>
            ) : isUnlocked ? (
              <>
                <stop offset="0%" stopColor="#78350F" />
                <stop offset="50%" stopColor="#92400E" />
                <stop offset="100%" stopColor="#65A30D" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#78716C" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#A8A29E" stopOpacity="0.4" />
              </>
            )}
          </linearGradient>

          {/* Root bark pattern texture filter */}
          <filter id="rootGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor={isCompleted ? '#10B981' : '#78350F'} floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Shadow root underneath for 3D wood depth */}
        <path
          d={mainPath}
          stroke={isCompleted ? '#064E3B' : '#451A03'}
          strokeWidth="9"
          strokeLinecap="round"
          opacity="0.3"
          transform="translate(0, 1.5)"
        />

        {/* Main Thick Tree Root Vine */}
        <path
          d={mainPath}
          stroke={mainStrokeColor}
          strokeWidth="7"
          strokeLinecap="round"
          filter="url(#rootGlow)"
        />

        {/* Tree Root Bark Fiber Lines (Vân thớ rễ cây) */}
        <path
          d={mainPath}
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="4 8"
          opacity={isCompleted ? 0.6 : 0.3}
        />

        {/* Secondary Root Tendrils (Nhánh rễ cây phụ) */}
        <path
          d={branch1}
          stroke={branchColor}
          strokeWidth="2.8"
          strokeLinecap="round"
          opacity={isCompleted ? 0.9 : 0.7}
        />
        <path
          d={branch2}
          stroke={branchColor}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity={isCompleted ? 0.8 : 0.6}
        />

        {/* Fresh Leaf Sprouts on root branch tips (Mầm lá cây đâm chồi) */}
        {(isUnlocked || isCompleted) && (
          <>
            {/* Leaf 1 */}
            <g transform={`translate(${leaf1Pos.x}, ${leaf1Pos.y}) rotate(${leaf1Pos.rot})`}>
              <path
                d="M 0 0 C -4 -7 0 -12 6 -10 C 12 -8 8 -2 0 0"
                fill={leafFill}
                stroke="#047857"
                strokeWidth="0.8"
              />
              <line x1="1" y1="-1" x2="5" y2="-8" stroke="#D1FAE5" strokeWidth="0.8" />
            </g>

            {/* Leaf 2 */}
            <g transform={`translate(${leaf2Pos.x}, ${leaf2Pos.y}) rotate(${leaf2Pos.rot})`}>
              <path
                d="M 0 0 C 4 -6 0 -11 -6 -9 C -11 -7 -7 -2 0 0"
                fill={leafFill}
                stroke="#047857"
                strokeWidth="0.8"
              />
              <line x1="-1" y1="-1" x2="-5" y2="-7" stroke="#D1FAE5" strokeWidth="0.8" />
            </g>
          </>
        )}

        {/* Little bark knot / bud (Mắt cây / u rễ) */}
        <circle
          cx={fromStepNumber % 2 === 1 ? 100 : 95}
          cy="30"
          r="3"
          fill={isCompleted ? '#047857' : isUnlocked ? '#78350F' : '#78716C'}
          stroke="#FFFFFF"
          strokeWidth="1"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};

/**
 * Inter-Stage Tree Root Vine:
 * Large trunk descending from the end of Stage N to Stage N+1,
 * uniting the entire roadmap into one majestic Tree of Korean Knowledge.
 */
export const InterStageTreeRoot: React.FC<{
  fromStageNumber: number;
  toStageNumber: number;
  isCompleted: boolean;
}> = ({ fromStageNumber, toStageNumber, isCompleted }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center my-[-10px] pointer-events-none relative z-10">
      <div className="w-40 sm:w-52 h-16 sm:h-20 relative">
        <svg
          viewBox="0 0 160 80"
          className="w-full h-full overflow-visible drop-shadow-sm"
          fill="none"
        >
          <defs>
            <linearGradient id={`inter-root-${fromStageNumber}`} x1="0%" y1="0%" x2="0%" y2="100%">
              {isCompleted ? (
                <>
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#78350F" />
                  <stop offset="50%" stopColor="#92400E" />
                  <stop offset="100%" stopColor="#854D0E" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* Deep Root Shadow */}
          <path
            d="M 80 0 C 85 25, 60 50, 80 80"
            stroke="#1C1917"
            strokeWidth="12"
            strokeLinecap="round"
            opacity="0.25"
            transform="translate(0, 2)"
          />

          {/* Main Giant Root Vine */}
          <path
            d="M 80 0 C 85 25, 60 50, 80 80"
            stroke={`url(#inter-root-${fromStageNumber})`}
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Bark spiral grain */}
          <path
            d="M 80 0 C 85 25, 60 50, 80 80"
            stroke="#FEF3C7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 10"
            opacity="0.5"
          />

          {/* Left Branch Root */}
          <path
            d="M 76 28 Q 50 38, 32 46"
            stroke={isCompleted ? '#059669' : '#78350F'}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Right Branch Root */}
          <path
            d="M 72 52 Q 105 60, 125 54"
            stroke={isCompleted ? '#059669' : '#78350F'}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Leaves on branch tips */}
          <g transform="translate(30, 48) rotate(-55)">
            <path
              d="M 0 0 C -4 -7 0 -12 6 -10 C 12 -8 8 -2 0 0"
              fill={isCompleted ? '#10B981' : '#65A30D'}
              stroke="#047857"
              strokeWidth="0.8"
            />
          </g>

          <g transform="translate(127, 52) rotate(40)">
            <path
              d="M 0 0 C 4 -6 0 -11 -6 -9 C -11 -7 -7 -2 0 0"
              fill={isCompleted ? '#10B981' : '#65A30D'}
              stroke="#047857"
              strokeWidth="0.8"
            />
          </g>
        </svg>
      </div>

      {/* Gentle Root Badge */}
      <div className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 shadow-2xs -mt-1 flex items-center gap-1">
        <span>🌱</span>
        <span>Rễ cây nối sang Chặng {toStageNumber}</span>
      </div>
    </div>
  );
};
