import Rx from 'rxjs/Rx'

export const App = (sources) => {
  const num_gens$ = sources.DOM.select('#num_gens')
    .events('change')
    .map(ev => parseInt(ev.target.value))
    .startWith(50)

  const num_gens = 

  const simulate$ = sources.DOM.select('#simulate')
    .events('click')
    .map(ev => parseInt(ev.target.value))
    .startWith(0)

  const mrg = Rx.Observable.zip(num_gens$, simulate$)
    .subscribe(x => console.log(x))

  const vdom$ = simulate$.map(num_gens =>
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
    DOM: vdom$
  }
  
  return sinks
}
