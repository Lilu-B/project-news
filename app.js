const express = require('express');
const cors = require('cors');
const app = express();
const getApi = require("./controllers/api.controller");
const getTopics = require('./controllers/topics.controller');
const { getArticleById, getArticles, patchArticleVotes } = require('./controllers/articles.controller');
const { 
  getCommentsByArticleId, 
  postCommentByArticleId, 
  deleteCommentByIdController } = require('./controllers/comments.controller');
const getUsers = require('./controllers/users.controller');

app.use(cors());

app.use(express.json());


app.get('/api', getApi);
app.get('/api/topics', getTopics);
app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id', getArticleById);
app.get('/api/articles/:article_id/comments', getCommentsByArticleId);
app.get('/api/users', getUsers);

app.post('/api/articles/:article_id/comments', postCommentByArticleId);

app.patch('/api/articles/:article_id', patchArticleVotes);

app.delete('/api/comments/:comment_id', deleteCommentByIdController);


app.all('*', (req, res) => {
    res.status(404).send( {msg: 'Not Found'});
});

app.use((err, req, res, next) => {
  if (err.code === '23502') { 
    return res.status(400).send({ msg: 'Bad request: Invalid input' });
  }

  if (err.code === '22P02') { 
    return res.status(400).send({ msg: 'Bad request: Invalid input data type' });
  }

  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  }

  res.status(500).send({ msg: 'Server Error' });
});

module.exports = app;