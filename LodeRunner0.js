// LodeRunner0.js - AMD/2020
// You are not allowed to change ths file.

// MISCELLANEOUS FUNCTIONS

function rand(n) {		// random number generator
	return Math.floor(Math.random() * n);
}

function distance(x1, y1, x2, y2) {
	let distx = Math.abs(x1 - x2);
	let disty = Math.abs(y1 - y2);
	return Math.ceil(Math.sqrt(distx*distx + disty*disty));
}

function mesg(m) {
	return alert(m);
}

function fatalError(m) {
	mesg("Fatal Error: " + m + "!");
	throw "Fatal Error!";
}

function div(a, b) {		// integer division
	return Math.floor(a/b);
}


// GAME CONSTANTS

const ANIMATION_EVENTS_PER_SECOND = 8;


// GAME IMAGES

const ACTOR_PIXELS_X = 18;
const ACTOR_PIXELS_Y = 17;

class GameImages {
	static loadOne(name)
	{
		GameImages.loading++;
		let im = new Image();
		GameImages[name] = im;
		im.src = GameImages.prefix + name + ".png";
		im.onload =
			function() { if( --GameImages.loading == 0 ) GameImages.next(); }	
	}	
	static loadAll(next) {
		GameImages.prefix =
			"http://ctp.di.fct.unl.pt/miei/lap/projs/proj2020-3/files/images/"
		// GameImages.prefix = "images/"		// allows offline working
 		GameImages.next = next;  // next is the action to start after loading
		GameImages.loading = 0;
  		GameImages.loadOne("brick"); 
		GameImages.loadOne("chimney"); 
		GameImages.loadOne("empty"); 
		GameImages.loadOne("gold"); 
		GameImages.loadOne("hero_falls_left"); 
		GameImages.loadOne("hero_falls_right"); 
		GameImages.loadOne("hero_on_ladder_left"); 
		GameImages.loadOne("hero_on_ladder_right"); 
		GameImages.loadOne("hero_on_rope_left"); 
		GameImages.loadOne("hero_on_rope_right"); 
		GameImages.loadOne("hero_runs_left"); 
		GameImages.loadOne("hero_runs_right"); 
		GameImages.loadOne("hero_shoots_left"); 
		GameImages.loadOne("hero_shoots_right"); 
		GameImages.loadOne("invalid"); 
		GameImages.loadOne("ladder"); 
		GameImages.loadOne("robot_falls_left"); 
		GameImages.loadOne("robot_falls_right"); 
		GameImages.loadOne("robot_on_ladder_left"); 
		GameImages.loadOne("robot_on_ladder_right"); 
		GameImages.loadOne("robot_on_rope_left"); 
		GameImages.loadOne("robot_on_rope_right"); 
		GameImages.loadOne("robot_runs_left"); 
		GameImages.loadOne("robot_runs_right"); 
		GameImages.loadOne("rope"); 
		GameImages.loadOne("stone");
	}
}

// GAME FACTORY

class GameFactory {
	static actorFromCode(code, x, y) {
		switch( code ) {
			case 't': return new Brick(x, y);
			case 'T': return new Chimney(x, y);
			case '.': return new Empty();
			case 'o': return new Gold(x, y);
			case 'h': { hero = new Hero(x, y); return hero; }
			case 'e': { let a = new Ladder(x, y); a.makeVisible(); return a; }
			case 'E': return new Ladder(x, y);
			case 'r': return new Robot(x, y);
			case 'c': return new Rope(x, y);
			case 'p': return new Stone(x, y);
			default: return new Invalid(x, y);
		}
	}
}

// GAME MAPS

const WORLD_WIDTH = 28;
const WORLD_HEIGHT = 16;

