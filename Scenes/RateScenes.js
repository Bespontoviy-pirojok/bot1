const Scene = require("telegraf/scenes/base");
const { Markup, Extra } = require("telegraf");
const { Works } = require("../messages.json");

class RateScenes {
  constructor() {
    this.scenes = {
      Rate: new Scene("Rate"),
    };

    this.scenes.Rate.enter(async (ctx) => {
      await ctx.reply(
        Works.special.Rate,
        Markup.keyboard(Works.rate.buttons).resize().extra()
      );
      ctx.session.show = { index: 0 };
      await ctx.wrap.sendWorksGroup(ctx);
      ctx.session.show.array = ctx.session.works;
    });

    this.scenes.Rate.action(/([1-5])-([\w\D]*)/, async (ctx) => {
      await ctx.answerCbQuery();
      const { message_id, chat } = await ctx.reply(
        `Хуйню неси. Твоя оценка: ${ctx.match[1]}`
      );
      ctx.session.show.messageSize++;
      ctx.wrap.checkDos(ctx);
      setTimeout(() => {
        ctx.telegram.deleteMessage(chat.id, message_id);
        ctx.session.show.messageSize--;
      }, 3000);
      //TODO: ctx.base.putRate(match[2]/*postId*/, match[1]/*rate*/);
      //TODO: ctx.base.userRate(ctx.from.id, match[2]/*postId*/)
    });

    this.scenes.Rate.on("text", async (ctx) => {
      const wrap = ctx.wrap,
        show = ctx.session.show;
      if (/[0-9]/.test(ctx.message.text)) {
        show.indexWork = +ctx.message.text - 1;
        show.array = ctx.session.works;
        if (!show.array[show.indexWork]) {
          ctx.reply(Works.retry);
          show.messageSize += 2;
          wrap.checkDos(ctx, wrap.deleteLastNMessage);
        } else await this.showToRate(ctx);
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

  async showToRate(ctx) {
    const wrap = ctx.wrap,
      show = ctx.session.show;
    await wrap.deleteLastNMessage(ctx);
    [show.index, show.indexWork] = [show.indexWork, show.index];
    await wrap.sendWork(ctx);
    await ctx.reply(
      "Оцените работу!",
      Extra.HTML().markup((m) =>
        m.inlineKeyboard(
          [...Array(5).keys()].map((i) =>
            m.callbackButton(
              String(i + 1),
              String(i + 1) + "-" + show.array[show.index]._id
            )
          )
        )
      )
    );
    [show.index, show.indexWork] = [show.indexWork, show.index];
    show.messageSize++;
  }

  getScene(name) {
    return this.scenes[name];
  }
  getScenes() {
    return Object.values(this.scenes);
  }
}

module.exports = new RateScenes();
