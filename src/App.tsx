import { useEffect, useRef, useState } from 'react';

interface Trail {
  x: number;
  y: number;
  id: number;
  size: number;
  hue: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: number;
  id: number;
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);
  const trailIdRef = useRef(0);
  const particleIdRef = useRef(0);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const hueRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setTrails((prev) => {
        const newTrails = prev.map((trail) => ({
          ...trail,
          size: trail.size * 0.92,
        })).filter((trail) => trail.size > 0.5);

        newTrails.forEach((trail) => {
          const gradient = ctx.createRadialGradient(
            trail.x, trail.y, 0,
            trail.x, trail.y, trail.size
          );
          gradient.addColorStop(0, `hsla(${trail.hue}, 100%, 60%, 0.8)`);
          gradient.addColorStop(0.5, `hsla(${trail.hue}, 100%, 50%, 0.4)`);
          gradient.addColorStop(1, `hsla(${trail.hue}, 100%, 40%, 0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
          ctx.fill();
        });

        return newTrails;
      });

      setParticles((prev) => {
        const newParticles = prev.map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2,
          life: p.life - 1,
        })).filter((p) => p.life > 0);

        newParticles.forEach((p) => {
          const alpha = p.life / 60;
          ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fill();
        });

        return newParticles;
      });

      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      setMousePos({ x, y });

      const dx = x - lastMousePosRef.current.x;
      const dy = y - lastMousePosRef.current.y;
      const velocity = Math.sqrt(dx * dx + dy * dy);

      hueRef.current = (hueRef.current + 2) % 360;

      const size = Math.min(20 + velocity * 0.5, 60);

      setTrails((prev) => [
        ...prev,
        {
          x,
          y,
          id: trailIdRef.current++,
          size,
          hue: hueRef.current,
        },
      ]);

      lastMousePosRef.current = { x, y };
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsPressed(true);
      const newParticles: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const speed = 3 + Math.random() * 4;
        newParticles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 60,
          hue: hueRef.current,
          id: particleIdRef.current++,
        });
      }
      setParticles((prev) => [...prev, ...newParticles]);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden cursor-none bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-pink-500/10 animate-pulse" />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-10">
        <h1 className="text-6xl font-bold text-white mb-4 tracking-wider drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
          Move & Click
        </h1>
        <p className="text-xl text-white/70 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
          Experience the magic
        </p>
      </div>

      <div
        className="absolute pointer-events-none z-50 transition-transform duration-100"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          transform: `translate(-50%, -50%) scale(${isPressed ? 0.8 : 1})`,
        }}
      >
        <div className="w-6 h-6 rounded-full border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.8)] backdrop-blur-sm" />
      </div>
    </div>
  );
}

export default App;
