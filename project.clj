(defproject metis-web "0.1.0-SNAPSHOT"
  :description "A web interface for the metis population genetics simulator"
  :url "http://github.com/tiagoantao/metis-web"
  :license {:name "GNU Affero General Public License (AGPL)"
            :url "https://www.gnu.org/licenses/agpl.html"}

  :dependencies [[org.clojure/clojure "1.8.0"]
                 [org.clojure/clojurescript "1.9.854"] ;671
                 [org.omcljs/om "1.0.0-alpha34"]]

  :plugins [[lein-figwheel "0.5.11"]
            [lein-codox "0.10.3"]
            [lein-cljsbuild "1.1.6"] ;:exclusions [[org.clojure/clojure]]]
            [lein-doo "0.1.7"]]

  :cljsbuild
  {:builds {
            :dev
            {:source-paths ["src"]

             :figwheel {;:on-jsload "metis-web.core/on-js-reload"
                        }

             :compiler {:main metis-web.core
                        :asset-path "js/compiled/out"
                        :output-to "resources/public/js/compiled/metis-web.js"
                        :output-dir "resources/public/js/compiled/out"
                        :source-map-timestamp true
                        :preloads [devtools.preload]
                        :language-in :ecmascript6
                        :npm-deps {:vega-lite "2.0.0-beta.10"
                                   :vega-embed "3.0.0-beta.19"
                                   }
                        :pretty-print false
                        :optimizations :none
                        :closure-warnings {:non-standard-jsdoc :off}
                        :static-fns true}}

                                        ;:test
                                        ;{:source-paths ["src" "test"]
                                        ; :compiler {:output-to "out/testable.js"
                                        ;            :main metis-web.runner 
                                        ;            :optimizations :none
                                        ;            }}}}

            }}


  :codox {
          :output-path "docs"
          :language :clojurescript
          :source-paths ["src"]
          :metadata {:doc/format :markdown}
          }


  :figwheel {
             :css-dirs ["resources/public/css"] ;; watch and update CSS
             :nrepl-port 7888
             ;:validate-config false
             }

  :profiles {:dev {:dependencies [[binaryage/devtools "0.9.2"]
                                 [figwheel-sidecar "0.5.11"]
                                 [com.cemerick/piggieback "0.2.1"]]
                  :source-paths ["src" "dev"]
                  :repl-options {:nrepl-middleware [cemerick.piggieback/wrap-cljs-repl]}
                  :clean-targets ^{:protect false} ["resources/public/js/compiled"
                                                    :target-path]}})
