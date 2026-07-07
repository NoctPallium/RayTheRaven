const path = require("path");
const { registerFont } = require("canvas");

function register(file, family, weight = "normal") {
  const filePath = path.join(__dirname, "../../../assets/fonts", file);

  console.log(`Loading: ${filePath}`);

  registerFont(filePath, {
    family,
    weight,
  });

  console.log(`✅ Registered ${family} (${weight})`);
}

register("Poppins-Regular.ttf", "Poppins", "normal");
register("Poppins-Bold.ttf", "Poppins", "bold");
register("Cinzel-Bold.ttf", "Cinzel", "bold");

console.log("✅ Fonts registered.");

module.exports = {};
