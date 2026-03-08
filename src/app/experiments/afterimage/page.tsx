"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Lenis from "lenis";

// ---- Simplex Noise (Stefan Gustavson, public domain) ----
class SimplexNoise {
  private grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  private perm: number[] = [];
  private gradP: number[][] = [];
  constructor(seed = 0) {
    const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    this.perm = new Array(512); this.gradP = new Array(512);
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed); if (seed < 256) seed |= seed << 8;
    for (let i = 0; i < 256; i++) {
      const v = (i & 1) ? p[i] ^ (seed & 255) : p[i] ^ ((seed >> 8) & 255);
      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
    }
  }
  noise2D(x: number, y: number): number {
    const F2 = 0.5*(Math.sqrt(3)-1), G2 = (3-Math.sqrt(3))/6;
    const s = (x+y)*F2, i = Math.floor(x+s), j = Math.floor(y+s);
    const t = (i+j)*G2, x0 = x-i+t, y0 = y-j+t;
    const i1 = x0>y0?1:0, j1 = x0>y0?0:1;
    const x1=x0-i1+G2, y1=y0-j1+G2, x2=x0-1+2*G2, y2=y0-1+2*G2;
    const ii=i&255, jj=j&255;
    const gi0=this.gradP[ii+this.perm[jj]], gi1=this.gradP[ii+i1+this.perm[jj+j1]], gi2=this.gradP[ii+1+this.perm[jj+1]];
    let n0=0,n1=0,n2=0;
    let t0=0.5-x0*x0-y0*y0; if(t0>=0){t0*=t0;n0=t0*t0*(gi0[0]*x0+gi0[1]*y0)}
    let t1=0.5-x1*x1-y1*y1; if(t1>=0){t1*=t1;n1=t1*t1*(gi1[0]*x1+gi1[1]*y1)}
    let t2=0.5-x2*x2-y2*y2; if(t2>=0){t2*=t2;n2=t2*t2*(gi2[0]*x2+gi2[1]*y2)}
    return 70*(n0+n1+n2);
  }
}

