var compressor = require('node-minify');

// Other compilers : 
// JS :
// yui-js
// uglifyjs
//
// CSS :
// yui-css

// Using Google Closure
new compressor.minify({
    type: 'no-compress',
    fileIn: [
    'src/libs/jquery-1.8.3.js',
    'src/libs/raphael-min.js',
    // 'src/libs/jquery.tinyscrollbar.js',
    'src/libs/jquery.fullscreen.js',
    'src/js/EasingInOut.js',
    'src/js/Global.js',
    'src/js/Screen.js',
    'src/js/Camera.js',
    'src/js/Cursor.js',
    'src/js/Keyboard.js',
    'src/js/Point.js',
    'src/js/Face.js',
    'src/js/Monolythe.js',
    'src/js/Room.js',
    'src/js/Renderer.js',
    'src/js/Util.js',
    'src/js/Main.js',
    'src/js/Sound.js',
    'src/js/Menu.js',
    'src/js/Analytics.js'
    ],
    fileOut: 'src/js/museum.js',
    callback: function(err){
        if(err) {
            console.log(err);
        } else {
            console.log('JS Packed');
        }
    }
});
new compressor.minify({
    type: 'gcc',
    fileIn: [
    'src/libs/jquery-1.8.3.min.js',
    'src/libs/raphael-min.js',
    // 'src/libs/jquery.tinyscrollbar.min.js',
    'src/libs/jquery.fullscreen.js',
    'src/js/EasingInOut.js',
    'src/js/Global.js',
    'src/js/Screen.js',
    'src/js/Camera.js',
    'src/js/Cursor.js',
    'src/js/Point.js',
    'src/js/Face.js',
    'src/js/Monolythe.js',
    'src/js/Room.js',
    'src/js/Renderer.js',
    'src/js/Util.js',
    'src/js/Main.js',
    'src/js/Menu.js',
    'src/js/Sound.js'
    ],
    fileOut: 'src/js/museum.min.js',
    callback: function(err){
        if(err) {
            console.log(err);
        } else {
            console.log('JS Minified');
        }
    }
});

// Using Sqwish for CSS
new compressor.minify({
    type: 'sqwish',
    fileIn: [
    'src/css/oswald.css',
    'src/css/menu.css',
    'src/css/main.css'
    ],
    fileOut: 'src/css/main.min.css',
    callback: function(err){
        if(err) {
            console.log(err);
        } else {
            console.log('CSS Minified');
        }
    }
});