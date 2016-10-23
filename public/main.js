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

// Constant strings for avoiding syntax / spelling errors.
var c = {
  db: 'db',
  editorContents: 'editorContents',
  userSettings: 'userSettings',
  storageKey: 'husk_user_storage'
}


var db = {
  fetch: function(item) {
    if (!item) return
    return JSON.parse(localStorage.getItem(c.storageKey))[item]
  },

  save: function(payload) {
    localStorage.setItem(c.storageKey, JSON.stringify(payload))
  },
}


/*************************
- -  Vue Data Object - -
 **************************/
/* Define here rather than the vue instance data object. */
/* Setting object keys based on constants ("c") to avoid errors. */

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

