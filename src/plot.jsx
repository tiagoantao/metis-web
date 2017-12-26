//import * as d3 from 'd3'  //XXX remove?
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
  vl_json.width = width
  vl_json.height = width
  const vg_spec = vg.parse(vl.compile(vl_json).spec)

  const view = new vg.View(vg_spec)
  view.renderer('canvas')
  const id_ = document.querySelector(id)
  view.initialize(id_)
  view.insert('lines', points)
  view.run()

  return view
}


const update_plot = (view, points, cb) => {
  view.insert('lines', points).run()
}

const clean_plot = (view) => {
  view.remove('lines', _ => true).run()
}


export const Plot = (where, sources) => {
  const dom = sources.DOM
  const vals$ = sources.vals

  let view = null

  let max_cycle = -1 // XXX state

  dom.select(where).elements().take(1).subscribe(x => {
    view = prepare_plot(plot_spec, where, 500)
  })

  const state$ = vals$
    .map(val => {
      return val.map(p => {return {x: p.x, y: p.y, marker: p.marker}})
    })

  state$.subscribe(poses => {
    let points = []
    for (let x_point of poses) {
      if (x_point.x < max_cycle) {
	console.log(2222, x_point)
	clean_plot(view)
      }
      max_cycle = x_point.x

      points.push(x_point)
    }
    if (view) {
      update_plot(view, points, a => console.log(123, a))
    }
  })

  /*
  const vdom$ = state$.map(state =>
    <div id="vega"></div>
  )
  */

  const sinks = {
    update: state$.startWith(null)
  }
  
  return sinks
}
