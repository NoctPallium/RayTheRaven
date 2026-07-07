module.exports = function drawBackground(card) {
  const { ctx, width, height, colors } = card;

  // Background
  const gradient = ctx.createLinearGradient(0, 0, width, height);

  gradient.addColorStop(0, colors.background);
  gradient.addColorStop(1, "#05070D");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Left accent bar
  ctx.fillStyle = colors.primary;

  ctx.fillRect(0, 0, 12, height);
};
