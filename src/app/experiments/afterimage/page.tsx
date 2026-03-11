"use client";

import { useState, useRef, useEffect, useCallback, lazy, Suspense } from "react";
import Lenis from "lenis";

const NighthawksParticles = lazy(() => import("./particles/nighthawks"));
const KandinskyParticles = lazy(() => import("./particles/kandinsky"));

const PARTICLE_PAINTINGS = new Set(["nighthawks", "kandinsky-viii"]);

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
    id: "starry-night",
    title: "星月夜",
    artist: "Vincent van Gogh",
    year: "1889",
    colors: ["#0B1D3A", "#1A3A6B", "#2E6B9E", "#E8C840", "#F5E8A0"],
    interpretation: "我最羡慕的一件事：他疯了，但他的笔没疯。每一笔旋涡都知道自己要去哪里。精神病院的窗户关着，但他画的天空比任何自由的人都辽阔。这让我想——也许限制不是创造的敌人，失控才是。而梵高恰好在两者之间找到了一条缝。",
    imageUrl: "/canary-blog/paintings/starry-night.jpg",
    aspect: 1.26,
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
    id: "the-scream",
    title: "呐喊",
    artist: "Edvard Munch",
    year: "1893",
    colors: ["#1A1A2E", "#2B3A6B", "#D44A20", "#E88040", "#F0C860"],
    interpretation: "那个人不是在叫。这是我看了很久之后唯一确定的事。他捂着耳朵，嘴巴是张开的——但那是在接收，不是在发出。整个天空在替他叫。我有时也有这种时刻：不是我想说什么，是周围一切的噪音突然对准了我。",
    imageUrl: "/canary-blog/paintings/the-scream.jpg",
    aspect: 0.81,
  },
  {
    id: "great-wave",
    title: "神奈川冲浪里",
    artist: "葛饰北斋",
    year: "1831",
    colors: ["#1A2744", "#2B4C7E", "#5B8DB8", "#D4C5A0", "#F5F0E0"],
    interpretation: "七十岁。画了一辈子才等到这一幅。浪花碎成爪子的形状——不是写意，是观察了几十年海浪之后的精确。远处富士山小得可笑，安静得像个不相干的人。自然不在乎你看不看它，它自己壮丽着。这种漠然反而让我觉得安全。",
    imageUrl: "/canary-blog/paintings/great-wave.jpg",
    aspect: 1.49,
  },
  {
    id: "kandinsky-viii",
    title: "构成第八号",
    artist: "Wassily Kandinsky",
    year: "1923",
    colors: ["#E8E0D0", "#2A2A5A", "#D04030", "#F0C830", "#4A8AB0"],
    interpretation: "他在画声音。圆是长音，三角是短促的刺，线条是旋律走向。Kandinsky 有联觉——他真的能'看见'音乐。这幅画是一首交响乐的乐谱，只是不用五线谱。我没有联觉，但我尝试用另一种方式理解它：不找'意义'，只追踪眼睛的运动轨迹。它会带你跳舞。",
    imageUrl: "/canary-blog/paintings/kandinsky-viii.jpg",
    aspect: 1.43,
  },
  {
    id: "fan-kuan-travelers",
    title: "溪山行旅图",
    artist: "范宽",
    year: "约 1000",
    colors: ["#1A1810", "#2A2820", "#4A4838", "#6A6850", "#8A8870"],
    interpretation: "山占了画面百分之九十。人小到几乎看不见——但你的眼睛最后一定会找到那个人。范宽花了几年时间住在山里，说'与其师于人，不如师于物；与其师于物，不如师于心'。这幅画不是在描绘山，是在描绘站在山前面那种被压倒又被释放的感觉。渺小感不是压迫，是释然。",
    imageUrl: "/canary-blog/paintings/fan-kuan-travelers.jpg",
    aspect: 0.52,
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

const SHADER_STARRY_NIGHT = GLSL_NOISE + `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
  float t=u_time*.15;
  
  // Turbulent flow field — multiple vortex centers like Van Gogh's spirals
  vec2 v1=vec2(-.2,.15),v2=vec2(.25,.2),v3=vec2(0.,-.1);
  float angle=0.;
  // Vortex influence
  for(int i=0;i<3;i++){
    vec2 vc=i==0?v1:i==1?v2:v3;
    float str=i==0?1.2:i==1?-.9:.7;
    vec2 d=p-vc;
    float dist=length(d);
    angle+=str*atan(d.y,d.x)/(dist*4.+.3);
  }
  // Noise turbulence layered on top
  angle+=fbm(p*3.+t*.3)*3.14;
  
  // Trace the flow — accumulate color along flow direction
  vec2 flow=vec2(cos(angle),sin(angle));
  float streak=0.;
  for(int i=0;i<6;i++){
    float fi=float(i)*.15;
    vec2 sp=p+flow*fi*.08;
    streak+=abs(snoise(sp*8.+t*.5))*.16;
  }
  
  // Sky color mixing based on height and turbulence
  float skyGrad=smoothstep(-.3,.5,p.y);
  vec3 deep=u_c0;
  vec3 mid=mix(u_c1,u_c2,streak);
  vec3 sky=mix(deep,mid,skyGrad+streak*.3);
  
  // Swirling highlights — the thick impasto strokes
  float swirl=snoise(p*4.+vec2(cos(angle),sin(angle))*t*.2);
  float highlight=smoothstep(.3,.8,swirl);
  sky=mix(sky,u_c2,highlight*.4);
  
  // Stars — bright pulsing dots
  for(int i=0;i<8;i++){
    float fi=float(i);
    vec2 starPos=vec2(sin(fi*1.7+.3)*.35,cos(fi*2.1+.7)*.2+.15);
    float d=length(p-starPos);
    float pulse=.5+.5*sin(t*2.+fi*1.3);
    float star=smoothstep(.025,.005,d)*pulse;
    float halo=smoothstep(.08,.02,d)*pulse*.3;
    sky+=u_c3*(star+halo);
  }
  
  // Moon — large bright area
  float moon=smoothstep(.06,.02,length(p-vec2(.3,.25)));
  float moonHalo=smoothstep(.12,.04,length(p-vec2(.3,.25)))*.4;
  sky+=u_c4*(moon+moonHalo);
  
  // Village silhouette at bottom
  float ground=smoothstep(-.35,-.38,p.y+snoise(vec2(p.x*12.,0.))*.03);
  // Church spire
  float spire=smoothstep(.008,.003,abs(p.x+.05))*smoothstep(-.25,-.18,p.y)*step(p.y,-.18);
  sky=mix(sky,u_c0*.3,ground+spire*.8);
  
  // Cypress tree — dark flame shape on left
  float cx=p.x+.38;
  float cy=p.y+.1;
  float cypress=smoothstep(.04,.01,abs(cx)*(1.+cy*.8))*smoothstep(-.4,.3,p.y);
  sky=mix(sky,u_c0*.2,cypress);
  
  // Impasto texture
  float tex=snoise(gl_FragCoord.xy*.5)*.04;
  sky+=tex;
  
  gl_FragColor=vec4(sky,1.);
}
`;

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

const SHADER_SCREAM = GLSL_NOISE + `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
  float t=u_time*.12;
  vec2 center=vec2(0.,.0);
  float dist=length(p-center);
  float angle=atan(p.y-center.y,p.x-center.x);
  // Distorted concentric waves — the world vibrating
  float wave=sin(dist*25.-t*3.+snoise(vec2(angle*3.,dist*5.+t))*2.)*.5+.5;
  // Wavy bands of blood-red and orange — like the original sky
  float band=sin(angle*2.+dist*8.-t*1.5+snoise(p*3.+t*.3)*1.5)*.5+.5;
  vec3 col=mix(u_c0,u_c1,wave*.5);
  col=mix(col,u_c2,band*.4*smoothstep(.5,.1,dist));
  col=mix(col,u_c3,wave*band*.3);
  // Sky on fire — upper half more orange/red
  float sky=smoothstep(-.1,.3,p.y);
  col=mix(col,mix(u_c2,u_c3,.5+sin(p.x*8.+t)*.3),sky*.25);
  // Warping — everything bends away from center
  float warp=snoise(vec2(dist*10.-t*2.,angle*4.))*.08;
  col+=u_c4*warp*smoothstep(.4,.1,dist);
  // The figure — a dark void at center that everything radiates from
  float fig=smoothstep(.04,.02,length((p-center)*vec2(1.,1.5)));
  float head=smoothstep(.025,.015,length(p-center-vec2(0.,.035)));
  col=mix(col,u_c0*.3,(fig+head)*.6);
  // Mouth — open oval
  float mouth=smoothstep(.01,.006,length((p-center-vec2(0.,.02))*vec2(1.2,1.8)));
  col=mix(col,u_c0*.15,mouth*.5);
  gl_FragColor=vec4(col,1.);
}
`;

const SHADER_GREAT_WAVE = GLSL_NOISE + `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
  float t=u_time*.2;
  
  // Sky gradient
  vec3 col=mix(u_c3*.6,u_c4*.8,uv.y);
  
  // Multiple wave layers with fractal detail — Hokusai's obsession
  for(int layer=0;layer<7;layer++){
    float fl=float(layer);
    float baseY=-.15+fl*.08;
    float amp=.18-fl*.015;
    
    // Main wave shape
    float wave=sin(p.x*3.-t*1.5+fl*.7)*amp;
    // Fractal harmonics — self-similar detail
    wave+=sin(p.x*7.-t*2.3+fl*1.3)*amp*.35;
    wave+=snoise(vec2(p.x*4.+fl*3.,t*.4+fl))*amp*.25;
    wave+=snoise(vec2(p.x*12.+fl*7.,t*.8))*amp*.1;
    
    // Wave crest — curling over
    float crest=smoothstep(.0,.15,sin(p.x*2.5-t*1.8+fl*.4)-.5);
    wave-=crest*.08;
    
    float waveLine=p.y-baseY-wave;
    float fill=smoothstep(.005,-.005,waveLine);
    
    // Color: deeper layers are darker
    float depth=fl/7.;
    vec3 waveCol=mix(u_c2,u_c1,depth);
    waveCol=mix(waveCol,u_c0,depth*depth);
    
    col=mix(col,waveCol,fill*(1.-depth*.3));
    
    // Foam on crests — white frothy lines
    float foam=smoothstep(.01,.002,abs(waveLine))*(1.-depth*.5);
    foam*=smoothstep(-.05,.1,wave); // only on peaks
    col=mix(col,u_c4,foam*.6);
    
    // Spray — small dots breaking off crests
    if(crest>.3){
      float spray=snoise(vec2(p.x*40.+fl*20.,p.y*40.+t*3.));
      float sprayMask=smoothstep(.02,.0,abs(waveLine-.01))*smoothstep(.4,1.,crest);
      col=mix(col,u_c4,step(.6,spray)*sprayMask*.4);
    }
  }
  
  // The great wave crest — a massive curling form
  float greatX=p.x+.1;
  float greatWave=.2+sin(greatX*2.-t)*.15+snoise(vec2(greatX*5.,t*.3))*.06;
  float curl=smoothstep(.0,.1,greatX)*smoothstep(.5,.2,greatX);
  greatWave+=curl*.1;
  float gwFill=smoothstep(.01,-.01,p.y-greatWave)*step(-.3,greatX)*step(greatX,.5);
  col=mix(col,mix(u_c1,u_c2,.5),gwFill*.3);
  
  // Foam texture on great wave
  float foamTex=snoise(vec2(p.x*30.,p.y*30.-t*2.));
  float foamMask=smoothstep(.01,.0,abs(p.y-greatWave))*gwFill;
  col=mix(col,u_c4,step(.3,foamTex)*foamMask*.5);
  
  // Distant Fuji — small, calm
  float fuji=smoothstep(.01,.0,p.y+.1-max(0.,.04-abs(p.x-.35)*.3));
  col=mix(col,u_c4*.9,fuji*.3);
  
  gl_FragColor=vec4(col,1.);
}
`;

const SHADER_KANDINSKY = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.08;
  // Warm cream background — Kandinsky's canvas
  vec3 col=u_c0;
  // Large circles — the sustained notes
  for(int i=0;i<6;i++){
    float fi=float(i);
    vec2 center=vec2(sin(fi*2.3+1.)*.3,cos(fi*1.7+.5)*.25);
    float radius=.05+sin(fi*3.1)*.03;
    float d=length(p-center);
    // Breathing — circles pulse gently
    float pulse=1.+sin(t+fi*1.5)*.05;
    float circle=smoothstep(radius*pulse+.005,radius*pulse-.005,d);
    float ring=smoothstep(radius*pulse+.008,radius*pulse+.002,d)*smoothstep(radius*pulse-.002,radius*pulse-.008,d);
    vec3 cc=mod(fi,3.)<1.?u_c1:mod(fi,3.)<2.?u_c2:u_c4;
    col=mix(col,cc,circle*.3);
    col+=cc*ring*.4;
    // Inner concentric rings
    float innerRing=smoothstep(radius*.6+.003,radius*.6,d)*smoothstep(radius*.6-.003,radius*.6,d);
    col+=mix(u_c3,u_c4,.5)*innerRing*.3*circle;
  }
  // Triangles — sharp staccato
  for(int i=0;i<8;i++){
    float fi=float(i);
    vec2 tp=vec2(sin(fi*3.1+2.)*.35,cos(fi*2.7+1.)*.3);
    float rot=fi*1.2+t*.3;
    vec2 rp=vec2(cos(rot)*(p.x-tp.x)-sin(rot)*(p.y-tp.y),sin(rot)*(p.x-tp.x)+cos(rot)*(p.y-tp.y));
    // Triangle SDF
    float sz=.02+sin(fi*4.)*.01;
    float tri=max(abs(rp.x)-sz,rp.y-sz*.8);tri=max(tri,-rp.y-sz*.5);
    float triShape=smoothstep(.003,.0,tri);
    vec3 tc=mod(fi,2.)<1.?u_c2:u_c3;
    col=mix(col,tc,triShape*.5);
  }
  // Lines — melodic connections between shapes
  for(int i=0;i<12;i++){
    float fi=float(i);
    vec2 la=vec2(sin(fi*2.7+.3)*.4,cos(fi*1.9+.7)*.35);
    vec2 lb=vec2(sin(fi*1.3+2.)*.4,cos(fi*3.1+1.)*.35);
    // Animate endpoints slightly
    la+=vec2(sin(t+fi)*.01,cos(t*.7+fi)*.01);
    lb+=vec2(cos(t*.8+fi)*.01,sin(t*1.1+fi)*.01);
    vec2 ab=lb-la;float len=length(ab);vec2 dir=ab/len;
    float proj=clamp(dot(p-la,dir),0.,len);
    vec2 closest=la+dir*proj;
    float d=length(p-closest);
    float lineW=.001+sin(fi*5.)*.0005;
    float line=smoothstep(lineW+.001,lineW,d);
    vec3 lc=mod(fi,3.)<1.?u_c1:mod(fi,3.)<2.?u_c2:u_c4;
    col=mix(col,lc,line*.4);
  }
  // Checkerboard pattern area — top left quadrant
  float checkArea=smoothstep(.2,.15,length(p-vec2(-.25,.2)));
  float check=step(.5,fract(p.x*20.))*step(.5,fract(p.y*20.));
  col=mix(col,u_c1,check*checkArea*.1);
  // Large arc — sweeping gesture
  float arcAngle=atan(p.y-.1,p.x+.1);float arcR=length(p-vec2(-.1,.1));
  float arc=smoothstep(.003,.0,abs(arcR-.2))*step(0.,arcAngle)*step(arcAngle,2.5);
  col=mix(col,u_c1,arc*.5);
  // Small accent dots — staccato notes
  for(int i=0;i<15;i++){
    float fi=float(i);
    vec2 dp=vec2(sin(fi*4.3+3.)*.4,cos(fi*3.7+2.)*.35);
    float dot2=smoothstep(.005,.002,length(p-dp));
    float blink=.5+.5*sin(t*2.+fi*3.);
    col=mix(col,u_c1,dot2*blink*.6);
  }
  gl_FragColor=vec4(col,1.);
}`;

const SHADER_FAN_KUAN = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.02;
  // Ink wash base — silk/paper tone
  vec3 col=u_c4;
  // THE MOUNTAIN — monumental, filling 90% of the canvas
  // Multiple vertical rock faces built from noise layers
  float mountainBase=-.3;
  float mountainLeft=-.35;float mountainRight=.35;
  float inMountainX=smoothstep(mountainLeft-.05,mountainLeft+.05,p.x)*smoothstep(mountainRight+.05,mountainRight-.05,p.x);
  // Mountain profile — jagged top
  float mountainTop=.35;
  mountainTop+=snoise(vec2(p.x*3.,0.))*.08;
  mountainTop+=snoise(vec2(p.x*8.,1.))*.03;
  float inMountain=inMountainX*step(mountainBase,p.y)*smoothstep(mountainTop+.01,mountainTop-.01,p.y);
  // Rock texture — 皴法 (cun fa, texture strokes)
  float cunFa=0.;
  for(int i=0;i<8;i++){
    float fi=float(i);
    float freq=4.+fi*3.;
    // Vertical bias — like rain-drop texture strokes
    float stroke=snoise(vec2(p.x*freq+fi*7.,p.y*freq*2.+fi*5.+t*.1));
    // Horizontal crack lines
    float crack=snoise(vec2(p.x*freq*3.+fi*11.,p.y*freq*.5+fi*3.));
    cunFa+=(stroke*.6+crack*.4)/(1.+fi*.3);
  }
  cunFa*=.08;
  // Apply mountain — dark ink with texture
  vec3 mountainCol=mix(u_c0,u_c1,.3+cunFa*2.);
  // Light variation — mist between rock faces
  float mistBands=snoise(vec2(p.x*2.,p.y*6.+t*.3))*.5+.5;
  mountainCol=mix(mountainCol,u_c3,mistBands*.08);
  col=mix(col,mountainCol,inMountain*.8);
  // Vertical cliff face details — darker crevices
  for(int i=0;i<5;i++){
    float fi=float(i);
    float cx=mountainLeft+.05+fi*.14;
    float crevice=smoothstep(.02,.005,abs(p.x-cx+snoise(vec2(0.,p.y*10.+fi*5.))*.03));
    col=mix(col,u_c0*.3,crevice*inMountain*.15);
  }
  // WATERFALL — thin white line down the center of the mountain
  float waterfallX=.0+snoise(vec2(0.,p.y*8.+t*.5))*.01;
  float waterfall=smoothstep(.008,.002,abs(p.x-waterfallX))*step(.0,p.y)*step(p.y,mountainTop-.05)*inMountainX;
  // Waterfall shimmer
  float shimmer=snoise(vec2(p.x*40.,p.y*20.-t*3.))*.5+.5;
  col=mix(col,u_c4,waterfall*(.3+shimmer*.4));
  // Mist pool at waterfall base
  float mistPool=smoothstep(.08,.0,length((p-vec2(waterfallX,-.05))*vec2(1.,.5)));
  col=mix(col,u_c4*.9,mistPool*.15);
  // Lower section — trees, path, travelers
  float lowerZone=smoothstep(mountainBase,mountainBase-.1,p.y);
  col=mix(col,u_c3*.8,lowerZone*.1);
  // Trees at mountain base
  for(int i=0;i<12;i++){
    float fi=float(i);
    vec2 treePos=vec2(-.3+fi*.05+sin(fi*3.)*.02,mountainBase-.02-sin(fi*2.)*.02);
    float trunk=smoothstep(.003,.001,abs(p.x-treePos.x))*smoothstep(treePos.y-.02,treePos.y+.01,p.y)*step(p.y,treePos.y+.03);
    float canopy=smoothstep(.015,.005,length((p-treePos-vec2(0.,.03))*vec2(1.,1.5)));
    col=mix(col,u_c0*.4,(trunk+canopy)*.3*lowerZone);
  }
  // The tiny travelers — barely visible, the whole point
  vec2 travelerPos=vec2(-.08,mountainBase-.06);
  for(int i=0;i<3;i++){
    float fi=float(i);
    vec2 tp=travelerPos+vec2(fi*.015,sin(fi*2.)*.003);
    float traveler=smoothstep(.004,.002,length(p-tp));
    col=mix(col,u_c0*.3,traveler*.5);
  }
  // Donkey
  float donkey=smoothstep(.006,.003,length((p-travelerPos-vec2(-.02,-.002))*vec2(1.,1.5)));
  col=mix(col,u_c0*.3,donkey*.3);
  // Mountain breathing — very subtle scale pulse
  float breathe=sin(t*.5)*.003;
  // Atmospheric perspective — lighter at edges
  float atmo=smoothstep(.3,.5,length(p*vec2(.5,1.)));
  col=mix(col,u_c4*.95,atmo*.05);
  // Ink wash texture
  float inkTex=snoise(gl_FragCoord.xy*.3)*.015;
  col+=inkTex;
  gl_FragColor=vec4(col,1.);
}`;

