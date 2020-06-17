const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const { SendWork } = require("../messages.json");

class SendWorkScenes {
  constructor() {
    this.scenes = {
      SendWork: new Scene("SendWork"),
      DescriptionQuestion: new Scene("DescriptionQuestion"),
      EnterDescription: new Scene("EnterDescription"),
    };

    this.scenes.SendWork.enter(async (ctx) => {
      await ctx.reply(
        SendWork.send.welcome,
        Markup.keyboard(SendWork.send.buttons).oneTime().resize().extra()
      );
      ctx.session.work = {
        _id: null, // ID поста
        authId: null, // это ID пользователя, отправившего изображение
        description: null, // описание работы
        photos: [], // массив ссылок на фотографии
      };
    });

    this.scenes.SendWork.on("photo", async (ctx) => {
      const thisPhoto = ctx.message.photo.length - 1,
        work = ctx.session.work;
      work.authId = ctx.from.id;
      work.photos = work.photos || [];
      work.photos.push(ctx.message.photo[thisPhoto].file_id);
    });

    this.scenes.SendWork.on("text", (ctx) => {
      const work = ctx.session.work;
      switch (ctx.message.text) {
      case SendWork.send.push:
        if (work.photos.length > 0 && work.photos.length < 10) {
          ctx.scene.enter("DescriptionQuestion");
        } else {
          ctx.reply(SendWork.send.retry);
          work.photos = [];
        }
        break;
      case SendWork.send.back:
        ctx.wrap.goMain(ctx);
      }
    });

    this.scenes.DescriptionQuestion.enter(async (ctx) => {
      await ctx.reply(
        SendWork.description.welcome,
        Markup.keyboard(SendWork.description.buttons).resize().oneTime().extra()
      );
    });

    this.scenes.DescriptionQuestion.on("text", (ctx) => {
      const work = ctx.session.work;
      switch (ctx.message.text) {
      case SendWork.description.yes:
        ctx.scene.enter("EnterDescription");
        break;
      case SendWork.description.no:
        this.SendWork(ctx);
        break;
      case SendWork.description.back:
        ctx.scene.enter("SendWork");
        break;
      }
    });

    this.scenes.EnterDescription.enter((ctx) => {
      ctx.reply(SendWork.description.getDescription);
    });
    this.scenes.EnterDescription.on("text", (ctx) => {
      ctx.session.work.description = ctx.message.text;
      this.SendWork(ctx);
    });
  }

  async SendWork(ctx) {
    await ctx.base.putPost(ctx.session.work);
    await ctx.reply(SendWork.description.done);
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
