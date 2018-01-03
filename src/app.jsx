import {nav} from '@cycle/dom'

import {makeMetisDriver} from './metis_driver'

import {SimpleApp} from './simple'

const uikit_template =
  nav({attrs:{className:"uk-navbar-container", "uk-navbar": 1}},
      <div className="uk-navbar-left">

        <ul className="uk-navbar-nav">
          <li className="uk-active"><a href="index.html">Metis</a></li>
          <li><a href="#">Learning</a>
	    <div className="uk-navbar-dropdown">
	      <ul className="uk-nav uk-navbar-dropdown-nav">
                <li className="uk-active" id="menu-single"><a href="#">Single</a></li>
                <li><a href="#">Island</a></li>
		<li><a href="#">Stepping-stone 1D</a></li>
                <li><a href="#">Stepping-stone 2D</a></li>
	      </ul>
            </div>
	  </li>
        </ul>

      </div>
  )


export const App = (sources) => {
  const single_menu$ = sources.DOM.select('#menu-single').events('click').
			       map(ev => console.log(123)).startWith(1)

  const single_pop = SimpleApp({DOM: sources.DOM, metis: sources.metis})
  const sp_dom$ = single_pop.DOM
  const vdom$ = sp_dom$.map(sp_dom =>
    <div>
      {uikit_template}
      <div id="single">
	{sp_dom}
      </div>
    </div>
  )

  const sinks = {
    DOM: vdom$,
    metis: single_pop.metis
  }
  
  return sinks
}
