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
    // LIBRAIRIES
    'src/libs/jquery-1.8.3.min.js', // jQuery
    'src/libs/raphael-min.js', // Raphael.js, librairie permettant les animations du plan sur le menu
    'src/libs/jquery.fullscreen.js', // Plugin jQuery permettant de passer en plein écran
    'src/js/EasingInOut.js', // Librairie dévelopée par ce type : http://www.dhteumeuleu.com/ permettant les transitions douces de la caméra
    // SOURCES
    'src/js/Global.js', // Définition des variables globales
    'src/js/Screen.js', // Gestion de l'écran, écoute les redimensionnements etc.
    'src/js/Camera.js', // Gestion de la caméra : ses coordonnées 3D, ses méthodes de déplacement etc.
    'src/js/Cursor.js', // Gestion de la souris : écoute évènement de déplacement de la souris et déplace la caméra en conséquence
    'src/js/Keyboard.js', // Déplacements par le clavier. Sert à débugger mais désactivé en production.
    'src/js/Point.js', // Création de l'objet Point
    'src/js/Face.js', // Création de l'objet Face
    'src/js/Monolythe.js', // Spécifique au numéro 0 : Création du monolythe d'Edwin dans la salle 5 (4 faces un peu penchées)
    'src/js/Room.js', // Création d'une pièce, calcul sur les faces qui doivent être dessinées, sur les oeuvres à charger etc.
    'src/js/Renderer.js', // Ce qui est calculé à chaque Frame pour afficher chaque face et chaque oeuvre
    'src/js/Util.js', // Fonctions utilitaires
    'src/js/Main.js', // Boucle infini si MENU=false pour générer une nouvelle image à chaque 'AnimationFrame'
    'src/js/Menu.js', // Gestion du basculement Menu/Musée. A REECRIRE POUR UN NOUVEAU NUMERO
    'src/js/Sound.js', // Gestion des sons
    'src/js/Analytics.js' // Plugin Google Analytics
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
    // LIBRAIRIES
    'src/libs/jquery-1.8.3.min.js', // jQuery
    'src/libs/raphael-min.js', // Raphael.js, librairie permettant les animations du plan sur le menu
    'src/libs/jquery.fullscreen.js', // Plugin jQuery permettant de passer en plein écran
    'src/js/EasingInOut.js', // Librairie dévelopée par ce type : http://www.dhteumeuleu.com/ permettant les transitions douces de la caméra
    // SOURCES
    'src/js/Global.js', // Définition des variables globales
    'src/js/Screen.js', // Gestion de l'écran, écoute les redimensionnements etc.
    'src/js/Camera.js', // Gestion de la caméra : ses coordonnées 3D, ses méthodes de déplacement etc.
    'src/js/Cursor.js', // Gestion de la souris : écoute évènement de déplacement de la souris et déplace la caméra en conséquence
    'src/js/Point.js', // Création de l'objet Point
    'src/js/Face.js', // Création de l'objet Face
    'src/js/Monolythe.js', // Spécifique au numéro 0 : Création du monolythe d'Edwin dans la salle 5 (4 faces un peu penchées)
    'src/js/Room.js', // Création d'une pièce, calcul sur les faces qui doivent être dessinées, sur les oeuvres à charger etc.
    'src/js/Renderer.js', // Ce qui est calculé à chaque Frame pour afficher chaque face et chaque oeuvre
    'src/js/Util.js', // Fonctions utilitaires
    'src/js/Main.js', // Boucle infini si MENU=false pour générer une nouvelle image à chaque 'AnimationFrame'
    'src/js/Menu.js', // Gestion du basculement Menu/Musée. A REECRIRE POUR UN NOUVEAU NUMERO
    'src/js/Sound.js', // Gestion des sons
    'src/js/Analytics.js' // Plugin Google Analytics
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