const { Scene, Markup } = require("../Scenes");


new (class WriteMessageToUser extends Scene {
  constructor() {
    super("WriteMessageToUser");
    super.struct = {
      enter: [[this.enter]],
      on: [["text", this.main]],
    };
  }

  async enter(ctx) {
    await ctx.reply("Введите сообщение", Markup.keyboard([
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
