const services = {
  database: {
    status: "starting",
    message: "Connecting to SQLite...",
    lastChecked: null,
  },

  twitch: {
    status: "starting",
    message: "Waiting for Ray to become ready...",
    lastChecked: null,
  },

  youtube: {
    status: "starting",
    message: "Waiting for Ray to become ready...",
    lastChecked: null,
  },
};

function updateService(name, status, message = null) {
  if (!services[name]) {
    throw new Error(`Unknown health service: ${name}`);
  }

  services[name] = {
    status,
    message,
    lastChecked: Date.now(),
  };
}

function getService(name) {
  return services[name] ?? null;
}

function getAllServices() {
  return { ...services };
}

module.exports = {
  updateService,
  getService,
  getAllServices,
};
