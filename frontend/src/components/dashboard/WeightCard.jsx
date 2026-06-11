/**
 * WeightCard Component
 * Display weight tracking and progress with graph
 */

import { Card } from "../common/Card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatWeight } from "../../utils/formatters";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const WeightCard = ({
  currentWeight,
  goalWeight,
  weightHistory = [],
}) => {
  const difference = currentWeight - goalWeight;
  const isProgress = difference >= 0;

  // Format data for chart - ensure we have at least current weight
  const chartData =
    weightHistory && weightHistory.length > 0
      ? weightHistory.map((entry) => ({
          date: new Date(entry.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          weight: entry.weight,
        }))
      : [
          {
            date: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            weight: currentWeight,
          },
        ];

  return (
    <Card title="Weight Progress" className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Current</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatWeight(currentWeight)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Goal</p>
          <p className="text-2xl font-bold text-primary-600">
            {formatWeight(goalWeight)}
          </p>
        </div>
      </div>

      {/* Weight Chart */}
      {chartData.length > 1 ? (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#6b7280"
                domain={[
                  Math.floor(Math.min(...chartData.map((d) => d.weight)) - 2),
                  Math.ceil(Math.max(...chartData.map((d) => d.weight)) + 2),
                ]}
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value) => `${value.toFixed(1)} kg`}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={isProgress ? "#10b981" : "#f59e0b"}
                strokeWidth={2}
                dot={{ fill: isProgress ? "#10b981" : "#f59e0b", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            More weight data needed for chart
          </p>
        </div>
      )}

      {/* Progress */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-success-500 h-full rounded-full"
            style={{
              width: `${(Math.abs(difference) / Math.abs(currentWeight - goalWeight + 10)) * 100}%`,
            }}
          ></div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isProgress ? (
              <TrendingDown className="text-success-500" size={18} />
            ) : (
              <TrendingUp className="text-warning-500" size={18} />
            )}
            <span className="text-sm font-medium">
              {isProgress ? "−" : "+"}
              {formatWeight(Math.abs(difference))}
            </span>
          </div>
          <span className="text-xs text-gray-600">
            {Math.round(
              (Math.abs(difference) /
                Math.abs(currentWeight - (goalWeight + 10))) *
                100,
            )}
            %
          </span>
        </div>
      </div>
    </Card>
  );
};

export default WeightCard;
