const express = require('express');
const connectDB = require('./config/db');

const app = express();
connectDB();
app.use(express.json({ extended: false }));

app.use('/api/users', require('./router/api/user'))
app.use('/api/auth', require('./router/api/auth'))
app.use('/api/profile', require('./router/api/profile'));

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => console.log('App is running')
)