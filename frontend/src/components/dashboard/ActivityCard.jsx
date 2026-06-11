/**
 * ActivityCard Component
 * Display recent activities/workouts
 */

import { Card } from "../common/Card";
import { Dumbbell, Clock, Flame } from "lucide-react";
import { formatDuration, formatCalories } from "../../utils/formatters";
import { formatDate } from "../../utils/formatters";

export const ActivityCard = ({ activities = [] }) => {
  const totalCalories = activities.reduce(
    (sum, a) => sum + a.caloriesBurned,
    0,
  );
  const totalDuration = activities.reduce((sum, a) => sum + a.duration, 0);

  return (
    <Card
      title="Recent Activities"
      subtitle={`${activities.length} workouts`}
      className="space-y-4"
    >
      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No activities logged yet
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-primary-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock size={16} />
                <span>Total Duration</span>
              </div>
              <p className="text-lg font-semibold">
                {formatDuration(totalDuration)}
              </p>
            </div>
            <div className="bg-warning-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Flame size={16} />
                <span>Calories Burned</span>
              </div>
              <p className="text-lg font-semibold">
                {formatCalories(totalCalories)}
              </p>
            </div>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {activities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium capitalize">
                    {activity.workoutType}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(activity.date, "MMM d, h:mm a")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCalories(activity.caloriesBurned)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDuration(activity.duration)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default ActivityCard;
