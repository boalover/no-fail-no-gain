let soundFiles = [];
let currentSoundIndex = 0;
let fft;
let cnv;
let pixelIndex = 0;
let images = {};  // 이미지 객체 초기화

function preload() {
  // 사운드 파일 로드
  soundFiles.push(loadSound('Y2meta.app - Kanye West - Gold Digger ft. Jamie Foxx (128 kbps).mp3'));
  soundFiles.push(loadSound('Y2meta.app - Kanye West - Stronger (128 kbps).mp3'));
  soundFiles.push(loadSound('Y2meta.app - Kanye West - Bound 2 (128 kbps).mp3'));
  soundFiles.push(loadSound('Y2meta.app - Kanye West - Heartless (128 kbps).mp3'));

  // 이미지 파일 로드
  images["C3"] = loadImage('blue1.png');
  images["D3"] = loadImage('green1.png');
  images["E3"] = loadImage('orange1.png');
  images["F3"] = loadImage('red1.png');
  images["G3"] = loadImage('yellow1.png');
  images["A3"] = loadImage('연보라1.png');
  images["B3"] = loadImage('청록1.png');
  images["C4"] = loadImage('blue2.png');
  images["D4"] = loadImage('green2.png');
  images["E4"] = loadImage('orange2.png');
  images["F4"] = loadImage('red2.png');
  images["G4"] = loadImage('yellow2.png');
  images["A4"] = loadImage('연보라2.png');
  images["B4"] = loadImage('청록2.png');
  images["C5"] = loadImage('blue3.png');
  images["D5"] = loadImage('green3.png');
  images["E5"] = loadImage('orange3.png');
  images["F5"] = loadImage('red3.png');
  images["G5"] = loadImage('greenblue1.png');
  images["A5"] = loadImage('보라3.png');
  images["B5"] = loadImage('초록3.png');
  images["C6"] = loadImage('파란3.png');
  images["D6"] = loadImage('보라2.png');
  images["E6"] = loadImage('greenblue3.png');
}

function freqToIndex(freq) {
  // 주파수를 FFT 분석 배열의 인덱스로 변환하는 공식을 사용합니다.
  // 이 공식은 p5.js의 FFT 객체에서 사용하는 것과 같습니다.
  const nyquist = sampleRate() / 2;
  const index = Math.round(freq / nyquist * fft.bins);
  return index;
}

function setup() {
  cnv = createCanvas(1600, 1600);
  cnv.mouseClicked(togglePlay);

  fft = new p5.FFT();
  background(220);
  loadPixels(); // Initialize the pixel array

  // 각 사운드 파일에 대한 볼륨 조절
  for (let i = 0; i < soundFiles.length; i++) {
    soundFiles[i].setVolume(0.2); // 볼륨을 0.2로 설정 (필요에 따라 조절)
  }
}

function draw() {
  let spectrum = fft.analyze();

  // 주파수 범위 정의 및 색상 지정
  let ranges = {
    "C3": {min: 130.81, max: 138.59},
    "D3": {min: 146.83, max: 155.56},
    "E3": {min: 164.81, max: 174.61},
    "F3": {min: 174.61, max: 185.00},
    "G3": {min: 196.00, max: 207.65},
    "A3": {min: 220.00, max: 233.08},
    "B3": {min: 246.94, max: 261.63},
    "C4": {min: 261.63, max: 277.18},
    "D4": {min: 293.66, max: 311.13},
    "E4": {min: 329.63, max: 349.23},
    "F4": {min: 349.23, max: 369.99},
    "G4": {min: 392.00, max: 415.30},
    "A4": {min: 440.00, max: 466.16},
    "B4": {min: 493.88, max: 523.25},
    "C5": {min: 523.25, max: 554.37},
    "D5": {min: 587.33, max: 622.25},
    "E5": {min: 659.26, max: 698.46},
    "F5": {min: 698.46, max: 739.99},
    "G5": {min: 783.99, max: 830.61},
    "A5": {min: 880.00, max: 932.33},
    "B5": {min: 987.77, max: 1046.50},
    "C6": {min: 1046.50, max: 1108.73},
    "D6": {min: 1174.66, max: 1244.51},
    "E6": {min: 1318.51, max: 1396.91}
  };

  // Find the strongest frequency range
  let strongestRange = null;
  let maxAmp = 0;

  for (let range in ranges) {
    let minIndex = freqToIndex(ranges[range].min);
    let maxIndex = freqToIndex(ranges[range].max);
    for (let i = minIndex; i <= maxIndex; i++) {
      if (spectrum[i] > maxAmp) {
        maxAmp = spectrum[i];
        strongestRange = range;
      }
    }
  }

  // Apply the color of the strongest frequency range to each pixel sequentially
  if (strongestRange && pixelIndex < width * height) {
    let img = images[strongestRange];
    let x = pixelIndex % width;
    let y = Math.floor(pixelIndex / width);
    let blockSize = 80; // 픽셀 블록의 크기

    // 픽셀 블록 내에서 오른쪽에서 왼쪽으로 반복
    for (let dx = 0; dx < blockSize; dx++) {
      for (let dy = 0; dy < blockSize; dy++) {
        let px = x + dx;
        let py = y + dy;
        if (px < width && py < height) {
          let col = img.get(px % img.width, py % img.height);
          let index = (px + py * width) * 4;
          pixels[index] = red(col);
          pixels[index + 1] = green(col);
          pixels[index + 2] = blue(col);
          pixels[index + 3] = alpha(col); // Alpha value
        }
      }
    }
    pixelIndex++;
  }

  updatePixels();

  // Display instructions
  fill(0);
  textSize(16);
  text('art and technology', 20, 20);
}

function togglePlay() {
  let currentSound = soundFiles[currentSoundIndex];

  if (currentSound.isPlaying()) {
    currentSound.pause();
  } else {
    currentSound.loop();
    // 사운드 파일 종료시 다음 사운드 파일 재생 또는 첫 번째로 돌아가기 설정
    currentSound.onended(playNextSound);
  }
}

function playNextSound() {
  currentSoundIndex++;
  if (currentSoundIndex >= soundFiles.length) {
    currentSoundIndex = 0; // 첫 번째 사운드 파일로 돌아가기
  }
  togglePlay(); // 다음 사운드 파일 재생
}
