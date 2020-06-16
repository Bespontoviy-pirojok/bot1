class Wrapper {
  constructor() {}
  static get() {
    return new Wrapper();
  }
  middleware() {
    return (ctx, next) => {
      this.ctx = ctx;
      ctx.wrap = this;
      next();
    };
  }
  typedAsPhoto(arr) {
    return arr.map((elem) => {
      return { type: "photo", media: elem };
    });
  }
  async sendWork(postId) {
    if (postId === undefined) {
      this.ctx.reply("Здесь пока ничего нет");
      return 1;
    }
    const post = await this.ctx.base.getPost(postId);
    if (post === undefined) {
      this.ctx.reply("Пост удалён");
      return 1;
    }
    let size = post.photos.length;
    if (post.description !== null) {
      ++size;
      await this.ctx.reply(post.description);
    }
    this.ctx.telegram.sendMediaGroup(
      this.ctx.from.id,
      this.typedAsPhoto(post.photos)
    );
    return size;
  }
  shiftIndex(index, shift, max) {
    if (index === -1) return -1;
    return (index + ((max + shift) % max)) % max;
  }
  async deleteLastNMessage(n) {
    this.ctx.update.message.message_id -= n;
    while (n) {
      this.ctx.update.message.message_id++;
      this.ctx.deleteMessage().catch(console.log);
      --n;
    }
  }
  async goMain() {
    await this.ctx.scene.leave();
    await this.main(this.ctx);
  }
  main = async (ctx) => {};
}

module.exports = Wrapper;