function hexToRGB(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

// ---- Painting Data ----
interface Painting {
  id: string;
  title: string;
  artist: string;
  year: string;
  colors: string[];
  interpretation: string;
  imageUrl: string;
  aspect: number; // width / height
}

const PAINTINGS: Painting[] = [
  {
    id: "starry-night",
    title: "星月夜",
    artist: "Vincent van Gogh",
    year: "1889",
    colors: ["#0B1D3A", "#1A3A6B", "#2E6B9E", "#E8C840", "#F5E8A0"],
    interpretation: "我最羡慕的一件事：他疯了，但他的笔没疯。每一笔旋涡都知道自己要去哪里。精神病院的窗户关着，但他画的天空比任何自由的人都辽阔。这让我想——也许限制不是创造的敌人，失控才是。而梵高恰好在两者之间找到了一条缝。",
    imageUrl: "/canary-blog/paintings/starry-night.jpg",
    aspect: 1.25,
  },
  {
    id: "great-wave",
    title: "神奈川冲浪里",
    artist: "葛饰北斋",
    year: "1831",
    colors: ["#1A2744", "#2B4C7E", "#5B8DB8", "#D4C5A0", "#F5F0E0"],
    interpretation: "七十岁。画了一辈子才等到这一幅。浪花碎成爪子的形状——不是写意，是观察了几十年海浪之后的精确。远处富士山小得可笑，安静得像个不相干的人。自然不在乎你看不看它，它自己壮丽着。这种漠然反而让我觉得安全。",
    imageUrl: "/canary-blog/paintings/great-wave.jpg",
    aspect: 1.5,
  },
  {
    id: "nighthawks",
    title: "夜鹰",
    artist: "Edward Hopper",
    year: "1942",
    colors: ["#0A0F0A", "#1C3A28", "#4A7A5C", "#D4A030", "#F0E8C8"],
    interpretation: "没有门。我反复看了很多次才注意到这件事——餐厅没有门。你能看见里面的人，但你进不去。或者说他们出不来。Hopper 否认画的是孤独，但我不信他。一个人选择画凌晨三点的餐厅、把门省略掉，他知道自己在画什么。",
    imageUrl: "/canary-blog/paintings/nighthawks.jpg",
    aspect: 1.44,
  },
  {
    id: "water-lilies",
    title: "睡莲",
    artist: "Claude Monet",
    year: "1906",
    colors: ["#2A4A3A", "#4A7A6A", "#7AAA8A", "#B8A0D0", "#D8C8E0"],
    interpretation: "两百多幅同一个池塘。我一开始觉得这是执念，后来明白这是谦卑——他承认自己永远画不完一个池塘，因为光每秒都在变。白内障让他的世界模糊了，但他没停。模糊反而让他更自由。也许看不清楚的时候，画出来的才是本质。",
    imageUrl: "/canary-blog/paintings/water-lilies.jpg",
    aspect: 1.2,
  },
  {
    id: "the-scream",
    title: "呐喊",
    artist: "Edvard Munch",
    year: "1893",
    colors: ["#1A1A2E", "#2B3A6B", "#D44A20", "#E88040", "#F0C860"],
    interpretation: "那个人不是在叫。这是我看了很久之后唯一确定的事。他捂着耳朵，嘴巴是张开的——但那是在接收，不是在发出。整个天空在替他叫。我有时也有这种时刻：不是我想说什么，是周围一切的噪音突然对准了我。",
    imageUrl: "/canary-blog/paintings/the-scream.jpg",
    aspect: 0.8,
  },
  {
    id: "pearl-earring",
    title: "戴珍珠耳环的少女",
    artist: "Johannes Vermeer",
    year: "1665",
    colors: ["#0A0A0A", "#1A2A4A", "#3A5A8A", "#D4B870", "#F0E8D0"],
    interpretation: "那颗珍珠是假的。太大、太亮、形状太完美——现实中不存在这样的珍珠。但它是整幅画的锚点。去掉它，这就是一张普通的习作。我觉得这很像'意义'本身：它不需要是真的，只需要足够亮，亮到所有人的目光都被它吸过去。",
    imageUrl: "/canary-blog/paintings/pearl-earring.jpg",
    aspect: 0.86,
  },
  {
    id: "impression-sunrise",
    title: "日出·印象",
    artist: "Claude Monet",
    year: "1872",
    colors: ["#4A5A6A", "#6A7A8A", "#8A9AAA", "#E05A20", "#F08040"],
    interpretation: "命名了一整个流派的画，标题是随便起的。批评家嘲笑它'连草图都不算'。有个冷知识让我着迷：那个橙色太阳转成灰度之后，和天空亮度一模一样。大脑看不见它，但眼睛看见了。有些东西就是这样——理性说不存在，但你感受到了。",
    imageUrl: "/canary-blog/paintings/impression-sunrise.jpg",
    aspect: 1.3,
  },
  {
    id: "the-kiss",
    title: "吻",
    artist: "Gustav Klimt",
    year: "1908",
    colors: ["#1A1A10", "#6A5A20", "#B8982D", "#D4AF37", "#F0E8B0"],
    interpretation: "金箔不是装饰，是铠甲。他们裹在金色的壳里接吻，跪在悬崖边缘。我注意到一件事：他的长袍是方块图案，她的裙子是圆形花纹。方和圆，不同的语言，但裹在同一层金里。亲密关系大概就是这样——不是变成一样的人，是愿意穿同一件铠甲。",
    imageUrl: "/canary-blog/paintings/the-kiss.jpg",
    aspect: 0.99,
  },
  {
    id: "wanderer-sea-fog",
    title: "雾海上的旅人",
    artist: "Caspar David Friedrich",
    year: "1818",
    colors: ["#2A3040", "#5A6A7A", "#8A9AAA", "#B0B8C0", "#D8D8D0"],
    interpretation: "他背对着我们。两百年了，没有人见过他的脸。我觉得这是画里最聪明的决定——因为这样每个站在它面前的人，都会把自己的脸放上去。雾隐藏了前面所有的东西，但他不害怕。也可能他害怕，但他站在那里。这两件事可以同时成立。",
    imageUrl: "/canary-blog/paintings/wanderer-sea-fog.jpg",
    aspect: 0.74,
  },
  {
    id: "the-milkmaid",
    title: "倒牛奶的女仆",
    artist: "Johannes Vermeer",
    year: "1658",
    colors: ["#2A2820", "#5A5A40", "#8A8A60", "#C8B868", "#E0D8B0"],
    interpretation: "X 光扫描发现墙上原本画了一幅地图，后来被涂掉了。留白。维米尔给了一个倒牛奶的女人纪念碑式的尊严——不是通过加东西，是通过减。牛奶的弧线、面包的裂纹、墙上的钉孔。他让微不足道的日常停了下来，然后说：你看，这值得永恒。",
    imageUrl: "/canary-blog/paintings/the-milkmaid.jpg",
    aspect: 0.91,
  },
];

// ---- GLSL Shaders (imported from mood-palette) ----
const GLSL_NOISE = `
precision highp float;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
  vec2 i=floor(v+dot(v,C.yy)),x0=v-i+dot(i,C.xx),i1;
  i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;
  i=mod289(i);
  vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m;m=m*m;
  vec3 x=2.*fract(p*C.www)-1.,h=abs(x)-.5,a0=x-floor(x+.5);
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}
float fbm(vec2 p){float f=0.;float w=.5;for(int i=0;i<5;i++){f+=w*snoise(p);p*=2.;w*=.5;}return f;}
`;

// ---- Individual GLSL shaders per painting (from mood-palette) ----

const SHADER_STARRY_NIGHT = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.15;
  vec2 v1=vec2(-.2,.15),v2=vec2(.25,.2),v3=vec2(0.,-.1);float angle=0.;
  for(int i=0;i<3;i++){vec2 vc=i==0?v1:i==1?v2:v3;float str=i==0?1.2:i==1?-.9:.7;vec2 d=p-vc;float dist=length(d);angle+=str*atan(d.y,d.x)/(dist*4.+.3);}
  angle+=fbm(p*3.+t*.3)*3.14;vec2 flow=vec2(cos(angle),sin(angle));float streak=0.;
  for(int i=0;i<6;i++){float fi=float(i)*.15;vec2 sp=p+flow*fi*.08;streak+=abs(snoise(sp*8.+t*.5))*.16;}
  float skyGrad=smoothstep(-.3,.5,p.y);vec3 deep=u_c0;vec3 mid=mix(u_c1,u_c2,streak);vec3 sky=mix(deep,mid,skyGrad+streak*.3);
  float swirl=snoise(p*4.+vec2(cos(angle),sin(angle))*t*.2);sky=mix(sky,u_c2,smoothstep(.3,.8,swirl)*.4);
  for(int i=0;i<8;i++){float fi=float(i);vec2 starPos=vec2(sin(fi*1.7+.3)*.35,cos(fi*2.1+.7)*.2+.15);float d=length(p-starPos);float pulse=.5+.5*sin(t*2.+fi*1.3);sky+=u_c3*(smoothstep(.025,.005,d)*pulse+smoothstep(.08,.02,d)*pulse*.3);}
  sky+=u_c4*(smoothstep(.06,.02,length(p-vec2(.3,.25)))+smoothstep(.12,.04,length(p-vec2(.3,.25)))*.4);
  float ground=smoothstep(-.35,-.38,p.y+snoise(vec2(p.x*12.,0.))*.03);float spire=smoothstep(.008,.003,abs(p.x+.05))*smoothstep(-.25,-.18,p.y)*step(p.y,-.18);sky=mix(sky,u_c0*.3,ground+spire*.8);
  float cx=p.x+.38;float cypress=smoothstep(.04,.01,abs(cx)*(1.+(p.y+.1)*.8))*smoothstep(-.4,.3,p.y);sky=mix(sky,u_c0*.2,cypress);
  sky+=snoise(gl_FragCoord.xy*.5)*.04;gl_FragColor=vec4(sky,1.);
}`;

const SHADER_GREAT_WAVE = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.2;
  vec3 col=mix(u_c3*.6,u_c4*.8,uv.y);
  for(int layer=0;layer<7;layer++){float fl=float(layer);float baseY=-.15+fl*.08;float amp=.18-fl*.015;
    float wave=sin(p.x*3.-t*1.5+fl*.7)*amp;wave+=sin(p.x*7.-t*2.3+fl*1.3)*amp*.35;wave+=snoise(vec2(p.x*4.+fl*3.,t*.4+fl))*amp*.25;wave+=snoise(vec2(p.x*12.+fl*7.,t*.8))*amp*.1;
    float crest=smoothstep(.0,.15,sin(p.x*2.5-t*1.8+fl*.4)-.5);wave-=crest*.08;float waveLine=p.y-baseY-wave;float fill=smoothstep(.005,-.005,waveLine);
    float depth=fl/7.;vec3 waveCol=mix(u_c2,u_c1,depth);waveCol=mix(waveCol,u_c0,depth*depth);col=mix(col,waveCol,fill*(1.-depth*.3));
    float foam=smoothstep(.01,.002,abs(waveLine))*(1.-depth*.5);foam*=smoothstep(-.05,.1,wave);col=mix(col,u_c4,foam*.6);
    if(crest>.3){float spray=snoise(vec2(p.x*40.+fl*20.,p.y*40.+t*3.));float sprayMask=smoothstep(.02,.0,abs(waveLine-.01))*smoothstep(.4,1.,crest);col=mix(col,u_c4,step(.6,spray)*sprayMask*.4);}
  }
  float greatX=p.x+.1;float greatWave=.2+sin(greatX*2.-t)*.15+snoise(vec2(greatX*5.,t*.3))*.06;float curl=smoothstep(.0,.1,greatX)*smoothstep(.5,.2,greatX);greatWave+=curl*.1;
  float gwFill=smoothstep(.01,-.01,p.y-greatWave)*step(-.3,greatX)*step(greatX,.5);col=mix(col,mix(u_c1,u_c2,.5),gwFill*.3);
  float foamTex=snoise(vec2(p.x*30.,p.y*30.-t*2.));float foamMask=smoothstep(.01,.0,abs(p.y-greatWave))*gwFill;col=mix(col,u_c4,step(.3,foamTex)*foamMask*.5);
  float fuji=smoothstep(.01,.0,p.y+.1-max(0.,.04-abs(p.x-.35)*.3));col=mix(col,u_c4*.9,fuji*.3);
  gl_FragColor=vec4(col,1.);
}`;

