draughts-reader
===============

Draughts reader is a JQuery plugin for reading draughts game notations like `PDN` notation or `DamWeb` notation.
This plugin is just the UI. It depends and embeds the following Javascript projects:
- [draughts-reader-core](https://github.com/jlfy738/draughts-reader-core): to calculate movements.
- [draughts-game-controller](https://github.com/jlfy738/draughts-game-controller): to convert various text notation into Game object.
  - [draughts-pdn-parser](https://github.com/jlfy738/draughts-pdn-parser): Javascript PDN (Portable Draughts Notation) parser.
  - [draughts-damweb-parser](https://github.com/jlfy738/draughts-damweb-parser): Javascript Damweb parser.



## How to use ?
To get started, download the plugin, unzip it and copy files to your website directory. 
Draughts reader requires JQuery plugin v1.7+.
Load these 2 files in your HTML document.


```html
<script type="text/javascript" src="./jquery.min.js"> </script>
<script type="text/javascript" src="./draughts-reader.min.js"> </script>
```

Then, create a `<div>` element where you write the notation.
Draughts reader may interpret 2 types of notation.

**PDN notation**

```html
<div class="game">
    PDN Text here.
</div>
```

**Damweb notation**  
Use data attributes : `data-position` and `data-notation`.

```html
<div class="game" 
    data-position="WMWP2430343842434447BP091213151925272836" 
    data-notation="474136474237474937324920320325340324">
</div>
```

----

For rendering, initialise the script like this:

```html
<script type="text/javascript">
    $(document).ready(function() {
        $('.game').dreader();
    })(jQuery);
</script>
```

May also be passed an optional options object which will extend the default values.

```javascript
$('#custom-game').dreader({
    cvSquareSize:40,
    cvSquareDarkColor:'#329A4D',
    cvSquareLightColor:'#FFFF80',
    cvSquareLandingColor: '#108A2F',
    cvSquareStartColor: '#108A2F',
    cvSquareEndColor: '#108A2F',
    displayNumbers:true
});
```

## Screenshot

![alt tag](https://github.com/jlfy738/draughts-reader/blob/master/src/doc/draughts-reader.png)

## License

GNU General Public License (GPL), v3

## Contribute

The main purpose of this repository is to continue to improve Draughts Reader plugin.


### Prerequisites

- You have node installed.
- You are familiar with npm.
- You are familiar with git.

### Installation

Clone a copy of the draugths-reader git repository by running:  
`git clone https://github.com/jlfy738/draughts-reader.git`

Enter the draughts-reader directory and install dependencies:  
`npm install`

### Build

Once you have the repository cloned, building a copy of draughts-reader.js is really easy.  
`npm run build` (NB : using browserify)