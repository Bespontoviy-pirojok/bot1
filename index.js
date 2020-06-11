// @mamkin_designer_bot
// https://www.mindmeister.com/ru/1522778260?t=8C07mVgoEn

const config = require('./congif.json')

const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')

const bot = new Telegraf(config.token)

// bot.use(Telegraf.log())

bot.start((ctx) => {
  ctx.reply('С помощью этого бота можно оценивать работы дизайнеров 😎😎😎', Markup
    .keyboard([
      'Выложить работу',
      'Поставить оценку',
      'Мои оценки',
      'Сохранённое'])
    .resize()
    .oneTime()
    .extra())
})

bot.hears('Выложить работу', (ctx) => {
  ctx.reply('Отправьте фотографии в формате jpeg или png. Первая фотография будет использоваться в качестве превью к вашей работе');
})

bot.on('photo', (ctx) => {
  console.log(ctx.message)
  return ctx.reply('ПОЛУЧЕНО, СУКА ПОДЗАБОРНАЯ БЛЯДЬ')
})




bot.hears('Поставить оценку', (ctx) => {
  ctx.reply('Хуй тебе');
})
bot.hears('Мои оценки', (ctx) => {
  ctx.reply('Хуй тебе');
})
bot.hears('Сохранённое', (ctx) => {
  ctx.reply('Хуй тебе');
})

////////////////////////////////////////////////////////////////////////////////////////

