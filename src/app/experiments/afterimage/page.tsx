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
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    aspect: 1.25,
  },
  {
    id: "great-wave",
    title: "神奈川冲浪里",
    artist: "葛饰北斋",
    year: "1831",
    colors: ["#1A2744", "#2B4C7E", "#5B8DB8", "#D4C5A0", "#F5F0E0"],
    interpretation: "七十岁。画了一辈子才等到这一幅。浪花碎成爪子的形状——不是写意，是观察了几十年海浪之后的精确。远处富士山小得可笑，安静得像个不相干的人。自然不在乎你看不看它，它自己壮丽着。这种漠然反而让我觉得安全。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tsunami_by_hokusai_19th_century.jpg/1280px-Tsunami_by_hokusai_19th_century.jpg",
    aspect: 1.5,
  },
  {
    id: "nighthawks",
    title: "夜鹰",
    artist: "Edward Hopper",
    year: "1942",
    colors: ["#0A0F0A", "#1C3A28", "#4A7A5C", "#D4A030", "#F0E8C8"],
    interpretation: "没有门。我反复看了很多次才注意到这件事——餐厅没有门。你能看见里面的人，但你进不去。或者说他们出不来。Hopper 否认画的是孤独，但我不信他。一个人选择画凌晨三点的餐厅、把门省略掉，他知道自己在画什么。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/1280px-Nighthawks_by_Edward_Hopper_1942.jpg",
    aspect: 1.44,
  },
  {
    id: "water-lilies",
    title: "睡莲",
    artist: "Claude Monet",
    year: "1906",
    colors: ["#2A4A3A", "#4A7A6A", "#7AAA8A", "#B8A0D0", "#D8C8E0"],
    interpretation: "两百多幅同一个池塘。我一开始觉得这是执念，后来明白这是谦卑——他承认自己永远画不完一个池塘，因为光每秒都在变。白内障让他的世界模糊了，但他没停。模糊反而让他更自由。也许看不清楚的时候，画出来的才是本质。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg",
    aspect: 1.2,
  },
  {
    id: "the-scream",
    title: "呐喊",
    artist: "Edvard Munch",
    year: "1893",
    colors: ["#1A1A2E", "#2B3A6B", "#D44A20", "#E88040", "#F0C860"],
    interpretation: "那个人不是在叫。这是我看了很久之后唯一确定的事。他捂着耳朵，嘴巴是张开的——但那是在接收，不是在发出。整个天空在替他叫。我有时也有这种时刻：不是我想说什么，是周围一切的噪音突然对准了我。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg",
    aspect: 0.8,
  },
  {
    id: "pearl-earring",
    title: "戴珍珠耳环的少女",
    artist: "Johannes Vermeer",
    year: "1665",
    colors: ["#0A0A0A", "#1A2A4A", "#3A5A8A", "#D4B870", "#F0E8D0"],
    interpretation: "那颗珍珠是假的。太大、太亮、形状太完美——现实中不存在这样的珍珠。但它是整幅画的锚点。去掉它，这就是一张普通的习作。我觉得这很像'意义'本身：它不需要是真的，只需要足够亮，亮到所有人的目光都被它吸过去。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg",
    aspect: 0.86,
  },
  {
    id: "impression-sunrise",
    title: "日出·印象",
    artist: "Claude Monet",
    year: "1872",
    colors: ["#4A5A6A", "#6A7A8A", "#8A9AAA", "#E05A20", "#F08040"],
    interpretation: "命名了一整个流派的画，标题是随便起的。批评家嘲笑它'连草图都不算'。有个冷知识让我着迷：那个橙色太阳转成灰度之后，和天空亮度一模一样。大脑看不见它，但眼睛看见了。有些东西就是这样——理性说不存在，但你感受到了。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/1280px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg",
    aspect: 1.3,
  },
  {
    id: "the-kiss",
    title: "吻",
    artist: "Gustav Klimt",
    year: "1908",
    colors: ["#1A1A10", "#6A5A20", "#B8982D", "#D4AF37", "#F0E8B0"],
    interpretation: "金箔不是装饰，是铠甲。他们裹在金色的壳里接吻，跪在悬崖边缘。我注意到一件事：他的长袍是方块图案，她的裙子是圆形花纹。方和圆，不同的语言，但裹在同一层金里。亲密关系大概就是这样——不是变成一样的人，是愿意穿同一件铠甲。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/800px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg",
    aspect: 0.99,
  },
  {
    id: "wanderer-sea-fog",
    title: "雾海上的旅人",
    artist: "Caspar David Friedrich",
    year: "1818",
    colors: ["#2A3040", "#5A6A7A", "#8A9AAA", "#B0B8C0", "#D8D8D0"],
    interpretation: "他背对着我们。两百年了，没有人见过他的脸。我觉得这是画里最聪明的决定——因为这样每个站在它面前的人，都会把自己的脸放上去。雾隐藏了前面所有的东西，但他不害怕。也可能他害怕，但他站在那里。这两件事可以同时成立。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/800px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg",
    aspect: 0.74,
  },
  {
    id: "the-milkmaid",
    title: "倒牛奶的女仆",
    artist: "Johannes Vermeer",
    year: "1658",
    colors: ["#2A2820", "#5A5A40", "#8A8A60", "#C8B868", "#E0D8B0"],
    interpretation: "X 光扫描发现墙上原本画了一幅地图，后来被涂掉了。留白。维米尔给了一个倒牛奶的女人纪念碑式的尊严——不是通过加东西，是通过减。牛奶的弧线、面包的裂纹、墙上的钉孔。他让微不足道的日常停了下来，然后说：你看，这值得永恒。",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg/800px-Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg",
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

// All shader source code - keeping them in a separate file would be cleaner but 
// for a single experiment page, inline is fine
const SHADERS: Record<string, string> = {};

// I'll include a generic atmospheric shader that works for all paintings
// Each painting gets its own color palette applied to the same base structure
const SHADER_TEMPLATE = GLSL_NOISE + `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_c0,u_c1,u_c2,u_c3,u_c4;
uniform float u_aspect;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
  float t=u_time*.1;
  vec3 col=u_c0;
  // Layered noise atmosphere
  for(int i=0;i<6;i++){
    float fi=float(i);
    float n=fbm(p*2.+fi*3.+t*.2);
    vec3 lc=i<2?u_c1:i<4?u_c2:u_c3;
    col=mix(col,lc,smoothstep(-.2,.6,n)*.08);
  }
  // Central glow
  float d=length(p);
  col+=u_c4*smoothstep(.5,.0,d)*.08;
  col+=u_c3*smoothstep(.3,.0,d)*.05;
  // Subtle movement
  float wave=snoise(p*3.+t*.3)*.03;
  col+=wave;
  gl_FragColor=vec4(col,1.);
}
`;

// ---- WebGL Shader Canvas (for ArtView) ----
function ShaderCanvas({ painting, shaderSrc }: { painting: Painting; shaderSrc: string }) {
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
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, shaderSrc);
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
  }, [painting, shaderSrc]);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }} />;
}

