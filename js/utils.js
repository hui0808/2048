const e = sel => document.querySelector(sel)

const es = sel => document.querySelectorAll(sel)

const log = console.log.bind(console)

const bindAll = function(sel, eventName, callback) {
    let e = es(sel)
    for (let input of e) {
        input.addEventListener(eventName, function(event) {
            callback(event)
        })
    }
}

const bindEventDelegate = function(sel, eventName, responseClass, callback) {
    let element = e(sel)
    let retFunc = event => {
        let self = event.target
        if (self.classList.contains(responseClass)) {
            callback(event)
        }
    }
    element.addEventListener(eventName, retFunc)
    return retFunc
}

const ensure = function(condition, message) {
    // 在条件不成立的时候, 输出 message
    if (!condition) {
        log('*** 测试失败', message)
    } else {
        log('*** 测试成功')
    }
}

const isArray = function(o) {
    // 判断对象是否为数组
    return Array.isArray(o)
}

const isSubset = function(a, b) {
    // 检查是否 a 中的每个元素都在 b 中出现
    for (let i = 0; i < a.length; i++) {
        if (!b.includes(a[i])) {
            return false
        }
    }
    return true
}

const arrayEquals = function(a, b) {
    // 递归版数组判断，可以判断任意维度的数组是否相等
    if (a.length !== b.length) {
        return false
    }
    for (let i = 0; i < a.length; i++) {
        if (isArray(a[i]) && isArray(b[i])) {
            if (!arrayEquals(a[i], b[i])) {
                return false
            }
        } else if (!Object.is(a[i], b[i])) {
            return false
        }
    }
    return true
}

const clonedArray = function(array) {
    return array.slice(0)
}

const clonedSquare = function(array) {
    let clone = []
    for (let i = 0; i < array.length; i++) {
        clone.push(clonedArray(array[i]))
    }
    return clone
}

function ranint(n, m) {
    let r = Math.floor(Math.random() * (m - n) + n);
    return r;
}

const zeros = function(x, y) {
    let r = []
    for (let i = 0; i < x; i++) {
        let tmp = []
        for (let j = 0; j < y; j++) {
            tmp.push(0)
        }
        r.push(tmp)
    }
    return r
}

const imageFromPath = function(path) {
    let img = new Image()
    img.src = path
    return img
}
