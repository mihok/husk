/** Husk's Javascript Goop.
* Contents
  * Globals
  * Vue Instance 
  * Vue Objects

* TODO: Figure a way around data caps.
- chunking the editor data?
*/

/*************************
Globals 
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


/*************************
Vue Instance
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

    save(payload) { chrome.storage.sync.set(payload)},

    saveEditor() { chrome.storage.sync.set({editor: editor.innerHTML}) },

    loadEditor() {
      chrome.storage.sync.get('editor', function(res) {
        editor.innerHTML = res.editor // async, setting HTML must happen here.
      })
    }
  },

  created: function() {
    this.loadEditor()

    // Save on key press when time timer runs out.
    window.addEventListener('keyup', e => {
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(this.saveEditor(), this.acceptableTimeout)
    })

    window.addEventListener('keydown', e => {
      clearTimeout(this.typingTimer)
    })

    // Save on tab close
    window.onbeforeunload = (e) => {
      this.saveEditor();
      return null
    }

    /* Prevent overwrites when user has > 1 Husk tab open.
     * Lose focus? --> Save contents ... Gain focus ? --> loadEditor contents from Ls.
     * TODO: mass opening multiple new tabs (overloads the api sync request rate?) -- starts
     * to load an empty editor, which then, on switching tabs, would overwrite things.
     */
    document.addEventListener('visibilitychange', () => {
      document.hidden ? this.saveEditor() : this.loadEditor();
    })

  }
})

/*************************
Outro Jams
**************************/
// MUST be after VUE instantiation in order to connect it to have stuff dumped into it.
// Not ideal, but necessary because v-model does not work with contentEditable html.
var editor = document.getElementById('Editor')
