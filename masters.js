document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    // Refresh every 5 minutes
    setInterval(updateDashboard, 300000);
});

function updateDashboard() {
    // 1. Get draftMaster from the browser URL (e.g., ?draftMaster=Sam)
    const urlParams = new URLSearchParams(window.location.search);
    const draftMaster = urlParams.get('draftMaster');

    // 2. Base URL from your Google Apps Script Deployment
    const BASE_API_URL = 'https://script.google.com/macros/s/AKfycbxpdmq-J2KiLXS11PnX4V55GoT-HHV9Yukq3FQIBPJyQN6JOgTrNgyDO2tsuKsOfbbN9w/exec';

    // 3. Build the Fetch URL with parameters
    let fetchUrl = `${BASE_API_URL}?page=leaderboard`;
    if (draftMaster) {
        fetchUrl += `&draftMaster=${encodeURIComponent(draftMaster)}`;
    }

    console.log('Fetching latest scores for:', draftMaster || 'All Teams');

    fetch(fetchUrl)
        .then(response => response.json())
        .then(data => {
            // These keys (leaderboardData, teamPointsData) must match your Apps Script
            displayLeaderboard(data.leaderboardData);
            displayTeamData(data.teamPointsData);

            const statusMsg = document.getElementById('status-message');
            if (statusMsg) statusMsg.style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            const statusMsg = document.getElementById('status-message');
            if (statusMsg) statusMsg.textContent = 'Error loading data.';
        });
}

function displayLeaderboard(leaderboardData) {
    const tableBody = document.getElementById('leaderboard-body');
    if (!tableBody || !leaderboardData) return;

    tableBody.innerHTML = '';

    leaderboardData.forEach(item => {
        const tr = document.createElement('tr');
        
        // Define the order of columns
        const columns = ['rank', 'name', 'total', 'today', 'pts', 'team'];
        
        columns.forEach((key, index) => {
            const td = document.createElement('td');
            
            if (key === 'name') {
                // Create a container for the flag and name
                td.style.display = 'flex';
                td.style.alignItems = 'center';
                td.style.gap = '10px';

                // Create the flag image
                const img = document.createElement('img');
                // Use the 'flag' property from your updated Apps Script
                img.src = `flags/${item.flag || 'default.png'}`; 
                img.style.width = '24px';
                img.style.height = 'auto';
                img.style.borderRadius = '2px';
                img.alt = ''; // Decorative

                // Create the text span for the name
                const nameSpan = document.createElement('span');
                nameSpan.textContent = item.name;

                td.appendChild(img);
                td.appendChild(nameSpan);
            } else {
                // Standard text for other columns
                td.textContent = item[key];
            }

            // Keep your existing styling for the Pts column (index 4)
            if (index === 4) {
                td.style.fontWeight = 'bold';
                td.style.color = 'var(--golf-green)';
                td.style.textAlign = 'center';
            }
            
            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });
}



function displayTeamData(teamData) {
    const tableBody = document.getElementById('team-body');
    if (!tableBody || !teamData) return;

    tableBody.innerHTML = '';

    teamData.forEach(item => {
        const tr = document.createElement('tr');
        
        // Column keys defined in the Apps Script .map() section
        const keys = ['betterName', 'pts', 'ptsBack', 'rank'];

        keys.forEach(key => {
            const td = document.createElement('td');
            td.textContent = item[key] !== undefined ? item[key] : '';
            tr.appendChild(td);
        });

        tableBody.appendChild(tr);
    });
}

function filterLeaderboard() {
    const input = document.getElementById("leaderboard-search");
    const filter = input.value.toUpperCase();
    const tableBody = document.getElementById("leaderboard-body");
    const tr = tableBody.getElementsByTagName("tr");

    for (let i = 0; i < tr.length; i++) {
        // Targets the 6th column (index 5) - "Team"
        const teamTd = tr[i].getElementsByTagName("td")[5];
        if (teamTd) {
            const teamName = teamTd.textContent || teamTd.innerText;
            tr[i].style.display = teamName.toUpperCase().indexOf(filter) > -1 ? "" : "none";
        }
    }
}
