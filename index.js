// @mamkin_designer_bot
// https://www.mindmeister.com/ru/1522778260?t=8C07mVgoEn

const config = require("./congif.json");
const {main} = require("./messages.json")

const Telegraf = require("telegraf");
const { Markup, Stage, session } = Telegraf;
const bot = new Telegraf(config.token);

//  Обработка сцен
const {ScenesArray} = require("./Scenes")
const stage = new Stage(ScenesArray);

// Обработка обращений к базе данных
const base = require("./DataBase").get(config.mongo);
// Обработка упращённых обращений
const wrap = require("./Wrapper").get();
// Главная
wrap.main = async (ctx) => {
  ctx.reply(main.welcome,
    Markup.keyboard(main.buttons)
      .resize()
      .oneTime()
      .extra()
  );
};

// Устанавливаем обработчики
bot.use(session(), wrap.middleware(), base.middleware(), stage.middleware());
// bot.use(Telegraf.log());

// Доступные на главной команды
bot.start(wrap.main);
bot.on("text", (ctx) => {
  switch (ctx.message.text) {
    case main.MyRates:
    //TODO обработать
    ctx.scene.enter("MyRates")
    break;
  case main.Saved:
    ctx.scene.enter("Saved");
    break;
  case main.SendWork:
    ctx.scene.enter("SendWork");
    break;
  case main.Evaluate:
    //TODO обработать
    ctx.reply(main.FuckYouLeatherman);
    break;
  }
});

bot.launch().then(() => console.log("Я ЖИВ!"));
