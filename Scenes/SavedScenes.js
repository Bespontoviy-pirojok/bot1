const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const main = require("../main");

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
    });

    this.scenes.Saved.on("text", async (ctx) => {
      switch (ctx.message.text) {
      case "Следующая страцница":
        // Todo ебануть обраточик
        ctx.reply("Ну тут типо что-то было спереди");
        //
        break;
      case "Предыдущая страцница":
        // Todo ебануть обраточик
        ctx.reply("Ну тут типо что-то было сзади");
        //
        break;
      case "Назад":
        await ctx.scene.leave();
        await main(ctx);
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
