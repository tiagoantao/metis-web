export let prepare_plot = (spec, id, width, cb) => {
    let jspec = JSON.parse(spec)
    jspec.width = width
    jspec.height = width * 0.5

    let source = JSON.stringify(jspec, null, 2)
    spec = vl.compile(jspec).spec
    let div = d3.select(id)
        .classed('vega-embed', true)
        .html('')

    vg.parse.spec(spec, {}, function(error, chart) {
      let view = chart({
        el: id,
        data: undefined,
        renderer: 'canvas'
      })

      view.update()
      cb(view)
    })
}


export let exphe_spec = `
{
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
