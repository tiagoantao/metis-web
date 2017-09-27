(ns metis-web.core
  "A web interface to Metis, the JavaScript population genetics simulator"
  {:author "Tiago Antao"}
  (:require [vega :as vg]
            [vega-lite :as vl]
            [vega-embed :as ve]
            ))

(vl/unique [1 2 3] identity)
(vg/parse)
vl
ve
(enable-console-print!)

(comment
(defn ^:export run
  [canvas-name]
    (set! (.-onload js/window)
        (let [canvas (.getElementById js/document canvas-name)
              width (.-width canvas)
              height (.-height canvas)
              ctx (.getContext canvas"2d")]
          (.beginPath ctx)
          (.arc ctx 95 50 40 0 6.28)
          (.stroke ctx)
          ))

  (prn 2))
)

(def spec
"
\"$schema\": \"https://vega.github.io/schema/vega-lite/v2.0.json\",
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
"
)

(defn ^:export run
  [div-name]
  ;(.embed div-name spec)
  )
