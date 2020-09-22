const { Scene, Markup } = require("../Scenes");


new (class OpenUserProfile extends Scene {
  constructor() {
    super("OpenUserProfile");
    super.struct = {
      enter: [[this.enter]],
      on: [["text", this.main]],
    };
  }

  async enter(ctx) {
    await ctx.reply("Введите имя пользователя", Markup.keyboard(["Назад"]));
  }

  async main(ctx) {
    switch (ctx.message.text) {
    case "Назад":
      await ctx.scene.enter("Administration");
      break;
    case "Хряк":
      await ctx.scene.enter("UserProfile");
      break;
    }
  }
})();
