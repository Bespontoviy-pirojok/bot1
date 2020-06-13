const Scene = require('telegraf/scenes/base')

class RatingScenes {
    RaitingScene(){
        const rating = new Scene('rating')
        rating.enter(async (ctx) => {
            return 0
        })
    }
}

module.exports = RatingScenes
