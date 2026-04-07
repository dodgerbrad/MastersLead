document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    // Refresh every 5 minutes
    setInterval(updateDashboard, 300000);
});

function updateDashboard() {
    const urlParams = new URLSearchParams(window.location.search);
    const draftMaster = urlParams.get('draftMaster');

    // Updated API URL
    const BASE_API_URL = 'https://script.google.com/macros/s/AKfycbxBkqiZq47fpsJ4GCAMRtVx-eRa1LY65aJZ3D4i2q_JHcy7a0wUIKYHKE9eFM6IwP1Afg/exec';

    let fetchUrl = `${BASE_API_URL}?page=leaderboard`;
    if (draftMaster) {
        fetchUrl += `&draftMaster=${encodeURIComponent(draftMaster)}`;
    }

    console.log('Fetching latest scores for:', draftMaster || 'All Teams');

    fetch(fetchUrl)
        .then(response => response.json())
        .then(data => {
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
        
        // Match the columns in your HTML <thead>
        const columns = ['rank', 'name', 'total', 'today', 'pts', 'team'];
        
        columns.forEach((key, index) => {
            const td = document.createElement('td');
            
            if (key === 'name') {
                // Ensure name cell layout is horizontal
                td.style.display = 'flex';
                td.style.alignItems = 'center';
                td.style.gap = '10px';
                td.style.whiteSpace = 'nowrap'; // Keeps name on one line

                // Flag Image: Looking in your GitHub 'flags' folder
                const img = document.createElement('img');
                // Path must be relative for GitHub Pages
                img.src = `flags/${item.flag || 'default.png'}`; 
                img.style.width = '24px';
                img.style.height = 'auto';
                img.style.borderRadius = '2px';
                img.style.flexShrink = '0'; // Prevents flag from squishing
                img.alt = ''; 

                // Name Text
                const nameSpan = document.createElement('span');
                nameSpan.textContent = item.name;

                td.appendChild(img);
                td.appendChild(nameSpan);
            } else {
                td.textContent = item[key];
            }

            // Pts Styling (Column index 4)
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
        // Updated to search BOTH the Player Name (td[1]) AND Team Name (td[5])
        const nameTd = tr[i].getElementsByTagName("td")[1];
        const teamTd = tr[i].getElementsByTagName("td")[5];
        
        if (nameTd || teamTd) {
            const nameValue = nameTd ? nameTd.textContent || nameTd.innerText : "";
            const teamValue = teamTd ? teamTd.textContent || teamTd.innerText : "";
            
            if (nameValue.toUpperCase().indexOf(filter) > -1 || teamValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
