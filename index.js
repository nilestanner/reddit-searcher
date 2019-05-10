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
            api_key: process.env.TRANSPORTAPIKEY
        }
    }
});

MongoClient.connect(process.env.MONGODB_URI,  { useNewUrlParser: true }, async (err, client) => {
    global.redditDB = client.db(process.env.MONGODBNAME);
    app.listen(PORT, () => console.log(`Reddit Scanner listening on port ${PORT}!`));
});

app.get('/search', async (req, res) => {
    res.send('Job started');
    await searchWithKeyword('cvp', 'cvpposts');
    await searchWithKeyword('price changes', 'pcposts');
});

app.get('/', (req, res) => {
    res.send('Hello, you have found me');
});

const saveToDb = async (post, collection) => {
    const search = {created_utc: post.created_utc};
    await global.redditDB.collection(collection).updateOne(search, {$set: post}, {'upsert':true})
}

const sendTextUpdate = (title, message) => {
    textService.sendText({
        subject: title,
        number: process.env.PHONE,
        message: message,
        carrier: process.env.PHONECARRIER
    }).then((result) => {
        console.log(result);
    });
}

const checkPosts = async (posts, collection) => {
    for (post of posts) {
        post = post.data;
        const notFound = await findPost(post, collection);
        if (notFound) {
            console.log(`found new post: ${post.title}`);
            const message = `${post.url}`;
            sendTextUpdate(post.title, message);
            await saveToDb(post, collection);
        }
    }
}

const findPost = async (post, collection) => {
    return new Promise((resolve, reject) => {
        global.redditDB.collection(collection).findOne({created_utc: post.created_utc}, (err, result) => {
            resolve(!result)
        });
    });
}

const searchWithKeyword = async (searchString, collection) => {
    console.log(`Seaching for ${searchString}`);
    return new Promise((resolve, reject) => {
        request.get(`${process.env.SEARCHURL}&q=${searchString}`, async (err, res, body) => {
            const json = JSON.parse(body);
            if (json.data.dist > 0) {
                await checkPosts(json.data.children, collection);
            }
            resolve();
        });
    });
    
}

