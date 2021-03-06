const { EventEmitter, captureRejectionSymbol, once } = require("events");

class Controller extends EventEmitter {
  constructor() {
    super({ captureRejections: true });
  }
  set struct(struct) {
    for (var name in struct) {
      for (var args of struct[name]) {
        switch (name) {
        case "on":
          this.on(...args);
          break;
        case "once":
          this.once(...args);
          break;
        case "off":
          this.off(...args);
          break;
        case "pre":
          this.prependListener(...args);
          break;
        case "remove":
          this.removeListener(...args);
          break;
        }
      }
    }
  }
  [captureRejectionSymbol](err, event, ...args) {
    console.log("Rejection happened for", event, "with", err, ...args);
  }
}

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

class Scene {
  constructor(name) {
    this.name = name;
    this.scene = global.Scenes.scene[name] = new SceneBase(name);
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

class InlineController {
  constructor() {
    this.stack = [];
    this.map = new Map();
  }
  goBack() {
    this.stack.pop();
    return this;
  }
  go(name) {
    this.stack.push(this.map[name]);
    return this;
  }
  stage(object) {
    for (const key in object) {
      this.map[key] = object[key];
    }
    return this;
  }
  now(...parametrs)
  {
    console.log(this.stack);
    if (this.stack)
      return this.stack[this.stack.length - 1](...parametrs);
    else
      return undefined;
  }
}

// Единыжды создаст контроллер и сцены (восстановит в случае чего)
if (global.Scenes === undefined) global.Scenes = new Scenes();
if (global.Controller === undefined) global.Controller = new Controller();

module.exports = {
  Scene,
  Scenes,
  Stage,
  session,
  Markup,
  Extra,
  Telegraf,
  once,
  InlineController,
};
