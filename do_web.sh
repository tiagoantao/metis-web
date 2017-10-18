npm install
cd static/
node build.js
cd ..

cp static/out/index.html resources/public/

mkdir -p resources/public/js/jquery-knob/dist
cp node_modules/jquery-knob/dist/jquery.knob.min.js resources/public/js/jquery-knob/dist

mkdir -p resources/public/js/events
cp node_modules/events/events.js resources/public/js/events


mkdir -p resources/public/js/metis
cp "node_modules/@tiagoantao/metis/lib/metis/all.js" resources/public/js/metis
