/* GRAPHICS PRIMITIVES ********************************************************/

const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const width = (canvas.width = 720);
const height = (canvas.height = 720);

function drawLine(x1, y1, x2, y2, color) {
    context.beginPath();
    context.strokeStyle = color;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

function drawArc(x, y, r, s, e, color) {
    context.beginPath();
    context.strokeStyle = color;
    context.arc(x, y, r, s, e);
    context.lineWidth = 1;
    context.stroke();
}

function drawCircle(x, y, r, color) {
    drawArc(x, y, r, 0, 2 * Math.PI, color);
}

function drawLabel(x, y, w, label) {
    context.beginPath();
    context.strokeStyle = "rgb(255 255 255)";
    context.font = "12px serif";
    context.strokeText(label, x, y, w);
}

function fillBox(x, y, w, h, color) {
    context.beginPath();
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

/* COORDINATE CONVERSIONS *****************************************************/

function rf2x(r, f) {return r * -Math.sin(deg2rad(f))}
function rf2y(r, f) {return r * -Math.cos(deg2rad(f))}
function xy2r(x, y) {return Math.hypot(x, y)}
function xy2f(x, y) {return rad2deg(Math.atan2(y, x))}

/* UNIT CONVERSIONS ***********************************************************/

function rad2deg(n) {return n * (180 / Math.PI)}
function deg2rad(n) {return n / (180 / Math.PI)}

function sexi(i, s, n) {
    var m = Math.floor(n);
    if (i == 0) return m.toString().padStart(3, '0');
    return m.toString().padStart(3, '0') + s + sexi(i - 1, ",", (n - m) * 60);
}

function sex3(n) {return sexi(2, ";", n)}

/* HEAVENLY BODIES ************************************************************/

class Body {
    constructor(name, color, x, y) {
        this.name = name;
        this.color = color;
        
        this.x = x;
        this.y = y;
    }
    
    preTick() {}
    
    postTick() {}
    
    tick() {
        this.preTick();
        
        drawCircle(this.x, this.y, 8, this.color);
        drawLabel(this.x, this.y, 12, this.name);
        
        this.postTick();
    }
    
    observe(object) {
        return 180 + xy2f(this.x - object.x, object.y - this.y);
    }
}

class CyclingBody extends Body {
    constructor(name, color, ocolor, p, FE, FEN, r, f, v) {
        super(name, color, p.x + rf2x(FE, FEN) + rf2x(r, f), p.y + rf2y(FE, FEN) + rf2y(r, f));
        
        this.ocolor = ocolor;
        
        this.p = p; // Parent
        this.FE = FE; // Length of eccentricity
        this.FEN = FEN; // Angle of eccentricity
        this.r = r; // Radius
        this.f = f; // Angular coordinate
        this.v = v; // Angular velocity
    }
    
    preTick() {
        drawCircle(this.p.x, this.p.y, this.r, "#AAA");
        drawCircle(this.p.x + rf2x(this.FE, this.FEN), this.p.y + rf2y(this.FE, this.FEN), this.r, this.ocolor);
    }
    
    postTick() {
        this.f = (this.f + this.v) % 360;
        
        this.x = this.p.x + rf2x(this.FE, this.FEN) + rf2x(this.r, this.f);
        this.y = this.p.y + rf2y(this.FE, this.FEN) + rf2y(this.r, this.f);
    }
}

class CelestialSphere {
    constructor() {
        this.earth = new Body("E", "#0F0", 360, 360);
        
        var mDefAps = -24.5;
        var mDefIni = -24.5;
        var mDefRad = 216;
        var mDefEcc = mDefRad * 1 / 5;
        var mDefVel = 4054238 / 8657311;
        var mEpiIni = -24.5;
        var mEpiRad = mDefRad * 39.5 / 60;
        var mEpiVel = 1;
        
        this.mDef = new CyclingBody("", "#F50", "#F50", this.earth, mDefEcc, mDefAps, mDefRad, mDefIni, mDefVel);
        this.mEpi = new CyclingBody("M", "#F50", "#F50", this.mDef, 0, 0, mEpiRad, mEpiIni, mEpiVel);
        
        var sEccAps = -24.5;
        var sEccIni = -24;5
        var sEccRad = 70;
        var sEccEcc = sEccRad / 24;
        var sEccVel = 1;
        
        this.sEcc = new CyclingBody("S", "#FF0", "#FF0", this.earth, sEccEcc, sEccAps, sEccRad, sEccIni, sEccVel);
        
        var vDefAps = -45;
        var vDefIni = -24.5;
        var vDefRad = 39;
        var vDefEcc = vDefRad * 1.25 / 60;
        var vDefVel = 1;
        var vEpiIni = -24.5;
        var vEpiRad = vDefRad * 259 / 360;
        var vEpiVel = 273935 / 437951;
        
        this.vDef = new CyclingBody("", "#0FF", "#0FF", this.earth, vDefEcc, vDefAps, vDefRad, vDefIni, vDefVel);
        this.vEpi = new CyclingBody("V", "#0FF", "#0FF", this.vDef, 0, 0, vEpiRad, vEpiIni, vDefVel + vEpiVel);
    }
    
    tick() {
        this.earth.tick();
        this.mDef.tick();
        this.mEpi.tick();
        this.sEcc.tick();
        this.vDef.tick();
        this.vEpi.tick();
    }
}

/* MAIN SECTION ***************************************************************/

var world = new CelestialSphere();

function exist() {
    fillBox(0, 0, 720, 720, "#000");
    
    drawLine(360, 0, 360, 720, "#FFF");
    drawLabel(360 + 6, 0 + 9, 36, "SS");
    drawLabel(360 + 6, 720, 36, "WS");
    drawLine(0, 360, 720, 360, "#FFF");
    drawLabel(0, 360 - 6, 36, "AE");
    drawLabel(720 - 18, 360 - 6, 36, "SE");
    
    world.tick();
    
    requestAnimationFrame(exist);
}

exist();