/* 
Name                 : CuraPanel - Free Tailwind CSS Healthcare Admin Dashboard Template
Author               : TemplateRise
Url                  : https://www.templaterise.com/template/curapanel-free-tailwind-css-healthcare-admin-dashboard-template 
*/


// Lucide icons will be initialized after DOM is loaded

// Initialize theme immediately (before DOM is ready)
function initializeTheme() {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem("theme") || "light";
    
    if (savedTheme === "dark") {
        html.classList.add("dark");
    } else {
        html.classList.remove("dark");
    }
    
    console.log('🌙 Theme initialized:', savedTheme);
}

// Initialize theme immediately
initializeTheme();

// Wait for DOM to be ready before initializing
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Theme toggle functionality
    const themeToggle = document.getElementById("theme-toggle");
    const html = document.documentElement;
    
    if (themeToggle) {
        // Update theme toggle icons based on current theme
        updateThemeToggleIcons();
        
        themeToggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const wasDark = html.classList.contains("dark");
            html.classList.toggle("dark");
            const isDark = html.classList.contains("dark");
            const theme = isDark ? "dark" : "light";
            
            localStorage.setItem("theme", theme);
            console.log('🌙 Theme toggled:', wasDark ? 'dark → light' : 'light → dark');
            
            // Update icons after theme change
            updateThemeToggleIcons();
            
            // Re-initialize Lucide icons to update theme-dependent icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            // Force re-render of any charts or components
            if (typeof updateChartsForTheme === 'function') {
                updateChartsForTheme();
            }
        });
    }
});

// Function to update theme toggle icons
function updateThemeToggleIcons() {
    const themeToggle = document.getElementById("theme-toggle");
    if (!themeToggle) {
        console.warn('🌙 Theme toggle button not found');
        return;
    }
    
    const html = document.documentElement;
    const isDark = html.classList.contains("dark");
    
    const sunIcon = themeToggle.querySelector('[data-lucide="sun"]');
    const moonIcon = themeToggle.querySelector('[data-lucide="moon"]');
    
    if (sunIcon && moonIcon) {
        if (isDark) {
            // Show sun icon (to switch to light mode)
            sunIcon.classList.remove("hidden");
            sunIcon.classList.add("block");
            moonIcon.classList.remove("block");
            moonIcon.classList.add("hidden");
            console.log('🌙 Icons updated: showing sun (dark mode active)');
        } else {
            // Show moon icon (to switch to dark mode)
            sunIcon.classList.remove("block");
            sunIcon.classList.add("hidden");
            moonIcon.classList.remove("hidden");
            moonIcon.classList.add("block");
            console.log('🌙 Icons updated: showing moon (light mode active)');
        }
    } else {
        console.warn('🌙 Theme toggle icons not found');
    }
}

// Listen for theme changes from other tabs/windows
window.addEventListener('storage', function(e) {
    if (e.key === 'theme') {
        const html = document.documentElement;
        const newTheme = e.newValue;
        
        console.log('🌙 Theme changed from another tab:', newTheme);
        
        if (newTheme === "dark") {
            html.classList.add("dark");
        } else {
            html.classList.remove("dark");
        }
        
        // Update icons
        updateThemeToggleIcons();
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Update charts if they exist
        if (typeof updateChartsForTheme === 'function') {
            updateChartsForTheme();
        }
    }
});

// Listen for theme changes from other pages in the same tab
window.addEventListener('beforeunload', function() {
    // Save current theme state
    const html = document.documentElement;
    const currentTheme = html.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", currentTheme);
});

// Sidebar toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebarClose = document.getElementById("sidebar-close");

    function toggleSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.toggle("active");
            sidebarOverlay.classList.toggle("active");
        }
    }

    if(sidebarToggle && sidebarClose && sidebarOverlay){
        sidebarToggle.addEventListener("click", toggleSidebar);
        sidebarClose.addEventListener("click", toggleSidebar);
        sidebarOverlay.addEventListener("click", toggleSidebar);
    }
});


// Notification and Settings dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const notificationBtn = document.getElementById("notification-btn");
    const notificationDropdown = document.getElementById("notification-dropdown");
    const settingsBtn = document.getElementById("settings-btn");
    const settingsDropdown = document.getElementById("settings-dropdown");

    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            notificationDropdown.classList.toggle("hidden");
            if (settingsDropdown) {
                settingsDropdown.classList.add("hidden");
            }
        });
    }

    if (settingsBtn && settingsDropdown) {
        settingsBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            settingsDropdown.classList.toggle("hidden");
            if (notificationDropdown) {
                notificationDropdown.classList.add("hidden");
            }
        });
    }
});

