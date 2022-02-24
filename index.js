const express = require('express')
const app = express()
const port = 5000

app.use(express.json())
app.use(express.urlencoded({ extended: true })) 

app.post('/smart_contract', (req, res) => {
  res.status(200);
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})