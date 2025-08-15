
import React, { useState } from 'react';

const RevenueCard: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dataPoints = [
    { cx: 15, cy: 90, value: 12, month: 'Jan', color: '#3d8bff', tooltipPos: { y: 54, x: 5 }, tooltipTextX: 40 },
    { cx: 45, cy: 40, value: 40, month: 'Feb', color: '#3d8bff', tooltipPos: { y: 4, x: 10 }, tooltipTextX: 45 },
    { cx: 75, cy: 60, value: 28, month: 'Mar', color: '#3d8bff', tooltipPos: { y: 24, x: 40 }, tooltipTextX: 75 },
    { cx: 105, cy: 35, value: 50, month: 'Apr', color: '#3d8bff', tooltipPos: { y: -5, x: 70 }, tooltipTextX: 105 },
    { cx: 135, cy: 60, value: 30, month: 'May', color: '#3d8bff', tooltipPos: { y: 24, x: 100 }, tooltipTextX: 135 },
    { cx: 165, cy: 80, value: 18, month: 'Jun', color: '#1ecb6b', tooltipPos: { y: 44, x: 130 }, tooltipTextX: 165 },
    { cx: 195, cy: 60, value: 22, month: 'Jul', color: '#1ecb6b', tooltipPos: { y: 24, x: 160 }, tooltipTextX: 195 },
    { cx: 225, cy: 70, value: 25, month: 'Aug', color: '#1ecb6b', tooltipPos: { y: 34, x: 190 }, tooltipTextX: 225 },
    { cx: 255, cy: 40, value: 38, month: 'Sep', color: '#1ecb6b', tooltipPos: { y: 4, x: 220 }, tooltipTextX: 255 },
    { cx: 285, cy: 60, value: 27, month: 'Oct', color: '#1ecb6b', tooltipPos: { y: 24, x: 250 }, tooltipTextX: 285 },
    { cx: 315, cy: 50, value: 32, month: 'Nov', color: '#1ecb6b', tooltipPos: { y: 14, x: 280 }, tooltipTextX: 315 },
    { cx: 345, cy: 70, value: 20, month: 'Dec', color: '#1ecb6b', tooltipPos: { y: 34, x: 285 }, tooltipTextX: 320 },
  ];

  return (
    <div className="bg-[#232733] rounded-[18px] shadow-[0_4px_24px_0_rgba(0,0,0,0.18)] p-6 pt-8 text-[#f3f6fa] flex flex-col gap-6 font-sans h-full">
      <div className="flex justify-between items-center">
        <div className="font-bold text-xl bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
          Monthly Revenue
        </div>
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} onBlur={() => setTimeout(() => setIsMenuOpen(false), 150)} className="flex flex-col gap-[3px] cursor-pointer w-[18px] items-center m-2 p-1">
            <span className="block w-[5px] h-[5px] bg-[#6c7383] rounded-full"></span>
            <span className="block w-[5px] h-[5px] bg-[#6c7383] rounded-full"></span>
            <span className="block w-[5px] h-[5px] bg-[#6c7383] rounded-full"></span>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 min-w-[110px] z-10 p-2 rounded-[18px] border-[1.5px] border-[rgba(80,90,120,0.18)] bg-[rgba(30,34,44,0.72)] shadow-[0_8px_32px_0_rgba(0,0,0,0.18)] backdrop-blur-sm">
              <a href="#" className="block px-4 py-2.5 text-[#f3f6fa] cursor-pointer text-[15px] border-l-2 border-[#3d8bff] hover:bg-[rgba(61,139,255,0.08)] hover:text-[#3d8bff] transition-colors rounded-r-md">View</a>
              <a href="#" className="block px-4 py-2.5 text-[#f3f6fa] cursor-pointer text-[15px] border-l-2 border-[#ff6a3d] hover:bg-[rgba(255,106,61,0.08)] hover:text-[#ff6a3d] transition-colors rounded-r-md">Edit</a>
              <a href="#" className="block px-4 py-2.5 text-[#f3f6fa] cursor-pointer text-[15px] border-l-2 border-[#1ecb6b] hover:bg-[rgba(30,203,107,0.08)] hover:text-[#1ecb6b] transition-colors rounded-r-md">Delete</a>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center items-center flex-1">
        <svg className="w-full max-w-[360px] h-[120px] block" viewBox="0 0 360 120">
          <defs>
            <linearGradient y2="1" x2="0" y1="0" x1="0" id="lineGradient-finance">
              <stop stopColor="#3d8bff" offset="0%"></stop>
              <stop stopColor="#1ecb6b" offset="100%"></stop>
            </linearGradient>
            <linearGradient y2="1" x2="0" y1="0" x1="0" id="areaGradient-finance">
              <stop stopOpacity="0.3" stopColor="#3d8bff" offset="0%"></stop>
              <stop stopOpacity="0" stopColor="#1ecb6b" offset="100%"></stop>
            </linearGradient>
            <filter height="140%" width="140%" y="-20%" x="-20%" id="glow-finance">
              <feGaussianBlur result="coloredBlur" stdDeviation="3"></feGaussianBlur>
              <feMerge>
                <feMergeNode in="coloredBlur"></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
            </filter>
          </defs>
          <path fill="url(#areaGradient-finance)" d="M15,90 L45,40 L75,60 L105,35 L135,60 L165,80 L195,60 L225,70 L255,40 L285,60 L315,50 L345,70 L345,120 L15,120 Z"></path>
          <polyline filter="url(#glow-finance)" points="15,90 45,40 75,60 105,35 135,60 165,80 195,60 225,70 255,40 285,60 315,50 345,70" strokeWidth="4" stroke="url(#lineGradient-finance)" fill="none"></polyline>
          
          {dataPoints.map(p => (
            <g className="group" key={p.month}>
              <circle fill={p.color} r="6" cy={p.cy} cx={p.cx}></circle>
              <g className="opacity-0 pointer-events-none transition-opacity group-hover:opacity-100">
                <rect opacity="0.92" fill="#232733" rx="8" height="32" width="70" y={p.tooltipPos.y} x={p.tooltipPos.x}></rect>
                <text fontWeight="500" fontSize="15" fill="#fff" textAnchor="middle" y={p.tooltipPos.y + 20} x={p.tooltipTextX}>{`${p.month}: ${p.value}`}</text>
              </g>
            </g>
          ))}
          
          <g fill="#b0b6c3" fontSize="12" className="font-sans">
            <text textAnchor="middle" y="115" x="15">Jan</text>
            <text textAnchor="middle" y="115" x="45">Feb</text>
            <text textAnchor="middle" y="115" x="75">Mar</text>
            <text textAnchor="middle" y="115" x="105">Apr</text>
            <text textAnchor="middle" y="115" x="135">May</text>
            <text textAnchor="middle" y="115" x="165">Jun</text>
            <text textAnchor="middle" y="115" x="195">Jul</text>
            <text textAnchor="middle" y="115" x="225">Aug</text>
            <text textAnchor="middle" y="115" x="255">Sep</text>
            <text textAnchor="middle" y="115" x="285">Oct</text>
            <text textAnchor="middle" y="115" x="315">Nov</text>
            <text textAnchor="middle" y="115" x="345">Dec</text>
          </g>
        </svg>
      </div>
      <div className="mt-2 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[#b8c0cc] text-sm font-light">
          <span>Average monthly sale for every author</span>
        </div>
        <div className="flex items-center justify-between text-[#b0b6c3]">
          <span className="text-3xl text-[#3d8bff] font-semibold">68.9%</span>
          <span className="text-[#1ecb6b] font-semibold">▲ 34.5%</span>
        </div>
      </div>
    </div>
  );
};
export default RevenueCard;