// Close dropdowns when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const notificationBtn = document.getElementById("notification-btn");
    const notificationDropdown = document.getElementById("notification-dropdown");
    const settingsBtn = document.getElementById("settings-btn");
    const settingsDropdown = document.getElementById("settings-dropdown");

    document.addEventListener("click", (e) => {
        if (notificationBtn && notificationDropdown &&
            !notificationBtn.contains(e.target) &&
            !notificationDropdown.contains(e.target)
        ) {
            notificationDropdown.classList.add("hidden");
        }
        if (settingsBtn && settingsDropdown &&
            !settingsBtn.contains(e.target) && 
            !settingsDropdown.contains(e.target)) {
            settingsDropdown.classList.add("hidden");
        }
    });
});

// Mobile search functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileSearchBtn = document.getElementById("mobile-search-btn");
    const mobileSearchContainer = document.getElementById("mobile-search-container");

    if (mobileSearchBtn && mobileSearchContainer) {
        // Toggle on button click
        mobileSearchBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // prevent immediate outside click
            mobileSearchContainer.classList.toggle("hidden");
        });

        // Hide when clicking outside
        document.addEventListener("click", (e) => {
            if (
                !mobileSearchContainer.contains(e.target) &&
                !mobileSearchBtn.contains(e.target)
            ) {
                mobileSearchContainer.classList.add("hidden");
            }
        });
    }
});

// Dropdown toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll(".dropdown-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const submenu = button.nextElementSibling;
            if (submenu) {
                submenu.classList.toggle("hidden");
            }
            const icon = button.querySelector("i[data-lucide='chevron-down']");
            if (icon) {
                icon.classList.toggle("rotate-180");
            }
        });
    });
});

// Chart initialization and configuration
let newPatientsChart, revenueChart;

function initCharts() {
  const html = document.documentElement;
  const isDarkMode = html.classList.contains("dark");
  const textColor = isDarkMode ? "#E5E7EB" : "#374151";
  const gridColor = isDarkMode
    ? "rgba(75, 85, 99, 0.3)"
    : "rgba(209, 213, 219, 0.8)";

  // New Patients Chart

  const newPatientsEl = document.getElementById("newPatientsChart");

  if (newPatientsEl) {
      const newPatientsCtx = newPatientsEl.getContext("2d");
      newPatientsChart = new Chart(newPatientsCtx, {
        type: "line",
        data: {
          labels: [
            "Ian",
            "Feb",
            "Mar",
            "Apr",
            "Mai",
            "Iun",
            "Iul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Clienți Noi",
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Se va actualiza cu date reale
              borderColor: "#3B82F6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              fill: true,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                color: textColor,
                font: {
                  family: "Manrope, system-ui, sans-serif",
                },
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
              backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: gridColor,
              borderWidth: 1,
            },
          },
          scales: {
            x: {
              grid: {
                color: gridColor,
              },
              ticks: {
                color: textColor,
                font: {
                  family: "Manrope, system-ui, sans-serif",
                },
              },
            },
            y: {
              grid: {
                color: gridColor,
              },
              ticks: {
                color: textColor,
                font: {
                  family: "Manrope, system-ui, sans-serif",
                },
              },
            },
          },
        },
      });
  }



  // Revenue Analysis Chart


  const revenueEl = document.getElementById("revenueChart");
  if (revenueEl) {
    const revenueCtx = revenueEl.getContext("2d");
     revenueChart = new Chart(revenueCtx, {
      type: "bar",
      data: {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        datasets: [
          {
            label: "Insurance",
            data: [1250000, 1350000, 1420000, 1580000],
            backgroundColor: "rgba(79, 70, 229, 0.7)",
            borderColor: "#4F46E5",
            borderWidth: 1,
          },
          {
            label: "Out-of-Pocket",
            data: [450000, 520000, 580000, 620000],
            backgroundColor: "rgba(139, 92, 246, 0.7)",
            borderColor: "#8B5CF6",
            borderWidth: 1,
          },
          {
            label: "Government",
            data: [850000, 920000, 980000, 1050000],
            backgroundColor: "rgba(16, 185, 129, 0.7)",
            borderColor: "#10B981",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: textColor,
              font: {
                family: "Manrope, system-ui, sans-serif",
              },
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function (context) {
                return (
                  context.dataset.label + ": $" + context.raw.toLocaleString()
                );
              },
            },
            backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
              font: {
                family: "Manrope, system-ui, sans-serif",
              },
            },
          },
          y: {
            stacked: true,
            grid: {
              color: gridColor,
            },
            ticks: {
              color: textColor,
              callback: function (value) {
                return "$" + (value / 1000000).toFixed(1) + "M";
              },
              font: {
                family: "Manrope, system-ui, sans-serif",
              },
            },
          },
        },
      },
    });
  }
}

