function calculateBackoff(retryCount, baseDelayMs = 1000) {
  return Math.min(baseDelayMs * Math.pow(2, retryCount), 60000);
}
module.exports = { calculateBackoff };
