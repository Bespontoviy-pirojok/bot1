const { Scene, Markup } = require("./Scenes");


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
        "Сохраненные",
      Markup.keyboard(["Следующая страцница", "Предыдущая страцница", "Назад"]).resize().extra()
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
    case "Следующая страцница":
      await user.updateWith(user.shiftIndex(ctx, -1), user.sendWork);
      break;
    case "Предыдущая страцница":
      await user.updateWith(user.shiftIndex(ctx, 1), user.sendWork);
      break;
    case "Назад":
      ctx.telegram.deleteMessage(...ctx.session.caption);
      await user.deleteLastNMessage(ctx);
      await user.goMain(ctx);
      break;
    default:
      ctx.reply("Хуйню не неси");
      ctx.session.show.messageSize++;
    }
  }
})();
