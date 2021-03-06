const { Scene } = require("./Scenes");


new (class SavedScene extends Scene {
  constructor() {
    super("Saved");
    super.struct = {
      enter: [[this.enter]],
      on: [["text", this.main]],
    };
  }

  async enter(ctx) {
    const { message_id, chat } = await ctx.reply("Сохраненные");
    ctx.session.caption = [chat.id, message_id];
    //  Получение объекта пользователя из базы
    const saved = (await ctx.base.getUser(ctx.from.id)).saved;
    //  Индексация кеша
    ctx.session.show = {
      index: ((saved.length-1) / 8) | 0,
      size: saved.length,
      array: saved,
      status: "many",
      empty: "Вы пока не сохранили не одну работу.\nДля сохранения работы откройте её и нажмите кнопку \"Сохранить\"",
      for: "просмотра",
    };
    //  Отправка пользователю работ
    ctx.session.show.responsedMessageCounter = await ctx.user.sendPage(ctx);
  }

  async main(ctx) {
    const user = ctx.user,
      show = ctx.session.show;
    let index = -1;
    
    if ((index = ["1⃣", "2⃣", "3⃣", "4⃣"].indexOf(ctx.message.text)) != -1) {
      show.indexWork = index;
      [show.array, ctx.session.works] = [ctx.session.works, show.array];
      if (!show.array[show.indexWork]) {
        await ctx.reply("Работы с таким номером не существует, попробуйте заново.");
        await user.checkDos(ctx, user.deleteLastNMessage);
        show.responsedMessageCounter += 2;
      } else {
        show.status = "one";
        await user.updateWith(ctx, user.sendWork);
      }
      [show.array, ctx.session.works] = [ctx.session.works, show.array];
      return;
    }
    
    switch (ctx.message.text) {
    case "⏩ Следующая страница":
      show.status = "many";
      await user.updateWith(user.shiftIndex(ctx, -1), user.sendPage);
      break;
    case "⏪ Предыдущая страница":
      show.status = "many";
      await user.updateWith(user.shiftIndex(ctx, 1), user.sendPage);
      break;
    case "⬅ Назад":
      if (show.status === "many")
      {
        show.status = undefined;
        await ctx.user.goMain(ctx);
      } else {
        show.status = "many";  
        await user.updateWith(ctx, user.sendPage);
      }
      break;
    default:
      show.responsedMessageCounter++;
    }
  }
})();
