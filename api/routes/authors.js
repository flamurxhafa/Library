const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Author = require("../models/author");

router.get("/", (req, res, next) => {
 Author.find()
    .select("name  _id")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        authors: docs.map(doc => {
          return {
            name: doc.name,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/authors/" + doc._id
            }
          };
        })
      };
      // if (docs.length >= 0) {
      res.status(200).json(response);
      // } else {
      //   res.status(404).json({
      //     message: "No entries found"
      //   });
      // }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post("/", (req, res, next) => {
  const author = new Author({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
  });
  author
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Created author succesfully",
        createdAuthor: {
          name: result.name,
          _id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:3000/authors/" + result._id
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.get("/:authorId", (req, res, next) => {
  const id = req.params.authorId;
  Author.findById(id)
    .select("name  _id ")
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          author: doc,
          request: {
            type: "GET",
            url: "http://localhost:3000/authors"
          }
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:authorId", (req, res, next) => {
  const id = req.params.authorId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
 Author.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Author updated",
        request: {
          type: "GET",
          url: "http://localhost:3000/authors/" + id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete("/:authorId", (req, res, next) => {
  const id = req.params.authorId;
  Author.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Author deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/authors/",
          body: { name: "String",  }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;
