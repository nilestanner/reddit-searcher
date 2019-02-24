require('dotenv').config();
const request = require('request');
const express = require('express');
const freeTextAPI = require('free-text-api');
const app = express();
const cors = require('cors');
const bodyParser= require('body-parser');
const PORT = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}))

const textService = freeTextAPI({
    carrierLookup: {
        method: process.env.LOOKUPMETHOD,
        apiKey: process.env.LOOKUPKEY,
        defaultCountry: process.env.LOOKUPCOUNTRY
    },
    mailOptions: {
        from: process.env.FROM
    },
    transport: {
        service: process.env.TRANSPORTMETHOD,
        auth: {
            user: process.env.TRANSPORTUSER,
            pass: process.env.TRANSPORTPASS
        }
    }
});

MongoClient.connect(process.env.MONGODB_URI, async (err, client) => {
    global.redditDB = client.db(process.env.MONGODBNAME);
    app.listen(PORT, () => console.log(`Reddit Scanner listening on port ${PORT}!`));
});



app.get('/search', (req, res) => {
    request.get(process.env.SEARCHURL, (err, res, body) => {
        const json = JSON.parse(body);
        if (json.data.dist > 0) {
            json.data.children.forEach((child, i) => {
                const message = `${child.data.url}`;
                sendTextUpdate(message);
                saveToDb(child)
            });
        }
    });
    res.send('Job started');
});

app.get('/', (req, res) => {
    res.send('Hello, you have found me');
});

const saveToDb = (post) => {
    const search = {created_utc: post.created_utc};
    global.redditDB.collection('cvpposts').updateOne(search, {$set: post}, {'upsert':true})
}

const sendTextUpdate = (message) => {
    textService.sendText({
        number: process.env.PHONE,
        message: message,
        carrier: process.env.PHONECARRIER
    });
}

