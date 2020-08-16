const Wrapper = require("./Wrapper");
const {Markup} = require("telegraf");

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
  typedAsPhoto(arr, desc) {
    return arr.map((elem, index) => {
      return index === 0 ? { type: "photo", media: elem, caption: desc } : { type: "photo", media: elem };
    });
  }
  //  Смещения указателя show.index на shift в пределах show.size
  shiftIndex(ctx, shift) {
    const show = ctx.session.show;
    console.log("user.shiftIndex: ", shift, show.index, show.size);
    if (show.index !== -1) {
      // -1, если нечего индексировать
      show.index = (show.index + ((show.size + shift) % show.size)) % show.size; //  Само смещение
    }
    console.log("-> New index: ", show.index);
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
      // TODO: Как попытка исправления флекса нужно переделать через что-то async
      ctx.deleteMessage().catch();
      // if ((await ctx.deleteMessage().catch(() => -1)) === -1) break;
      ctx.update.message.message_id--;
    }
    this.free(ctx); //  Конец сложных запросов, можно разжать булки
  }
  //  Отправка работ
  async sendWork(ctx, postId) {
    const show = ctx.session.show,
      posts = show.array;
    postId =
      postId || (posts && posts[show.indexWork] && posts[show.indexWork]._id) || -1;
    if (postId === -1) {
      ctx.reply("Здесь пока ничего нет");
      ctx.session.show.messageSize = 1;
      return 1;
    }
    const post = await ctx.base.getPost(postId);
    if (post === undefined) {
      ctx.reply("Пост удалён");
      ctx.session.show.messageSize = 1;
      return 1;
    }
    // Дополняем описание информацией об оценках
    let description = post.description || "";
    if (post.authId === ctx.from.id) {
      let rate = ctx.base.countRate(post);
      if (rate === 0.0)
        description += "\nПока никто не оценил...";
      else 
        description += "\nСредняя оценка: " + rate + "\nЧеловек оценило: " + Object.values(post.rates).length;
    }
    let size = post.photos.length;

    await ctx.telegram.sendMediaGroup(
      ctx.from.id,
      this.typedAsPhoto(post.photos)
    );
    ctx.session.show.messageSize = size += 1;
    await ctx.reply(`Описание: ${description}`, Markup.keyboard(["⬅ Назад"]).resize().extra());

    return size;
  }

  async sendPage(ctx, page) {
    //  Номер группы превью в ленте
    page = page || ctx.session.show.index;
    //  Получение постов
    let posts = ctx.session.show.array,
      perPage = 8, // Сколько превью выводим на одну страницу
      show = ctx.session.show;
      //  Получение старницы с постами
    console.log(posts.length, page);
    let works = posts.slice(perPage * page, perPage * (page + 1));
    console.log(works.length, page);
    for (let i = 0; i < works.length; i++) {
      if (!works[i].photos) {
        works[i] = await global.DataBaseController.getPost(works[i]._id);
      }
      works[i] = { _id: works[i]._id, preview: works[i].photos[0] };
    }
    // Если нет ничего нового
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
        console.log("Error", e.on);
        works.length = 1;
        await ctx.reply("error");
      });
    //  Количество страниц
    show.size = ((ctx.session.show.size + perPage - 1) / perPage) | 0;
    //  Кешируем работы
    ctx.session.works = works;
    //  Сколько места занимает страница
    return works.length;
  }

  //  ОТПРАВЛЯЕТ страницу с ПРЕВЬЮ из ленты ПОЛЬЗОВАТЕЛЮ
  async sendWorksGroup(ctx, page) {
    //  Получение непросмотренных постов
    let posts = await ctx.base.getNotSeenPosts(ctx.from.id),
      show = ctx.session.show;
    show.size = posts.length;
    [ posts, ctx.session.show.array ] = [ ctx.session.show.array, posts ];
    let size = this.sendPage(ctx, page);
    [ posts, ctx.session.show.array ] = [ ctx.session.show.array, posts ];
    return size;
  }

  async needNumber(ctx, for_)
  {
    if (ctx.session.works && ctx.session.works.length !== 0)
    {
      // Я в душе не ебу, что здесь, но тут таск никиты
      await ctx.reply("Введите номер работы для " + for_, Markup.keyboard([
        ["⏪ Предыдущая страница", "⏩ Следующая страница"],
        ["⬅ Назад"],
      ]).resize().extra());
      ctx.session.show.messageSize += 1;
    }
  }

  //  Корневая сцена
  async goMain(ctx) {
    await ctx.scene.leave();
    await this.main(ctx);
  }
}

module.exports = User;
