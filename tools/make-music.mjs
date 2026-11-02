// مقطوعة أصلية خاصة بالدعوة (بدون أي حقوق محفوظة) — عود/بيانو هادئ بلمسة عربية.
// التشغيل: node tools/make-music.mjs   → public/assets/music.mp3
import fs from 'node:fs'
import vm from 'node:vm'
import path from 'node:path'

// lamejs يُحمَّل كملف مستقل (يعرّف globalThis.lamejs)
const lameSrc = fs.readFileSync(path.resolve('node_modules/lamejs/lame.all.js'), 'utf8')
vm.runInThisContext(lameSrc)
const lamejs = globalThis.lamejs

const SR = 44100
const BPM = 84
const BEAT = 60 / BPM
const BAR = BEAT * 4
const BARS = 12
const TOTAL = BAR * BARS
const N = Math.ceil(TOTAL * SR) + SR // مساحة صغيرة لذيول النوتات

const buf = new Float32Array(N)

// ——— أدوات بسيطة ———
const hz = (semi) => 440 * Math.pow(2, (semi - 9) / 12) // 0 = C4
const NOTE = { C: 0, 'C#': 1, D: 2, Eb: 3, E: 4, F: 5, 'F#': 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 }

// نغمة مشدودة (عود): توافقيات مع تلاشٍ سريع + هجوم ناعم
function pluck(start, semi, dur, gain = 0.5, bright = 1) {
  const f0 = hz(semi)
  const s0 = Math.floor(start * SR)
  const len = Math.floor((dur + 0.9) * SR)
  const attack = 0.006 * SR
  for (let i = 0; i < len; i++) {
    const t = i / SR
    const env = Math.exp(-t / (0.42 * (dur / 0.4 + 0.55)))
    let s = 0
    s += Math.sin(2 * Math.PI * f0 * t) * 1.0
    s += Math.sin(2 * Math.PI * f0 * 2 * t) * 0.42 * bright * Math.exp(-t / 0.5)
    s += Math.sin(2 * Math.PI * f0 * 3 * t) * 0.18 * bright * Math.exp(-t / 0.32)
    s += Math.sin(2 * Math.PI * f0 * 4.01 * t) * 0.07 * Math.exp(-t / 0.2)
    const a = i < attack ? i / attack : 1
    const idx = s0 + i
    if (idx < N) buf[idx] += s * env * a * gain
  }
}

// طبقة دافئة (باد): موجات منخفضة بشدة مع اهتزاز بطيء
function pad(start, dur, semis, gain = 0.12) {
  const s0 = Math.floor(start * SR)
  const len = Math.floor(dur * SR)
  const attack = 0.9 * SR
  const release = 1.1 * SR
  for (const semi of semis) {
    const f = hz(semi)
    for (let i = 0; i < len; i++) {
      const t = i / SR
      const envIn = Math.min(1, i / attack)
      const envOut = Math.min(1, (len - i) / release)
      const vib = 1 + 0.0022 * Math.sin(2 * Math.PI * 0.28 * t)
      let s = Math.sin(2 * Math.PI * f * t * vib) * 0.7 + Math.sin(2 * Math.PI * f * 2 * t) * 0.12
      s += Math.sin(2 * Math.PI * (f * 1.003) * t) * 0.3
      const idx = s0 + i
      if (idx < N) buf[idx] += s * envIn * envOut * gain
    }
  }
}

// شيكر خفيف جدًا (ضربات ضعيفة)
function shaker(start, gain = 0.05) {
  const s0 = Math.floor(start * SR)
  const len = Math.floor(0.09 * SR)
  let prev = 0
  for (let i = 0; i < len; i++) {
    const t = i / SR
    const noise = Math.random() * 2 - 1
    prev = prev * 0.6 + noise * 0.4 // فلتر بسيط
    const env = Math.exp(-t / 0.022)
    const idx = s0 + i
    if (idx < N) buf[idx] += prev * env * gain
  }
}

// ——— التوزيع الموسيقي (مقام كرد/نهاوند على D) ———
const CHORDS = [
  { root: 2, notes: [2, 5, 9], pad: [2, 5, 9, 14] },        // Dm
  { root: 10, notes: [10, 14, 17], pad: [10, 14, 17, 21] }, // Bb
  { root: 7, notes: [7, 10, 14], pad: [7, 10, 14, 19] },    // Gm
  { root: 9, notes: [9, 13, 16], pad: [9, 13, 16, 21] },    // A
]

// أربيجيو العود: كل نصف نبضة، يصعد وينزل
const ARP = [0, 1, 2, 3, 2, 1, 0, 2]

