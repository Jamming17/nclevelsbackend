# Nine Circles Level Backend
This is the code repository for the backend of my Nine Circles Level viewer for Geometry Dash. Currently, the website and backend are not hosted anywhere as there are more features to be added, but this README will be updated when links are available!

This repository contains a backend API which manages calls to RobTop's servers and interacts with the local database. The backend acts as a middleman for data reception from the frontend to optimise speed, data formatting and error handling so that the frontend can remain simple and efficient.

## Tools
This project is built in JavaScript using Node.js with Express.js to assist with efficiently making an API. Levels are stored in a MongoDB database, currently within four separate tables with matching schemas. Details of this schema can be found in /models/Level.js.

## How can I run this myself?
In order to run this repository for yourself, you will need to install [node.js](https://nodejs.org/en/download) and [MongoDB](https://www.mongodb.com/try/download/shell) or use [MongoDB Atlas](httpsL//www.mongodb.com/lp/cloud/atlas/try2-reg).

Open a command line terminal and navigate to the directory you want to start in. Then clone the repository and move into the cloned directory:
```bash
git clone https://github.com/Jamming17/nclevelsbackend.git
cd nclevelsbackend
```
Install the project dependencies:
```bash
npm install
```
In MongoDB, create a database named `nclevels` and add a table with the schema found in /models/Level.js. Create a `.env` file in the root directory of the repository and add a variable to link the application to your MongoDB database.

If you are running the database locally, use this:
```
MONGO_URI=mongodb://127.0.0.1:27017/nclevels
```
If you are running the database using Atlas, use a link in this format:
```
MONGO_URI=mongodb+src://<username>:<password>@<clustername>.mongodb.net/?retryWrites=true&w=majority
```

Once the database is running and connected, create a collection named `levels`. You can add and manipulate records in the database using MongoDB CRUD commands which can be found in MongoDB's extensive documentation.

To build and run the website locally, run the following command:
```bash
npm run dev
```

This should immediately tell you it has successfully connected to the MongoDB database: `✅ Connected to MongoDB`.

This backend should be run alongside the frontend which can also be found on my GitHub [here](https://github.com/Jamming17/nclevelsfrontend).

## Current Features
This project currently has two endpoints waiting for GET requests from the frontend.

### /jack/getLevelId
This endpoint relays received data to RobTop's Geometry Dash servers, receives a response, completely reformats it, updates the local database if necessary and then forwards that back to the frontend.

This endpoint expects a GET request containing one query paramter named `str` which should be equal to level search query (ideally the level's ID or the level's name as long as it is the top level in the search list).

The request is forwarded to RobTop's servers with the option `star: 1` which will only search for rated levels.

Once a response is received from RobTop's server, it will be reformatted from the response string into the level object format that the frontend and backend database expect with any other information omitted. If a level with a matching ID is already stored in the MongoDB database, it will have its information updated, otherwise nothing will happen.

If successful, the function returns HTTP code 200 and the following response in JSON format:
```json
{success: true, data: {levelData}}
```

If RobTop's server was unreachable or another error occurred during data processing, the function returns HTTP code 500 and the following response in JSON format:
```json
{success: false, error: "Failed to contact Boomlings API"}
```

### /jack/getLevels
This endpoint sends all database levels from the MongoDB database to the frontend with simple backend data filtering.

This endpoint expects a GET request containing no query parameters.

If successful, the function returns HTTP code 200 and the following response in JSON format:
```json
{success: true, data: [levels]}
```

If any other server error occurs, the function returns HTTP code 500 and the following response in JSON format:
```json
{success: false, message: "Internal server error while fetching level data"}
```

## Planned Features and Changes
- Improved error handling
- Thorough tests made with Jest