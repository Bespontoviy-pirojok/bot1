const SendWork = require("./SendWorkScenes");
const MyWorks = require("./MyWorksScenes");
const Saved = require("./SavedScenes");
const Rate = require("./RateScenes");

const AllScenes = [SendWork, MyWorks, Saved, Rate];
let ScenesArray = [];
AllScenes.forEach((elm) => {
  ScenesArray = ScenesArray.concat(elm.getScenes());
});

module.exports.ScenesArray = ScenesArray;
