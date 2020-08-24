const express = require('express'),
app = express(),
port = 5000

app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.static('public'))

app.get('/', (req, res) => {
	res.render('index')
})

app.listen(port, () => {
	console.log(`Server started at port ${port}`)
})