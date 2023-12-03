export function getWeekInfo(date: any) {
  const target = new Date(date) as any;
  target.setHours(0, 0, 0);
  target.setDate(target.getDate() + 4 - (target.getDay() || 7));

  const yearStart = new Date(target.getFullYear(), 0, 1) as any;
  const diff = (target - yearStart) / 86400000;
  const weekNumber = (1 + Math.floor(diff / 7)) as any;

  return {
    week: weekNumber,
    progress: `${((weekNumber * 100) / 52).toFixed(0)}%`,
  };
}
