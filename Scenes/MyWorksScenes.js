const { Scene } = require("./Scenes");

new (class MyWorksScene extends Scene {
  constructor() {
    super("MyWorks");
    super.struct = {
      enter: [[this.enter]],
      on: [["text", this.main]],
    };
  }

  async enter(ctx) {
    const { message_id, chat } = await ctx.reply("🏆 Оценки моих работ");
    ctx.session.caption = [chat.id, message_id];
    const posted = (await ctx.base.getUser(ctx.from.id)).posted;
    //  Индексация кеша
    ctx.session.show = {
      index: ((posted.length - 1) / 8) | 0,
      size: posted.length,
      array: posted,
      status: "many",
      for: "просмотра оценки",
    };
    ctx.session.show.responsedMessageCounter = await ctx.user.sendPage(ctx);
  }

  async main(ctx) {
    const user = ctx.user,
      show = ctx.session.show;
    
    if (/[1-8]/.test(ctx.message.text)) {
      show.indexWork = +ctx.message.text - 1;
      [show.array, ctx.session.works] = [ctx.session.works, show.array];
      if (!show.array[show.indexWork]) {
        await ctx.reply(
          "Работы с таким номером не существует, попробуйте заново."
        );
        await user.checkDos(ctx, user.deleteLastNMessage);
        show.responsedMessageCounter += 2;
      } else {
        show.status = "one";
        await user.deleteLastNMessage(ctx);
        show.responsedMessageCounter = await ctx.user.sendWork(ctx);
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
