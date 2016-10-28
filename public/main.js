/** Husk's Javascript Goop.
* Contents
  * Globals
  * Vue Data Object 
  * Vue Objects

* TODO: Focus text area on page load.
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
  LS: localStorage,
  LS_KEY: 'husk_user_storage'
}

// Methods to access Local storage "Database"
var db = {
  fetch: () => JSON.parse(c.LS.getItem(c.LS_KEY)),
  save: o => c.LS.setItem(c.LS_KEY, JSON.stringify(o)),
}


/*************************
- -  Vue Instance - -
**************************/

// Vue Objects
var App = new Vue ({
  el: '#App',
  data: {
    ls_schema: { editor: '', settings: {}, },
    acceptableTimeout: 750,
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

    load() { editor.innerHTML = db.fetch().editor }

  },

  created: function() {

    // set up local storage if necessary / shove it into editor
    if (!c.LS[c.LS_KEY]) this.save()
    editor.innerHTML = db.fetch().editor

    // Save on key press when time timer runs out. 
    window.addEventListener('keyup', e => {
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(this.save, this.acceptableTimeout)
    })

    window.addEventListener('keydown', e => {
      clearTimeout(this.typingTimer)
    })

    // Save on tab close
    window.onbeforeunload = (e) => {
      this.save(); 
      return null
    }

    /* Prevent overwrites when user has > 1 Husk tab open.
     * Lose focus? --> Save contents ... Gain focus ? --> Load contents from Ls. */
    document.addEventListener('visibilitychange', () => {
      document.hidden ? this.save() : this.load();
    })

  }
})


// MUST be after VUE instantiation in order to connect it to have stuff dumped into it.
// Not ideal, but necessary because v-model does not work with contentEditable html.
var editor = document.getElementById('Editor')
