const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require("uuid")

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;

  const user = users.find(user => user.username === username);

  if(user) {
    req.user = user;

    return next();
  }

  return res.status(404).json({ error: "user not found!" })
}

app.post('/users', (req, res) => {
  const { name, username } = req.body

  const userAlreadyExists = users.some((user) => user.username === username)

  if(userAlreadyExists) return res.status(400).json({
    error: 'User already exists!'
  })

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
  const { user } = req

  res.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { username } = req.headers;

  const id = uuidv4()

  const todo = {
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
    id
  }

  users.forEach((item) => {
    item.username ===  username ? item.todos.push(todo) : null
  })

  return res.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { title, deadline } = req.body;
  const { id } = req.params;
  const todo = user.todos.find((todo) => todo.id === id);


  if(!todo) return res.status(404).json({ error: "Todo not found!" });

  todo.title = title;
  todo.deadline = new Date(deadline);

  return res.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if(!todo) return res.status(404).json({ error: "Todo not found!" });

  todo.done = true;

  return res.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const todo = user.todos.findIndex((todo) => todo.id === id);

  if(todo === -1) return res.status(404).json({ error: "Todo not found!" });

  user.todos.splice(todo, 1);
  return res.status(204).json();
});

module.exports = app;