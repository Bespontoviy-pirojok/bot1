const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

const { Works } = require("../messages.json");

class MyWorksScenes {
  constructor() {
    // Декларация сцен
    this.scenes = {
      MyWorks: new Scene("MyWorks"),
    };

    this.scenes.MyWorks.enter(async (ctx) => {
      await ctx.reply(
        Works.special.MyWorks,
        Markup.keyboard(Works.buttons).resize().extra()
      );
      const posted = (await ctx.base.getUser(ctx.from.id)).posted;
      //  Индексация кеша
      ctx.session.show = {
        index: posted.length - 1,
        size: posted.length,
        array: posted,
      };
      await ctx.wrap.sendWork(ctx);
    });

    this.scenes.MyWorks.on("text", async (ctx) => {
      const wrap = ctx.wrap;

      switch (ctx.message.text) {
      case Works.next:
        await wrap.deleteLastNMessage(ctx);
        wrap.shiftIndex(ctx, -1);
        await wrap.sendWork(ctx);
        break;
      case Works.prev:
        await wrap.deleteLastNMessage(ctx);
        wrap.shiftIndex(ctx, 1);
        await wrap.sendWork(ctx);
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

module.exports = new MyWorksScenes();
