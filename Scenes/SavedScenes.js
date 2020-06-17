const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

const { Works } = require("../messages.json");

class SavedScenes {
  constructor() {
    //  Декларация сцен
    this.scenes = {
      Saved: new Scene("Saved"),
    };

    this.scenes.Saved.enter(async (ctx) => {
      await ctx.reply(
        Works.special.Saved,
        Markup.keyboard(Works.buttons).resize().extra()
      );
      //  Получение объекта пользователя из базы
      const saved = (await ctx.base.getUser(ctx.from.id)).saved;
      //  Индексация кеша
      ctx.session.show = {
        index: saved.length - 1,
        size: saved.length,
        array: saved,
      };
      //  Отправка пользователю работ
      await ctx.wrap.sendWork(ctx);
    });

    this.scenes.Saved.on("text", async (ctx) => {
      const wrap = ctx.wrap;

      switch (ctx.message.text) {
      case Works.next:
        await wrap.deleteLastNMessage(ctx);
        wrap.shiftIndex(ctx, -1);
        await wrap.sendWork(ctx);
        break;
      case Works.prev:
        await wrap.deleteLastNMessage(ctx);
        wrap.shiftIndex(ctx, 1);
        await wrap.sendWork(ctx);
        break;
      case Works.back:
        await wrap.goMain(ctx);
        break;
      default:
        await ctx.reply(Works.default);
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
