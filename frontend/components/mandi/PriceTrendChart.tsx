"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import React, { useMemo } from "react";
import { MandiRecord } from "@/lib/types/mandi";
import { generateSparkData } from "@/lib/utils/mandiHelpers";

interface PriceTrendChartProps {
  record: MandiRecord;
}

function PriceTrendChartComponent({ record }: PriceTrendChartProps) {
  const data = useMemo(() => generateSparkData(record), [record.modal_price, record.min_price, record.max_price]);

  const trend = data.length > 1 && data[data.length - 1].price > data[0].price ? "up" : "down";
  const strokeColor = trend === "up" ? "#34d399" : "#fb7185";
  const fillColor = trend === "up" ? "#34d39920" : "#fb718520";

  return (
    <div className="w-full h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={1.5}
            fill={fillColor}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export const PriceTrendChart = React.memo(PriceTrendChartComponent, (prev, next) => {
  return prev.record.modal_price === next.record.modal_price;
});
