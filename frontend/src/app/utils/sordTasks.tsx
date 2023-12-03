export const handleSortTasks = (a, b) => {
  if (a.hour < b.hour) {
    return -1;
  } else if (a.hour > b.hour) {
    return 1;
  }

  if (a.minute < b.minute) {
    return -1;
  } else if (a.minute > b.minute) {
    return 1;
  }

  return 0;
};
