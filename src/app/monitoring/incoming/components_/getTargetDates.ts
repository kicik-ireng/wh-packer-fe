// src/utils/getTargetDates.ts
import dayjs from "dayjs";

export function getTargetDatesForToday(): string[] {
  const today = dayjs();
  const dow = today.day(); // Sunday = 0, Monday = 1, ..., Saturday = 6

  if (dow === 1) {
    // Monday: include Friday and Monday
    return [
      today.format("DD/MM/YYYY"),
      today.subtract(3, "day").format("DD/MM/YYYY"),
    ];
  }

  if (dow >= 2 && dow <= 5) {
    // Tuesday to Friday: today and yesterday
    return [
      today.format("DD/MM/YYYY"),
      today.subtract(1, "day").format("DD/MM/YYYY"),
    ];
  }

  // Weekend or fallback (you can customize this part)
  return [today.format("DD/MM/YYYY")];
}