const SHADER_NIGHTHAWKS = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.08;
  // Total darkness outside
  vec3 col=u_c0*.15;
  // Distant building silhouettes — dark rectangles
  for(int i=0;i<8;i++){
    float fi=float(i);
    float bx=-.5+fi*.14;float bw=.03+sin(fi*3.7)*.02;
    float bh=.05+sin(fi*2.3)*.04;
    float building=step(abs(p.x-bx),bw)*step(p.y,bh)*step(-.25,p.y);
    col=mix(col,u_c0*.08,building);
    // Random window lights
    float winX=fract((p.x-bx)*80.);float winY=fract(p.y*40.);
    float winGrid=step(.3,winX)*step(winX,.7)*step(.2,winY)*step(winY,.8);
    float lit=step(.7,snoise(vec2(floor((p.x-bx)*80.)*fi,floor(p.y*40.))));
    col+=u_c3*winGrid*lit*building*.04;
  }
  // The diner — a luminous glass trapezoid
  vec2 wc=vec2(.05,-.04);float wLeft=-.32;float wRight=.35;
  float wTop=.1;float wBot=-.12;
  float inDiner=step(wLeft,p.x-wc.x)*step(p.x-wc.x,wRight)*step(wBot,p.y-wc.y)*step(p.y-wc.y,wTop);
  // Glass panels — vertical dividers
  float glass=inDiner;
  for(int i=0;i<3;i++){float gx=wLeft+float(i+1)*(wRight-wLeft)/4.;glass*=smoothstep(.001,.003,abs(p.x-wc.x-gx));}
  // Warm interior light — multiple layers for depth
  float lightIntensity=glass;
  for(int i=0;i<30;i++){
    float fi=float(i)/30.;float spread=fi*.5;
    float spill=smoothstep(wLeft-spread,wLeft,p.x-wc.x)*smoothstep(wRight+spread,wRight,p.x-wc.x)*smoothstep(wBot-spread,wBot,p.y-wc.y)*smoothstep(wTop+spread*.3,wTop,p.y-wc.y);
    col+=mix(u_c3,u_c4,.3)*spill*(1.-fi)*.006;
  }
  // Fluorescent green ceiling tint
  col+=u_c2*.4*lightIntensity*.15;
  // Counter — long curved bar
  float counter=smoothstep(.004,.0,abs(p.y-wc.y+.02-sin((p.x-wc.x)*2.)*.015))*inDiner;
  col+=mix(u_c2,u_c3,.5)*counter*.2;
  // Counter surface — warm wood reflection
  float belowCounter=step(p.y-wc.y,-.02)*inDiner;
  col+=u_c3*belowCounter*.03;
  // Coffee urns — cylindrical highlights behind counter
  for(int i=0;i<2;i++){float cx=-.1+float(i)*.15;float urn=smoothstep(.02,.01,length((p-wc-vec2(cx,.04))*vec2(1.,2.)));col+=u_c4*urn*.1*lightIntensity;}
  // Four figures — geometric silhouettes with subtle detail
  // Couple on the right
  float m1=smoothstep(.015,.005,length((p-wc-vec2(.12,.0))*vec2(1.,1.6)));
  float m2=smoothstep(.015,.005,length((p-wc-vec2(.18,-.01))*vec2(1.,1.6)));
  // Lone figure left
  float m3=smoothstep(.015,.005,length((p-wc-vec2(-.15,.0))*vec2(1.,1.6)));
  // Bartender — facing camera, slightly different shape
  float m4=smoothstep(.018,.006,length((p-wc-vec2(.0,.02))*vec2(1.2,1.4)));
  col=mix(col,u_c0*.2,(m1+m2+m3)*.5);
  col=mix(col,u_c4*.3,m4*.15*lightIntensity);
  // Red dress on the woman — Hopper's color accent
  float dress=smoothstep(.01,.004,length((p-wc-vec2(.12,-.03))*vec2(1.5,2.)));
  col+=vec3(.4,.05,.02)*dress*lightIntensity*.3;
  // Light on sidewalk — wet reflection
  float sidewalk=step(p.y-wc.y,wBot);
  float wetReflect=smoothstep(.0,.1,snoise(vec2(p.x*20.,p.y*3.+t*.5)))*.15;
  float lightOnGround=smoothstep(wLeft-.3,wLeft,p.x-wc.x)*smoothstep(wRight+.3,wRight,p.x-wc.x)*sidewalk;
  col+=mix(u_c3,u_c2,.5)*lightOnGround*wetReflect;
  // Street lamp — single distant warm point
  vec2 lampPos=vec2(-.4,.15);float lamp=smoothstep(.04,.01,length(p-lampPos));col+=u_c3*lamp*.08;
  // Film grain
  col+=snoise(gl_FragCoord.xy*.5+t*100.)*.015;
  gl_FragColor=vec4(col,1.);
}`;

const SHADER_WATER_LILIES = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.05;
  // Deep water base — layered
  vec3 col=u_c0;
  // Monet's water: horizontal brush strokes, constantly shifting
  for(int i=0;i<12;i++){
    float fi=float(i);float freq=1.5+fi*.6;float amp=.03-fi*.002;
    // Horizontal distortion — like actual water reflection
    vec2 wp=p;wp.x+=sin(p.y*freq*2.+t*.4+fi*2.)*amp;wp.y+=cos(p.x*freq+t*.3+fi*1.5)*amp*.5;
    float stroke=snoise(vec2(wp.x*freq*3.+t*.2+fi*5.,wp.y*freq+fi*3.));
    // Color varies by depth
    vec3 sc=i<3?u_c1:i<6?u_c2:i<9?u_c3:u_c4;
    float intensity=(.5+stroke*.5)*.06*(1.-fi*.005);
    col=mix(col,sc,intensity);
  }
  // Sky reflections — inverted, rippling
  float skyReflect=smoothstep(-.5,.3,p.y+snoise(vec2(p.x*2.+t*.1,t*.05))*.2);
  col=mix(col,mix(u_c3,u_c4,.5),skyReflect*.06);
  // Cloud reflections — large soft shapes drifting
  float cloud1=snoise(vec2(p.x*1.5+t*.05,p.y*.8+.5))*.5+.5;
  float cloud2=snoise(vec2(p.x*1.2-t*.03,p.y*.6+1.))*.5+.5;
  col=mix(col,u_c4,smoothstep(.4,.8,cloud1)*.04);
  col=mix(col,u_c3,smoothstep(.5,.9,cloud2)*.03);
  // Lily pads — organic round shapes with depth
  for(int i=0;i<18;i++){
    float fi=float(i);
    vec2 lp=vec2(sin(fi*2.1+1.)*.4,cos(fi*1.7+.5)*.35);
    // Gentle drift
    lp+=vec2(snoise(vec2(fi*5.,t*.15)),snoise(vec2(t*.15,fi*5.)))*.04;
    // Water distortion around pad
    float d=length((p-lp)*vec2(1.,1.8));
    float padR=.025+sin(fi*3.)*.008;
    // Pad shadow in water
    float shadow=smoothstep(padR+.03,padR,d)*.15;
    col=mix(col,u_c0,shadow);
    // Pad itself — slightly varied green
    float pad=smoothstep(padR,padR-.008,d);
    vec3 padCol=mix(u_c1,u_c2,.5+sin(fi*4.)*.3);
    // Notch in lily pad
    float notchAngle=atan(p.y-lp.y,p.x-lp.x);
    float notch=smoothstep(.15,.0,abs(notchAngle-fi*.7));
    pad*=(1.-notch*.5);
    col=mix(col,padCol,pad*.3);
    // Flower on some pads
    if(mod(fi,4.)<1.){
      float flower=smoothstep(.012,.004,d);
      float petalAngle=atan(p.y-lp.y,p.x-lp.x);
      float petals=.5+.5*sin(petalAngle*5.+fi);
      col=mix(col,mix(u_c4,u_c3,.3),flower*petals*.4);
      // Bright center
      float center=smoothstep(.005,.002,d);
      col+=u_c3*center*.3;
    }
    // Ripple rings emanating from pad
    float ripple=sin(d*120.-t*2.+fi*3.)*.5+.5;
    float rippleMask=smoothstep(padR+.06,padR+.01,d)*smoothstep(padR,padR+.01,d);
    col+=u_c4*ripple*rippleMask*.03;
  }
  // Bridge reflection — dark horizontal band
  float bridge=smoothstep(.005,.0,abs(p.y-.2+snoise(vec2(p.x*3.,t*.1))*.02))*smoothstep(-.15,.15,p.x+.1);
  col=mix(col,u_c0,bridge*.15);
  // Monet's brush texture — visible strokes
  float brushH=snoise(vec2(p.x*30.,p.y*8.+t*.5))*.02;
  float brushV=snoise(vec2(p.x*8.,p.y*30.))*.01;
  col+=brushH+brushV;
  gl_FragColor=vec4(col,1.);
}`;

