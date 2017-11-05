import xs from 'xstream'
import {adapt} from '@cycle/run/lib/adapt'
import {sim_cycle} from '@tiagoantao/metis'

const stack = []
stack.listeners = []

stack.push = (elem) => {
    for (listener of listeners) {
	listener.call(event)
    }
}

const add_event (arr, e) => {
    stack.push = (elem) => {
	Array.prototype.push.call(stack, e)
    }
}

export const makeMetisDriver = (start_state$) => {
    start_state$.addListener({
	next: state => {stack.push(state)},
	error: () => {},
        complete: () => {}
    })

    const sim_state$ = xs.create({
	start: listener => {
	    stack.add_event(listner)
	    listener.next(new_state)
	},
	stop: () => {}
    })

    return adapt(sim_state$)
}
