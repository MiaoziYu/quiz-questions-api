import express from "express";
import db from "../db/conn.mjs";

const router = express.Router();

const tagsCollection = db.collection("tags");
const userStatsCollection = db.collection("userStats");

const getTags = async () => {
  const query = {};
  return await tagsCollection.find(query).toArray();
};

const getUserStats = async (id) => {
  const pipeline = [
    {
      $match: {
        _id: id
      }
    },
    {
      $project: {
        stats: {
          css: {
            correct: { $cond: [{ $gt: ["$correctQuestionIds.css", null] }, { $size: "$correctQuestionIds.css" }, 0] },
            incorrect: { $cond: [{ $gt: ["$incorrectQuestionIds.css", null] }, { $size: "$incorrectQuestionIds.css" }, 0] },
          },
          web: {
            correct: { $cond: [{ $gt: ["$correctQuestionIds.web", null] }, { $size: "$correctQuestionIds.web" }, 0] },
            incorrect: { $cond: [{ $gt: ["$incorrectQuestionIds.web", null] }, { $size: "$incorrectQuestionIds.web" }, 0] },
          },
          react: {
            correct: { $cond: [{ $gt: ["$correctQuestionIds.react", null] }, { $size: "$correctQuestionIds.react" }, 0] },
            incorrect: { $cond: [{ $gt: ["$incorrectQuestionIds.react", null] }, { $size: "$incorrectQuestionIds.react" }, 0] },
          },
          javascript: {
            correct: { $cond: [{ $gt: ["$correctQuestionIds.javascript", null] }, { $size: "$correctQuestionIds.javascript" }, 0] },
            incorrect: { $cond: [{ $gt: ["$incorrectQuestionIds.javascript", null] }, { $size: "$incorrectQuestionIds.javascript" }, 0] },
          }
        }
      }
    }
  ];

  const result = (await userStatsCollection.aggregate(pipeline).toArray())[0];

  return result;
};

router.get("/:id", async (req, res) => {
  const {
    params: {
      id
    }
  } = req;

  try {
    const tags = await getTags();
    const userStats = await getUserStats(id);

    console.log('userStats', JSON.stringify(userStats, null, 2))

    const data = {
      tags,
      userStats
    }

    res.json(data).status(200);
  } catch (error) {
    console.log(error)
    throw new Error(error.message);
  }
});

router.get("/", async (req, res) => {
  try {
    const tags = await getTags();

    const data = {
      tags,
    }

    res.json(data).status(200);
  } catch (error) {
    console.log(error)
    throw new Error(error.message);
  }
});

export default router;