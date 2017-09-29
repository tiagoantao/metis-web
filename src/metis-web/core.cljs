(ns metis-web.core
  "A web interface to Metis, the JavaScript population genetics simulator"
  {:author "Tiago Antao"}
  (:require [cljsjs.vega]
            [cljsjs.vega-lite]
            [cljsjs.d3]
            ))

(def spec "
{
  \"$schema\": \"https://vega.github.io/schema/vega-lite/v2.json\",
  \"description\": \"A simple bar chart with embedded data.\",
  \"data\": {
    \"values\": [
      {\"a\": \"A\",\"b\": 28}, {\"a\": \"B\",\"b\": 55}, {\"a\": \"C\",\"b\": 43},
      {\"a\": \"D\",\"b\": 91}, {\"a\": \"E\",\"b\": 81}, {\"a\": \"F\",\"b\": 53},
      {\"a\": \"G\",\"b\": 19}, {\"a\": \"H\",\"b\": 87}, {\"a\": \"I\",\"b\": 52}
    ]
  },
  \"mark\": \"bar\",
  \"encoding\": {
    \"x\": {\"field\": \"a\", \"type\": \"ordinal\"},
    \"y\": {\"field\": \"b\", \"type\": \"quantitative\"}
  }
}

")


(defn ^:export run
  [canvas-name]
  (set! (.-onload js/window)
        (let [jspec (.parse js/JSON spec)]
          
          (set! (.-width jspec) 600)
          (set! (.-heigth jspec) 600)
          (let [cspec (.-spec (.compile js/vl jspec))
                view (new js/vega.View (.parse js/vega cspec))
                renderer (.renderer view "canvas")]
            (.run (.initialize renderer "#vis"))
            ))))
