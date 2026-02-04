import React from 'react';

const SIZE_MAP = {
  xs: { w: 10, stroke: 2 },
  sm: { w: 16, stroke: 2 },
  md: { w: 28, stroke: 3 },
  lg: { w: 56, stroke: 4 },
};

const Loading = ({ size = 'md', text = '', className = '' }) => {
  const s = SIZE_MAP[size] || SIZE_MAP.md;
  return (
    <div className={`flex ${text ? 'flex-col items-center' : 'items-center'} ${className}`}>
      <svg
        className="loading-spinner"
        width={s.w}
        height={s.w}
        viewBox="0 0 50 50"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle cx="25" cy="25" r="20" fill="none" stroke="url(#spinnerGradient)" strokeWidth={s.stroke} strokeLinecap="round" />
      </svg>
      {text ? (
        <span className={`mt-3 text-gray-600 ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>{text}</span>
      ) : null}
    </div>
  );
};

export default Loading;
