const Scene = require("telegraf/scenes/base");

class EvaluationScenes {
  EvaluationScene() {
    //  TODO А ТУТ Я НИХУЯ НЕ ПОНЯЛ, КАКОГО ХУЯ
    const evaluation = new Scene("EvaluationScene");
    evaluation.enter(async (ctx) => {
      await ctx.reply("ЫЫЫЫЫЫЫЫ");
    });
    return evaluation;
  }
}

module.exports = EvaluationScenes;
