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
};

// Storage methods
const db = {
  CSS_SET: chrome.storage.sync.set,
  CSS_GET: chrome.storage.sync.get,
  LS_SET: (o) => c.LS.setItem(c.LS_KEY, JSON.stringify(o)),
  LS_GET: () => JSON.parse(c.LS.getItem(c.LS_KEY)),

  schema: {
    editor: '',
    settings: {
      syncStorage: false,
    },
  }
};

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
      syncStorage: undefined,
    }
  },

  methods: {

    save() {
      if (this.settings.syncStorage) {
        db.CSS_SET({
          editor: chunkEditor(editor.innerHTML),
          settings: this.settings
        }, () => console.log('chrome sync save made:'))
      } else {
        db.LS_SET({
          editor: editor.innerHTML,
          settings: this.settings
        })
      }
    },

    loadEditor() {
      if (!this.settings.syncStorage) {
        editor.innerHTML = db.LS_GET().editor
      } else {
        db.CSS_GET('editor', function (res) {
          if (res.editor == null) return; //loading is async, check that db stuff exists first.

          // reassemble the editor's content.
          let content = "";
          Object.keys(res.editor).forEach((key) => {
            content += res.editor[key]
          });
          editor.innerHTML = content; // async, setting HTML must happen here.
        })
      }
    },

    // Prepare storage (whether sync or localStorage)
    initStorage() {
      let state;

      // if localStorage doesn't exist, instantiate it with its schema.
      if (!db.LS_GET()) db.LS_SET(db.schema);

      // check the value of syncSetting, apply it to App.
      else {
        state = db.LS_GET();
        console.log('state is', state);
        this.settings.syncStorage = state.settings.syncStorage
      }

      // Sync enabled -> if nothing is there, save (will
      if (this.settings.syncStorage) {
        db.CSS_GET('editor', res => {
          res == null ? this.save() : this.loadEditor();
        })
      } else db.LS_GET() == null ? this.save() : this.loadEditor();
    },

    /**
     * TODO: Transfer data from one storage to another (currently just toggles)
     * Dumps storage contents from local -> chrome or inverse
     * Depending on value of this.syncStorage.
     */
    toggleSyncStorage() {
      this.save();
      this.settings.syncStorage = !this.settings.syncStorage;
      this.loadEditor()
    }
  },

  created: function() {
    this.initStorage();

    // Save on key press when time timer runs out.
    window.addEventListener('keyup', () => {
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(this.save, this.acceptableTimeout)
    });

    window.addEventListener('keydown', () => {
      clearTimeout(this.typingTimer)
    });

    // Save on tab close
    // window.onbeforeunload = (e) => {
    //   this.save();
    //   return null
    // }

  }
});


/***********************************************
Functions
************************************************/

/**
 * Split large strings of innerHTML into an organized object.
 * @param  {string} text    The husk editor's innerHTML content.
 * @return {object}         Spread a string across multiple key/value pairs.
 */
function chunkEditor(text) {
  let output = {};
  let chunkSize = 400;
  let iterations = text.length / chunkSize; // number of loops to make.

  // create shuffling window for variable substring-ing
  let start = 0;
  let end = chunkSize;
  for (let i = 0; i < iterations; i++) {
    output['editor' + i] = text.substr(start, end);
    start = end;
    end = start + chunkSize
  }

  return output;
}


/****************************
Outro Jams / Event listeners.
*****************************/

// MUST be after VUE instantiation in order to connect it to have stuff dumped into it.
// Not ideal, but necessary because v-model does not work with contentEditable html.
editor = document.getElementById('Editor');

// strip clipboard before pasting junk..
editor.addEventListener('paste', (e) => {
  e.preventDefault();
  let text = e.clipboardData.getData('text/plain');
  document.execCommand('insertHTML', false, text)
});

/* Prevent overwrites when user has > 1 Husk tab open.
 * BUG: Paste something big / a few things -> refresh: it duplicates itself.
 */
document.addEventListener('visibilitychange', () => {
  document.hidden ? App.save() : App.loadEditor();
});


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
