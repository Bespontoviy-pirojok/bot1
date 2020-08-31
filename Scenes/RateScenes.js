// TODO: Есть ошибки с удалением проверить переменную хранящую количество для удаления
// TODO: Изменилась переменная индекса работы проверить
const { Scene, Markup, Extra} = require("./Scenes");

const { ObjectID } = require("mongodb");

async function showToRate(ctx) {
  const user = ctx.user,
    show = ctx.session.show;
  await user.deleteLastNMessage(ctx);
  show.messageSize = await user.sendWork(ctx);
  await ctx.reply(
    "Оцените работу или введите номер другой работы, текущая работа: " + (1 + show.indexWork),
    Extra.HTML().markup((m) =>
      m.inlineKeyboard([
        [...Array(5).keys()].map((i) =>
          m.callbackButton(
            String(i + 1),
            String(i + 1) + "-" + show.array[show.indexWork]._id
          )
        ),
        [m.callbackButton("📎 Сохранить", "save-" + show.array[show.indexWork]._id)],
      ])
    )
  );
  show.messageSize++;
}

var buttonsArray = [
  ["⏪ Предыдущая страница", "⏩ Следующая страница"],
  ["⬅ Назад"],
];

function photoRateButtonsGenerator(btnCount){
  let res = [[]];
  if (btnCount > 0 && btnCount <= 5) {
    for (let i = 1; i <= btnCount; ++i) {
      res[0].push(i.toString());
    }
  } else if (btnCount > 0 && btnCount <= 8) {
    res = [[], []];
    const separator = ((btnCount+1) / 2) | 0;
    for (let i = 1; i <= separator; ++i) {
      res[0].push(i.toString());
    }
    for (let i = separator + 1; i <= btnCount; ++i) {
      res[1].push(i.toString());
    }
  }
  console.log(btnCount, res);
  return res;
}

function fullButtonsMarkup(btnCount){
  let res = photoRateButtonsGenerator(btnCount);
  res.push(buttonsArray[0]);
  res.push(buttonsArray[1]);
  return res;
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
    const { message_id, chat } = await ctx.reply(
      "Оценка работ",
      Markup.keyboard(fullButtonsMarkup(0))
        .resize()
        .extra()
    );
    ctx.session.caption = [chat.id, message_id];
      
    const user = await ctx.base.getUser(ctx.from.id);
    let show = (ctx.session.show = { index: user.page, status: "many" });
    show.messageSize = await ctx.user.sendWorksGroup(ctx);
    show.array = ctx.session.works;
    console.log(ctx.session);
    await ctx.user.needNumber(ctx, "оценки");
  }

  async savePost(ctx) {
    await ctx.answerCbQuery("Сохранено");
    await ctx.base.savePost(ctx.chat.id, ObjectID(ctx.match[1]));
  }

  async ratePost(ctx) {
    if (!ctx.match[1] || !ctx.match[2]) return;
    const show = ctx.session.show;
    await ctx.answerCbQuery("Вы поставили " + ctx.match[1]);
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [
        [...Array(5).keys()].map((i) =>
          Markup.callbackButton(
            (+ctx.match[1] === i + 1 ? "[" : "") +
              String(i + 1) +
              (+ctx.match[1] === i + 1 ? "]" : ""),
            String(i + 1) + "-" + show.array[show.indexWork]._id
          )
        ),
        [
          Markup.callbackButton(
            "📎 Сохранить",
            "save-" + show.array[show.indexWork]._id
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
        await ctx.reply(
          "Работы с таким номером не существует, попробуйте заново."
        );
        await user.checkDos(ctx, user.deleteLastNMessage);
        show.messageSize += 2;
      } else {
        show.status = "one";
        await showToRate(ctx);
      }
      [show.array, ctx.session.works] = [ctx.session.works, show.array];
      return;
    }
    
    switch (ctx.message.text) {
    case "⏩ Следующая страница":
      show.status = "many";
      await user.updateWith(user.shiftIndex(ctx, 1), user.sendWorksGroup);
      await ctx.user.needNumber(ctx, "оценки");
      break;
    case "⏪ Предыдущая страница":
      show.status = "many";
      await user.updateWith(user.shiftIndex(ctx, -1), user.sendWorksGroup);
      await ctx.user.needNumber(ctx, "оценки");
      break;
    case "⬅ Назад":
      if (show.status === "many")
      {
        show.status = undefined;
        await ctx.base.putUser(ctx.from.id, { page: ctx.session.show.index });
        await ctx.user.goMain(ctx);
      } else {
        show.status = "many";  
        await user.updateWith(ctx, user.sendWorksGroup);
        await ctx.user.needNumber(ctx, "оценки");
      }
      break;
    }
  }
})();
