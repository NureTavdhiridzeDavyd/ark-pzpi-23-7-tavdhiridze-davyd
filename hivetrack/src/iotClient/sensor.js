
function generateSample(config) {
  // швидкість 
  const speed = Math.round(Math.random() * 100);

  // випадкові події 
  const hardBrake = Math.random() < 0.1 ? 1 : 0;      
  const laneViolation = Math.random() < 0.07 ? 1 : 0; 

  const overspeedEvent = speed > config.speedLimit ? 1 : 0;

  return {
    speed,
    hardBrake,
    laneViolation,
    overspeedEvent
  };
}

module.exports = { generateSample };
