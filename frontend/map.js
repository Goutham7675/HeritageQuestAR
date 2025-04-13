const API_BASE = "http://localhost:5000/api";

function showLoading(elementId) {
  console.log(`Loading indicator for ${elementId}`);
}

function showError(elementId, message) {
  console.error(`Error for ${elementId}: ${message}`);
}

function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function getWallet() {
  return localStorage.getItem("walletAddress");
}

function saveWallet(walletAddress) {
  localStorage.setItem("walletAddress", walletAddress);
}

window.onload = async function initMap() {
  try {
    showLoading("map");
    const resp = await fetch(`${API_BASE}/sites`);
    const sites = await resp.json();

    // Center on Hyderabad
    const center = [17.385, 78.4867];
    const map = L.map("map", {
      zoomControl: false,
      attributionControl: false,
    }).setView(center, 13);

    // Add dark mode tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Zoom and location controls
    L.control.zoom({ position: "topright" }).addTo(map);
    L.control.locate({
      position: "topright",
      flyTo: true,
      strings: { title: "Show my location" },
      locateOptions: { enableHighAccuracy: true },
    }).addTo(map);

    // Add site markers and geofence circles
    sites.forEach((site) => {
      const marker = L.marker([site.lat, site.lng]).addTo(map);
      const popupContent = `
        <div class="site-popup">
          <h3>${site.name}</h3>
          <p>${site.description}</p>
          <button class="btn btn-sm" onclick="window.location.href='site-detail.html?siteId=${site.siteId}'">
            View Details
          </button>
        </div>
      `;
      marker.bindPopup(popupContent);
      L.circle([site.lat, site.lng], {
        radius: 50,
        color: "#00b894",
        weight: 2,
        fillColor: "#00b894",
        fillOpacity: 0.1,
      }).addTo(map);
    });

    // If a siteId parameter is present, center and open its popup
    const siteId = getUrlParam("siteId");
    if (siteId) {
      const site = sites.find((s) => s.siteId === siteId);
      if (site) {
        map.setView([site.lat, site.lng], 16);
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            const latlng = layer.getLatLng();
            if (latlng.lat === site.lat && latlng.lng === site.lng) {
              layer.openPopup();
            }
          }
        });
      }
    }

    // Desktop keyboard controls for panning the map
    document.addEventListener("keydown", (e) => {
      const panOffset = 0.005;
      let center = map.getCenter();
      switch (e.key) {
        case "ArrowUp":
          center = [center.lat + panOffset, center.lng];
          break;
        case "ArrowDown":
          center = [center.lat - panOffset, center.lng];
          break;
        case "ArrowLeft":
          center = [center.lat, center.lng - panOffset];
          break;
        case "ArrowRight":
          center = [center.lat, center.lng + panOffset];
          break;
        default:
          return;
      }
      map.panTo(center);
    });

    // Setup wallet button logic
    const walletBtn = document.getElementById("walletBtn");
    const savedWallet = getWallet();
    if (savedWallet) {
      walletBtn.textContent = `${savedWallet.substring(0, 6)}...${savedWallet.substring(savedWallet.length - 4)}`;
    }
    walletBtn.addEventListener("click", () => {
      const wallet = prompt("Enter your wallet address:", savedWallet || "");
      if (wallet) {
        saveWallet(wallet);
        walletBtn.textContent = `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`;
      }
    });
  } catch (err) {
    console.error(err);
    showError("map", "Failed to load map data. Please try again later.");
  }
}



// // map.js
// const API_BASE = "http://localhost:5000/api"

// // Mock implementations for missing functions
// function showLoading(elementId) {
//   console.log(`Loading indicator for ${elementId}`)
// }

// function showError(elementId, message) {
//   console.error(`Error for ${elementId}: ${message}`)
// }

// function getUrlParam(param) {
//   const urlParams = new URLSearchParams(window.location.search)
//   return urlParams.get(param)
// }

// function getWallet() {
//   return localStorage.getItem("walletAddress")
// }

// function saveWallet(walletAddress) {
//   localStorage.setItem("walletAddress", walletAddress)
// }

// window.onload = async function initMap() {
//   try {
//     showLoading("map")
//     const resp = await fetch(`${API_BASE}/sites`)
//     const sites = await resp.json()

//     // Center on Hyderabad
//     const center = [17.385, 78.4867]
//     const map = L.map("map", {
//       zoomControl: false,
//       attributionControl: false,
//     }).setView(center, 13)

//     // Add dark mode map tiles
//     L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
//       attribution:
//         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
//       subdomains: "abcd",
//       maxZoom: 19,
//     }).addTo(map)

//     // Add zoom control to top-right
//     L.control
//       .zoom({
//         position: "topright",
//       })
//       .addTo(map)

//     // Locate control
//     L.control
//       .locate({
//         position: "topright",
//         flyTo: true,
//         strings: {
//           title: "Show my location",
//         },
//         locateOptions: {
//           enableHighAccuracy: true,
//         },
//       })
//       .addTo(map)

//     // Add sites and their geofences
//     sites.forEach((site) => {
//       const marker = L.marker([site.lat, site.lng]).addTo(map)

//       // Custom popup
//       const popupContent = `
//         <div class="site-popup">
//           <h3>${site.name}</h3>
//           <p>${site.description}</p>
//           <button class="btn btn-sm" onclick="window.location.href='site-detail.html?siteId=${site.siteId}'">
//             View Details
//           </button>
//         </div>
//       `

//       marker.bindPopup(popupContent)

//       // Geofence circle
//       L.circle([site.lat, site.lng], {
//         radius: 50,
//         color: "#00b894",
//         weight: 2,
//         fillColor: "#00b894",
//         fillOpacity: 0.1,
//       }).addTo(map)
//     })

//     // Check if we have a siteId parameter
//     const siteId = getUrlParam("siteId")
//     if (siteId) {
//       const site = sites.find((s) => s.siteId === siteId)
//       if (site) {
//         map.setView([site.lat, site.lng], 16)
//         // Find the marker and open its popup
//         map.eachLayer((layer) => {
//           if (layer instanceof L.Marker) {
//             const latlng = layer.getLatLng()
//             if (latlng.lat === site.lat && latlng.lng === site.lng) {
//               layer.openPopup()
//             }
//           }
//         })
//       }
//     }

//     // Desktop keyboard controls for panning the map
//     document.addEventListener("keydown", (e) => {
//       const panOffset = 0.005
//       let center = map.getCenter()
//       switch (e.key) {
//         case "ArrowUp":
//           center = [center.lat + panOffset, center.lng]
//           break
//         case "ArrowDown":
//           center = [center.lat - panOffset, center.lng]
//           break
//         case "ArrowLeft":
//           center = [center.lat, center.lng - panOffset]
//           break
//         case "ArrowRight":
//           center = [center.lat, center.lng + panOffset]
//           break
//         default:
//           return
//       }
//       map.panTo(center)
//     })

//     // Setup wallet button
//     const walletBtn = document.getElementById("walletBtn")
//     const savedWallet = getWallet()

//     if (savedWallet) {
//       walletBtn.textContent = `${savedWallet.substring(0, 6)}...${savedWallet.substring(savedWallet.length - 4)}`
//     }

//     walletBtn.addEventListener("click", () => {
//       const wallet = prompt("Enter your wallet address:", savedWallet || "")
//       if (wallet) {
//         saveWallet(wallet)
//         walletBtn.textContent = `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`
//       }
//     })
//   } catch (err) {
//     console.error(err)
//     showError("map", "Failed to load map data. Please try again later.")
//   }
// }
