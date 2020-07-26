const { Scene, Markup } = require("./Scenes");
const { ObjectID } = require("mongodb");

async function sendWork(ctx) {
  const work = await ctx.base.setPost(ctx.session.work);
  await ctx.base.postedPost(ctx.from.id, work._id);
  await ctx.reply(
    "Работа успешно добавлена, найти её можно в разделе \"Мои работы\"\nЧтобы вернуться в главное меню нажмите \"назад\"\"",
    Markup.keyboard(["Добавить ещё одну работу", "Назад"]).oneTime().resize().extra()
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
      "Отправьте фотографии в формате jpeg или png и нажмите кнопку готово.\nПервая фотография будет использоваться в качестве превью к вашей работе",
      Markup.keyboard(["Готово", "Назад"]).oneTime().resize().extra()
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
      rates: {},
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
    case "Готово" || "Добавить ещё одну работу":
      //  Если есть фото и их можно вместить в альбом
      if (work.photos.length > 0 && work.photos.length < 10) {
        await ctx.scene.enter("DescriptionQuestion");
      } else {
        ctx.reply("Некоректное количество фотографий.\nДопустимо 1-10 фотографий!");
        //  Очищение локального кеша с фотками
        work.photos = [];
      }
      break;
    case "Назад":
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
      "Добавить описание?",
      Markup.keyboard(["Да", "Нет", "Назад"]).resize().oneTime().extra()
    );
  }

  async main(ctx) {
    switch (ctx.message.text) {
    case "Да":
      await ctx.scene.enter("EnterDescription");
      break;
    case "Нет":
      await sendWork(ctx);
      break;
    case "Назад":
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
      "Введите описание вашей работы",
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
