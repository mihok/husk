> Husk: Write text in your chrome `New Tab` page.

> Note: I've been informed this is in a state of borked-ness / This is no longer maintained. 

![husk screenshot](docs/screenshots/welcome_text.png)

## Background

Husk is a chrome extension inspired by [Papier](https://chrome.google.com/webstore/detail/papier/hhjeaokafplhjoogdemakihhdhffacia). Husk will allow users to write text in their new tab page, as well as (hopefully) syncing data, basic markdown support, and text folding.

## Build Instructions

```
/** First Build **/
git clone https://github.com/teesloane/husk.git
cd husk
npm i

```
Go to `chrome settings > extensions` > `enable developer mode` > `load unpacked extension` > navigate to project folder > load `husk/dist`

After setting this up, you can just run:

`gulp`


## CONTRIBUTIONS

The general roadmap is on the repo wiki --> might be a good place to start.
I decided to take a different approach to this project. Instead of getting lost in tooling and scaffolding out a large project, I decided to keep things very simple. I did decide to try out a new framework (vue.js), but will not bother with setting up a build-suite or babel unless I need to. I'm talking `index.html`, `main.js` and `styles.css`. This may seem unappealing, and may not last for long before some other kind of tooling comes in, but for now, simplicity, and hitting the ground running is the goal.


## LICENSE

Go do whatever you want with Husk.
