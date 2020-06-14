// @mamkin_designer_bot
// https://www.mindmeister.com/ru/1522778260?t=8C07mVgoEn

const config = require("./congif.json");

const SocksAgent = require("socks5-https-client/lib/Agent");
// Не пофикcилось нихуя
const socksAgent = undefined // new SocksAgent(config.socks5); //TODO: socks5 (если я правильно понял это вылечит недоступность телеги)



const Telegraf = require("telegraf");
const Session = require("telegraf/session");
const { Extra, Markup, Stage } = Telegraf;
const bot = new Telegraf(config.token, {
  telegram: {
    agent: socksAgent,
  },
});
//bot.use(Telegraf.log());

//TODO: система наименований (пока что анахрхия мать порядка блять, не понятно что есть что)
//  Конкретнее пжлст

//  Добавить работу
const SendWork = require("./Scenes/SendWorkScenes");
const sendWork = new SendWork();
const SendWorkScene = sendWork.SendWorkScene();

//  Сохраненное
const Store = require("./Scenes/StoreScenes");
const store = new Store();
const StoreScene = store.StoreScene();

//  Обработка сцен
const stage = new Stage([StoreScene, SendWorkScene]);

bot.use(Session());
bot.use(stage.middleware());

bot.start((ctx) =>
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
  )
);
//  TODO: клавиатуру не просто закройте, а замените на подходящую
//  Конкретнее пжлст

bot.on("text", (ctx) => {
  switch (ctx.message.text) {
  case "Посмотреть оценки своих работ":
    //TODO обработать
    ctx.reply("ПОШЁЛ НАХУЙ СО СВОИМИ ОЦЕНКАМИ И РАБОТАМИ");
    break;
  case "Сохраненное":
    ctx.scene.enter("StoreScene");
    break;
  case "Выложить работу":
    ctx.scene.enter("SendWorkScene");
    break;
  case "Поставить оценку":
    //TODO обработать
    ctx.reply("ПОШЁЛ НАХУЙ СО СВОИМИ ОЦЕНКАМИ");
    break;
  }
});

bot.launch().then(() => console.log("Я ЖИВ!"));
