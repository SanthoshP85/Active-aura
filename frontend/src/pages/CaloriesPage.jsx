/**
 * CaloriesPage
 * Calorie tracking page
 */

import { useState, useEffect } from "react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { Modal } from "../components/common/Modal";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { caloriesService } from "../services/caloriesService";
import { Plus, Trash2 } from "lucide-react";

export const CaloriesPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyData, setDailyData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    foodName: "",
    mealType: "breakfast",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  // Fetch daily calories when date changes
  useEffect(() => {
    fetchDailyCalories(selectedDate);
  }, [selectedDate]);

  const fetchDailyCalories = async (date) => {
    setIsLoading(true);
    try {
      const response = await caloriesService.getDailySummary(date);
      setDailyData(response);
    } catch (error) {
      console.error("Failed to fetch daily calories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await caloriesService.logFood({
        ...formData,
        date: selectedDate,
      });
      setFormData({
        foodName: "",
        mealType: "breakfast",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      });
      setIsModalOpen(false);
      // Refresh daily data
      fetchDailyCalories(selectedDate);
    } catch (error) {
      console.error("Failed to log food:", error);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const meals = [
    { type: "breakfast", label: "Breakfast" },
    { type: "lunch", label: "Lunch" },
    { type: "dinner", label: "Dinner" },
    { type: "snacks", label: "Snacks" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4">Calorie Tracking</h1>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate.toISOString().split("T")[0]}
                onChange={handleDateChange}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <span className="text-gray-600">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Log Food
          </Button>
        </div>

        {/* Daily Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card title="Total Calories">
            <p className="text-3xl font-bold text-primary-600">
              {dailyData?.totalCalories || 0}
            </p>
            <p className="text-sm text-gray-600 mt-2">Target: 2000 kcal</p>
          </Card>

          <Card title="Protein">
            <p className="text-3xl font-bold text-blue-600">
              {dailyData?.totalProtein || 0}g
            </p>
            <p className="text-sm text-gray-600 mt-2">Target: 120g</p>
          </Card>

          <Card title="Carbs">
            <p className="text-3xl font-bold text-green-600">
              {dailyData?.totalCarbs || 0}g
            </p>
            <p className="text-sm text-gray-600 mt-2">Target: 250g</p>
          </Card>

          <Card title="Fats">
            <p className="text-3xl font-bold text-orange-600">
              {dailyData?.totalFats || 0}g
            </p>
            <p className="text-sm text-gray-600 mt-2">Target: 65g</p>
          </Card>
        </div>

        {/* Meals by Type */}
        <div className="space-y-6">
          {meals.map((meal) => {
            const mealItems = dailyData?.meals?.[meal.type] || [];
            return (
              <Card key={meal.type} title={meal.label}>
                {mealItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No foods logged for {meal.label.toLowerCase()}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                          <th className="text-left p-3 font-medium">
                            Food Name
                          </th>
                          <th className="text-right p-3 font-medium">
                            Calories
                          </th>
                          <th className="text-right p-3 font-medium">
                            Protein
                          </th>
                          <th className="text-right p-3 font-medium">Carbs</th>
                          <th className="text-right p-3 font-medium">Fats</th>
                          <th className="text-center p-3 font-medium">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {mealItems.map((food) => (
                          <tr
                            key={food._id}
                            className="border-b border-gray-200 hover:bg-gray-50"
                          >
                            <td className="p-3">{food.foodName}</td>
                            <td className="text-right p-3 font-semibold">
                              {food.calories}
                            </td>
                            <td className="text-right p-3">
                              {food.protein || 0}g
                            </td>
                            <td className="text-right p-3">
                              {food.carbs || 0}g
                            </td>
                            <td className="text-right p-3">
                              {food.fats || 0}g
                            </td>
                            <td className="text-center p-3">
                              <button className="text-red-500 hover:text-red-700 transition-colors">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Meal Subtotal */}
                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                      <div className="grid grid-cols-4 gap-8 text-sm font-semibold">
                        <div className="text-right">
                          <p className="text-gray-600">Calories:</p>
                          <p>
                            {mealItems.reduce(
                              (sum, food) => sum + (food.calories || 0),
                              0,
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">Protein:</p>
                          <p>
                            {mealItems.reduce(
                              (sum, food) => sum + (food.protein || 0),
                              0,
                            )}
                            g
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">Carbs:</p>
                          <p>
                            {mealItems.reduce(
                              (sum, food) => sum + (food.carbs || 0),
                              0,
                            )}
                            g
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">Fats:</p>
                          <p>
                            {mealItems.reduce(
                              (sum, food) => sum + (food.fats || 0),
                              0,
                            )}
                            g
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Food"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Food Name"
            value={formData.foodName}
            onChange={(e) =>
              setFormData({ ...formData, foodName: e.target.value })
            }
            placeholder="e.g., Chicken Breast"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Meal Type</label>
              <select
                value={formData.mealType}
                onChange={(e) =>
                  setFormData({ ...formData, mealType: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snacks">Snacks</option>
              </select>
            </div>

            <Input
              label="Calories"
              type="number"
              value={formData.calories}
              onChange={(e) =>
                setFormData({ ...formData, calories: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Protein (g)"
              type="number"
              value={formData.protein}
              onChange={(e) =>
                setFormData({ ...formData, protein: e.target.value })
              }
            />
            <Input
              label="Carbs (g)"
              type="number"
              value={formData.carbs}
              onChange={(e) =>
                setFormData({ ...formData, carbs: e.target.value })
              }
            />
            <Input
              label="Fats (g)"
              type="number"
              value={formData.fats}
              onChange={(e) =>
                setFormData({ ...formData, fats: e.target.value })
              }
            />
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Log Food
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default CaloriesPage;
