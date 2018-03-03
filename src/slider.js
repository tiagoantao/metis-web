import {br, div, input, p, span} from '@cycle/dom'


export const Slider = (sources, props) => {
    const DOM = sources.DOM.select(props.className)
    const conv = props.conv || parseInt
    const eq = (x) => x
    const print = props.print || eq

    const new_value$ = DOM
          .select('input')
          .events('input')
          .map(ev => conv(ev.target.value))
          .startWith(props.value)

    const vdom$ = new_value$
          .map(state =>
               div(props.className, {attrs: {style: 'text-align: center'}}, [
                   span('.label', [props.label]),
                   br(),
                   input({attrs: {className: '.slider', type:'range',
                                  style: 'width: 500px', step: props.step,
                                  min: props.min, max: props.max,
                                  value: state}}),
                   span([print(state)]),
               ])
              )

    const sinks = {
        DOM: vdom$,
        value: new_value$
    }

    return sinks
}
