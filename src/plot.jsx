import * as d3 from 'd3'  //XXX remove?
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


const prepare_plot = (spec, id, width, cb) => {
  const jspec = JSON.parse(spec)
  console.log(3333)
  jspec.width = width
  jspec.height = width * 0.5
  const vspec = vg.parse(jspec)
  
  //const source = JSON.stringify(jspec, null, 2)
  //spec = vl.compile(jspec).spec
  const view = new vg.View(vspec)
  view.renderer('canvas')
  const id_ = document.querySelector(id)
  console.log(1212, id_)
  view.initialize(id_)
  view.run()
}


export const Plot = (sources) => {
  const dom = sources.DOM
  const props$ = sources.props


  prepare_plot(exphe_spec, '#vega', 500, (a) => console.log(123, a))
  
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
