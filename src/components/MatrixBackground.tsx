
'use client';
import React, { useEffect, useRef } from 'react';

export const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Символи: Кирилица + Цифри + Тех
    const chars = 'БГДЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ0123456789ABCDEF<>[]{}*&^%$#!'.split('');
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = new Array(columns).fill(1);

    // Логика за забавяне (FPS)
    let lastTime = 0;
    const fps = 18; // Малко по-бързо от 15 за Next.js версията, но все пак бавно
    const interval = 1000 / fps;

    const draw = () => {
      // Лек прозрачен черен фон за следа (tail effect)
      ctx.fillStyle = 'rgba(5, 5, 5, 0.1)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        // Случаен символ
        const text = chars[Math.floor(Math.random() * chars.length)];
        
        // Матрично зелено
        const isHead = Math.random() > 0.98;
        ctx.fillStyle = isHead ? '#fff' : 'rgba(0, 180, 50, 0.9)';
        
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Рестартиране на капка
        if (drops[i] * fontSize > height && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    let animationId: number;
    const animate = (timestamp: number) => {
      const delta = timestamp - lastTime;

      if (delta > interval) {
        draw();
        lastTime = timestamp - (delta % interval);
      }
      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const newColumns = Math.floor(width / fontSize);
      if (newColumns > drops.length) {
        for (let i = drops.length; i < newColumns; i++) drops[i] = 1;
      }
    };

    window.addEventListener('resize', handleResize);
    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40"
      style={{ filter: 'blur(0.5px)' }}
    />
  );
};
