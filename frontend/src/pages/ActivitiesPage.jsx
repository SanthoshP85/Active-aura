/**
 * ActivitiesPage
 * Activity tracking page
 */

import { useState } from "react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Modal } from "../components/common/Modal";
import { useData } from "../hooks/useData";
import { ACTIVITY_TYPES, INTENSITY_LEVELS } from "../utils/constants";
import { Plus } from "lucide-react";

export const ActivitiesPage = () => {
  const { activities, logActivity } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    workoutType: "gym",
    duration: "",
    caloriesBurned: "",
    intensity: "moderate",
    distance: "",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await logActivity({
        ...formData,
        date: new Date(),
      });
      setFormData({
        workoutType: "gym",
        duration: "",
        caloriesBurned: "",
        intensity: "moderate",
        distance: "",
        notes: "",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  const totalCalories = (activities.daily || []).reduce(
    (sum, a) => sum + a.caloriesBurned,
    0,
  );
  const totalDuration = (activities.daily || []).reduce(
    (sum, a) => sum + a.duration,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Activity Tracking</h1>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Log Activity
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card title="Today's Activity">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Workouts</p>
                <p className="text-2xl font-bold">
                  {activities.daily?.length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Total Duration">
            <p className="text-2xl font-bold">{totalDuration} min</p>
          </Card>

          <Card title="Calories Burned">
            <p className="text-2xl font-bold">{totalCalories} kcal</p>
          </Card>
        </div>

        {/* Activity List */}
        <Card title="Recent Activities">
          <div className="space-y-2">
            {(activities.daily || []).length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No activities logged yet
              </p>
            ) : (
              (activities.daily || []).map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <p className="font-semibold capitalize">
                      {activity.workoutType}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.intensity} intensity
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {activity.caloriesBurned} kcal
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.duration} min
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Activity"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Workout Type</label>
            <select
              value={formData.workoutType}
              onChange={(e) =>
                setFormData({ ...formData, workoutType: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (min)"
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              required
            />

            <Input
              label="Calories Burned"
              type="number"
              value={formData.caloriesBurned}
              onChange={(e) =>
                setFormData({ ...formData, caloriesBurned: e.target.value })
              }
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Intensity</label>
            <select
              value={formData.intensity}
              onChange={(e) =>
                setFormData({ ...formData, intensity: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {INTENSITY_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Distance (km)"
            type="number"
            step="0.1"
            value={formData.distance}
            onChange={(e) =>
              setFormData({ ...formData, distance: e.target.value })
            }
          />

          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="How did you feel?"
          />

          <Button type="submit" variant="primary" className="w-full">
            Log Activity
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ActivitiesPage;
