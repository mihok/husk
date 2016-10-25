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
 * must be connected to DOM manually with getElementById, TWICE. 
 * Once before new Vue -> to fetch LS and shove into the editor.
 * Once AFTER the Vue instantiation, to "refresh" the var. 
*/
var editor = document.getElementById('Editor'); 

// Constants
var c = {
  db: 'db',
  LS_KEY: 'husk_user_storage'
}

// Methods to access Local storage "Database"
var db = {
  fetch() { console.log('fetching from ls')
    return JSON.parse(localStorage.getItem(c.LS_KEY))},
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
    ls_schema: { editor: '', settings: {}, },
    acceptableTimeout: 3000,
    typingTimer: null,
    lastKeyPressTime: null,
  },

  methods: {
    save: function() {
      db.save({
        editor: editor.innerHTML,
        settings: this.ls_schema.settings
      })
    },

  },

  created: function() {

    // set up local storage / shove it into editor
    if (!localStorage[c.LS_KEY]) this.save()
    editor.innerHTML = db.fetch().editor

    // Save on every key press
    window.addEventListener('keyup', e => {
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(this.save, this.acceptableTimeout)
    })

    window.addEventListener('keydown', e => {
      clearTimeout(this.typingTimer)
    })

    // Save on tab close
    window.onbeforeunload = (e) => {
      App.save(); // `this` points to window obj.
      return null
    }

  }
})


/***********************************
- contentEditable Experimentation -
***********************************/


var editor = document.getElementById('Editor')
/*
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
