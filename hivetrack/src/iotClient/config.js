const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "config.json");

function getDefaultConfig() {
  return {
    serverUrl: "http://localhost:3000/api/iot/sessions",
    instructorId: "inst-default",
    groupId: "group-default",
    carId: "car-default",
    sendIntervalSec: 5,
    speedLimit: 60,
    k1: 5,
    k2: 7,
    k3: 3
  };
}

function validateConfig(cfg) {
  if (!cfg.serverUrl || typeof cfg.serverUrl !== "string") return false;
  if (!cfg.instructorId || !cfg.groupId || !cfg.carId) return false;
  if (typeof cfg.sendIntervalSec !== "number" || cfg.sendIntervalSec <= 0) return false;
  if (typeof cfg.speedLimit !== "number" || cfg.speedLimit <= 0) return false;
  if (cfg.k1 <= 0 || cfg.k2 <= 0 || cfg.k3 <= 0) return false;
  return true;
}

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    const cfg = JSON.parse(raw);
    if (!validateConfig(cfg)) {
      console.warn("Конфігурація некоректна, використовую значення за замовчуванням.");
      return getDefaultConfig();
    }
    return cfg;
  } catch (e) {
    console.warn("Не вдалося прочитати config.json, використовую значення за замовчуванням.");
    return getDefaultConfig();
  }
}

module.exports = {
  loadConfig,
  getDefaultConfig
};