function updateChartsForTheme() {
  const html = document.documentElement;
  const isDarkMode = html.classList.contains("dark");
  const textColor = isDarkMode ? "#E5E7EB" : "#374151";
  const gridColor = isDarkMode
    ? "rgba(75, 85, 99, 0.3)"
    : "rgba(209, 213, 219, 0.8)";

  // Update New Patients Chart
  if (newPatientsChart) {
    newPatientsChart.options.plugins.legend.labels.color = textColor;
    newPatientsChart.options.plugins.tooltip.backgroundColor = isDarkMode
      ? "#1F2937"
      : "#FFFFFF";
    newPatientsChart.options.plugins.tooltip.titleColor = textColor;
    newPatientsChart.options.plugins.tooltip.bodyColor = textColor;
    newPatientsChart.options.plugins.tooltip.borderColor = gridColor;
    newPatientsChart.options.scales.x.grid.color = gridColor;
    newPatientsChart.options.scales.x.ticks.color = textColor;
    newPatientsChart.options.scales.y.grid.color = gridColor;
    newPatientsChart.options.scales.y.ticks.color = textColor;
    newPatientsChart.update();
  }

  // Update Revenue Chart
  revenueChart.options.plugins.legend.labels.color = textColor;
  revenueChart.options.plugins.tooltip.backgroundColor = isDarkMode
    ? "#1F2937"
    : "#FFFFFF";
  revenueChart.options.plugins.tooltip.titleColor = textColor;
  revenueChart.options.plugins.tooltip.bodyColor = textColor;
  revenueChart.options.plugins.tooltip.borderColor = gridColor;
  revenueChart.options.scales.x.grid.color = gridColor;
  revenueChart.options.scales.x.ticks.color = textColor;
  revenueChart.options.scales.y.grid.color = gridColor;
  revenueChart.options.scales.y.ticks.color = textColor;
  revenueChart.update();
}

// Initialize charts when the page loads
document.addEventListener("DOMContentLoaded", function () {
  initCharts();
  
  // Load real data for new patients chart
  loadNewPatientsData();
  
  // Set up automatic refresh every 30 seconds
  setInterval(loadNewPatientsData, 30000);
})

// Load real data for new patients chart
async function loadNewPatientsData() {
  try {
    const response = await fetch('/api/dashboard/stats');
    const stats = await response.json();
    
    if (stats && stats.newPatientsThisMonth !== undefined) {
      updateNewPatientsStatistics(stats.newPatientsThisMonth);
    }
  } catch (error) {
    console.error('Error loading new patients data:', error);
  }
}

// Update new patients chart with real data
function updateNewPatientsChartData(newPatientsThisMonth) {
  if (typeof newPatientsChart !== 'undefined' && newPatientsChart) {
    const currentMonth = new Date().getMonth();
    
    // Update the current month's data
    newPatientsChart.data.datasets[0].data[currentMonth] = newPatientsThisMonth;
    
    // Update chart
    newPatientsChart.update();
    
    console.log(`📊 Updated new patients chart: ${newPatientsThisMonth} patients in current month`);
  }
}

// Global function to update new patients statistics everywhere
function updateNewPatientsStatistics(newPatientsThisMonth) {
  // Update dashboard statistics
  const dashboardNewPatientsEl = document.querySelector('[data-stat="new-patients-this-month"]');
  const dashboardNewPatientsTrendEl = document.querySelector('[data-stat="new-patients-trend"]');
  
  if (dashboardNewPatientsEl) dashboardNewPatientsEl.textContent = newPatientsThisMonth;
  if (dashboardNewPatientsTrendEl) {
    if (newPatientsThisMonth > 0) {
      dashboardNewPatientsTrendEl.textContent = `+${newPatientsThisMonth} pacienți noi adăugați`;
    } else {
      dashboardNewPatientsTrendEl.textContent = 'niciun pacient nou adăugat';
    }
  }
  
  // Update reports statistics
  const reportsNewPatientsEl = document.querySelector('[data-stat="new-patients-this-month"]');
  const reportsNewPatientsTrendEl = document.querySelector('[data-stat="new-patients-trend"]');
  
  if (reportsNewPatientsEl) reportsNewPatientsEl.textContent = newPatientsThisMonth;
  if (reportsNewPatientsTrendEl) {
    if (newPatientsThisMonth > 0) {
      reportsNewPatientsTrendEl.textContent = `+${newPatientsThisMonth} pacienți noi adăugați`;
    } else {
      reportsNewPatientsTrendEl.textContent = 'niciun pacient nou adăugat';
    }
  }
  
  // Update chart
  updateNewPatientsChartData(newPatientsThisMonth);
  
  console.log(`🔄 Updated new patients statistics everywhere: ${newPatientsThisMonth} patients`);
}

