(function(){
  document.body.insertAdjacentHTML('afterbegin',
    '<canvas id="bgcanvas" style="position:fixed;inset:0;z-index:0;"></canvas>' +
    '<div class="spotlight" id="spot" style="position:fixed;inset:0;z-index:1;pointer-events:none;' +
    'background:radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(79,217,196,0.07), transparent 60%);"></div>'
  );

  ['main','footer'].forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(el){
      el.style.position = 'relative';
      el.style.zIndex = '2';
    });
  });

  var spot = document.getElementById('spot');
  window.addEventListener('mousemove', function(e){
    spot.style.setProperty('--mx', e.clientX + 'px');
    spot.style.setProperty('--my', e.clientY + 'px');
  });

  if(!document.querySelector('.assist-pill')){
    document.body.insertAdjacentHTML('beforeend',
      '<a href="index.html#waitlist" class="assist-pill" style="position:fixed;bottom:24px;left:24px;z-index:40;' +
      'background:var(--bg-panel);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);' +
      'border:1px solid var(--border);border-radius:30px;padding:12px 20px 12px 14px;display:flex;' +
      'align-items:center;gap:10px;font-family:\'IBM Plex Mono\',monospace;font-size:12px;' +
      'color:var(--text-muted);text-decoration:none;">' +
      '<span style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#4FD9C4,#534AB7);flex:none;display:inline-block;"></span>' +
      'Ask Vetari AI about your exposure →</a>'
    );
  }

  if(!window.THREE) return;

  var canvas = document.getElementById('bgcanvas');
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 60;

  var COUNT = 110;
  var positions = new Float32Array(COUNT * 3);
  var velocities = [];
  for(var i = 0; i < COUNT; i++){
    positions[i*3]   = (Math.random() - 0.5) * 140;
    positions[i*3+1] = (Math.random() - 0.5) * 90;
    positions[i*3+2] = (Math.random() - 0.5) * 60;
    velocities.push({ x:(Math.random()-0.5)*0.03, y:(Math.random()-0.5)*0.03, z:(Math.random()-0.5)*0.02 });
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var mat = new THREE.PointsMaterial({ color: 0x4FD9C4, size: 1.6, transparent: true, opacity: 0.7 });
  var points = new THREE.Points(geo, mat);
  scene.add(points);

  var lineMat = new THREE.LineBasicMaterial({ color: 0x2A4A5A, transparent: true, opacity: 0.22 });
  var lineGeo = new THREE.BufferGeometry();
  var lineSegs = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lineSegs);

  function updateLines(){
    var verts = [];
    var maxDist = 18;
    for(var i = 0; i < COUNT; i++){
      for(var j = i + 1; j < COUNT; j++){
        var dx = positions[i*3] - positions[j*3];
        var dy = positions[i*3+1] - positions[j*3+1];
        var dz = positions[i*3+2] - positions[j*3+2];
        var d = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if(d < maxDist){
          verts.push(positions[i*3], positions[i*3+1], positions[i*3+2]);
          verts.push(positions[j*3], positions[j*3+1], positions[j*3+2]);
        }
      }
    }
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
  }
  updateLines();

  var frame = 0;
  function animate(){
    requestAnimationFrame(animate);
    frame++;
    for(var i = 0; i < COUNT; i++){
      positions[i*3]   += velocities[i].x;
      positions[i*3+1] += velocities[i].y;
      positions[i*3+2] += velocities[i].z;
      if(Math.abs(positions[i*3]) > 70) velocities[i].x *= -1;
      if(Math.abs(positions[i*3+1]) > 45) velocities[i].y *= -1;
      if(Math.abs(positions[i*3+2]) > 30) velocities[i].z *= -1;
    }
    geo.attributes.position.needsUpdate = true;
    if(frame % 6 === 0) updateLines();
    scene.rotation.y += 0.0006;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
