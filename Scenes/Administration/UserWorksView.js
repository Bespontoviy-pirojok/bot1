const { Scene, Markup } = require("../Scenes");


new (class UserWorksView extends Scene {
  constructor() {
    super("UserWorksView");
    super.struct = {
      enter: [[this.enter]],
      on: [["text", this.main]],
    };
  }

  async enter(ctx) {
    await ctx.reply("Введите сообщение", Markup.keyboard([
      ["Предыдущая", "Следующая"],
      "Удалить работу",
      "Назад"
    ]).resize().extra());
  }

  async main(ctx) {
    switch (ctx.message.text) {
    case "Назад":
      await ctx.scene.enter("UserProfile");
      break;
    }
  }
})();