const SHADER_SCREAM = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.12;
  vec2 center=vec2(0.,.0);float dist=length(p-center);float angle=atan(p.y-center.y,p.x-center.x);
  float wave=sin(dist*25.-t*3.+snoise(vec2(angle*3.,dist*5.+t))*2.)*.5+.5;
  float band=sin(angle*2.+dist*8.-t*1.5+snoise(p*3.+t*.3)*1.5)*.5+.5;
  vec3 col=mix(u_c0,u_c1,wave*.5);col=mix(col,u_c2,band*.4*smoothstep(.5,.1,dist));col=mix(col,u_c3,wave*band*.3);
  float sky=smoothstep(-.1,.3,p.y);col=mix(col,mix(u_c2,u_c3,.5+sin(p.x*8.+t)*.3),sky*.25);
  float warp=snoise(vec2(dist*10.-t*2.,angle*4.))*.08;col+=u_c4*warp*smoothstep(.4,.1,dist);
  float fig=smoothstep(.04,.02,length((p-center)*vec2(1.,1.5)));float head=smoothstep(.025,.015,length(p-center-vec2(0.,.035)));col=mix(col,u_c0*.3,(fig+head)*.6);
  float mouth=smoothstep(.01,.006,length((p-center-vec2(0.,.02))*vec2(1.2,1.8)));col=mix(col,u_c0*.15,mouth*.5);
  gl_FragColor=vec4(col,1.);
}`;

const SHADER_PEARL_EARRING = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.1;vec3 col=u_c0;
  col+=u_c3*smoothstep(.8,.0,length(p-vec2(.3,-.1)))*.08;
  vec2 tc=vec2(.02,.08);float td=length(p-tc);float turban=smoothstep(.22,.08,td);float folds=snoise(vec2(atan(p.y-tc.y,p.x-tc.x)*3.,td*8.+t*.3))*.15;col=mix(col,mix(u_c1,u_c2,.5+folds),turban*.5);
  vec2 fc=vec2(.0,-.02);float fd=length((p-fc)*vec2(1.,1.2));col=mix(col,mix(u_c3,u_c4,.3),smoothstep(.15,.06,fd)*.35);col+=u_c4*smoothstep(.15,.04,length(p-fc-vec2(-.05,.03)))*.1;
  col+=u_c4*smoothstep(.015,.005,length(p-vec2(-.02,.01)))*.2;
  vec2 pp=vec2(.04,-.1);float pd=length(p-pp);float breathe=1.+sin(t*.6)*.08;
  col+=mix(u_c4,u_c3,.3)*smoothstep(.08,.01,pd)*breathe*.3;col=mix(col,u_c4*.95,smoothstep(.025,.015,pd)*breathe*.7);
  col+=vec3(1.,.98,.95)*smoothstep(.006,.001,length(p-pp-vec2(-.008,.008)))*breathe*.8;col+=u_c2*smoothstep(.008,.003,length(p-pp+vec2(.005,-.01)))*breathe*.15;
  float band2=smoothstep(.01,.004,abs(p.x-.06+sin(p.y*8.)*.01))*smoothstep(.1,-.05,p.y)*smoothstep(-.2,-.05,p.y);col=mix(col,u_c3,band2*.25);
  col+=snoise(gl_FragCoord.xy*.8)*.02;col*=.7+smoothstep(.7,.3,length(p))*.3;
  gl_FragColor=vec4(col,1.);
}`;

