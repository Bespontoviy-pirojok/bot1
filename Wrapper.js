//  Это тупое говно тупого говна расширяет контекст
class Wrapper {
  constructor() {
    this.users = new Map(); //  Как объект, но быстрее
  }
  //  Для удобного экспорта через new
  static get() {
    return new Wrapper();
  }
  //  Расширение контекста объектом данного класса
  middleware() {
    return (ctx, next) => {
      //  Рашсирение контекста
      ctx.wrap = this;
      //  Антиспам пользователей, который ебашит пермач до
      //  тех пор, пока все запросы не обработаются
      if (this.users[ctx.from.id] === undefined) next();
    };
  }
  //  Блочит следующие запросы
  alloc(ctx) {
    this.users[ctx.from.id] = "busy";
  }
  //  Отключает блок запросов
  free(ctx) {
    this.users[ctx.from.id] = undefined;
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
    if (show.index === -1) return -1;  // -1, если нечего индексировать
    show.index = (show.index + ((show.size + shift) % show.size)) % show.size;  //  Само смещение
  }
  // Удаление послених N сообщений
  async deleteLastNMessage(ctx, n) {
    this.alloc(ctx);  //  Нужно тормознуть процессы для пользователя, так как удаление - дорогорстояющая операция
    n = n  || ctx.session.show.messageSize + 1;
    /*
      Удалить можно только то сообщение, на которое указывает контекст
      Снизу - указателя для сообщений, который смещается на N,
      а затем удаляет все последующие посты
     */
    ctx.update.message.message_id -= n;
    while (n--) {  //  Само удадение
      ctx.update.message.message_id++;
      await ctx.deleteMessage().catch(console.log);
    }
    this.free(ctx);  //  Конец сложных запросов, можно разжать булки
  }
  //  Отправка работ
  async sendWorkToUser(ctx, posts, postId) {
    if (postId === "-1") {
      ctx.reply("Здесь пока ничего нет");
      return 1;
    }
    postId = postId || posts[ctx.session.show.index]._id;
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

  //  ОТПРАВЛЯЕТ страницу с ПРЕВЬЮ из ленты ПОЛЬЗОВАТЕЛЮ, ЕБАТЬ ЕГО В СРАКУ
  async sendWorksGroup(ctx, page) {
    //  Номер группы превью в ленте
    page = page || ctx.session.show.index;
    //  Получение непросмотренных постов
    const posts = await ctx.base.getNotSeenPosts(ctx.from.id),
      perPage = 2, // Сколько превью выводим на одну страницу
      show = ctx.session.show,
      //  Получение старницы с постами
      works = posts.slice(perPage * page, perPage * (page + 1));
    //  Отправка превьюшек полльхователю, ебать его в анус (без агрессии)
    ctx.telegram.sendMediaGroup(
      ctx.from.id,
      this.typedAsPhoto(works.map((it) => it.preview))
    );
    //  Сколько места занимает страница
    show.messageSize = works.length;
    //  Количество страниц
    show.size = ((posts.length + perPage - 1) / perPage) | 0;
    //  Кешируем работы
    ctx.session.works = works;
  }

  //  Корневая сцена
  async goMain(ctx) {
    await ctx.scene.leave();
    await this.main(ctx);
  }
  //  Колбэк корневой сцены - задаётся вручную
  main = async (ctx) => {};
}

module.exports = Wrapper;
