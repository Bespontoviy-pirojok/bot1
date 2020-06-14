const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");
const main = require('../main')

class SendWorkScenes {
  constructor() {
    //объект работы
    this.works = {
      id: null, // это ID пользователя, отправившего изображение
      description: null, // описание работы
      photos: [], // массив объектов фотографий с полями type : 'photo' и media: file_id. С помощью этих полей будем отдавать фото при необходимости.
    };
  }
  SendWorkScene() {
    const sendWork = new Scene("SendWorkScene");
    sendWork.enter(async (ctx) => {
      // обнуляем массив фото
      await ctx.reply(
        "Отправьте фотографии в формате jpeg или png. Первая фотография " +
          "будет использоваться в качестве превью к вашей работе", Markup
              .keyboard(['Отправить', 'Назад'])
              .oneTime()
              .resize()
              .extra()
      );
    });
    sendWork.on("photo", (ctx) => {
      const originalPhoto = ctx.message.photo.length - 1;
      this.works.id = ctx.from.id;
      this.works.photos = this.works.photos || [];
      this.works.photos.push({
        type: "photo",
        media: ctx.message.photo[originalPhoto].file_id,
      });
    });

    sendWork.on('text', (ctx)=>{
      switch (ctx.message.text) {
        case "Отправить":
          ctx.scene.enter("AddDescriptionQuestion");
          break;
        case "Назад":
          main(ctx);
          ctx.scene.leave()
      }
    })
    return sendWork;
  }
  AddDescriptionQuestionScene() {
    const dQuestion = new Scene("AddDescriptionQuestion");
    dQuestion.enter(async (ctx) => {
      await ctx.reply(
        "Добавить описание?",
        Markup.keyboard([
          "Да",
          "Нет",
          "Назад",
        ]).resize()
          .oneTime()
          .extra()

      );
    });
    dQuestion.on("text", (ctx) => {
      switch (ctx.message.text) {
      case "Да":
        ctx.scene.enter("EnterDescriptionScene");
        break;
      case "Нет":
        this.works.description = null;
        //TODO: оправляем объект this.works в БД
        ctx.reply("Работа успешно добавлена, вы можете отслеживать ее статистику в разделе \"мои работы\"");
        main(ctx);
        ctx.scene.leave();
        break;
      case "Назад":
        ctx.scene.enter("SendWorkScene");
        break;
      }
    });
    return dQuestion;
  }

  EnterDescriptionScene() {
    const description = new Scene("EnterDescriptionScene");
    description.enter((ctx) => {
      ctx.reply("Введите описание вашей работы");
    });
    description.on("text", (ctx) => {
      this.works.description = ctx.message.text;
      ctx.reply(
        "Работа успешно добавлена, вы можете отслеживать ее статистику в разделе \"мои работы\""
      );
      //TODO: оправляем объект this.works в БД
      main(ctx);
      ctx.scene.leave();
    });
    return description;
  }
}

module.exports = SendWorkScenes;
