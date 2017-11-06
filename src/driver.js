import xs from 'xstream'
import {adapt} from '@cycle/run/lib/adapt'
import {sim_cycle} from '@tiagoantao/metis'

const add_listener (arr, l) => {
    stack.push = (elem) => {
        Array.prototype.push.call(stack, l)
    }
}

export const makeMetisDriver = () => {
    const stack = []
    stack.listeners = []
    stack.push = (elem) => {
        for (listener of listeners) {
            listener.call(event)
        }
    }
     
    const metis_driver (in_state$) {
        in_state$.addListener({
            next: state => {stack.push(state)},
            error: () => {},
            complete: () => {}
        })

        const sim_state$ = xs.create({
            start: listener => {
            },
            stop: () => {}
        })

        return adapt(sim_state$)
    }

    return metis_driver
}
