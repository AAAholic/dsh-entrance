import { ASSETS_PATH } from '../src/routes.mjs'
import { mountWelcomeCharacter } from './welcome-character.mjs'
import { createWelcomeWater, welcomeWaterWaves } from './welcome-water.mjs'
import { createWelcomeFireworks } from './welcome-fireworks.mjs'
import { welcomeFanMarkup, welcomeWaveMarkup, welcomeBackdropMarkup } from './welcome-ornaments.mjs'
import { mountWelcomeRibbon } from './welcome-ribbon.mjs'
import { mountWelcomeRiver } from './welcome-river.mjs'

const ASSET_BASE = `${ASSETS_PATH}/entrance/20261006`
const CHARACTER_URL = `${ASSET_BASE}/yoimiya-welcome.png`
const EXPRESSION_URL = `${ASSET_BASE}/yoimiya-expression.png`
const KOI_URL = `${ASSET_BASE}/koi-emblem-v1.png`
const RIBBON_URL = `${ASSET_BASE}/festival-ribbon-v1.png`
const WATER_MS = 2200
const assetLoads = new Map()
function decodeAsset(url) {
  if (!assetLoads.has(url)) {
    const image = new Image()
    image.decoding = 'async'
    const loaded = new Promise((resolve, reject) => {
      image.onload = resolve; image.onerror = reject; image.src = url
    }).then(async () => { if (image.decode) await image.decode(); return image })
    assetLoads.set(url, loaded)
    loaded.catch(() => { if (assetLoads.get(url) === loaded) assetLoads.delete(url) })
  }
  return assetLoads.get(url)
}
// Start while the host wallpaper is loading; retain decoded images for replay.
export function prepareWelcomeAssets(blink = true) {
  return Promise.all([decodeAsset(CHARACTER_URL), blink ? decodeAsset(EXPRESSION_URL).catch(() => null) : null, decodeAsset(KOI_URL).catch(() => null), decodeAsset(RIBBON_URL).catch(() => null)])
}
const clamp = v => Math.max(0, Math.min(1, v))
const smooth = v => { const t = clamp(v); return t * t * (3 - 2 * t) }
const out = v => 1 - Math.pow(1 - clamp(v), 3)
const range = (t, a, b) => clamp((t - a) / (b - a))
const lerp = (a, b, t) => a + (b - a) * t
const css = `
:host{all:initial;position:fixed;inset:0;z-index:2147483500;isolation:isolate;pointer-events:auto;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#f3d29d;container-type:inline-size;}
*{box-sizing:border-box}.entry,.layer{position:absolute;inset:0}.entry{overflow:hidden;background:#102631;contain:paint}.svg-all{width:100%;height:100%;display:block}
.a-horizon{background:radial-gradient(ellipse at 76% 36%,#345051 0,transparent 59%),linear-gradient(150deg,#152a36,#101e2a)}
.fan-wrap{position:absolute;width:83%;height:105%;left:30%;top:5%;transform-origin:50% 84%}
.fan-wrap svg{overflow:visible}
.red-screen{position:absolute;inset:0;pointer-events:none}.red-screen svg{width:100%;height:100%;display:block}
.a-title{position:absolute;top:23%;left:14%;color:#f3d29d;z-index:10;transform-origin:0 50%}
.a-title .kanji{font-family:"Songti SC","STSong",serif;font-size:13.8cqw;line-height:1.0;letter-spacing:-.08em;writing-mode:vertical-rl;font-weight:700;text-shadow:0 3px 0 #dda85b33}
.a-title .latin{font-family:Georgia,serif;position:absolute;left:125%;top:1%;font-size:1.1cqw;writing-mode:vertical-rl;letter-spacing:.42em;color:#d4ad73}
.a-title .seal{position:absolute;left:120%;top:74%;font-family:"Songti SC",serif;font-size:1.6cqw;line-height:1.2;padding:.45cqw .3cqw;border:1px solid #dba04c;color:#e7b771;background:#af3027;writing-mode:vertical-rl}
.deepseek{position:absolute;left:14%;bottom:17%;z-index:10;color:#e1c18c;font-size:2.1cqw;letter-spacing:-.04em;font-weight:500}
.deepseek small{display:block;font-size:.85cqw;font-weight:400;letter-spacing:.32em;margin-top:10px}
.character{position:absolute;z-index:12;left:40%;bottom:-10%;width:62%;transform-origin:56% 73%;will-change:transform,opacity}
.character img{width:100%;height:auto;display:block}
.wave-front{position:absolute;inset:auto 0 0;height:24%;z-index:15}.river-life{position:absolute;inset:auto 0 0;height:24%;z-index:16;pointer-events:none;overflow:hidden}
.tassel{position:absolute;width:15.4%;height:82%;left:-1%;top:-2%;z-index:16;transform-origin:30% 0;pointer-events:none}
.fish{position:absolute;top:7.5%;left:8.5%;width:18%;height:16%;z-index:5;pointer-events:none}.fish img{display:block;width:100%;height:100%;object-fit:contain}
.a-title{left:11%;top:24%;width:37%}
.a-title .kanji{writing-mode:horizontal-tb;font-size:9.4cqw;letter-spacing:-.06em;line-height:1.1}
.a-title .latin{left:0;top:115%;font:1.3cqw "PingFang SC",sans-serif;writing-mode:horizontal-tb;letter-spacing:.16em}
.a-title .seal{display:none}
.deepseek{left:11%;bottom:8%;font-size:4cqw;line-height:1.1}
.deepseek small{font-size:.85cqw;letter-spacing:.05em;margin-top:.5cqw}
.character{left:45%;width:52%;bottom:-6%;transform-origin:56% 100%}
.a-title .kanji{font-size:8.1cqw}
.a-title{left:14%}
.deepseek{left:14%;bottom:22%}
.enter{position:absolute;left:14%;bottom:11%;z-index:40;border:0;outline:none;padding:10px 0;background:none;color:#b7aa93;font:400 11px/1.5 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;letter-spacing:.06em;cursor:pointer;opacity:.6}.enter:hover{opacity:.85}.enter:focus-visible{outline:1px solid #c5b18c;outline-offset:4px;opacity:.9}
.masthead{position:absolute;left:14%;top:4%;font-size:11px;letter-spacing:.15em;color:#ead4ae;z-index:20}
.fan-wrap,.red-screen,.fish,.a-title,.tassel,.wave-front{will-change:transform,opacity}
@media(max-aspect-ratio:4/5){.character{left:14%;width:92%;bottom:-1%}.a-title{left:9%;top:9%;width:85%}.a-title .kanji{font-size:13cqw;line-height:1.02}.a-title .kanji br{display:none}.a-title .latin{font-size:3cqw;top:125%}.deepseek{left:9%;bottom:7%;font-size:8.5cqw;z-index:30}.enter{left:auto;right:7%;bottom:5%;font-size:11px}.fan-wrap{left:5%;top:19%;width:115%;height:80%}.red-screen{left:24%;right:-24%}.wave-blossoms{display:none}.tassel{left:-5%;top:-2%;width:15%;height:57%}.fish{left:8%;top:24%;width:32%;height:11%}.wave-front,.river-life{height:19%}.masthead{left:9%;font-size:9px}}
`
const markup = `<div class="entry">
    <div class="layer a-horizon"></div>
    <div class="red-screen" id="aRed">${welcomeBackdropMarkup}</div>
    <div class="fan-wrap" id="aFan">${welcomeFanMarkup}</div>
    <div class="fish" id="aFish"><img src="${KOI_URL}" alt="" decoding="async"></div>
    <div class="a-title" id="aTitle"><div class="kanji">欢迎<br>回来。</div><div class="latin">灯火亮起，好好开始。</div><div class="seal">归家</div></div>
    <div class="deepseek" id="aDeepseek">DeepSeek<small></small></div>
    <div class="character" id="aCharacter"></div>
    <div class="wave-front" id="aWave">${welcomeWaveMarkup}</div>
    <div class="river-life" id="aRiver"></div>
    <div class="tassel" id="aTassel"></div>
  </div>`

