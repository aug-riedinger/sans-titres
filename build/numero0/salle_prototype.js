/********************************************************

Il faut enlever les commentaires à ce fichier et le renommer en .json pour le rendre utilisable.

Voici la signification de chaque champs :

********************************************************/

{
    "id": 1, // numéro de la pièce, doit être unique et se référer au plan
    "name": "Room 1", // Peu utilisé
    "position" : { // Coordonnées par rapport au plan du point en bas à gauche de la pièce
      "x": 20,
      "z": 0
    },
    "adj": [2], // Liste des ID des pièces "adjacentes" : ce sont celles qui sont chargées lorsque l'on pénètre dans la pièce en cours.
    "map" : [ // Map de la pièce Cf. ci-dessous pour une explication de chaque case
    "|.,.,.-a+.",
    "|.,.,.,.!.",
    "|b,.,.,.!c",
    "|.,.,.,.!.",
    "%._._@_.¤."
    ],
    "arts" : [ // Liste des oeuvres dans la pièce.
    {
        "id": "a", // Point d'ancrage sur la carte. Doit être une lettre.
        "side": "-", // S'il y a ambiguité sur le mur porteur, il est précisé ici (haut: - bas: _ gauche: | droite: ! )
        "type" : "text", // Type de l'oeuvre (pour savoir comment l'afficher lorsqu'on clique dessus. Peut être text, image, video ou monolythe)
        "width" : 800, // Dimensions en pixel non projetés (=> l'oeuvre affichée doit avoir au moins ces dimensions, et idéalement les avoir exactement)
        "height" : 368,
        "x": 500, // Permet de décaler l'oeuvre par rapport à sa position par défaut : si une case fait 1000px, donc 500 décale d'une demi case vers l'est
        "y": -200, // Remonte de 200px l'oeuvre
        "z": 0 // Décale de 0 pixels l'oeuvre vers le nord
        "thumb" : "salle1/titre.png", // L'image qui s'affiche DANS le musée (hors vu visualisation d'oeuvre)
        "src" : "salle1/lafindumonde.html", // Le contenu qui s'affiche lorsqu'on clique sur l'oeuvre (ici une page html)
        "info" : { // La description qui apparait en bas à droite lorsqu'on clique sur l'oeuvre
            "artiste" : "",
            "titre" : "La fin du monde vs les nouveaux mondes",
            "description": ""
        },
        "noMenu": true // Si true, l'oeuvre est ignorée lors de la génération de artList.json, qui sert au menu.
    },
    {
        "id": "b",
        "type" : "image",
        "width" : 3072,
        "height" : 2049,
        "y": -600,
        "thumb" : "salle8/gmusset/gmusset4_1024x683.jpg",
        "src" : "salle8/gmusset/gmusset4_1024x683.jpg",  
        "info" : {
            "artiste" : "Guillaume Musset",
            "titre" : "sans titre",
            "ensemble" : "série + - ∞",
            "description": "photographie"
        }
    }
    ]
}

/********************************************************
Explications de la map :

Chaque pièce est décomposée en carreaux élémentaires (selon le plan du musée) :

Un carreau est représenté par deux charactères. Le premier indique les murs présents sur la case, le second les oeuvres.

Liste des possibilités de murs : (les caractères ont été choisis pour être à peu près explicites)

,.  =  pas de mur, case vide au milieu d'une pièce
#.  =  Mur de gauche et mur en haut
+.  =  Mur de droite et mur en haut
¤.  =  Mur de droite et mur en bas
%.  =  Mur de gauche et mur en bas
|.  =  Mur de gauche
-.  =  Mur en haut
!.  =  Mur de droite
_.  =  Mur en bas

Ainsi, si c'est clair, voici comment je crée une salle carré à 4 cases :

"map": [
"#.+."
"%.¤."
]

Ou encore une salle à 9 cases :

"map": [
"#.-.+."
"|.,.!."
"%._.¤."
]

Et si je veux que cette salle soit ouverte en haut :

"map": [
"|.,.!."
"|.,.!."
"%._.¤."
]

etc.

Ensuite, on ancre les oeuvres sur les cases en remplaçant le second . par la lettre id de l'oeuvre.

Ex:

"arts" : [
    {
        "id": "b",
        "type" : "image",
        // etc.
    }
]

"map": [
"|.,.!."
"|.,.!b"  <-------- L'oeuvre b est placée sur le mur de droite
"%._.¤."
]

Enfin, on peut (optionnellement) rajouter un @ pour définir le point de départ dans une pièce.


********************************************************/