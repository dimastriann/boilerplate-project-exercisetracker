const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config()

const { User } = require('./mongo.js');

app.use(bodyParser.urlencoded({extended: true}))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// finding user with params username or all
const findUser = (username) => {
  return username 
    ? User.findOne({username}) 
    : User.find({});
}

// users routes/endpoint
app.route('/api/users')
  .get( async (req, res) => {
    const users = await findUser();
    return res.send(users.map( val => {
      return {
        _id: val._id,
        username: val.username
      }
    }));
  })
  .post( async (req, res) => {
    const { username } = req.body;
    // console.log('username', username)
    let userName = undefined;
    let id = undefined;
    const user = await findUser(username)
    // console.log('user', user)
    if(user){
      userName = user.username
      id = user._id
    } else {
      const newUser = new User({username: username})
      await newUser.save()
      userName = newUser.username
      id = newUser._id
    }
    
    return res.json({
      username: userName,
      _id: id
    })
  })

// exercises route/endpoint
app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id: userId } = req.params;
  const { description } = req.body;
  let duration = Number(req.body.duration);
  let { date } = req.body;
  // console.log(userId, description, duration, date);
  if(date === "" || date === undefined){
    date = new Date().toDateString();
  } else {
    date = new Date(date).toDateString();
  }

  // console.log('payload', description, duration, date);
  // find by id and update user logs
  User.findByIdAndUpdate(
    userId, 
    {$push: { logs: { description, duration, date }}},
    {new: true}, 
    (err, result) => {
      if(err) return console.log(err)
      // return json response
      return res.json({
        _id: result._id,
        username: result.username,
        description,
        duration,
        date
      })
    }
  )
  
})

// logs route/endpoint
app.get("/api/users/:_id/logs", (req, res) => {
  const { _id: userId } = req.params;
  const { from, to, limit } = req.query;
  // console.log('query', req.query)
  User.findById(userId, (err, data) => {
    if(err) return console.log(err);
    // console.log('data logs', data)
    let UserLogs = data.logs.map( val => {
      return {
        description: val.description,
        duration: val.duration,
        date: val.date
      }
    })
    
    if(from && to){
      const fromDate = new Date(from);
      const toDate = new Date(to);
      UserLogs = UserLogs.filter( v => Date.parse(v.date) > fromDate) && UserLogs.filter( v => Date.parse(v.date) < toDate);
      // UserLogs.filter( val => {
      //   return new Date(val.date) >= new Date(from) && new Date(val.date) <= new Date(to)
      // })
    }

    if(limit){
      UserLogs = UserLogs.slice(0, limit)
    }
    
    // console.log('logs', {
    //   username: data.username,
    //   count: UserLogs.length,
    //   _id: userId,
    //   log: UserLogs
    // })
    return res.json({
      username: data.username,
      count: UserLogs.length,
      _id: userId,
      log: UserLogs
    })
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
