export function initParticleNetwork() {
  const canvas = document.getElementById('net');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, points;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const COUNT = Math.floor((window.innerWidth * window.innerHeight) / 14000);

  function initPoints() {
    points = [];
    for (let i = 0; i < COUNT; i++) {
      points.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
      });
    }
  }
  initPoints();

  const mouse = { x: null, y: null };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of points) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180,200,255,0.7)';
      ctx.fill();
    }
    const maxDist = 130;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
          ctx.strokeStyle = `rgba(120,150,255,${(1 - dist / maxDist) * 0.25})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      if (mouse.x !== null) {
        const dx = points[i].x - mouse.x;
        const dy = points[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 160) {
          ctx.beginPath();
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(150,180,255,${(1 - dist / 160) * 0.4})`;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}
