bot.command("onetime", ({ reply }) => reply("One time keyboard"));

bot.command("custom", ({ reply }) => {
  return reply(
    "Custom buttons keyboard",
    Markup.keyboard([
      ["🔍 Search", "😎 Popular"], // Row1 with 2 buttons
      ["☸ Setting", "📞 Feedback"], // Row2 with 2 buttons
      ["📢 Ads", "⭐️ Rate us", "👥 Share"], // Row3 with 3 buttons
    ])
      .oneTime()
      .resize()
      .extra()
  );
});

bot.hears("🔍 Search", (ctx) => ctx.reply("Yay!"));
bot.hears("📢 Ads", (ctx) => ctx.reply("Free hugs. Call now!"));

bot.command("special", (ctx) => {
  return ctx.reply(
    "Special buttons keyboard",
    Extra.markup((markup) => {
      return markup
        .resize()
        .keyboard([
          markup.contactRequestButton("Send contact"),
          markup.locationRequestButton("Send location"),
        ]);
    })
  );
});

bot.command("pyramid", (ctx) => {
  return ctx.reply(
    "Keyboard wrap",
    Extra.markup(
      Markup.keyboard(["one", "two", "three", "four", "five", "six"], {
        wrap: (btn, index, currentRow) => currentRow.length >= (index + 1) / 2,
      })
    )
  );
});

bot.command("simple", (ctx) => {
  return ctx.replyWithHTML(
    "<b>Coke</b> or <i>Pepsi?</i>",
    Extra.markup(Markup.keyboard(["Coke", "Pepsi"]))
  );
});

bot.command("inline", (ctx) => {
  return ctx.reply(
    "<b>Coke</b> or <i>Pepsi?</i>",
    Extra.HTML().markup((m) =>
      m.inlineKeyboard([
        m.callbackButton("Coke", "Coke"),
        m.callbackButton("Pepsi", "Pepsi"),
      ])
    )
  );
});

bot.command("random", (ctx) => {
  return ctx.reply(
    "random example",
    Markup.inlineKeyboard([
      Markup.callbackButton("Coke", "Coke"),
      Markup.callbackButton("Dr Pepper", "Dr Pepper", Math.random() > 0.5),
      Markup.callbackButton("Pepsi", "Pepsi"),
    ]).extra()
  );
});

bot.command("caption", (ctx) => {
  return ctx.replyWithPhoto(
    { url: "https://picsum.photos/200/300/?random" },
    Extra.load({ caption: "Caption" })
      .markdown()
      .markup((m) =>
        m.inlineKeyboard([
          m.callbackButton("Plain", "plain"),
          m.callbackButton("Italic", "italic"),
        ])
      )
  );
});

bot.hears(/\/wrap (\d+)/, (ctx) => {
  return ctx.reply(
    "Keyboard wrap",
    Extra.markup(
      Markup.keyboard(["one", "two", "three", "four", "five", "six"], {
        columns: parseInt(ctx.match[1]),
      })
    )
  );
});

bot.action("Dr Pepper", (ctx, next) => {
  return ctx.reply("👍").then(() => next());
});

bot.action("plain", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageCaption(
    "Caption",
    Markup.inlineKeyboard([
      Markup.callbackButton("Plain", "plain"),
      Markup.callbackButton("Italic", "italic"),
    ])
  );
});

bot.action("italic", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageCaption(
    "_Caption_",
    Extra.markdown().markup(
      Markup.inlineKeyboard([
        Markup.callbackButton("Plain", "plain"),
        Markup.callbackButton("* Italic *", "italic"),
      ])
    )
  );
});

bot.action(/.+/, (ctx) => {
  return ctx.answerCbQuery(`Oh, ${ctx.match[0]}! Great choice`);
});

bot.start((ctx) => {
  ctx.reply(
    "С помощью этого бота можно оценивать работы дизайнеров 😎😎😎",
    Markup.keyboard([
      "Выложить работу",
      "Поставить оценку",
      "Мои оценки",
      "Сохранённое",
    ])
      .resize()
      .oneTime()
      .extra()
  );
});

bot.hears("Выложить работу", (ctx) => {
  ctx.reply(
    "Отправьте фотографии в формате jpeg или png. Первая фотография будет использоваться в качестве превью к вашей работе"
  );
});

bot.on("photo", (ctx) => {
  console.log(ctx.message);
  return ctx.reply("ПОЛУЧЕНО, СУКА ПОДЗАБОРНАЯ БЛЯДЬ");
});

bot.hears("Поставить оценку", (ctx) => {
  ctx.reply("Хуй тебе");
});
bot.hears("Мои оценки", (ctx) => {
  ctx.reply("Хуй тебе");
});
bot.hears("Сохранённое", (ctx) => {
  ctx.reply("Хуй тебе");
});
