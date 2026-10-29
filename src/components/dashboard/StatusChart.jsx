import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function StatusChart({ orders }) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const counts = {
      recibida: orders.filter((o) => o.status === 'recibida').length,
      diagnostico: orders.filter((o) => o.status === 'diagnostico').length,
      reparacion: orders.filter((o) => o.status === 'reparacion').length,
      lista: orders.filter((o) => o.status === 'lista').length,
      entregada: orders.filter((o) => o.status === 'entregada').length
    };

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'Recibidas',
          'Diagnóstico',
          'En Reparación',
          'Listas para Entrega',
          'Entregadas/Cobradas'
        ],
        datasets: [
          {
            label: 'Cantidad de Motos',
            data: [
              counts.recibida,
              counts.diagnostico,
              counts.reparacion,
              counts.lista,
              counts.entregada
            ],
            backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4'],
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: '#9ca3af' },
            grid: { color: '#1f293d' }
          },
          x: {
            ticks: { color: '#9ca3af' },
            grid: { display: false }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [orders]);

  return (
    <div style={{ height: '260px', position: 'relative' }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

