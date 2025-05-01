// app.js
NBody().then(Module => {

  // canvas setup
  let panX = 0, panY = 0;  
  const canvas = document.getElementById('simulationCanvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const controlsW = document.querySelector('.controls').offsetWidth + 20; 
  canvas.style.position = 'absolute';
  canvas.style.left     = controlsW + 'px';
  canvas.width  = window.innerWidth  - controlsW;
  canvas.height = window.innerHeight;
  let scale    = 1e6;
  let isPanning   = false;
  let panStart    = { x: 0, y: 0 };
  let mouseStart  = { x: 0, y: 0 };
  const halfWm = (canvas.width  / 2) * scale;
  const halfHm = (canvas.height / 2) * scale;

  //----------------Sliders------------------
  // default parameters
  const defaults = {
    mass1: 5.972e24, posX1: 0,       posY1: 0,       velX1: 0,    velY1: 0,
    mass2: 7.348e22, posX2: 384400000, posY2: 0,     velX2: 0,    velY2: 1022,
    gravity: 6.6743e-11,
    step: 3600 
  };

  // state object
  const state = { ...defaults };

  // list of all slider keys
  const sliderKeys = [
    'mass1','posX1','posY1','velX1','velY1',
    'mass2','posX2','posY2','velX2','velY2',
    'gravity','step'
  ];


  const fixedRanges = {
    posX1:  { min: -halfWm, max:  halfWm, step: halfWm/200 },
    posY1:  { min: -halfHm, max:  halfHm, step: halfHm/200 },
    posX2:  { min: -halfWm, max:  halfWm, step: halfWm/200 },
    posY2:  { min: -halfHm, max:  halfHm, step: halfHm/200 },
    velX1:  { min:-1e4,     max: 1e4,    step: 100   },
    velY1:  { min:-1e4,     max: 1e4,    step: 100   },
    velX2:  { min:-1e4,     max: 1e4,    step: 100   },
    velY2:  { min:-1e4,     max: 1e4,    step: 100   },
    mass1:  { min:1e20,     max: 1e25,   step: 1e22  },
    mass2:  { min:1e20,     max: 1e25,   step: 1e22  },
    gravity:{ min:1e-15,    max: 1e-8,   step: 1e-15 },
    step:   { min: 1,      max:10000,   step: 60    },
  };

  sliderKeys.forEach(key => {
    const slider = document.getElementById(key + 'Slider');
    const label = document.getElementById(key + 'Value');
    
    if (fixedRanges[key]) {
      const r = fixedRanges[key];
      slider.setAttribute('min',  r.min.toString());
      slider.setAttribute('max',  r.max.toString());
      slider.setAttribute('step', r.step.toString());
    }
    
    slider.value = state[key];
    label.innerText = formatNumber(state[key]);
    
    slider.addEventListener('input', e => {
      const value = parseFloat(e.target.value);
      state[key] = value;
      label.innerText = formatNumber(value);
      running = false;

      if (key === 'gravity') {
        sim.setG(state.gravity);
      }
      else if (key === 'step') {
      }
      else {
        const body = parseInt(key.slice(-1), 10) - 1;
        sim.setBody(
          body,
          state[`mass${body+1}`],
          state[`posX${body+1}`],
          state[`posY${body+1}`],
          state[`velX${body+1}`],
          state[`velY${body+1}`]
        );
      }
    });
  });
  
  function formatNumber(num) {
    if (Math.abs(num) >= 1e6 || Math.abs(num) <= 1e-6) {
      return num.toExponential(4);
    }
    return num.toString();
  }
  
  function syncSlider(key) {
    const s = document.getElementById(key + 'Slider');
    const v = document.getElementById(key + 'Value');
    s.value     = state[key];
    v.innerText = formatNumber(state[key]);
  }

  //----------------Buttons------------------

  let sim, running = false;

  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const centerBtn = document.getElementById('centerBtn');

  startBtn.addEventListener('click', () => {
    frame = 0;
    running = true;
    pauseBtn.textContent = 'Pause';

    simTime = 0;
    if (recordEnergy && energyChart) {
      timeData.length   = 0;
      energyData.length = 0;
      energyChart.data.labels = [];
      energyChart.data.datasets[0].data = [];
      initialEnergy = sim.getTotalEnergy();
      energyChart.options.scales.y.min = initialEnergy * 0.90;
      energyChart.options.scales.y.max = initialEnergy * 1.10;
      energyChart.update();
    }

  });

  pauseBtn.addEventListener('click', () => {
    if (!running) {
      // if currently paused, resume
      running = true;
      pauseBtn.textContent = 'Pause';
    } else {
      // if running, pause
      running = false;
      pauseBtn.textContent = 'Resume';
    }
  });

  centerBtn.addEventListener('click', () => {
    const positions = sim.getPositions();
    const masses    = sim.getMasses();
    const [comX, comY] = centerOfMass(positions, masses);
    panX = -comX;
    panY = -comY;
  });

  resetBtn.addEventListener('click', () => {

    Object.assign(state, defaults);
    resetSim();
  
    running = false;
    frame   = 0;
    pauseBtn.textContent = 'Pause';
  
    sliderKeys.forEach(syncSlider);
  
    scale = 1e6;
    panX = 0;
    panY = 0;
    isPanning = false;
    dragging  = false;
    dragIndex = null;
    canvas.style.cursor = 'default';
  });

  function resetSim() {
    sim = new Module.NBodySimulator();
    sim.initialize(2, state.gravity);
    sim.setBody(0, state.mass1, state.posX1, state.posY1, state.velX1, state.velY1);
    sim.setBody(1, state.mass2, state.posX2, state.posY2, state.velX2, state.velY2);
  }

  function centerOfMass(positions, masses) {
    let cx = 0, cy = 0, M = 0;
    for (let i = 0; i < positions.length; i += 2) {
      const m = masses[i/2];
      cx += positions[i]   * m;
      cy += positions[i+1] * m;
      M  += m;
    }
    return [cx/M, cy/M];
  }

  //----------------Zoom------------------

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
  
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
  
    const [wxBefore, wyBefore] = screenToWorld(e.offsetX, e.offsetY);
  
    scale *= zoomFactor;
  
    const [wxAfter, wyAfter] = screenToWorld(e.offsetX, e.offsetY);
  
    panX += (wxAfter - wxBefore);
    panY += (wyAfter - wyBefore);
  });

  //----------------Draw------------------

  
  let frame = 0;
  function loop() {

    if (running) {

      sim.step(state.step);

      if (recordEnergy) {
        simTime += state.step;
        const E = sim.getTotalEnergy();
        timeData.push(simTime);
        energyData.push(E);
        if (energyChart) {
          energyChart.data.labels = timeData;
          energyChart.data.datasets[0].data = energyData;
          energyChart.update();
        }
      }
    }

    const pos = sim.getPositions();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw bodies
    for (let i = 0; i < pos.length; i += 2) {
      const x = (pos[i]   + panX) / scale + canvas.width/2;
      const y = canvas.height/2 - ((pos[i+1] + panY) / scale);
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2*Math.PI);
      ctx.fillStyle = i === 0 ? 'blue' : 'white';
      ctx.fill();

      //follow center of mass
      //const [comX, comY] = centerOfMass(pos, sim.getMasses());
      //ctx.setTransform(scale, 0, 0, scale, canvas.width/2 - scale*comX, canvas.height/2 - scale*comY);
    }

    // log state every second (≈60 frames)
    if (frame % 60 === 0) {
      console.log(
        `Frame ${frame}: ` +
        `B0 v=(${sim.getVelocities()[0].toFixed(1)},${sim.getVelocities()[1].toFixed(1)}) ` +
        `B1 v=(${sim.getVelocities()[2].toFixed(1)},${sim.getVelocities()[3].toFixed(1)})`
      );
    }
    frame++;
    requestAnimationFrame(loop);
  }


  //----------------Drag------------------

  const bodyRadiusPx = 10;
  let dragging  = false, dragIndex = null;

  function screenToWorld(mx,my) {

    const wx = (mx - canvas.width/2)*scale - panX;
    const wy = (canvas.height/2 - my)*scale - panY;
    return [wx,wy];
  }

  function worldToScreen(wx,wy) {

    const sx = (wx + panX)/scale + canvas.width/2;
    const sy = canvas.height/2 - ((wy + panY)/scale);
    return [sx,sy];
  }

  canvas.addEventListener('mousedown', e => {

    const r   = canvas.getBoundingClientRect(),
    mx  = e.clientX - r.left,
    my  = e.clientY - r.top,
    pos = sim.getPositions();
  
    for (let b = 0; b < pos.length/2; b++) {
      const [sx, sy] = worldToScreen(pos[2*b], pos[2*b+1]);
      if ((sx - mx)**2 + (sy - my)**2 < bodyRadiusPx**2) {
        dragging   = true;
        dragIndex  = b;
        running    = false;
        pauseBtn.textContent = 'Resume';
        canvas.style.cursor = 'grabbing';
        return;
      }
    }
  
    isPanning       = true;
    mouseStart.x    = e.clientX;
    mouseStart.y    = e.clientY;
    panStart.x      = panX;
    panStart.y      = panY;
    canvas.style.cursor = 'grab';
  });

  canvas.addEventListener('mousemove', e => {

    if (dragging) {
      const rect = canvas.getBoundingClientRect();
      const [wx, wy] = screenToWorld(
        e.clientX - rect.left,
        e.clientY - rect.top
      );
      const i = dragIndex + 1;
      state[`posX${i}`] = wx;
      state[`posY${i}`] = wy;
      document.getElementById(`posX${i}Slider`).value = wx;
      document.getElementById(`posY${i}Slider`).value = wy;
      document.getElementById(`posX${i}Value`).innerText = formatNumber(wx);
      document.getElementById(`posY${i}Value`).innerText = formatNumber(wy);
      sim.setBody(
        dragIndex,
        state[`mass${i}`],
        wx, wy,
        state[`velX${i}`],
        state[`velY${i}`]
      );
    }
    else if (isPanning) {

      const dx = e.clientX - mouseStart.x;
      const dy = e.clientY - mouseStart.y;
      panX = panStart.x + dx * scale;
      panY = panStart.y - dy * scale;
    }
  });

  ['mouseup','mouseleave'].forEach(evt =>
    canvas.addEventListener(evt, () => {
      // if we were dragging a body, stop
      if (dragging) {
        dragging  = false;
        dragIndex = null;
      }
      // if we were panning the view, stop
      if (isPanning) {
        isPanning = false;
      }
      // reset cursor
      canvas.style.cursor = 'default';
    })
  );


  //----------------Energy------------------