// The scene owns its clock, asset loads and temporary workspace animations.
// The outer wallpaper controller owns modal input and focus restoration.
export function mountWelcomeScene(root, { duration = 3.2, motion = true, fireworksEnabled = true, fireworkIntensity = 100, ribbonMotion = true, riverMotion = true, blink = true, onFailure = () => {} } = {}) {
  root.innerHTML = `<style>${css}</style>${markup}`
  const entry = root.querySelector('.entry')
  entry.insertAdjacentHTML('beforeend','<div class="masthead">DEEPSEEK HARNESS</div><button class="enter" type="button" aria-label="进入工作台，点击或按任意键">点击或按键进入</button>')
  const $ = id => root.getElementById(id)
  const character = mountWelcomeCharacter($('aCharacter'), { imageURL: CHARACTER_URL, expressionURL: EXPRESSION_URL, blink })
  const fireworks = createWelcomeFireworks(entry, { intensity: fireworksEnabled ? fireworkIntensity : 0 })
  const ribbon = mountWelcomeRibbon($('aTassel'), { imageURL: RIBBON_URL, motion: motion && ribbonMotion })
  const river = mountWelcomeRiver($('aRiver'), { motion: motion && riverMotion })
  ribbon.setPaused(true); river.setPaused(true)
  $('aFish').querySelector('img').addEventListener('error', () => { $('aFish').hidden = true }, { once: true })
  const waterLayer = document.createElement('div')
  waterLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:40'
  root.append(waterLayer)
  const water = createWelcomeWater(waterLayer)
  let disposed = false, frame = null, last = null, elapsed = 0, paused = false, ready = false, exiting = false, exitElapsed = 0, finish = null
  let origin = null, workspaceAnimation = null, loadTimeout = null, warming = 0
  let bounds = root.host.getBoundingClientRect()
  const resizeObserver = new ResizeObserver(() => { bounds = root.host.getBoundingClientRect() })
  resizeObserver.observe(root.host)
  root.host.dataset.welcomePhase = 'loading'
  const transform = (id,v) => $(id).style.transform = v
  const opacity = (id,v) => $(id).style.opacity = v
  function render(t) {
    character.update(t)
    fireworks.update(motion?t:2.4,bounds.width,bounds.height)
    const scene=out(range(t,0,.7)),person=out(range(t,.48,1.38)),title=out(range(t,1.05,1.65))
    transform('aFan',`translate(${lerp(-14,0,scene)}%,${lerp(13,0,scene)}%) rotate(${lerp(-48,0,scene)}deg) scale(${lerp(.65,1,scene)})`);opacity('aFan',scene)
    transform('aRed',`translateX(${lerp(110,0,scene)}%)`);opacity('aRed',scene)
    transform('aFish',`translateX(${lerp(-30,0,scene)}%) rotate(${lerp(-5,0,scene)}deg)`);opacity('aFish',scene)
    transform('aCharacter',`translate(${lerp(40,0,person)}%,${lerp(6,0,person)}%) scale(${lerp(.95,1,person)})`);opacity('aCharacter',person)
    transform('aTitle',`translateY(${lerp(12,0,title)}%) scale(${lerp(.97,1,title)})`);opacity('aTitle',title);opacity('aDeepseek',title)
    transform('aTassel',`translateX(${lerp(-70,0,scene)}%) rotate(${lerp(-12,0,person)}deg)`);opacity('aTassel',scene)
    transform('aWave',`translateY(${lerp(80,0,scene)}%)`);opacity('aWave',scene)
    transform('aRiver',`translateY(${lerp(80,0,scene)}%)`);opacity('aRiver',scene)
  }
  function renderExit(milliseconds) {
    const p=clamp(milliseconds/WATER_MS)
    const {width:w,height:h}=bounds
    const x=origin.x*w,y=origin.y*h
    const waves=welcomeWaterWaves(p,w,h,origin).filter(wave=>wave.amount>0)
    if (waves.length) {
      // Each passing crest removes another portion of the actual welcome art.
      // The same wave geometry drives the water, so no separate scene fade runs.
      const remaining=[.56,.20,0]
      const color=alpha=>`rgba(0,0,0,${alpha})`
      const stops=[`${color(remaining[waves.length-1])} 0px`]
      for(let i=waves.length-1;i>=0;i--){
        const {radius,thickness}=waves[i]
        const gap=Math.min(i>0?waves[i-1].radius-radius:Infinity,i<waves.length-1?radius-waves[i+1].radius:Infinity)
        const feather=Math.min(thickness*1.7, radius*.75, gap*.4)
        stops.push(`${color(remaining[i])} ${Math.max(0,radius-feather)}px`,`${color(i?remaining[i-1]:1)} ${radius+feather}px`)
      }
      const mask=`radial-gradient(circle at ${x}px ${y}px, ${stops.join(',')})`
      entry.style.maskImage=mask;entry.style.webkitMaskImage=mask
    }
    water.update(p,{...origin,normalized:true})
    if(p>=1){entry.style.display='none';workspaceAnimation?.cancel();workspaceAnimation=null}
  }
  function tick(now) {
    frame=null
    if(disposed||paused||!ready)return
    if (warming && !exiting) {
      // Nonzero opacity paints the actual masked layers before their clocks run.
      if (--warming) { frame=requestAnimationFrame(tick);return }
      render(motion?0:2.4);entry.style.opacity='1';root.host.style.background=''
      root.host.dataset.welcomePhase='entering';ribbon.setPaused(paused);river.setPaused(paused);last=null
    }
    const dt=last===null?0:Math.max(0,now-last);last=now
    if(exiting){
      exitElapsed+=dt;renderExit(exitElapsed)
      if(disposed)return
      if(exitElapsed>=WATER_MS){const done=finish;finish=null;done?.();return}
    }else{
      elapsed+=dt;render(motion?Math.min(2.4,elapsed/1000*2.4/duration):2.4)
      if(!motion||elapsed>=duration*1000){root.host.dataset.welcomePhase='settled';return}
    }
    frame=requestAnimationFrame(tick)
  }
  const schedule=()=>{if(!disposed&&!paused&&ready&&frame===null){last=null;frame=requestAnimationFrame(tick)}}
  render(motion?0:2.4)
  // Expression failure degrades to the original face; base art failure releases the modal.
  loadTimeout = setTimeout(() => { if(!disposed&&!ready)onFailure() }, 8000)
  prepareWelcomeAssets(blink).then(()=>{
    clearTimeout(loadTimeout);if(disposed||exiting)return
    ready=true
    if(motion){
      root.host.style.background='#102631';entry.style.opacity='.01'
      render(2.4);character.update(1.5);fireworks.update(1.3,bounds.width,bounds.height);warming=3;root.host.dataset.welcomePhase='preparing'
    }else render(2.4)
    schedule()
  }).catch(()=>{clearTimeout(loadTimeout);if(!disposed&&!exiting)onFailure()})
  return {
    setPaused(value){paused=value;ribbon.setPaused(value||!ready||Boolean(warming));river.setPaused(value||!ready||Boolean(warming));if(paused){if(frame!==null)cancelAnimationFrame(frame);frame=null;last=null;workspaceAnimation?.pause()}else{workspaceAnimation?.play();if(exiting||elapsed<duration*1000&&motion)schedule()}},
    setMotion(value){motion=value;ribbon.setMotion(value&&ribbonMotion);river.setMotion(value&&riverMotion);ribbon.setPaused(paused||!ready||Boolean(warming));river.setPaused(paused||!ready||Boolean(warming));if(!motion&&!exiting){if(frame!==null)cancelAnimationFrame(frame);frame=null;warming=0;entry.style.opacity='1';root.host.style.background='';elapsed=duration*1000;render(2.4);root.host.dataset.welcomePhase='settled'}},
    dismiss(point,onComplete){
      if(disposed||exiting)return
      exiting=true;ribbon.freeze();river.freeze();finish=onComplete;ready=true;warming=0
      clearTimeout(loadTimeout);root.host.style.background='';entry.style.opacity='1'
      root.host.dataset.welcomePhase='revealing'
      const r=root.host.getBoundingClientRect()
      bounds=r
      origin={x:clamp(point?(point.x-r.left)/r.width:.5),y:clamp(point?(point.y-r.top)/r.height:.5)}
      root.host.dataset.waterOrigin=`${origin.x.toFixed(4)},${origin.y.toFixed(4)}`
      const workspace=document.getElementById('root')
      if(workspace&&!workspace.contains(root.host))workspaceAnimation=workspace.animate([{translate:'0 22px'},{translate:'0 0'}],{duration:WATER_MS,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'})
      renderExit(0);schedule()
    },
    dispose(){disposed=true;clearTimeout(loadTimeout);resizeObserver.disconnect();if(frame!==null)cancelAnimationFrame(frame);workspaceAnimation?.cancel();character.dispose();fireworks.dispose();ribbon.dispose();river.dispose();water.dispose();finish=null},
  }
}
