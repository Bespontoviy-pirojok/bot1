if (global.ScenesController === undefined)
  ["SendWork", "MyWorks", "Saved", "Rate"].map((name) => {
    require("./" + name + "Scenes");
  });

module.exports = require("./Scenes");
