const { Scene, Markup } = require("../Scenes");


new (class Reports extends Scene {
  constructor() {
    super("Reports");
    super.struct = {
      enter: [[this.enter]],
      on: [["text", this.main]],
    };
  }

  async enter(ctx) {
    await ctx.reply("Список жалоб", Markup.keyboard([
      "Одобрить",
      "Заблокировать",
      "Назад"
    ]).resize().extra());
  }

  async main(ctx) {
    switch (ctx.message.text) {
    case "Одобрить":
      await ctx.reply("Жалоба по хуйне, с работой ничего не происходит, скип");
      break;
    case "Заблокировать":
      await ctx.reply("Работа блокируется и больше никому не показывается");
      break;
    case "Назад":
      await ctx.scene.enter("Administration");
      break;
    }
  }
})();
