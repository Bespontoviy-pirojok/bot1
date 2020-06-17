// @mamkin_designer_bot
// https://www.mindmeister.com/ru/1522778260?t=8C07mVgoEn

const config = require("./congif.json");
const { Main } = require("./messages.json");

const Telegraf = require("telegraf");
const { Markup, Stage, session } = Telegraf;
const bot = new Telegraf(config.token);

//  Обработка сцен
const { ScenesArray } = require("./Scenes");
const stage = new Stage(ScenesArray);

// Обработка обращений к базе данных
const base = require("./DataBase").get(config.mongo);
// Обработка упращённых обращений
const wrap = require("./Wrapper").get();
// Главная
wrap.main = async (ctx) => {
  ctx.reply(
    Main.welcome,
    Markup.keyboard(Main.buttons).resize().oneTime().extra()
  );
};

// Устанавливаем обработчики
bot.use(session(), wrap.middleware(), base.middleware(), stage.middleware());
// bot.use(Telegraf.log());

// Доступные на главной команды
bot.start(wrap.main);
bot.on("text", (ctx) => {
  switch (ctx.message.text) {
  case Main.MyWorks:
    ctx.scene.enter("MyWorks");
    break;
  case Main.Saved:
    ctx.scene.enter("Saved");
    break;
  case Main.SendWork:
    ctx.scene.enter("SendWork");
    break;
  case Main.Rate:
    ctx.scene.enter("Rate");
    break;
  }
});

bot.launch().then(() => console.log("Я ЖИВ!"));
