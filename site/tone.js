// One-voice synth for the hero wave, plain Web Audio (Tone.js would be ~10x the page weight for
// a single oscillator). It is built from the same recipe as the drawing (wavemath.js):
//   oscillator with the seed's fundamental + harmonic -> gain (fold amount) -> sine wavefolder
// so turning the "fold" knob changes both the picture and the timbre.
//
// Browsers only allow audio after a user gesture: call start() from a click handler.
import { waveParams } from '../src/lib/wavemath.js';

// ---- tweak here ------------------------------------------------------------------------------
// The mouse height steps through PITCHES: bottom of the screen = first entry, top = last. The
// screen is cut into as many equal bands as there are entries, so adding or removing entries
// changes how many different pitches you can hit.
const ROOT = 55; // Hz of semitone 0 (A1)
const PITCHES = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22]; // semitones above ROOT: A minor pentatonic, 2 octaves (55-196 Hz)
// wider alternative, same count: [0, 3, 7, 12, 15, 19, 24, 27, 31, 34]  (A minor arpeggio, 55-392 Hz)
const LEVEL = 0.12; // master volume (folded signals are loud)
const CUTOFF = 2400; // Hz, lowpass that tames the fold's harsh top end
const GLIDE = 0.03; // seconds to slide between pitches (higher = more portamento)
// delay (echo); it is fed from the faded output, so Stop lets the echoes ring out
const DELAY_TIME = 0.375; // seconds between echoes (0.375 = dotted eighth at 120 bpm)
const DELAY_FEEDBACK = 0.45; // 0 = single echo; keep below ~0.7 or it takes ages to die out
const DELAY_DAMP = 1400; // Hz, every echo gets darker; lower = duller
const DELAY_WET = 0.5; // echo volume relative to the dry sound; 0 = delay off (nodes not even created)
// -----------------------------------------------------------------------------------------------
export const NOTES = PITCHES.length;
const noteFreq = (i) => ROOT * 2 ** (PITCHES[i] / 12);

// how long the audio must keep running after Stop: until the echoes are ~60 dB down
const FB = Math.min(0.9, Math.max(0, DELAY_FEEDBACK));
const TAIL_S = DELAY_WET > 0 ? DELAY_TIME * (FB > 0 ? Math.ceil(Math.log(0.001) / Math.log(FB)) : 1) + 0.3 : 0.6;

const KMAX = 10; // fold amount at full pre-gain; the wavefolder curve is fixed, the gain does the knob

export const toneSupported = () => typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);

export function createTone(seed) {
  const { m, a2 } = waveParams(seed);
  let ctx = null;
  let osc, pre, out;
  let playing = false;
  let suspendTimer = 0;

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    osc = ctx.createOscillator();
    // partials 1 and m (sine phase) with the drawn level, like raw = sin + a2 * sin(m x)
    const real = new Float32Array(m + 1);
    const imag = new Float32Array(m + 1);
    imag[1] = 1;
    imag[m] = a2;
    osc.setPeriodicWave(ctx.createPeriodicWave(real, imag));

    pre = ctx.createGain();
    pre.gain.value = 0.5;

    // v = sin(x * KMAX * PI/2), same fold as the traces; pre-gain g makes the effective k = g * KMAX
    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(4097);
    for (let i = 0; i < curve.length; i++) curve[i] = Math.sin(((i / (curve.length - 1)) * 2 - 1) * KMAX * (Math.PI / 2));
    shaper.curve = curve;
    shaper.oversample = '4x';

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = CUTOFF;
    lp.Q.value = 0.5;

    out = ctx.createGain();
    out.gain.value = 0;

    osc.connect(pre).connect(shaper).connect(lp).connect(out).connect(ctx.destination);

    if (DELAY_WET > 0) {
      // out -> delay -> damp -> wet -> speakers, with damp -> feedback -> delay closing the loop
      const delay = ctx.createDelay(Math.max(1, DELAY_TIME));
      delay.delayTime.value = DELAY_TIME;
      const damp = ctx.createBiquadFilter();
      damp.type = 'lowpass';
      damp.frequency.value = DELAY_DAMP;
      damp.Q.value = 0.5;
      const feedback = ctx.createGain();
      feedback.gain.value = FB;
      const wet = ctx.createGain();
      wet.gain.value = DELAY_WET;
      out.connect(delay);
      delay.connect(damp);
      damp.connect(feedback).connect(delay);
      damp.connect(wet).connect(ctx.destination);
    }
    osc.start();
  }

  return {
    get playing() {
      return playing;
    },
    // returns false if the browser refused (no gesture, no audio device)
    async start(note, k) {
      try {
        clearTimeout(suspendTimer);
        if (!ctx) build();
        await ctx.resume();
        this.set(note, k);
        const now = ctx.currentTime;
        out.gain.cancelScheduledValues(now);
        out.gain.setTargetAtTime(LEVEL, now, 0.04);
        playing = true;
        return true;
      } catch {
        playing = false;
        return false;
      }
    },
    // note: 0..NOTES-1, k: fold amount as drawn on the front trace
    set(note, k) {
      if (!ctx) return;
      const now = ctx.currentTime;
      osc.frequency.setTargetAtTime(noteFreq(note), now, GLIDE);
      pre.gain.setTargetAtTime(Math.min(1, Math.max(0.05, k / KMAX)), now, 0.05);
    },
    stop() {
      if (!ctx || !playing) return;
      playing = false;
      out.gain.cancelScheduledValues(ctx.currentTime);
      out.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      // stop the audio thread once the fade and the echoes are done, saves battery
      suspendTimer = setTimeout(() => !playing && ctx?.suspend(), TAIL_S * 1000);
    },
  };
}
