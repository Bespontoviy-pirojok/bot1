const Wrapper = require("./Wrapper");

class User extends Wrapper {
  constructor() {
    super();
    //  Колбэк корневой сцены - задаётся вручную
    this.main = async () => {};
  }
  //  Для удобного экспорта через new
  static get() {
    return new User();
  }
  //  Расширение контекста объектом данного класса
  middleware() {
    return (ctx, next) => {
      //  Рашсирение контекста
      ctx.user = this;
      //  Антиспам пользователей, который ебашит пермач до
      //  тех пор, пока все запросы не обработаются
      if (this.users[ctx.from.id] === undefined) next();
    };
  }
  //  Типиизрует токены фотографий для кормления api телеги
  typedAsPhoto(arr) {
    return arr.map((elem) => {
      return { type: "photo", media: elem };
    });
  }
  //  Смещения указателя show.index на shift в пределах show.size
  shiftIndex(ctx, shift) {
    const show = ctx.session.show;
    if (show.index !== -1) {
      // -1, если нечего индексировать
      show.index = (show.index + ((show.size + shift) % show.size)) % show.size; //  Само смещение
    }
    if (show.index.toString() === "NaN") {
      show.index = 0;
    }
    return ctx;
  }
  // Обновление показываемого пользователю
  async updateWith(ctx, update) {
    await this.deleteLastNMessage(ctx);
    ctx.session.show.messageSize = await update.call(this, ctx);
  }
  // Удаление послених N сообщений
  async deleteLastNMessage(ctx, n) {
    this.alloc(ctx); //  Нужно тормознуть процессы для пользователя, так как удаление - дорогорстояющая операция
    n = n || ctx.session.show.messageSize + 1;
    if (n < 1) return;
    /*
      Удалить можно только то сообщение, на которое указывает контекст
      Снизу - указателя для сообщений, который смещается на N,
      а затем удаляет все последующие посты
     */
    while (n--) {
      //  Само удадение
      if ((await ctx.deleteMessage().catch(() => -1)) === -1) break;
      ctx.update.message.message_id--;
    }
    this.free(ctx); //  Конец сложных запросов, можно разжать булки
  }
  //  Отправка работ
  async sendWork(ctx, postId) {
    const show = ctx.session.show,
      posts = show.array;
    postId =
      postId || (posts && posts[show.index] && posts[show.index]._id) || -1;
    if (postId === -1) {
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

  //  ОТПРАВЛЯЕТ страницу с ПРЕВЬЮ из ленты ПОЛЬЗОВАТЕЛЮ
  async sendWorksGroup(ctx, page) {
    //  Номер группы превью в ленте
    page = page || ctx.session.show.index;
    //  Получение непросмотренных постов
    const posts = await ctx.base.getNotSeenPosts(ctx.from.id),
      perPage = 8, // Сколько превью выводим на одну страницу
      show = ctx.session.show,
      //  Получение старницы с постами
      works = posts.slice(perPage * page, perPage * (page + 1));
    // Ксли нет ничего нового
    if (works.length === 0) {
      show.messageSize = 1;
      ctx.reply("Пусто...");
      return 1;
    }
    //  Отправка превьюшек полльхователю
    await ctx.telegram
      .sendMediaGroup(
        ctx.from.id,
        this.typedAsPhoto(works.map((it) => it.preview))
      )
      .catch(async (e) => {
        console.log(e.on.payload);
        works.length = 1;
        await ctx.reply("error");
      });
    //  Количество страниц
    show.size = ((posts.length + perPage - 1) / perPage) | 0;
    //  Кешируем работы
    ctx.session.works = works;
    //  Сколько места занимает страница
    return works.length;
  }

  //  Корневая сцена
  async goMain(ctx) {
    await ctx.scene.leave();
    await this.main(ctx);
  }
}

module.exports = User;