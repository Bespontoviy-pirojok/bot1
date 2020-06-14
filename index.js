// @mamkin_designer_bot
// https://www.mindmeister.com/ru/1522778260?t=8C07mVgoEn

const config = require("./congif.json");

const SocksAgent = require("socks5-https-client/lib/Agent");
const socksAgent = undefined; // new SocksAgent(config.socks5); //TODO: socks5 (если я правильно понял это вылечит недоступность телеги)

const base = require("./DataBase").get(config.mongo);

const Telegraf = require("telegraf");
const Session = require("telegraf/session");
const Stage = Telegraf.Stage;
const bot = new Telegraf(config.token, {
  telegram: {
    agent: socksAgent,
  },
});
// bot.use(Telegraf.log());

//  Добавить работу
const SendWork = require("./Scenes/SendWorkScenes");
//  Сохраненное
const Saved = require("./Scenes/SavedScenes");

//  Обработка сцен
const allScenes = [].concat(Saved.getScenes(), SendWork.getScenes());
const stage = new Stage(allScenes);

bot.use(Session());
bot.use(base.middleware());
bot.use(stage.middleware());

const main = require("./main");

bot.start(main);
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
