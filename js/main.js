class GameObject {
    constructor() {
        this.events = []
    }

    static new(...args) {
        return new this(...args)
    }

    init() {
    }

    update() {
    }

    debug() {
    }

    listener(element, type, callback) {
        this.events.push([element, type, callback])
        element.addEventListener(type, callback)
    }

    destory() {
        for (let [element, type, callback] of this.events) {
            element.removeEventListener(type, callback)
        }
    }
}

class Game extends GameObject {
    constructor() {
        super()
        this.fps = 30
        this.scene = null
        this.runWithScene(Scene)
    }

    static instance(...args) {
        this.i = this.i || new this(...args)
        return this.i
    }

    // update
    update() {
        this.scene.update()
    }

    runloop() {
        this.update()

        setTimeout(() => {
            this.runloop()
        }, 1000 / this.fps)
    }

    runWithScene(scene) {
        this.scene = scene.new(this)
        setTimeout(() => {
            this.runloop()
        }, 1000 / this.fps)
    }

    replaceScene(scene, callback) {
        let s = scene.new(this)
        callback && callback(s)
        this.scene.destory()
        delete this.scene
        this.scene = s
    }
}


class Grid extends GameObject {
    constructor(game, num, x, y, isNew = false, isMerged = false) {
        super()
        this.game = game
        this.num = num
        this.x = x
        this.y = y
        this.isNew = isNew
        this.isMerged = isMerged
    }

    static randomNew(game, x, y) {
        let ratio = 0.1
        let r = Math.random()
        let grid
        if (r < ratio) {
            grid = Grid.new(game, 4, x, y, true)
        } else {
            grid = Grid.new(game, 2, x, y, true)
        }
        grid.add()
        return grid
    }

    merged(x, y) {
        let grid = Grid.new(this.game, this.num * 2, x, y, false, true)
        this.game.removeGrids.push(this)
        this.game.removeGrids.push(this.game.grids[x][y])
        this.game.grids[x][y] = grid
        grid.add()
    }

    add() {
        let element = e('#id-grid')
        let a
        if (this.isNew) {
            a = 'grid-new'
        } else if (this.isMerged) {
            a = 'grid-merged'
        } else {
            a = ''
        }
        let html = `
            <div class="grid num${this.num} ${a} position-${this.x}-${this.y}"
            data-x="${this.x}" data-y="${this.y}">
                <div class="grid-inner">${this.num}</div>
            </div>
        `
        element.insertAdjacentHTML('beforeend', html)
    }

    remove() {
        let element = e(`.position-${this.x}-${this.y}`)
        element.remove()
    }

    moveTo(x, y) {
        this.game.grids[this.x][this.y] = null
        this.game.grids[x][y] = this
        let class_ = `position-${this.x}-${this.y}`
        let element = e('.' + class_)
        element.classList.replace(class_, `position-${x}-${y}`)
        element.dataset.x = x
        element.dataset.y = y
        this.x = x
        this.y = y
    }

    moveLeft() {
        let x = this.x
        let y = this.y - 1
        for (; y >= 0; y--) {
            let grid = this.game.grids[x][y]
            if (grid !== null) {
                if (grid.num === this.num && !grid.isMerged) {
                    this.moveTo(x, y)
                    this.merged(x, y)
                } else {
                    this.moveTo(x, y + 1)
                }
                return
            }
        }
        this.moveTo(x, 0)
    }

    moveRight() {
        let x = this.x
        let y = this.y + 1
        for (; y < this.game.y; y++) {
            let grid = this.game.grids[x][y]
            if (grid !== null) {
                if (grid.num === this.num && !grid.isMerged) {
                    this.moveTo(x, y)
                    this.merged(x, y)
                } else {
                    this.moveTo(x, y - 1)
                }
                return
            }
        }
        this.moveTo(x, this.game.y - 1)
    }

    moveUp() {
        let x = this.x - 1
        let y = this.y
        for (; x >= 0; x--) {
            let grid = this.game.grids[x][y]
            if (grid !== null) {
                if (grid.num === this.num && !grid.isMerged) {
                    this.moveTo(x, y)
                    this.merged(x, y)
                } else {
                    this.moveTo(x + 1, y)
                }
                return
            }
        }
        this.moveTo(0, y)
    }

    moveDown() {
        let x = this.x + 1
        let y = this.y
        for (; x < this.game.x; x++) {
            let grid = this.game.grids[x][y]
            if (grid !== null) {
                if (grid.num === this.num && !grid.isMerged) {
                    this.moveTo(x, y)
                    this.merged(x, y)
                } else {
                    this.moveTo(x - 1, y)
                }
                return
            }
        }
        this.moveTo(this.game.x - 1, y)
    }
}

