// @mamkin_designer_bot
// https://www.mindmeister.com/ru/1522778260?t=8C07mVgoEn

const { token, mongo } = require("./congif.json");
const { Main } = require("./messages.json");

const { Telegraf, Markup, session, once } = require("./Scenes");

// Роутер бота
const bot = new Telegraf(token);
// Обработка обращений к базе данных
const base = require("./Wrapper/DataBase").get();
// Обработка упращённых обращений
const user = require("./Wrapper/User").get();
// Главная
user.main = async (ctx) => {
  const { message_id, chat } = await ctx.reply(
    Main.welcome,
    Markup.keyboard(Main.buttons).resize().oneTime().extra()
  );
  ctx.session.caption = [chat.id, message_id];
};

// Устанавливаем обработчики
bot.use(
  session(),
  user.middleware(),
  base.middleware(),
  global.Scenes.stage.middleware()
);
// bot.use(Telegraf.log());
// console.log(global.ScenesController.scenesId());

// Доступные на главной команды
bot.start(user.main);
bot.on("text", async (ctx) => {
  if (!ctx.session.inited && !(await ctx.base.getUser(ctx.from.id)))
    await ctx.base.setUser({
      _id: ctx.from.id,
      saved: [],
      posted: [],
      seen: [],
      page: 0,
    });
  ctx.session.inited = true;
  switch (ctx.message.text) {
  case Main.MyWorks:
    ctx.telegram.deleteMessage(...ctx.session.caption);
    ctx.deleteMessage();
    await ctx.scene.enter("MyWorks");
    break;
  case Main.Saved:
    ctx.telegram.deleteMessage(...ctx.session.caption);
    ctx.deleteMessage();
    await ctx.scene.enter("Saved");
    break;
  case Main.SendWork:
    ctx.telegram.deleteMessage(...ctx.session.caption);
    ctx.deleteMessage();
    await ctx.scene.enter("SendWork");
    break;
  case Main.Rate:
    ctx.telegram.deleteMessage(...ctx.session.caption);
    ctx.deleteMessage();
    await ctx.scene.enter("Rate");
    break;
  }
});

global.Controller.once("Launch", async () => {
  global.Controller.emit("DataBaseConnect", "april", mongo);
  await once(global.Controller, "DataBaseConnected");
  await bot.launch();
  console.log(await global.DataBaseController.get("Post"));
  console.log(await global.DataBaseController.get("User"));
  console.log("Listening...");
});

global.Controller.emit("Launch");
