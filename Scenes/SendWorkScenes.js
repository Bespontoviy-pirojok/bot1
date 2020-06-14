const Scene = require("telegraf/scenes/base");

class SendWorkScenes {
  PhotoUploadScene() {
    const photoUpload = new Scene("photoUpload");
    photoUpload.enter(async (ctx) => {
      await ctx.reply(
        "Отправьте фотографии в формате jpeg или png. Первая фотография будет использоваться в качестве превью к вашей работе"
      );
    });
    //TODO: ю блять ноу что тут надобно альбомы обрабатывать? и что насчёт сраных описаний?
    photoUpload.on("photo", async (ctx) => {
      const imageData = await bot.telegram.getFile(
        ctx.message.photo[ctx.message.photo.length - 1].file_id
      );
      const link = await telegram.getFileLink(imageData.file_id);
      await ctx.replyWithPhoto({ url: link });
      //TODO: write code to push data (fileID) in database
    });
    return photoUpload;
  }
}

module.exports = SendWorkScenes;