function barIndex(bar) { return [0, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 3][bar % 12] }

for (let bar = 0; bar < BARS; bar++) {
  const chord = CHORDS[barIndex(bar)]
  const t0 = bar * BAR
  const voice = [...chord.notes, chord.notes[0] + 12]
  // عود
  for (let step = 0; step < 8; step++) {
    const note = voice[ARP[step] % voice.length] + 12
    const vel = step === 0 ? 0.5 : step % 4 === 0 ? 0.36 : 0.26
    pluck(t0 + step * (BEAT / 2), note, 0.34, vel, step === 0 ? 1.15 : 0.9)
  }
  // باد
  pad(t0 + 0.02, BAR * 0.98, chord.pad, 0.075)
  // شيكر خفيف
  if (bar >= 2) for (let b = 0; b < 4; b++) shaker(t0 + b * BEAT + BEAT / 2, 0.022)
}

// ——— اللحن الرئيسي ———
const M = (name, oct) => NOTE[name] + 12 * (oct - 4)
const phraseA = (t0, oct = 5) => {
  const n = (name, o, at, dur, g = 0.55) => pluck(t0 + at * BEAT, M(name, o ?? oct), dur * BEAT, g, 1.25)
  n('A', oct, 0, 1); n('G', oct, 1, 0.5); n('F#', oct, 1.5, 0.5)
  n('A', oct, 2, 1); n('Bb', oct, 3, 0.5); n('A', oct, 3.5, 0.5)
  n('F#', oct - 1, 4, 1); n('A', oct - 1, 5, 0.5); n('D', oct, 5.5, 0.5)
  n('F#', oct, 6, 1.5); n('E', oct - 1, 7.5, 0.5)
}
const phraseB = (t0, oct = 5) => {
  const n = (name, o, at, dur, g = 0.55) => pluck(t0 + at * BEAT, M(name, o ?? oct), dur * BEAT, g, 1.25)
  n('D', oct, 0, 0.5); n('E', oct, 0.5, 0.5); n('F', oct, 1, 0.5); n('E', oct, 1.5, 0.5)
  n('D', oct, 2, 1); n('A', oct - 1, 3, 1)
  n('C#', oct, 4, 1.5); n('D', oct, 5.5, 0.5)
  n('A', oct - 1, 6, 1); n('G', oct - 1, 7, 0.5); n('F#', oct - 1, 7.5, 0.5)
}

phraseA(2 * BAR, 5)
phraseB(4 * BAR, 5)
phraseA(6 * BAR, 5)
phraseB(8 * BAR, 5)
// تكرار أعلى قليلًا مع نهاية هادئة
phraseA(10 * BAR, 6)

// ——— معالجة: صدى خفيف + تسوية + تلاشٍ للأطراف (لوب ناعم) ———
const wet = new Float32Array(N)
const delays = [0.115, 0.23, 0.37]
const gains = [0.2, 0.12, 0.07]
for (const [k, d] of delays.entries()) {
  const s = Math.floor(d * SR)
  for (let i = s; i < N; i++) wet[i] += buf[i - s] * gains[k]
}
let peak = 0
for (let i = 0; i < N; i++) { buf[i] = buf[i] * 0.82 + wet[i]; peak = Math.max(peak, Math.abs(buf[i])) }
const norm = peak > 0 ? 0.86 / peak : 1
const fade = Math.floor(0.7 * SR)
const end = Math.floor(TOTAL * SR) - fade
for (let i = 0; i < N; i++) {
  let g = norm
  if (i < fade) g *= i / fade
  if (i > end) g *= Math.max(0, 1 - (i - end) / fade)
  buf[i] *= g
}

// ——— ترميز MP3 ———
const pcm = new Int16Array(N)
for (let i = 0; i < N; i++) pcm[i] = Math.max(-32768, Math.min(32767, Math.round(buf[i] * 32767)))
const encoder = new lamejs.Mp3Encoder(1, SR, 128)
const chunks = []
const block = 1152
for (let i = 0; i < pcm.length; i += block) {
  const mp3buf = encoder.encodeBuffer(pcm.subarray(i, Math.min(i + block, pcm.length)))
  if (mp3buf.length) chunks.push(Buffer.from(mp3buf))
}
const tail = encoder.flush()
if (tail.length) chunks.push(Buffer.from(tail))

const out = 'public/assets/music.mp3'
fs.writeFileSync(out, Buffer.concat(chunks))
console.log(`${out} — ${(fs.statSync(out).size / 1024).toFixed(0)} KB — ${TOTAL.toFixed(1)}s`)
