import {table, td, tr} from '@cycle/dom'


export const Table = (sources, props) => {
    const DOM = sources.DOM
    const data$ = sources.data
    const fields = props.fields
    const headers = props.headers

    const vdom$ = data$
          .map(data => {
              return table(
                  {attrs: {style: 'border: 1px solid black; margin: auto'}},
                  [tr(headers.map(header => td(header)))].concat(
                      data.map(
                          row=>tr(fields.map(field => td(row[field]))))))
          })

    const sinks = {
        DOM: vdom$
    }

    return sinks
}
