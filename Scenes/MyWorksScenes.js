const { Scene, Markup } = require("./Scenes");

new (class MyWorksScene extends Scene {
  constructor() {
    super("MyWorks");
    super.struct = {
      enter: [[this.enter]],
      on: [["text", this.main]],
    };
  }

  async enter(ctx) {
    const { message_id, chat } = await ctx.reply(
      "Оценки моих работ",
      Markup.keyboard(["Следующая страцница", "Предыдущая страцница", "Назад"]).resize().extra()
    );
    ctx.session.caption = [chat.id, message_id];
    const posted = (await ctx.base.getUser(ctx.from.id)).posted;
    //  Индексация кеша
    ctx.session.show = {
      index: posted.length - 1,
      size: posted.length,
      array: posted,
    };
    await ctx.user.sendWork(ctx);
  }

  async main(ctx) {
    const user = ctx.user;
    switch (ctx.message.text) {
    case "Следующая страцница":
      user.updateWith(user.shiftIndex(ctx, -1), user.sendWork);
      break;
    case "Предыдущая страцница":
      user.updateWith(user.shiftIndex(ctx, 1), user.sendWork);
      break;
    case "Назад":
      ctx.telegram.deleteMessage(...ctx.session.caption);
      await user.deleteLastNMessage(ctx);
      await user.goMain(ctx);
      break;
    default:
      await ctx.reply("Хуйню не неси");
    }
  }
})();
