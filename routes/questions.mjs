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
    }
  } = req;

  let userStats = null;
  if (userId) {
    userStats = await uColl.findOne({ _id: userId });
  }

  let query = {
    // tag
    ... (tag ? { tag } : {}),
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

  const pipeline = [
    {
      $match: query,
    },
    {
      $sample: { size: parseInt(limit) }
    }
  ];

  try {
    const results = (await qColl.aggregate(pipeline).toArray());

    return res.json(results).status(200);
  } catch (error) {
    console.log(error)
    throw new Error(error.message);
  }
});

export default router;