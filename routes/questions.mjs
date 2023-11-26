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

      incorrect = "false",
      newQuestion = "false"
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
    if (incorrect.toLowerCase() === 'true') {
      query = {
        ...query,
        _id: {
          $in: [
            ...Object.values(userStats.incorrectQuestionIds).flat().map((id) => ObjectId(id))
          ]
        }
      }
    } else if (newQuestion.toLowerCase() === 'true') {
      query = {
        ...query,
        _id: {
          $nin: [
            ...Object.values(userStats.correctQuestionIds).flat().map((id) => ObjectId(id)),
            ...Object.values(userStats.incorrectQuestionIds).flat().map((id) => ObjectId(id))
          ]
        }
      }
    }
  }

  try {
    const results = await qColl.find(query)
      .limit(10)
      .toArray();

    res.json(results).status(200);
  } catch (error) {
    console.log(error)
    throw new Error(error.message);
  }
});

export default router;