var
    DGController = require('draughts-game-controller'),
    Piece = require('draughts-reader-core').Piece
;

(function() {

    function generateUUID(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };

    function getUniqueId(element){
        var id = element.id;
        if (!id) {
            id = generateUUID();
            element.id = id;
        }
        return id;
    };

    function getHTMLNotation(notationStruct){
        var ht = '';
        for (var k = 0; k < notationStruct.length; k++){
            var line = notationStruct[k];


            var bn = '';
            if (line.number < 10) {
                bn += '&nbsp;';
            }
            bn += line.number;


            var currentWhite = false;
            var posWhite = '';
            var bw = '';
            if (line.white !== undefined){
                currentWhite = line.white.current;
                posWhite = line.white.position;
                var nsWhite = getNotationStyle(line.white.move);
                if (nsWhite.before) {
                    bw += '&nbsp;';
                }
                bw += nsWhite.notation;
                if (nsWhite.after) {
                    bw += '&nbsp;';
                }
            } else {
                bw = '&nbsp;...&nbsp;';
            }

            var currentBlack = false;
            var posBlack = '';
            var bm = '';
            if (line.black !== undefined){
                currentBlack = line.black.current;
                posBlack = line.black.position;
                var nsBlack = getNotationStyle(line.black.move);
                if (nsBlack.before) {
                    bm += '&nbsp;';
                }
                bm += nsBlack.notation;
                if (nsBlack.after) {
                    bm += '&nbsp;';
                }
            }


            var s = '';
            s += bn + '. ';


            s += '<span';
            if (!isNaN(posWhite)){
                s += ' data-pos="' + posWhite + '"';
            }
            if (currentWhite){
                s += ' class="active"';
            }
            s += '>';
            s += bw + '</span>';
            s += " &nbsp;";


            s += '<span';
            if (!isNaN(posBlack)){
                s += ' data-pos="' + posBlack + '"';
            }
            if (currentBlack){
                s += ' class="active"';
            }
            s += '>';
            s += bm + '</span>';


            ht += s + "<br />";
        }

        return ht;
    };

    function getNotationStyle(notation){
        var idxSep = notation.indexOf("-");
        if (idxSep == -1) {
            idxSep = notation.indexOf("x");
        }
        var s = notation.substring(idxSep + 1);

        var before = (idxSep == 1);
        var after = (s.length == 1);

        notation = notation.replace("-", "&minus;");
        notation = notation.replace("x", "&times;");

        var map = { 'notation':notation, 'before':before, 'after':after };
        return map;
    };

    function isItemVisibleInScrollBox(item, boxWithScroll){
        var boxRect = boxWithScroll.getBoundingClientRect();
        var itemRect = item.getBoundingClientRect();

        return ((itemRect.bottom <= boxRect.bottom) && (itemRect.top >= boxRect.top));
    }

    function Dreader(element, options) {

        // Default options
        var defaults = {
            firstLoadNum:1,
            cvSquareSize:40,
            cvSquareDarkColor:'#B4814E',
            cvSquareLightColor:'#FFFFFF',
            cvSquareLandingColor:'#84532F',
            cvSquareStartColor:'#84532F',
            cvSquareEndColor:'#84532F',
            displayNumbers:false,
            numberTextFont:"10px Arial",
            numberTextColor:"#FFFFFF",
            delayAfterHighlight:400,
            delayToJump:400,
            delayToRemoveCapturedPiece:200,
            delayAutoPlay:1000
        };

        // avoid `this` confusion
        // plugin instance
        var plugin = this;

        plugin.options = {}

        // HTML item reference
        var element = element;
        // ID item reference
        var id = getUniqueId(element);
        // Timer (canvas animation)
        var timer = null;
        // Timer (Autoplay)
        var timerAutoPlay = null;
        // What time is it at the end of the last animation ?
        var timeEndLastAnimation = null;

        var game = null;
        var board = null;

        var dgController = null;


        plugin.init = function() {
            plugin.options = Object.assign({}, defaults, options);

            dgController = new DGController();

            var position = element.getAttribute('data-position');
            var notation = element.getAttribute('data-notation');
            // Damweb Format
            if (position !== null) {
                dgController.initDamWeb(position, notation);
            }
            // PDN Format
            else {
                var pdnText = element.innerHTML;
                dgController.initPDN(pdnText);
            }


            var firstNum = 0; // No game
            var nbGames = dgController.getGameCount();
            if (nbGames > 0){
                firstNum = plugin.options['firstLoadNum'];
                if (firstNum > nbGames){
                    firstNum = 1;
                }
            }

            initGame(firstNum);
            initLayout();

            element.addEventListener('change', function(event){
                var select = event.target.closest('select[name="' + id + '-menu"]');
                if (select && element.contains(select)){
                    initGame(select.value);
                    initLayout();
                }
            });

            element.addEventListener('click', function(event){
                var span = event.target.closest('.notation span');
                if (span && element.contains(span)){
                    var pos = span.dataset.pos;
                    if (pos !== undefined && pos !== '' && !isNaN(pos)){
                        pos = Number(pos);
                    }
                    applyPosition(pos);
                    return;
                }

                var startBtn = event.target.closest('.control-bar .start');
                if (startBtn && element.contains(startBtn)){
                    applyStart();
                    return;
                }

                var endBtn = event.target.closest('.control-bar .end');
                if (endBtn && element.contains(endBtn)){
                    applyEnd();
                    return;
                }

                var prevBtn = event.target.closest('.control-bar .prev');
                if (prevBtn && element.contains(prevBtn)){
                    applyPrev();
                    return;
                }

                var nextBtn = event.target.closest('.control-bar .next');
                if (nextBtn && element.contains(nextBtn)){
                    applyNext();
                    return;
                }

                var autoplayBtn = event.target.closest('.control-bar .autoplay');
                if (autoplayBtn && element.contains(autoplayBtn)){
                    autoPlay();
                    return;
                }
            });
        };

        var initGame = function(currentNumGame){
            if (!currentNumGame){
                currentNumGame = 0;
            }

            razAnim();
            razAutoPlay();

            dgController.setCurrentNumGame(currentNumGame);
            game = dgController.getGame();
            game.start();

            board = game.board;
        };

        var initLayout = function(){
            var layout = '';
            layout += '<table>';
            layout += '<tr>';
            layout += '<td>';

            layout += '<div class="outer-box">'
            layout += '    <div class="inner-box">'
            layout += '        <canvas class="cv-board"></canvas>';
            layout += '    </div>';
            layout += '</div>';

            var menu = '';
            var nbGames = dgController.getGameCount();
            if (nbGames > 1) {
                var titles = dgController.getTitles("tagWhite - tagBlack [tagRound] - tagResult");
                menu = '<select name="' + id + '-menu">';

                if (!plugin.options['firstLoadNum']){
                    menu += '<option value="">&mdash;</option>';
                }

                for (var k = 0; k < titles.length; k++){
                    var t = titles[k];
                    var isSelect = (dgController.getCurrentNumGame() == t['num']);
                    var attrSelected = '';
                    if (isSelect){
                        attrSelected = ' selected="selected"';
                    }
                    menu += '<option value="' + t["num"] + '"' + attrSelected + '>' + t["num"] + ' &ndash; ' + t["title"] + '</option>';
                }
                menu += '</select>';
            }


            layout += '</td>';
            layout += '<td>';
            if (menu){
                layout += '<div class="pdn-games">' + menu + '</div>';
            }
            if (game.hasMove()){
                layout += '<div class="notation"></div>';
            }
            layout += '</td>';
            layout += '</tr>';
            layout += '<tr>';
            layout += '<td>';
            if (game.hasMove()){
                layout += '<div class="control-bar">';
                layout += '    <button class="start">&laquo;</button>';
                layout += '    <button class="prev">&lsaquo;</button>';
                layout += '    <button class="next">&rsaquo;</button>';
                layout += '    <button class="end">&raquo;</button>';
                layout += '    <button class="autoplay">&diams; auto</button>';
                layout += '</div>';
            }
            layout += '</td>';
            layout += '<td></td>';
            layout += '</tr>';
            layout += '</table>';

            element.innerHTML = layout;

            refreshNotation();

            var c = element.querySelector('.cv-board');
            var ctx = c.getContext("2d");
            var sqWidth = plugin.options['cvSquareSize'];
            c.width = 10*sqWidth;
            c.height = 10*sqWidth;

            drawCanvasContent(ctx);
        };

        var razAnim = function(){
            if (timer !== null){
                clearInterval(timer);
                timer = null;
            }
        };

        var razAutoPlay = function(){
            if (timerAutoPlay !== null){
                clearInterval(timerAutoPlay);
                timerAutoPlay = null;
            }
        };

        var refreshAll = function(){
            refreshNotation();
            refreshCanvas();
        };

        var refreshNotation = function(){
            var notationArea = element.querySelector('.notation');
            if (!notationArea){
                return;
            }
            notationArea.innerHTML = getHTMLNotation(game.getNotation());

            // Auto scrolling
            var actives = notationArea.querySelectorAll('.active');
            actives.forEach(function(item){
                if (!isItemVisibleInScrollBox(item, notationArea)){
                    var to = item.getBoundingClientRect().top - notationArea.getBoundingClientRect().top + notationArea.scrollTop;
                    to = to - (notationArea.clientHeight / 2);

                    notationArea.scrollTop = to;
                }
            });
        };

        var initNotationScroll = function(){
            var notationArea = element.querySelector('.notation');
            if (notationArea){
                notationArea.scrollTop = 0;
            }
        }

        var refreshCanvas = function(){
            var c = element.querySelector('.cv-board');
            var ctx = c.getContext("2d");
            drawCanvasContent(ctx);
        };

        var applyPosition = function(pos){
            razAnim();
            razAutoPlay();
            game.setCursor(pos);
            refreshAll();
        };

        var applyStart = function(){
            razAnim();
            razAutoPlay();
            game.start();
            refreshAll();
            initNotationScroll();
        };

        var applyEnd = function(){
            razAnim();
            razAutoPlay();
            game.end();
            refreshAll();
        };

        var applyNext = function(){
            razAnim();
            razAutoPlay();
            refreshAll();
            applyNextAuto();
        };

        var applyNextAuto = function(){
            razAnim();
            drawCanvasNextMove();
            game.next();
            refreshNotation();
        };

        var applyPrev = function(){
            razAnim();
            razAutoPlay();
            game.prev();
            refreshAll();
        };

        var autoPlay = function(){
            var callback = function() {
                // waiting the end of the current animation if it exists.
                if (timer !== null){
                    return;
                }

                // Wait a little if necessary.
                if (timeEndLastAnimation !== null){
                    var interSinceLastAnim = (new Date()).getTime() - timeEndLastAnimation;
                    var restToWait = plugin.options['delayAutoPlay'] - interSinceLastAnim;
                    timeEndLastAnimation = null;

                    if (restToWait > 0) {
                        setTimeout(function(){
                            callBackAction();
                        }, restToWait);
                    } else {
                        callBackAction();
                    }
                } else {
                    callBackAction();
                }
            };

            var callBackAction = function(){
                if (game.hasNext()){
                    refreshCanvas();
                    applyNextAuto();
                } else {
                    razAutoPlay();
                }
            }

            // Stop/Start
            if (timerAutoPlay !== null){
                razAutoPlay();
            } else {
                callback(); // Do not wait first time
                timerAutoPlay = setInterval(callback, plugin.options['delayAutoPlay']);
            }
        };


        var drawPiece = function(ctx, piece, x, y, r){
            var sqWidth = plugin.options['cvSquareSize'];
            var shift = 1 + ((~~(sqWidth / 10)) + 1) / 2;

            switch (piece) {
            case Piece.PAWN_WHITE:
                ctx.beginPath();
                ctx.arc(x, y, r ,0, Math.PI * 2, true);
                ctx.strokeStyle = "black";
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.stroke();
                break;
            case Piece.PAWN_BLACK:
                ctx.beginPath();
                ctx.arc(x, y, r ,0, Math.PI * 2, true);
                ctx.strokeStyle = "#eee";
                ctx.fillStyle = "black";
                ctx.fill();
                ctx.stroke();
                break;
            case Piece.DAME_WHITE:
                ctx.beginPath();
                ctx.arc(x, y, r ,0, Math.PI * 2, true);
                ctx.strokeStyle = "black";
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(x, y, shift ,0, Math.PI * 2, true);
                ctx.strokeStyle = "black";
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.stroke();
                break;
            case Piece.DAME_BLACK:
                ctx.beginPath();
                ctx.arc(x, y, r ,0, Math.PI * 2, true);
                ctx.strokeStyle = "#eee";
                ctx.fillStyle = "black";
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(x, y, shift ,0, Math.PI * 2, true);
                ctx.strokeStyle = "white";
                ctx.fillStyle = "black";
                ctx.fill();
                ctx.stroke();
                break;
            default:
            }
        };

        var drawSquare = function(ctx, num, piece, sqColor){
            var nRow = ~~((num - 1) / 5) + 1; // [1..10]
            var nCol = ((num - 1) % 5) + 1; // [1..5]

            var sqWidth = plugin.options['cvSquareSize'];

            if (nRow == 1 || nRow == 3 || nRow == 5 || nRow == 7 || nRow == 9) {
                var x = 2 * sqWidth * (nCol - 1) + sqWidth;
                var y = sqWidth * (nRow - 1);

                drawSquareInc(ctx, num, piece, x, y, sqColor);
            }

            if (nRow == 2 || nRow == 4 || nRow == 6 || nRow == 8 || nRow == 10) {
                var x = 2 * sqWidth * (nCol - 1);
                var y = sqWidth * (nRow - 1);

                drawSquareInc(ctx, num, piece, x, y, sqColor);
            }
        };

        var drawSquareInc = function(ctx, num, piece, x, y, sqColor){
            var sqWidth = plugin.options['cvSquareSize'];

            if (!sqColor){
                sqColor = plugin.options['cvSquareDarkColor'];
            }
            ctx.fillStyle = sqColor;
            ctx.fillRect(x, y, sqWidth, sqWidth);

            if (plugin.options['displayNumbers']){
                ctx.font = plugin.options['numberTextFont'];
                ctx.fillStyle = plugin.options['numberTextColor'];

                // Center text
                var px = (sqWidth / 2) - (ctx.measureText("" + num).width / 2);
                var py = (sqWidth / 2) + (ctx.measureText("M").width / 2);
                ctx.fillText("" + num, x + px, y + py);
            }

            var x = x + (sqWidth / 2);
            var y = y + (sqWidth / 2);
            var r = sqWidth / 2 - (sqWidth / 10);

            drawPiece(ctx, piece, x, y, r);
        };

        var drawCanvasContent = function(ctx){
            var sqWidth = plugin.options['cvSquareSize'];
            ctx.fillStyle = plugin.options['cvSquareLightColor'];
            ctx.fillRect(0, 0, 10*sqWidth, 10*sqWidth);

            for (var num = 1; num <= 50; num++){
                var p = board.getSquare(num).piece;
                drawSquare(ctx, num, p);
            }
        };

        var drawCanvasNextMove = function(){
            var move = game.getNextMove();
            if (move === null) {
                return;
            }

            var c = element.querySelector('.cv-board');
            var ctx = c.getContext("2d");

            var piecePlayed = board.getPiece(move.startingSquareNum);
            drawCanvasNextMoveStep2(ctx, move, piecePlayed);
        };

        var drawCanvasNextMoveStep2 = function(ctx, move, piecePlayed){
            // color start square.
            drawSquare(ctx, move.startingSquareNum, piecePlayed, plugin.options['cvSquareStartColor']);

            // color end square.
            if (move.startingSquareNum != move.endingSquareNum){
                drawSquare(ctx, move.endingSquareNum, Piece.EMPTY, plugin.options['cvSquareEndColor']);
            }

            // color intermediate squares.
            if (move.isCaptured){
                var landingSquaresNum = move.getLandingSquaresNum();
                for (var i = 0; i < landingSquaresNum.length; i++) {
                    var num = landingSquaresNum[i];
                    if (num != move.startingSquareNum) {
                        drawSquare(ctx, num, Piece.EMPTY, plugin.options['cvSquareLandingColor']);
                    }
                }
            }

            // Wait a little...
            (function() {
                var callback = function() {
                    razAnim();
                    drawCanvasNextMoveStep3(ctx, move, piecePlayed);
                };
                timer = setInterval(callback, plugin.options['delayAfterHighlight']);
            })();
        };

        var drawCanvasNextMoveStep3 = function(ctx, move, piecePlayed){
            // Remove piece from starting square
            drawSquare(ctx, move.startingSquareNum, Piece.EMPTY, plugin.options['cvSquareStartColor']);


            if (!move.isCaptured){
                drawCanvasNextMoveStep4(ctx, move, piecePlayed);
            }
            // Move piece on intermediate squares
            else {

                var landingSquaresNum = move.getLandingSquaresNum();
                if (landingSquaresNum.length > 0){

                    (function() {
                        var i = 0;
                        var callback = function() {
                            if (i < landingSquaresNum.length){
                                var num = landingSquaresNum[i];
                                var numPrev = null;
                                if (i > 0){
                                    numPrev = landingSquaresNum[i - 1];
                                }
                                if (numPrev !== null){
                                    drawSquare(ctx, numPrev, Piece.EMPTY, plugin.options['cvSquareLandingColor']);
                                }
                                drawSquare(ctx, num, piecePlayed, plugin.options['cvSquareLandingColor']);

                                i++;
                            } else {
                                razAnim();
                                drawCanvasNextMoveStep4(ctx, move, piecePlayed);
                            }
                        };

                        callback(); // do not wait first time
                        timer = setInterval(callback, plugin.options['delayToJump']);
                    })();

                } else {
                    drawCanvasNextMoveStep4(ctx, move, piecePlayed);
                }
            }
        };

        var drawCanvasNextMoveStep4 = function(ctx, move, piecePlayed){
            // Set piece on ending square
            if (!move.isCrowned) {
                drawSquare(ctx, move.endingSquareNum, piecePlayed, plugin.options['cvSquareEndColor']);
            }
            // Piece is crowned
            else {
                if (piecePlayed == Piece.PAWN_WHITE) {
                    drawSquare(ctx, move.endingSquareNum, Piece.DAME_WHITE, plugin.options['cvSquareEndColor']);
                } else if (piecePlayed == Piece.PAWN_BLACK) {
                    drawSquare(ctx, move.endingSquareNum, Piece.DAME_BLACK, plugin.options['cvSquareEndColor']);
                }
            }

            // Remove pieces for captured squares
            if (move.isCaptured){
                var capturedNums = move.getCapturedSquaresNum();
                if (capturedNums.length > 0){

                    (function() {
                        var i = 0;
                        var callback = function() {
                            if (i < capturedNums.length){
                                var num = capturedNums[i];
                                drawSquare(ctx, num, Piece.EMPTY);

                                i++;
                            } else {
                                razAnim();
                                timeEndLastAnimation = (new Date()).getTime();
                            }
                        };
                        timer = setInterval(callback, plugin.options['delayToRemoveCapturedPiece']);
                    })();
                }
            } else {
                timeEndLastAnimation = (new Date()).getTime();
            }
        };

        plugin.init();
    };


    function dreader(target, options) {
        var elements;
        if (typeof target === 'string') {
            elements = document.querySelectorAll(target);
        } else if (target instanceof Element) {
            elements = [target];
        } else if (target && typeof target.length === 'number') {
            elements = target;
        } else {
            elements = [];
        }

        var instances = [];
        Array.prototype.forEach.call(elements, function(element){
            if (!element.dreaderInstance) {
                element.dreaderInstance = new Dreader(element, options);
            }
            instances.push(element.dreaderInstance);
        });

        return instances.length === 1 ? instances[0] : instances;
    };

    if (typeof window !== 'undefined') {
        window.dreader = dreader;
    }

    module.exports = dreader;

})();
