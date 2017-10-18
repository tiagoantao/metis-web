cd static/
node build.js
cd ..

cp static/out/index.html resources/public/
mkdir -p resources/public/js/jquery-knob/dist
cp node_modules/jquery-knob/dist/jquery.knob.min.js resources/public/js/jquery-knob/dist
