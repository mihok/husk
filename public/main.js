/** Husk's Javascript Goop.
* Contents
  * Globals
  * Vue Objects
*/

/*************************
- - - Globals - - -
 **************************/

// vars
var g = {
  storageKey: 'husk_user_storage',
}

// LocalStorage
var db = {
  fetch: function() {
    return JSON.parse(localStorage.getItem(g.storageKey || ''))
  },

  save: function(payload) {
    console.log(payload)
    localStorage.setItem(g.storageKey, JSON.stringify(payload))
  },

}

/*************************
- -  Vue Instance - -
**************************/

// Vue Objects
var App = new Vue ({
  el: '#App',

  data: {
    db: {
      userSettings: null,
      editorContents: '',
    },
  },

  methods: {
    save: db.save
  },

  created: function() {
    console.log('vue instance created')
    // TODO: create setInterval to autosave content. 
  }

})

