class DataBase {
  constructor(token) {}
  static get(token) {
    return new DataBase(token);
  }
  middleware() {
    return (ctx, next) => {
      ctx.base = this;
      next();
    };
  }
  async getUser(userId) {
    console.log("getUser: ", userId);
    return {
      id: userId,
      saved: ["1", "2", "3"],
      posted: ["1", "4"],
      seen: ["2"],
    };
  }
  async putUser(user) {
    console.log("putUser: ", user);
  }
  async getPost(postId) {
    console.log("getPost: ", postId);
    return {
      _id: postId,
      authId: 430830139,
      description: "Осьминог хули id:" + postId,
      photos: [
        "AgACAgIAAxkBAAIFYV7mLeS22ZUnlXAgbU2o8JS7MhXcAAK1rTEbiIgpSzOESQRySxAcJHW5ky4AAwEAAwIAA3kAA7gsAQABGgQ",
        "AgACAgIAAxkBAAIFYl7mLeTsVIMudGD-bp-Ir9Kjj-7lAALGrTEbiIgpS3XiqRxWbxha9vJNkS4AAwEAAwIAA3kAA2C3BAABGgQ",
      ],
    };
  }
  async getNewPost(userId) {
    const postId = "типа нью";
    this.seenPost(userId, postId);
    console.log("getNewPost: for ", userId);
    return this.getPost(postId);
  }
  async seenPost(userId, postId) {
    console.log("seenPost: ", userId, postId);
  }
  async putPost(post) {
    console.log("putPost: ", post);
  }
}

module.exports = DataBase;
