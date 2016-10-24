/** Husk's Javascript Goop.
* Contents
  * Globals
  * Vue Data Object 
  * Vue Objects

* TODO: Focus text area on page load.
* TODO: Autosave
*/

/*************************
- - - Globals - - -
**************************/

/* Regarding the "editor":
 * "editor" must be global: contentEditable elements can't be bound to vue data.
 * must be connected to DOM manually with getElementById, possibly twice...:
 * Once before new Vue -> to fetch LS and shove into the editor.
 * Once AFTER the Vue instantiation, if wanting to do any Regex tests.
*/
var editor = document.getElementById('Editor'); 

// Constants
var c = {
  db: 'db',
  LS_KEY: 'husk_user_storage'
}

// Methods to access Local storage "Database"
var db = {
  fetch() { return JSON.parse(localStorage.getItem(c.LS_KEY))},
  save(payload){
    console.log(payload)
    localStorage.setItem(c.LS_KEY, JSON.stringify(payload))
  },
}


/*************************
- -  Vue Instance - -
**************************/

// Vue Objects
var App = new Vue ({
  el: '#App',
  data: {
    editor: '',
    settings: {},
  },

  methods: {
    save: function() {
      db.save({
        editor: editor.innerHTML,
        settings: this.settings
      })
    },
  },

  created: function() {
    if (!localStorage[c.LS_KEY]) this.save()
    editor.innerHTML = db.fetch().editor // must be out

    // TODO: create setInterval to autosave content. 
  }
})


/***********************************
- contentEditable Experimentation -
***********************************/

/*
var editor = document.getElementById('Editor') 
editor.addEventListener('input', function() {
  var children = editor.childNodes
  children.forEach(function(child) {
    testBold(child.textContent)
  })
})


function testBold(text) {
  var isBold = /(\*\*[\w]+)\*\*$/ // check for **words**
  if (isBold.test(text)) console.log('something is bold!')
}
*/