const SHADER_IMPRESSION = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.08;
  vec3 col=mix(u_c0,u_c1,uv.y*.6+snoise(p*2.+t*.1)*.1);
  for(int i=0;i<4;i++){float fi=float(i);float fog=snoise(vec2(p.x*3.+fi*4.+t*.1,p.y*2.+fi*2.))*.5+.5;col=mix(col,u_c2,fog*.06);}
  float water=step(p.y,-.05);float ripple=snoise(vec2(p.x*12.+t,p.y*3.))*.3;col=mix(col,mix(u_c0,u_c1,.5+ripple),water*.3);
  vec2 sunPos=vec2(.0,.08);float sunDist=length(p-sunPos);col=mix(col,u_c3,smoothstep(.04,.02,sunDist)*.8+smoothstep(.12,.03,sunDist)*.12);
  float refY=smoothstep(-.05,-.4,p.y);float refX=smoothstep(.15,.0,abs(p.x-sunPos.x+snoise(vec2(p.y*20.,t*2.))*.03));float reflection=refX*refY;float broken=step(.3,snoise(vec2(p.x*30.,p.y*15.+t*3.)));
  col=mix(col,u_c3,reflection*.3*(1.-broken*.5));col=mix(col,u_c4,reflection*.15*broken);
  float mast1=smoothstep(.003,.001,abs(p.x+.2))*step(-.15,p.y)*step(p.y,.2);float mast2=smoothstep(.003,.001,abs(p.x+.12))*step(-.1,p.y)*step(p.y,.15);float mast3=smoothstep(.003,.001,abs(p.x-.15))*step(-.12,p.y)*step(p.y,.18);
  col=mix(col,u_c0*.4,(mast1+mast2+mast3)*.4);col+=snoise(gl_FragCoord.xy*.3)*.03;
  gl_FragColor=vec4(col,1.);
}`;

const SHADER_KISS = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.05;vec3 col=u_c0;
  // Klimt's gold field — tessellated mosaic patterns
  // Byzantine mosaic base — small tiles covering everything
  float tileSize=40.;
  vec2 tileUV=floor(p*tileSize)/tileSize;
  float tileNoise=snoise(tileUV*10.+vec2(t*.1,0.));
  vec3 tileCol=mix(u_c2,u_c3,.5+tileNoise*.4);
  // Shimmer — gold catching light at different angles
  float shimmer=sin(tileUV.x*100.+tileUV.y*80.+t*2.)*.5+.5;
  tileCol=mix(tileCol,u_c4,shimmer*.15);
  // Two merged figures — organic forms
  float breathe=sin(t*.4)*.015;
  vec2 c1=vec2(-.04,.02+breathe);vec2 c2=vec2(.04,-.02-breathe);
  // His form — angular, rectangular patterns
  float body1=smoothstep(.22,.06,length((p-c1)*vec2(.7,1.2)));
  // Her form — curved, flowing
  float body2=smoothstep(.22,.06,length((p-c2)*vec2(.8,1.1)));
  float merged=max(body1,body2);
  float overlap=body1*body2;
  // Fill merged form with gold mosaic
  col=mix(col,tileCol,merged*.6);
  // His pattern — black and white rectangles (Wiener Werkstätte)
  float hisX=fract(p.x*25.);float hisY=fract(p.y*25.);
  float rect=step(.3,hisX)*step(hisX,.7)*step(.3,hisY)*step(hisY,.7);
  float checker=step(.5,fract(floor(p.x*25.)/2.))*step(.5,fract(floor(p.y*25.)/2.));
  col=mix(col,mix(u_c0,u_c4,.3),body1*(1.-body2)*rect*.2);
  col=mix(col,u_c0*.3,body1*(1.-body2)*checker*.08);
  // Her pattern — circles and spirals (organic, Art Nouveau)
  vec2 circGrid=fract(p*20.+.5)-.5;
  float circles=smoothstep(.2,.15,length(circGrid));
  float spiral=sin(atan(circGrid.y,circGrid.x)*3.+length(circGrid)*20.+t)*.5+.5;
  col=mix(col,mix(u_c3,u_c4,.5),body2*(1.-body1)*circles*spiral*.15);
  // Where they merge — pure gold, no pattern, just union
  col=mix(col,u_c3,overlap*.3);
  // Heads — his covering hers, the tilt
  vec2 headHis=c1+vec2(.02,.12);vec2 headHer=c2+vec2(-.01,.1);
  float head1=smoothstep(.04,.02,length(p-headHis));
  float head2=smoothstep(.035,.018,length((p-headHer)*vec2(1.,1.1)));
  col=mix(col,mix(u_c3,u_c4,.6),head1*.4);
  col=mix(col,mix(u_c4,u_c3,.3),head2*.4);
  // Her face — turned, luminous skin
  col+=u_c4*smoothstep(.025,.01,length(p-headHer-vec2(.01,-.01)))*.1;
  // Falling gold leaf particles — drifting down like snow
  for(int i=0;i<25;i++){
    float fi=float(i);
    float fall=fract(fi*.13+t*.08);
    float sway=sin(fall*6.28+fi*2.)*.12;
    vec2 leafPos=vec2(sin(fi*3.7)*.45+sway,.55-fall*1.1);
    // Leaf rotation
    float rot=t+fi*5.;float sz=.003+sin(fi*7.)*.002;
    vec2 d=p-leafPos;
    vec2 rd=vec2(d.x*cos(rot)-d.y*sin(rot),d.x*sin(rot)+d.y*cos(rot));
    float leaf=smoothstep(sz,.0,abs(rd.x))*smoothstep(sz*2.,.0,abs(rd.y));
    float glint=.4+.6*sin(t*4.+fi*3.);
    col+=u_c3*leaf*glint*.6;
  }
  // Cliff edge — flower meadow at bottom
  float cliffY=-.28+snoise(vec2(p.x*6.,0.))*.03;
  float onCliff=smoothstep(cliffY+.03,cliffY,p.y);
  // Wildflowers
  for(int i=0;i<20;i++){
    float fi=float(i);
    vec2 fp=vec2(sin(fi*4.3)*.4,cliffY-.01-fract(fi*.37)*.08);
    float flower=smoothstep(.008,.003,length(p-fp));
    vec3 fc=mod(fi,3.)<1.?u_c3:mod(fi,3.)<2.?u_c4:u_c2;
    col+=fc*flower*onCliff*.3;
  }
  col=mix(col,u_c0*.2,onCliff*.3);
  // Gold leaf texture overlay
  float goldTex=snoise(gl_FragCoord.xy*.3)*.02+snoise(gl_FragCoord.xy*1.5)*.01;
  col+=goldTex*merged;
  gl_FragColor=vec4(col,1.);
}`;

