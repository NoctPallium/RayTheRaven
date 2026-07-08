function getRequiredXP(level) {
  return 100 * Math.pow(level + 1, 2);
}

module.exports = {
  getRequiredXP,
};
