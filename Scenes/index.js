const SendWork = require("./SendWorkScenes")
const MyRates = require("./MyRatesScenes")
const Saved = require("./SavedScenes")
const Rate = require("./RateScenes")

const AllScenes = [SendWork, MyRates, Saved, Rate]
let ScenesArray = []
AllScenes.forEach(elm=> {
    ScenesArray = ScenesArray.concat(elm.getScenes())
})

module.exports.ScenesArray = ScenesArray
