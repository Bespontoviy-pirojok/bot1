function uniq(a) {
  let prims = new Map(),
    out = [],
    j = 0;
  for (let e of a) {
    if (!prims[e._id]) {
      out[j++] = e;
      prims[e._id] = true;
    }
  }
  return [out.length === a.length, out];
}

class DataBase {
  constructor() {
    global.DataBaseController = this;
    this.mongodb = require("mongodb");
    global.Controller.once("DataBaseConnect", this.connect);
  }
  connect(name, config) {
    global.DataBaseController.mongodb
      .MongoClient(...config)
      .connect((err, client) => {
        if (err !== null) {
          global.Controller.emit("Error", err);
          return;
        }
        global.DataBase = client.db(name);
        global.Controller.emit("DataBaseConnected");
      });
  }
  static get() {
    return new DataBase();
  }
  middleware() {
    return (ctx, next) => {
      ctx.base = this;
      next();
    };
  }
  async set(name, note) {
    const collection = global.DataBase.collection(name);
    try {
      const resp = await collection.insertOne(note);
      return resp.ops[0];
    } catch (e) {
      global.Controller.emit("Error", e);
    }
  }
  async get(name, details) {
    const collection = global.DataBase.collection(name);
    try {
      const resp = await collection.find(details).toArray();
      return resp;
    } catch (e) {
      global.Controller.emit("Error", e);
    }
  }
  async update(name, details, toUpdate) {
    const collection = global.DataBase.collection(name);
    try {
      const resp = await collection.updateMany(details, { $set: toUpdate });
      return resp.ops;
    } catch (e) {
      global.Controller.emit("Error", e);
    }
  }
  async remove(name, details) {
    const collection = global.DataBase.collection(name);
    try {
      const resp = await collection.deleteMany(details);
      return resp.ops;
    } catch (e) {
      global.Controller.emit("Error", e);
    }
  }
  async getUser(userId) {
    console.log("getUser: ", userId);
    return (await global.DataBaseController.get("User", { _id: userId }))[0];
  }
  async setUser(user) {
    console.log("putUser: ", user);
    return await global.DataBaseController.set("User", user);
  }
  async putUser(userId, user) {
    console.log("putUser: ", user);
    return await global.DataBaseController.update(
      "User",
      { _id: userId },
      user
    );
  }
  async getPost(postId) {
    console.log("getPost: ", postId);
    return (await global.DataBaseController.get("Post", { _id: postId }))[0];
  }

  async getNotSeenPosts(userId) {
    console.log("getNotSeenPosts: ", userId);
    const user = (
        await global.DataBaseController.get("User", { _id: userId })
      )[0],
      posts = await global.DataBaseController.get("Post");
    return uniq(user.seen.concat(posts))[1]
      .filter((obj) => obj.photos && obj.authId != userId)
      .map((obj) => {
        return { _id: obj._id, preview: obj.photos[0] };
      });
  }
  async deletePost(postId) {
    console.log("deletePost: ", postId);
    return await global.DataBaseController.remove("Post", { _id: postId });
  }
  async savePost(userId, postId) {
    console.log("savePost: ", userId, postId);
    const user = await this.getUser(userId);
    let uniqed = false;
    [uniqed, user.save] = uniq(user.save.push({ _id: postId }));
    if (uniqed) {
      await global.DataBaseController.putUser(userId, { save: user.save });
    }
  }
  async seenPost(userId, postId) {
    console.log("seenPost: ", userId, postId);
    const user = await global.DataBaseController.getUser(userId);
    let uniqed = false;
    [uniqed, user.seen] = uniq(user.seen.push({ _id: postId }));
    if (uniqed) {
      await global.DataBaseController.putUser(userId, { seen: user.seen });
    }
  }
  async postedPost(userId, postId) {
    console.log("postedPost: ", userId, postId);
    const user = await global.DataBaseController.getUser(userId);
    let uniqed = false;
    user.posted.push({ _id: postId });
    [uniqed, user.posted] = uniq(user.posted);
    if (uniqed) {
      await this.putUser(userId, { posted: user.posted });
    }
  }
  async setPost(post) {
    console.log("putPost: ", post);
    return await global.DataBaseController.set("Post", post);
  }
}

module.exports = DataBase;