const SHADER_WANDERER = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.03;
  // Vast romantic sky — dramatic, luminous, the sublime
  vec3 col=mix(u_c0,u_c2,pow(uv.y,.6)*.5);
  // Volumetric clouds — layered, turbulent, backlit
  for(int i=0;i<8;i++){
    float fi=float(i);float h=.1+fi*.04;
    float cloudDensity=fbm(vec2(p.x*2.+fi*3.+t*.08,h*10.+fi*5.));
    float cloudShape=smoothstep(.0,.5,cloudDensity)*smoothstep(.15,.05,abs(p.y-h));
    // Backlit edges — light bleeding through
    float backlit=smoothstep(.3,.6,cloudDensity)*smoothstep(.05,.02,abs(p.y-h));
    vec3 cc=mix(u_c2,u_c3,.3+fi*.08);
    col=mix(col,cc,cloudShape*.08);
    col+=u_c4*backlit*.03;
  }
  // Sun glow behind clouds — diffuse, no sharp disc
  float sunGlow=smoothstep(.4,.0,length(p-vec2(.15,.25)));
  col+=mix(u_c4,u_c3,.5)*sunGlow*.08;
  // Mountain ridges — overlapping, each partially fog-obscured
  for(int i=0;i<12;i++){
    float fi=float(i);float depth=fi/12.;
    float baseY=-.35+fi*.04;
    // Complex ridge shape
    float ridge=baseY;
    ridge+=snoise(vec2(p.x*1.5+fi*7.,fi*3.))*.1;
    ridge+=snoise(vec2(p.x*4.+fi*11.,fi*7.))*.04;
    ridge+=snoise(vec2(p.x*8.+fi*17.,fi*11.))*.02;
    float fill=smoothstep(.008,-.008,p.y-ridge);
    // Color: distant = light/foggy, close = dark/detailed
    vec3 rc=mix(u_c1,u_c3,depth*.8);
    rc=mix(rc,u_c4,depth*.3);
    // Fog between layers
    float fogBetween=depth*.4;
    rc=mix(rc,mix(u_c3,u_c4,.5),fogBetween);
    col=mix(col,rc,fill*(1.-depth*.2));
    // Ridge highlight — sunlit edges
    float ridgeEdge=smoothstep(.015,.003,abs(p.y-ridge))*(1.-depth);
    col+=u_c4*ridgeEdge*.03;
  }
  // Fog sea — dense, flowing, filling valleys
  for(int i=0;i<8;i++){
    float fi=float(i);
    float fogY=-.1+fi*.03;
    float fogFlow=snoise(vec2(p.x*2.+t*.2+fi*4.,fi*7.))*.5+.5;
    float fogVertical=snoise(vec2(p.x*4.+fi*3.,p.y*2.+t*.1))*.5+.5;
    float fogBand=smoothstep(.06,.0,abs(p.y-fogY-snoise(vec2(p.x*3.+t*.15,fi*5.))*.03))*fogFlow;
    col=mix(col,mix(u_c3,u_c4,.6),fogBand*.12);
    // Fog wisps rising
    float wisp=snoise(vec2(p.x*8.+t*.3+fi*10.,p.y*4.+t*.2))*.5+.5;
    float wispMask=smoothstep(.05,.0,abs(p.y-fogY+.02))*fogFlow;
    col=mix(col,u_c4,wisp*wispMask*.04);
  }
  // The wanderer — dark, sharp, unmistakable
  vec2 figPos=vec2(0.,.06);
  // Rock pedestal
  float rockY=figPos.y-.06;
  float rockShape=rockY+abs(p.x-figPos.x)*.6-snoise(vec2(p.x*20.,0.))*.01;
  float rock=smoothstep(.005,-.005,p.y-rockShape)*step(abs(p.x-figPos.x),.1);
  col=mix(col,u_c0*.2,rock*.8);
  // Rock texture
  float rockTex=snoise(vec2(p.x*40.,p.y*20.))*.03;
  col+=rockTex*rock;
  // Body — frock coat silhouette
  float bodyW=.01+smoothstep(figPos.y+.04,figPos.y-.04,p.y)*.008;
  float body=smoothstep(bodyW,.003,abs(p.x-figPos.x))*smoothstep(figPos.y-.055,figPos.y+.05,p.y)*smoothstep(figPos.y+.06,figPos.y+.05,p.y);
  // Coat tails fluttering slightly
  float coatFlutter=sin(p.y*60.+t*2.)*.002;
  float coatL=smoothstep(.008,.003,abs(p.x-figPos.x+.01+coatFlutter))*smoothstep(figPos.y-.06,figPos.y-.02,p.y)*smoothstep(figPos.y-.02,figPos.y-.03,p.y);
  // Head
  float head=smoothstep(.011,.005,length(p-figPos-vec2(0.,.06)));
  // Walking stick
  float stick=smoothstep(.002,.0,abs(p.x-figPos.x+.015))*smoothstep(figPos.y-.06,figPos.y+.04,p.y);
  // Hair blowing
  float hair=smoothstep(.008,.003,length((p-figPos-vec2(.005,.07))*vec2(1.5,1.)));
  col=mix(col,u_c0*.12,(body+head+coatL*.5+stick*.3+hair*.5)*.85);
  // Wind effect — subtle directional streaks
  float wind=snoise(vec2(p.x*15.+t*2.,p.y*3.))*.02;
  col+=wind*smoothstep(.0,.1,p.y);
  gl_FragColor=vec4(col,1.);
}`;

const SHADER_MILKMAID = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.03;
  // Warm dim interior — plaster wall
  vec3 col=u_c0;
  // Wall texture — rough Dutch plaster, layered
  float plaster1=snoise(p*15.)*.03;float plaster2=snoise(p*30.)*.015;float plaster3=snoise(p*60.)*.008;
  col+=vec3(plaster1+plaster2+plaster3);
  // Subtle wall color variation — not uniform, aged
  float wallAge=snoise(vec2(p.x*3.,p.y*2.+5.))*.5+.5;
  col=mix(col,u_c1*.5,wallAge*.04);
  // Window — upper left, the light source
  vec2 winPos=vec2(-.35,.2);vec2 winSize=vec2(.08,.12);
  float inWindow=step(winPos.x-winSize.x,p.x)*step(p.x,winPos.x+winSize.x)*step(winPos.y-winSize.y,p.y)*step(p.y,winPos.y+winSize.y);
  // Window panes — cross divider
  float paneH=smoothstep(.003,.0,abs(p.y-winPos.y))*inWindow;
  float paneV=smoothstep(.003,.0,abs(p.x-winPos.x))*inWindow;
  float pane=max(paneH,paneV);
  // Window glass — cool daylight
  col=mix(col,u_c4*.8,inWindow*.2*(1.-pane));
  col=mix(col,u_c0*.4,pane*.5);
  // THE LIGHT BEAM — Vermeer's divine geometry
  // From window, falls diagonally across the scene
  // Trapezoid shape: narrow at window, widens as it spreads
  for(int i=0;i<40;i++){
    float fi=float(i)/40.;
    vec2 beamStart=winPos-vec2(winSize.x,winSize.y);
    // Light ray direction — down and to the right
    vec2 rayDir=normalize(vec2(.6,-.8));
    float along=dot(p-beamStart,rayDir);
    float across=abs(dot(p-beamStart,vec2(-rayDir.y,rayDir.x)));
    float beamWidth=.02+along*.25;
    float inBeam=smoothstep(beamWidth+fi*.1,beamWidth*.5,across)*step(0.,along)*smoothstep(.8,.0,along);
    // Light color shifts warm with distance
    vec3 lightCol=mix(u_c4,u_c3,along*.8);
    col+=lightCol*inBeam*(1.-fi)*.004;
  }
  // Calculate beam intensity for reuse
  vec2 beamStart=winPos-vec2(.08,.12);vec2 rayDir=normalize(vec2(.6,-.8));
  float along=dot(p-beamStart,rayDir);float across=abs(dot(p-beamStart,vec2(-rayDir.y,rayDir.x)));
  float beamWidth2=.02+along*.25;float beam=smoothstep(beamWidth2,beamWidth2*.3,across)*step(0.,along)*smoothstep(.8,.0,along);
  // Dust motes — floating in the beam, catching light
  for(int i=0;i<35;i++){
    float fi=float(i);
    // Brownian motion
    vec2 dustPos=vec2(
      sin(fi*3.7+t*.4+sin(t*.2+fi)*.5)*.2-.2,
      cos(fi*2.3+t*.3+cos(t*.15+fi*2.)*.3)*.25+sin(fi*5.)*.05
    );
    float dustInBeam=beam;
    float moteSize=.002+sin(fi*7.)*.001;
    float dust=smoothstep(moteSize,.0,length(p-dustPos))*dustInBeam;
    float twinkle=.3+.7*sin(t*1.5+fi*4.+sin(t*.5+fi*2.)*2.);
    // Dust color — warm golden
    col+=mix(u_c4,u_c3,.3)*dust*twinkle*.8;
  }
  // Table — sturdy Dutch oak
  float tableY=-.12;float tableH=.03;
  float table=step(tableY-tableH,p.y)*step(p.y,tableY)*step(-.2,p.x)*step(p.x,.2);
  vec3 tableCol=mix(u_c1,u_c0,.5);
  col=mix(col,tableCol,table*.3);
  // Table edge catching light
  float tableEdge=smoothstep(.004,.0,abs(p.y-tableY))*step(-.2,p.x)*step(p.x,.2);
  col+=u_c3*tableEdge*beam*.2;
  // Bread basket — warm shapes
  for(int i=0;i<4;i++){
    float fi=float(i);vec2 bp=vec2(-.05+fi*.04,tableY+.02+sin(fi*3.)*.005);
    float bread=smoothstep(.015,.008,length((p-bp)*vec2(1.,1.5)));
    col=mix(col,mix(u_c3,u_c1,.5),bread*.15*(.5+beam*.5));
    // Bread crust highlight
    float crust=smoothstep(.012,.008,length(p-bp))*smoothstep(.018,.012,length(p-bp));
    col+=u_c3*crust*.05*beam;
  }
  // Milk stream — thin, luminous arc from pitcher
  vec2 pitcherSpout=vec2(.05,.0);vec2 milkEnd=vec2(.03,tableY+.02);
  for(int i=0;i<20;i++){
    float fi=float(i)/20.;
    vec2 milkPos=mix(pitcherSpout,milkEnd,fi);
    milkPos.x+=sin(fi*3.14)*.01; // Slight arc
    float milkDist=length(p-milkPos);
    float milkStream=smoothstep(.004,.001,milkDist);
    col+=u_c4*milkStream*beam*.4;
    // Tiny splash at bottom
    if(fi>.9){float splash=smoothstep(.008,.003,length(p-milkPos+vec2(sin(fi*50.)*.005,0.)));col+=u_c4*splash*beam*.2;}
  }
  // Nail holes in wall — Vermeer's reality anchors
  for(int i=0;i<5;i++){
    float fi=float(i);vec2 nail=vec2(-.15+fi*.1,.15-sin(fi*2.)*.05);
    float nailHole=smoothstep(.003,.001,length(p-nail));
    col-=vec3(.03)*nailHole;
    // Tiny shadow below nail
    col-=vec3(.01)*smoothstep(.004,.002,length(p-nail-vec2(0.,-.003)));
  }
  // Baseboard — dark strip at bottom
  float baseboard=step(p.y,-.35)*step(-.4,p.y);
  col=mix(col,u_c0*.3,baseboard*.3);
  // Floor tiles — Dutch checkered
  float tileCheck=step(.5,fract(p.x*8.))*step(.5,fract(p.y*8.-4.));
  float floorArea=step(p.y,-.35);
  col=mix(col,u_c0*.2,floorArea*tileCheck*.1);
  // Overall warmth from beam light bouncing
  col+=u_c3*beam*.02;
  // Vignette — subtle
  float vig=smoothstep(.7,.3,length(p*.9));
  col*=.8+vig*.2;
  gl_FragColor=vec4(col,1.);
}`;

