const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const main = require('../main')

class StoreScenes {
  StoreScene() {
    /*

    Хуйня снизу работает когда кто-то переходит
    в раздел с сохранёнными работами
    по тз, должно инста прилетать 10 работ
    для оценки, причём не именно работ, а их
    превьюшек, а по вводу работы с клавы
    должен быть вывод работы и описания
    и далее кноки "на главную" и "удалить"
    собственно, вещи, которые завязаны на базе
    заебашь какими-нибудь функциями с комментами,
    чтобы я их в функционал въебашил.

     */
    const store = new Scene("StoreScene");
    store.enter(async (ctx) => {
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
    store.on("text", async (ctx) => {
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
        await ctx.reply(
          "Бот для всей хуйни",
          Markup.keyboard([
            "Посмотреть оценки своих работ",
            "Сохраненное",
            "Выложить работу",
            "Поставить оценку",
          ])
            .resize()
            .oneTime()
            .extra()
        );
        await main(ctx);
        await ctx.scene.leave();
        break;
      default:
        await ctx.reply("Хуйню не неси");
      }
    });
    return store;
  }
}

module.exports = StoreScenes;
