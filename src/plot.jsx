import * as d3 from 'd3'  //XXX remove?
import * as vg from 'vega'
import * as vl from 'vega-lite'


const plot_spec =`{
  "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
  "description": "ExpHe over cycles",
  "data": {
    "name": "lines"
  },
  "mark": "line",
  "encoding": {
    "x": {"field": "x", "type": "quantitative", "bandSize": "fit"},
    "y": {"field": "y", "type": "quantitative"},
    "color": {"field": "marker", "type": "nominal"}
  }
}`

const prepare_plot = (vl_text, id, width, points, cb) => {
  const vl_json = JSON.parse(vl_text)
  console.log(3333)
  vl_json.width = width
  vl_json.height = width
  const vg_spec = vg.parse(vl.compile(vl_json).spec)

  console.log(vl.compile(vl_json).spec)
  const view = new vg.View(vg_spec)
  view.renderer('canvas')
  const id_ = document.querySelector(id)
  view.initialize(id_)
  view.insert('lines', points)
  view.run()

  return view
}


const update_plot = (view, points, cb) => {
  view.insert('lines', points)
  view.run()

}


export const Plot = (where, sources) => {
  const dom = sources.DOM
  const props$ = sources.props


  let view = null

  const points = [] // Make a driver here...

  console.log(where, 999999)
  dom.select(where).elements().take(1).subscribe(x => {
    view = prepare_plot(plot_spec, where, 500, (a) => console.log(123, a))
  })
  
  const state$ = props$
    .map(props => {
      console.log('qwerty', props)
      return props.map(p => {return {x: p.x, y: p.y, marker: p.marker}})
    })

  state$.subscribe(poses => {
    for (let x_points of poses) points.push(x_points)
    console.log('azerty', points)
    if (view) {
      update_plot(view, points, a => console.log(123, a))
    }
  })
 
  const vdom$ = state$.map(state =>
    <div id="vega">adasdsd</div>
  )

  const sinks = {
    DOM: vdom$
  }
  
  return sinks
}
