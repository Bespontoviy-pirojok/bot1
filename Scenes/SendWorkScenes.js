const { Scene, Markup } = require("./Scenes");
const { SendWork } = require("../messages.json");
const { ObjectID } = require("mongodb");

async function sendWork(ctx) {
  const work = await ctx.base.setPost(ctx.session.work);
  await ctx.base.postedPost(ctx.from.id, work._id);
  await ctx.reply(
    SendWork.send.again,
    Markup.keyboard(SendWork.send.buttons).oneTime().resize().extra()
  );
  await ctx.scene.enter("SendWorkInit");
}

new (class SendWorkScene extends Scene {
  constructor() {
    super("SendWork");
    super.struct = {
      enter: [[this.enter]],
    };
  }
  async enter(ctx) {
    const { message_id, chat } = await ctx.reply(
      SendWork.send.welcome,
      Markup.keyboard(SendWork.send.buttons).oneTime().resize().extra()
    );
    ctx.session.caption = [chat.id, message_id];
    await ctx.scene.enter("SendWorkInit");
  }
})();

new (class SendWorkInitScene extends Scene {
  constructor() {
    super("SendWorkInit");
    super.struct = {
      enter: [[this.enter]],
      on: [
        ["photo", this.addPhoto],
        ["text", this.main],
      ],
    };
  }
  async enter(ctx) {
    ctx.session.work = {
      _id: ObjectID(), // ID поста
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

  async main(ctx) {
    const work = ctx.session.work;

    switch (ctx.message.text) {
    case SendWork.send.push:
      //  Если есть фото и их можно вместить в альбом
      if (work.photos.length > 0 && work.photos.length < 10) {
        await ctx.scene.enter("DescriptionQuestion");
      } else {
        ctx.reply(SendWork.send.retry);
        //  Очищение локального кеша с фотками
        work.photos = [];
      }
      break;
    case SendWork.send.back:
      await ctx.user.goMain(ctx);
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
  async question(ctx) {
    await ctx.reply(
      SendWork.description.welcome,
      Markup.keyboard(SendWork.description.buttons).resize().oneTime().extra()
    );
  }

  async main(ctx) {
    switch (ctx.message.text) {
    case SendWork.description.yes:
      await ctx.scene.enter("EnterDescription");
      break;
    case SendWork.description.no:
      await sendWork(ctx);
      break;
    case SendWork.description.back:
      await ctx.scene.enter("SendWork");
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
  async askDescription(ctx) {
    await ctx.reply(
      SendWork.description.getDescription,
      Markup.keyboard(["Назад"]).resize().oneTime().extra()
    );
  }
  async addDescription(ctx) {
    if (ctx.message.text === "Назад")
      await ctx.scene.enter("DescriptionQuestion");
    else {
      ctx.session.work.description = ctx.message.text;
      await sendWork(ctx);
    }
  }
})();
