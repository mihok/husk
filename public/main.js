/** Husk's Javascript Goop.
/* Contents
  * Globals
  * Vue Instance
  * Functions
  * Outro Jams (event listeners + moar globals)
 */

/***********************************************
Globals
 ***********************************************/

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
  CSS_CLEAR: chrome.storage.sync.clear,
  LS_SET: (o) => c.LS.setItem(c.LS_KEY, JSON.stringify(o)),
  LS_GET: () => JSON.parse(c.LS.getItem(c.LS_KEY)),

  schema: {
    editor: '',
    settings: {
      syncStorage: false,
    },
  }
};

/***********************************************
Vue Instance
 ***********************************************/

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
    save(o) {
      if (this.settings.syncStorage) {
        db.CSS_SET( o || {
          editor: chunkEditor(editor.innerHTML),
          settings: this.settings
        }, () => console.log('chrome storage sync saved'))
      } else {
        db.LS_SET( o || {
          editor: editor.innerHTML,
          settings: this.settings
        });
        console.log('local storage saved')
      }
    },

    load() {
      // load from LS
      if (!this.settings.syncStorage) {
        const state = db.LS_GET();
        editor.innerHTML = state.editor;
        this.settings = state.settings;
        console.log('Local storage loaded');

      // Load from Chrome storage
      } else {
        db.CSS_GET('editor', function (state) {
          if (state.editor == null) return; //loading is async, check that db stuff exists first.

          let content = ""; // reassemble editor contents
          Object.keys(state.editor).forEach((key) => {
            content += state.editor[key]
          });
          editor.innerHTML = content; // async, setting HTML must happen here.
          this.settings = state.editor;
          console.log('chrome sync storage loaded.')
        })
      }
    },

    /**
     * Prepares storage locations and loads settings.
     * Prioritizes checking sync first, otherwise localStorage will overwrite settings.
     */
    initStorage() {
      // if localStorage doesn't exist, instantiate it with its schema.
      if (!db.LS_GET()) db.LS_SET(db.schema);

      // If sync storage exists, set up Husk with it's values
      db.CSS_GET(null, (res) => {
        this.settings.syncStorage = !!(res.settings !== undefined && res.settings.syncStorage === true);
        this.load()
      })
    },

    /**
     * Switch storage modes between local and sync.
     * Gets the current values of the text editor, and the user's settings
     * -> saves them -> switches storages -> re-saves currentState to new storage.
     */
    toggleSyncStorage() {
      const tempState = { editor: editor, settings: this.settings };

      this.save(); // save to old editor before switching storage location.
      this.settings.syncStorage = !this.settings.syncStorage;
      if (!this.settings.syncStorage) {
        db.CSS_CLEAR(); // wipe chrome store so app loads from LS next init.
        this.save({
          editor: tempState.editor.innerHTML,
          settings: tempState.settings,
        })
      } else this.save(tempState)
    }
  },

  created: function() {
    this.initStorage();
    initEventListeners();
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

/**
 * Setup Event Listeners across the app
 */
function initEventListeners() {
  // Save on key press when time timer runs out.
  window.addEventListener('keyup', () => {
    clearTimeout(App.typingTimer);
    App.typingTimer = setTimeout(App.save, App.acceptableTimeout)
  });

  window.addEventListener('keydown', () => {
    clearTimeout(App.typingTimer)
  });

  window.onbeforeunload = () => {
    App.save();
    return null
  };

  /* Prevent overwrites when user has > 1 Husk tab open.
   * BUG: Paste something big / a few things -> refresh: it duplicates itself.
   */
  document.addEventListener('visibilitychange', () => {
    document.hidden ? App.save() : App.initStorage();
  });
}


/***********************************************
Outro Jams / Event listeners.
 ***********************************************/

// MUST be after VUE instantiation in order to connect it to have stuff dumped into it.
// Not ideal, but necessary because v-model does not work with contentEditable html.
editor = document.getElementById('Editor');

// strip clipboard before pasting anything. (Must be at end of file; won't work in Vue.created() )
editor.addEventListener('paste', (e) => {
  e.preventDefault();
  let text = e.clipboardData.getData('text/plain');
  document.execCommand('insertHTML', false, text)
});


