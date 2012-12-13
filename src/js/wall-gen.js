var canvas2 = document.getElementById('text');
var contexte = canvas2.getContext('2d');

contexte.fillStyle = '#FFFFFF';
contexte.fillRect  (0,   0, canvas2.width, canvas2.height);  // now fill the canvas
contexte.fillStyle = '#000000';

contexte.beginPath();
contexte.moveTo(1,1);
contexte.lineTo(1,canvas2.height-1);
contexte.lineTo(canvas2.width-1,canvas2.height-1);
contexte.lineTo(canvas2.width-1,1);
contexte.strokeStyle = '#000000';
contexte.lineWidth = 2;
contexte.stroke();

var titre = "La fin du monde est une chance ! Profitez-en !";

var content = "D'autres diront qu'il s'agit d'une sentence terrible qui s'abat sur l'humanité. Et si on optait pour cette petite touche d'optimisme qui fait que tout est toujours plus beau chaque jour ?";

contexte.beginPath();
contexte.moveTo(170, 80);
contexte.font = "bold 24px Calibri";
contexte.textAlign = 'center';
contexte.fillText(titre, canvas2.width/2, 200);
contexte.font = "normal 14px Calibri";
contexte.textAlign = 'left';
wrapText(contexte, content, canvas2.width/2 - 150, 250, 300, 18);


 // var metrics = context.measureText(text);
 //      var width = metrics.width;

// contexte.strokeText('Hello', 100, 100);
// contexte.strokeStyle = '#000000';
// contexte.stroke();
