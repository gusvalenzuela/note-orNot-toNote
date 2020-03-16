// Dependencies
// =============================================================
const path = require("path");
const fs = require(`fs`)
const util = require("util")
const express = require("express");
const axios = require(`axios`)

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const readFile = util.promisify(fs.readFile)

const notes = [];
// Routes
// =============================================================

// Basic route that sends the user first to the AJAX Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/Develop/public/index.html"));
})
app.get("/:input", function (req, res) {
  let term = req.params.input

  switch (term) {
    case "notes":
      res.sendFile(path.join(__dirname, "/Develop/public/notes.html"));
      break
    default:
      res.sendFile(path.join(__dirname, "/Develop/public/index.html"));
  }
});
// app.get(`/api/notes`, res=>{
//   fs.readFile("./Develop/db/db.json", "utf8", (err, data) => {
//     if (err) throw err
//     // notes.push(data)
//     res.json(JSON.parse(data))
//   })
// } )

app.get("/api/:input", function (req, res) {
  let term = req.params.input

  switch (term) {
    // GET `/api/notes` - Should read the `db.json` file and return all saved notes as JSON.
    case "notes":
      fs.readFile("./Develop/db/db.json", "utf8", (err, data) => {
        if (err) throw err
        // notes.push(data)
        res.json(JSON.parse(data))
      })
      break
    default:
      res.status(404).sendFile(path.join(__dirname, "/Develop/public/404err.html"))
  }

});
// return the correct js and css file referenced in html files
app.get(`/assets/js/index.js`, (req, res) => { res.sendFile(path.join(__dirname, `/Develop/public/assets/js/index.js`)) })
app.get(`/assets/css/styles.css`, (req, res) => { res.sendFile(path.join(__dirname, `/Develop/public/assets/css/styles.css`)) })

// Create New Notes - takes in JSON input
// POST `/api/notes` 
app.post("/api/notes", function (req, res) {
  const fileLocation = `./Develop/db/db.json`
  let newNote = req.body      // - Should receive a new note to save on the request body, 

  // add it to the `db.json` file, 
  readFile(fileLocation, "utf8", (err, data) => {
    if (err) throw err

    const dbNotes = JSON.parse(data)        // parse data from json file into array
    dbNotes.push(newNote);                  // push new note into array

    for (let i = 0; i < dbNotes.length; i++) {
      dbNotes[i].id = i
    }
    // write new array to same json
    fs.writeFile(fileLocation, JSON.stringify(dbNotes), err => {
      if (err) throw err
    })
    return newNote
  })
  
  res.sendFile(path.join(__dirname,`/Develop/public/notes.html`))
});

// * DELETE `/api/notes/:id` - 
app.delete(`/api/notes/:id`, (req, res) => {
  // Should receive a query parameter containing the id of a note to delete. 
  const noteID = req.params.id

  //  In order to delete a note, you'll need to read all notes from the `db.json` file, 
  readFile(__dirname + `/Develop/db/db.json`, `utf8`, (err, d) => {
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
