const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

class SavedScenes {
  constructor() {
    // init scenes
    this.scenes = {
      Saved: new Scene("Saved"),
    };

    this.scenes.Saved.enter(async (ctx) => {
      await ctx.reply(
        "Сцена с хранилищем",
        Markup.keyboard([
          "Следующая страцница",
          "Предыдущая страцница",
          "Назад",
        ])
          .resize()
          .extra()
      );
      await ctx.reply("Вывелась работа");
    });

    this.scenes.Saved.on("text", async (ctx) => {
      switch (ctx.message.text) {
      case "Следующая страцница":
        // Todo ебануть обраточик
        await ctx.wrap.deleteLastNMessage(2);
        await ctx.reply("Ну тут типо что-то было спереди");
        //
        break;
      case "Предыдущая страцница":
        // Todo ебануть обраточик
        await ctx.wrap.deleteLastNMessage(2);
        await ctx.reply("Ну тут типо что-то было сзади");
        //
        break;
      case "Назад":
        await ctx.wrap.goMain();
        break;
      default:
        await ctx.reply("Хуйню не неси");
      }
    });
  }

  getScene(name) {
    return this.scenes[name];
  }
  getScenes() {
    return Object.values(this.scenes);
  }
}

module.exports = new SavedScenes();
