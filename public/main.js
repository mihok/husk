/** Husk's Javascript Goop.
/* Contents
  * Globals
  * Vue Instance
  * Functions
  * Outro Jams (event listeners + moar globals)
 */

/*************************
Globals
**************************/

/* "editor" must be global: contentEditable elements can't be bound to vue data.*/
var editor = document.getElementById('Editor');

// Constants
const c = {
  LS: localStorage,
  LS_KEY: 'husk_user_storage',
}

// Storage methods
const db = {
  CSS_SET: chrome.storage.sync.set,
  CSS_GET: chrome.storage.sync.get,
  LS_SET: (o) => c.LS.setItem(c.LS_KEY, JSON.stringify(o)),
  LS_GET: () => JSON.parse(c.LS.getItem(c.LS_KEY))
}


/*************************
Vue Instance
**************************/

var App = new Vue ({
  el: '#App',
  data: {
    acceptableTimeout: 2000,
    typingTimer: null,
    lastKeyPressTime: null,
    settings: {
      syncStorage: true,
    }
  },

  methods: {
    saveEditor() {
      if (this.settings.syncStorage) {
        db.CSS_SET({
          editor: chunkEditor(editor.innerHTML),
          settings: this.settings,
        })
      } else {
        db.LS_SET({
          editor: editor.innerHTML,
          settings: this.settings,
        })
      }
    },

    loadEditor() {
      if (this.settings.syncStorage) {
        db.CSS_GET('editor', function(res) {
          if (res.editor == null) return //loading is async, check that db stuff exists first.

          // reassemble the editor's content.
          let content = ""
          Object.keys(res.editor).forEach((key) => { content += res.editor[key] })
          editor.innerHTML = content // async, setting HTML must happen here.
        })
      } else {
        editor.innerHTML = db.LS_GET().editor
      }
    },

    // Prepare storage (whether sync or localStorage)
    initStorage() {
      if (this.settings.syncStorage) {
        db.CSS_GET('editor', res => {
          res == null ? this.saveEditor() : this.loadEditor()
        })
      } else {
        db.LS_GET() == null ? this.saveEditor : this.loadEditor();
      }
    },

    /**
     * TODO: Transfer data from one storage to another (currently just toggles)
     * Dumps storage contents from local -> chrome or inverse
     * Depending on value of this.syncStorage.
     */
    toggleSyncStorage() {
      this.saveEditor()
      this.settings.syncStorage = !this.settings.syncStorage
      this.loadEditor()
    }

  },

  created: function() {
    this.initStorage();

    // Save on key press when time timer runs out.
    window.addEventListener('keyup', e => {
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(this.saveEditor, this.acceptableTimeout)
    })

    window.addEventListener('keydown', e => {
      clearTimeout(this.typingTimer)
    })

    // Save on tab close
    window.onbeforeunload = (e) => {
      this.saveEditor();
      return null
    }

  }
})


/***********************************************
Functions
************************************************/

/**
 * Split large strings of innerHTML into an organized object.
 * @param  {string} text    The husk editor's innerHTML content.
 * @return {object}         Spread a string across multiple key/value pairs.
 */
function chunkEditor(text) {
  let output = {}
  let chunkSize = 400;
  let iterations = text.length / chunkSize // number of loops to make.

  // create shuffling window for variable substring-ing
  let start = 0
  let end = chunkSize
  for (let i = 0; i < iterations; i++) {
    output['editor' + i] = text.substr(start, end)
    start = end
    end = start + chunkSize
  }

  return output;
}


/****************************
Outro Jams / Event listeners.
*****************************/

// MUST be after VUE instantiation in order to connect it to have stuff dumped into it.
// Not ideal, but necessary because v-model does not work with contentEditable html.
var editor = document.getElementById('Editor')

// strip clipboard before pasting junk..
editor.addEventListener('paste', (e) => {
  e.preventDefault()
  let text = e.clipboardData.getData('text/plain')
  document.execCommand('insertHTML', false, text)
})

/* Prevent overwrites when user has > 1 Husk tab open.
 * BUG: Paste something big / a few things -> refresh: it duplicates itself.
 */
document.addEventListener('visibilitychange', () => {
  document.hidden ? App.saveEditor() : App.loadEditor();
})


/* Watch chrome storage (event listener)
chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    var storageChange = changes[key];
    console.log('Storage key "%s" in namespace "%s" changed. ' +
                'Old value was "%s", new value is "%s".',
                key,
                namespace,
                storageChange.oldValue,
                storageChange.newValue);
  }
});
*/
