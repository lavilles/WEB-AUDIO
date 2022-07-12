const cutoffSlider = document.getElementById("cutoff-slider");
const delaySlider = document.getElementById("delay-slider");
const feedbackSlider = document.getElementById("feedback-slider");
//const reverbSlider = document.getElementById("reverb-slider");
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = null;
let filter = null;
let delay = null;
let feedback = null;
//let reverb = null;

const sounds = ['ton1.wav', 'ton2.wav', 'ton3.wav', 'ton4.wav', 'akkordstimmung.wav', 'akkordstimmungflagolet.wav',
  'flagolet11.wav', 'flagolet12.wav', 'flagolet13.wav', 'flagolet14.wav', 'flagolet15.wav', 'flagolet16.wav',
  'flagoletton1.wav', 'flagoletton2.wav', 'flagoletton3.wav', 'flagoletton4.wav', 'flagoletton5.wav', 'flagoletton6.wav', 'loop1ganzesstück.wav']; //hier werden die samples aufgelistet
const hasLoop = [false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, true, true]; //hier wird gesagt in welcher reihenfolge die samples loopen oder nicht
const audioBuffers = []; //hier wir ein leerer audiobuffer erstellt
const sources = [];


window.addEventListener('mousedown', onPress); //damit man mit der maus spielen kann
window.addEventListener('touchstart', onPress); //damit man einen touchscreen verwenden kann
//window.addEventListener('mouseover', start);
cutoffSlider.addEventListener("input", onCutoffSliderChange);
delaySlider.addEventListener("input", onDelaySliderChange);
feedbackSlider.addEventListener("input", onFeedbackSliderChange);
//reverbSlider.addEventListener("input", onReverbSliderChange);

// load audio buffers (samples)
for (let i = 0; i < sounds.length; i++) {
  const request = new XMLHttpRequest();
  request.responseType = 'arraybuffer';
  request.open('GET', 'sounds/' + sounds[i]);
  request.addEventListener('load', () => {
    const ac = new AudioContext();
    ac.decodeAudioData(request.response, (buffer) => audioBuffers[i] = buffer);
  });

  request.send();
}

// play buffer by index
function startSound(index) { //funktion startsound wir erstellt
  const time = audioContext.currentTime; //
  const loop = hasLoop[index]; //idex bezieht sich auf den data-index vom html file
  const buffer = audioBuffers[index]; //ein buffer ist nun ein audio buffer die sich die samples vom index holen
  let offset = 0;
  if (loop) {
    offset = time % (buffer.duration / 16);
  }

  const source = audioContext.createBufferSource();
  //const compressor = audioContext.createDynamicsCompressor();
  //const limiter = audioContext.createLimiter();
  //limiter.threshold.value = -2;
  //compressor.threshold.value = -1;
  //compressor.knee.value = 1;
  //compressor.ratio.value = 2;
  //compressor.attack.value = 0;
  //compressor.release.value = 0.25;  
  source.connect(filter);
  source.connect(delay); //die source die oben dem audiocontext gleichgesetzt wurde wird nun zur destination conected
  //source.connect(reverb);
  //source.connect(limiter);
  //source.connect(compressor);
  //limiter.connect(audioContext.destination);
  //compressor.connect(audioContext.destination);
  source.buffer = buffer;
  source.loop = loop;
  source.start(time, offset);

  if (loop) {
    sources[index] = source;
  }
}


//wenn die source(samples) stoppt, dann gibt es keine sources mehr?
function stopSound(index) {
  const source = sources[index];

  if (source) {
    source.stop(audioContext.currentTime);
    sources[index] = null;
  }
}

// play audio buffer (loop)
function onPress(evt) {
  const target = evt.target;
  const index = target.dataset.index;

  // create audio context on first mouse-press/click/touch and keep it
  if (audioContext === null) {
    audioContext = new AudioContext();
    filter = audioContext.createBiquadFilter(); 
    filter.connect(audioContext.destination);
    filter.type = "lowpass";
    filter.frequency.value = 5000;
    delay = audioContext.createDelay();
    delay.delayTime.value = 0.25;
    feedback = audioContext.createGain();
    feedback.gain.value = 0.9;
    //reverb = audioContext.createConvolver();
    //reverb.reverbTime = 1;
    //reverb.connect(audioContext.destination);
    
    delay.connect(feedback);
    feedback.connect(delay);
    feedback.connect(filter);
  }

  if (index !== undefined) {
    if (sources[index]) {
      stopSound(index);
      target.classList.remove('active');
    } else {
      startSound(index);
      target.classList.add('active');

      if (!hasLoop[index]) {
        setTimeout(() => target.classList.remove('active'), 250);
      }
    }
  }

}

function onCutoffSliderChange(e){
  console.log(cutoffSlider.value);
  filter.frequency.value=50*Math.pow(100, cutoffSlider.value);
}

function onDelaySliderChange(e){
  console.log(delaySlider.value);
  delay.delayTime.value = delaySlider.value;
}

function onFeedbackSliderChange(e){
  console.log(feedbackSlider.value);
  feedback.gain.value = feedbackSlider.value;
}