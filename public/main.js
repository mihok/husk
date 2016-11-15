/** Husk's Javascript Goop.
/* Contents
  * Vue Instance
  * Functions
  * Outro Jams (event listeners + moar globals)
 */

// let editorContents = document.getElementById('Editor')

/*=======================================*
Vue Instance
*========================================*/

var App = new Vue ({
  el: '#App',
  data: {
    settings: { enableSyncStorage: false },
    acceptableTimeout: 2000,
    typingTimer: null,
    lastKeyPressTime: null,
    menuOpen: false,
  },

  methods: {
    /**
     * If sync is enabled, use chunkEditor to save to Chrome storage.
     * Otherwise, store to local storage.
     */
    save(obj) {
      if (this.settings.enableSyncStorage) {
        chrome.storage.sync.set(obj || {
          editor: chunkEditor(editorContents.innerHTML),
          settings: this.settings
        })

      } else {
        localStorage.setItem('huskState', obj || JSON.stringify({
          editor: editorContents.innerHTML,
          settings: this.settings,
        }))
      }
    },

    /**
     * Sync disabled? Load from local storage.
     * Chrome storage sync is asynchronous, so setting editorContents has to happen in callback.
     * Chrome storage requires reassembling content from the spread out "editor" keys.
     */
    load() {
      if (!this.settings.enableSyncStorage) {
        const state = JSON.parse(window.localStorage.getItem('huskState'))
        this.settings = state.settings;
        editorContents.innerHTML = state.editor

      } else {
        chrome.storage.sync.get(null, function (state) {
          if (state.editor == null) return;
          let content = ""; // reassemble editor contents
          Object.keys(state.editor).forEach((key) => { content += state.editor[key] });
          editorContents.innerHTML = content
        })
      }
    },

    /**
     * Prepares storage locations and loads settings.
     * Prioritizes checking sync first, otherwise localStorage will overwrite settings.
     * TODO: rethink this, esp, in regards to whether or not you need to run
     * chrome.sync.storage.clear() in the toggleSyncStorage fn.
     */
    initStorage() {
      if (!localStorage.getItem('huskState')) {
        this.settings = { enableStorage: false }
        editorContents.innerHTML = "<h1>Welcome to Husk!</h1><div><br></div><div>Husk is a text pad in your chrome new tab page. It was inspired by <a href=\"https://chrome.google.com/webstore/detail/papier/hhjeaokafplhjoogdemakihhdhffacia\">Papier</a>.<br></div><p>Husk has basic markdown support, as well as the ability to select text and <u><i>format it.</i></u></p><p>Since this is your first time opening Husk, this content will be stored to Local Storage. You can click anywhere, and erase everything to start writing.&nbsp;</p><p>In the bottom left corner you can view the settings for Husk, which as of now, only includes the option for syncing notes across your chrome browser (an experimental and potentially buggy feature.)</p><p><br></p><p></p>"
        this.save()
      }

      // If sync storage exists, set up Husk with it's values
      chrome.storage.sync.get(null, (res) => {
        this.settings.enableSyncStorage = (res.hasOwnProperty('settings') && res.settings.enableSyncStorage);
        this.load()
      })
    },

    /**
     * Switch storage modes between local / sync.
     * Gets the current values of the text editor, and the user's settings
     * -> saves them -> switches storage type -> dumps tempState to new storage.
     */
    toggleSyncStorage() {
      const tempState = { editor: editorContents, settings: this.settings };

      this.save(); // save to old editor before switching storage location.
      this.settings.enableSyncStorage = !this.settings.enableSyncStorage;

      // if turning OFF sync storage, wipe chrome storage, so app loads from local storage next time.
      if (!this.settings.enableSyncStorage) {
        console.log('sync storage is off, clear it');
        // chrome.storage.sync.clear();
        this.save({
          editor: tempState.editor.innerHTML,
          settings: tempState.settings,
        })
      } else {
        this.save(tempState)
      }
    }
  },

  created() {
    this.initStorage();
    initEventListeners();
  }
});


/*=======================================*
Functions
*========================================*/

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

  /*
   * BUG: Paste something big / a few things -> refresh: it duplicates itself.
   */
  document.addEventListener('visibilitychange', () => {
    document.hidden ? App.save() : App.initStorage();
  });
}

/* =========================================
Setting up "Pen" library.
// NOTE: Must happen after vue instantiation.
============================================*/
let HuskEditorOptions = {
  editor: document.getElementById('Editor'),
  class: 'pen',
  linksInNewWindow: true,
  list: [
    'blockquote', 'h2', 'h3', 'p', 'insertorderedlist', 'insertunorderedlist',
    'indent', 'outdent', 'bold', 'italic', 'underline', 'createlink'
  ]
}

const HuskEditor = new Pen(HuskEditorOptions)


/*=======================================*
Outro Jams / Event listeners.
*========================================*/

// must be at end of file.
let editorContents = document.getElementById('Editor')

// strip clipboard before pasting anything. (Must be at end of file; won't work in Vue.created() )
editorContents.addEventListener('paste', (e) => {
  e.preventDefault();
  let text = e.clipboardData.getData('text/plain');
  document.execCommand('insertHTML', false, text)
});