function openCreateInvoiceModal() {
  Modal.show("createInvoiceModal");

  // Set default dates
  const today = new Date().toISOString().split("T")[0];
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  document.querySelector('input[name="invoiceDate"]').value = today;
  document.querySelector('input[name="dueDate"]').value = dueDate
    .toISOString()
    .split("T")[0];

  calculateInvoiceTotal();
}

function closeInvoiceDetailsModal() {
  Modal.hide("invoiceDetailsModal");
}

function viewInvoice(invoiceId) {
  Modal.show("invoiceDetailsModal");
  lucide.createIcons();
}

function addInvoiceItem() {
  const itemsList = document.getElementById("invoiceItemsList");
  const newItem = document.createElement("div");
  newItem.className =
    "invoice-item grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800";
  newItem.innerHTML = `
                <div class="md:col-span-5">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-body">Service/Item Description</label>
                    <input type="text" name="itemDescription[]" placeholder="e.g., Blood Test" 
                        class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 
                            focus:ring-2 focus:ring-purple-500 focus:border-transparent font-body focus:outline-none">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-body">Quantity</label>
                    <input type="number" name="itemQuantity[]" value="1" min="1" 
                        class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 
                            focus:ring-2 focus:ring-purple-500 focus:border-transparent font-body focus:outline-none">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-body">Unit Price</label>
                    <input type="number" name="itemPrice[]" step="0.01" placeholder="0.00" 
                        class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 
                            focus:ring-2 focus:ring-purple-500 focus:border-transparent font-body focus:outline-none">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-body">Total</label>
                    <input type="text" readonly 
                        class="item-total w-full px-3 py-2 border border-gray-200 dark:border-gray-700 
                            rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-body focus:outline-none" 
                        value="$0.00">
                </div>
                <div class="md:col-span-1 flex items-end">
                    <button type="button" onclick="removeInvoiceItem(this)" 
                        class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
  itemsList.appendChild(newItem);
  lucide.createIcons();

  // Add event listeners for calculation
  const quantityInput = newItem.querySelector('input[name="itemQuantity[]"]');
  const priceInput = newItem.querySelector('input[name="itemPrice[]"]');

  quantityInput.addEventListener("input", calculateInvoiceTotal);
  priceInput.addEventListener("input", calculateInvoiceTotal);

  // Trigger calculation immediately after adding
  calculateInvoiceTotal();
}

function removeInvoiceItem(button) {
  button.closest(".invoice-item").remove();
  calculateInvoiceTotal();
}

function calculateInvoiceTotal() {
  const items = document.querySelectorAll(".invoice-item");
  let subtotal = 0;

  items.forEach((item) => {
    const quantity =
      parseFloat(item.querySelector('input[name="itemQuantity[]"]').value) || 0;
    const price =
      parseFloat(item.querySelector('input[name="itemPrice[]"]').value) || 0;
    const total = quantity * price;

    item.querySelector(".item-total").value = `$${total.toFixed(2)}`;
    subtotal += total;
  });

  const discountAmount =
    parseFloat(document.getElementById("discountAmount").value) || 0;
  const discountType = document.getElementById("discountType").value;

  let discount = 0;
  if (discountType === "percent") {
    discount = subtotal * (discountAmount / 100);
  } else {
    discount = discountAmount;
  }

  const taxRate = 0.085; // 8.5%
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * taxRate;
  const total = taxableAmount + tax;

  document.getElementById("invoiceSubtotal").textContent = `$${subtotal.toFixed(
    2
  )}`;
  document.getElementById("invoiceTax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("invoiceTotal").textContent = `$${total.toFixed(2)}`;
}
