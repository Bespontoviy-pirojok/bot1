const { Scene, Markup, Extra } = require("./Scenes");
const { Works } = require("../messages.json");

async function showToRate(ctx) {
  const user = ctx.user,
    show = ctx.session.show;
  await user.deleteLastNMessage(ctx);
  [show.index, show.indexWork] = [show.indexWork, show.index];
  await user.sendWork(ctx);
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

new (class RateScene extends Scene {
  constructor() {
    super("Rate");
    super.struct = {
      enter: [[this.enter]],
      action: [[/([1-5])-([\w\D]*)/, this.ratePost]],
      on: [["text", this.main]],
    };
  }

  async enter(ctx) {
    await ctx.reply(
      Works.special.Rate,
      Markup.keyboard(Works.rate.buttons).resize().extra()
    );
    ctx.session.show = { index: 0 };
    await ctx.user.sendWorksGroup(ctx);
    ctx.session.show.array = ctx.session.works;
  }

  async ratePost(ctx) {
    await ctx.answerCbQuery();
    const { message_id, chat } = await ctx.reply(
      `Хуйню неси. Твоя оценка: ${ctx.match[1]}`
    );
    ctx.session.show.messageSize++;
    await ctx.user.checkDos(ctx);
    setTimeout(() => {
      ctx.telegram.deleteMessage(chat.id, message_id);
      ctx.session.show.messageSize--;
    }, 3000);
    //TODO: ctx.base.putRate(match[2]/*postId*/, match[1]/*rate*/);
    //TODO: ctx.base.userRate(ctx.from.id, match[2]/*postId*/)
  }

  async main(ctx) {
    const user = ctx.user,
      show = ctx.session.show;
    if (/[0-9]/.test(ctx.message.text)) {
      show.indexWork = +ctx.message.text - 1;
      show.array = ctx.session.works;
      if (!show.array[show.indexWork]) {
        ctx.reply(Works.retry);
        await user.checkDos(ctx, user.deleteLastNMessage);
        show.messageSize += 2;
      } else await showToRate(ctx);
      return;
    }

    switch (ctx.message.text) {
    case Works.next:
      user.updateWith(user.shiftIndex(ctx, 1), user.sendWorksGroup);
      break;
    case Works.prev:
      user.updateWith(user.shiftIndex(ctx, -1), user.sendWorksGroup);
      break;
    case Works.back:
      await user.goMain(ctx);
      break;
    }
  }
})();
