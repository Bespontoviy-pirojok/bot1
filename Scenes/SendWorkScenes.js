const { Scene, Markup } = require("./Scenes");
const { SendWork } = require("../messages.json");

async function sendWork(ctx) {
  await ctx.base.putPost(ctx.session.work);
  await ctx.reply(SendWork.description.done);
  await ctx.scene.enter("SendWork");
}

new (class SendWorkScene extends Scene {
  constructor() {
    super("SendWork");
    super.struct = {
      enter: [[this.enter]],
      on: [
        ["photo", this.addPhoto],
        ["text", this.main],
      ],
    };
  }
  async enter(ctx) {
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
  }

  addPhoto(ctx) {
    const work = ctx.session.work; //  Получение работ из кеша
    work.authId = ctx.from.id; //  Id пользователя
    work.photos = work.photos || [];
    work.photos.push(ctx.message.photo.pop().file_id); //  Получение самой графонисторй фотографии
  }

  main(ctx) {
    const work = ctx.session.work;

    switch (ctx.message.text) {
    case SendWork.send.push:
      //  Если есть фото и их можно вместить в альбом
      if (work.photos.length > 0 && work.photos.length < 10) {
        ctx.scene.enter("DescriptionQuestion");
      } else {
        ctx.reply(SendWork.send.retry);
        //  Очищение локального кеша с фотками
        work.photos = [];
      }
      break;
    case SendWork.send.back:
      ctx.user.goMain(ctx);
    }
  }
})();

new (class DescriptionQuestionScene extends Scene {
  constructor() {
    super("DescriptionQuestion");
    super.struct = {
      enter: [[this.question]],
      on: [["text", this.main]],
    };
  }
  question(ctx) {
    ctx.reply(
      SendWork.description.welcome,
      Markup.keyboard(SendWork.description.buttons).resize().oneTime().extra()
    );
  }

  main(ctx) {
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
  }
})();

new (class EnterDescriptionScene extends Scene {
  constructor() {
    super("EnterDescription");
    super.struct = {
      enter: [[this.askDescription]],
      on: [["text", this.addDescription]],
    };
  }
  askDescription(ctx) {
    ctx.reply(SendWork.description.getDescription);
  }
  addDescription(ctx) {
    ctx.session.work.description = ctx.message.text;
    sendWork(ctx);
  }
})();
