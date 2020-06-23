const { Scene, Markup } = require("./Scenes");
const { Works } = require("../messages.json");

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
      Works.special.MyWorks,
      Markup.keyboard(Works.buttons).resize().extra()
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
    case Works.next:
      user.updateWith(user.shiftIndex(ctx, -1), user.sendWork);
      break;
    case Works.prev:
      user.updateWith(user.shiftIndex(ctx, 1), user.sendWork);
      break;
    case Works.back:
      ctx.telegram.deleteMessage(...ctx.session.caption);
      await user.deleteLastNMessage(ctx);
      await user.goMain(ctx);
      break;
    default:
      await ctx.reply(Works.default);
    }
  }
})();
