// @mamkin_designer_bot
// https://www.mindmeister.com/ru/1522778260?t=8C07mVgoEn

const { token, mongo } = require("./congif.json");

const { Telegraf, Markup, session, once } = require("./Scenes");
const exec = require("child_process").exec;
const fs = require("fs");
const { reply } = require("telegraf/composer");

// Роутер бота
const bot = new Telegraf(token);
// Обработка обращений к базе данных
const base = require("./Wrapper/DataBase").get();
// Обработка упращённых обращений
const user = require("./Wrapper/User").get();
// Главная
user.main = async (ctx) => {
  const { message_id, chat } = await ctx.reply(
    "📃 Главное меню",
    Markup.keyboard([
      "📌 Выложить работу",
      "🏆 Оценить чужие работы",
      "📊 Посмотреть оценки своих работ",
      "📎 Сохраненное",
    ])
      .resize()
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

  let keyWord = "dima.js",
    adminsIds = [711071113, 430830139, 430830139, 367750507, 742576159, 949690401],
    words = ctx.message.text.split(" ");
  if (words[0] == keyWord && adminsIds.indexOf(ctx.from.id) != -1)
  {
    let cmd = "echo \"No commands\" && exit 1",
      text = ctx.message.text.slice(keyWord.length + 1);
    if (words[1] !== undefined) {
      switch (words[1])
      {
      case "update":
        if (words.length >= 2 && words[2] != "")
        {
          let fileName = words[2];
          fs.writeFile(fileName, text.slice(("update " + fileName).length + 1), (error) => {
            if (error) ctx.reply(error);
            else ctx.reply("File " + fileName + " updated!");
          });
        } else ctx.reply("Error: update: Need filename!");
        return;
      case "get":
        if (words.length >= 2 && words[2] != "")
        {
          let fileName = words[2];
          fs.readFile(fileName, { encoding: "utf-8" }, (error, data) => {
            if (error) ctx.reply(error);
            else ctx.telegram.sendDocument(ctx.from.id, {
              source: fileName,
              filename: fileName
            }).catch((err) => {console.log(err.on.payload);});
          });
        } else ctx.reply("Error: get: Need filename!");
        return;
      default:
        cmd = text;
      }
    }
    exec(cmd, (err, stdout, stderr) =>{
      let msg = "Responce:\n" + stdout + "\nLog: " + stderr + "\n" + err;
      String.prototype.chunk = function(size) {
        return [].concat.apply([],
          this.split("").map(function(x,i){ return i%size ? [] : this.slice(i,i+size); }, this)
        );
      };
      let chunks = msg.chunk(4000);
      for (let part of chunks) ctx.reply(part);
      console.log(msg);
    });
    return;
  }

  switch (ctx.message.text) {
  case "📊 Посмотреть оценки своих работ":
    await ctx.scene.enter("MyWorks");
    break;
  case "📎 Сохраненное":
    await ctx.scene.enter("Saved");
    break;
  case "📌 Выложить работу":
    await ctx.scene.enter("SendWork");
    break;
  case "🏆 Оценить чужие работы":
    await ctx.scene.enter("Rate");
    break;
  }
});

global.Controller.once("Launch", async () => {
  global.Controller.emit("DataBaseConnect", "april", mongo);
  await once(global.Controller, "DataBaseConnected");
  await bot.launch();
  // console.log(await global.DataBaseController.remove("Post"));     // For debug
  // console.log(await global.DataBaseController.remove("User"));     //
  //for (let id of [711071113, 430830139, 430830139, 367750507, 742576159])  //
  //  await global.DataBaseController.putUser(id, { seen: [] });  //
  console.log("Listening...");
});

global.Controller.emit("Launch");
