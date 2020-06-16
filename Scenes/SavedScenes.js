const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const {tenPhotos} = require("../messages.json")

class SavedScenes {
  constructor() {
    // init scenes
    this.scenes = {
      Saved: new Scene("Saved"),
    };

    // Информация для обработки
    this.way = new Map();

    this.scenes.Saved.enter(async (ctx) => {
      await ctx.reply(
        tenPhotos.special.Saved,
        Markup.keyboard(tenPhotos.buttons)
          .resize()
          .extra()
      );
      const user = await ctx.base.getUser(ctx.from.id),
        id = user.id;
      let show = (this.way[id] = {
        user: user,
        index: user.saved.length - 1,
        size: 0,
      });
      show.size = await ctx.wrap.sendWork(show.user.saved[show.index]);
    });

    this.scenes.Saved.on("text", async (ctx) => {
      const id = ctx.from.id,
        show = this.way[id];
      switch (ctx.message.text) {
      case tenPhotos.next:
        await ctx.wrap.deleteLastNMessage(show.size + 1);
        show.index = ctx.wrap.shiftIndex(
          show.index,
          -1,
          show.user.saved.length
        );
        show.size = await ctx.wrap.sendWork(show.user.saved[show.index]);
        break;
      case tenPhotos.prev:
        await ctx.wrap.deleteLastNMessage(show.size + 1);
        show.index = ctx.wrap.shiftIndex(
          show.index,
          1,
          show.user.saved.length
        );
        show.size = await ctx.wrap.sendWork(show.user.saved[show.index]);
        break;
      case tenPhotos.back:
        this.way.delete(id);
        await ctx.wrap.goMain();
        break;
      default:
        await ctx.reply(tenPhotos.default);
      }
    });
  }

  getScene(name) {
    return this.scenes[name];
  }
  getScenes() {
    return Object.values(this.scenes);
  }
}

module.exports = new SavedScenes();