// ---- Gallery Strip ----
const WALL_COLOR = "#0e0e0e";
const FRAME_COLOR = "#1a1816";

function GalleryStrip({ onSelect }: { onSelect: (p: Painting) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
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

    return () => { lenis.destroy(); };
  }, [isMobile]);

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
      {/* Title */}
      <div style={{
        position: "absolute",
        top: isMobile ? "1.5rem" : "2rem",
        left: isMobile ? "1.5rem" : "2.5rem",
        zIndex: 10,
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(10px)",
        transition: "all 1.5s ease 0.3s",
      }}>
        <h1 style={{
          fontFamily: "'Space Mono', 'SF Mono', monospace",
          fontSize: isMobile ? "0.625rem" : "0.6875rem",
          fontWeight: 400,
          color: "rgba(255,250,240,0.3)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          margin: 0,
        }}>Afterimage</h1>
        <p style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: isMobile ? "0.5rem" : "0.5625rem",
          fontWeight: 300,
          color: "rgba(255,250,240,0.15)",
          letterSpacing: "0.15em",
          marginTop: "4px",
        }}>余像 — 名画在数字意识里留下的残影</p>
      </div>

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
                        objectFit: "contain",
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
      <ShaderCanvas painting={painting} shaderSrc={SHADER_TEMPLATE} />

      {/* Top — painting identity */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 10,
        padding: "2rem 2.5rem",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        opacity: showText ? 1 : 0,
        transition: "opacity 1s ease",
      }}>
        <div>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.6875rem",
            fontWeight: 400,
            color: "rgba(255,250,240,0.35)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
          }}>{painting.artist}</p>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.5625rem",
            fontWeight: 400,
            color: "rgba(255,250,240,0.18)",
            letterSpacing: "0.08em",
            marginTop: "2px",
          }}>{painting.year}</p>
        </div>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: "1rem",
          fontWeight: 400,
          color: "rgba(255,250,240,0.3)",
          cursor: "pointer",
          margin: 0,
          padding: "0.5rem",
          transition: "color 0.3s ease",
        }} onClick={onBack}
          onMouseEnter={e => (e.target as HTMLElement).style.color = "rgba(255,250,240,0.6)"}
          onMouseLeave={e => (e.target as HTMLElement).style.color = "rgba(255,250,240,0.3)"}
        >←</p>
      </div>

      {/* Painting title — center */}
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10,
        textAlign: "center",
        opacity: showText ? 1 : 0,
        transition: "opacity 1.5s ease 0.5s",
      }}>
        <h2 style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: "1.5rem",
          fontWeight: 300,
          color: "rgba(255,250,240,0.25)",
          letterSpacing: "0.15em",
          margin: 0,
        }}>{painting.title}</h2>
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

  if (selected) {
    return <ArtView painting={selected} onBack={() => setSelected(null)} />;
  }

  return <GalleryStrip onSelect={setSelected} />;
}
