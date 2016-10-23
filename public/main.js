/** Husk's Javascript Goop.
* Contents
  * Globals
  * Vue Data Object 
  * Vue Objects

* TODO: Focus text area on page load.
* TODO: Autosave

* NOTE: Lots of obj's defined with bracket notation in order to set
   keys with CONST's instead of strings, avoiding possible mistakes.
*/

/*************************
- - - Globals - - -
 **************************/

// Constants 
var c = {
  db: 'db',
  editorContents: 'editorContents',
  userSettings: 'userSettings',
  storageKey: 'husk_user_storage'
}

// Local storage "Database"
var db = {
  fetch: function(item) {
    if (!item) return JSON.parse(localStorage.getItem(c.storageKey))
    return JSON.parse(localStorage.getItem(c.storageKey))[item]
  },

  save: function(payload) {
    localStorage.setItem(c.storageKey, JSON.stringify(payload))
  },
}


/*************************
- -  Setup / Init - -
 **************************/

// local storage default schema:
var lsD = {}
lsD[c.db] = {}
lsD[c.db][c.editorContents] = ""
lsD[c.db][c.userSettings] = null // null for now, will be an object eventually.

if(db.fetch() === null) db.save(lsD)


/*************************
- -  Vue Data Object - -
 **************************/
/* Must be define outside vue instance to leverage obj keys-from-constants. */

var data = {};

data[c.db] = {};
data[c.db][c.userSettings] = null,
data[c.db][c.editorContents] = db.fetch(c.editorContents)


/*************************
- -  Vue Instance - -
**************************/

// Vue Objects
var App = new Vue ({
  el: '#App',
  data: data,

  methods: {
    save: db.save
  },

  created: function() {
    // TODO: create setInterval to autosave content. 
  }
})

