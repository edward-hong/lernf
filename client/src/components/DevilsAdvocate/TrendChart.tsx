import React from 'react'

interface TrendChartProps {
  label: string
  values: number[]
  goodDirection: 'up' | 'down'
  color: string
}

const TrendChart: React.FC<TrendChartProps> = ({
  label,
  values,
  goodDirection,
  color
}) => {
  const maxValue = 1.0
  const chartHeight = 120

  const isGoodTrend = (prev: number, curr: number) => {
    if (goodDirection === 'up') return curr > prev
    return curr < prev
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-semibold mb-3">{label}</h4>
      <div className="flex items-end gap-2" style={{ height: chartHeight }}>
        {values.map((value, i) => {
          const heightPercent = (value / maxValue) * 100
          const trend = i > 0 ? isGoodTrend(values[i - 1], value) : null

          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: color,
                  opacity: 0.8
                }}
              />
              <div className="text-xs text-gray-600 mt-1">
                R{i + 1}
              </div>
              <div className="text-xs font-semibold" style={{ color }}>
                {value.toFixed(2)}
              </div>
              {trend !== null && (
                <span className={`text-sm ${trend ? 'text-green-600' : 'text-red-600'}`}>
                  {trend ? '\u2191' : '\u2193'}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TrendChart
