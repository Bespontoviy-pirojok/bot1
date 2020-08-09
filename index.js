// @mamkin_designer_bot
// https://www.mindmeister.com/ru/1522778260?t=8C07mVgoEn

const { token, mongo } = require("./congif.json");

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
    "Бот для всей хуйни",
    Markup.keyboard([
      "Выложить работу",
      "Оценить чужие работы",
      "Посмотреть оценки своих работ",
      "Сохраненное",
    ])
      .resize()
      .oneTime()
      .extra()
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
  if (!ctx.session.caption) await user.main(ctx);
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
  case "Посмотреть оценки своих работ":
    await ctx.scene.enter("MyWorks");
    break;
  case "Сохраненное":
    await ctx.scene.enter("Saved");
    break;
  case "Выложить работу":
    await ctx.scene.enter("SendWork");
    break;
  case "Оценить чужие работы":
    await ctx.scene.enter("Rate");
    break;
  }
});

global.Controller.once("Launch", async () => {
  global.Controller.emit("DataBaseConnect", "april", mongo);
  await once(global.Controller, "DataBaseConnected");
  await bot.launch();
  console.log(await global.DataBaseController.get("Post"));     // For debug
  console.log(await global.DataBaseController.get("User"));     //
  for (let id of [711071113, 430830139, 430830139, 367750507])  //
    await global.DataBaseController.putUser(id, { seen: [] });  //
  console.log("Listening...");
});

global.Controller.emit("Launch");
