const API_URL = 'https://lego-knbafg30q-jaunays-projects.vercel.app/deals/best'; // Replace with your deployed API URL

async function fetchBestDeals() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const container = document.getElementById('deals-container');
    container.innerHTML = '';

    data.results.forEach(deal => {
      const div = document.createElement('div');
      div.className = 'deal';

      div.innerHTML = `
        <h3>${deal.title}</h3>
        <p><strong>Price:</strong> ${deal.price ?? 'N/A'} €</p>
        <p><strong>Score:</strong> ${deal.score ?? 'N/A'}</p>
        <a href="${deal.link}" target="_blank">View deal</a>
      `;

      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading deals:", err);
    document.getElementById('deals-container').textContent = "Failed to load deals 😢";
  }
}

fetchBestDeals();
