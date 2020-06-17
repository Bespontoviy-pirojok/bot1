class Wrapper {
  constructor() {
    this.users = new Map();
  }
  static get() {
    return new Wrapper();
  }
  middleware() {
    return (ctx, next) => {
      ctx.wrap = this;
      if (this.users[ctx.from.id] === undefined) next();
    };
  }
  alloc(ctx) {
    this.users[ctx.from.id] = "busy";
  }
  free(ctx) {
    this.users[ctx.from.id] = undefined;
  }
  typedAsPhoto(arr) {
    return arr.map((elem) => {
      return { type: "photo", media: elem };
    });
  }
  shiftIndex(ctx, shift) {
    const show = ctx.session.show;
    if (show.index === -1) return -1;
    show.index = (show.index + ((show.size + shift) % show.size)) % show.size;
  }
  async deleteLastNMessage(ctx, n) {
    this.alloc(ctx);
    if (n === undefined) n = ctx.session.show.messageSize + 1;
    ctx.update.message.message_id -= n;
    while (n) {
      ctx.update.message.message_id++;
      await ctx.deleteMessage().catch(console.log);
      --n;
    }
    this.free(ctx);
  }
  async sendWork(ctx, postId) {
    if (postId === undefined) {
      ctx.reply("Здесь пока ничего нет");
      return 1;
    }
    const post = await ctx.base.getPost(postId);
    if (post === undefined) {
      ctx.reply("Пост удалён");
      return 1;
    }
    let size = post.photos.length;
    if (post.description !== null) {
      ++size;
      await ctx.reply(post.description);
    }
    await ctx.telegram.sendMediaGroup(
      ctx.from.id,
      this.typedAsPhoto(post.photos)
    );
    ctx.session.show.messageSize = size;
    return size;
  }
  async sendWorksGroup(ctx, page) {
    if (page === undefined) page = ctx.session.show.index;
    const posts = await ctx.base.getNotSeenPosts(ctx.from.id),
      perPage = 2, // Сколько фоток выводим на одну страницу
      show = ctx.session.show,
      works = posts.slice(perPage * page, perPage * page + perPage);

    ctx.telegram.sendMediaGroup(
      ctx.from.id,
      this.typedAsPhoto(works.map((it) => it.preview))
    );
    show.messageSize = works.length;
    show.size = ((posts.length + perPage - 1) / perPage) | 0;
    ctx.session.works = works;
  }

  async goMain(ctx) {
    await ctx.scene.leave();
    await this.main(ctx);
  }

  main = async (ctx) => {};
}

module.exports = Wrapper;
