const { createCanvas } = require("canvas");
const colors = require("../../../core/config/colors");

function createCard(width = 1200, height = 630) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  return {
    canvas,
    ctx,
    width,
    height,
    colors,
  };
}

module.exports = {
  createCard,
};
