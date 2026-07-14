'use client';

import { useEffect } from 'react';

const CSS = `
:root{
  --crema:#FFF6EC;
  --crema-2:#FBE9D6;
  --fresa:#FFB3C7;
  --fresa-deep:#E8557A;
  --pistache:#B8E0C8;
  --pistache-deep:#6FB489;
  --vainilla:#FFE8B8;
  --vainilla-deep:#E0B864;
  --chocolate:#3B2318;
  --chocolate-2:#2A1810;
  --cereza:#E8557A;
  --mango:#FFD27A;
  --cajeta:#C98A4B;
  --ink:#3B2318;
  --display:'Baloo 2',system-ui,sans-serif;
  --body:'Outfit',system-ui,sans-serif;
  --ease-cream:cubic-bezier(0.25,0.8,0.25,1);
}

*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
html.lenis,html.lenis body{height:auto}
.lenis.lenis-smooth{scroll-behavior:auto !important}
.lenis.lenis-smooth [data-lenis-prevent]{overscroll-behavior:contain}
.lenis.lenis-stopped{overflow:hidden}

body{
  font-family:var(--body);
  background:var(--crema);
  color:var(--ink);
  overflow-x:hidden;
  font-weight:400;
  line-height:1.6;
}
@media (hover:hover) and (pointer:fine){
  body.has-cursor{cursor:none}
  body.has-cursor a,body.has-cursor button,body.has-cursor [data-cursor]{cursor:none}
}

::selection{background:var(--fresa);color:var(--chocolate)}

h1,h2,h3,h4{font-family:var(--display);font-weight:800;line-height:0.98;letter-spacing:-0.01em}

.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}

:focus-visible{outline:none;box-shadow:0 0 0 3px var(--crema),0 0 0 6px var(--fresa-deep);border-radius:14px}

/* ===== GRAIN ===== */
.grain{
  position:fixed;inset:-50%;width:200%;height:200%;
  pointer-events:none;z-index:9990;opacity:0.04;
  filter:url(#grain);mix-blend-mode:multiply;
  animation:grainShift 8s steps(6) infinite;
}
@keyframes grainShift{
  0%{transform:translate(0,0)}10%{transform:translate(-3%,-2%)}20%{transform:translate(2%,-4%)}
  30%{transform:translate(-2%,3%)}40%{transform:translate(3%,2%)}50%{transform:translate(-4%,-1%)}
  60%{transform:translate(2%,4%)}70%{transform:translate(-3%,2%)}80%{transform:translate(4%,-3%)}
  90%{transform:translate(-1%,3%)}100%{transform:translate(0,0)}
}

/* ===== CURSOR ===== */
.cursor-goo{
  position:fixed;top:0;left:0;width:60px;height:60px;
  pointer-events:none;z-index:9998;
  filter:url(#goo-strong);
  mix-blend-mode:multiply;
  will-change:transform;
}
.cursor-goo .blob{
  position:absolute;left:0;top:0;width:34px;height:34px;
  background:var(--fresa);border-radius:50%;
  transform:translate(-50%,-50%) scale(1);
  transition:background 0.5s var(--ease-cream);
}
.cursor-goo .dot{
  position:absolute;left:0;top:0;width:12px;height:12px;
  background:var(--cereza);border-radius:50%;
  transform:translate(-50%,-50%);
}
body.cursor-hover .cursor-goo .blob{transform:translate(-50%,-50%) scale(2.5);opacity:0.55}
body.cursor-down .cursor-goo .blob{transform:translate(-50%,-50%) scale(0.7)}
@media (hover:none),(pointer:coarse){.cursor-goo{display:none}}

/* ===== PRELOADER ===== */
.preloader{
  position:fixed;inset:0;z-index:9999;
  background:var(--crema);
  display:flex;align-items:center;justify-content:center;
  flex-direction:column;
  clip-path:url(#preDrip);
  -webkit-clip-path:url(#preDrip);
}
.preloader__goo{filter:url(#goo);position:relative;width:min(46vw,220px);height:min(46vw,220px)}
.preloader__cone{position:absolute;left:50%;top:54%;transform:translateX(-50%);width:42%;height:46%}
.preloader__scoop{
  position:absolute;left:50%;top:24%;transform:translateX(-50%);
  width:78%;height:52%;
}
.preloader__pct{
  position:absolute;bottom:14%;left:50%;transform:translateX(-50%);
  font-family:var(--display);font-weight:800;font-size:clamp(1.4rem,3vw,2rem);
  color:var(--chocolate);letter-spacing:0.02em;
  text-shadow:0 1px 0 rgba(255,255,255,0.4);
}
.preloader__pct::after{content:'%';font-size:0.7em;vertical-align:super;margin-left:1px}

/* ===== NAV ===== */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:200;
  display:flex;align-items:center;justify-content:space-between;
  padding:1.4rem clamp(1.2rem,5vw,4rem);
  mix-blend-mode:normal;
  transition:transform 0.6s var(--ease-cream);
}
.nav__brand{
  font-family:var(--display);font-weight:800;font-size:1.4rem;
  color:var(--chocolate);display:flex;align-items:center;gap:0.5rem;
  text-decoration:none;
}
.nav__brand .dot-mark{width:12px;height:12px;border-radius:50%;background:var(--fresa-deep);box-shadow:0 0 0 3px var(--crea,rgba(255,179,199,0.4))}
.nav__links{display:flex;gap:2rem;align-items:center}
.nav__links a{
  font-family:var(--body);font-weight:500;font-size:0.98rem;
  color:var(--chocolate);text-decoration:none;position:relative;
}
@media (max-width:760px){.nav__links .drip-link{display:none}.nav__links{gap:0.6rem}}

/* drip underline links */
.drip-link{position:relative;display:inline-block}
.drip-link svg{position:absolute;left:0;bottom:-6px;width:100%;height:14px;overflow:visible;pointer-events:none}
.drip-link svg path{fill:none;stroke:var(--fresa-deep);stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;opacity:0.9}
.drip-link:hover svg path,.drip-link:focus-visible svg path{stroke-dashoffset:0;transition:stroke-dashoffset 0.8s var(--ease-cream)}

/* ===== BUTTONS ===== */
.btn{
  --bc1:var(--fresa);--bc2:var(--fresa-deep);
  position:relative;display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;
  font-family:var(--display);font-weight:700;font-size:1.05rem;
  padding:1.05rem 2.2rem;border:0;border-radius:999px;
  background:linear-gradient(160deg,var(--bc1),var(--bc2));
  color:var(--chocolate);text-decoration:none;
  box-shadow:inset 0 2px 4px rgba(255,255,255,0.55),inset 0 -6px 10px rgba(59,35,24,0.12),0 12px 24px -10px rgba(232,85,122,0.55);
  transform-origin:center bottom;
  transition:transform 0.5s var(--ease-cream),box-shadow 0.5s var(--ease-cream),background 0.6s var(--ease-cream);
  will-change:transform;overflow:visible;
}
.btn .btn__label{display:inline-block;transition:transform 0.5s var(--ease-cream)}
.btn:hover{transform:scaleY(1.06) scaleX(0.98) translateY(2px);box-shadow:inset 0 2px 4px rgba(255,255,255,0.6),inset 0 -8px 14px rgba(59,35,24,0.16),0 18px 30px -12px rgba(232,85,122,0.6)}
.btn:hover .btn__label{transform:translateY(2px)}
.btn:active{transform:scaleY(0.85) scaleX(1.04)}
.btn--chocolate{--bc1:#5a3a28;--bc2:var(--chocolate);color:var(--crema);box-shadow:inset 0 2px 4px rgba(255,255,255,0.18),inset 0 -6px 10px rgba(0,0,0,0.3),0 12px 24px -10px rgba(59,35,24,0.6)}
.btn--ghost{background:transparent;color:var(--chocolate);box-shadow:inset 0 0 0 2px rgba(59,35,24,0.25)}
.btn--ghost:hover{box-shadow:inset 0 0 0 2px var(--chocolate)}
.btn__drips{position:absolute;left:12%;right:12%;bottom:-6px;height:18px;filter:url(#goo);pointer-events:none}
.btn__drips i{position:absolute;bottom:0;width:10px;height:10px;border-radius:50%;background:var(--bc2);transform:translateY(-2px) scale(0.6);opacity:0}
.btn:hover .btn__drips i{opacity:1}
.btn__drips i:nth-child(1){left:18%}
.btn__drips i:nth-child(2){left:48%;width:8px;height:8px}
.btn__drips i:nth-child(3){left:78%;width:11px;height:11px}

/* ===== LAYOUT ===== */
.wrap{max-width:1280px;margin:0 auto;padding:0 clamp(1.2rem,5vw,3rem);position:relative}
section{position:relative}

/* ===== HERO ===== */
.hero{
  min-height:100vh;display:flex;flex-direction:column;justify-content:center;
  padding-top:7rem;padding-bottom:4rem;position:relative;overflow:hidden;
}
.hero__eyebrow{
  display:inline-flex;align-items:center;gap:0.5rem;
  font-family:var(--body);font-weight:500;font-size:0.9rem;letter-spacing:0.16em;text-transform:uppercase;
  color:var(--chocolate);opacity:0.7;margin-bottom:1.2rem;
}
.hero__eyebrow .pip{width:8px;height:8px;border-radius:50%;background:var(--fresa-deep)}
.hero__title-wrap{position:relative;width:100%;max-width:1280px}
.hero__title{
  position:relative;width:100%;height:clamp(5rem,15vw,13rem);
}
.hero__title svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.hero__title .goo-text{filter:url(#goo)}
.hero__title .goo-text text{font-family:var(--display);font-weight:800;fill:var(--chocolate)}
.hero__title .goo-text .drip-circle{fill:var(--chocolate)}
.hero__sub{
  margin-top:1.6rem;max-width:42ch;font-size:clamp(1.05rem,1.6vw,1.35rem);
  color:var(--chocolate);opacity:0.85;font-weight:400;
}
.hero__ctas{margin-top:2.2rem;display:flex;gap:1rem;flex-wrap:wrap;align-items:center}

.hero__cone{
  position:absolute;right:-2%;top:14%;width:clamp(220px,32vw,460px);
  pointer-events:none;z-index:2;will-change:transform;
  transform-style:preserve-3d;
}
.hero__cone svg{width:100%;height:auto;filter:drop-shadow(0 30px 30px rgba(232,85,122,0.18))}
@media (max-width:900px){.hero__cone{position:relative;right:auto;top:auto;margin:1.5rem auto 0;width:min(60vw,300px)}}

.hero__scroll{
  position:absolute;left:50%;bottom:2rem;transform:translateX(-50%);
  display:flex;flex-direction:column;align-items:center;gap:0.5rem;
  font-family:var(--body);font-size:0.78rem;letter-spacing:0.2em;text-transform:uppercase;
  color:var(--chocolate);opacity:0.6;
}
.hero__scroll .capsule{
  width:26px;height:46px;border:2px solid var(--chocolate);border-radius:999px;
  position:relative;overflow:hidden;opacity:0.5;
}
.hero__scroll .capsule .drop{
  position:absolute;left:50%;top:8px;transform:translateX(-50%);
  width:8px;height:8px;border-radius:50%;background:var(--fresa-deep);
}

/* ===== DIVIDERS ===== */
.drip-divider{position:relative;display:block;width:100%;height:clamp(60px,9vw,120px);overflow:visible;z-index:3}
.drip-divider svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.drip-divider .fill-top{fill:var(--crema)}
.drip-divider .fill-bottom{fill:var(--fresa)}

/* ===== SECTION HEADS ===== */
.section{padding:clamp(4rem,9vw,8rem) 0;position:relative}
.section__eyebrow{
  font-family:var(--body);font-weight:600;font-size:0.82rem;letter-spacing:0.22em;text-transform:uppercase;
  color:var(--fresa-deep);margin-bottom:1rem;display:inline-block;
}
.section__title{
  font-size:clamp(2.2rem,6vw,4.6rem);color:var(--chocolate);max-width:18ch;
  margin-bottom:1rem;
}
.section__sub{font-size:clamp(1rem,1.5vw,1.2rem);color:var(--chocolate);opacity:0.75;max-width:46ch}

/* ===== SABORES ===== */
#sabores{background:var(--crema);transition:background 0.9s var(--ease-cream)}
.sabores__grid{
  margin-top:3rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.6rem;
}
.flavor{
  --fc:var(--fresa);
  position:relative;border-radius:48% 52% 55% 45% / 45% 48% 52% 55%;
  background:var(--fc);
  padding:2.2rem 1.6rem 2.4rem;min-height:340px;
  display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:0.6rem;
  box-shadow:inset 0 4px 10px rgba(255,255,255,0.5),inset 0 -10px 18px rgba(59,35,24,0.1),0 22px 40px -22px rgba(59,35,24,0.3);
  transform-style:preserve-3d;will-change:transform;
  animation:blobMorph 18s var(--ease-cream) infinite alternate;
  overflow:hidden;cursor:pointer;
}
@keyframes blobMorph{
  0%{border-radius:48% 52% 55% 45% / 45% 48% 52% 55%}
  50%{border-radius:55% 45% 48% 52% / 52% 55% 45% 48%}
  100%{border-radius:45% 55% 52% 48% / 48% 45% 55% 52%}
}
.flavor__glare{
  position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:radial-gradient(circle at var(--gx,50%) var(--gy,30%),rgba(255,255,255,0.55),transparent 55%);
  opacity:0;transition:opacity 0.5s var(--ease-cream);mix-blend-mode:soft-light;
}
.flavor:hover .flavor__glare{opacity:1}
.flavor__scoop{width:120px;height:120px;position:relative;filter:url(#goo);margin-bottom:0.4rem}
.flavor__scoop .ball{width:100%;height:88%;border-radius:50% 50% 48% 48% / 60% 60% 40% 40%;background:rgba(255,255,255,0.55);position:relative}
.flavor__scoop .ball::after{content:'';position:absolute;left:22%;top:18%;width:34%;height:30%;border-radius:50%;background:rgba(255,255,255,0.7);filter:blur(2px)}
.flavor__scoop .drip{position:absolute;left:50%;bottom:0;width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,0.55);transform:translate(-50%,-4px) scale(0);opacity:0}
.flavor:hover .flavor__scoop .drip{opacity:1}
.flavor__name{font-family:var(--display);font-weight:800;font-size:1.5rem;color:var(--chocolate);text-align:center}
.flavor__desc{font-size:0.92rem;color:var(--chocolate);opacity:0.72;text-align:center;max-width:22ch}
.flavor__price{font-family:var(--display);font-weight:700;color:var(--chocolate);font-size:1rem;margin-top:0.4rem;opacity:0.85}

/* ===== HISTORIA ===== */
#historia{background:var(--vainilla)}
.historia__grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5vw,5rem);align-items:start}
@media (max-width:880px){.historia__grid{grid-template-columns:1fr}}
.historia__visual{
  position:relative;border-radius:42% 58% 50% 50% / 55% 45% 55% 45%;
  aspect-ratio:4/5;overflow:hidden;
  box-shadow:inset 0 6px 14px rgba(255,255,255,0.5),0 30px 50px -25px rgba(59,35,24,0.4);
  animation:blobMorph 22s var(--ease-cream) infinite alternate;
}
.historia__scene{position:absolute;inset:0;width:100%;height:100%}
.historia__scene svg{width:100%;height:100%;display:block}
.historia__scene img{width:100%;height:100%;display:block;object-fit:cover}
.historia__text p{font-size:1.08rem;color:var(--chocolate);margin-bottom:1.1rem;opacity:0;max-width:42ch}
.historia__text .lead{font-family:var(--display);font-weight:700;font-size:clamp(1.4rem,2.4vw,2rem);color:var(--chocolate);margin-bottom:1.4rem;opacity:0}
.historia__sig{margin-top:1.5rem;font-family:var(--display);font-style:italic;color:var(--fresa-deep);font-size:1.1rem;opacity:0}

/* ===== PROCESO ===== */
#proceso{background:var(--pistache)}
.proceso__steps{margin-top:3.5rem;display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;position:relative}
@media (max-width:820px){.proceso__steps{grid-template-columns:1fr}}
.proceso__line{position:absolute;top:54px;left:8%;right:8%;height:40px;pointer-events:none;z-index:0}
.proceso__line svg{width:100%;height:100%;overflow:visible}
.proceso__line .track{stroke:rgba(59,35,24,0.18);stroke-width:8;stroke-linecap:round;fill:none}
.proceso__line .goo-line{filter:url(#goo)}
.proceso__line .blob-travel{fill:var(--crema);stroke:var(--chocolate);stroke-width:0}
.proceso__step{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 0.5rem}
.proceso__icon{
  width:108px;height:108px;border-radius:50%;
  background:var(--crema);display:flex;align-items:center;justify-content:center;
  box-shadow:inset 0 3px 6px rgba(255,255,255,0.7),inset 0 -8px 14px rgba(59,35,24,0.12),0 16px 26px -14px rgba(59,35,24,0.4);
  margin-bottom:1.2rem;will-change:transform;
}
.proceso__icon svg{width:60%;height:60%}
.proceso__num{font-family:var(--display);font-weight:800;color:var(--fresa-deep);font-size:0.9rem;margin-bottom:0.3rem}
.proceso__h{font-family:var(--display);font-weight:800;font-size:1.5rem;color:var(--chocolate);margin-bottom:0.4rem}
.proceso__p{font-size:0.98rem;color:var(--chocolate);opacity:0.75;max-width:26ch}

/* ===== CTA FINAL ===== */
#cta-final{background:var(--fresa);padding:clamp(5rem,11vw,9rem) 0;text-align:center;overflow:hidden}
.cta-final__title{font-size:clamp(3rem,11vw,8rem);color:var(--chocolate);line-height:0.92;position:relative;display:inline-block}
.cta-final__sub{margin:1.4rem auto 2.4rem;max-width:40ch;font-size:1.15rem;color:var(--chocolate);opacity:0.85}
.magnetic-wrap{display:inline-block;position:relative;will-change:transform}
.cta-final__decor{position:absolute;pointer-events:none}

/* ===== FOOTER ===== */
.footer{position:relative;background:var(--chocolate);color:var(--crema);padding:7rem 0 2.5rem;margin-top:-1px}
.footer__drip{position:absolute;top:calc(-1 * clamp(60px,8vw,100px));left:0;right:0;height:clamp(60px,8vw,100px);z-index:1;pointer-events:none}
.footer__drip svg{width:100%;height:100%;display:block;overflow:visible}
.footer__drip path{fill:var(--chocolate)}
.footer__grid{position:relative;z-index:2;display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:2.5rem}
@media (max-width:760px){.footer__grid{grid-template-columns:1fr}}
.footer__brand{font-family:var(--display);font-weight:800;font-size:2rem;margin-bottom:0.6rem;color:var(--vainilla)}
.footer__tag{color:rgba(255,246,236,0.7);max-width:34ch;font-size:0.98rem}
.footer h4{font-family:var(--display);color:var(--vainilla);font-size:1.1rem;margin-bottom:1rem}
.footer ul{list-style:none}
.footer li{margin-bottom:0.5rem}
.footer a{color:rgba(255,246,236,0.82);text-decoration:none;font-size:1rem;transition:color 0.4s var(--ease-cream);display:inline-block}
.footer a:hover{color:var(--fresa)}
.news{position:relative;margin-top:1.2rem}
.news__field{
  display:flex;align-items:center;gap:0.5rem;background:rgba(255,246,236,0.1);
  border:1.5px solid rgba(255,246,236,0.25);border-radius:999px;padding:0.4rem 0.5rem 0.4rem 1.2rem;
}
.news__field input{
  flex:1;background:transparent;border:0;color:var(--crema);font-family:var(--body);font-size:0.95rem;outline:none;min-width:0;
}
.news__field input::placeholder{color:rgba(255,246,236,0.5)}
.news__field button{
  flex-shrink:0;border:0;background:var(--fresa);color:var(--chocolate);
  font-family:var(--display);font-weight:700;border-radius:999px;padding:0.6rem 1.1rem;cursor:pointer;
  transition:transform 0.4s var(--ease-cream),background 0.4s var(--ease-cream);
}
.news__field button:hover{transform:scale(0.96);background:var(--fresa-deep)}
.news__msg{margin-top:0.8rem;font-size:0.88rem;color:var(--vainilla);min-height:1.2em}
.sprinkle-stage{position:absolute;inset:-40px;pointer-events:none;overflow:visible;z-index:5}
.sprinkle{position:absolute;width:6px;height:14px;border-radius:3px;opacity:0}

.footer__bottom{position:relative;z-index:2;margin-top:3.5rem;padding-top:1.6rem;border-top:1px solid rgba(255,246,236,0.15);display:flex;justify-content:space-between;flex-wrap:wrap;gap:1rem;font-size:0.84rem;color:rgba(255,246,236,0.55)}
.footer__legal a{color:rgba(255,246,236,0.55);text-decoration:none;margin-left:1.2rem}
.footer__legal a:hover{color:var(--fresa)}

/* reveal helpers */
.reveal{opacity:0;will-change:transform,opacity}
.media-clip{clip-path:circle(0% at 50% 50%);will-change:clip-path}

/* blob reveal path */
@keyframes wobble{0%,100%{border-radius:48% 52% 55% 45% / 45% 48% 52% 55%}50%{border-radius:55% 45% 48% 52% / 52% 55% 45% 48%}}

/* ===== SKIP LINK ===== */
.skip-link{
  position:fixed;top:-100px;left:1rem;z-index:10000;
  background:var(--chocolate);color:var(--crema);
  font-family:var(--display);font-weight:700;font-size:0.95rem;
  padding:0.7rem 1.4rem;border-radius:0 0 999px 999px;
  text-decoration:none;transition:top 0.5s var(--ease-cream);
  box-shadow:0 8px 20px -8px rgba(59,35,24,0.5);
}
.skip-link:focus{top:0}

/* ===== SCROLL PROGRESS DRIP ===== */
.scroll-drip{
  position:fixed;left:max(0.8rem,env(safe-area-inset-left));top:50%;transform:translateY(-50%);
  width:14px;height:min(46vh,320px);z-index:150;pointer-events:none;
  display:flex;flex-direction:column;align-items:center;
}
.scroll-drip__track{width:100%;height:100%;background:rgba(59,35,24,0.1);border-radius:999px;overflow:hidden;position:relative}
.scroll-drip__fill{
  position:absolute;left:0;right:0;top:0;height:0%;
  background:linear-gradient(180deg,var(--fresa),var(--fresa-deep));
  border-radius:999px;
  box-shadow:inset 0 2px 4px rgba(255,255,255,0.5);
}
.scroll-drip__head{
  position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);
  width:18px;height:18px;border-radius:50%;
  background:var(--fresa-deep);
  filter:url(#goo-strong);opacity:0;
}
@media (max-width:760px){.scroll-drip{display:none}}

/* ===== HERO FLOATING BUBBLES (balance the right side) ===== */
.hero__bubbles{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:hidden}
.hero__bubble{
  position:absolute;border-radius:50%;
  filter:blur(0.5px);opacity:0.85;
  box-shadow:inset 0 4px 8px rgba(255,255,255,0.5),inset 0 -6px 10px rgba(59,35,24,0.08);
  will-change:transform;
}
.hero__bubble::after{
  content:'';position:absolute;left:24%;top:18%;width:32%;height:26%;
  border-radius:50%;background:rgba(255,255,255,0.6);filter:blur(2px);
}
@media (max-width:900px){.hero__bubbles{display:none}}

/* ===== TESTIMONIOS ===== */
#testimonios{background:var(--crema);padding:clamp(4rem,8vw,7rem) 0;overflow:hidden}
.testi__head{text-align:center;max-width:640px;margin:0 auto 3rem}
.testi__head .section__title{margin-left:auto;margin-right:auto}
.testi__marquee{position:relative;width:100%;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
.testi__track{display:flex;gap:1.4rem;width:max-content;will-change:transform}
.testi__card{
  --tc:var(--fresa);
  flex:0 0 340px;background:var(--tc);color:var(--chocolate);
  border-radius:46% 54% 52% 48% / 50% 46% 54% 50%;
  padding:2rem 1.8rem 2.2rem;display:flex;flex-direction:column;gap:0.9rem;
  box-shadow:inset 0 3px 8px rgba(255,255,255,0.5),inset 0 -8px 14px rgba(59,35,24,0.1),0 20px 36px -20px rgba(59,35,24,0.3);
  animation:blobMorph 16s var(--ease-cream) infinite alternate;
  position:relative;
}
.testi__avatar{display:flex;align-items:center;gap:0.8rem}
.testi__avatar-goo{width:54px;height:54px;flex-shrink:0;filter:url(#goo);position:relative}
.testi__avatar-goo .head{position:absolute;inset:0;border-radius:50%;background:rgba(255,255,255,0.7)}
.testi__avatar-goo .head::after{content:'';position:absolute;left:22%;top:16%;width:34%;height:28%;border-radius:50%;background:rgba(255,255,255,0.85);filter:blur(1px)}
.testi__avatar-goo .drip{position:absolute;left:50%;bottom:-2px;width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,0.7);transform:translateX(-50%)}
.testi__who{font-family:var(--display);font-weight:700;font-size:1.05rem;line-height:1.1}
.testi__where{font-size:0.82rem;opacity:0.7;font-weight:500}
.testi__stars{color:var(--fresa-deep);font-size:1rem;letter-spacing:2px;margin-top:0.2rem}
.testi__quote{font-size:1.02rem;line-height:1.5;font-weight:500}
.testi__quote::before{content:'“';font-family:var(--display);font-size:1.6rem;line-height:0;vertical-align:-0.3em;color:var(--chocolate);opacity:0.4;margin-right:0.15em}
.testi__quote::after{content:'”';font-family:var(--display);font-size:1.6rem;line-height:0;vertical-align:-0.3em;color:var(--chocolate);opacity:0.4;margin-left:0.1em}
.testi__rating-row{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:0.4rem}
.testi__flavor-tag{font-family:var(--display);font-weight:600;font-size:0.78rem;background:rgba(59,35,24,0.12);padding:0.3rem 0.8rem;border-radius:999px}

/* ===== FLOATING ORDER BUBBLE ===== */
.float-order{
  position:fixed;right:max(1.2rem,env(safe-area-inset-right));bottom:max(1.2rem,env(safe-area-inset-bottom));
  z-index:180;pointer-events:none;opacity:0;transform:translateY(20px) scale(0.8);
  transition:opacity 0.6s var(--ease-cream),transform 0.6s var(--ease-cream);
  will-change:transform,opacity;
}
.float-order.is-visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
.float-order__goo{position:relative;width:74px;height:84px;filter:url(#goo-strong);cursor:pointer}
.float-order__scoop{
  position:absolute;left:50%;top:0;transform:translateX(-50%);
  width:64px;height:58px;border-radius:50% 50% 46% 46% / 60% 60% 40% 40%;
  background:linear-gradient(160deg,#FFD9E3,var(--fresa-deep));
  box-shadow:inset 0 3px 6px rgba(255,255,255,0.6),inset 0 -6px 10px rgba(59,35,24,0.18);
  display:flex;align-items:center;justify-content:center;
  font-family:var(--display);font-weight:800;font-size:0.72rem;color:var(--chocolate);
  text-align:center;line-height:1;padding-top:4px;
}
.float-order__drip{position:absolute;left:50%;bottom:6px;transform:translateX(-50%);width:14px;height:14px;border-radius:50%;background:var(--fresa-deep)}
.float-order__pulse{position:absolute;inset:0;border-radius:50%;border:2px solid var(--fresa-deep);opacity:0;animation:floatPulse 2.6s var(--ease-cream) infinite}
@keyframes floatPulse{0%{transform:scale(0.8);opacity:0.5}100%{transform:scale(1.6);opacity:0}}
.float-order__label{
  position:absolute;right:90px;top:50%;transform:translateY(-50%);
  background:var(--chocolate);color:var(--crema);font-family:var(--display);font-weight:700;font-size:0.85rem;
  padding:0.5rem 0.9rem;border-radius:999px;white-space:nowrap;
  box-shadow:0 8px 18px -8px rgba(59,35,24,0.5);opacity:0;transition:opacity 0.4s var(--ease-cream);
}
.float-order:hover .float-order__label{opacity:1}
@media (max-width:600px){.float-order__label{display:none}}

/* float-order count badge (mini-cart) */
.float-order__badge{
  position:absolute;top:-4px;right:-4px;min-width:24px;height:24px;padding:0 6px;
  background:var(--chocolate);color:var(--crema);border-radius:999px;
  font-family:var(--display);font-weight:800;font-size:0.78rem;line-height:24px;text-align:center;
  box-shadow:0 4px 10px -3px rgba(59,35,24,0.6);z-index:3;
  transform:scale(0);transform-origin:center;transition:transform 0.4s var(--ease-cream);
}
.float-order__badge.is-active{transform:scale(1)}
.float-order__badge.pulse{animation:badgePulse 0.5s var(--ease-cream)}
@keyframes badgePulse{0%{transform:scale(1)}40%{transform:scale(1.5)}100%{transform:scale(1)}}
.float-order__pop{
  position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%) translateY(8px);
  background:var(--chocolate);color:var(--crema);font-family:var(--display);font-weight:700;font-size:0.82rem;
  padding:0.5rem 0.9rem;border-radius:999px;white-space:nowrap;opacity:0;pointer-events:none;z-index:4;
  box-shadow:0 8px 18px -8px rgba(59,35,24,0.5);
}
.float-order__pop.is-show{opacity:1;transform:translateX(-50%) translateY(0);transition:opacity 0.4s var(--ease-cream),transform 0.4s var(--ease-cream)}

/* flying scoop (quick-add animation) */
.fly-scoop{
  position:fixed;width:34px;height:30px;border-radius:50% 50% 46% 46% / 60% 60% 40% 40%;
  z-index:9995;pointer-events:none;will-change:transform,opacity;
  box-shadow:inset 0 2px 4px rgba(255,255,255,0.6),inset 0 -4px 8px rgba(59,35,24,0.2);
}

/* ===== GALERIA ===== */
#galeria{background:var(--crema);padding:clamp(4rem,8vw,7rem) 0;overflow:hidden}
.gal__head{max-width:1280px;margin:0 auto 3rem;padding:0 clamp(1.2rem,5vw,3rem);text-align:center}
.gal__head .section__title{margin-left:auto;margin-right:auto}
.gal__grid{
  max-width:1280px;margin:0 auto;padding:0 clamp(1.2rem,5vw,3rem);
  display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:160px;gap:1rem;
}
@media (max-width:820px){.gal__grid{grid-template-columns:repeat(2,1fr);grid-auto-rows:140px}}
.gal__item{
  position:relative;overflow:hidden;border-radius:32% 36% 34% 30% / 38% 32% 36% 34%;
  box-shadow:inset 0 4px 10px rgba(255,255,255,0.4),0 18px 34px -22px rgba(59,35,24,0.4);
  animation:blobMorph 20s var(--ease-cream) infinite alternate;cursor:pointer;
}
.gal__item--wide{grid-column:span 2}
.gal__item--tall{grid-row:span 2}
@media (max-width:820px){.gal__item--wide{grid-column:span 2}.gal__item--tall{grid-row:span 1}}
.gal__item img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.8s var(--ease-cream),filter 0.6s var(--ease-cream);filter:saturate(1.05)}
.gal__item:hover img{transform:scale(1.08);filter:saturate(1.15) brightness(1.05)}
.gal__cap{
  position:absolute;left:0;right:0;bottom:0;padding:1.6rem 1rem 0.8rem;
  background:linear-gradient(0deg,rgba(59,35,24,0.7),transparent);
  color:var(--crema);font-family:var(--display);font-weight:700;font-size:0.92rem;
  transform:translateY(100%);transition:transform 0.6s var(--ease-cream);text-align:center;
}
.gal__item:hover .gal__cap{transform:translateY(0)}

/* proceso icon hover */
.proceso__step{cursor:default}
.proceso__icon{transition:transform 0.5s var(--ease-cream)}
@media (hover:hover){.proceso__step:hover .proceso__icon{transform:translateY(-6px) scale(1.05)}}

/* nav scroll behavior */
.nav{transition:transform 0.5s var(--ease-cream),background 0.5s var(--ease-cream),box-shadow 0.5s var(--ease-cream)}
.nav.is-hidden{transform:translateY(-110%)}
.nav.is-scrolled{background:rgba(255,246,236,0.82);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 6px 24px -12px rgba(59,35,24,0.25)}
@media (max-width:760px){.nav{padding:1rem clamp(1rem,5vw,1.5rem)}}

/* reduced motion */
@media (prefers-reduced-motion:reduce){
  *{animation:none !important;transition:none !important}
  .grain{display:none}
  .cursor-goo{display:none}
  .preloader{transition:opacity 0.4s linear}
  .reveal{opacity:1 !important}
  .media-clip{clip-path:none !important}
  .scroll-drip{display:none}
  .hero__bubbles{display:none}
  .float-order{transition:opacity 0.4s linear}
}
`;

