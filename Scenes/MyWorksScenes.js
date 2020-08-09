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
<<<<<<< HEAD
      Markup.keyboard([["Следующая страцница", "Предыдущая страцница"], ["Назад"]]).resize().extra()
=======
      Markup.keyboard([["Следующая страница", "Предыдущая страница"], "Назад"]).resize().extra()
>>>>>>> 56c537133f01e9d37d1a5367aed18361c98c5dff
    );
    ctx.session.caption = [chat.id, message_id];
    const posted = (await ctx.base.getUser(ctx.from.id)).posted;
    //  Индексация кеша
    ctx.session.show = {
      index: ((posted.length - 1) / 8) | 0,
      size: posted.length,
      array: posted,
    };
    ctx.session.show.messageSize = await ctx.user.sendPage(ctx);
    await ctx.user.needNumber(ctx, "просмотра оценки");
  }

  async main(ctx) {
    const user = ctx.user,
      show = ctx.session.show;
    
    if (/[1-8]/.test(ctx.message.text)) {
      show.indexWork = +ctx.message.text - 1;
      show.array = ctx.session.works;
      user.deleteLastNMessage(ctx);
      if (!show.array[show.indexWork]) {
        await ctx.reply(
          "Работы с таким номером не существует, попробуйте заново."
        );
        await user.checkDos(ctx, user.deleteLastNMessage);
        show.messageSize += 1;
      } else show.messageSize = await ctx.user.sendWork(ctx, show.array[show.indexWork]._id);
      return;
    }
    
    switch (ctx.message.text) {
    case "Следующая страница":
      await user.updateWith(user.shiftIndex(ctx, -1), user.sendPage);
      await ctx.user.needNumber(ctx, "просмотра оценки");      
      break;
    case "Предыдущая страница":
      await user.updateWith(user.shiftIndex(ctx, 1), user.sendPage);
      await ctx.user.needNumber(ctx, "просмотра оценки");
      break;
    case "Назад":
      await user.goMain(ctx);
      break;
    default:
      await ctx.reply("Хуйню не неси");
    }
  }
})();
