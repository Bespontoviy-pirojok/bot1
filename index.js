// @mamkin_designer_bot
// https://www.mindmeister.com/ru/1522778260?t=8C07mVgoEn

const config = require('./congif.json')

const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const Stage = require('telegraf/stage')
const Session = require('telegraf/session')

const bot = new Telegraf(config.token)
bot.use(Telegraf.log())

//  Сохраненное
const Store = require('./StoreScenes')
const store = new Store
const StoreScene = store.StoreScene()

// Обработка сцен
const stage = new Stage([StoreScene])

bot.use(Session())
bot.use(stage.middleware())



bot.start((ctx => ctx.reply('Бот для всей хуйни', Markup
    .keyboard([
        'Посмотреть оценки своих работ',
        'Сохраненное',
        'Выложить работу',
        'Поставить оценку',
    ])
    .resize()
    .oneTime()
    .extra()
)))


bot.on('text', ctx => {
    switch (ctx.message.text) {
        case 'Посмотреть оценки своих работ':
            //TODO обработать
            ctx.reply('ПОШЁЛ НАХУЙ СО СВОИМИ ОЦЕНКАМИ И РАБОТАМИ')
            break;
        case 'Сохраненное':
            ctx.scene.enter('StoreScene')
            break;
        case 'Выложить работу':
            //TODO обработать
            ctx.reply('ПОШЁЛ НАХУЙ СО СВОИМИ РАБОТАМИ')
            break;
        case 'Поставить оценку':
            //TODO обработать
            ctx.reply('ПОШЁЛ НАХУЙ СО СВОИМИ ОЦЕНКАМИ')
            break;
    }
})

console.log('Я ЖИВ ЕБАТЬ')
bot.launch()