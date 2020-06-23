const { Scene, Markup, Extra } = require("./Scenes");
const { Works } = require("../messages.json");
const { ObjectID } = require("mongodb");

async function showToRate(ctx) {
  const user = ctx.user,
    show = ctx.session.show;
  await user.deleteLastNMessage(ctx);
  [show.index, show.indexWork] = [show.indexWork, show.index];
  ctx.session.show.messageSize = await user.sendWork(ctx);
  ctx.base.seenPost(ctx.from.id, show.array[show.index]._id);
  await ctx.reply(
    "Оцените работу!",
    Extra.HTML().markup((m) =>
      m.inlineKeyboard([
        [...Array(5).keys()].map((i) =>
          m.callbackButton(
            String(i + 1),
            String(i + 1) + "-" + show.array[show.index]._id
          )
        ),
        [m.callbackButton("Сохранить", "save-" + show.array[show.index]._id)],
      ])
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
      action: [
        [/([1-5])-([\w\D]*)/, this.ratePost],
        [/save-([\w\D]*)/, this.savePost],
      ],
      on: [["text", this.main]],
    };
  }

  async enter(ctx) {
    const { message_id, chat } = await ctx.reply(
      Works.special.Rate,
      Markup.keyboard(Works.rate.buttons).resize().extra()
    );
    ctx.session.caption = [chat.id, message_id];
    const user = await ctx.base.getUser(ctx.from.id);
    ctx.session.show = { index: user.page };
    ctx.session.show.messageSize = await ctx.user.sendWorksGroup(ctx);
    ctx.session.show.array = ctx.session.works;
  }
  async savePost(ctx) {
    await ctx.answerCbQuery();
    await ctx.base.savePost(ctx.chat.id, ObjectID(ctx.match[1]));
  }
  async ratePost(ctx) {
    const show = ctx.session.show;
    await ctx.answerCbQuery();
    // await ctx.editMessageReplyMarkup( //TODO: Эта штука должна отмечать что оценка выставлена
    //   ctx.message.chat.id,
    //   ctx.message.message_id,
    //   Extra.HTML().markup((m) =>
    //     m.inlineKeyboard([
    //       [...Array(5).keys()].map((i) =>
    //         m.callbackButton(
    //           (+ctx.match[1] === i + 1 ? "Выбрано " : "") + String(i + 1),
    //           String(i + 1) + "-" + show.array[show.index]._id
    //         )
    //       ),
    //       [m.callbackButton("Сохранить", "save-" + show.array[show.index]._id)],
    //     ])
    //   )
    // );
    // ctx.session.show.messageSize++;                        // TODO: Работает не правильно
    await ctx.user.checkDos(ctx);
    // setTimeout(async () => {
    //   ctx.telegram.deleteMessage(chat.id, message_id);     //
    //   ctx.session.show.messageSize--;                      //
    // }, 3000);
    //TODO: ctx.base.putRate(match[2]/*postId*/, match[1]/*rate*/);
    //TODO: ctx.base.userRate(ctx.from.id, match[2]/*postId*/)
  }

  async main(ctx) {
    const user = ctx.user,
      show = ctx.session.show;
    if (/[1-8]/.test(ctx.message.text)) {
      show.indexWork = +ctx.message.text - 1;
      show.array = ctx.session.works;
      if (!show.array[show.indexWork]) {
        await ctx.reply(Works.retry);
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
      ctx.base.putUser(ctx.from.id, { page: ctx.session.show.index });
      ctx.telegram.deleteMessage(...ctx.session.caption);
      await user.deleteLastNMessage(ctx);
      await user.goMain(ctx);
      break;
    }
  }
})();
