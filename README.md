draughts-reader
===============

Draughts reader is a dependency-free vanilla JS plugin for reading draughts game notations like `PDN` notation or `DamWeb` notation.

This plugin is just the UI. It depends and embeds the following Javascript projects:
- [draughts-reader-core](https://github.com/jlfy738/draughts-reader-core): to calculate movements.
- [draughts-game-controller](https://github.com/jlfy738/draughts-game-controller): to convert various text notation into Game object.
  - [draughts-pdn-parser](https://github.com/jlfy738/draughts-pdn-parser): Javascript PDN (Portable Draughts Notation) parser.
  - [draughts-damweb-parser](https://github.com/jlfy738/draughts-damweb-parser): Javascript Damweb parser.

A legacy JQuery version is also kept as an archive, see [Legacy: JQuery version](#legacy-jquery-version) at the bottom of this file.



## How to use ?
To get started, download the plugin, unzip it and copy files to your website directory.
No dependency needed. Load this single file in your HTML document.

```html
<script type="text/javascript" src="./draughts-reader.min.js"> </script>
```

Then, create a `<div>` element where you write the notation.
Draughts reader may interpret 2 types of notation.

### PDN notation

```html
<div class="game">
    PDN Text here.
</div>
```

### Damweb notation
Use data attributes : `data-position` and `data-notation`.

```html
<div class="game" 
    data-position="WMWP2430343842434447BP091213151925272836" 
    data-notation="474136474237474937324920320325340324">
</div>
```

### Rendering
For rendering, initialise the script like this:

```html
<script type="text/javascript">
    document.addEventListener('DOMContentLoaded', function() {
        dreader('.game');
    });
</script>
```

May also be passed an optional options object which will extend the default values.

```javascript
dreader('.game', {
    cvSquareSize:40,
    cvSquareDarkColor:'#329A4D',
    cvSquareLightColor:'#FFFF80',
    cvSquareLandingColor: '#108A2F',
    cvSquareStartColor: '#108A2F',
    cvSquareEndColor: '#108A2F',
    displayNumbers:true
});
```

`dreader()` accepts a CSS selector, a single element, or a NodeList/array of elements, and returns the created instance (or an array of instances for multiple elements).

### Move animation

Two animation styles are available for playing a move, controlled by the `animationStyle` option:
- `'classic'` (default): the start/end/landing squares are highlighted, then the piece snaps from square to square. Timing is controlled by `delayAfterHighlight`, `delayToJump` and `delayToRemoveCapturedPiece`.
- `'smooth'`: the piece slides continuously along the move's path (including through capture jumps), eased in/out. Timing is controlled by `moveDuration` (duration in ms of one slide segment).

```javascript
dreader('.game', {
    animationStyle: 'smooth',
    moveDuration: 500
});
```

### Adding some style CSS
Inside the <head> tag or in an external style sheet.

```html
<style type="text/css">
    .game .inner-box { border: 1px dotted #000; padding:2px; }
    .game .outer-box { border: 4px solid #B4814E; padding:2px; }

    .game .control-bar { display:inline-block; padding:5px; }

    .game .pdn-games { margin: 0 0 5px 1em; }
    .game .pdn-games select { width:200px; border:1px solid #888; padding:3px; }

    .game .notation { 
        display:inline-block;
        border:1px solid #777; 
        font-family:"Courier New", Courier, monospace; 
        padding:0.5em;
        margin-left:1em;
        background-color: #fff;
        max-height:300px;
        overflow:scroll;
    }
    .game .notation span { 
        display: inline-block;
        font-size: 14px;
        padding: 2px 5px;
        cursor:pointer;
    }
    .game .notation span.active { background-color: #FF7; }
</style>
```


## Screenshot

![alt tag](https://github.com/jlfy738/draughts-reader/blob/master/doc/draughts-reader.png)

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

`npm run build` (using [Gulp](https://gulpjs.com/) + [esbuild](https://esbuild.github.io/)

This generates four files in `dist/`:
- `draughts-reader.js` / `draughts-reader.min.js`: default vanilla JS version.
- `draughts-reader-jquery.js` / `draughts-reader-jquery.min.js`: archived JQuery version, bundled (see [Legacy: JQuery version](#legacy-jquery-version)).


## Legacy: JQuery version

The original JQuery plugin is kept in the repository as an archive (`src/views/jq-player.js`, built from `src/main-jquery.js` into `dist/draughts-reader-jquery.js` / `dist/draughts-reader-jquery.min.js`), for projects that still depend on it. New projects should use the default vanilla JS version documented above instead.

To use it, load JQuery v1.7+ and the archived build instead of the default one.

```html
<script type="text/javascript" src="./jquery.min.js"> </script>
<script type="text/javascript" src="./draughts-reader-jquery.min.js"> </script>
```

The markup (`<div class="game">`, `data-position`/`data-notation`) and the CSS are identical to the vanilla version above. Only the initialisation differs, using the JQuery plugin API:

```html
<script type="text/javascript">
    $(document).ready(function() {
        $('.game').dreader();
    })(jQuery);
</script>
```

```javascript
$('.game').dreader({
    cvSquareSize:40,
    cvSquareDarkColor:'#329A4D',
    cvSquareLightColor:'#FFFF80',
    cvSquareLandingColor: '#108A2F',
    cvSquareStartColor: '#108A2F',
    cvSquareEndColor: '#108A2F',
    displayNumbers:true
});
```
