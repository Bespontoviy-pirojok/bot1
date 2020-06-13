const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

class StoreScenes {
  StoreScene() {
    const store = new Scene("StoreScene");
    store.enter(async ctx => {
      await ctx.reply(
        "Сцена с хранилищем",
        Markup.keyboard([
          "Следующая страцница",
          "Предыдущая страцница",
          "Назад"
        ])
          .resize()
          .extra()
      );
    });
    store.on("text", async ctx => {
      switch (ctx.message.text) {
        case "Следующая страцница":
          // Todo ебануть обраточик
          ctx.reply("Ну тут типо что-то было");
          //
          break;
        case "Предыдущая страцница":
          // Todo ебануть обраточик
          ctx.reply("Ну тут типо что-то было");
          //
          break;
        case "Назад":
          await ctx.reply(
            "Бот для всей хуйни",
            Markup.keyboard([
              "Посмотреть оценки своих работ",
              "Сохраненное",
              "Выложить работу",
              "Поставить оценку"
            ])
              .resize()
              .oneTime()
              .extra()
          );
          await ctx.scene.leave();
          break;
        default:
          await ctx.reply("Хуйню не неси");
        // await ctx.scene.reenter()
      }
    });
    return store;
  }
}

module.exports = StoreScenes;
