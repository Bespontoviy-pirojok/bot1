class DataBase {
  constructor(token) {}
  static get(token) {
    return new DataBase(token);
  }
  middleware() {
    return (ctx, next) => {
      ctx.base = this;
      this.ctx = ctx;
      next();
    };
  }
  async getUser(userId) {
    console.log("getUser: ", userId);
    return {
      id: userId,
      saved: ["1", "3", "2", "10"], // [],
      posted: ["1", "4"],
      seen: ["2"],
    };
  }
  async putUser(user) {
    console.log("putUser: ", user);
  }

  async getPost(postId) {
    console.log("getPost: ", postId);
    if (postId < 0 || postId > 10) return undefined;
    return postId !== "3"
      ? {
        _id: postId,
        authId: 430830139,
        description: "Осьминог хули id:" + postId,
        photos: [
          "AgACAgIAAxkBAAIFYV7mLeS22ZUnlXAgbU2o8JS7MhXcAAK1rTEbiIgpSzOESQRySxAcJHW5ky4AAwEAAwIAA3kAA7gsAQABGgQ",
          "AgACAgIAAxkBAAIFYl7mLeTsVIMudGD-bp-Ir9Kjj-7lAALGrTEbiIgpS3XiqRxWbxha9vJNkS4AAwEAAwIAA3kAA2C3BAABGgQ",
        ],
      }
      : {
        _id: postId,
        authId: 430830139,
        description: "Осьминог хули id:" + postId,
        photos: [
          "AgACAgIAAxkBAAIFYV7mLeS22ZUnlXAgbU2o8JS7MhXcAAK1rTEbiIgpSzOESQRySxAcJHW5ky4AAwEAAwIAA3kAA7gsAQABGgQ",
        ],
      };
  }

  async getNotSeenPosts(userId) {
    console.log("getNotSeenPosts: ", userId);
    return [
      {
        _id: "1",
        preview:
          "AgACAgIAAxkBAAIFYl7mLeTsVIMudGD-bp-Ir9Kjj-7lAALGrTEbiIgpS3XiqRxWbxha9vJNkS4AAwEAAwIAA3kAA2C3BAABGgQ",
      },
      {
        _id: "3",
        preview:
          "AgACAgIAAxkBAAIFYV7mLeS22ZUnlXAgbU2o8JS7MhXcAAK1rTEbiIgpSzOESQRySxAcJHW5ky4AAwEAAwIAA3kAA7gsAQABGgQ",
      },
      {
        _id: "4",
        preview:
          "AgACAgIAAxkBAAIFYl7mLeTsVIMudGD-bp-Ir9Kjj-7lAALGrTEbiIgpS3XiqRxWbxha9vJNkS4AAwEAAwIAA3kAA2C3BAABGgQ",
      },
      {
        _id: "5",
        preview:
          "AgACAgIAAxkBAAIFYl7mLeTsVIMudGD-bp-Ir9Kjj-7lAALGrTEbiIgpS3XiqRxWbxha9vJNkS4AAwEAAwIAA3kAA2C3BAABGgQ",
      },
      {
        _id: "6",
        preview:
          "AgACAgIAAxkBAAIFYl7mLeTsVIMudGD-bp-Ir9Kjj-7lAALGrTEbiIgpS3XiqRxWbxha9vJNkS4AAwEAAwIAA3kAA2C3BAABGgQ",
      },
    ];
  }
  async deletePost(postId) {
    console.log("deletePost: ", postId);
  }
  async getNewPost(userId) {
    const postId = "типа нью";
    this.seenPost(userId, postId);
    console.log("getNewPost: for ", userId, " ", postId);
    return this.getPost(postId);
  }
  async seenPosts(userId, postId) {
    console.log("seenPosts: ", userId, postId);
  }
  async putPost(post) {
    console.log("putPost: ", post);
  }
}

module.exports = DataBase;
