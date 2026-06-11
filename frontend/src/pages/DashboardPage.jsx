/**
 * DashboardPage
 * Main application dashboard
 */

import { useEffect } from "react";
import { Card } from "../components/common/Card";
import { CalorieCard } from "../components/dashboard/CalorieCard";
import { WeightCard } from "../components/dashboard/WeightCard";
import { ActivityCard } from "../components/dashboard/ActivityCard";
import { InsightCard } from "../components/dashboard/InsightCard";
import { Button } from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";
import { useData } from "../hooks/useData";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { Plus } from "lucide-react";
import { getGreeting } from "../utils/helpers";
import { Link } from "react-router-dom";

export const DashboardPage = () => {
  const { user } = useAuth();
  const {
    calories,
    activities,
    insights,
    user: userData,
    fetchDailyCalories,
    fetchDailyActivities,
    fetchInsights,
    fetchWeightHistory,
    fetchStreak,
  } = useData();

  useEffect(() => {
    const today = new Date();
    fetchDailyCalories(today);
    fetchDailyActivities(today);
    fetchInsights(7);
    fetchWeightHistory(30);
    fetchStreak();
  }, []);

  const isLoading = calories.isLoading || activities.isLoading;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {getGreeting()}, {user?.fullName?.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Here's your fitness overview for today
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Quick Stats */}
                <Card title="Quick Stats">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Weight</span>
                      <span className="font-semibold">
                        {user?.currentWeight} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goal Weight</span>
                      <span className="font-semibold">
                        {user?.goalWeight} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Height</span>
                      <span className="font-semibold">{user?.height} cm</span>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <Card title="Quick Actions">
                  <div className="space-y-2">
                    <Link to="/calories" className="block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center"
                      >
                        <Plus size={16} /> Log Food
                      </Button>
                    </Link>
                    <Link to="/activities" className="block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center"
                      >
                        <Plus size={16} /> Log Activity
                      </Button>
                    </Link>
                  </div>
                </Card>

                <Card title="Today's Goal">
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-primary-600">2000</p>
                    <p className="text-sm text-gray-600">kcal target</p>
                  </div>
                </Card>

                <Card title="Streak">
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-success-500">
                      {userData?.streak?.totalDaysLogged || 0}
                    </p>
                    <p className="text-sm text-gray-600">days logged</p>
                  </div>
                </Card>
              </div>

              {/* Main Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <CalorieCard data={calories.daily} target={2000} />
                <WeightCard
                  currentWeight={user?.currentWeight}
                  goalWeight={user?.goalWeight}
                  weightHistory={userData?.weightHistory}
                />
              </div>

              {/* Activities and Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <ActivityCard activities={activities.daily || []} />
                </div>

                <div>
                  <Card title="AI Insights" subtitle="Latest recommendations">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {insights.all && insights.all.length > 0 ? (
                        insights.all
                          .slice(0, 3)
                          .map((insight, idx) => (
                            <InsightCard key={idx} insight={insight} />
                          ))
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No insights available yet
                        </p>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
