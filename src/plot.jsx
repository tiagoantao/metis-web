import * as vg from 'vega'
import * as vl from 'vega-lite'


const exphe_spec =`{
  "description": "ExpHe over cycles",
  "data": {
    "values": []
  },
  "mark": "line",
  "encoding": {
    "x": {"field": "cycle", "type": "quantitative", "bandSize": "fit"},
    "y": {"field": "ExpHe", "type": "quantitative"},
    "color": {"field": "marker", "type": "nominal"}
  }
}`

/*
const prepare_plot(spec, id, width, cd) => {
  const jspec = JSON.parse(spec)
}
*/

export const Plot = (sources) => {
  const dom = sources.DOM
  const props$ = sources.props

  const state$ = props$
    .map(props => ({
      x: props.x,
      y: props.y
    }))

  const vdom$ = state$.map(state =>
    <div id="vega">
      bla bla bla {state.x}
    </div>
  )

  const sinks = {
    DOM: vdom$
  }
  
  return sinks
}