let simTime       = 0;
let timeData      = [];
let energyData    = [];
let recordEnergy  = false;
let initialEnergy = null;
let energyChart   = null;

const toggleGraphBtn = document.getElementById('toggleGraphBtn');
const energyCanvas   = document.getElementById('energyChart');

toggleGraphBtn.addEventListener('click', () => {
  recordEnergy = !recordEnergy;
  energyCanvas.style.display = recordEnergy ? 'block' : 'none';
  toggleGraphBtn.textContent = recordEnergy ? 'Hide Energy' : 'Show Energy';

  if (recordEnergy && !energyChart) {

    initialEnergy = sim.getTotalEnergy();

    const ctx2 = energyCanvas.getContext('2d');
    energyChart = new Chart(ctx2, {
      type: 'line',
      data: {
        labels: timeData,
        datasets: [{
          label: 'Total Energy (J)',
          data: energyData,
          fill: false,
          borderWidth: 1,
          pointRadius: 0
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: {
            title: { display:true, text: 'Time (s)' }
          },
          y: {
            min: initialEnergy * 0.9,
            max: initialEnergy * 1.1,
            title: { display:true, text: 'Energy (J)' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  if (!recordEnergy) {

    timeData.length   = 0;
    energyData.length = 0;
    simTime = 0;
    if (energyChart) {
      energyChart.data.labels = [];
      energyChart.data.datasets[0].data = [];
      energyChart.update();
    }
  }
});


if (running && recordEnergy) {
  simTime += state.step;
  const E = sim.getTotalEnergy();
  timeData.push(simTime);
  energyData.push(E);
  if (energyChart) {
    energyChart.update(); 
  }
}


  resetSim();
  loop();
})
.catch(console.error);
