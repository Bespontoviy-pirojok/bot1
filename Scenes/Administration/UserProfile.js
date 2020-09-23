const { Scene, Markup } = require("../Scenes");

require("./UserWorksView");
require("./WriteMessageToUser");

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

new (class UserProfile extends Scene {
  constructor() {
    super("UserProfile");
    super.struct = {
      enter: [[this.enter]],
      on: [["text", this.main]],
    };
  }

  async enter(ctx) {
    const TEMP__IS_USER_BLOCKED = false; // капец затычки, пофикси
    await ctx.reply("Пользователь USER \nData", Markup.keyboard([
      TEMP__IS_USER_BLOCKED? "Разблокировать": "Заблокировать",
      "Написать сообщение пользователю",
      "Посмотреть работы пользователя",
      "Назад"
    ]).resize().extra());
  }

  async main(ctx) {
    switch (ctx.message.text) { 
    case "Заблокировать":
      await ctx.reply("Блокнуть пользователя, то есть, скрыть его работы из показа"); // Тяжеловесный приём
      break;
    case "Разблокировать":
      await ctx.reply("Работы пользователя снова видны");
      break;
    case "Написать сообщение пользователю":
      await ctx.scene.enter("WriteMessageToUser");
      break;
    case "Посмотреть работы пользователя":
      await ctx.scene.enter("UserWorksView");
      break;
    case "Назад":
      await ctx.scene.enter("Administration");
      break;
    }
  }
})();
