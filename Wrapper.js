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

  //Вот это тоже залупа какая-то, по-моему.. Но лучше не придумал
  async sendWorksGroup(page){
    //const posts = await this.ctx.base.getNotSeenPosts();
    let temp = [
      { _id: "1", preview: "AgACAgIAAxkBAAIBiF7oooeyKoBnlrMlQUIpde-SBmM8AALArTEbUYdIS4C7ia2r94YGSRwIki4AAwEAAwIAA20AA-SsAgABGgQ" },
      { _id: "2", preview: "AgACAgIAAxkBAAIBiF7oooeyKoBnlrMlQUIpde-SBmM8AALArTEbUYdIS4C7ia2r94YGSRwIki4AAwEAAwIAA20AA-SsAgABGgQ" },
      { _id: "3", preview: "AgACAgIAAxkBAAIBiF7oooeyKoBnlrMlQUIpde-SBmM8AALArTEbUYdIS4C7ia2r94YGSRwIki4AAwEAAwIAA20AA-SsAgABGgQ" },
    ] // Вот такие данные должны идти из getNotSeenPosts
    const PER_PAGE = 2; // Сколько фоток выводим на одну страницу
    const works = temp.reduce((rows, key, index) => (index % PER_PAGE == 0 ? rows.push([key])
        : rows[rows.length-1].push(key)) && rows, []); // Разбиваем массив по страницам

    this.ctx.telegram.sendMediaGroup(
      this.ctx.from.id,
      this.typedAsPhoto(works[page].map(it => it.preview))
    );

    return {
      items: works,
      perPage: PER_PAGE};
    }

  async goMain() {
    await this.ctx.scene.leave();
    await this.main(this.ctx);
  }

  main = async (ctx) => {};
}

module.exports = Wrapper;
