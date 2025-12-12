console.log(">>> IoT client file loaded");
const { loadConfig } = require("./config");
const { generateSample } = require("./sensor");
const DrivingSession = require("./session");

async function sendReport(report, config) {
  console.log("Відправляю звіт на сервер:", config.serverUrl);

  try {
    const res = await fetch(config.serverUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report)
    });

    console.log("Статус відповіді сервера:", res.status);
    const data = await res.json().catch(() => ({}));
    console.log("Тіло відповіді:", data);
  } catch (err) {
    console.error("Помилка при відправці звіту:", err.message);
  }
}

async function runDemoSession() {
  const config = loadConfig();
  console.log("Конфігурація IoT-клієнта:", config);

  const studentId = process.argv[2] || "student-1";
  console.log("Починаємо сесію для учня:", studentId);

  const session = new DrivingSession(config, studentId);

  const N = 20; 
  for (let i = 0; i < N; i++) {
    const sample = generateSample(config);
    session.addSample(sample);
    console.log(
      `Sample #${i + 1}: speed=${sample.speed}, hardBrake=${sample.hardBrake}, laneViolation=${sample.laneViolation}, overspeed=${sample.overspeedEvent}`
    );
  }

  const report = session.finish();
  console.log("Підсумковий звіт сесії:", report);

  await sendReport(report, config);
}

runDemoSession().catch(err => {
  console.error("Фатальна помилка IoT-клієнта:", err);
});
