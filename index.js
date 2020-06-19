// @mamkin_designer_bot
// https://www.mindmeister.com/ru/1522778260?t=8C07mVgoEn

const config = require("./congif.json");
const { Main } = require("./messages.json");

const {
  Telegraf,
  Markup,
  Stage,
  session,
  ScenesController,
} = require("./Scenes");
const bot = new Telegraf(config.token);

// Обработка обращений к базе данных
const base = require("./DataBase").get(config.mongo);
// Обработка упращённых обращений
const user = require("./User").get();
// Главная
user.main = async (ctx) => {
  ctx.reply(
    Main.welcome,
    Markup.keyboard(Main.buttons).resize().oneTime().extra()
  );
};

// Устанавливаем обработчики
bot.use(
  session(),
  user.middleware(),
  base.middleware(),
  global.ScenesController.stage.middleware()
);
// bot.use(Telegraf.log());
// console.log(global.ScenesController.scenesId());

// Доступные на главной команды
bot.start(user.main);
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
