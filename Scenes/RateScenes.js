const { Scene, Markup, Extra } = require("./Scenes");

const { ObjectID } = require("mongodb");

async function showToRate(ctx) {
  const user = ctx.user,
    show = ctx.session.show;
  await user.deleteLastNMessage(ctx);
  [show.index, show.indexWork] = [show.indexWork, show.index];
  ctx.session.show.messageSize = await user.sendWork(ctx);
  await ctx.base.seenPost(ctx.from.id, show.array[show.index]._id);
  await ctx.reply(
    "Оцените работу!",
    Extra.HTML().markup((m) =>
      m.inlineKeyboard([
        [...Array(5).keys()].map((i) =>
          m.callbackButton( // TODO: Отмечать кнопку если оценка уже поставлена
            String(i + 1),
            String(i + 1) + "-" + show.array[show.index]._id
          )
        ),
        [m.callbackButton("Сохранить", "save-" + show.array[show.index]._id)],
      ])
    )
  );
  [show.index, show.indexWork] = [show.indexWork, show.index];
  show.messageSize++;
}

var buttonsArray = [
  ["Предыдущая страцница", "Следующая страцница"],
  ["Назад"],
];

function photoRateButtonsGenerator(btnCount){
  let res = [];
  if (btnCount > 0 && btnCount <= 5) {
    for (let i = 1; i <= btnCount; ++i) {
      res.push(i.toString());
    }
  } else if (btnCount > 0 && btnCount <= 10) {
    res = [[], []];
    const separator = (btnCount / 2) | 0;
    for (let i = 1; i < separator; ++i) {
      res[0].push(i.toString());
    }
    for (let i = separator; i <= btnCount; ++i) {
      res[1].push(i.toString());
    }
  }
  return res;
}

function fullButtonsMarkup(btnCount){
  let res = [];
  if (btnCount<=5){
    res.push(photoRateButtonsGenerator(btnCount));
  } else {
    let photoRateButtonsArrays = photoRateButtonsGenerator(btnCount);
    res.push(photoRateButtonsArrays[0]);
    res.push(photoRateButtonsArrays[1]);
  }
  res.push(buttonsArray[0]);
  res.push(buttonsArray[1]);
  return res;
}

function correctButtonNumber(ctx) {
  // TODO: здесь нужно заменить сраный маркап на
  fullButtonsMarkup((ctx.session.works || []).lenght)
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
      "Оценить чужие работы\nВыберите номер работы для оценки",
      Markup.keyboard(fullButtonsMarkup(0))
        .resize()
        .extra()
    );
    ctx.session.caption = [chat.id, message_id];
    const user = await ctx.base.getUser(ctx.from.id);
    ctx.session.show = { index: user.page };
    ctx.session.show.messageSize = await ctx.user.sendWorksGroup(ctx);
    ctx.session.show.array = ctx.session.works;
    correctButtonNumber(ctx);
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
            String(i + 1) + "-" + show.array[show.index]._id
          )
        ),
        [
          Markup.callbackButton(
            "Сохранить",
            "save-" + show.array[show.index]._id
          ),
        ],
      ],
    });
    ctx.base.putRate(ctx.from.id, ctx.match[2]/*postId*/, ctx.match[1]/*rate*/);
  }

  async main(ctx) {
    const user = ctx.user,
      show = ctx.session.show;
    if (/[1-8]/.test(ctx.message.text)) {
      show.indexWork = +ctx.message.text - 1;
      show.array = ctx.session.works;
      if (!show.array[show.indexWork]) {
        await ctx.reply(
          "Работы с таким номером не существует, попробуйте заново."
        );
        await user.checkDos(ctx, user.deleteLastNMessage);
        show.messageSize += 2;
      } else await showToRate(ctx);
      return;
    }

    switch (ctx.message.text) {
    case "Следующая страцница":
      user.updateWith(user.shiftIndex(ctx, 1), user.sendWorksGroup);
      correctButtonNumber(ctx);
      break;
    case "Предыдущая страцница":
      user.updateWith(user.shiftIndex(ctx, -1), user.sendWorksGroup);
      correctButtonNumber(ctx);
      break;
    case "Назад":
      ctx.base.putUser(ctx.from.id, { page: ctx.session.show.index });
      ctx.telegram.deleteMessage(...ctx.session.caption);
      await user.deleteLastNMessage(ctx);
      await user.goMain(ctx);
      break;
    }
  }
})();
