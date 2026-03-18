import Chart from 'chart.js/auto';

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('rikhabakes_token');
  if (!token) {
    window.location.href = '/index.html'; // Unauthenticated, boot to index
    return;
  }

  // Logout handler
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    localStorage.removeItem('rikhabakes_token');
    window.location.href = '/index.html';
  });

  try {
    const res = await fetch('/api/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('rikhabakes_token');
      window.location.href = '/index.html';
      return;
    }
    
    const data = await res.json();
    
    // Update numeric stat
    const subsEl = document.getElementById('total-subscribers');
    if (subsEl) subsEl.textContent = data.total_subscribers.toString();

    // Render Growth Line Chart
    const growthCtx = document.getElementById('growthChart') as HTMLCanvasElement;
    if (growthCtx) {
      new Chart(growthCtx, {
        type: 'line',
        data: {
          labels: data.growth.map((d: any) => d.month),
          datasets: [{
            label: 'Client Base',
            data: data.growth.map((d: any) => d.customers),
            borderColor: '#ffffff',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#ffffff',
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888', font: {family: 'Manrope'} } },
            x: { grid: { display: false }, ticks: { color: '#888', font: {family: 'Manrope'} } }
          }
        }
      });
    }

    // Render Sales Doughnut Chart
    const salesCtx = document.getElementById('salesChart') as HTMLCanvasElement;
    if (salesCtx) {
      new Chart(salesCtx, {
        type: 'doughnut',
        data: {
          labels: data.sales.map((d: any) => d.product),
          datasets: [{
            data: data.sales.map((d: any) => d.revenue),
            backgroundColor: ['#ffffff', '#aaaaaa', '#333333'],
            borderWidth: 1,
            borderColor: '#141414'
          }]
        },
        options: {
          responsive: true,
          cutout: '75%',
          plugins: {
            legend: { position: 'bottom', labels: { color: '#888', padding: 20, font: { family: 'Manrope', size: 12 } } }
          }
        }
      });
    }

  } catch (error) {
    console.error("Failed to load dashboard data", error);
  }
});
