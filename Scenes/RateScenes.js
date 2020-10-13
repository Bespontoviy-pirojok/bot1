// TODO: Есть ошибки с удалением проверить переменную хранящую количество для удаления
// TODO: Изменилась переменная индекса работы проверить
const { Scene, Markup, Extra, InlineController } = require("./Scenes");

const { ObjectID } = require("mongodb");

async function findSavedStatus(ctx, userId, postId)
{
  let user = await ctx.base.getUser(userId);
  return user.saved.find((post)=> post._id == postId) != undefined;
}
async function findReportStatus(ctx, userId, postId)
{
  let user = await ctx.base.getUser(userId);
  return user.reports && user.reports.indexOf(postId) != -1;
}

function inlineRate(show, postId) {
  return [
    [...Array(5).keys()].map((i) =>
      Markup.callbackButton(
        (show.rated_status === i + 1 ? "[" : "") +
        String(i + 1) +
        (show.rated_status === i + 1 ? "]" : ""),
        String(i + 1) + "-" + postId
      )
    ),
    [
      Markup.callbackButton((show.saved_status) ? "🤘 Сохранено": "📎 Сохранить работу", "save-" + postId),
      Markup.callbackButton((show.rated_status) ? "Жалоба уже отправлена": "Пожаловаться", "report-" + postId)
    ],
  ];
}

function inlineReport(show, postId) {
  const reportType = ["Плагиат", "Спам", "Неприличный контент"];
  let board = [...Array(3).keys()].map((i) =>
    [Markup.callbackButton(
      reportType[i],
      String(i + 1) + "report-" + postId
    )]
  );
  board.push([Markup.callbackButton("Отмена", "back-" + postId)]);
  return board;
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
      m.inlineKeyboard(inlineRate(show, postId))
    ) 
  );
  show.responsedMessageCounter++;
  return show.responsedMessageCounter;
}

new (class RateScene extends Scene {
  constructor() {
    super("Rate");
    super.struct = {
      enter: [[this.enter]],
      action: [
        [/([1-5])-([\w\D]*)/, this.ratePost],
        [/save-([\w\D]*)/, this.savePost],
        [/([1-3])report-([\w\D]*)/, this.reportPost],
        [/report-([\w\D]*)/, this.goReports],
        [/back-([\w\D]*)/, this.goBack],
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
    show.report_status = undefined;
    
    ctx.session.inlineKeyboard = new InlineController;
    ctx.session.inlineKeyboard.stage({
      Report: inlineReport,
      Rate: inlineRate,
    }).go("Rate");
  }

  async savePost(ctx) {
    const show = ctx.session.show,
      postId = ctx.match[1];
    show.saved_status = true;
    await ctx.editMessageReplyMarkup({
      inline_keyboard: inlineRate(show, postId)
    });
    await ctx.base.savePost(ctx.chat.id, postId);
    await ctx.answerCbQuery("Сохранено");
  }

  async ratePost(ctx) {
    const show = ctx.session.show,
      postId = ctx.match[2],
      rate = ctx.match[1];
    show.rated_status = +rate;
    await ctx.editMessageReplyMarkup({
      inline_keyboard: inlineRate(show, postId)
    });
    await ctx.base.putRate(ctx.from.id, postId, rate);
    await ctx.base.seenPost(ctx.from.id, postId);
    await ctx.answerCbQuery("Вы поставили " + show.rated_status);
  }

  async goReports(ctx) {
    const postId = ctx.match[1];
    await ctx.editMessageReplyMarkup({
      inline_keyboard: ctx.session.inlineKeyboard.go("Report").now(ctx.session.show, postId)
    });
    await ctx.answerCbQuery();
  }

  async reportPost(ctx) {
    const show = ctx.session.show,
      reportId = +ctx.match[1],
      postId = ctx.match[2];
    if (show.report_status === true) {
      await ctx.answerCbQuery();
      return;
    } 
    show.report_status = true;
    await ctx.base.putReport(postId, ctx.from.id, reportId);
    await ctx.editMessageReplyMarkup({
      inline_keyboard: ctx.session.inlineKeyboard.goBack().now(show, postId)
    }).catch(); // если не нечего менять, оно выкенет ошибку // TODO: сделать отельную функцию
    await ctx.answerCbQuery("Жалоба отправлена");
  }

  async goBack(ctx) {
    const postId = ctx.match[1];
    await ctx.editMessageReplyMarkup({
      inline_keyboard: ctx.session.inlineKeyboard.goBack().now(ctx.session.show, postId)
    });
    await ctx.answerCbQuery();
  }

  async main(ctx) {
    const user = ctx.user,
      show = ctx.session.show;
    let index = -1;
    
    if ((index = ["1⃣", "2⃣", "3⃣", "4⃣"].indexOf(ctx.message.text)) != -1) {
      show.indexWork = index;
      [show.array, ctx.session.works] = [ctx.session.works, show.array];
      if (!show.array[show.indexWork]) {
        await ctx.reply("Работы с таким номером не существует, попробуйте заново.");
        await user.checkDos(ctx, user.deleteLastNMessage);
        show.responsedMessageCounter += 2;
      } else {
        const postId = show.array[show.indexWork]._id;
        show.saved_status = await findSavedStatus(ctx, ctx.from.id, postId);
        show.report_status = await findReportStatus(ctx, ctx.from.id, postId);
        show.rated_status = undefined;
        show.status = "one";
        await user.updateWith(ctx, showToRate);
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
        ctx.session.inlineKeyboard = undefined;
        await ctx.base.putUser(ctx.from.id, { page: show.index });
        await ctx.user.goMain(ctx);
      } else {
        show.status = "many";
        show.saved_status = undefined;
        show.rated_status = undefined;
        show.report_status = undefined;
        await user.updateWith(ctx, user.sendWorksGroup);
      }
      break;
    default:
      show.responsedMessageCounter++;
    }
  }
})();
