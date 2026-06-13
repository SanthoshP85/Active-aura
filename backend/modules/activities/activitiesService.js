/**
 * Activities Service
 * Handles workout and activity tracking
 */

const Activities = require("../../models/Activities");
const { storeFitnessSummary } = require("../rag/ragService");

/**
 * Service: Log activity
 */
const logActivity = async (userId, activityData) => {
  // Parse date string to local timezone to avoid UTC conversion issues
  let activityDate;
  if (
    typeof activityData.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(activityData.date)
  ) {
    const [year, month, day] = activityData.date.split("-").map(Number);
    activityDate = new Date(year, month - 1, day, 12, 0, 0, 0); // Use noon to avoid edge cases
  } else {
    activityDate = new Date(activityData.date);
  }

  const activity = new Activities({
    userId,
    date: activityDate,
    workoutType: activityData.workoutType,
    duration: activityData.duration,
    caloriesBurned: activityData.caloriesBurned,
    intensity: activityData.intensity || "moderate",
    distance: activityData.distance || 0,
    heartRateAvg: activityData.heartRateAvg,
    heartRateMax: activityData.heartRateMax,
    notes: activityData.notes,
  });

  await activity.save();

  // Store in Redis for RAG retrieval
  const fitnessSummary = `Logged activity: ${activityData.workoutType} for ${activityData.duration} minutes at ${activityData.intensity} intensity. Burned ${activityData.caloriesBurned} calories.${activityData.distance ? ` Distance: ${activityData.distance}km.` : ""}`;
  try {
    await storeFitnessSummary(userId, fitnessSummary, "activity");
  } catch (error) {
    console.warn("⚠️ Failed to store in Redis:", error.message);
  }

  return activity;
};

/**
 * Service: Get activities for date range
 */
const getActivitiesRange = async (userId, startDate, endDate) => {
  const activities = await Activities.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 });

  return activities;
};

/**
 * Service: Get activities by date
 */
const getActivitiesByDate = async (userId, dateStr) => {
  // Parse date string and create UTC day boundaries
  // dateStr format: "YYYY-MM-DD"
  const [year, month, day] = dateStr.split("-").map(Number);

  // Create UTC day boundaries (00:00:00 to 23:59:59 UTC for the given date)
  const startUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const endUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

  console.log(`Querying activities for ${dateStr}:`, {
    startUTC: startUTC.toISOString(),
    endUTC: endUTC.toISOString(),
  });

  const activities = await Activities.find({
    userId,
    createdAt: {
      $gte: startUTC,
      $lte: endUTC,
    },
  }).sort({ createdAt: -1 });

  return activities;
};

/**
 * Service: Get weekly activity summary
 */
const getWeeklySummary = async (userId, date) => {
  // Get the start of the week (Monday)
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  // Get the end of the week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const activities = await Activities.find({
    userId,
    date: {
      $gte: startOfWeek,
      $lte: endOfWeek,
    },
  }).sort({ date: 1 });

  // Calculate summary
  const summary = {
    weekStart: startOfWeek,
    weekEnd: endOfWeek,
    totalDuration: 0,
    totalCaloriesBurned: 0,
    workoutCount: activities.length,
    workoutsByType: {},
    activities,
  };

  activities.forEach((activity) => {
    summary.totalDuration += activity.duration;
    summary.totalCaloriesBurned += activity.caloriesBurned;

    if (!summary.workoutsByType[activity.workoutType]) {
      summary.workoutsByType[activity.workoutType] = 0;
    }
    summary.workoutsByType[activity.workoutType]++;
  });

  return summary;
};

/**
 * Service: Update activity
 */
const updateActivity = async (userId, activityId, updateData) => {
  const activity = await Activities.findById(activityId);

  if (!activity) {
    throw new Error("Activity not found");
  }

  if (activity.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  Object.assign(activity, updateData);
  await activity.save();

  return activity;
};

/**
 * Service: Delete activity
 */
const deleteActivity = async (userId, activityId) => {
  const activity = await Activities.findById(activityId);

  if (!activity) {
    throw new Error("Activity not found");
  }

  if (activity.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  await Activities.findByIdAndDelete(activityId);

  return { message: "Activity deleted" };
};

module.exports = {
  logActivity,
  getActivitiesRange,
  getActivitiesByDate,
  getWeeklySummary,
  updateActivity,
  deleteActivity,
};
