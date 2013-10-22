if (!Array.prototype.eachdo) {
    Array.prototype.eachdo = function  (fn) {
        'use strict';
        var i;
        for (i = 0; i < this.length; i += 1) {
            fn.call(this[i], i);
        }
    };
} //each-do method for  
if (!Array.prototype.remDup) {
    Array.prototype.remDup = function () {
        'use strict';
        var bool,
            temp = [],
            i,
            j;
        for (i = 0; i < this.length; i += 1) {
            bool = true;
            for (j = i + 1; j < this.length; j += 1) {
                if (this[i] === this[j]) { 
                    bool = false; 
                }
            }
            if (bool === true) { 
                temp.push(this[i]); 
            }
        }
        return temp;
    };
}
//needs a cache function to store high scores

(function () {
    'use strict';
    var TETRIS = {
        board: [],
        boardDiv: null,
        canvas: null,
        pSize: 30,
        canvasHeight: 600,
        canvasWidth: 300,
        boardHeight: 0,
        boardWidth: 0,
        spawnX: 4,
        spawnY: 1,
        shapes: [
            [
                [-1, 1], [0, 1], [1, 1], [0, 0] //TEE
            ],
            [
                [-1, 0], [0, 0], [1, 0], [2, 0] //line
            ],
            [
                [-1, -1], [-1, 0], [0, 0], [1, 0] //L EL
            ],
            [
                [-1, 0], [0, 0], [1, 0], [1, -1] //R EL
            ],
            [
                [-1, 0], [0, 0], [0, -1], [1, -1] //R ess
            ],
            [
                [-1, -1], [0, -1], [0, 0], [1, 0] //L ess
            ],
            [
                [0, -1], [1, -1], [0, 0], [1, 0] //square
            ]
        ],
        tempShapes:       null,
        curShape:         null,
        curShapeIndex:    null,
        curX:             0,
        curY:             0,
        curSqs:           [],
        nextShape:        null,
        nextShapeDisplay: null,
        nextShapeIndex:   null,
        sqs:              [],
        score:            0,
        scoreDisplay:     null,
        level:            1,
        levelDisplay:     0,
        numLevels:        10,
        time:             0,
        maxTime:          1000,
        timeDisplay:      null,
        isActive:         0,
        curComplete:      false,
        timer:            null,
        sTimer:           null,
        speed:            600,
        lines:            0,

        init: function () {
            this.canvas = document.getElementById('canvas');
            this.initBoard();
            this.initInfo();
            this.initLevelScores();
            this.initShapes();
            this.bindKeyEvents();
            this.play();
        },
        initBoard: function () {
            var i,
                s = this.boardHeight * this.boardWidth;
            this.boardHeight = this.canvasHeight / this.pSize;
            this.boardWidth = this.canvasWidth / this.pSize;
            for (i = 0; i < s; i += 1) {
                this.board.push(0);
            }
          //this.boardDiv = document.getElementById('board'); //for debugging
        },
        initInfo: function () {
            this.nextShapeDisplay = document.getElementById('next_shape');
            this.levelDisplay = document.getElementById('level').getElementsByTagName('span')[0];
            this.timeDisplay = document.getElementById('time').getElementsByTagName('span')[0];
            this.scoreDisplay = document.getElementById('score').getElementsByTagName('span')[0];
            this.linesDisplay = document.getElementById('lines').getElementsByTagName('span')[0];
            this.setInfo('time');
            this.setInfo('score');
            this.setInfo('level');
            this.setInfo('lines');
        },
        initShapes: function () {
            this.curSqs = [];
            this.curComplete = false;
            this.shiftTempShapes();
            this.curShapeIndex = this.tempShapes[0];
            this.curShape = this.shapes[this.curShapeIndex];
            this.initNextShape();
            this.setCurCoords(this.spawnX, this.spawnY);
            this.drawShape(this.curX, this.curY, this.curShape);
        },
        initNextShape: function () {
            if (typeof this.tempShapes[1] === 'undefined') { 
                this.initTempShapes();
            }
            try {
                this.nextShapeIndex = this.tempShapes[1];
                this.nextShape = this.shapes[this.nextShapeIndex];
                this.drawNextShape();
            } catch (e) {
                throw new Error("Could not create next shape. " + e);
            }
        },
        initTempShapes: function () {
            this.tempShapes = [];
            var i = 0,
                j = 0,
                tempk = 0,
                tempj = 0;

            for (i = 0; i < this.shapes.length; i += 1) {
                this.tempShapes.push(i);
            }
            var k = this.tempShapes.length;
            while (k -= 1) {
                j = Math.floor(Math.random() * (k + 1));
                tempk = this.tempShapes[k];
                tempj = this.tempShapes[j];
                this.tempShapes[k] = tempj;
                this.tempShapes[j] = tempk;
            }
        },
        shiftTempShapes: function () {
            try {
                if (typeof this.tempShapes === 'undefined' || this.tempShapes === null) {
                    this.initTempShapes();
                } else {
                    this.tempShapes.shift();
                }
            } catch (e) {
                throw new Error("Could not shift or init tempShapes: " + e);
            }
        },
        initTimer: function () {
            var that = this,
                tLoop = function () {
                    that.incTime();
                    that.timer = setTimeout(tLoop, 2000);
                };
            this.timer = setTimeout(tLoop, 2000);
        },
        initLevelScores: function () {
            var cnt = 1,
                i;
            for (i = 1; i <= this.numLevels; i += 1) {
                this['level' + i] = [cnt * 1000, 40 * i, 5 * i]; 
                cnt = cnt + cnt;
            }
        },
        setInfo: function (el) {
            this[el + 'Display'].innerHTML = this[el];
        },
        drawNextShape: function () {
            var i,
                k,
                ns = [];
            for (i = 0; i < this.nextShape.length; i += 1) {
                ns[i] = this.createSquare(this.nextShape[i][0] + 2,
                    this.nextShape[i][1] + 2, this.nextShapeIndex);
            }
            this.nextShapeDisplay.innerHTML = "";
            for (k = 0; k < ns.length; k += 1) {
                this.nextShapeDisplay.appendChild(ns[k]);
            }
        },
        drawShape: function (x, y, p) {
            var i,
                k,
                newX,
                newY;
            for (i = 0; i < p.length; i += 1) {
                newX = p[i][0] + x;
                newY = p[i][1] + y;
                this.curSqs[i] = this.createSquare(newX, newY, this.curShapeIndex);
            }
            for (k = 0; k < this.curSqs.length; k += 1) {
                this.canvas.appendChild(this.curSqs[k]);
            }
        },
        createSquare: function (x, y, type) {
            var el = document.createElement('div');
            el.className = 'square type' + type;
            el.style.left = x * this.pSize + 'px';
            el.style.top = y * this.pSize + 'px';
            return el;
        },
        removeCur: function () {
            var that = this;
            this.curSqs.eachdo(function () {
                that.canvas.removeChild(this);
            });
            this.curSqs = [];
        },
        setCurCoords: function (x, y) {
            this.curX = x;
            this.curY = y;
        },
        bindKeyEvents: function () {
            var event = "keypress",
                that = this,
                cb = function (e) {
                    that.handleKey(e);
                };
            if (this.isSafari() || this.isIE()) {
                event = "keydown";
            }
            if (window.addEventListener) {
                document.addEventListener(event, cb, false);
            } else {
                document.attachEvent('on' + event, cb);
            }
        },
        handleKey: function (e) {
            var c = this.whichKey(e);
                //dir = ""; //not used in function
            switch (c) {
            case 37:
                this.move('L');
                break;
            case 38:
                this.move('RT');
                break;
            case 39:
                this.move('R');
                break;
            case 40:
                this.move('D');
                break;
            case 32:
                this.togglePause();
                break;
            default:
                break;
            }
        },
        whichKey: function (e) {
            var c;
            if (window.event) {
                c = window.event.keyCode;
            } else if (e) {
                c = e.keyCode;
            }
            return c;
        },
        incTime: function () {
            this.time += 1;
            this.setInfo('time');
        },
        incScore: function (amount) {
            this.score = this.score + amount;
            this.setInfo('score');
        },
        incLevel: function () {
            this.level += 1;
            this.speed = this.speed - 75;
            this.setInfo('level');
        },
        incLines: function (num) {
            this.lines += num;
            this.setInfo('lines');
        },
        calcScore: function (args) {
            var lines = args.lines || 0,
                score = 0,
                shape = args.shape || false,
                speed = args.speed || 0;
            if (lines > 0) {
                score += lines * this['level' + this.level][1];
                this.incLines(lines);
            }
            if (shape === true) {
                score += shape * this['level' + this.level][2];
            }
            if (speed > 0) {
                score += speed * this['level' + this.level][3];
            }
            this.incScore(score);
        },
        checkScore: function () {
            if (this.score >= this['level' + this.level][0]) {
                this.incLevel();
            }
        },
        gameOver: function () {
            this.clearTimers();
            this.canvas.innerHTML = "<h1>GAME OVER</h1>";
        },
        play: function () {
            var that = this,
                gameLoop = function () {
                    that.move('D');
                    if (that.curComplete) {
                        that.markBoardShape(that.curX, that.curY, that.curShape);
                        that.curSqs.eachdo(function () {
                            that.sqs.push(this);
                        });
                        that.calcScore({shape: true});
                        that.checkRows();
                        that.checkScore();
                        that.initShapes();
                        that.play();
                    } else {
                        that.pTimer = setTimeout(gameLoop, that.speed);
                    }
                };
            if (this.timer === null) {
                this.initTimer();
            }
            this.pTimer = setTimeout(gameLoop, that.speed);
            this.isActive = 1;
        },
        togglePause: function () {
            if (this.isActive === 1) {
                this.clearTimers();
                this.isActive = 0;
            } else {
                this.play();
            }
        },
        clearTimers: function () {
            clearTimeout(this.timer);
            clearTimeout(this.pTimer);
            this.timer = null;
            this.pTimer = null;
        },
        move: function (dir) {
            var s = "",
                that = this,
                tempX = this.curX,
                tempY = this.curY;
            switch (dir) {
            case 'L':
                s = 'left';
                tempX -= 1;
                break;
            case 'R':
                s = 'left';
                tempX += 1;
                break;
            case 'D':
                s = 'top';
                tempY += 1;
                break;
            case 'RT':
                this.rotate();
                return true;
            default:
                throw new Error('wtf');
            }
            if (this.checkMove(tempX, tempY, this.curShape)) {
                this.curSqs.eachdo(function () {
                    var l = parseInt(this.style[s], 10);
                    if (dir === 'L') {
                        l -= that.pSize;
                    } else {
                        l += that.pSize;
                    }
                    this.style[s] = l + 'px';
                });
                this.curX = tempX;
                this.curY = tempY;
            } else if (dir === 'D') {
                if (this.curY === 1 || this.time === this.maxTime) {
                    this.gameOver();
                    return false;
                }
                this.curComplete = true;
            }
        },
        rotate: function () {
            if (this.curShapeIndex !== 6) {
                var temp = [];
                this.curShape.eachdo(function () {
                    temp.push([this[1] * -1, this[0]]);
                });
                if (this.checkMove(this.curX, this.curY, temp)) {
                    this.curShape = temp;
                    this.removeCur();
                    this.drawShape(this.curX, this.curY, this.curShape);
                } else {
                    throw new Error("Could not rotate!");
                }
            }
        },
        checkMove: function (x, y, p) {
            if (this.isOB(x, y, p) || this.isCollision(x, y, p)) {
                return false;
            }
            return true;
        },
        isCollision: function (x, y, p) {
            var bool = false,
                newX,
                newY,
                that = this;
            p.eachdo(function () {
                newX = this[0] + x;
                newY = this[1] + y;
                if (that.boardPos(newX, newY) === 1) {
                    bool = true;
                }
            });
            return bool;
        },
        isOB: function (x, y, p) {
            var bool = false,
                h = this.boardHeight - 1,
                w = this.boardWidth - 1,
                newX,
                newY;
            p.eachdo(function () {
                newX = this[0] + x;
                newY = this[1] + y;
                if (newX < 0 || newX > w || newY < 0 || newY > h) {
                    bool = true;
                }
            });
            return bool;
        },
        getRowState: function (y) {
            var c = 0,
                x;
            for (x = 0; x < this.boardWidth; x += 1) {
                if (this.boardPos(x, y) === 1) {
                    c = c + 1;
                }
            }
            if (c === 0) {
                return 'E';
            }
            if (c === this.boardWidth) {
                return 'F';
            }
            return 'U';
        },
        checkRows: function () {
            var c = 0,
                n = 0,
                stopCheck = false,
                start = this.boardHeight,
                that = this,
                y;
                //memo = 0,
                //checks = (function () {
                //    that.curShape.eachdo(function () {
                //        if ((this[1] + that.curY) > memo) {
                //            return this[1];
                //        }
                //    });
                //});
                //console.log(checks);
            this.curShape.eachdo(function () {
                n = this[1] + that.curY;
                console.log(n);
                if (n < start) {
                    start = n;
                }
            });
            console.log(start);
            for (y = this.boardHeight - 1; y >= 0; y -= 1) {
                switch (this.getRowState(y)) {
                case 'F':
                    this.removeRow(y);
                    c += 1;
                    break;
                case 'E':
                    if (c === 0) {
                        stopCheck = true;
                    }
                    break;
                case 'U':
                    if (c > 0) {
                        this.shiftRow(y, c);
                    }
                    break;
                default:
                    break;
                }
                if (stopCheck === true) {
                    break;
                }
            }
            if (c > 0) {
                this.calcScore({lines: c});
            }
        },
        shiftRow: function (y, amount) {
            var x,
                that = this;
            for (x = 0; x < this.boardWidth; x += 1) {
                this.sqs.eachdo(function () {
                    if (that.isAt(x, y, this)) {
                        that.setBlock(x, y + amount, this);
                    }
                });
            }
            that.emptyBoardRow(y);
        },
        emptyBoardRow: function (y) {
            var x;
            for (x = 0; x < this.boardWidth; x += 1) {
                this.markBoardAt(x, y, 0);
            }
        },
        removeRow: function (y) {
            var x;
            for (x = 0; x < this.boardWidth; x += 1) {
                this.removeBlock(x, y);
            }
        },
        removeBlock: function (x, y) {
            var that = this;
            this.markBoardAt(x, y, 0);
            this.sqs.eachdo(function (i) {
                if (that.getPos(this)[0] === x && that.getPos(this)[1] === y) {
                    that.canvas.removeChild(this);
                    that.sqs.splice(i, 1);
                }
            });
        },
        setBlock: function (x, y, block) {
            this.markBoardAt(x, y, 1);
            var newX = x * this.pSize,
                newY = y * this.pSize;
            block.style.left = newX + 'px';
            block.style.top = newY + 'px';
        },
        isAt: function (x, y, block) {
            if (this.getPos(block)[0] === x && this.getPos(block)[1] === y) {
                return true;
            }
            return false;
        },
        getPos: function (block) {
            var p = [];
            p.push(parseInt(block.style.left, 10) / this.pSize);
            p.push(parseInt(block.style.top, 10) / this.pSize);
            return p;
        },
        getBoardIdx: function (x, y) {
            return x + (y * this.boardWidth);
        },
        boardPos: function (x, y) {
            return this.board[x + (y * this.boardWidth)];
        },
        markBoardAt: function (x, y, val) {
            this.board[this.getBoardIdx(x, y)] = val;
        },
        markBoardShape: function (x, y, p) {
            var that = this,
                newX = 0,
                newY = 0;
            p.eachdo(function (i) {
                newX = p[i][0] + x;
                newY = p[i][1] + y;
                that.markBoardAt(newX, newY, 1);
            });
        },
        isIE: function () {
            return this.bTest(/IE/);
        },
        isFireFox: function () {
            return this.bTest(/Firefox/);
        },
        isSafari: function () {
            return this.bTest(/Safari/);
        },
        bTest: function (rgx) {
            return rgx.test(navigator.userAgent);
        },
      //debug: function () { //
      //var that = this, //
        //  str = "";      //  
        //  for(var i = 0; i < that.board.length; i++) { //
        //      if (i % that.boardWidth === 0) { //
        //          if (that.board[i] === 1) { //
        //              str += 'X'; //
        //      } else {
        //          str += "&nbsp; * &nbsp;"; 
        //      }
        //      var par = document.createElement('p');
        //      par.innerHTML = str;
        //      that.boardVid.appendChild(par);
      //}, //
    };
    TETRIS.init()
}());


