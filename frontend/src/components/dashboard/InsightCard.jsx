/**
 * InsightCard Component
 * Display AI-generated insights
 */

import { Card } from "../common/Card";
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  InfoIcon,
} from "lucide-react";

const severityIcons = {
  info: InfoIcon,
  success: CheckCircle,
  warning: AlertTriangle,
  danger: AlertCircle,
};

const severityColors = {
  info: "text-blue-500 bg-blue-50",
  success: "text-success-500 bg-success-50",
  warning: "text-warning-500 bg-warning-50",
  danger: "text-danger-500 bg-danger-50",
};

/**
 * Format insight data based on type
 */
const formatInsightData = (insight) => {
  if (!insight.data) return null;

  switch (insight.type) {
    case "weight_plateau":
      return `Current: ${insight.data.currentWeight}kg → Goal: ${insight.data.goalWeight}kg`;

    case "calorie_trend":
      return `${insight.data.avgCalories} cal/day (Target: ${insight.data.targetCalories}cal) - ${insight.data.trend}`;

    case "goal_progress":
      return `Progress: ${insight.data.progressPercentage}% (${insight.data.remainingWeight}kg remaining)`;

    case "macro_distribution":
      return `P: ${insight.data.avgProtein}g | C: ${insight.data.avgCarbs}g | F: ${insight.data.avgFats}g`;

    case "overtraining":
      return `${insight.data.totalMinutes} min / week (Rest: ${insight.data.recommendedRestDays} days)`;

    default:
      // Fallback for unknown types - show first 80 chars
      return JSON.stringify(insight.data).substring(0, 80);
  }
};

export const InsightCard = ({ insight }) => {
  if (!insight) return null;

  const Icon = severityIcons[insight.severity] || InfoIcon;
  const formattedData = formatInsightData(insight);

  return (
    <Card className="space-y-3">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${severityColors[insight.severity]}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{insight.title}</h4>
          {formattedData && (
            <p className="text-sm text-gray-600 mt-1">{formattedData}</p>
          )}
        </div>
      </div>
      {insight.recommendation && (
        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border-l-4 border-primary-600">
          {insight.recommendation}
        </p>
      )}
    </Card>
  );
};

export default InsightCard;
