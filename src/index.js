const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require("uuid")

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.map((item) => {
    if(item.username === username) return item
  })

  if(user.length > 0) {
    req.user = user;

    return next();
  }

  res.status(400).json({ err: "user not found!" })
}

app.post('/users', (req, res) => {
  const { name, username } = req.body

  const id = uuidv4()

  const user = {
    id,
    name,
    username,
    todos: []
  }

  users.push(user)

  return res.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { username } = req.headers;

  users.map((item) => {
    if (item.username === username) return res.status(200).json({ todos: item });
  })

});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { username } = req.headers;

  const id = uuidv4()

  const todo = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  users.forEach((item) => {
    item.username ===  username ? item.todos.push({ todo }) : null
  })

  res.status(201).json({ todo: todo })
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const id = req.params.id 

  req.user[0].todos.map((item) => {
    if(item.todo.id === id) {
      item.todo.title = title
      item.todo.deadline = deadline
    }
  })

  res.status(201).send()
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  // Complete aqui
});

module.exports = app;