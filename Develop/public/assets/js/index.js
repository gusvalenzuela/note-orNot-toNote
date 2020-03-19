var $noteTitle = $(".note-title");
var $noteText = $(".note-textarea");
var $editNoteBtn = $(".edit-note");
var $saveNoteBtn = $(".save-note");
var $newNoteBtn = $(".new-note");
var $noteList = $(".list-container .list-group");
const listItems = $noteList[0].childNodes
// activeNote is used to keep track of the note in the textarea
var activeNote = {};

// A function for getting all notes from the db
var getNotes = function () {
  return $.ajax({
    url: "/api/notes",
    method: "GET"
  });
};

// A function for saving a note to the db
var saveNote = function (note) {
  return $.ajax({
    url: "/api/notes",
    data: note,
    method: "POST"
  }).then((data) => {
    return data
  });
};

// A function for deleting a note from the db
var deleteNote = function (id) {
  return $.ajax({
    url: "api/notes/" + id,
    method: "DELETE"
  });
};

// If there is an activeNote, display it, otherwise render empty inputs
var renderActiveNote = function () {
  $saveNoteBtn.hide();

  if (activeNote.id || activeNote.id === 0 ) {
    $noteTitle.attr("readonly", true);
    $noteText.attr("readonly", true);
    $noteTitle.val(activeNote.title);
    $noteText.val(activeNote.text);
  } else {
    $noteTitle.attr("readonly", false);
    $noteText.attr("readonly", false);
    $noteTitle.val("");
    $noteText.val("");
  }
};
const flashActive = () => {
  // finding the corresponding list item to manipulate
  listItems.forEach(i =>{
    let data = $(i).data()
    if(data.id === activeNote.id){
      $(i).attr(`style`,`background: #56f517;`)
      setTimeout(()=>{
        $(i).attr(`style`,``)
      }, 700)
    }
  })
}
const handleEdits = () => {
  
  $noteTitle.attr("readonly", false);
  $noteText.attr("readonly", false);

  flashActive()
}

// Get the note data from the inputs, save it to the db and update the view
const handleNoteSave = () => {
  flashActive()
  var newNote = {
    title: $noteTitle.val(),
    text: $noteText.val()
  };

  // if the note is not a "new" note (i.e. it already has an ID)
  // give the newNote the active ID (so POST in server can update an existing note instead of saving a new one)
  if (activeNote.id !== undefined) {
    newNote.id = activeNote.id
  }
  
  saveNote(newNote).then(function (data) {
    getAndRenderNotes();
    // renderActiveNote();        // turning this off for now (renders pre-updated note)
  });

};

// Delete the clicked note
var handleNoteDelete = function (event) {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();
  var note = $(this).parent(".list-group-item").data();

  // ??
  if (activeNote.id === note.id) {
    activeNote = {};
  }

  const yes = confirm(`Are you sure you want to delete this note?\nCannot be undone.`)

  if (yes) {
    deleteNote(note.id).then(function () {
      getAndRenderNotes();
      renderActiveNote();
    });
  }

};

// Sets the activeNote and displays it
var handleNoteView = function () {
  activeNote = $(this).data();
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
var handleNewNoteView = function () {
  activeNote = {};
  renderActiveNote();
};

// If a note's title or text are empty, hide the save button
// Or else show it
var handleRenderSaveBtn = function () {
  if (!$noteTitle.val().trim() || !$noteText.val().trim()) {
    $saveNoteBtn.hide();
    $editNoteBtn.hide();
  } else {
    $saveNoteBtn.show();
  }
};

// Render's the list of note titles
var renderNoteList = function (notes) {
  $noteList.empty();

  var noteListItems = [];

  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];

    var $li = $("<li class='list-group-item'>").data(note);
    var $span = $("<span>").text(note.title);
    var $delBtn = $(
      "<i class='fas fa-trash-alt float-right text-danger delete-note'>"
    );

    $li.append($span, $delBtn);
    noteListItems.push($li);
  }

  $noteList.append(noteListItems);
};

// Gets notes from the db and renders them to the sidebar
var getAndRenderNotes = function () {
  return getNotes().then(function (data) {
    renderNoteList(data);
    
  });
};

$editNoteBtn.on("click", handleEdits);
$saveNoteBtn.on("click", handleNoteSave);
$noteList.on("click", ".list-group-item", handleNoteView);
$newNoteBtn.on("click", handleNewNoteView);
$noteList.on("click", ".delete-note", handleNoteDelete);
$noteTitle.on("keyup", handleRenderSaveBtn);
$noteText.on("keyup", handleRenderSaveBtn);

// Gets and renders the initial list of notes
getAndRenderNotes();
