import React, { useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { ShapFeatureContribution } from '../types';

interface ShapPlotProps {
  data: ShapFeatureContribution[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const impact = data.value > 0 ? "Increases" : "Decreases";
        const impactColor = data.value > 0 ? "text-red-500 dark:text-red-400" : "text-green-500 dark:text-green-400";
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg border border-gray-300 dark:border-gray-600">
                <p className="font-bold text-gray-800 dark:text-gray-100">{label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">Customer Value: <span className="font-medium text-black dark:text-white">{String(data.userValue)}</span></p>
                <p className={`text-sm ${impactColor}`}>
                    {impact} churn risk by a SHAP value of {data.value.toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
};

export const ShapPlot: React.FC<ShapPlotProps> = ({ data }) => {
  const sortedData = [...data].sort((a, b) => a.value - b.value);
  const isDarkMode = document.documentElement.classList.contains('dark');

  const axisColor = isDarkMode ? "#94a3b8" : "#475569";
  const tickColor = isDarkMode ? "#cbd5e1" : "#334155";
  const refLineColor = isDarkMode ? "#475569" : "#d1d5db";
  const cursorColor = isDarkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(203, 213, 225, 0.4)';


  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={sortedData} 
        layout="vertical" 
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <XAxis type="number" stroke={axisColor} fontSize={12} />
        <YAxis 
          type="category" 
          dataKey="feature"
          width={100}
          tick={{ fill: tickColor, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: cursorColor }} 
        />
        
        <ReferenceLine x={0} stroke={refLineColor} strokeDasharray="3 3" />

        <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            {sortedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value > 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)'} 
                />
            ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
