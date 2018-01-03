import {div, input, p, span} from '@cycle/dom'


export const Slider = (sources, props) => {
  const DOM = sources.DOM.select(props.className)
  const conv = props.conv || parseInt

  const new_value$ = DOM
    .select('input')
    .events('input')
    .map(ev => conv(ev.target.value))
    .startWith(props.value)

  const vdom$ = new_value$
    .map(state =>
      div(props.className, [
	span('.label', [props.label]),
	input({attrs: {className: '.slider', type:'range',
		       style: 'width: 500px', step: props.step,
		       min: props.min, max: props.max, value: state}}),
	span([state]),
      ])
    )

  const sinks = {
    DOM: vdom$,
    value: new_value$
  }

  return sinks
}
