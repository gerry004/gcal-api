// Function to calculate time difference between two date-times
function calculateTimeDifference(startDateTime, endDateTime) {
  const startDate = new Date(startDateTime);
  const endDate = new Date(endDateTime);

  // Calculate the difference in milliseconds
  const timeDifference = endDate - startDate;

  // Convert the time difference to seconds, minutes, hours, and days
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Calculate remaining hours, minutes, and seconds after days are subtracted
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  return {
    days,
    hours: remainingHours,
    minutes: remainingMinutes,
    seconds: remainingSeconds
  };
}

// Example usage
const startDateTime = '2024-01-21T12:00:00';
const endDateTime = '2024-01-22T15:30:45';

const timeDifference = calculateTimeDifference(startDateTime, endDateTime);

console.log('Time Difference:');
console.log(`Days: ${timeDifference.days}`);
console.log(`Hours: ${timeDifference.hours}`);
console.log(`Minutes: ${timeDifference.minutes}`);
console.log(`Seconds: ${timeDifference.seconds}`);
