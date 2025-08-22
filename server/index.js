import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';

const URI = 'mongodb+srv://admin:h3ok1lpwGW8JvMFD@cluster0.2pey3b2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const app = express()
const port = process.env.port || 3000;

app.use(bodyParser.json({limit:'10mb'}));
app.use(bodyParser.urlencoded({extended: true, limit:'30mb'}));
app.use('/', cors());

mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log('Connected to DB');
        app.listen(port, ()=>{
            console.log(`Server is listening on port ${port}`)
        })
    }).catch(err => {
        console.log('err',err)
    })

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Server is listening on port ${port}`)
// })