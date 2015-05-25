draughts-reader
===============

A JQuery plugin to read Draughts Game


## Quick start
- Install : `$ npm install`
- Build : `$ npm run build` (NB : using browserify)

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

For rendering, initialise the script like this :

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