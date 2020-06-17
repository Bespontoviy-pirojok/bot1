const AllScenes = ["SendWork", "MyWorks", "Saved", "Rate"];
let ScenesArray = [];
AllScenes.forEach((name) => {
  ScenesArray = ScenesArray.concat(require("./" + name + "Scenes").getScenes());
});

module.exports.ScenesArray = ScenesArray;
