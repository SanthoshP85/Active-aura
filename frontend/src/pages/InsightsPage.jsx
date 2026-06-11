/**
 * InsightsPage
 * AI insights and analytics page
 */

import { useState, useEffect } from "react";
import { Card } from "../components/common/Card";
import { InsightCard } from "../components/dashboard/InsightCard";
import { useData } from "../hooks/useData";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

export const InsightsPage = () => {
  const { insights, fetchInsights } = useData();
  const [timeframe, setTimeframe] = useState(7);

  useEffect(() => {
    fetchInsights(timeframe);
  }, [timeframe]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">AI Insights</h1>

          <div className="flex gap-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setTimeframe(days)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeframe === days
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        {insights.isLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(insights.all || []).length === 0 ? (
              <Card className="col-span-full text-center py-12">
                <p className="text-gray-500">
                  No insights available yet. Keep tracking your fitness!
                </p>
              </Card>
            ) : (
              (insights.all || []).map((insight, idx) => (
                <InsightCard key={idx} insight={insight} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsPage;
