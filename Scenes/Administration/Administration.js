const { Scene, Markup } = require("../Scenes");

new (class Administration extends Scene {
  constructor() {
    super("Administration");
    super.struct = {
      enter: [[this.enter]],
      on: [["text", this.main]],
    };
  }

  async enter(ctx) {
    await ctx.reply("Панель администрирования", Markup.keyboard([
      "Cписок жалоб",
      "Посмотреть профиль пользователя",
      "Заблокированные пользователи",
      "Назад"
    ]).resize().extra());
  }

  async main(ctx) {
    switch (ctx.message.text) {
    case "Cписок жалоб":
      await ctx.scene.enter("Reports");
      break;
    case "Посмотреть профиль пользователя":
      await ctx.scene.enter("OpenUserProfile");
      break;
    case "Заблокированные пользователи":
      ctx.reply("Ну тут типо должен быть список заблокированных пользователей");
      break;
    case "Назад":
      await ctx.user.goMain();
      break;
    }
  }
})();










