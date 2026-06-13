/**
 * ActivitiesPage
 * Activity tracking page
 */

import { useState, useEffect } from "react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Modal } from "../components/common/Modal";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useData } from "../hooks/useData";
import { ACTIVITY_TYPES, INTENSITY_LEVELS } from "../utils/constants";
import {
  Plus,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

export const ActivitiesPage = () => {
  const { activities, logActivity, fetchDailyActivities } = useData();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    workoutType: "gym",
    duration: "",
    caloriesBurned: "",
    intensity: "moderate",
    distance: "",
    notes: "",
  });

  // Fetch activities when date changes
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setError(null);
        await fetchDailyActivities(selectedDate);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load activities");
      }
    };
    loadActivities();
  }, [selectedDate, fetchDailyActivities]);

  // Filter out empty values before submitting
  const buildPayload = () => {
    const payload = {
      workoutType: formData.workoutType,
      duration: Number(formData.duration),
      caloriesBurned: Number(formData.caloriesBurned),
      intensity: formData.intensity,
      date: selectedDate,
    };

    // Only add optional fields if they have values
    if (formData.distance && formData.distance.trim() !== "") {
      payload.distance = Number(formData.distance);
    }
    if (formData.notes && formData.notes.trim() !== "") {
      payload.notes = formData.notes.trim();
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await logActivity(buildPayload());
      await fetchDailyActivities(selectedDate);
      setFormData({
        workoutType: "gym",
        duration: "",
        caloriesBurned: "",
        intensity: "moderate",
        distance: "",
        notes: "",
      });
      setIsModalOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to log activity. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    // Don't allow future dates
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const totalCalories = (activities.daily || []).reduce(
    (sum, a) => sum + (a.caloriesBurned || 0),
    0,
  );
  const totalDuration = (activities.daily || []).reduce(
    (sum, a) => sum + (a.duration || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Activity Tracking</h1>
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousDay}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() =>
                  document.getElementById("activity-date-picker").showPicker()
                }
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer text-base font-medium flex items-center gap-2 min-w-[180px] justify-center"
              >
                <Calendar size={18} className="text-gray-500" />
                <span>
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </button>
              <input
                id="activity-date-picker"
                type="date"
                value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`}
                max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`}
                onChange={(e) => {
                  const [year, month, day] = e.target.value
                    .split("-")
                    .map(Number);
                  setSelectedDate(new Date(year, month - 1, day));
                }}
                className="sr-only"
              />
              <button
                onClick={goToNextDay}
                disabled={isToday}
                className={`p-2 rounded-lg transition-colors ${
                  isToday
                    ? "text-gray-300 cursor-not-allowed"
                    : "hover:bg-gray-200"
                }`}
              >
                <ChevronRight size={20} />
              </button>
              {!isToday && (
                <button
                  onClick={goToToday}
                  className="ml-2 text-sm text-primary-600 hover:underline"
                >
                  Go to Today
                </button>
              )}
            </div>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Log Activity
          </Button>
        </div>

        {activities.isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <Card title={isToday ? "Today's Activity" : "Activities"}>
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
            <Card title="Activities">
              <div className="space-y-2">
                {(activities.daily || []).length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No activities logged {isToday ? "today" : "for this day"}
                  </p>
                ) : (
                  (activities.daily || []).map((activity, idx) => (
                    <div
                      key={activity._id || idx}
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
          </>
        )}
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
            placeholder="How did you feel? (optional)"
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" text="" /> Logging...
              </>
            ) : (
              "Log Activity"
            )}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ActivitiesPage;
