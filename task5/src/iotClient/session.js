class DrivingSession {
  constructor(config, studentId) {
    this.config = config;
    this.studentId = studentId;

    this.speeds = [];
    this.hardBrakesTotal = 0;
    this.laneViolationsTotal = 0;
    this.overspeedEventsTotal = 0;

    this.startedAt = new Date();
    this.finishedAt = null;
  }

  addSample(sample) {
    this.speeds.push(sample.speed);
    this.hardBrakesTotal += sample.hardBrake;
    this.laneViolationsTotal += sample.laneViolation;
    this.overspeedEventsTotal += sample.overspeedEvent;
  }

  computeScore() {
    const { k1, k2, k3 } = this.config;
    const penalty =
      k1 * this.hardBrakesTotal +
      k2 * this.laneViolationsTotal +
      k3 * this.overspeedEventsTotal;
    const rawScore = 100 - penalty;
    return Math.max(0, rawScore);
  }

  getCategory(score) {
    if (score >= 80) return "Good";
    if (score >= 50) return "Need improvement";
    return "Bad";
  }

  finish() {
    this.finishedAt = new Date();

    const n = this.speeds.length || 1;
    const sumSpeed = this.speeds.reduce((acc, v) => acc + v, 0);
    const avgSpeed = sumSpeed / n;

    const score = this.computeScore();
    const category = this.getCategory(score);

    const durationMs = this.finishedAt - this.startedAt;
    const durationSec = Math.round(durationMs / 1000);

    return {
      studentId: this.studentId,
      instructorId: this.config.instructorId,
      groupId: this.config.groupId,
      carId: this.config.carId,
      startedAt: this.startedAt.toISOString(),
      finishedAt: this.finishedAt.toISOString(),
      durationSec,
      avgSpeed,
      hardBrakesTotal: this.hardBrakesTotal,
      laneViolationsTotal: this.laneViolationsTotal,
      overspeedEventsTotal: this.overspeedEventsTotal,
      score,
      category
    };
  }
}

module.exports = DrivingSession;
