import Rx from 'rxjs/Rx'
import {nav} from '@cycle/dom'

import {makeMetisDriver} from './metis_driver'

import {SimpleApp} from './simple'
import {SelectionApp} from './selection'

const uikit_template =
  nav({attrs:{className:"uk-navbar-container", "uk-navbar": 1}},
      <div className="uk-navbar-left">

        <ul className="uk-navbar-nav">
          <li className="uk-active"><a href="index.html">Metis</a></li>
          <li><a href="#">Simple</a>
	    <div className="uk-navbar-dropdown">
	      <ul className="uk-nav uk-navbar-dropdown-nav">
                <li><a href="#" id="menu-single">Single</a></li>
                <li><a href="#" id="menu-selection">Selection</a></li>
	      </ul>
            </div>
	  </li>
	  <li><a href="#">Fluctuations</a>
	    <ul className="uk-nav uk-navbar-dropdown-nav">
              <li><a href="#" id="menu-decline">Decline</a></li>
	    </ul>

	  </li>
	  <li><a href="#">Selection</a>
	    <ul className="uk-nav uk-navbar-dropdown-nav">
              <li><a href="#" id="menu-decline">Decline</a></li>
	    </ul>

	  </li>
	  <li><a href="#">Structure</a>
	    <ul className="uk-nav uk-navbar-dropdown-nav">
              <li><a href="#">Island</a></li>
	      <li><a href="#">Stepping-stone 1D</a></li>
              <li><a href="#">Stepping-stone 2D</a></li>
	    </ul>

	  </li>

        </ul>

      </div>
  )


export const App = (sources) => {
  const single_menu$ = sources.DOM.select('#menu-single').events('click')
                              .startWith({timeStamp: -1,
					  srcElement: {id: 'menu-single'}})

  const selection_menu$ = sources.DOM.select('#menu-selection').events('click')
			         .startWith({timeStamp: -1,
					     srcElement: {id: 'menu-selection'}})


  const recent_event$ = Rx.Observable.combineLatest(
    single_menu$, selection_menu$)
			  .map(entries => {
			    var ts = -10
			    var id = ""
			    for (var entry of entries) {
			      if (entry.timeStamp > ts) {
				ts = entry.timeStamp
				id = entry.srcElement.id
			      }
			    }
			    return id
			  })

  const single_pop = SimpleApp({DOM: sources.DOM, metis: sources.metis})
  const sp_dom$ = single_pop.DOM
  const selection_pop = SelectionApp({DOM: sources.DOM, metis: sources.metis})
  const sel_dom$ = selection_pop.DOM

  const vdom$ = Rx
    .Observable.combineLatest(recent_event$, sp_dom$, sel_dom$)
    .map(arr =>
      <div>
	{uikit_template}
        <div style={arr[0] === 'menu-single' ? 'display: none' : 'display: block'}>
	  {arr[1]}
        </div>
        <div style={arr[0] === 'menu-selection' ? 'display: none' : 'display: block'}>
	  {arr[2]}
        </div>
      </div>
    )

  const sinks = {
    DOM: vdom$,
    metis: Rx.Observable.merge(selection_pop.metis, single_pop.metis)
  }
  
  return sinks
}
