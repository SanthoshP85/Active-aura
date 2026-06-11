/**
 * CalorieCard Component
 * Display daily calorie summary
 */

import { Card } from "../common/Card";
import { Flame } from "lucide-react";
import { formatCalories, formatPercentage } from "../../utils/formatters";

export const CalorieCard = ({ data, target = 2000 }) => {
  if (!data)
    return (
      <Card className="flex items-center justify-center min-h-48">
        <p className="text-gray-500">No data available</p>
      </Card>
    );

  const consumed = data.totalCalories || 0;
  const percentage = (consumed / target) * 100;
  const remaining = Math.max(0, target - consumed);

  return (
    <Card title="Daily Calories" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-primary-600">
            {formatCalories(consumed)}
          </p>
          <p className="text-sm text-gray-500">
            Target: {formatCalories(target)}
          </p>
        </div>
        <Flame className="w-12 h-12 text-warning-500" />
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-600 h-full rounded-full transition-all"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{formatPercentage(consumed / target, 0)}</span>
          <span>{formatCalories(remaining)} remaining</span>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-600">Protein</p>
          <p className="font-semibold">{Math.round(data.totalProtein)}g</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Carbs</p>
          <p className="font-semibold">{Math.round(data.totalCarbs)}g</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Fats</p>
          <p className="font-semibold">{Math.round(data.totalFats)}g</p>
        </div>
      </div>
    </Card>
  );
};

export default CalorieCard;
