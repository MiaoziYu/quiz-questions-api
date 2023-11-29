import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

const qColl = db.collection("questions");
const uColl = db.collection("userStats");

router.get("/", async (req, res) => {
  const {
    query: {
      tag = null,
      userId = null,

      undone = "true",

      limit = "1",
      last = null,
    }
  } = req;

  let userStats = null;
  if (userId) {
    userStats = await uColl.findOne({ _id: userId });
  }

  let query = {
    // tag
    ... (tag ? { tag } : {}),
    ... (last ? { $and: [{ _id: { $gt: ObjectId(last) } }] } : {})
  };

  if (userStats) {
    if (undone.toLowerCase() === 'true') {
      query.$and = [].concat(query.$and ? query.$and : []).concat({
        _id: {
          $nin: [
            ...Object.values(userStats.correctQuestionIds).flat().map((id) => ObjectId(id))
          ]
        }
      })
    }
  }

  try {
    const results = await qColl.find(query)
      .limit(parseInt(limit))
      .toArray();

    res.json({ data: results, meta: { last: results.length ? results[results.length - 1]._id : null } }).status(200);
  } catch (error) {
    console.log(error)
    throw new Error(error.message);
  }
});

export default router;