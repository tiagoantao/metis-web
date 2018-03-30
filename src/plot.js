import {div} from '@cycle/dom'

import * as vg from 'vega'
import * as vl from 'vega-lite'


const plot_spec = conf => {
    const cf = Object.assign({}, conf)
    cf.desc = cf.desc || ''
    cf.title = cf.title || ''
    cf.x_label = cf.x_label || 'Cycles'
    cf.y_label = cf.y_label || ''
    return `
    {
        "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
        "description": "${cf.desc}",
        "title": "${cf.title}",
        "data": {
            "name": "lines"
        },
        "mark": "line",
        "encoding": {
            "x": {"field": "x",
                  "axis": {"title": "${cf.x_label}"},
                  "type": "quantitative",
                  "bandSize": "fit"},
            "y": {"field": "y",
                  "axis": {"title": "${cf.y_label}"},
                  "type": "quantitative"},
            "color": {"field": "marker", "type": "nominal"}
        }
    }`}


const prepare_plot = (vl_text, conf, points, cb) => {
    const vl_json = JSON.parse(vl_text)
    vl_json.width = conf.width || 600
    vl_json.height = vl_json.width - vl_json.width / 4
    const vg_spec = vg.parse(vl.compile(vl_json).spec)

    const view = new vg.View(vg_spec)
    view.renderer('canvas')
    
    const id_ = document.querySelector('#' + conf.id)
    view.initialize(id_)
    view.insert('lines', points)
    view.run()

    return view
}


const update_plot = (view, points) => {
    view.insert('lines', points).run()
    //document.getElementById('vega').style.display = 'none'
}


const clean_plot = (view) => {
    view.remove('lines', _ => true).run()
}


export const Plot = (conf, sources) => {
    const where = conf.id
    const clean = conf.clean === undefined ? true : conf.clean
    const dom = sources.DOM
    const vals$ = sources.vals.startWith([])

    let view = null

    let max_cycle = -1 // XXX state

    dom.select('#' + where).elements().take(1).subscribe(x => {
        view = prepare_plot(plot_spec(conf), conf)
    })

    const state$ = vals$
          .map(val => {
              return val.map(p => {return {x: p.x, y: p.y, marker: p.marker}})
          })

    state$.subscribe(poses => {
        let points = []
        for (let x_point of poses) {
            if (x_point.x < max_cycle && clean) {
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

    const vdom$ = state$.map(state => div(
        {attrs: {
            id: conf.id,
            style: 'margin: auto'
        }}))

    const sinks = {
        update: state$.startWith(null),
        DOM: vdom$
    }
    
    return sinks
}
