const { 
  fetchCommentsByArticleId,
  insertCommentByArticleId,
  deleteCommentById
 } = require('../models/comments.model');


function getCommentsByArticleId(req, res, next) {
  const { article_id } = req.params;

  fetchCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

function postCommentByArticleId(req, res, next) {
  const { article_id } = req.params;
  const { username, body } = req.body;

  if (isNaN(article_id)) {
    return res.status(400).send({ msg: 'Invalid article_id' });
  }

  if (!username || !body) {
      res.status(400).send({ msg: 'Bad request: missing username or body' });
      return;
  }

  insertCommentByArticleId(article_id, username, body)
      .then((comment) => {
          res.status(201).send({ comment });
      })
      .catch(next);
};

function deleteCommentByIdController(req, res, next) {
  const { comment_id } = req.params;

  if (isNaN(comment_id)) {
    return res.status(400).send({ msg: 'Invalid comment_id' });
  }

  deleteCommentById(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
}

module.exports = { getCommentsByArticleId, postCommentByArticleId, deleteCommentByIdController };
