const { Scene, Markup } = require("./Scenes");
const { Works } = require("../messages.json");

new (class SavedScene extends Scene {
  constructor() {
    super("Saved");
    super.struct = {
      enter: [[this.enter]],
      on: [["text", this.main]],
    };
  }

  async enter(ctx) {
    const { message_id, chat } = await ctx.reply(
      Works.special.Saved,
      Markup.keyboard(Works.buttons).resize().extra()
    );
    ctx.session.caption = [chat.id, message_id];
    //  Получение объекта пользователя из базы
    const saved = (await ctx.base.getUser(ctx.from.id)).saved;
    //  Индексация кеша
    ctx.session.show = {
      index: saved.length - 1,
      size: saved.length,
      array: saved,
    };
    //  Отправка пользователю работ
    ctx.session.show.messageSize = await ctx.user.sendWork(ctx);
  }

  async main(ctx) {
    const user = ctx.user;

    switch (ctx.message.text) {
    case Works.next:
      await user.updateWith(user.shiftIndex(ctx, -1), user.sendWork);
      break;
    case Works.prev:
      await user.updateWith(user.shiftIndex(ctx, 1), user.sendWork);
      break;
    case Works.back:
      ctx.telegram.deleteMessage(...ctx.session.caption);
      await user.deleteLastNMessage(ctx);
      await user.goMain(ctx);
      break;
    default:
      ctx.reply(Works.default);
      ctx.session.show.messageSize++;
    }
  }
})();
