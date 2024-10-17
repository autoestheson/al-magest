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
        
        var mDefApo = 50/3; // rotated from 25.5
        var mDefEpo = -1297/15; // calc 10.20
        var mDefRad = 180; // arbitrary
        var mDefEcc = mDefRad * 1 / 5; // prop 10.8-10.15
        var mDefVel = 14806627 / 25900833; // calc 9.3
        var mEpiEpo = mDefApo + 19633 / 60; // calc 10.20
        var mEpiRad = mDefRad * 39.5 / 60; // prop 10.20
        var mEpiVel = 4054238 / 8657311; // calc 9.3
        
        this.mDef = new CyclingBody("", "#F50", "#F50", this.earth, mDefEcc, mDefApo, mDefRad, mDefEpo, mDefVel);
        this.mEpi = new CyclingBody("M", "#F50", "#F50", this.mDef, 0, 0, mEpiRad, mEpiEpo, mDefVel + mEpiVel);
        
        var sEccApo = -24.5; // calc 3.21
        var sEccEpo = sEccApo + 265.25; // obs 3.31
        var sEccRad = 120; // arbitrary
        var sEccEcc = sEccRad / 24; // calc 3.20
        var sEccVel = 1; // unit
        
        this.sEcc = new CyclingBody("S", "#FF0", "#FF0", this.earth, sEccEcc, sEccApo, sEccRad, sEccEpo, sEccVel);
        
        var vDefApo = -217/6 // rotated from -45
        var vDefEpo = sEccEpo; // inner planet - same as Sun
        var vDefRad = 60; // arbitrary
        var vDefEcc = vDefRad * 1.25 / 60; // prop 10.2
        var vDefVel = sEccVel; // inner planet - same as Sun
        var vEpiEpo = 4267 / 60; // calc 10.13
        var vEpiRad = vDefRad * 259 / 360; // prop 10.2
        var vEpiVel = 273935 / 437951; // calc 9.4
        
        this.vDef = new CyclingBody("", "#0FF", "#0FF", this.earth, vDefEcc, vDefApo, vDefRad, vDefEpo, vDefVel);
        this.vEpi = new CyclingBody("V", "#0FF", "#0FF", this.vDef, 0, 0, vEpiRad, vEpiEpo, vDefVel + vEpiVel);
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
    drawLabel(360 + 6, 0 + 9, 96, "Summer Solstice");
    drawLabel(360 + 6, 720, 96, "Winter Solstice");
    drawLine(0, 360, 720, 360, "#FFF");
    drawLabel(0, 360 - 6, 96, "Autumn Equinox");
    drawLabel(720 - 96, 360 - 6, 96, "Spring Equinox");
    
    world.tick();
    
    requestAnimationFrame(exist);
}

exist();