// @mamkin_designer_bot
// https://www.mindmeister.com/ru/1522778260?t=8C07mVgoEn

const { token, devToken, dbName, dbNameDev, mongo } = require("./congif.json");

const { Telegraf, Markup, session, once } = require("./Scenes");
const exec = require("child_process").exec;
const fs = require("fs");

// Роутер бота
const bot = new Telegraf(process.env.PRODUCTION? token: devToken);
const nameDataBase = process.env.PRODUCTION? dbName: dbNameDev;

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
    ].concat((adminsIds.indexOf(ctx.from.id) != -1)?["Администрирование"]:[]))
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

let adminsIds = [711071113, 430830139, 367750507, 742576159, 949690401];

// bot.use(Telegraf.log());
// console.log(global.ScenesController.scenesId());

// Доступные на главной команды
bot.start(user.main);
bot.on("text", async (ctx) => {
  async function update(id) {
    let userInfo = (await (ctx.telegram.getChatMember)(id, id)).user;
    return await (global.DataBaseController.putUser)(id, {user: userInfo});
  }
  update(ctx.from.id);

  // let users = await global.DataBaseController.get("User");
  // users.map((obj)=>obj._id).map(update);
  // users = await global.DataBaseController.get("User");
  // console.log(users);
  
  if (!ctx.session.caption) await user.main(ctx);
  if (!ctx.session.inited && !(await ctx.base.getUser(ctx.from.id)))
    await ctx.base.setUser({
      _id: ctx.from.id,
      user: (await ctx.telegram.getChatMember(ctx.from.id,ctx.from.id)).user,
      saved: [],
      posted: [],
      seen: [],
      page: 0,
      reports: [],
    });
  ctx.session.inited = true;
  
  let keyWord = "Dima",
    words = ctx.message.text.split(" ");
  String.prototype.chunk = function(size) {
    return [].concat.apply([],
      this.split("").map(function(x,i){ return i%size ? [] : this.slice(i,i+size); }, this)
    );
  };
  if (words[0] == keyWord && adminsIds.indexOf(ctx.from.id) != -1)
  {
    let cmd = "echo \"No commands\" && exit 1",
      text = ctx.message.text.slice(keyWord.length + 1);
    if (words[1] !== undefined) {
      switch (words[1])
      {
      case "todo":
        ctx.replyWithMarkdown(((await require("todoist-rest-api").default("ef57a9b7b54bb0c46bd7073f5cb06f4cca8b9c6b").v1.task.findAll()).map((obj)=>{return {url: obj.url, text: obj.content, date: new Date(obj.created).toLocaleDateString("ru-RU"), priority: obj.priority};})).map((tsk) => "!" + tsk.priority + " - " + tsk.date + "\n[" + tsk.text + "](" + tsk.url + ")\n").join(""));
        return;
      case "db":
        if (words[2] !== undefined) {
          try {
            text = text.slice(("db "+ words[2]).length);
            let args = (text) ? JSON.parse(text) : [];
            if (!(args instanceof Array)) throw TypeError("Must be array of parameters! Also: " + args.toString());
            let responce = await global.DataBaseController[words[2]](...args) || "<Empty>";
            let chunks = JSON.stringify(responce, null, 1).chunk(4000);
            for (let part of chunks) ctx.reply(part);
          } catch (error) {
            ctx.reply(error.toString());
          }
        } else ctx.reply("Не трать моё время, скажи что тебе нужно!"); 
        return;
      case "forall":{
        let offset = (keyWord + " forall ").length,
          size = ("forall ").length,
          // Имеет побочный эффект!
          entities = (ctx.message.entities || []).map((obj)=>{obj.offset -= offset; return obj;}).filter((obj)=> obj.offset >= 0);
        for (let user of await global.DataBaseController.get("User"))
          ctx.telegram.sendMessage(user._id, text.slice(size), {entities});
      }
        return;
      case "foradmin": {
        let offset = (keyWord + " foradmin ").length,
          size = ("foradmin ").length,
          // Имеет побочный эффект!
          entities = (ctx.message.entities || []).map((obj)=>{obj.offset -= offset; return obj;}).filter((obj)=> obj.offset >= 0);
        for (let user of adminsIds.map((_id)=>{return {_id}; }))
          ctx.telegram.sendMessage(user._id, text.slice(size), {entities});
      }
        return;
      case "dice":
        for (let user of adminsIds.map((_id)=>{return {_id}; }))
          ctx.telegram.sendDice(user._id);
        return;
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
          fs.readFile(fileName, { encoding: "utf-8" }, (error) => {
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
      let msg = "Responce:\n" + stdout + ((stderr) ? ("\nLog: " + stderr) : "") + "\n" + (err || "");
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
  case "Администрирование":
    if (adminsIds.indexOf(ctx.from.id) != -1)
      await ctx.scene.enter("Administration");
    break;
  }
});

global.Controller.once("Launch", async () => {
  global.Controller.emit("DataBaseConnect", nameDataBase, mongo);
  await once(global.Controller, "DataBaseConnected");
  await bot.launch();
  // console.log(await global.DataBaseController.get("Post"));     // For debug
  // console.log(await global.DataBaseController.remove("User"));     //
  // for (let id of [949690401/*, 711071113, 430830139, 430830139, 367750507, 742576159*/])  //
  //  await global.DataBaseController.putUser(id, { seen: [] });  //
  console.log("Listening...");
});

global.Controller.emit("Launch");
