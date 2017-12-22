import {div, input, p, span} from '@cycle/dom'


export const Slider = (sources, props) => {
  const DOM = sources.DOM.select(props.class)
  const conv = props.conv || parseInt

  const new_value$ = DOM
    .select('input')
    .events('input')
    .map(ev => {console.log(123123123); return conv(ev.target.value)})
    .startWith(props.value)

  const vdom$ = new_value$
    .map(state =>
      div(props.class, [
	span('.label', [props.label]),
	input({attrs: {class: '.slider', type:'range',
		       style: 'width: 500px', step: props.step,
		       min: props.min, max: props.max, value: state}}),
	span([state]),
      ])
      /*      <div className="labeled-slider">
	 <span className="label">{props.label} {props.value} {state}</span>
	 <input type="range"
	 className="slider"
	 style="width: 500px"
	 min={props.min} max={props.max} value={state}>
	 </input>
	 </div>*/
    )

  const sinks = {
    DOM: vdom$,
    value: new_value$
  }

  return sinks
}
