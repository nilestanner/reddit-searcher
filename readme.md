# Reddit Searcher

The goal of this project is to search a subreddit for particular search terms. Once new posts are found a text is sent with the title and link to the post.

## Setup

1. Clone project
2. Run `npm install`
3. Run touch `.env`
4. Add enviromental vars
5. Start the server `npm run dev`

## Enviroment Vars

*Used for sending the text message*
- FROM - The email that the udate text will come from. Doesn't really matter what this is. (Doesn't need to be valid)
*Used for storing posts found and removing duplicates*
- MONGODB_URI - The full URL for the mongo db
- MONOGODBNAME - the name of the mongo db
*Used for sending the text*
- PHONE - The phone to send the text to
- PHONECARRIER - The carrier for the phone
- TRANSPORTAPIKEY - Api key for SendGrid
- TRANSPORTMETHOD - Put SendGrid here
*Used for searching Reddit*
- SEARCHURL - Example: https://www.reddit.com/r/walmart/search.json?sort=new&t=week&restrict_sr=true
- SEARCHTERMS - Comma seperated list ofsearch terms


## Changing the search timings
To do this you will have to go into the *.circleci* directory and edit the config.yml. Refer to [CircleCi docs](https://circleci.com/docs/2.0/workflows/) for more info.