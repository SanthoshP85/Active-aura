/**
 * GoalsPage
 * Fitness goals management page
 */

import { useState, useEffect } from "react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { Input } from "../components/common/Input";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useData } from "../hooks/useData";
import { FITNESS_GOALS } from "../utils/constants";
import { Plus, AlertCircle } from "lucide-react";

export const GoalsPage = () => {
  const { goals, createGoal, fetchGoals } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    goalType: "weight_loss",
    goalWeight: "",
    targetCalories: "2000",
    timeline: "12",
    proteinTarget: "",
    carbsTarget: "",
    fatsTarget: "",
  });

  // Fetch goals on mount
  useEffect(() => {
    fetchGoals().catch((err) => {
      setError(err.response?.data?.message || "Failed to fetch goals");
    });
  }, [fetchGoals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createGoal(formData);
      setFormData({
        goalType: "weight_loss",
        goalWeight: "",
        targetCalories: "2000",
        timeline: "12",
        proteinTarget: "",
        carbsTarget: "",
        fatsTarget: "",
      });
      setIsModalOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create goal. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Fitness Goals</h1>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> New Goal
          </Button>
        </div>

        {goals.isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(goals.all || []).length === 0 ? (
              <Card className="col-span-full text-center py-12">
                <p className="text-gray-500 mb-4">No goals created yet</p>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Create Your First Goal
                </Button>
              </Card>
            ) : (
              (goals.all || []).map((goal, idx) => (
                <Card
                  key={idx}
                  title={goal.goalType.replace("_", " ").toUpperCase()}
                >
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Goal Weight</p>
                      <p className="text-lg font-semibold">
                        {goal.goalWeight} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Target Calories</p>
                      <p className="text-lg font-semibold">
                        {goal.targetCalories} kcal/day
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Timeline</p>
                      <p className="text-lg font-semibold">
                        {goal.timeline} weeks
                      </p>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Progress</p>
                      <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary-600 h-full rounded-full"
                          style={{ width: `${goal.progressPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-sm font-semibold mt-2">
                        {goal.progressPercentage}%
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Goal"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Goal Type</label>
            <select
              value={formData.goalType}
              onChange={(e) =>
                setFormData({ ...formData, goalType: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              {FITNESS_GOALS.map((goal) => (
                <option key={goal} value={goal}>
                  {goal.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Goal Weight (kg)"
            type="number"
            step="0.1"
            value={formData.goalWeight}
            onChange={(e) =>
              setFormData({ ...formData, goalWeight: e.target.value })
            }
            required
          />

          <Input
            label="Target Daily Calories"
            type="number"
            value={formData.targetCalories}
            onChange={(e) =>
              setFormData({ ...formData, targetCalories: e.target.value })
            }
            required
          />

          <Input
            label="Timeline (weeks)"
            type="number"
            value={formData.timeline}
            onChange={(e) =>
              setFormData({ ...formData, timeline: e.target.value })
            }
            required
          />

          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Macro Targets (Optional - will be auto-calculated)
            </p>

            <Input
              label="Protein Target (g)"
              type="number"
              step="0.1"
              value={formData.proteinTarget}
              onChange={(e) =>
                setFormData({ ...formData, proteinTarget: e.target.value })
              }
              placeholder="Leave empty for auto-calculation"
            />

            <Input
              label="Carbs Target (g)"
              type="number"
              step="0.1"
              value={formData.carbsTarget}
              onChange={(e) =>
                setFormData({ ...formData, carbsTarget: e.target.value })
              }
              placeholder="Leave empty for auto-calculation"
            />

            <Input
              label="Fats Target (g)"
              type="number"
              step="0.1"
              value={formData.fatsTarget}
              onChange={(e) =>
                setFormData({ ...formData, fatsTarget: e.target.value })
              }
              placeholder="Leave empty for auto-calculation"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" text="" /> Creating...
              </>
            ) : (
              "Create Goal"
            )}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default GoalsPage;
