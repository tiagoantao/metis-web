import * as d3 from 'd3'  //XXX remove?
import * as vg from 'vega'
import * as vl from 'vega-lite'


const exphe_spec =`{
  "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
  "description": "ExpHe over cycles",
  "data": {
    "name": "bla"
  },
  "mark": "line",
  "encoding": {
    "x": {"field": "cycle", "type": "quantitative", "bandSize": "fit"},
    "y": {"field": "ExpHe", "type": "quantitative"},
    "color": {"field": "marker", "type": "nominal"}
  }
}`

const prepare_plot = (vl_text, id, width, cb) => {
  const vl_json = JSON.parse(vl_text)
  console.log(3333)
  vl_json.width = width
  vl_json.height = width
  const vg_spec = vg.parse(vl.compile(vl_json).spec)

  console.log(vl.compile(vl_json).spec)
  const view = new vg.View(vg_spec)
  view.renderer('canvas')
  const id_ = document.querySelector(id)
  console.log(1212, id_)
  view.initialize(id_)
  const values3 = [{cycle: 2, ExpHe: 0.4, marker:"M1"}, {cycle: 3, ExpHe: 0.8, marker:"M1"}]
  const values4 = [{cycle: 4, ExpHe: 0.4, marker:"M1"}, {cycle: 5, ExpHe: 0.8, marker:"M1"}]
  console.log(55, view.data('bla'), view._runtime.data.bla)
  view.insert('bla', values3)
  view.run()
  view.insert('bla', values4)
  console.log(55, view.data('bla'), view._runtime.data.bla)
  view.run()
}


export const Plot = (sources) => {
  const dom = sources.DOM
  const props$ = sources.props


  prepare_plot(exphe_spec, '#vegax', 500, (a) => console.log(123, a))
  
  const state$ = props$
    .map(props => ({
      x: props.x,
      y: props.y
    }))

  const vdom$ = state$.map(state =>
    <div id="vega"></div>
  )

  const sinks = {
    DOM: vdom$
  }
  
  return sinks
}
