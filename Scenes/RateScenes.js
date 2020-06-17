const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
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
      const wrap = ctx.wrap;
      if (/[0-9]/.test(ctx.message.text)) {
        ctx.session.curWork = {
          index: ctx.message.text
        };
        await wrap.deleteLastNMessage(ctx);
        ctx.scene.enter("RateCurrentWork");
        //TODO: сделать сцену с оценкой выбранного юзером поста

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
    this.scenes.RateCurrentWork.enter(async (ctx) => {
      const wrap = ctx.wrap;
      let curWork = ctx.session.curWork;
      console.log(curWork.index);
      const work = ctx.session.works[+curWork.index - 1];
      if (work === undefined) ctx.reply(Works.retry);
      else{
        await wrap.sendWork(ctx, work._id);
        await ctx.reply("Оцените работу!", Extra.HTML().markup((m)=>
            m.inlineKeyboard([...Array(5).keys()].map((a, i) => m.callbackButton(String(i), String(i)) ))));
      }
    });
    this.scenes.RateCurrentWork.action(/[1-5]/, async (ctx) => {
      await ctx.answerCbQuery();
      console.log(ctx.match[0]);
      await ctx.reply(`Хуйню неси. Твоя оценка: ${ctx.match[0]}`);
      // TODO: въебать оценку.
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
