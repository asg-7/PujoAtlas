import React from 'react';

interface TimingWindow {
  id: string;
  label: string;
  timeRange: string;
  description: string;
  colorClass: string;
  dotColor: string;
}

const TIMING_MATRIX: TimingWindow[] = [
  {
    id: 'golden',
    label: 'Golden Window',
    timeRange: '04:00 AM – 08:30 AM',
    description: 'Minimal queues, great for photography.',
    colorClass: 'bg-green-900/20 border-green-800/30 text-green-200',
    dotColor: 'bg-green-500',
  },
  {
    id: 'family',
    label: 'Family Window',
    timeRange: '11:00 AM – 04:00 PM',
    description: 'Moderate lines, well-lit, ideal for families.',
    colorClass: 'bg-yellow-900/20 border-yellow-800/30 text-yellow-200',
    dotColor: 'bg-yellow-500',
  },
  {
    id: 'peak',
    label: 'Peak Crush',
    timeRange: '07:30 PM – 01:30 AM',
    description: 'Extremely crowded. Expect long waiting times.',
    colorClass: 'bg-red-900/20 border-red-800/30 text-red-200',
    dotColor: 'bg-red-500',
  },
  {
    id: 'midnight',
    label: 'Midnight Hopper',
    timeRange: '02:00 AM – 04:30 AM',
    description: 'Fast moving queues, energetic atmosphere.',
    colorClass: 'bg-purple-900/20 border-purple-800/30 text-purple-200',
    dotColor: 'bg-purple-500',
  },
];

interface PandalTimingSectionProps {
  bestTimeToVisit: string[];
}

export default function PandalTimingSection({ bestTimeToVisit }: PandalTimingSectionProps) {
  return (
    <div className="px-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Crowd Advisory Matrix</p>
      </div>

      {/* Recommended Specific Times from DB */}
      {bestTimeToVisit.length > 0 && (
        <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-xs text-pujo-gold font-medium mb-1">⭐ Organizer Recommendations</p>
          <ul className="space-y-1">
            {bestTimeToVisit.map((time, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex gap-2">
                <span className="text-gray-500">•</span>
                <span>{time}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* General Crowd Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {TIMING_MATRIX.map((window) => (
          <div
            key={window.id}
            className={`p-2.5 rounded-lg border ${window.colorClass} flex flex-col gap-0.5`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${window.dotColor}`} />
                <span className="font-semibold text-sm">{window.label}</span>
              </div>
            </div>
            <p className="text-[11px] opacity-90 font-medium ml-3.5 tracking-wide">{window.timeRange}</p>
            <p className="text-[10px] opacity-70 ml-3.5 mt-0.5">{window.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
