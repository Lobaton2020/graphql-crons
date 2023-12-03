export function getWeekInfo(date) {
  const target = new Date(date);
  target.setHours(0, 0, 0);
  target.setDate(target.getDate() + 4 - (target.getDay() || 7));

  const yearStart = new Date(target.getFullYear(), 0, 1);
  const diff = (target - yearStart) / 86400000;
  const weekNumber = 1 + Math.floor(diff / 7);

  return {
    week: weekNumber,
    progress: `${parseInt((weekNumber * 100) / 52)}%`,
  };
}
