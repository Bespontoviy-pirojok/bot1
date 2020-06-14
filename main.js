const Markup = require("telegraf/markup");

function main(ctx) {
  return ctx.reply(
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
  );
}

module.exports = main;
