/** Husk's Javascript Goop.
/* Contents
  * Vue Instance
  * Functions
  * Outro Jams (globals)
 */

/*-----------------------------------------
Vue Instance
------------------------------------------*/
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

    load() {
      if (!this.settings.enableSyncStorage) {
        const state = JSON.parse(window.localStorage.getItem('huskState'))
        this.settings = state.settings;
        editorContents.innerHTML = state.editor

      } else {
        chrome.storage.sync.get(null, function (state) { // async!
          if (state.editor == null) return;
          let content = ""; // reassemble editor contents from split up object.
          Object.keys(state.editor).forEach((key) => { content += state.editor[key] });
          editorContents.innerHTML = content
        })
      }
    },

    /**
     * Prepares storage locations and loads settings.
     * Queries chrome storage -- if exists -> sets local stage to indicate syncing is true.
     */
    initStorage() {
      if (!localStorage.getItem('huskState')) {
        this.settings = { enableStorage: false }
        editorContents.innerHTML = "<h1>Welcome to Husk!</h1><div><br></div><div>Husk is a text pad in your chrome new tab page. It was inspired by <a href=\"https://chrome.google.com/webstore/detail/papier/hhjeaokafplhjoogdemakihhdhffacia\">Papier</a>.<br></div><p>Husk has basic markdown support, as well as the ability to select text and <u><i>format it.</i></u></p><p>Since this is your first time opening Husk, this content will be stored to Local Storage. You can click anywhere, and erase everything to start writing.&nbsp;</p><p>In the bottom left corner you can view the settings for Husk, which as of now, only includes the option for syncing notes across your chrome browser (an experimental and potentially buggy feature.)</p><p><br></p><p></p>"
        this.save()
      }

      chrome.storage.sync.get(null, (res) => {
        this.settings.enableSyncStorage = (res.hasOwnProperty('settings') && res.settings.enableSyncStorage);
        this.load() // must happen inside function -> async;
      })
    },

    /**
     * Copies storage contents between storage boxes (Ls, vs chrome storage)
     * NOTE: consider removing: could be problems b/w multiple computers turning off/on sync.
     ie, both would exists seperately. */
    toggleSyncStorage() {
      const tempState = { editor: editorContents, settings: this.settings };
      this.settings.enableSyncStorage = !this.settings.enableSyncStorage;
      this.save();

      // if turning OFF sync storage, wipe chrome storage, so app loads from local storage next time.
      if (!this.settings.enableSyncStorage) {
        chrome.storage.sync.clear();
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

/*------------------------------------------
Functions
--------------------------------------------*/

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

  // cut any styles of clipboard items on paste; otherwise contentEditable receives formatting.
  window.addEventListener('paste', (e) => {
    e.preventDefault();
    let text = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text)
  });

  /* BUG: Paste something big / a few things -> refresh: it duplicates itself. */
  document.addEventListener('visibilitychange', () => {
    document.hidden ? App.save() : App.initStorage();
  });
}

/* ------------------------------------------
Set up `Pen.js.`
---------------------------------------------*/
let HuskEditorOptions = {
  editor: document.getElementById('Editor'),
  class: 'pen',
  linksInNewWindow: true,
  list: ['bold', 'italic', 'underline', 'createlink', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent'],
}

const HuskEditor = new Pen(HuskEditorOptions)

/*------------------------------------------
Outro Jams
--------------------------------------------*/
let editorContents = document.getElementById('Editor') // must be at end of file.
