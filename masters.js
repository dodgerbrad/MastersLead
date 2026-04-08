document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    // Refresh every 5 minutes
    setInterval(updateDashboard, 300000);
});

function updateDashboard() {
    const urlParams = new URLSearchParams(window.location.search);
    const draftMaster = urlParams.get('draftMaster');

    // Updated API URL
    const BASE_API_URL = 'https://script.google.com/macros/s/AKfycbx8byAp_x5NKFhHrDUiiscVTrcbPjQ1FvrUmwuZW02RxLSoDiGRySwqFJKnPHPMKznUGQ/exec';

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
        if (item.team === "Undrafted") {
            tr.classList.add('undrafted-row');
        }
        
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
                img.src = `flags/${item.flag || 'masters.png'}`; 
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

    // Sort by rank
    teamData.sort((a, b) => (parseInt(a.rank) || 999) - (parseInt(b.rank) || 999));

    tableBody.innerHTML = '';

    teamData.forEach(item => {
        const tr = document.createElement('tr');
        tr.classList.add('fairway-row');
        
        const keys = ['betterName', 'pts', 'ptsBack', 'rank'];

        keys.forEach(key => {
            const td = document.createElement('td');
            td.textContent = item[key] !== undefined ? item[key] : '';

            // Make the Team Name (betterName) clickable
            if (key === 'betterName') {
                td.style.color = '#006747'; // Masters Green
                td.style.cursor = 'pointer';
                td.style.textDecoration = 'underline';
                
                td.onclick = () => {
                    const searchInput = document.getElementById("leaderboard-search");
                    searchInput.value = item.betterName; // Put team name in search box
                    filterLeaderboard(); // Trigger the filter
                    
                    // Smooth scroll down to the leaderboard
                    document.getElementById('leaderboard-container').scrollIntoView({ behavior: 'smooth' });
                };
            }

            if (key === 'rank' || key === 'pts') {
                td.style.fontWeight = 'bold';
            }

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
            const teamValue = teamTd.textContent || teamTd.innerText;
            
            // Only checks the Team column
            if (teamValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function refreshPage() {
    const header = document.getElementById('main-header');
    
    // Start the green bar animation
    header.classList.add('loading-bar');
    
    // Wait for the 500ms animation to complete, then reload
    setTimeout(() => {
        window.location.reload();
    }, 500);
}

function clearFilter() {
    const searchInput = document.getElementById("leaderboard-search");
    searchInput.value = ""; // Clear the text
    filterLeaderboard();    // Run the filter logic (shows everything)
    
    // Optional: Smooth scroll back to top of leaderboard
    document.getElementById('leaderboard-container').scrollIntoView({ behavior: 'smooth' });
}




