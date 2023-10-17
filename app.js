require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())

// const posts = [
//   {
//     username: 'Harsh',
//     title: 'Post 1'
//   },
//   {
//     username: 'Harry',
//     title: 'Post 2'
//   }
// ]

// let refreshTokens = []

app.get('/posts', authenticateToken, (req, res) => {
  // res.json(posts.filter(post => post.username === req.user.name))
  res.json(req.user.name)
})

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
}

// app.post('/token', (req,res) => {
//   const refreshToken = req.body.token
//   if(refreshToken === NULL) res.status(403)
//   if(!refreshTokens.includes(refreshToken)) res.status(401)
//   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,(user,error) => {
//     if(error) res.send(error)
//     const accessToken = generateAccessToken({user: user.name})
//     res.send({accessToken: accessToken})
//   })
// })

let refreshTokens = []

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = generateAccessToken({ name: user.name })
    res.json({ accessToken: accessToken })
  })
})

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204)
})

app.post('/login', (req, res) => {
  const username = req.body.username
  const user = { name: username }
  
  const accessToken = generateAccessToken(user)
  const refreshToken = jwt.sign(user,process.env.REFRESH_TOKEN_SECRET)
  refreshTokens.push(refreshToken)
  res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.listen(3000,() => {
    console.log('Listening on port 3000')
})