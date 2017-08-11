(ns metis-web.core
  "A web interface to Metis, the JavaScript population genetics simulator"
  {:author "Tiago Antao"}
  (:require vega-lite))

(enable-console-print!)

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
