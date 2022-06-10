const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username)

  if(!user){
    return response.status(404).json({
      error: "User not found!"
    });    
  }

  request.user = user

  return next();
} 
function checksCreateTodosUseAvailability(request, response, next) {
  const { user } = request;

  console.log(user.todos.length)
  console.log(user.premium)

  if(user.premium == true){
    return next();
  }

  if (user.todos.length >= 10 ){
    return response.status(404).json({
      error: "You have reached 10 todos, get a premium acount to create more todos!"
    });   
  }

  if ((user.todos.length < 10 ) || (user.premium == true)){
    return next();
  } else {
    
  }
}

function checksTodoExists(request, response, next) {
  const { user } = request
  const { id } = request.params

  // const user = users.find(user => {
  //   return user.username === username
  // })
  console.log(id)
  const todo = user.todos.find(todo => {
    // console.log(todo.id)
    return todo.id === id
  })

  if (todo){
    request.todo = todo
    return next();
  } else {
    return response.status(404).json({
      error: "You don't have any todo with this id."
    });   
  }
}

function findUserById (request, response, next){
  const { id } = request.params;

  const user = users.find(user => user.id === id)

  if(!user){
    return response.status(404).json({
      error: "User not found!"
    });    
  }

  request.user = user

  return next();
}


app.post('/users', (request, response) => {
  const { name, username, premium } = request.body

  const userAlreadyExists = users.some(user => user.username === username)

  if(userAlreadyExists){
    return response.status(201).json({
      error: "This username already exists."
    });
  }

  const newUser = {
    id: uuidv4(),
    name, 
    username,
    premium,
    todos: [],
  }

  users.push(newUser)

  return response.status(201).json(users);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount,checksCreateTodosUseAvailability, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  // checksCreateTodosUseAvailability(user);

  user.todos.push({
    id: uuidv4(), // precisa ser um uuid
    title,
    deadline: new Date(deadline), 
    done: false, 
    created_at: new Date()
  })

  return response.status(201).send()

});

app.put('/todos/:id', checksExistsUserAccount, checksTodoExists, (request, response) => {
  // const { user } = request;
  const { todo } = request;
  // const { id } = request.params;
  const { title, deadline } = request.body;
  
  // const todo = user.todos.find(todo => todo.id === id)

  // if(!todo){
  //   return response.status(404).json({
  //     error: "Todo not found!."
  //   });
  // }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  
  const todo = user.todos.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).json({
      error: "Todo not found!."
    });
  }

  todo.done = (todo.done === false ? true : false)


  return response.status(201).json(todo)  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.headers;
  const { title, deadline } = request.body;
  
  const todo = user.todos.find(todo => todo.id === id)
  
  if(!todo){
    return response.status(404).json({
      error: "Todo not found!."
    });
  }

  user.todos.splice(todo)

  return response.value(200).json(todo)  
});

module.exports = app;