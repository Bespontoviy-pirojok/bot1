const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

class SendWorkScenes {
  constructor() {
    //init scenes
    this.scenes = {
      SendWork: new Scene("SendWork"),
      DescriptionQuestion: new Scene("DescriptionQuestion"),
      EnterDescription: new Scene("EnterDescription"),
    };

    // Работы
    this.work = new Map();

    this.scenes.SendWork.enter(async (ctx) => {
      await ctx.reply(
        "Отправьте фотографии в формате jpeg или png. Первая фотография " +
          "будет использоваться в качестве превью к вашей работе",
        Markup.keyboard(["Отправить", "Назад"]).oneTime().resize().extra()
      );
      //объект работы
      this.work[ctx.from.id] = {
        _id: null, // ID поста
        authId: null, // это ID пользователя, отправившего изображение
        description: null, // описание работы
        photos: [], // массив ссылок на фотографии
      };
    });

    this.scenes.SendWork.on("photo", async (ctx) => {
      const originalPhoto = ctx.message.photo.length - 1;
      console.log(originalPhoto);
      const id = ctx.from.id;
      this.work[id].authId = id;
      this.work[id].photos = this.work[id].photos || [];
      this.work[id].photos.push(ctx.message.photo[originalPhoto].file_id);
    });

    this.scenes.SendWork.on("text", (ctx) => {
      const id = ctx.from.id;
      switch (ctx.message.text) {
      case "Отправить":
        if (
          this.work[id].photos.length > 0 &&
            this.work[id].photos.length < 10
        ) {
          ctx.scene.enter("DescriptionQuestion");
        } else {
          ctx.reply(
            "Ты отправил хуевое количество изображений! Попробуй еще раз, долбаеб."
          );
          this.work[id].photos = [];
          ctx.scene.reenter();
        }
        break;
      case "Назад":
        this.work.delete(id);
        ctx.wrap.goMain();
      }
    });

    this.scenes.DescriptionQuestion.enter(async (ctx) => {
      await ctx.reply(
        "Добавить описание?",
        Markup.keyboard(["Да", "Нет", "Назад"]).resize().oneTime().extra()
      );
    });

    this.scenes.DescriptionQuestion.on("text", (ctx) => {
      switch (ctx.message.text) {
      case "Да":
        ctx.scene.enter("EnterDescription");
        break;
      case "Нет":
        this.work[ctx.from.id].description = null;
        this.sendWork(ctx);
        break;
      case "Назад":
        ctx.scene.enter("SendWork");
        this.work.delete(ctx.from.id);
        break;
      }
    });

    this.scenes.EnterDescription.enter((ctx) => {
      ctx.reply("Введите описание вашей работы");
    });
    this.scenes.EnterDescription.on("text", (ctx) => {
      this.work[ctx.from.id].description = ctx.message.text;
      this.sendWork(ctx);
    });
  }

  async sendWork(ctx) {
    await ctx.base.putPost(this.work[ctx.from.id]);
    await ctx.reply(
      "Работа успешно добавлена, найти её можно в разделе \"Мои работы\""
    );
    this.work.delete(ctx.from.id);
    await ctx.scene.enter("SendWork");
  }

  getScene(name) {
    return this.scenes[name];
  }
  getScenes() {
    return Object.values(this.scenes);
  }
}

module.exports = new SendWorkScenes();
