const Scene = require("telegraf/scenes/base");

class SendWorkScenes {
  constructor() {
    //объект работы
    this.works = {};
  }
  SendWorkScene() {
    const sendWork = new Scene("SendWorkScene");
    sendWork.enter(async (ctx) => {
      // обнуляем массив фото
      this.works[ctx.from.id] = [];
      await ctx.reply(
        "Отправьте фотографии в формате jpeg или png. Первая фотография будет использоваться в качестве превью к вашей работе"
      );
    });
    sendWork.on("photo", async (ctx) => {
      const originalPhoto = ctx.message.photo.length - 1;
      this.works[ctx.from.id] = this.works[ctx.from.id] || 0;
      this.works[ctx.from.id].push({type: 'photo', media: ctx.message.photo[originalPhoto].file_id});
    });
    // sendWork.enter()
    // sendWork.on("text", async (ctx) =>{
    //   console.log(this.works[ctx.from.id].length)
    //   if (this.works[ctx.from.id].length > 1 && this.works[ctx.from.id].length < 10){
    //     await ctx.replyWithMediaGroup(this.works[ctx.from.id]);
    //   }else{
    //     await ctx.reply('wtf are you doing?');
    //   }
    //   this.works[ctx.from.id] = [];
    // })
    return sendWork;
  }
}

module.exports = SendWorkScenes;