const MAPS = Object.freeze([
[
	"..................E.........",
	"....o.............E.........",
	"tptptptettttttt...E.........",
	".......eccccccccccE....o....",
	".......e....tte...tttttttett",
	".......e....tte..........e..",
	".....r.e....tte.......or.e..",
	"ttettttt....ttttttttettttttt",
	"..e.................e.......",
	"..e...........r.....e.......",
	"tttttttttetttttttttte.......",
	".........e..........e.......",
	".......o.ecccccccccce...o...",
	"....etttttt.........ttttttte",
	"....e.........h..o.........e",
	"tttttttttttttttttttttttttttt"
], [
	"...o.......................e",
	"epptppe...........o........e",
	"e.....e....ettttttttte.o...e",
	"e.o.r.e....e.........ettttTe",
	"etptpte....e.........e.....E",
	"e.....eccccecccccc..re.....E",
	"e.....e....e.....etttppppppe",
	"e.....e....e..o..e.........e",
	"e...r.e.o..ettttte.........e",
	"ptttpttpttpe.........etttett",
	"ptttp......e.........e...e..",
	"po..p......e...cccccce...e.o",
	"ttttttttetttpppp.....e..tttt",
	"........e............e......",
	"........e...h........e......",
	"tttttttttttttttttttttttttttt"
], [
	"...........................E",
	"cccccccccc....o............E",
	"e.o......etttttttttte......E",
	"ttttte...e..........eppppppp",
	".....e.r.e.....o....e.......",
	".....ettttttetttttett.......",
	"..o..e......e.....e..cc.....",
	"ttttet......e..r..e....cc...",
	"....e....ettttttett......cco",
	"....ecccce......e..r.......t",
	"....e.......ettttttttte.....",
	"....e.......ettttttttte.....",
	"tttetttttttttt...o...tttttet",
	"tttetttttttttt.ettte.tttttet",
	"...e......h....ettte...o..e.",
	"tttttttttttttttttttttttttttt"
], [
	"E...........................",
	"Eccccccccccc................",
	"e.....e.....t.o.t.....e.....",
	"e.o..eee..o.ttttt.o..eee..o.",
	"e.ee..e..ee.......ee..e..ee.",
	"e.e.eeeee.e.......e.eeeee.e.",
	"e.e..oro..e...e...e..oro..e.",
	"e..ettttte...eee...ettttte..",
	"e...eeeee.ee..e..ee.eeeee...",
	"e.........e.eeeee.e.........",
	"e....o....e..oro..e.....o...",
	"etttttte...ettttte..ettttttt",
	"e......e....eeeee...e.......",
	"e......e............e.......",
	"e......e.......o..h.e.......",
	"tttttttttttttttttttttttttttt"
], [
	".........E..................",
	".........E.......o......r...",
	"ttt......E......ttttettttttt",
	"..tt.....E.....tt...e.......",
	"...tt....E....tt....e.......",
	"or.ttt...E..ottt....e...o...",
	"ttetttt..E..ttttetttettttttt",
	"..e...tt.E.tt...e...........",
	"..eor..ttett....e.....o.....",
	"ettte....e.....tettettt.....",
	"e...e..............e........",
	"e...e....o.....r...e........",
	"e...etttttttettttttetttttett",
	"e...........e............e..",
	"e...........e..h.........e..",
	"tttttttttttttttttttttttttttt"
], [
	"ppppppppppppppppttEtttpppttt",
	"t.o...............Et.r.o...t",
	"tTtttetttte...o...Etttttttet",
	"tTtttetttttttttttttt.ttt..et",
	"t....e..o.r.....tttt.ttt..et",
	"tetttttttttetttttttt.ttt..et",
	"te...ttttttetttttoot.ttto.et",
	"te...ttttttettttttttttttttet",
	"te...t....oe....o..r...o.tet",
	"te...tttetttttttetttttttetet",
	"te..ottte.......etttttttetet",
	"tettTt..e....h..e..tt...etet",
	"tettTtetttttettttttttoo.etet",
	"tettTtetttttettttttottttttet",
	"ter...ettotte....o..r.....et",
	"tttttttttttttttttttttttttttt"
], [
	"..E.........................",
	"..E.................cccccccc",
	"..E..........r......e......e",
	"tttttet....tettt...re....o.e",
	".....e......e....tttettttttt",
	"..r..e...o..e.......e.......",
	"tttttetttt..e.......e.......",
	".....e......e.......e.......",
	"..o..e...o..e.......e.......",
	"ttetttttttttttte....e.tttt.e",
	"..e............e.o..e.tttt.e",
	"..e..o.........ecccce.t.ot.e",
	"ttttttte............e.ttttte",
	".......e............e......e",
	".......e.h........o.e..r...e",
	"tttttttttttttttttttttttttttt"
], [
	"...........E....E...........",
	"...........E....E...........",
	"...o.r...etE....Ete...r.o...",
	"ettttteccetE....Eteccettttte",
	"et...te...tE....Et...et...te",
	"et...te...tE....Et...et...te",
	"et.o.te...tE....Et...et.o.te",
	"ettttte...tE....Et...ettttte",
	"et...te...tE....Et...et...te",
	"et...teccctettttetcccet...te",
	"et...t...ete....ete...t...te",
	"etro.t...ete..orete...t.orte",
	"ettTtt...etppppppte...ttTtte",
	"e.....T..e........e..T.....e",
	"e......Tre....h...e.T......e",
	"tttttttttttttttttttttttttttt"
], [
	"E...........................",
	"Eccccccccccccccccccccccccccc",
	"et.r...t.............t.....t",
	"e.ttttt...............ttttt.",
	"e.t.ttt...............tottt.",
	"e.ttttt.r....r......r.ttttt.",
	"e.ttt.tTttttttttttttttttt.t.",
	"e.tttttTttt.ott.ottttttttet.",
	"e.tttttTtttttttttttttttttet.",
	"e.tttttTtttttttttttttttttet.",
	"e.tttttTtttt....tttttttttet.",
	"e.tttttTtttt....tttttttttet.",
	"e.tttttTtttt...oettttttttet.",
	"e...........ttttecccccccce..",
	"e..........pppp.............",
	"e......h..pppp......r......."
], [
	"..........o..............E..",
	"........ettttttt..o......E..",
	"....o...e......tttttt....E..",
	"tttttttttte.........o....E..",
	"..........ettttttEtttttett..",
	"r.........e......E.....e....",
	"tttttttttte......E.r...e...o",
	"ttttttttttetttttttpp...etttt",
	"tttttttttte............e....",
	"tttttttttte.......o.ccce....",
	"tt......tte.......tt...e....",
	"tt..oo..tte.....o......e....",
	"tttttttttttettttttte...e....",
	"...........e.......tttttttte",
	"....o....h.e...............e",
	"tttttttttttttttttttttttttttt"
], [
	".......e....................",
	".ro....e.................or.",
	"ettro..e...............ortte",
	"e..tt..ettttEettttte...tt..e",
	"e...........eeo....e.......e",
	"e...........oee....e.......e",
	"e...........eeo............e",
	"e...........oee............e",
	"e...........eeo............e",
	"e...........oee............e",
	"e...........eeo............e",
	"e...........oee............e",
	"e...........eeo............e",
	"e...........oee............e",
	"e.......h...eeo............e",
	"e....etttttttttttttttte....e"
], [
	"......o.....o...........e...",
	"ettttttttttttttttte.....e...",
	"e.............o...eccccce..o",
	"tttttttttettttttttt.....ettt",
	"ttttttttee..............e...",
	"ttttttteeccccccce.......e...",
	"to.ottee......r.e..o..r.e..o",
	"tttttee.....ettttpppttttettt",
	".....e......e...........e...",
	".....e......e...........e...",
	"....re...o..eccccccccccce..o",
	"ettttttttttte..o.....o..ettt",
	"e...........e.ttttttttt.e...",
	"e...........e...........e...",
	"e......o....e....h.o....e...",
	"tttttttttttttttttttttttttttt"
], [
	"............r..........r...E",
	"TeTeTeTeTeTeTeTeTeTeTeTeTeTE",
	"TeTeTeTeTeTeTeTeTeTeTeTeTeTE",
	"oete.eteoete.eteoete.eteoetE",
	"TeteTeteTeteTeteTeteTeteTetE",
	"TeteTeteTeteTeteTeteTeteTetE",
	"TeteTeteTeteTeteTeteTeteTetE",
	".eteoete.eteoete.eteoete.etE",
	"TeteTeteTeteTeteTeteTeteTetE",
	"TeteTeteTeteTeteTeteTeteTetE",
	"oe.e.e.e.e.e.e.e.e.e.e.e.etE",
	"ettttttttttttttttttttttttttE",
	"e.........o.r.o...o.r......E",
	"eppppppppppppppppppppppppppE",
	"eo.......h................oE",
	"tttttttttttttttttttttttttttt"
], [
	"..e...r....c...rce....ec...o",
	".ce...cec...c..c.ec...e.c..e",
	"c.e..c.e.c....c..e.c..e..c.e",
	"o.e.c..e..c..c...e..coe...ce",
	"..ec..ce...cc....eo..ce....e",
	"ec...c.ec..cc..c.ecccccc.c..",
	"e.c...ce..co.c...e..c...e.c.",
	"ec.c...eocce..c..e.....ce..c",
	"e.c.c..ecc.e...c.e....c.e..c",
	"ec.o.crec..e.c..cec..c..e..c",
	"e.ce..c....e...c...c....e..c",
	"ec.e...c...e..c.c...c...e..c",
	"e.ce.c..c..eoc...c...c..e.oc",
	"ec.e...c.c.ec.c..oc...c.e.c.",
	"e.ce..c...ce.....c.c.c.cec..",
	"...e.....o.....oh.......e..."
], [
	"E..........................E",
	"E.....o.r..o.....o..r.o....E",
	"EEEEtttttttte...ettttttttEEE",
	"............e...e...........",
	".......ettttttttttttte......",
	"o..r..oe.....o.o.....eo.r..o",
	"ttttttte.o.ottttto.o.etttttt",
	".......e.tttt...tttt.e......",
	"....o..e......o......e.o....",
	"..etttttttttttttttttttttte..",
	"..e...........h..........e..",
	"..e.o....oettttttteo...o.e..",
	"tttttttttte.......ettttttttt",
	"..........e.......e.........",
	"..o.......e.......e......o..",
	"tptptptptptptptptptptptptptp"
], [
	".........................E..",
	"....................h.....E.",
	"...Ttttteetttttteeeee......E",
	".........e...t..e.........E.",
	"....o.....e.et..e........E..",
	"....to.....eet..e.......E...",
	"...ttto.....et..e......E....",
	"..ttttto....et..e.....E.....",
	"tttttttt....et..e......E....",
	".ottttt.....et..e.......E...",
	"...ttt......et..e........E..",
	"....t.......et..e.........E.",
	".......r....et..e...r......E",
	".ettttttttttttttTttttttttt.E",
	".ttttttttttttttt.........etE",
	"tttttttttttttttt...ooooooett"
] ]);

