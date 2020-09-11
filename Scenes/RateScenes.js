// TODO: Есть ошибки с удалением проверить переменную хранящую количество для удаления
// TODO: Изменилась переменная индекса работы проверить
const { Scene, Markup, Extra} = require("./Scenes");

const { ObjectID } = require("mongodb");

async function findSavedStatus(ctx, userId, postId)
{
  let user = await ctx.base.getUser(userId);
  return user.saved.find((post)=> post._id == postId) != undefined;
}

async function showToRate(ctx) {
  const user = ctx.user,
    show = ctx.session.show,
    postId = show.array[show.indexWork]._id,
    rate = await ctx.base.getRate(postId);
  show.responsedMessageCounter = await user.sendWork(ctx);
  await ctx.reply(
    (rate ? "Средняя оценка работы: " + rate + "\nОцените работу:" : "Работу ещё никто не оценил, станьте первым!"),
    Extra.HTML().markup((m) =>
      m.inlineKeyboard([
        [...Array(5).keys()].map((i) =>
          Markup.callbackButton(
            (show.rated_status === i + 1 ? "[" : "") +
            String(i + 1) +
            (show.rated_status === i + 1 ? "]" : ""),
            String(i + 1) + "-" + postId
          )
        ),
        [m.callbackButton((show.saved_status) ? "🤘 Сохранено": "📎 Сохранить работу", "save-" + postId)],
      ])
    ) 
  );
  show.responsedMessageCounter++;
}

new (class RateScene extends Scene {
  constructor() {
    super("Rate");
    super.struct = {
      enter: [[this.enter]],
      action: [
        [/([1-5])-([\w\D]*)/, this.ratePost],
        [/save-([\w\D]*)/, this.savePost],
      ],
      on: [["text", this.main]],
    };
  }

  async enter(ctx) {
    const { message_id, chat } = await ctx.reply("Оценка работ");
    ctx.session.caption = [chat.id, message_id];
      
    const user = await ctx.base.getUser(ctx.from.id);
    let show = (ctx.session.show = { 
      index: user.page,
      status: "many",
      for: "оценки",
    });
    if (show.index == -1) show.index = 0;
    show.responsedMessageCounter = await ctx.user.sendWorksGroup(ctx);
    show.array = ctx.session.works;
    show.saved_status = undefined;
    show.rated_status = undefined;
  }

  async savePost(ctx) {
    ctx.session.show.saved_status = true;
    const show = ctx.session.show,
      postId = show.array[show.indexWork]._id;
    await ctx.answerCbQuery("Сохранено");
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [...Array(5).keys()].map((i) =>
          Markup.callbackButton(
            (show.rated_status === i + 1 ? "[" : "") +
              String(i + 1) +
              (show.rated_status === i + 1 ? "]" : ""),
            String(i + 1) + "-" + postId
          )
        ),
        [
          Markup.callbackButton(
            (show.saved_status) ? "🤘 Сохранено": "📎 Сохранить работу",
            "save-" + postId
          ),
        ],
      ],
    });
    await ctx.base.savePost(ctx.chat.id, ObjectID(ctx.match[1]));
  }

  async ratePost(ctx) {
    if (!ctx.match[1] || !ctx.match[2]) return;
    const show = ctx.session.show,
      postId = show.array[show.indexWork]._id;
    show.rated_status = +ctx.match[1];
    await ctx.answerCbQuery("Вы поставили " + show.rated_status);
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [...Array(5).keys()].map((i) =>
          Markup.callbackButton(
            (show.rated_status === i + 1 ? "[" : "") +
              String(i + 1) +
              (show.rated_status === i + 1 ? "]" : ""),
            String(i + 1) + "-" + postId
          )
        ),
        [
          Markup.callbackButton(
            (show.saved_status) ? "🤘 Сохранено": "📎 Сохранить работу",
            "save-" + postId
          ),
        ],
      ],
    });
    await ctx.base.putRate(ctx.from.id, ObjectID(ctx.match[2]/*postId*/), ctx.match[1]/*rate*/);
    await ctx.base.seenPost(ctx.from.id, ObjectID(ctx.match[2]/*postId*/));
  }

  async main(ctx) {
    const user = ctx.user,
      show = ctx.session.show;
    
    if (/[1-8]/.test(ctx.message.text)) {
      show.indexWork = +ctx.message.text - 1;
      [show.array, ctx.session.works] = [ctx.session.works, show.array];
      if (!show.array[show.indexWork]) {
        await ctx.reply("Работы с таким номером не существует, попробуйте заново.");
        await user.checkDos(ctx, user.deleteLastNMessage);
        show.responsedMessageCounter += 2;
      } else {
        show.saved_status = await findSavedStatus(ctx, ctx.from.id, show.array[show.indexWork]._id);
        console.log(show.saved_status);
        show.rated_status = undefined;
        show.status = "one";
        await user.update(ctx, showToRate);
      }
      [show.array, ctx.session.works] = [ctx.session.works, show.array];
      return;
    }

    switch (ctx.message.text) {
    case "⏩ Следующая страница":
      show.status = "many";
      await user.updateWith(user.shiftIndex(ctx, 1), user.sendWorksGroup);
      break;
    case "⏪ Предыдущая страница":
      show.status = "many";
      await user.updateWith(user.shiftIndex(ctx, -1), user.sendWorksGroup);
      break;
    case "⬅ Назад":
      if (show.status === "many")
      {
        show.status = undefined;
        await ctx.base.putUser(ctx.from.id, { page: ctx.session.show.index });
        await ctx.user.goMain(ctx);
      } else {
        show.status = "many";
        show.saved_status = undefined;
        show.rated_status = undefined;
        await user.updateWith(ctx, user.sendWorksGroup);
      }
      break;
    default:
      show.responsedMessageCounter++;
    }
  }
})();
