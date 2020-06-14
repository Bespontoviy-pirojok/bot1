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
  async deleteLastNMessage(n) {
    this.ctx.update.message.message_id -= n;
    while (n) {
      this.ctx.update.message.message_id++;
      await this.ctx.deleteMessage().catch(console.log);
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
