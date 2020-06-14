// @mamkin_designer_bot
// https://www.mindmeister.com/ru/1522778260?t=8C07mVgoEn

const config = require("./congif.json");

const Telegraf = require("telegraf");
const Session = require("telegraf/session");
const { Markup, Stage } = Telegraf;
const bot = new Telegraf(config.token);

//  Добавить работу
const SendWork = require("./Scenes/SendWorkScenes");
//  Сохраненное
const Saved = require("./Scenes/SavedScenes");

//  Обработка сцен
const stage = new Stage([].concat(Saved.getScenes(), SendWork.getScenes()));
// Обработка обращений к базе данных
const base = require("./DataBase").get(config.mongo);
// Обработка упращённых обращений
const wrap = require("./Wrapper").get();
// Главная
wrap.main = async (ctx) => {
  ctx.reply(
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
};

// Устанавливаем обработчики
bot.use(Session());
bot.use(wrap.middleware());
bot.use(base.middleware());
bot.use(stage.middleware());
// bot.use(Telegraf.log());

// Доступные на главной команды
bot.start(wrap.main);
bot.on("text", (ctx) => {
  switch (ctx.message.text) {
  case "Посмотреть оценки своих работ":
    //TODO обработать
    ctx.reply("ПОШЁЛ НАХУЙ СО СВОИМИ ОЦЕНКАМИ И РАБОТАМИ");
    break;
  case "Сохраненное":
    ctx.scene.enter("Saved");
    break;
  case "Выложить работу":
    ctx.scene.enter("SendWork");
    break;
  case "Поставить оценку":
    //TODO обработать
    ctx.reply("ПОШЁЛ НАХУЙ СО СВОИМИ ОЦЕНКАМИ");
    break;
  }
});

bot.launch().then(() => console.log("Я ЖИВ!"));
