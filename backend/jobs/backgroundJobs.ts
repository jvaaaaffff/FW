export const startBackgroundJobs = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log("Background jobs initialized...");
  }

  // Example job: runs every hour
  setInterval(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log("[Job] Running scheduled cleanup task...");
    }
    // Add background task logic here
  }, 1000 * 60 * 60);
};
