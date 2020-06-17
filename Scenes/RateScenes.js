const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { Works } = require("../messages.json");

class RateScenes {
  constructor() {
    this.scenes = {
      Rate: new Scene("Rate"),
      RateCurrentWork: new Scene("RateCurrentWork"),
    };

    this.scenes.Rate.enter(async (ctx) => {
      await ctx.reply(
        Works.special.Rate,
        Markup.keyboard(Works.rate.buttons).resize().extra()
      );
      ctx.session.show = { index: 0 };
      await ctx.wrap.sendWorksGroup(ctx);
    });
    this.scenes.Rate.on("text", async (ctx) => {
      const wrap = ctx.wrap,
        show = ctx.session.show;
      if (/[0-9]/.test(ctx.message.text)) {
        //TODO: сделать сцену с оценкой выбранного юзером поста
        await wrap.deleteLastNMessage(ctx);
        const work = ctx.session.works[+ctx.message.text - 1];
        if (work === undefined) ctx.reply(Works.retry);
        else wrap.sendWork(ctx, work._id);
        return;
      }
      switch (ctx.message.text) {
      case Works.next:
        await wrap.deleteLastNMessage(ctx);
        wrap.shiftIndex(ctx, 1);
        await wrap.sendWorksGroup(ctx);
        break;
      case Works.prev:
        await wrap.deleteLastNMessage(ctx);
        wrap.shiftIndex(ctx, -1);
        await wrap.sendWorksGroup(ctx);
        break;
      case Works.back:
        await wrap.goMain(ctx);
        break;
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

module.exports = new RateScenes();
