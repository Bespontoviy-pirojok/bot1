const Wrapper = require("./Wrapper");
const {Markup} = require("telegraf");
const { async } = require("q");

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
    let count = ctx.session.show.responsedMessageCounter + 1;
    ctx.session.show.responsedMessageCounter = await update.call(this, ctx);
    await this.deleteLastNMessage(ctx, count);
  }
  // Удаление послених N сообщений
  async deleteLastNMessage(ctx, n) {
    this.alloc(ctx); //  Нужно тормознуть процессы для пользователя, так как удаление - дорогорстояющая операция
    n = n || ctx.session.show.responsedMessageCounter + 1;
    console.log("DeletN: ", n);
    if (n < 1) return;
    /*
      Удалить можно только то сообщение, на которое указывает контекст
      Снизу - указателя для сообщений, который смещается на N,
      а затем удаляет все последующие посты
     */
    let messageToDelete = [];
    while (n--) {
      messageToDelete.push(ctx.update.message.message_id--);
    }
    // Делаем массив запросов на удаление 
    let promises = messageToDelete.map(async (messageId) => await ctx.telegram.deleteMessage(ctx.from.id, messageId).catch((err) => console.log("Error", err.on)));
    // Дожидаемся когда все они будут завершены
    (await Promise.all(promises));
    this.free(ctx); //  Конец сложных запросов, можно разжать булки
  }
  //  Отправка работ
  async sendWork(ctx, postId) {
    const show = ctx.session.show,
      posts = show.array,
      keyboard = Markup.keyboard(show.keyboard || ["⬅ Назад"]).resize().extra();
    postId =
      postId || (posts && posts[show.indexWork] && posts[show.indexWork]._id) || -1;
    if (postId === -1) {
      ctx.reply("Здесь пока ничего нет", keyboard);
      show.responsedMessageCounter = 1;
      return 1;
    }
    const post = await ctx.base.getPost(postId);
    if (post === undefined) {
      ctx.reply("Пост удалён", keyboard);
      show.responsedMessageCounter = 1;
      return 1;
    }
    // Дополняем описание информацией об оценках
    let description = post.description || "";
    show.responsedMessageCounter = post.photos.length;

    await ctx.telegram.sendMediaGroup(
      ctx.from.id,
      this.typedAsPhoto(post.photos)
    ).catch(async (err) => {
      console.log("Error", err.on);
      await ctx.reply("error");
      show.responsedMessageCounter = 1;
    });
    
    // Заготавливаем комментарий к работе
    let msg = ((description) ? `Описание: \n${description}` : "") + "\nДата публикации: " + (new Date(post.time)).toLocaleDateString("ru-RU", { month: "long", day: "numeric" });
    if (post.authId === ctx.from.id) {
      let rate = ctx.base.countRate(post);
      msg += (rate === 0.0) ? "\nПока никто не оценил..." : "\nСредняя оценка: " + rate + "\nЧеловек оценило: " + Object.values(post.rates).length;
    }
    
    // Отправляем комментарий
    await ctx.reply(msg, keyboard);
    show.responsedMessageCounter += 1; // Не забываем про то что каждое новое сообщение влияет на размер сцены\
    
    return show.responsedMessageCounter;
  }

  async sendPage(ctx, page) {
    //  Получение постов
    let posts = ctx.session.show.array,
      perPage = 4, // Сколько превью выводим на одну страницу
      show = ctx.session.show;
    //  Количество страниц
    show.size = ((show.size + perPage - 1) / perPage) | 0;
    page = (!page) ? (show.index = show.index % show.size) : (page % show.size);
    if ("" + show.index == "NaN") show.index = -1;
    //  Получение старницы с постами
    let works = posts.slice(perPage * page, perPage * (page + 1));
    // Проверяем есть ли у нас нужная информация, если нет просим
    works = works.map((work)=>{
      if (work.photos !== undefined || work.preview !== undefined)
        return work;
      else
        return global.DataBaseController.getPost(work._id); 
    });
    // Ждём, а затем правим посты
    works = (await Promise.all(works))
      .map((work)=>work && ((work.preview && work) || { _id: work._id, preview: work.photos[0] }))
      .map((obj)=>obj || { _id: 1, preview: "https://thumbs.dreamstime.com/b/simple-vector-circle-red-grunge-rubber-stamp-deleted-item-isolated-white-vector-circle-red-grunge-rubber-stamp-deleted-item-155433969.jpg" });
    // Если нет ничего нового
    if (works.length === 0) {
      show.responsedMessageCounter = 1;
      ctx.reply(show.empty || "Пусто...", Markup.keyboard(["⬅ Назад"]).resize().extra());
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
    //  Кешируем работы
    ctx.session.works = works;
    
    //  Сколько места занимает страница
    show.responsedMessageCounter = works.length;
    await this.needNumber(ctx);
    return show.responsedMessageCounter;
  }

  //  ОТПРАВЛЯЕТ страницу с ПРЕВЬЮ из ленты ПОЛЬЗОВАТЕЛЮ
  async sendWorksGroup(ctx, page) {
    //  Получение непросмотренных постов
    let posts = await ctx.base.getNotSeenPosts(ctx.from.id),
      show = ctx.session.show;
    show.size = posts.length;
    [ posts, ctx.session.show.array ] = [ ctx.session.show.array, posts ];
    let size = await this.sendPage(ctx, page);
    [ posts, ctx.session.show.array ] = [ ctx.session.show.array, posts ];
    return size;
  }

  async needNumber(ctx)
  {
    if (ctx.session.works && ctx.session.works.length !== 0 && ctx.session.show.index !== -1)
    {
      var buttonsArray = [
          ["⏪ Предыдущая страница", "⏩ Следующая страница"],
          ["⬅ Назад"],
        ],
        numButtons = ["1⃣", "2⃣", "3⃣", "4⃣"],
        show = ctx.session.show,
        generateKeyboardPageNavigator = function (btnCount){
          let res = [];
          if (btnCount > 0 && btnCount < 5) {
            res = [[]];
            for (let i = 1; i <= btnCount; ++i) {
              res[0].push(numButtons[i-1]);
            }
          } else if (btnCount > 0 && btnCount <= 8) {
            res = [[], []];
            const separator = ((btnCount+1) / 2) | 0;
            for (let i = 1; i <= separator; ++i) {
              res[0].push(numButtons[i-1]);
            }
            for (let i = separator + 1; i <= btnCount; ++i) {
              res[1].push(numButtons[i-1]);
            }
          }
          res = res.concat(buttonsArray);
          return res;
        };
      await this.reply(ctx,
        "Нажмите на номер работы для " + (show.for || "просмотра"),
        generateKeyboardPageNavigator(ctx.session.works.length)
      );
      show.responsedMessageCounter += 1;
    }
  }
  async reply(ctx, msg, keyboard)
  {
    keyboard = keyboard && Markup.keyboard(keyboard).resize().extra();
    return await ctx.reply(msg, keyboard);
  }

  //  Корневая сцена
  async goMain(ctx) {
    await ctx.scene.leave();
    await this.main(ctx);
  }
}

module.exports = User;
