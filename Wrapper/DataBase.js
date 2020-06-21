function uniq(a) {
  var prims = { boolean: {}, number: {}, string: {} },
    objs = [];

  const out = a.filter(function (item) {
    var type = typeof item;
    if (type in prims)
      return prims[type].hasOwnProperty(item)
        ? false
        : (prims[type][item] = true);
    else return objs.indexOf(item) >= 0 ? false : objs.push(item);
  });
  return [out.length === a.length, out];
}

class DataBase {
  constructor(config) {
    this.mongodb = require("mongodb");
    this.connect(config);
  }
  connect(config) {
    this.mongodb.MongoClient(...config).connect((err, client) => {
      if (err !== null) {
        global.Controller.emit("Error", err);
        return;
      }
      global.DataBaseController = this;
      global.DataBase = client.db("april");
      global.Controller.emit("DataBaseConnected");
    });
  }
  static get(config) {
    return new DataBase(config);
  }
  middleware() {
    return (ctx, next) => {
      ctx.base = this;
      next();
    };
  }
  async set(name, note) {
    var collection = global.DataBase.collection(name);
    try {
      const resp = await collection.insertOne(note);
      return resp.ops[0];
    } catch (e) {
      global.Controller.emit("Error", e);
    }
  }
  async get(name, details) {
    var collection = global.DataBase.collection(name);
    try {
      const resp = await collection.find(details).toArray();
      return resp;
    } catch (e) {
      global.Controller.emit("Error", e);
    }
  }
  async update(name, details, toUpdate) {
    var collection = global.DataBase.collection(name);
    try {
      const resp = await collection.updateMany(details, { $set: toUpdate });
      return resp.ops;
    } catch (e) {
      global.Controller.emit("Error", e);
    }
  }
  async remove(name, details) {
    var collection = global.DataBase.collection(name);
    try {
      const resp = await collection.deleteMany(details);
      return resp.ops;
    } catch (e) {
      global.Controller.emit("Error", e);
    }
  }
  async getUser(userId) {
    console.log("getUser: ", userId);
    return (await this.get("User", { _id: userId }))[0];
    return {
      _id: userId,
      saved: [{ _id: "1" }, { _id: "3" }, { _id: "2" }, { _id: "10" }], // [],
      posted: [{ _id: "1" }, { _id: "4" }],
      seen: [{ _id: "2" }],
    };
  }
  async setUser(user) {
    console.log("putUser: ", user);
    return this.set("User", user);
  }
  async putUser(userId, user) {
    console.log("putUser: ", user);
    return this.update("User", { _id: userId }, user);
  }
  async getPost(postId) {
    console.log("getPost: ", postId);
    return (await this.get("Post", { _id: postId }))[0];
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
    return await this.remove("Post", { _id: postId });
  }
  async savePost(userId, postId) {
    console.log("savePost: ", userId, postId);
    const user = await this.getUser(userId);
    var uniqed = false;
    [uniqed, user.save] = uniq(user.save.push({ _id: postId }));
    if (uniqed) {
      await this.putUser(userId, { save: user.save });
    }
  }
  async seenPost(userId, postId) {
    console.log("seenPost: ", userId, postId);
    const user = await this.getUser(userId);
    var uniqed = false;
    [uniqed, user.seen] = uniq(user.seen.push({ _id: postId }));
    if (uniqed) {
      await this.putUser(userId, { seen: user.seen });
    }
  }
  async postedPost(userId, postId) {
    console.log("postedPost: ", userId, postId);
    const user = await this.getUser(userId);
    var uniqed = false;
    user.posted.push({ _id: postId });
    [uniqed, user.posted] = uniq(user.posted);
    if (uniqed) {
      await this.putUser(userId, { posted: user.posted });
    }
  }
  async setPost(post) {
    console.log("putPost: ", post);
    return await this.set("Post", post);
  }
}

module.exports = DataBase;
