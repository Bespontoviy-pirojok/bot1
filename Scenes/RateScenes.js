const Scene = require("telegraf/scenes/base");
const Markup = require("telegraf/markup");

class RateScenes {
    constructor() {
        // init scenes
        this.scenes = {
            Rate: new Scene("Rate"),
            RateCurrentWork: new Scene("RateCurrentWork")
        };
        this.currPage = 0;
        this.pages = 0;
        this.works = [];

        // Информация для обработки
        this.way = new Map();

        this.scenes.Rate.enter(async (ctx) => {
            await ctx.reply(
                "Сохраненные",
                Markup.keyboard([
                    "Следующая страцница",
                    "Предыдущая страцница",
                    "Назад",
                ])
                    .resize()
                    .extra()
            );
            const works = await ctx.wrap.sendWorksGroup(this.currPage); // Вот это наверное хуево, но я хз как по-другому сделать
            this.works = works.items;
            this.perPage = works.perPage;
            this.pages = works.items.length - 1;
        });
        this.scenes.Rate.on("text", async (ctx) => {
            if (/[0-9]/.test(ctx.message.text)) {
                //TODO: сделать сцену с оценкой выбранного юзером поста
                ctx.wrap.sendWork(this.works[this.currPage][+ctx.message.text-1]._id); //  Вывод выбранного юзером поста
            }
            switch (ctx.message.text) {
                case "Следующая страцница":
                    await ctx.wrap.deleteLastNMessage(this.perPage+1);
                    this.currPage >= this.pages ? await ctx.wrap.sendWorksGroup(this.currPage) : await ctx.wrap.sendWorksGroup(++this.currPage);
                    break;
                case "Предыдущая страцница":
                    await ctx.wrap.deleteLastNMessage(this.perPage+1);
                    this.currPage <= 0 ? await ctx.wrap.sendWorksGroup(this.currPage) : await ctx.wrap.sendWorksGroup(--this.currPage);
                    break;
                case "Назад":
                    // this.way.delete(id);
                    await ctx.wrap.goMain();
                    break;
            }
        });
    }

    getScene(name) {
        return this.scenes[name];
    }
    getScenes() {
        return Object.values(this.scenes);
    }
}

module.exports = new RateScenes();