export default function Home() {
  useEffect(() => {
    const w = window as any;
    if (w.__heladoInit) return;
    w.__heladoInit = true;

    const reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = w.matchMedia('(hover: none), (pointer: coarse)').matches;

    const loadScript = (src: string) =>
      new Promise<void>((res) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => res();
        s.onerror = () => res();
        document.head.appendChild(s);
      });

    (async () => {
      if (reduce) {
        // simple fade preloader, keep content usable
        const pre = document.querySelector('.preloader') as HTMLElement | null;
        if (pre) {
          requestAnimationFrame(() => {
            pre.style.transition = 'opacity 0.5s linear';
            pre.style.opacity = '0';
            setTimeout(() => { pre.style.display = 'none'; }, 520);
          });
        }
        // reveal everything
        document.querySelectorAll('.reveal').forEach((el) => { (el as HTMLElement).style.opacity = '1'; });
        document.querySelectorAll('.media-clip').forEach((el) => { (el as HTMLElement).style.clipPath = 'none'; });
        initBaseOnly();
        return;
      }
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js');
      initFull();
    })();

    function initBaseOnly() {
      // newsletter + footer sprinkle even in reduced motion (light)
      wireNewsletter(true);
      wireDripUnderlines();
    }

    function initFull() {
      const gsap = w.gsap;
      const ScrollTrigger = w.ScrollTrigger;
      const Lenis = w.Lenis;
      gsap.registerPlugin(ScrollTrigger);

      // ---------- Lenis viscous scroll ----------
      const lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
      });
      lenis.on('scroll', ScrollTrigger.update);
      const raf = (time: number) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);

      // anchor links via lenis
      document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
          const href = (a as HTMLAnchorElement).getAttribute('href');
          if (href && href.length > 1) {
            const t = document.querySelector(href);
            if (t) { e.preventDefault(); lenis.scrollTo(t as HTMLElement, { offset: -20, duration: 1.6 }); }
          }
        });
      });

      // ---------- Nav: hide on scroll-down, show on scroll-up + scrolled state ----------
      const nav = document.querySelector('.nav') as HTMLElement;
      if (nav) {
        let lastY = 0;
        const onScroll = () => {
          const y = w.scrollY;
          if (y > 40) nav.classList.add('is-scrolled'); else nav.classList.remove('is-scrolled');
          if (y > 200 && y > lastY + 8) nav.classList.add('is-hidden');
          else if (y < lastY - 8 || y < 200) nav.classList.remove('is-hidden');
          lastY = y;
        };
        w.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      }

      // ---------- Cursor ----------
      if (!isTouch) {
        document.body.classList.add('has-cursor');
        const goo = document.querySelector('.cursor-goo') as HTMLElement;
        const blob = goo.querySelector('.blob') as HTMLElement;
        const dot = goo.querySelector('.dot') as HTMLElement;
        let mx = w.innerWidth / 2, my = w.innerHeight / 2;
        let bx = mx, by = my, dx = mx, dy = my;
        w.addEventListener('mousemove', (e: MouseEvent) => { mx = e.clientX; my = e.clientY; });
        const hoverSel = 'a,button,[data-cursor],.flavor,.proceso__icon,.magnetic-wrap .btn,input';
        document.addEventListener('mouseover', (e: MouseEvent) => {
          if ((e.target as HTMLElement).closest(hoverSel)) document.body.classList.add('cursor-hover');
        });
        document.addEventListener('mouseout', (e: MouseEvent) => {
          if ((e.target as HTMLElement).closest(hoverSel)) document.body.classList.remove('cursor-hover');
        });
        document.addEventListener('mousedown', () => document.body.classList.add('cursor-down'));
        document.addEventListener('mouseup', () => document.body.classList.remove('cursor-down'));
        const tick = () => {
          bx += (mx - bx) * 0.12; by += (my - by) * 0.12;
          dx += (mx - dx) * 0.28; dy += (my - dy) * 0.28;
          goo.style.transform = `translate(${bx}px,${by}px)`;
          blob.style.transform = `translate(-50%,-50%) scale(${document.body.classList.contains('cursor-hover') ? 2.5 : document.body.classList.contains('cursor-down') ? 0.7 : 1})`;
          dot.style.transform = `translate(${dx - bx}px,${dy - by}px) translate(-50%,-50%)`;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }

      // ---------- Preloader melt ----------
      const pre = document.querySelector('.preloader') as HTMLElement;
      const scoop = pre.querySelector('.preloader__scoop') as HTMLElement;
      const pctEl = pre.querySelector('.preloader__pct') as HTMLElement;
      const disp = document.querySelector('#melt-displace feDisplacementMap') as any;
      const turb = document.querySelector('#melt-displace feTurbulence') as any;

      const counter = { v: 0 };
      const tl = gsap.timeline();
      tl.to(counter, {
        v: 100, duration: 1.5, ease: 'power1.inOut',
        onUpdate: () => { pctEl.textContent = String(Math.round(counter.v)); },
      }, 0);
      // scoop sags + drip forms
      tl.to(scoop, { y: 14, scaleY: 0.92, duration: 1.5, ease: 'power2.inOut', transformOrigin: 'center top' }, 0);
      tl.fromTo('.preloader__scoop .sag-drip', { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 1, ease: 'elastic.out(1,0.6)' }, 0.5);

      // melt reveal 1.5 - 3.5
      tl.to(disp, { attr: { scale: 130 }, duration: 1.4, ease: 'power2.in' }, 1.5);
      tl.to(turb, { attr: { baseFrequency: '0.02 0.04' }, duration: 1.4, ease: 'power2.in' }, 1.5);
      tl.to(pre, { y: w.innerHeight * 1.15, scaleY: 1.25, duration: 1.5, ease: 'power2.in', transformOrigin: 'center top' }, 1.7);
      tl.to(pre, { opacity: 0, duration: 0.4, ease: 'power2.out' }, 2.9);
      tl.set(pre, { display: 'none' });

      // ---------- Hero title melt-in ----------
      tl.from('.hero__eyebrow', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' }, 2.4);
      tl.from('.hero__title', { opacity: 0, duration: 0.1 }, 2.4);
      tl.from('.hero__title .goo-text text', { scale: 0.85, opacity: 0, duration: 1.2, ease: 'elastic.out(1,0.6)', transformOrigin: 'center bottom', stagger: 0.06 }, 2.5);
      tl.from('.hero__sub', { y: 26, opacity: 0, duration: 1, ease: 'power3.out' }, 3.0);
      tl.from('.hero__ctas .btn', { y: 22, opacity: 0, duration: 0.9, ease: 'elastic.out(1,0.7)', stagger: 0.12 }, 3.2);
      tl.from('.hero__cone', { y: 40, opacity: 0, rotation: 6, duration: 1.4, ease: 'elastic.out(1,0.6)' }, 2.6);
      tl.from('.hero__scroll', { opacity: 0, y: -10, duration: 0.8, ease: 'power3.out' }, 3.4);

      // ---------- Hero title drips loop ----------
      const dripLayer = document.querySelector('.hero__title .goo-text') as any;
      const titleDrips = dripLayer ? Array.from(dripLayer.querySelectorAll('.drip-circle')) : [];
      const ns = 'http://www.w3.org/2000/svg';
      const titleText = dripLayer ? dripLayer.querySelector('text') : null;
      function spawnTitleDrip() {
        if (!dripLayer || !titleText) return;
        const vb = (dripLayer.closest('svg') as any).viewBox.baseVal;
        const x = 80 + Math.random() * (vb.width - 160);
        const c = document.createElementNS(ns, 'circle');
        c.setAttribute('cx', String(x));
        c.setAttribute('cy', String(vb.height * 0.62));
        c.setAttribute('r', String(4 + Math.random() * 5));
        c.setAttribute('class', 'drip-circle');
        c.setAttribute('fill', 'var(--chocolate)');
        dripLayer.appendChild(c);
        const startCy = vb.height * 0.62;
        const endCy = vb.height + 40;
        gsap.to(c, {
          attr: { cy: endCy }, duration: 1.8 + Math.random() * 1.2, ease: 'power1.in',
          onUpdate: () => { c.setAttribute('r', String(parseFloat(c.getAttribute('r')) * 0.998)); },
        });
        gsap.to(c, { attr: { r: 1 }, duration: 0.6, ease: 'power2.in', delay: 1.4 });
        gsap.to(c, { opacity: 0, duration: 0.4, onComplete: () => c.remove(), delay: 2.0 });
      }
      // ambient drip every 6-9s
      function ambientLoop() {
        spawnTitleDrip();
        gsap.delayedCall(6 + Math.random() * 3, ambientLoop);
      }
      gsap.delayedCall(4, ambientLoop);

      // ---------- Hero cone cursor tilt ----------
      const cone = document.querySelector('.hero__cone') as HTMLElement;
      if (cone && !isTouch) {
        let tx = 0, ty = 0, cx = 0, cy = 0;
        w.addEventListener('mousemove', (e: MouseEvent) => {
          const rx = (e.clientX / w.innerWidth - 0.5) * 2;
          const ry = (e.clientY / w.innerHeight - 0.5) * 2;
          tx = rx * 6; ty = ry * -6;
        });
        const coneTick = () => {
          cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
          cone.style.transform = `perspective(900px) rotateY(${cx}deg) rotateX(${cy}deg)`;
          requestAnimationFrame(coneTick);
        };
        requestAnimationFrame(coneTick);
      }

      // ---------- Buttons squish + drips ----------
      document.querySelectorAll('.btn').forEach((btn) => {
        const drips = btn.querySelectorAll('.btn__drips i');
        btn.addEventListener('mouseenter', () => {
          drips.forEach((d, i) => {
            gsap.fromTo(d, { y: -6, scaleY: 0.4, opacity: 0 }, {
              y: 14 + i * 4, scaleY: 1.2, opacity: 1, duration: 0.7, ease: 'elastic.out(1,0.6)', delay: i * 0.06,
            });
          });
        });
        btn.addEventListener('mouseleave', () => {
          drips.forEach((d) => gsap.to(d, { y: 22, opacity: 0, duration: 0.5, ease: 'power2.in' }));
        });
        btn.addEventListener('click', () => {
          gsap.timeline()
            .to(btn, { scaleY: 0.85, scaleX: 1.04, duration: 0.12, ease: 'power2.out' })
            .to(btn, { scaleY: 1, scaleX: 1, duration: 0.7, ease: 'elastic.out(1,0.4)' });
        });
      });

      // ---------- Drip underlines ----------
      wireDripUnderlines(gsap);

      // ---------- Section divider morph (hero -> sabores) ----------
      const morphPath = document.querySelector('#dividerMorphPath') as any;
      if (morphPath) {
        const d1 = morphPath.getAttribute('d');
        const d2 = 'M0,0 L1440,0 L1440,40 C1320,70 1200,20 1080,55 C960,90 840,30 720,60 C600,90 480,25 360,58 C240,90 120,30 0,55 Z';
        gsap.to(morphPath, { attr: { d: d2 }, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      }

      // ---------- Scroll reveals (scoop in) ----------
      gsap.utils.toArray('.reveal').forEach((el: any) => {
        gsap.fromTo(el, { y: 60, rotation: -3, opacity: 0, scale: 0.94 }, {
          y: 0, rotation: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'elastic.out(1,0.7)',
          scrollTrigger: { trigger: el, start: 'top 86%' },
        });
      });

      // media clip reveals (blob)
      gsap.utils.toArray('.media-clip').forEach((el: any) => {
        gsap.to(el, {
          clipPath: 'circle(75% at 50% 50%)', duration: 1.4, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 80%' },
        });
      });

      // ---------- Flavor cards: tilt + tint + drip + quick-add ----------
      const sabores = document.querySelector('#sabores');
      const flavorData: Record<string, string> = {
        Fresa: '#FFD4DF', 'Vainilla de Papantla': '#FFEFC9', Pistache: '#CFEEDB',
        'Chocolate Oaxaqueño': '#E9C9A8', 'Mango con Chile': '#FFE2A8', Cajeta: '#E6C39A',
      };
      const flavorColor: Record<string, string> = {
        Fresa: '#FFB3C7', 'Vainilla de Papantla': '#FFE8B8', Pistache: '#B8E0C8',
        'Chocolate Oaxaqueño': '#8a5a3c', 'Mango con Chile': '#FFD27A', Cajeta: '#C98A4B',
      };
      // mini-cart state
      const cartBadge = document.querySelector('.float-order__badge') as HTMLElement;
      const cartPop = document.querySelector('.float-order__pop') as HTMLElement;
      const floatOrderEl = document.querySelector('.float-order') as HTMLElement;
      let cartCount = 0;
      const updateCart = (flavorName: string) => {
        cartCount += 1;
        if (cartBadge) {
          cartBadge.textContent = String(cartCount);
          cartBadge.classList.add('is-active');
          cartBadge.classList.remove('pulse');
          void cartBadge.offsetWidth; // reflow to restart animation
          cartBadge.classList.add('pulse');
        }
        if (cartPop && floatOrderEl) {
          cartPop.textContent = `+1 ${flavorName} 🍦`;
          cartPop.classList.add('is-show');
          floatOrderEl.classList.add('is-visible');
          clearTimeout((cartPop as any)._t);
          (cartPop as any)._t = setTimeout(() => cartPop.classList.remove('is-show'), 1600);
        }
      };
      const flyScoop = (fromEl: HTMLElement, color: string) => {
        const fr = fromEl.getBoundingClientRect();
        const target = floatOrderEl ? floatOrderEl.getBoundingClientRect() : { left: w.innerWidth - 60, top: w.innerHeight - 60, width: 60, height: 60 };
        const scoop = document.createElement('div');
        scoop.className = 'fly-scoop';
        scoop.style.background = `linear-gradient(160deg, ${color}, ${color})`;
        scoop.style.left = (fr.left + fr.width / 2 - 17) + 'px';
        scoop.style.top = (fr.top + fr.height / 2 - 15) + 'px';
        document.body.appendChild(scoop);
        const dx = (target.left + target.width / 2) - (fr.left + fr.width / 2);
        const dy = (target.top + target.height / 2) - (fr.top + fr.height / 2);
        gsap.timeline({
          onComplete: () => scoop.remove(),
        })
          .to(scoop, { y: -60, duration: 0.35, ease: 'power2.out' })
          .to(scoop, { x: dx, y: dy, duration: 0.7, ease: 'power1.in' })
          .to(scoop, { scale: 0.3, opacity: 0, duration: 0.25, ease: 'power2.in' });
      };
      document.querySelectorAll('.flavor').forEach((card) => {
        const name = (card.querySelector('.flavor__name') as HTMLElement)?.textContent?.trim() || '';
        const tint = flavorData[name] || '#FFEAD7';
        if (!isTouch) {
          card.addEventListener('mousemove', (e: MouseEvent) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            card.style.setProperty('--gx', `${px * 100}%`);
            card.style.setProperty('--gy', `${py * 100}%`);
            gsap.to(card, { rotateY: (px - 0.5) * 16, rotateX: -(py - 0.5) * 16, duration: 0.4, ease: 'power2.out', transformPerspective: 1000 });
          });
          card.addEventListener('mouseleave', () => {
            gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'elastic.out(1,0.5)' });
          });
        }
        card.addEventListener('mouseenter', () => {
          if (sabores) gsap.to(sabores, { backgroundColor: tint, duration: 0.8, ease: 'power2.out' });
          const drip = card.querySelector('.flavor__scoop .drip') as HTMLElement;
          if (drip) gsap.fromTo(drip, { scaleY: 0.3, opacity: 0 }, { scaleY: 1, opacity: 1, y: 18, duration: 0.9, ease: 'elastic.out(1,0.6)', transformOrigin: 'center top' });
        });
        card.addEventListener('mouseleave', () => {
          if (sabores) gsap.to(sabores, { backgroundColor: '#FFF6EC', duration: 0.9, ease: 'power2.out' });
          const drip = card.querySelector('.flavor__scoop .drip') as HTMLElement;
          if (drip) gsap.to(drip, { opacity: 0, y: 26, duration: 0.5, ease: 'power2.in' });
        });
        // quick-add to mini-cart on click
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        const addFlavor = () => {
          const color = flavorColor[name] || '#FFB3C7';
          flyScoop(card as HTMLElement, color);
          // card squash feedback
          gsap.timeline()
            .to(card, { scaleY: 0.92, scaleX: 1.05, duration: 0.12, ease: 'power2.out' })
            .to(card, { scaleY: 1, scaleX: 1, duration: 0.6, ease: 'elastic.out(1,0.4)' });
          setTimeout(() => updateCart(name), 700);
        };
        card.addEventListener('click', addFlavor);
        card.addEventListener('keydown', (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addFlavor(); } });
      });

      // ---------- Historia pinned image swap ----------
      const scenes = gsap.utils.toArray('.historia__scene');
      if (scenes.length) {
        scenes.forEach((sc: any, i) => {
          gsap.set(sc, { opacity: i === 0 ? 1 : 0, clipPath: i === 0 ? 'circle(75% at 50% 50%)' : 'circle(0% at 50% 50%)' });
        });
        ScrollTrigger.create({
          trigger: '#historia', start: 'top 60%', end: 'bottom 70%', scrub: 1,
          onUpdate: (self: any) => {
            const p = self.progress;
            const seg = 1 / scenes.length;
            scenes.forEach((sc: any, i: number) => {
              if (i === 0) {
                const o = p < seg ? 1 : Math.max(0, 1 - (p - seg) / seg);
                gsap.set(sc, { opacity: o, clipPath: `circle(${75 * o}% at 50% 50%)` });
              } else {
                const local = (p - i * seg) / seg;
                const o = Math.max(0, Math.min(1, local));
                gsap.set(sc, { opacity: o, clipPath: `circle(${75 * o}% at 50% 50%)` });
              }
            });
          },
        });
        // historia text line reveals
        gsap.utils.toArray('.historia__text .lead, .historia__text p, .historia__sig').forEach((el: any, i) => {
          gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: i * 0.08, scrollTrigger: { trigger: el, start: 'top 88%' } });
          gsap.set(el, { y: 20 });
        });
      }

      // ---------- Proceso gooey progress line ----------
      const travel = document.querySelector('#progresoBlob') as any;
      if (travel) {
        gsap.fromTo(travel, { attr: { cx: 60 } }, {
          attr: { cx: 1380 }, ease: 'none',
          scrollTrigger: { trigger: '#proceso', start: 'top 70%', end: 'bottom 80%', scrub: 1.2 },
        });
        // squash the blob as it travels
        gsap.to(travel, { attr: { r: 22 }, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      }
      // proceso icons pop
      gsap.utils.toArray('.proceso__icon').forEach((el: any, i) => {
        gsap.from(el, { scale: 0.6, opacity: 0, duration: 1, ease: 'elastic.out(1,0.5)', delay: i * 0.1, scrollTrigger: { trigger: el, start: 'top 85%' } });
      });

      // ---------- CTA magnetic button ----------
      const magWrap = document.querySelector('.magnetic-wrap') as HTMLElement;
      const magBtn = magWrap?.querySelector('.btn') as HTMLElement;
      if (magWrap && magBtn && !isTouch) {
        let raf2 = 0; let mx2 = 0, my2 = 0, bx2 = 0, by2 = 0;
        w.addEventListener('mousemove', (e: MouseEvent) => {
          const r = magWrap.getBoundingClientRect();
          const cxr = r.left + r.width / 2, cyr = r.top + r.height / 2;
          const dist = Math.hypot(e.clientX - cxr, e.clientY - cyr);
          if (dist < 160) {
            mx2 = (e.clientX - cxr) * 0.4; my2 = (e.clientY - cyr) * 0.4;
          } else { mx2 = 0; my2 = 0; }
        });
        const mag = () => {
          bx2 += (mx2 - bx2) * 0.18; by2 += (my2 - by2) * 0.18;
          magBtn.style.transform = `translate(${bx2}px,${by2}px)`;
          raf2 = requestAnimationFrame(mag);
        };
        mag();
      }

      // ---------- Footer sprinkle ----------
      wireNewsletter(false, gsap);

      // ---------- Footer drip top wobble ----------
      const fdrip = document.querySelector('#footerDripPath') as any;
      if (fdrip) {
        const a = fdrip.getAttribute('d');
        const b = 'M0,0 L1440,0 L1440,100 C1320,100 1280,52 1200,100 C1120,100 1080,46 1000,100 C920,100 880,54 800,100 C720,100 680,48 600,100 C520,100 480,52 400,100 C320,100 280,46 200,100 C120,100 80,54 0,100 L0,0 Z';
        gsap.to(fdrip, { attr: { d: b }, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      }

      // hero scroll drop
      const scrollDrop = document.querySelector('.hero__scroll .drop') as HTMLElement;
      if (scrollDrop) {
        gsap.timeline({ repeat: -1 })
          .fromTo(scrollDrop, { y: 0, opacity: 0.9, scaleY: 0.7 }, { y: 18, opacity: 1, scaleY: 1.3, duration: 1.1, ease: 'power1.in' })
          .to(scrollDrop, { y: 30, opacity: 0, scaleY: 0.5, duration: 0.5, ease: 'power2.in' })
          .set(scrollDrop, { y: 0, opacity: 0 });
      }

      // ---------- Hero floating bubbles (balance + ambient) ----------
      const bubbleColors = ['var(--fresa)', 'var(--vainilla)', 'var(--pistache)', 'var(--mango)'];
      const bubbleField = document.querySelector('.hero__bubbles');
      if (bubbleField && !isTouch) {
        const bubbles = Array.from(bubbleField.querySelectorAll('.hero__bubble'));
        bubbles.forEach((b, i) => {
          gsap.to(b, {
            y: () => '+=' + (30 + Math.random() * 40),
            x: () => '+=' + (Math.random() * 30 - 15),
            duration: 5 + Math.random() * 4,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
          gsap.from(b, { opacity: 0, scale: 0.6, duration: 1.2, ease: 'elastic.out(1,0.6)', delay: 3 + i * 0.3 });
        });
      }

      // ---------- Scroll progress drip ----------
      const dripFill = document.querySelector('.scroll-drip__fill') as HTMLElement;
      const dripHead = document.querySelector('.scroll-drip__head') as HTMLElement;
      if (dripFill && dripHead) {
        const updateDrip = () => {
          const st = document.documentElement.scrollTop;
          const max = document.documentElement.scrollHeight - w.innerHeight;
          const p = max > 0 ? Math.min(1, Math.max(0, st / max)) : 0;
          dripFill.style.height = (p * 100) + '%';
          dripHead.style.opacity = p > 0.02 && p < 0.98 ? '1' : '0';
        };
        updateDrip();
        w.addEventListener('scroll', updateDrip, { passive: true });
      }

      // ---------- Floating order bubble (appear after hero, hide at footer) ----------
      const floatOrder = document.querySelector('.float-order') as HTMLElement;
      if (floatOrder) {
        ScrollTrigger.create({
          trigger: '.hero', start: 'bottom 80%',
          onEnter: () => floatOrder.classList.add('is-visible'),
          onLeaveBack: () => floatOrder.classList.remove('is-visible'),
        });
        // hide when footer is in view (don't cover newsletter)
        ScrollTrigger.create({
          trigger: '.footer', start: 'top 90%',
          onEnter: () => floatOrder.classList.remove('is-visible'),
          onLeaveBack: () => floatOrder.classList.add('is-visible'),
        });
        // hover swell on the scoop
        const scoopEl = floatOrder.querySelector('.float-order__scoop') as HTMLElement;
        floatOrder.addEventListener('mouseenter', () => {
          gsap.to(scoopEl, { scale: 1.12, duration: 0.5, ease: 'elastic.out(1,0.5)', transformOrigin: 'center bottom' });
        });
        floatOrder.addEventListener('mouseleave', () => {
          gsap.to(scoopEl, { scale: 1, duration: 0.6, ease: 'elastic.out(1,0.4)' });
        });
        floatOrder.addEventListener('click', () => {
          gsap.timeline()
            .to(scoopEl, { scaleY: 0.82, scaleX: 1.08, duration: 0.12, ease: 'power2.out' })
            .to(scoopEl, { scaleY: 1, scaleX: 1, duration: 0.6, ease: 'elastic.out(1,0.4)' });
        });
      }

      // ---------- Testimonios marquee ----------
      const track = document.querySelector('.testi__track') as HTMLElement;
      if (track) {
        // duplicate content for seamless loop
        track.innerHTML += track.innerHTML;
        const distance = track.scrollWidth / 2;
        gsap.to(track, {
          x: -distance, duration: 38, ease: 'none', repeat: -1,
        });
        // pause on hover
        const marquee = document.querySelector('.testi__marquee') as HTMLElement;
        marquee.addEventListener('mouseenter', () => gsap.to(track, { timeScale: 0.15, duration: 0.6 }));
        marquee.addEventListener('mouseleave', () => gsap.to(track, { timeScale: 1, duration: 0.6 }));
      }

      // Refresh after load
      w.addEventListener('load', () => ScrollTrigger.refresh());
      gsap.delayedCall(4, () => ScrollTrigger.refresh());
    }

    function wireDripUnderlines(gsap?: any) {
      document.querySelectorAll('.drip-link').forEach((el) => {
        const path = el.querySelector('svg path') as any;
        if (!path) return;
        try {
          const len = path.getTotalLength();
          path.style.strokeDasharray = String(len);
          path.style.strokeDashoffset = String(len);
          el.addEventListener('mouseenter', () => {
            if (gsap) gsap.to(path, { strokeDashoffset: 0, duration: 0.8, ease: 'power3.out' });
            else { path.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.25,0.8,0.25,1)'; path.style.strokeDashoffset = '0'; }
          });
          el.addEventListener('mouseleave', () => {
            if (gsap) gsap.to(path, { strokeDashoffset: len, duration: 0.6, ease: 'power2.in' });
            else path.style.strokeDashoffset = String(len);
          });
        } catch (e) { /* getTotalLength may fail in some setups */ }
      });
    }

    function wireNewsletter(reduced: boolean, gsap?: any) {
      const form = document.querySelector('.news__field') as HTMLElement | null;
      const input = form?.querySelector('input') as HTMLInputElement;
      const btn = form?.querySelector('button') as HTMLElement;
      const msg = document.querySelector('.news__msg') as HTMLElement;
      const stage = document.querySelector('.sprinkle-stage') as HTMLElement;
      if (!form || !input || !btn || !msg) return;
      const submit = () => {
        const val = input.value.trim();
        if (!val || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) {
          msg.textContent = 'Ups, ese correo parece medio derretido. ¿Lo revisas?';
          msg.style.color = '#FFB3C7';
          return;
        }
        msg.textContent = '¡Gracia! Te avisamos en cuanto salga un sabor nuevo. 🍦';
        msg.style.color = '#FFE8B8';
        input.value = '';
        // sprinkle burst
        if (stage) {
          const colors = ['#FFB3C7', '#FFE8B8', '#B8E0C8', '#E8557A', '#FFD27A', '#C98A4B'];
          const r = btn.getBoundingClientRect();
          const sr = stage.getBoundingClientRect();
          const ox = r.left + r.width / 2 - sr.left;
          const oy = r.top + r.height / 2 - sr.top;
          for (let i = 0; i < 26; i++) {
            const s = document.createElement('div');
            s.className = 'sprinkle';
            s.style.background = colors[i % colors.length];
            s.style.left = ox + 'px';
            s.style.top = oy + 'px';
            s.style.transform = `rotate(${Math.random() * 360}deg)`;
            stage.appendChild(s);
            const ang = Math.random() * Math.PI - Math.PI;
            const dist = 40 + Math.random() * 110;
            const tx = Math.cos(ang) * dist;
            const ty = Math.sin(ang) * dist - 40;
            if (reduced || !gsap) {
              s.style.transition = 'transform 0.9s cubic-bezier(0.2,0.7,0.3,1),opacity 0.9s';
              requestAnimationFrame(() => { s.style.transform = `translate(${tx}px,${ty + 120}px) rotate(${Math.random()*360}deg)`; s.style.opacity = '0'; });
              setTimeout(() => s.remove(), 950);
            } else {
              gsap.to(s, { x: tx, y: ty + 120, rotation: Math.random() * 540, duration: 0.9, ease: 'power2.out' });
              gsap.to(s, { y: '+=140', opacity: 0, duration: 0.8, ease: 'power1.in', delay: 0.45 });
              gsap.to(s, { opacity: 0, duration: 0.4, delay: 1.1, onComplete: () => s.remove() });
            }
          }
        }
      };
      btn.addEventListener('click', (e) => { e.preventDefault(); submit(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    }
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ===== SVG FILTERS (defined once) ===== */}
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <defs>
          <filter id="goo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
          <filter id="goo-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
          <filter id="melt-displace" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.025" numOctaves="2" seed="3" result="turb" />
            <feDisplacementMap in="SourceGraphic" in2="turb" scale="0" result="disp" />
          </filter>
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <clipPath id="preDrip" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L1,0 L1,0.96 C0.9,0.99 0.82,0.92 0.74,0.97 C0.66,1.01 0.58,0.93 0.5,0.98 C0.42,1.02 0.34,0.93 0.26,0.97 C0.18,1.01 0.1,0.94 0,0.97 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="grain" aria-hidden="true" />

      {/* ===== SKIP TO CONTENT ===== */}
      <a className="skip-link" href="#top">Saltar al contenido</a>

      {/* ===== SCROLL PROGRESS DRIP ===== */}
      <div className="scroll-drip" aria-hidden="true">
        <div className="scroll-drip__track">
          <div className="scroll-drip__fill" />
        </div>
        <div className="scroll-drip__head" />
      </div>

      {/* ===== CUSTOM CURSOR ===== */}
      <div className="cursor-goo" aria-hidden="true">
        <div className="blob" />
        <div className="dot" />
      </div>

      {/* ===== PRELOADER ===== */}
      <div className="preloader" role="status" aria-live="polite" aria-label="Cargando Helado Nube">
        <div className="preloader__goo">
          {/* cone */}
          <svg className="preloader__cone" viewBox="0 0 120 140" aria-hidden="true">
            <defs>
              <pattern id="wafflePL" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="14" height="14" fill="#E8B06A" />
                <line x1="0" y1="0" x2="14" y2="0" stroke="#C98A4B" strokeWidth="2" />
                <line x1="0" y1="0" x2="0" y2="14" stroke="#C98A4B" strokeWidth="2" />
              </pattern>
            </defs>
            <path d="M20,10 L100,10 L60,138 Z" fill="url(#wafflePL)" stroke="#B5783B" strokeWidth="2" />
            <path d="M20,10 L100,10 L60,138 Z" fill="rgba(59,35,24,0.12)" />
          </svg>
          {/* scoop */}
          <div className="preloader__scoop" style={{ filter: 'url(#goo)' }}>
            <svg viewBox="0 0 200 160" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
              <ellipse cx="100" cy="80" rx="86" ry="72" fill="#FFB3C7" />
              <ellipse cx="70" cy="55" rx="30" ry="20" fill="rgba(255,255,255,0.55)" />
              <circle className="sag-drip" cx="100" cy="150" r="14" fill="#FFB3C7" style={{ transformOrigin: '100px 140px' }} />
            </svg>
          </div>
        </div>
        <div className="preloader__pct">0</div>
      </div>

      {/* ===== NAV ===== */}
      <header className="nav">
        <a className="nav__brand drip-link" href="#top" aria-label="Helado Nube, inicio">
          <span className="dot-mark" />
          Helado Nube
        </a>
        <nav className="nav__links" aria-label="Principal">
          <a className="drip-link" href="#sabores">Sabores</a>
          <a className="drip-link" href="#galeria">Galería</a>
          <a className="drip-link" href="#historia">Historia</a>
          <a className="drip-link" href="#proceso">Proceso</a>
          <a className="drip-link" href="#cta-final">Contacto</a>
          <a className="btn" href="#cta-final" style={{ padding: '0.7rem 1.4rem', fontSize: '0.95rem' }}>
            <span className="btn__label">Ordenar</span>
            <span className="btn__drips"><i /><i /><i /></span>
          </a>
        </nav>
      </header>

      <main id="top">
        {/* ===== HERO ===== */}
        <section className="hero wrap" aria-labelledby="hero-title">
          <h1 id="hero-title" className="sr-only">Helado Nube</h1>
          {/* Floating flavor bubbles — balance the right side & add ambient melt life */}
          <div className="hero__bubbles" aria-hidden="true">
            <span className="hero__bubble" style={{ width: 64, height: 64, top: '8%', right: '4%', background: 'var(--fresa)' }} />
            <span className="hero__bubble" style={{ width: 38, height: 38, top: '24%', right: '22%', background: 'var(--vainilla)' }} />
            <span className="hero__bubble" style={{ width: 52, height: 52, top: '52%', right: '10%', background: 'var(--pistache)' }} />
            <span className="hero__bubble" style={{ width: 30, height: 30, top: '68%', right: '28%', background: 'var(--mango)' }} />
            <span className="hero__bubble" style={{ width: 26, height: 26, top: '38%', right: '36%', background: 'var(--fresa)' }} />
          </div>
          <span className="hero__eyebrow">
            <span className="pip" /> Helado artesanal · Hecho en México
          </span>
          <div className="hero__title-wrap">
            <div className="hero__title" aria-hidden="true">
              <svg viewBox="0 0 1200 280" preserveAspectRatio="xMidYMid meet">
                <g className="goo-text">
                  <text x="600" y="205" textAnchor="middle" fontSize="260" letterSpacing="-6">HELADO</text>
                  <circle className="drip-circle" cx="180" cy="210" r="6" fill="var(--chocolate)" />
                  <circle className="drip-circle" cx="430" cy="212" r="5" fill="var(--chocolate)" />
                  <circle className="drip-circle" cx="760" cy="208" r="7" fill="var(--chocolate)" />
                  <circle className="drip-circle" cx="1010" cy="212" r="5" fill="var(--chocolate)" />
                </g>
              </svg>
            </div>
            <div className="hero__title" aria-hidden="true" style={{ marginTop: '-2rem' }}>
              <svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMid meet">
                <g className="goo-text">
                  <text x="600" y="175" textAnchor="middle" fontSize="190" letterSpacing="-2">NUBE</text>
                  <circle className="drip-circle" cx="320" cy="180" r="6" fill="var(--chocolate)" />
                  <circle className="drip-circle" cx="620" cy="182" r="7" fill="var(--chocolate)" />
                  <circle className="drip-circle" cx="880" cy="178" r="5" fill="var(--chocolate)" />
                </g>
              </svg>
            </div>
          </div>
          <p className="hero__sub">
            Helado artesanal hecho a mano, lento y con nube. Cada bola se derrite despacito,
            como debe ser. Sabor de mercado, textura de abuela.
          </p>
          <div className="hero__ctas">
            <a className="btn" href="#cta-final">
              <span className="btn__label">Ordenar ahora</span>
              <span className="btn__drips"><i /><i /><i /></span>
            </a>
            <a className="btn btn--ghost" href="#sabores">
              <span className="btn__label">Ver sabores</span>
              <span className="btn__drips"><i /><i /><i /></span>
            </a>
          </div>

          {/* Decorative cone */}
          <div className="hero__cone" aria-hidden="true">
            <svg viewBox="0 0 260 420">
              <defs>
                <linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#F0C074" />
                  <stop offset="1" stopColor="#C98A4B" />
                </linearGradient>
                <linearGradient id="scoop1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FFD9E3" />
                  <stop offset="1" stopColor="#FFB3C7" />
                </linearGradient>
                <linearGradient id="scoop2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FFF1CF" />
                  <stop offset="1" stopColor="#FFE8B8" />
                </linearGradient>
                <linearGradient id="scoop3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#D6F2E1" />
                  <stop offset="1" stopColor="#B8E0C8" />
                </linearGradient>
                <pattern id="waffle" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="16" height="16" fill="url(#coneGrad)" />
                  <line x1="0" y1="0" x2="16" y2="0" stroke="#B5783B" strokeWidth="2.5" />
                  <line x1="0" y1="0" x2="0" y2="16" stroke="#B5783B" strokeWidth="2.5" />
                </pattern>
              </defs>
              {/* cone */}
              <path d="M70,150 L190,150 L130,405 Z" fill="url(#waffle)" stroke="#A86A30" strokeWidth="2" />
              <path d="M70,150 L190,150 L130,405 Z" fill="rgba(59,35,24,0.1)" />
              {/* drips on cone */}
              <path d="M78,152 q-6,30 4,46 q8,12 0,30" fill="none" stroke="#FFB3C7" strokeWidth="10" strokeLinecap="round" opacity="0.9" />
              <path d="M150,152 q8,24 -2,40 q-8,14 0,28" fill="none" stroke="#FFE8B8" strokeWidth="9" strokeLinecap="round" opacity="0.9" />
              {/* scoops stacked */}
              <ellipse cx="100" cy="120" rx="52" ry="44" fill="url(#scoop3)" />
              <ellipse cx="160" cy="100" rx="50" ry="42" fill="url(#scoop2)" />
              <ellipse cx="130" cy="60" rx="58" ry="48" fill="url(#scoop1)" />
              {/* highlights */}
              <ellipse cx="112" cy="44" rx="18" ry="12" fill="rgba(255,255,255,0.6)" />
              <ellipse cx="148" cy="88" rx="12" ry="8" fill="rgba(255,255,255,0.5)" />
              <ellipse cx="88" cy="108" rx="10" ry="7" fill="rgba(255,255,255,0.5)" />
              {/* cherry */}
              <circle cx="132" cy="22" r="11" fill="#E8557A" />
              <path d="M132,12 q4,-10 12,-10" fill="none" stroke="#6FB489" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <div className="hero__scroll" aria-hidden="true">
            <span>Desliza</span>
            <span className="capsule"><span className="drop" /></span>
          </div>
        </section>

        {/* ===== DIVIDER hero -> sabores (animated morph) ===== */}
        <div className="drip-divider" aria-hidden="true">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path id="dividerMorphPath" d="M0,0 L1440,0 L1440,60 C1320,90 1200,40 1080,68 C960,96 840,36 720,66 C600,96 480,30 360,62 C240,94 120,34 0,66 Z" fill="var(--fresa)" />
          </svg>
        </div>

        {/* ===== SABORES ===== */}
        <section id="sabores" className="section" aria-labelledby="sabores-title">
          <div className="wrap">
            <span className="section__eyebrow reveal">La carta</span>
            <h2 id="sabores-title" className="section__title reveal">Sabores que se derriten en la mirada</h2>
            <p className="section__sub reveal">Seis recetas de pueblo, hechas con fruta de mercado y mucho cariño. Pasa el cursor: la página sabe a lo que miras.</p>
            <div className="sabores__grid">
              <article className="flavor reveal" style={{ ['--fc' as any]: 'var(--fresa)' }} data-cursor>
                <div className="flavor__glare" />
                <div className="flavor__scoop"><div className="ball" /><div className="drip" /></div>
                <h3 className="flavor__name">Fresa</h3>
                <p className="flavor__desc">Fresas de Zamora, sin colorantes. Dulce que tiñe.</p>
                <span className="flavor__price">$65 el litro</span>
              </article>
              <article className="flavor reveal" style={{ ['--fc' as any]: 'var(--vainilla)' }} data-cursor>
                <div className="flavor__glare" />
                <div className="flavor__scoop"><div className="ball" /><div className="drip" /></div>
                <h3 className="flavor__name">Vainilla de Papantla</h3>
                <p className="flavor__desc">Vainilla veracruzana curada a mano. Floral y sedosa.</p>
                <span className="flavor__price">$72 el litro</span>
              </article>
              <article className="flavor reveal" style={{ ['--fc' as any]: 'var(--pistache)' }} data-cursor>
                <div className="flavor__glare" />
                <div className="flavor__scoop"><div className="ball" /><div className="drip" /></div>
                <h3 className="flavor__name">Pistache</h3>
                <p className="flavor__desc">Pistaches tostados al comal. Verde hoja, boca cremosa.</p>
                <span className="flavor__price">$85 el litro</span>
              </article>
              <article className="flavor reveal" style={{ ['--fc' as any]: '#E9C9A8' }} data-cursor>
                <div className="flavor__glare" />
                <div className="flavor__scoop"><div className="ball" /><div className="drip" /></div>
                <h3 className="flavor__name">Chocolate Oaxaqueño</h3>
                <p className="flavor__desc">Cacao de Oaxaca, tableta molida. Intenso y abrazador.</p>
                <span className="flavor__price">$78 el litro</span>
              </article>
              <article className="flavor reveal" style={{ ['--fc' as any]: 'var(--mango)' }} data-cursor>
                <div className="flavor__glare" />
                <div className="flavor__scoop"><div className="ball" /><div className="drip" /></div>
                <h3 className="flavor__name">Mango con Chile</h3>
                <p className="flavor__desc">Mango manila y un besito de chamoy. Pica y abraza.</p>
                <span className="flavor__price">$70 el litro</span>
              </article>
              <article className="flavor reveal" style={{ ['--fc' as any]: '#E6C39A' }} data-cursor>
                <div className="flavor__glare" />
                <div className="flavor__scoop"><div className="ball" /><div className="drip" /></div>
                <h3 className="flavor__name">Cajeta</h3>
                <p className="flavor__desc">Leche de cabra de Celaya, a fuego lento. Caramelo de rancho.</p>
                <span className="flavor__price">$74 el litro</span>
              </article>
            </div>
          </div>
        </section>

        {/* ===== DIVIDER sabores -> galeria ===== */}
        <div className="drip-divider" aria-hidden="true" style={{ height: 'clamp(40px,6vw,80px)' }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,0 L1440,0 L1440,30 C1320,60 1200,12 1080,40 C960,68 840,8 720,38 C600,68 480,10 360,40 C240,70 120,14 0,42 Z" fill="var(--crema)" />
          </svg>
        </div>

        {/* ===== GALERIA ===== */}
        <section id="galeria" aria-labelledby="gal-title">
          <div className="gal__head">
            <span className="section__eyebrow reveal">Pura crema, pura antojo</span>
            <h2 id="gal-title" className="section__title reveal" style={{ fontSize: 'clamp(2rem,5vw,3.6rem)' }}>La galería que babrea</h2>
            <p className="section__sub reveal" style={{ margin: '0 auto' }}>Fotitos de nuestra cocina y nuestro mercado. Si se te hace agua la boca, vamos bien.</p>
          </div>
          <div className="gal__grid">
            <figure className="gal__item gal__item--wide gal__item--tall reveal">
              <img src="/img/gallery-1.png" alt="Bochas de helado artesanal en colores pastel servidas en superficie cremosa" loading="lazy" />
              <figcaption className="gal__cap">Surtido del día, hecho a mano</figcaption>
            </figure>
            <figure className="gal__item reveal">
              <img src="/img/gallery-2.png" alt="Helado de mango con chile, amarillo brillante con polvo de chile" loading="lazy" />
              <figcaption className="gal__cap">Mango con chile</figcaption>
            </figure>
            <figure className="gal__item reveal">
              <img src="/img/gallery-3.png" alt="Helado de chocolate oscuro derritiéndose con salsa de chocolate" loading="lazy" />
              <figcaption className="gal__cap">Chocolate Oaxaqueño</figcaption>
            </figure>
            <figure className="gal__item reveal">
              <img src="/img/gallery-4.png" alt="Helado de cajeta en vaso con salsa de caramelo dorada" loading="lazy" />
              <figcaption className="gal__cap">Cajeta de Celaya</figcaption>
            </figure>
            <figure className="gal__item gal__item--wide reveal">
              <img src="/img/historia-2.png" alt="Sirviendo helado de vainilla con cuchara, cremoso" loading="lazy" />
              <figcaption className="gal__cap">Vainilla de Papantla, recién servida</figcaption>
            </figure>
          </div>
        </section>

        {/* ===== DIVIDER galeria -> historia ===== */}
        <div className="drip-divider" aria-hidden="true" style={{ height: 'clamp(40px,6vw,80px)' }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,0 L1440,0 L1440,30 C1320,60 1200,12 1080,40 C960,68 840,8 720,38 C600,68 480,10 360,40 C240,70 120,14 0,42 Z" fill="var(--vainilla)" />
          </svg>
        </div>

        {/* ===== HISTORIA ===== */}
        <section id="historia" className="section" aria-labelledby="historia-title">
          <div className="wrap historia__grid">
            <div className="historia__visual media-clip">
              <div className="historia__scene" data-scene="0">
                <img src="/img/historia-1.png" alt="Bochas de helado artesanal de fresa en bowl de barro, con fresas frescas" loading="lazy" />
              </div>
              <div className="historia__scene" data-scene="1">
                <img src="/img/historia-2.png" alt="Helado de vainilla con sus puntitos de vainilla, sirviéndose con cuchara" loading="lazy" />
              </div>
              <div className="historia__scene" data-scene="2">
                <img src="/img/historia-3.png" alt="Cono de helado de pistache con pistaches molidos, en un mercado soleado" loading="lazy" />
              </div>
            </div>
            <div className="historia__text">
              <span className="section__eyebrow reveal">Nuestra historia</span>
              <h2 id="historia-title" className="section__title reveal">Tres generaciones batiendo despacio</h2>
              <p className="lead">Empezó con doña Lucha, en un carrito de paletas por las calles de Pátzcuaro, allá por 1962.</p>
              <p className="reveal">Hoy seguimos con su recetario manchado de vainilla. Sin máquina industrial, sin prisa: cada tina se bate a mano y se congela con nube, como ella enseñó.</p>
              <p className="reveal">La fruta la escogemos en el mercado tempranito, cuando huele a campo y no a bodega. Por eso nuestro helado sabe a lugar, no a empaque.</p>
              <p className="reveal">Si algún día lo pruebas y se te escapa una sonrisa cremosita, ya hicimos nuestro trabajo.</p>
              <p className="historia__sig">— La familia Nube 🍦</p>
            </div>
          </div>
        </section>

        {/* ===== DIVIDER historia -> proceso ===== */}
        <div className="drip-divider" aria-hidden="true" style={{ height: 'clamp(40px,6vw,80px)' }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,0 L1440,0 L1440,20 C1320,55 1200,8 1080,36 C960,64 840,6 720,34 C600,62 480,8 360,36 C240,64 120,10 0,38 Z" fill="var(--pistache)" />
          </svg>
        </div>

        {/* ===== PROCESO ===== */}
        <section id="proceso" className="section" aria-labelledby="proceso-title">
          <div className="wrap">
            <span className="section__eyebrow reveal">Paso a paso</span>
            <h2 id="proceso-title" className="section__title reveal">El proceso, despacio y con nube</h2>
            <p className="section__sub reveal">Tres pasos que no se apuran. Cada uno le mete aire, sabor y cremosidad.</p>
            <div className="proceso__steps">
              <div className="proceso__line" aria-hidden="true">
                <svg viewBox="0 0 1440 40" preserveAspectRatio="none">
                  <path className="track" d="M60,20 L1380,20" />
                  <g className="goo-line">
                    <circle id="progresoBlob" cx="60" cy="20" r="18" className="blob-travel" />
                  </g>
                </svg>
              </div>
              <div className="proceso__step reveal">
                <div className="proceso__icon">
                  <svg viewBox="0 0 100 100" aria-hidden="true">
                    <circle cx="50" cy="42" r="26" fill="#E8557A" />
                    <path d="M44,42 q6,-8 12,0" fill="none" stroke="#3B2318" strokeWidth="3" strokeLinecap="round" />
                    <path d="M30,70 q20,18 40,0" fill="#B8E0C8" stroke="#6FB489" strokeWidth="2" />
                    <path d="M22,80 L78,80 L70,96 L30,96 Z" fill="#FFE8B8" stroke="#E0B864" strokeWidth="2" />
                  </svg>
                </div>
                <span className="proceso__num">01</span>
                <h3 className="proceso__h">Elegimos la fruta</h3>
                <p className="proceso__p">Vamos al mercado tempranito. Olemos, apretamos, probamos. Solo entra la que huele a su tierra.</p>
              </div>
              <div className="proceso__step reveal">
                <div className="proceso__icon">
                  <svg viewBox="0 0 100 100" aria-hidden="true">
                    <ellipse cx="50" cy="55" rx="34" ry="26" fill="#FFE8B8" />
                    <path d="M30,45 q20,-14 40,0" fill="none" stroke="#E0B864" strokeWidth="3" strokeLinecap="round" />
                    <path d="M28,60 q22,12 44,0" fill="none" stroke="#C98A4B" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="50" cy="30" r="7" fill="#E8557A" />
                  </svg>
                </div>
                <span className="proceso__num">02</span>
                <h3 className="proceso__h">Batimos despacio</h3>
                <p className="proceso__p">Sin prisa, con paciencia de abuela. A fuego bajito y cuchara de palo, hasta que brilla.</p>
              </div>
              <div className="proceso__step reveal">
                <div className="proceso__icon">
                  <svg viewBox="0 0 100 100" aria-hidden="true">
                    <path d="M30,30 L70,30 L70,70 q0,14 -20,14 q-20,0 -20,-14 Z" fill="#B8E0C8" stroke="#6FB489" strokeWidth="2" />
                    <circle cx="42" cy="45" r="4" fill="rgba(255,255,255,0.8)" />
                    <circle cx="58" cy="55" r="3" fill="rgba(255,255,255,0.7)" />
                    <circle cx="48" cy="62" r="3" fill="rgba(255,255,255,0.7)" />
                    <path d="M50,18 q0,-8 6,-10" fill="none" stroke="#6FB489" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="proceso__num">03</span>
                <h3 className="proceso__h">Congelamos con nube</h3>
                <p className="proceso__p">Le metemos aire hasta que esponja. Así queda suave: se derrite en la boca, no en la mano.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== DIVIDER proceso -> testimonios ===== */}
        <div className="drip-divider" aria-hidden="true" style={{ height: 'clamp(40px,6vw,80px)' }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,0 L1440,0 L1440,24 C1320,58 1200,10 1080,38 C960,66 840,8 720,36 C600,64 480,10 360,38 C240,66 120,12 0,40 Z" fill="var(--crema)" />
          </svg>
        </div>

        {/* ===== TESTIMONIOS ===== */}
        <section id="testimonios" className="section" aria-labelledby="testi-title">
          <div className="wrap">
            <div className="testi__head">
              <span className="section__eyebrow reveal">La gente ya se derritió</span>
              <h2 id="testi-title" className="section__title reveal" style={{ fontSize: 'clamp(2rem,5vw,3.6rem)' }}>Lo que dice quien ya probó</h2>
              <p className="section__sub reveal" style={{ margin: '0 auto' }}>Reseñas reales de clientes que pidieron y se les aflojó la sonrisa.</p>
            </div>
          </div>
          <div className="testi__marquee" aria-label="Testimonios de clientes">
            <div className="testi__track">
              <article className="testi__card" style={{ ['--tc' as any]: 'var(--fresa)' }}>
                <div className="testi__avatar">
                  <div className="testi__avatar-goo"><div className="head" /><div className="drip" /></div>
                  <div>
                    <div className="testi__who">Mariana G.</div>
                    <div className="testi__where">Roma Norte, CDMX</div>
                  </div>
                </div>
                <p className="testi__quote">El de fresa sabe a mi infancia, pero más rico. Llegó frío y con una nota escrita a mano. Ya pedí tres veces.</p>
                <div className="testi__rating-row">
                  <span className="testi__stars">★★★★★</span>
                  <span className="testi__flavor-tag">Fresa</span>
                </div>
              </article>
              <article className="testi__card" style={{ ['--tc' as any]: 'var(--pistache)' }}>
                <div className="testi__avatar">
                  <div className="testi__avatar-goo"><div className="head" /><div className="drip" /></div>
                  <div>
                    <div className="testi__who">Don Refugio</div>
                    <div className="testi__where">Coyoacán, CDMX</div>
                  </div>
                </div>
                <p className="testi__quote">El pistache molido a mano se siente. Ningún helado de bodega le llega. Cremoso de verdad, no de cartón.</p>
                <div className="testi__rating-row">
                  <span className="testi__stars">★★★★★</span>
                  <span className="testi__flavor-tag">Pistache</span>
                </div>
              </article>
              <article className="testi__card" style={{ ['--tc' as any]: 'var(--vainilla)' }}>
                <div className="testi__avatar">
                  <div className="testi__avatar-goo"><div className="head" /><div className="drip" /></div>
                  <div>
                    <div className="testi__who">La Toñita</div>
                    <div className="testi__where">Pátzcuaro, Mich</div>
                  </div>
                </div>
                <p className="testi__quote">La vainilla me regresó al mercado de chiquita. Huele a Papantla de verdad. Hasta mi abuela lo aprobó.</p>
                <div className="testi__rating-row">
                  <span className="testi__stars">★★★★★</span>
                  <span className="testi__flavor-tag">Vainilla</span>
                </div>
              </article>
              <article className="testi__card" style={{ ['--tc' as any]: 'var(--mango)' }}>
                <div className="testi__avatar">
                  <div className="testi__avatar-goo"><div className="head" /><div className="drip" /></div>
                  <div>
                    <div className="testi__who">Diego R.</div>
                    <div className="testi__where">Condesa, CDMX</div>
                  </div>
                </div>
                <p className="testi__quote">El mango con chile pica poquito, justo. Mi novia y yo nos lo acabamos en el parque. Repetiremos.</p>
                <div className="testi__rating-row">
                  <span className="testi__stars">★★★★☆</span>
                  <span className="testi__flavor-tag">Mango con Chile</span>
                </div>
              </article>
              <article className="testi__card" style={{ ['--tc' as any]: '#E9C9A8' }}>
                <div className="testi__avatar">
                  <div className="testi__avatar-goo"><div className="head" /><div className="drip" /></div>
                  <div>
                    <div className="testi__who">Chef Lalo</div>
                    <div className="testi__where">Polanco, CDMX</div>
                  </div>
                </div>
                <p className="testi__quote">El chocolate oaxaqueño lo pongo en mi postre del menú. Intenso, con cuerpo. Ya es ingrediente de casa.</p>
                <div className="testi__rating-row">
                  <span className="testi__stars">★★★★★</span>
                  <span className="testi__flavor-tag">Chocolate</span>
                </div>
              </article>
              <article className="testi__card" style={{ ['--tc' as any]: '#E6C39A' }}>
                <div className="testi__avatar">
                  <div className="testi__avatar-goo"><div className="head" /><div className="drip" /></div>
                  <div>
                    <div className="testi__who">Doña Chelo</div>
                    <div className="testi__where">Del Valle, CDMX</div>
                  </div>
                </div>
                <p className="testi__quote">La cajeta sabe a rancho, a leña lenta. Me acordé de mi abuelo cajetero. Esto sí es helado con memoria.</p>
                <div className="testi__rating-row">
                  <span className="testi__stars">★★★★★</span>
                  <span className="testi__flavor-tag">Cajeta</span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ===== CTA FINAL ===== */}
        <section id="cta-final" aria-labelledby="cta-title">
          <div className="wrap" style={{ textAlign: 'center' }}>
            <span className="section__eyebrow reveal" style={{ color: 'var(--chocolate)', opacity: 0.7 }}>El último antojo</span>
            <h2 id="cta-title" className="cta-final__title reveal">¿Se te antoja?</h2>
            <p className="cta-final__sub reveal">Pide tu helado hoy y te lo llevamos cremosito. Frío de Nevera, calor de hogar.</p>
            <div className="magnetic-wrap reveal">
              <a className="btn btn--chocolate" href="#sabores" style={{ fontSize: '1.25rem', padding: '1.3rem 3rem' }}>
                <span className="btn__label">Ordenar ahora</span>
                <span className="btn__drips"><i /><i /><i /></span>
              </a>
            </div>
            <p className="reveal" style={{ marginTop: '1.5rem', color: 'var(--chocolate)', opacity: 0.7, fontSize: '0.9rem' }}>
              Envío sin costo en CDMX · Pago contra entrega · Helado que no llega derretido (casi)
            </p>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <div className="footer__drip" aria-hidden="true">
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path id="footerDripPath" d="M0,0 L1440,0 L1440,100 C1320,100 1280,48 1200,100 C1120,100 1080,54 1000,100 C920,100 880,46 800,100 C720,100 680,52 600,100 C520,100 480,48 400,100 C320,100 280,54 200,100 C120,100 80,46 0,100 L0,0 Z" />
          </svg>
        </div>
        <div className="wrap">
          <div className="footer__grid">
            <div>
              <div className="footer__brand">Helado Nube</div>
              <p className="footer__tag">Helado artesanal hecho a mano, lento y con nube. De Pátzcuaro para toda la mesa mexicana.</p>
              <div className="news">
                <div className="news__field">
                  <input type="email" placeholder="tu correo cremosito" aria-label="Correo electrónico" />
                  <button type="button">Quiero saber</button>
                </div>
                <div className="sprinkle-stage" aria-hidden="true" />
                <p className="news__msg" role="status" aria-live="polite" />
              </div>
            </div>
            <div>
              <h4>Sabores</h4>
              <ul>
                <li><a className="drip-link" href="#sabores">Fresa</a></li>
                <li><a className="drip-link" href="#sabores">Vainilla de Papantla</a></li>
                <li><a className="drip-link" href="#sabores">Pistache</a></li>
                <li><a className="drip-link" href="#sabores">Chocolate Oaxaqueño</a></li>
                <li><a className="drip-link" href="#sabores">Mango con Chile</a></li>
                <li><a className="drip-link" href="#sabores">Cajeta</a></li>
              </ul>
            </div>
            <div>
              <h4>Nube</h4>
              <ul>
                <li><a className="drip-link" href="#historia">Nuestra historia</a></li>
                <li><a className="drip-link" href="#proceso">El proceso</a></li>
                <li><a className="drip-link" href="#cta-final">Ordenar</a></li>
                <li><a className="drip-link" href="#cta-final">Mayoreo</a></li>
                <li><a className="drip-link" href="#cta-final">Eventos</a></li>
              </ul>
            </div>
          </div>
          <div className="footer__bottom">
            <span>© {new Date().getFullYear()} Helado Nube. Hecho con crema y cariño en México. 🍦</span>
            <span className="footer__legal">
              <a href="#top">Aviso de privacidad</a>
              <a href="#top">Términos</a>
            </span>
          </div>
        </div>
      </footer>

      {/* ===== FLOATING ORDER BUBBLE (sticky conversion CTA + mini-cart) ===== */}
      <a className="float-order" href="#cta-final" aria-label="Ordenar helado ahora" data-cursor>
        <span className="float-order__pop" />
        <span className="float-order__label">¡Pídelo cremosito!</span>
        <div className="float-order__goo">
          <div className="float-order__scoop">Ordenar</div>
          <div className="float-order__drip" />
          <span className="float-order__pulse" />
        </div>
        <span className="float-order__badge" aria-hidden="true">0</span>
      </a>
    </>
  );
}
