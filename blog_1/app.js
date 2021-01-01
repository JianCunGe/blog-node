const queryString = require('querystring')

const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

const getPostData = (req) => {
  return new Promise((resolve, reject) => {
    if(req.method !== 'POST') {
      resolve({})
      return
    }

    if(req.headers['content-type'] !== 'application/json') {
      resolve({})
      return
    }

    let postData = ''

    req.on('data', (chunk) => {
      postData += chunk.toString()
    })

    req.on('end', () => {
      if(!postData) {
        resolve({})
        return
      }
      resolve(
        JSON.parse(postData)
      )
    })
  })
}

const serverHandle = (req, res) => {
  res.setHeader('Content-type', 'application/json')

  // get path
  const url = req.url
  req.path = url.split('?')[0]

  // parsing query
  req.query = queryString.parse(url.split('?')[1])

  // process post data
  getPostData(req).then((postData) => {
    req.body = postData

    const blogResult = handleBlogRouter(req, res)
    if(blogResult) {
      blogResult.then((blogData) => {
        res.end(
          JSON.stringify(blogData)
        )
      })
      return
    }

    const userResult = handleUserRouter(req, res)
    if(userResult) {
      userResult.then((userData) => {
        res.end(
          JSON.stringify(userData)
        )
      })
      return
    }

    res.writeHead(404, {"Content-type": "text/plain"})
    res.write("404 Not Found")
    res.end()
  })

}

module.exports = serverHandle