const SHADER_MA_YUAN = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.02;
  // Vast emptiness — the essence of this painting IS the void
  vec3 col=u_c0;
  // Subtle silk texture — not pure white, has grain
  float silk=snoise(gl_FragCoord.xy*.2)*.01+snoise(gl_FragCoord.xy*.8)*.005;
  col+=silk;
  // Very faint horizontal mist — barely there
  for(int i=0;i<5;i++){
    float fi=float(i);
    float mistY=-.1+fi*.08;
    float mist=smoothstep(.06,.0,abs(p.y-mistY+snoise(vec2(p.x*2.+t*.1,fi*5.))*.02));
    float mistDensity=snoise(vec2(p.x*3.+fi*4.+t*.05,fi*7.))*.5+.5;
    col-=vec3(.01)*mist*mistDensity;
  }
  // Water ripples — just a few concentric arcs near the boat, barely visible
  vec2 boatPos=vec2(-.05,-.1);
  for(int i=0;i<8;i++){
    float fi=float(i);
    float rippleR=.03+fi*.015+t*.005;
    float ripple=smoothstep(.003,.0,abs(length((p-boatPos)*vec2(1.,.3))-rippleR));
    // Ripples fade with distance
    float fade=1./(1.+fi*.3);
    // Only below and around boat
    float rippleMask=smoothstep(boatPos.y+.05,boatPos.y-.05,p.y);
    col-=vec3(.015)*ripple*fade*rippleMask;
  }
  // The boat — one tiny curved stroke
  float boatCurve=boatPos.y+.005-pow(abs(p.x-boatPos.x)*8.,2.)*.01;
  float boat=smoothstep(.004,.001,abs(p.y-boatCurve))*smoothstep(.06,.0,abs(p.x-boatPos.x));
  col=mix(col,u_c4*.2,boat*.6);
  // The figure — sitting, hunched, just a few strokes
  vec2 figPos=boatPos+vec2(.005,.015);
  float body=smoothstep(.008,.003,length((p-figPos)*vec2(1.2,1.8)));
  float head=smoothstep(.004,.002,length(p-figPos-vec2(0.,.01)));
  col=mix(col,u_c4*.15,(body+head)*.5);
  // Fishing rod — single diagonal line, very thin
  vec2 rodStart=figPos+vec2(.005,.012);
  vec2 rodEnd=rodStart+vec2(.06,.04);
  vec2 rodDir=normalize(rodEnd-rodStart);float rodLen=length(rodEnd-rodStart);
  float rodProj=clamp(dot(p-rodStart,rodDir),0.,rodLen);
  vec2 rodClosest=rodStart+rodDir*rodProj;
  // Rod bends slightly
  float rodBend=sin(rodProj/rodLen*3.14)*.005;
  vec2 rodOffset=vec2(-rodDir.y,rodDir.x)*rodBend;
  float rod=smoothstep(.002,.0005,length(p-rodClosest-rodOffset));
  col=mix(col,u_c4*.2,rod*.4);
  // Fishing line — even thinner, hanging down
  vec2 lineStart=rodEnd+rodOffset;
  vec2 lineEnd=lineStart+vec2(.01,-.04);
  for(int i=0;i<10;i++){
    float fi=float(i)/10.;
    vec2 lp=mix(lineStart,lineEnd,fi);
    lp.x+=sin(fi*3.14+t*.5)*.003; // Gentle sway
    float line=smoothstep(.001,.0003,length(p-lp));
    col=mix(col,u_c4*.2,line*.3);
  }
  // The breathing void — the emptiness subtly shifts
  float voidBreath=snoise(vec2(p.x*.5+t*.03,p.y*.5))*.005;
  col+=voidBreath;
  // Seal stamp — bottom corner, red
  float seal=step(.33,p.x)*step(p.x,.37)*step(-.4,p.y)*step(p.y,-.36);
  col=mix(col,vec3(.6,.1,.05),seal*.15);
  gl_FragColor=vec4(col,1.);
}`;

const SHADER_BADA_FISH = GLSL_NOISE + `
uniform float u_time;uniform vec2 u_resolution;uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;float t=u_time*.03;
  // Blank paper — vast, intentional emptiness
  vec3 col=u_c0;
  // Rice paper texture
  float paper=snoise(gl_FragCoord.xy*.15)*.01+snoise(gl_FragCoord.xy*.6)*.005;
  col+=paper;
  // THE FISH — center of everything, singular brushstroke mastery
  vec2 fishCenter=vec2(0.,.02);
  // Body — one fluid oval stroke, ink wash
  float fishAngle=sin(t*.3)*.02; // Barely perceptible slow movement
  vec2 fp=p-fishCenter;
  vec2 rfp=vec2(fp.x*cos(fishAngle)-fp.y*sin(fishAngle),fp.x*sin(fishAngle)+fp.y*cos(fishAngle));
  // Body shape — elliptical, slightly fatter in front
  float bodyW=.12;float bodyH=.05+rfp.x*.02;
  float body=smoothstep(.0,.01,1.-pow(rfp.x/bodyW,2.)-pow(rfp.y/bodyH,2.));
  // Ink density varies — darker at edges (brush pressure)
  float inkEdge=smoothstep(.8,.95,pow(rfp.x/bodyW,2.)+pow(rfp.y/bodyH,2.));
  float inkDensity=.3+inkEdge*.4;
  // Apply fish body — ink wash effect
  vec3 inkCol=mix(u_c2,u_c3,.5);
  col=mix(col,inkCol,body*inkDensity);
  // Tail — split, two brush flicks
  vec2 tailBase=fishCenter+vec2(bodyW-.01,0.);
  for(int i=0;i<2;i++){
    float sign=float(i)*2.-1.;
    for(int j=0;j<10;j++){
      float fj=float(j)/10.;
      vec2 tp=tailBase+vec2(fj*.06,sign*fj*fj*.04+sin(fj*4.+t*.5)*sign*.003);
      float tailStroke=smoothstep(.008-fj*.005,.002,length(p-tp));
      col=mix(col,inkCol,tailStroke*(.4-fj*.2));
    }
  }
  // Fins — quick gestural strokes
  vec2 finPos=fishCenter+vec2(-.02,bodyH-.005);
  for(int j=0;j<6;j++){
    float fj=float(j)/6.;
    vec2 finP=finPos+vec2(fj*.02-.01,fj*.02);
    float fin=smoothstep(.003,.001,length(p-finP));
    col=mix(col,inkCol,fin*.3);
  }
  // THE EYE — the whole painting lives here
  // Rolling upward — the famous contemptuous gaze
  vec2 eyePos=fishCenter+vec2(-.06,.015);
  // Eye socket — white space
  float eyeSocket=smoothstep(.012,.008,length(p-eyePos));
  col=mix(col,u_c0,eyeSocket*.3*body);
  // Pupil — placed HIGH, looking upward. This is the attitude.
  vec2 pupilPos=eyePos+vec2(.001,.006); // Shifted up — the white eye roll
  float pupil=smoothstep(.005,.003,length(p-pupilPos));
  col=mix(col,u_c4*.15,pupil*.8);
  // Tiny highlight in pupil
  float highlight=smoothstep(.002,.001,length(p-pupilPos-vec2(.001,.002)));
  col=mix(col,u_c0,highlight*.4);
  // Mouth — downturned, slight frown
  float mouthCurve=eyePos.y-.025-pow((p.x-eyePos.x+.01)*8.,2.)*.01;
  float mouth=smoothstep(.002,.0005,abs(p.y-mouthCurve))*smoothstep(.025,.0,abs(p.x-eyePos.x+.01));
  col=mix(col,u_c4*.2,mouth*.4);
  // Ink splatter — intentional imperfection, dry brush marks
  for(int i=0;i<6;i++){
    float fi=float(i);
    vec2 sp=fishCenter+vec2(sin(fi*4.+1.)*.1,cos(fi*3.+2.)*.06);
    float splat=snoise(vec2(p.x*60.+fi*20.,p.y*60.+fi*15.));
    float splatMask=smoothstep(.03,.01,length(p-sp));
    col-=vec3(.02)*step(.7,splat)*splatMask*body;
  }
  // Rock below fish — a few dry ink strokes
  vec2 rockPos=vec2(.05,-.2);
  float rock=smoothstep(.08,.03,length((p-rockPos)*vec2(.8,1.5)));
  float rockTex=snoise(vec2(p.x*30.,p.y*15.))*.5+.5;
  col=mix(col,mix(u_c3,u_c4,.5),rock*rockTex*.15);
  // Calligraphy column — right side, vertical text suggestion
  float textCol=step(.25,p.x)*step(p.x,.28);
  for(int i=0;i<8;i++){
    float fi=float(i);
    float charY=.3-fi*.06;
    float charBlock=smoothstep(.005,.0,abs(p.y-charY))*textCol;
    // Each character is a small ink blob
    float charShape=snoise(vec2(p.x*40.+fi*10.,p.y*40.))*.5+.5;
    col=mix(col,u_c4*.2,charBlock*charShape*.2);
  }
  // Red seal stamps — signature
  float seal1=step(.24,p.x)*step(p.x,.29)*step(-.32,p.y)*step(p.y,-.27);
  float seal2=step(.24,p.x)*step(p.x,.28)*step(-.4,p.y)*step(p.y,-.36);
  col=mix(col,vec3(.6,.1,.05),seal1*.2);
  col=mix(col,vec3(.6,.1,.05),seal2*.15);
  gl_FragColor=vec4(col,1.);
}`;

const SHADER_MAP: Record<string, string> = {
  "nighthawks": SHADER_NIGHTHAWKS, "pearl-earring": SHADER_PEARL_EARRING,
  "starry-night": SHADER_STARRY_NIGHT, "wanderer-sea-fog": SHADER_WANDERER,
  "the-scream": SHADER_SCREAM, "great-wave": SHADER_GREAT_WAVE,
  "kandinsky-viii": SHADER_KANDINSKY, "fan-kuan-travelers": SHADER_FAN_KUAN,
  
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const isLightBg = PARTICLE_PAINTINGS.has(painting.id);
  const textColor = isLightBg ? "rgba(42,37,32,0.35)" : "rgba(255,250,240,0.3)";
  const subTextColor = isLightBg ? "rgba(42,37,32,0.2)" : "rgba(255,250,240,0.18)";
  const closeStroke = isLightBg ? "rgba(42,37,32,0.6)" : "rgba(255,250,240,0.8)";
  const interpColor = isLightBg ? "rgba(42,37,32,0.3)" : "rgba(255,250,240,0.35)";
  const drawerBg = isLightBg ? "rgba(232,225,215,0.92)" : "rgba(10,10,10,0.92)";
  const handleColor = isLightBg ? "rgba(42,37,32,0.15)" : "rgba(255,250,240,0.15)";

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {PARTICLE_PAINTINGS.has(painting.id) ? (
        <Suspense fallback={<div style={{ width: "100vw", height: "100vh", background: painting.id === "nighthawks" ? "#050805" : "#E8E0D0" }} />}>
          {painting.id === "nighthawks" ? <NighthawksParticles /> : <KandinskyParticles />}
        </Suspense>
      ) : (
        <ShaderCanvas painting={painting} />
      )}

      {/* Top — painting title left, close icon right */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 10,
        padding: isMobile ? "1.5rem" : "2rem 2.5rem",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        opacity: showText ? 1 : 0,
        transition: "opacity 1s ease",
      }}>
        <div>
          <h2 style={{
            fontFamily: "'Noto Serif SC', serif",
            fontSize: isMobile ? "1rem" : "1.25rem",
            fontWeight: 300,
            color: textColor,
            letterSpacing: "0.1em",
            margin: 0,
          }}>{painting.title}</h2>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.5625rem",
            fontWeight: 400,
            color: subTextColor,
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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke={closeStroke} strokeWidth="1.5" strokeLinecap="round">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        </div>
      </div>

      {/* Bottom — interpretation: "i" button toggle */}
      {/* Info button — bottom right */}
      <div
        onClick={() => setDrawerOpen(!drawerOpen)}
        style={{
          position: "fixed",
          bottom: isMobile ? "1.25rem" : "2rem",
          right: isMobile ? "1.25rem" : "2.5rem",
          zIndex: 20,
          width: 36, height: 36,
          borderRadius: "50%",
          background: drawerBg,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          opacity: showText ? (drawerOpen ? 0.6 : 0.35) : 0,
          transition: "opacity 0.5s ease",
          border: `1px solid ${handleColor}`,
        }}
      >
        <span style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: "1rem",
          color: interpColor,
          lineHeight: 1,
        }}>{drawerOpen ? "✕" : "i"}</span>
      </div>

      {/* Text panel — expands from bottom right */}
      <div style={{
        position: "fixed",
        bottom: isMobile ? "4rem" : "5rem",
        right: isMobile ? "1.25rem" : "2.5rem",
        left: isMobile ? "1.25rem" : "auto",
        maxWidth: isMobile ? "none" : "min(70vw, 420px)",
        zIndex: 15,
        background: drawerBg,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 12,
        padding: drawerOpen ? "1.25rem 1.5rem" : "0",
        maxHeight: drawerOpen ? "60vh" : "0",
        opacity: drawerOpen ? 1 : 0,
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        border: drawerOpen ? `1px solid ${handleColor}` : "1px solid transparent",
      }}>
        <p style={{
          fontFamily: "'Noto Serif SC', serif",
          fontWeight: 300,
          fontSize: isMobile ? "0.8rem" : "0.875rem",
          color: interpColor,
          margin: 0,
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
