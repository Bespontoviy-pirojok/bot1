const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { Works } = require("../messages.json");

class SavedScenes {
  constructor() {
    this.scenes = {
      Saved: new Scene("Saved"),
    };

    this.scenes.Saved.enter(async (ctx) => {
      await ctx.reply(
        Works.special.Saved,
        Markup.keyboard(Works.buttons).resize().extra()
      );
      //  Получение объекта пользователя из базы
      const user = await ctx.base.getUser(ctx.from.id);

      let show = (ctx.session.show = {
        user: user,
        index: user.saved.length - 1,
        size: user.saved.length,
      });
      await ctx.wrap.sendWork(ctx, show.user.saved[show.index]);
    });

    this.scenes.Saved.on("text", async (ctx) => {
      const wrap = ctx.wrap,
        show = ctx.session.show;
      switch (ctx.message.text) {
      case Works.next:
        await wrap.deleteLastNMessage(ctx);
        wrap.shiftIndex(ctx, -1);
        await wrap.sendWork(ctx, show.user.saved[show.index]);
        break;
      case Works.prev:
        await wrap.deleteLastNMessage(ctx);
        wrap.shiftIndex(ctx, 1);
        await wrap.sendWork(ctx, show.user.saved[show.index]);
        break;
      case Works.back:
        await wrap.goMain(ctx);
        break;
      default:
        await ctx.reply(Works.default);
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
