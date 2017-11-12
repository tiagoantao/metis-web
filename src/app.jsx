import Rx from 'rxjs/Rx'

export const App = (sources) => {
  const num_gens$ = sources.DOM.select('#num_gens')
    .events('change')
    .map(ev => parseInt(ev.target.value))
    .startWith(50)
    .subscribe(x => num_gens = x)

  let num_gens = 0

  const simulate$ = sources.DOM.select('#simulate')
    .events('click')
    .map(ev => parseInt(ev.target.value))
    .startWith(0)

  const test$ = simulate$.map(_num_gens => Rx.Observable.from([num_gens]))

  sources.metis.subscribe(x => console.log(x, 10))
  
  const vdom$ = simulate$.map(_num_gens =>
    <div>
      <div>
        <input type="number" id="num_gens" value="{num_gens}"/>
        <button id="simulate" value="1">Simulate</button>
      </div>
      <div>bla {String(num_gens)}
      </div>
    </div>      
      )

  const sinks = {
    DOM: vdom$,
    metis: test$
  }
  
  return sinks
}
