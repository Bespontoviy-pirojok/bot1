const Telegraf = require("telegraf");
const { Stage, session, Markup, Extra } = Telegraf;
const SceneBase = require("telegraf/scenes/base");

// Если нам понадобиться разбыть сцены по группам
class Scenes {
  constructor() {
    this.scenesMap = new Map();
  }
  get stage() {
    return new Stage(this.scenes);
  }
  get scene() {
    return this.scenesMap;
  }
  get scenes() {
    return Object.values(this.scenesMap);
  }
  scenesId() {
    return this.scenes.map((scene) => scene.id);
  }
}

// Единыжды создаст контроллер сцен
if (global.ScenesController === undefined)
  global.ScenesController = new Scenes();

class Scene {
  constructor(name) {
    this.name = name;
    this.scene = global.ScenesController.scene[name] = new SceneBase(name);
  }
  get struct() {
    return this.sceneStruct;
  }
  set struct(obj) {
    this.sceneStruct = obj || this.sceneStruct || {};
    console.log(this.name, obj);
    for (var name in this.sceneStruct) {
      for (var args of this.sceneStruct[name]) {
        switch (name) {
        case "on":
          this.scene.on(...args);
          break;
        case "enter":
          this.scene.enter(...args);
          break;
        case "action":
          this.scene.action(...args);
          break;
        default:
        }
      }
    }
  }
}

// Это работает примерно так
// то есть нужно будет разметить
// сам по себе класс может содержать любого рода штуки
class templet extends Scene {
  constructor() {
    super("templet");
    super.struct = {
      on: [
        ["text", onText],
        ["photo", onPhoto],
      ],
      start: [main],
    };
  }
  main(ctx) {
    ctx.reply("Main");
  }
  onText(ctx) {
    ctx.reply("Чё");
  }
  onPhoto(ctx) {
    ctx.reply("Вау");
  }
}
//=============================

module.exports = { Scene, Scenes, Stage, session, Markup, Extra, Telegraf };
