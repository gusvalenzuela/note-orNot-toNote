// Dependencies
// =============================================================
const path = require("path");
const fs = require(`fs`)
const util = require("util")
const express = require("express");

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Various useful constants
const readFile = util.promisify(fs.readFile)
const dbJSONLocation = `./Develop/db/db.json`


// Routes
// =============================================================

// Basic route that sends the user first to the index page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/Develop/public/index.html"));
})

// basic route from any first paramater
app.get("/:input", function (req, res) {
  let term = req.params.input

  switch (term) {
    case "notes":
      res.sendFile(path.join(__dirname, "/Develop/public/notes.html"));
      break
    default:
      res.status(404).sendFile(path.join(__dirname, "/Develop/public/404err.html"))
  }
});

app.get("/api/:input", function (req, res) {
  let term = req.params.input

  switch (term) {
    // GET `/api/notes` - Should read the `db.json` file and return all saved notes as JSON.
    case "notes":
      fs.readFile(dbJSONLocation, "utf8", (err, data) => {
        if (err) throw err
        // notes.push(data)
        res.json(JSON.parse(data))
      })
      break
    default:
      res.status(404).sendFile(path.join(__dirname, "/Develop/public/404err.html"))
  }

});
// return the correct js and css files referenced in html files
app.get(`/assets/js/index.js`, (req, res) => { res.sendFile(path.join(__dirname, `/Develop/public/assets/js/index.js`)) })
app.get(`/assets/css/styles.css`, (req, res) => { res.sendFile(path.join(__dirname, `/Develop/public/assets/css/styles.css`)) })

// Create New Notes - takes in JSON input
// POST `/api/notes` 
app.post("/api/notes", function (req, res) {

  let newNote = req.body      // - Should receive a new note to save on the request body, 

  // if(newNote.id){
  //   console.log(newNote.id)
  // } else{
  //   console.log(`There appears to be no id on this newNote`)
  // }

  // add it to the `db.json` file, 
  readFile(dbJSONLocation, "utf8", (err, data) => {
    if (err) throw err
    const savedNotes = JSON.parse(data)        // parse data from json file into array
    let updatedNotes = savedNotes

    // if the received new note already has an id find the note and update it
    if (newNote.id) {
      newNote.id = parseInt(newNote.id)
      updatedNotes = savedNotes.map(data => {
        if (data.id === newNote.id) {
          return newNote
        }
        return data
      })
    } else {
      updatedNotes.push(newNote);                  // else push new note into array
    }

    // giving all my notes an ID here
    // allows me to differentiate between NEW notes and UPDATED notes before saving
    for (let i = 0; i < updatedNotes.length; i++) {
      updatedNotes[i].id = i
    }
    
    // write updated array to same json file
    fs.writeFile(dbJSONLocation, JSON.stringify(updatedNotes), err => {
      if (err) throw err
    })
    return newNote
  })

  res.sendFile(path.join(__dirname, `/Develop/public/notes.html`))
});

// * DELETE `/api/notes/:id` - 
app.delete(`/api/notes/:id`, (req, res) => {
  // Should receive a query parameter containing the id of a note to delete. 
  const noteID = req.params.id

  //  In order to delete a note, you'll need to read all notes from the `db.json` file, 
  readFile(dbJSONLocation, `utf8`, (err, d) => {
    if (err) throw err

    const data = JSON.parse(d)      // parse the file's data into json format onto variable

    // create new temp array with the received id note filtered out from file's data
    const dbNotes = data.filter(element => {
      // remove the note with the given `id` property, 
      if (element.id != noteID) {
        return true
      }
    })

    // and then rewrite the notes to the `db.json` file
    // new temp array overwrites json file (deleting the note entry)
    fs.writeFile(__dirname + `/Develop/db/db.json`, JSON.stringify(dbNotes), err => {
      if (err) throw err
    })

  }).then(err => {
    if (err) throw err
  })

  res.sendFile(path.join(__dirname, `/Develop/public/notes.html`))

})

// Starts the server to begin listening
// =============================================================
app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});