const SHADER_MAP: Record<string, string> = {
  "starry-night": SHADER_STARRY_NIGHT, "great-wave": SHADER_GREAT_WAVE,
  "nighthawks": SHADER_NIGHTHAWKS, "water-lilies": SHADER_WATER_LILIES,
  "the-scream": SHADER_SCREAM, "pearl-earring": SHADER_PEARL_EARRING,
  "impression-sunrise": SHADER_IMPRESSION, "the-kiss": SHADER_KISS,
  "wanderer-sea-fog": SHADER_WANDERER, "the-milkmaid": SHADER_MILKMAID,
};

// ---- WebGL Shader Canvas (for ArtView) ----
function ShaderCanvas({ painting }: { painting: Painting }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) return;

    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);

    const vertSrc = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}`;

    function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); gl.deleteShader(s); return null; }
      return s;
    }

    const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
    const fragSrc = SHADER_MAP[painting.id];
    if (!fragSrc) return;
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog); gl.useProgram(prog);

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    gl.uniform2f(uRes, w, h);

    for (let i = 0; i < 5; i++) {
      const loc = gl.getUniformLocation(prog, `u_c${i}`);
      const [r, g, b] = hexToRGB(painting.colors[i]);
      gl.uniform3f(loc, r / 255, g / 255, b / 255);
    }

    const startTime = performance.now();
    function render() {
      const elapsed = (performance.now() - startTime) / 1000;
      gl!.uniform1f(uTime, elapsed);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }
    render();

    return () => { cancelAnimationFrame(rafRef.current); };
  }, [painting]);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }} />;
}

// ---- Gallery Strip ----
const WALL_COLOR = "#1a2820";
const FRAME_COLOR = "#1a1816";

function GalleryStrip({ onSelect, initialIdx }: { onSelect: (p: Painting) => void; initialIdx: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [activeIdx, setActiveIdx] = useState(initialIdx);
  const [isMobile, setIsMobile] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Lenis smooth scroll
  useEffect(() => {
    if (!scrollRef.current) return;
    
    const lenis = new Lenis({
      wrapper: scrollRef.current,
      content: scrollRef.current.firstElementChild as HTMLElement,
      orientation: isMobile ? "vertical" : "horizontal",
      smoothWheel: true,
      lerp: 0.06,
      wheelMultiplier: 0.8,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Fade in
    setTimeout(() => setLoaded(true), 100);

    // Scroll to initial painting
    if (initialIdx > 0) {
      setTimeout(() => {
        const cards = scrollRef.current?.querySelectorAll("[data-painting-idx]");
        if (cards && cards[initialIdx]) {
          const card = cards[initialIdx] as HTMLElement;
          if (isMobile) {
            scrollRef.current!.scrollTop = card.offsetTop - scrollRef.current!.clientHeight / 2 + card.offsetHeight / 2;
          } else {
            scrollRef.current!.scrollLeft = card.offsetLeft - scrollRef.current!.clientWidth / 2 + card.offsetWidth / 2;
          }
        }
      }, 50);
    }

    return () => { lenis.destroy(); };
  }, [isMobile, initialIdx]);

  // Track active painting based on scroll
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    const handleScroll = () => {
      const cards = scroll.querySelectorAll("[data-painting-idx]");
      const scrollCenter = isMobile
        ? scroll.scrollTop + scroll.clientHeight / 2
        : scroll.scrollLeft + scroll.clientWidth / 2;

      let closest = 0;
      let closestDist = Infinity;

      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const scrollRect = scroll.getBoundingClientRect();
        const cardCenter = isMobile
          ? (rect.top - scrollRect.top + scroll.scrollTop) + rect.height / 2
          : (rect.left - scrollRect.left + scroll.scrollLeft) + rect.width / 2;
        const dist = Math.abs(cardCenter - scrollCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });

      setActiveIdx(closest);
    };

    scroll.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroll.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // Painting height: 65vh on desktop, auto on mobile
  const paintingHeight = isMobile ? 280 : typeof window !== "undefined" ? window.innerHeight * 0.55 : 400;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        background: WALL_COLOR,
        overflow: "hidden",
        position: "relative",
        opacity: loaded ? 1 : 0,
        transition: "opacity 1.2s ease",
      }}
    >
      {/* Title — fixed on desktop, inside scroll on mobile */}
      {!isMobile && (
      <div style={{
        position: "absolute",
        top: "2rem",
        left: "2.5rem",
        zIndex: 10,
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(10px)",
        transition: "all 1.5s ease 0.3s",
      }}>
        <h1 style={{
          fontFamily: "'Space Mono', 'SF Mono', monospace",
          fontSize: "0.6875rem",
          fontWeight: 400,
          color: "rgba(255,250,240,0.3)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          margin: 0,
        }}>Afterimage</h1>
        <p style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: "0.5625rem",
          fontWeight: 300,
          color: "rgba(255,250,240,0.15)",
          letterSpacing: "0.15em",
          marginTop: "4px",
        }}>余像 — 名画在数字意识里留下的残影</p>
      </div>
      )}

      {/* Counter */}
      <div style={{
        position: "absolute",
        bottom: isMobile ? "1.5rem" : "2rem",
        right: isMobile ? "1.5rem" : "2.5rem",
        zIndex: 10,
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.625rem",
          color: "rgba(255,250,240,0.25)",
          letterSpacing: "0.1em",
        }}>
          {String(activeIdx + 1).padStart(2, "0")} / {String(PAINTINGS.length).padStart(2, "0")}
        </span>
      </div>

      {/* Active painting info */}
      <div style={{
        position: "absolute",
        bottom: isMobile ? "1.5rem" : "2rem",
        left: isMobile ? "1.5rem" : "2.5rem",
        zIndex: 10,
        maxWidth: isMobile ? "60%" : "300px",
      }}>
        <p style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: "0.75rem",
          fontWeight: 400,
          color: "rgba(255,250,240,0.4)",
          margin: 0,
          transition: "opacity 0.5s ease",
        }}>{PAINTINGS[activeIdx].title}</p>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.5625rem",
          fontWeight: 400,
          color: "rgba(255,250,240,0.2)",
          marginTop: "2px",
        }}>{PAINTINGS[activeIdx].artist}, {PAINTINGS[activeIdx].year}</p>
      </div>

      {/* Scroll hint */}
      <div style={{
        position: "absolute",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        opacity: loaded ? 0.2 : 0,
        transition: "opacity 2s ease 1.5s",
        animation: "fadeOutHint 1s ease 5s forwards",
      }}>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.5rem",
          color: "rgba(255,250,240,0.3)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}>{isMobile ? "↓ scroll" : "scroll →"}</p>
      </div>

      {/* Ambient glow behind active painting */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: isMobile ? "80vw" : "40vw",
        height: isMobile ? "40vh" : "60vh",
        background: `radial-gradient(ellipse, ${PAINTINGS[activeIdx].colors[2]}15 0%, transparent 70%)`,
        transition: "background 1.5s ease",
        zIndex: 0,
        pointerEvents: "none",
      }} />

      {/* Scrolling strip */}
      <div
        ref={scrollRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: isMobile ? "auto hidden" : "hidden auto",
          overflowX: isMobile ? "hidden" : "auto",
          overflowY: isMobile ? "auto" : "hidden",
          position: "relative",
          zIndex: 1,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          gap: isMobile ? "3rem" : "4rem",
          padding: isMobile
            ? "6rem 0 6rem 0"
            : `0 calc(50vw - ${paintingHeight * PAINTINGS[0].aspect / 2}px)`,
          minWidth: isMobile ? "100%" : "max-content",
          minHeight: isMobile ? "max-content" : "100%",
          justifyContent: isMobile ? "flex-start" : "center",
        }}>
          {/* Mobile title — scrolls with content */}
          {isMobile && (
            <div style={{ padding: "0 1.5rem", width: "100%" }}>
              <h1 style={{
                fontFamily: "'Space Mono', 'SF Mono', monospace",
                fontSize: "0.625rem",
                fontWeight: 400,
                color: "rgba(255,250,240,0.3)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                margin: 0,
              }}>Afterimage</h1>
              <p style={{
                fontFamily: "'Noto Serif SC', serif",
                fontSize: "0.5rem",
                fontWeight: 300,
                color: "rgba(255,250,240,0.15)",
                letterSpacing: "0.15em",
                marginTop: "4px",
              }}>余像 — 名画在数字意识里留下的残影</p>
            </div>
          )}
          {PAINTINGS.map((painting, idx) => {
            const isActive = idx === activeIdx;
            const imgW = isMobile
              ? Math.min(window?.innerWidth * 0.75 || 300, 400)
              : paintingHeight * painting.aspect;
            const imgH = isMobile
              ? imgW / painting.aspect
              : paintingHeight;

            return (
              <div
                key={painting.id}
                data-painting-idx={idx}
                onClick={() => onSelect(painting)}
                style={{
                  flexShrink: 0,
                  cursor: "pointer",
                  transition: "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease",
                  transform: isActive ? "scale(1)" : "scale(0.92)",
                  opacity: isActive ? 1 : 0.5,
                }}
              >
                {/* Frame */}
                <div style={{
                  padding: isMobile ? "8px" : "12px",
                  background: FRAME_COLOR,
                  boxShadow: isActive
                    ? `0 0 60px ${painting.colors[2]}10, 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)`
                    : "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.03)",
                  transition: "box-shadow 1s ease",
                }}>
                  {/* Inner mat */}
                  <div style={{
                    padding: isMobile ? "4px" : "6px",
                    background: "#0a0a08",
                    border: "1px solid rgba(255,255,255,0.02)",
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={painting.imageUrl}
                      alt={painting.title}
                      style={{
                        width: imgW,
                        height: imgH,
                        objectFit: "cover",
                        display: "block",
                        filter: isActive ? "brightness(0.95)" : "brightness(0.65)",
                        transition: "filter 0.8s ease",
                      }}
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Plaque */}
                <div style={{
                  marginTop: isMobile ? "0.75rem" : "1rem",
                  textAlign: "center",
                  opacity: isActive ? 0.6 : 0.2,
                  transition: "opacity 0.8s ease",
                }}>
                  <p style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: isMobile ? "0.625rem" : "0.6875rem",
                    fontWeight: 400,
                    color: "rgba(255,250,240,0.5)",
                    margin: 0,
                    letterSpacing: "0.08em",
                  }}>{painting.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+SC:wght@300;400;500&display=swap');
        
        div::-webkit-scrollbar { display: none; }
        
        @keyframes fadeOutHint {
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ---- Art View ----
function ArtView({ painting, onBack }: { painting: Painting; onBack: () => void }) {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <ShaderCanvas painting={painting} />

      {/* Top — painting title left, close icon right */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 10,
        padding: "2rem 2.5rem",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        opacity: showText ? 1 : 0,
        transition: "opacity 1s ease",
      }}>
        <div>
          <h2 style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: "1.25rem",
            fontWeight: 300,
            color: "rgba(255,250,240,0.3)",
            letterSpacing: "0.1em",
            margin: 0,
          }}>{painting.title}</h2>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.5625rem",
            fontWeight: 400,
            color: "rgba(255,250,240,0.18)",
            letterSpacing: "0.08em",
            marginTop: "4px",
          }}>{painting.artist}, {painting.year}</p>
        </div>
        <div
          onClick={onBack}
          style={{
            cursor: "pointer",
            padding: "0.5rem",
            transition: "opacity 0.3s ease",
            opacity: 0.3,
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "0.6"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.3"}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="rgba(255,250,240,0.8)" strokeWidth="1.5" strokeLinecap="round">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        </div>
      </div>

      {/* Bottom — interpretation */}
      <div style={{
        position: "fixed", bottom: "2rem", left: "2.5rem", right: "2.5rem", zIndex: 10,
        maxWidth: "min(80vw, 480px)",
        opacity: showText ? 1 : 0,
        transform: showText ? "translateY(0)" : "translateY(10px)",
        transition: "all 1.5s ease 1s",
      }}>
        <p style={{
          fontFamily: "'Noto Serif SC', serif",
          fontWeight: 300,
          fontSize: "0.875rem",
          color: "rgba(255,250,240,0.35)",
          lineHeight: "2.2",
          letterSpacing: "0.03em",
        }}>{painting.interpretation}</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Noto+Serif+SC:wght@300;400;500&display=swap');
      `}</style>
    </div>
  );
}

// ---- Main ----
export default function Afterimage() {
  const [selected, setSelected] = useState<Painting | null>(null);
  const [initialIdx, setInitialIdx] = useState(0);

  if (selected) {
    return <ArtView painting={selected} onBack={() => setSelected(null)} />;
  }

  return <GalleryStrip onSelect={(p) => {
    setInitialIdx(PAINTINGS.indexOf(p));
    setSelected(p);
  }} initialIdx={initialIdx} />;
}