class Scene
    extends GameObject {
    constructor(game) {
        super()
        this.game = game
        this.grids = null
        this.x = 4
        this.y = 4
        this.winNum = 2048
        this.removeGrids = []

        this.initGrids()
        this.initHtml()
        this.createGrid()
        this.createGrid()
        this.register()
    }

    initGrids() {
        this.grids = []
        for (let i = 0; i < this.x; i++) {
            let tmp = []
            for (let j = 0; j < this.y; j++) {
                tmp.push(null)
            }
            this.grids.push(tmp)
        }
        log('init', this.grids)
    }

    getRest() {
        let r = []
        for (let i = 0; i < this.x; i++) {
            for (let j = 0; j < this.y; j++) {
                if (this.grids[i][j] === null) {
                    r.push([i, j])
                }
            }
        }
        return r
    }

    createGrid() {
        let array = this.getRest()
        let index = ranint(0, array.length)
        let [x, y] = array[index]
        let grid = Grid.randomNew(this, x, y)
        this.grids[x][y] = grid
    }

    getGridFromElement(element) {
        let x = parseInt(element.dataset.x)
        let y = parseInt(element.dataset.y)
        return this.grids[x][y]
    }

    initHtml() {
        e('#id-grid').innerHTML = ''
        let html = ''
        for (let i = 0; i < this.x; i++) {
            let rowHtml = ''
            for (let j = 0; j < this.y; j++) {
                rowHtml += `<div class="cell"></div>`
            }
            html += `<div class="row">${rowHtml}</div>`
        }
        let s = e('#id-map')
        s.innerHTML = html
    }

    moveLeft() {
        for (let i = 0; i < this.x; i++) {
            for (let j = 0; j < this.y; j++) {
                let grid = this.grids[i][j]
                if (grid !== null) {
                    grid.moveLeft()
                }
            }
        }
    }

    moveRight() {
        for (let i = 0; i < this.x; i++) {
            for (let j = this.y - 1; j >= 0; j--) {
                let grid = this.grids[i][j]
                if (grid !== null) {
                    grid.moveRight()
                }
            }
        }
    }

    moveUp() {
        for (let i = 0; i < this.y; i++) {
            for (let j = 0; j < this.x; j++) {
                let grid = this.grids[j][i]
                if (grid !== null) {
                    grid.moveUp()
                }
            }
        }
    }

    moveDown() {
        for (let i = 0; i < this.y; i++) {
            for (let j = this.x - 1; j >= 0; j--) {
                let grid = this.grids[j][i]
                if (grid !== null) {
                    grid.moveDown()
                }
            }
        }
    }

    clear() {
        for (let grid of this.removeGrids) {
            grid.remove()
        }
        this.removeGrids = []
        let mergeds = es('.grid-merged')
        for (let element of mergeds) {
            element.classList.remove('grid-merged')
            let grid = this.getGridFromElement(element)
            grid.isMerged = false
        }
        let news = es('.grid-new')
        for (let element of news) {
            element.classList.remove('grid-new')
            let grid = this.getGridFromElement(element)
            grid.isNew = false
        }
    }

    register() {
        this.listener(window, 'keydown', event => {
            let key = event.key
            if ('asdw'.includes(key)) {
                this.clear()
                let save = clonedSquare(this.grids)
                if (key === 'a') {
                    this.moveLeft()
                } else if (key === 'd') {
                    this.moveRight()
                } else if (key === 'w') {
                    this.moveUp()
                } else {
                    this.moveDown()
                }
                if (!arrayEquals(save, this.grids)) {
                    this.createGrid()
                }
            }
        })
    }

    update() {
        super.update()
        let title = es('.grid')
        for (let t of title) {
            if (t.innerText === String(this.winNum)) {
                log('win!')
                this.game.replaceScene(Win)
            }
        }
        let count = 0
        for (let i = 0; i < this.x; i++) {
            for (let j = 0; j < this.y; j++) {
                if (this.grids[i][j] !== null) {
                    count++
                }
            }
        }
        if (count === this.x * this.y) {
            log('game over')
            this.game.replaceScene(GameOver)
        }
    }

    destory() {
        super.destory();
    }
}


class GameOver extends GameObject {
    constructor(game) {
        super();
        this.game = game
        this.element = e('#id-message')
        this.register()
    }

    register() {
        let html = `
            <p>Game Over!</p>
            <div id="id-restart">Try again!</div>
        `
        this.element.classList.add('message-show')
        this.element.innerHTML = html
        this.listener(this.element, 'click', event => {
            let target = event.target
            if (target.id === 'id-restart') {
                this.game.replaceScene(Scene)
            }
        })
    }

    destory() {
        super.destory();
        log('game over')
        this.element.innerHTML = ''
        this.element.classList.remove('message-show')
    }
}

// class GameOver extends GameObject {
//     constructor(game) {
//         super();
//         this.game = game
//         this.element = e('#id-result')
//         this.element.innerText = 'Game Over!'
//     }
//
//     destory() {
//         super.destory();
//         this.element.innerText = ' '
//     }
// }

class Win extends GameObject {
    constructor(game) {
        super();
        this.game = game
        this.element = e('#id-result')
        this.element.innerText = 'You Win!'
    }

    destory() {
        super.destory();
        this.element.innerText = ' '
    }
}

