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
      index: ((saved.length-1) / 8) | 0,
      size: saved.length,
      array: saved,
    };
    console.log(saved);
    //  Отправка пользователю работ
    ctx.session.show.messageSize = await ctx.user.sendPage(ctx);
    await ctx.user.needNumber(ctx, "просмотра");
  }

  async main(ctx) {
    const user = ctx.user,
      show = ctx.session.show;
    
    if (/[1-8]/.test(ctx.message.text)) {
      user.deleteLastNMessage(ctx);
      show.indexWork = +ctx.message.text - 1;
      show.array = ctx.session.works;
      if (!show.array[show.indexWork]) {
        await ctx.reply(
          "Работы с таким номером не существует, попробуйте заново."
        );
        await user.checkDos(ctx, user.deleteLastNMessage);
        show.messageSize += 1;
      } else show.messageSize = await ctx.user.sendWork(ctx);
      return;
    }
    
    switch (ctx.message.text) {
    case "Следующая страцница":
      await user.updateWith(user.shiftIndex(ctx, -1), user.sendPage);
      await ctx.user.needNumber(ctx, "просмотра");
      break;
    case "Предыдущая страцница":
      await user.updateWith(user.shiftIndex(ctx, 1), user.sendPage);
      await ctx.user.needNumber(ctx, "просмотра");
      break;
    case "Назад":
      await user.goMain(ctx);
      break;
    default:
      ctx.reply("Хуйню не неси");
      ctx.session.show.messageSize++;
    }
  }
})();
