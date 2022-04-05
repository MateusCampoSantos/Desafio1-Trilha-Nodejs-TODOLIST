const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const findUser = users.find((user) => user.username === username);

  if (findUser) {
    return response.status(400).json({ error: "User Already exist" });
  }

  users.push({
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  });

  const user = users.findIndex((user) => {
    return user.username === username;
  });

  return response.status(201).json(users[user]);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const todos = user.todos;

  return response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  user.todos.push({
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  });

  const todo = user.todos.findIndex((todo) => {
    return todo.title === title;
  });

  return response.status(201).json(user.todos[todo]);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "TODO not found" });
  }
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    return response.status(404).json({ error: "TODO not found" });
  }
  todo.done = true;

  return response.status(201).json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const index = user.todos.findIndex((todo) => {
    return todo.id === id;
  });
  if (index !== -1) {
    user.todos.splice(index, 1);

    return response.status(204).json({ message: "TODO deleted" });
  }

  return response.status(404).json({ error: "TODO not found" });
});

module.exports = app;
