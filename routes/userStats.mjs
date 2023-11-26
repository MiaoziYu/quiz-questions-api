import express from "express";
import db from "../db/conn.mjs";

const router = express.Router();

const collection = db.collection("userStats");

router.get("/:id", async (req, res) => {
  try {
    const user = await collection.findOne({ _id: req.params.id });
    res.json(user).status(200);
  } catch (error) {
    console.log(error)
    throw new Error(error.message);
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      body: {
        email
      }
    } = req;
    const filter = { _id: email };
    const update = {
      $setOnInsert: {
        _id: email,
        correctQuestionIds: {},
        incorrectQuestionIds: {},
      }
    };
    const options = { upsert: true };
    await collection.findOneAndUpdate(filter, update, options);

    res.json('').status(204);
  } catch (error) {
    console.log(error)
    throw new Error(error.message);
  }
});

router.patch("/:id", async (req, res) => {
  const query = { _id: req.params.id };

  const {
    questionId,
    questionTag,
    isAnswerCorrect,
  } = req.body;

  let [pushTarget, pullTarget] = [`correctQuestionIds.${questionTag}`, `incorrectQuestionIds.${questionTag}`];

  if (!isAnswerCorrect) {
    [pushTarget, pullTarget] = [`incorrectQuestionIds.${questionTag}`, `correctQuestionIds.${questionTag}`];
  }

  const update = {
    $addToSet: {
      [pushTarget]: questionId
    },

    $pull: {
      [pullTarget]: questionId
    }
  }

  try {
    await collection.updateOne(query, update, { upsert: true });
  } catch (error) {
    console.log(error)
    throw new Error(error.message);
  }

  res.json('').status(200);
});

export default router;