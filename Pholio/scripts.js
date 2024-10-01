document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');

    // Add click event listeners to each menu item
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor click behavior

            // Get the target section id from the data-target attribute
            const targetSectionId = this.getAttribute('data-target');

            // Hide all sections
            contentSections.forEach(section => {
                section.style.display = 'none';
            });

            // Show the target section
            document.getElementById(targetSectionId).style.display = 'block';
        });
    });

    // Rest of your existing JavaScript code...
});

document.addEventListener('DOMContentLoaded', function() {
    const addStockBtn = document.getElementById('addStock');
    const sellStockBtn = document.getElementById('sellStock');
    const shareholderSelect = document.getElementById('shareholderSelect');
    const portfolioBody = document.getElementById('portfolioBody');
    const addStockPopup = document.getElementById('addStockPopup');
    const addShareholderPopup = document.getElementById('addShareholderPopup');
    const confirmPopup = document.getElementById('confirmPopup');
    const newShareholderBtn = document.getElementById('addShareholder');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const cancelStockBtn = document.getElementById('cancelBtn');
    const cancelShareholderBtn = document.getElementById('cancelShareholderBtn');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    const profileIcon=document.getElementById('profileIcon');
    const dropdownBox=document.getElementById('dropdownBox');


    let shareholders = {};
    let currentStock = null;

    // Open Add Stock Popup
    addStockBtn.addEventListener('click', function() {
        if (shareholderSelect.value === "") {
            alert("Please select a shareholder first.");
        } else {
            addStockPopup.style.display = 'flex';
        }
    });

    // Close Popup on clicking the 'x' or Cancel button
    document.querySelectorAll('.popup .close, #cancelBtn, #cancelShareholderBtn, #cancelConfirmBtn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            btn.closest('.popup').style.display = 'none';
        });
    });

    // Handle adding new stock
    document.getElementById('addStockBtn').addEventListener('click', function() {
        const stockName = document.getElementById('stockName').value;
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
        const quantity = parseInt(document.getElementById('quantity').value);

        if (stockName && !isNaN(purchasePrice) && !isNaN(quantity)) {
            currentStock = { stockName, purchasePrice, quantity };
            calculateFees(currentStock);
        }
    });

    // Function to calculate fees and show confirmation popup
    function calculateFees(stock) {
        const totalAmount = stock.purchasePrice * stock.quantity;
        const dpFee = 25;
        const sebonCommission = totalAmount * 0.015 / 100;
        const brokerCommission = calculateBrokerCommission(totalAmount);
        const wacc = (totalAmount + dpFee + sebonCommission + brokerCommission) / stock.quantity;
        const totalCost = wacc * stock.quantity;

        // Update confirmation popup with calculated values
        document.getElementById('confirmTotalAmount').textContent = totalAmount.toFixed(2);
        document.getElementById('confirmSebonCommission').textContent = sebonCommission.toFixed(2);
        document.getElementById('confirmBrokerCommission').textContent = brokerCommission.toFixed(2);
        document.getElementById('confirmDpFee').textContent = dpFee.toFixed(2);
        document.getElementById('confirmWacc').textContent = wacc.toFixed(2);
        document.getElementById('confirmTotalCost').textContent = totalCost.toFixed(2);

        // Show confirmation popup
        confirmPopup.style.display = 'flex';
        addStockPopup.style.display = 'none';
    }

    // Function to calculate broker commission based on the total amount
    function calculateBrokerCommission(totalAmount) {
        if (totalAmount <= 2500) {
            return 10; // Flat Rs 10
        } else if (totalAmount <= 50000) {
            return totalAmount * 0.36 / 100;
        } else if (totalAmount <= 500000) {
            return totalAmount * 0.33 / 100;
        } else if (totalAmount <= 2000000) {
            return totalAmount * 0.31 / 100;
        } else {
            return totalAmount * 0.27 / 100;
        }
    }

    // Confirm stock addition after calculating fees
confirmBtn.addEventListener('click', function() {
    // Check if there is a valid stock to add (to avoid duplicate entries)
    if (currentStock) {
        const shareholderName = shareholderSelect.value;
        const portfolio = shareholders[shareholderName] || { stocks: [] };

        // Add stock with calculated WACC as the purchase price
        const wacc = parseFloat(document.getElementById('confirmWacc').textContent);
        currentStock.purchasePrice = wacc;
        portfolio.stocks.push(currentStock);
        shareholders[shareholderName] = portfolio;

        displayPortfolio(shareholderName);
        
        // Close the confirmation popup
        confirmPopup.style.display = 'none';

        // Reset the form and stock information
        resetStockForm();

        // Clear the current stock to prevent duplicate addition
        currentStock = null; 
    }
});

// Function to reset the stock form and re-enable the confirm button
function resetStockForm() {
    document.getElementById('stockName').value = '';
    document.getElementById('purchasePrice').value = '';
    document.getElementById('quantity').value = '';
}

// Close confirmation popup on any attempt to open it again if still visible
confirmBtn.addEventListener('click', function() {
    confirmPopup.style.display = 'none'; // Close the popup explicitly
});


    // Open Add Shareholder Popup
    newShareholderBtn.addEventListener('click', function() {
        addShareholderPopup.style.display = 'flex';
    });

    // Handle adding new shareholder
    document.getElementById('addShareholderBtn').addEventListener('click', function() {
        const shareholderName = document.getElementById('shareholderName').value.trim();

        if (shareholderName !== "") {
            shareholders[shareholderName] = { stocks: [] };

            const option = document.createElement('option');
            option.value = shareholderName;
            option.text = shareholderName;
            shareholderSelect.add(option);

            addShareholderPopup.style.display = 'none';
        }
    });

    // Display the portfolio when a shareholder is selected
    shareholderSelect.addEventListener('change', function() {
        const shareholderName = this.value;
        if (shareholderName !== "") {
            displayPortfolio(shareholderName);
        }
    });
        // Existing code...
    
        // Function to display portfolio with updated values
        function displayPortfolio(shareholderName) {
            const portfolio = shareholders[shareholderName];
            portfolioBody.innerHTML = "";
    
            let totalMarketValue = 0;
            let totalPurchaseValue = 0;
            let totalProfitLoss = 0;
    
            portfolio.stocks.forEach((stock, index) => {
                const marketValue = stock.ltp ? stock.ltp * stock.quantity : 0;
                const purchaseValue = stock.purchasePrice * stock.quantity;
                const profitLoss = marketValue - purchaseValue;
    
                totalMarketValue += marketValue;
                totalPurchaseValue += purchaseValue;
                totalProfitLoss += profitLoss;
    
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${stock.stockName}</td>
                    <td>${stock.purchasePrice.toFixed(2)}</td>
                    <td>${stock.quantity}</td>
                    <td>${purchaseValue.toFixed(2)}</td>
                    <td><input type="number" step="0.01" value="${stock.ltp || ''}" class="ltp-input" data-index="${index}"></td>
                    <td class="market-value">${marketValue.toFixed(2)}</td>
                    <td class="profit-loss">${profitLoss.toFixed(2)}</td>
                    <td>
                        <button class="edit-stock" data-index="${index}">Edit</button>
                        <button class="remove-stock" data-index="${index}">Remove</button>
                    </td>
                `;
                portfolioBody.appendChild(tr);
            });
    
            // Update dashboard values
            updateDashboardValues(totalMarketValue, totalPurchaseValue, totalProfitLoss);
            
            // Event listeners for LTP input, Edit and Remove buttons
            document.querySelectorAll('.ltp-input').forEach(input => {
                input.addEventListener('input', function() {
                    updateStockValues(shareholderName, this.dataset.index, parseFloat(this.value));
                });
            });
    
            document.querySelectorAll('.edit-stock').forEach(button => {
                button.addEventListener('click', function() {
                    editStock(shareholderName, this.dataset.index);
                });
            });
    
            document.querySelectorAll('.remove-stock').forEach(button => {
                button.addEventListener('click', function() {
                    removeStock(shareholderName, this.dataset.index);
                });
            });
        }
    
        // Function to update dashboard values
        function updateDashboardValues(totalMarketValue, totalPurchaseValue, totalProfitLoss) {
            document.getElementById('marketValue').textContent = `$${totalMarketValue.toFixed(2)}`;
            document.getElementById('currentInvestment').textContent = `$${totalPurchaseValue.toFixed(2)}`;
            document.getElementById('investmentReturn').textContent = `$${totalProfitLoss.toFixed(2)}`;
            document.getElementById('dailyGains').textContent = `$${totalProfitLoss.toFixed(2)}`; // Assuming daily gains is the same as profit/loss for now
        }
    
        // Existing updateStockValues, editStock, removeStock, etc...
    
        // Function to update stock values based on LTP
        function updateStockValues(shareholderName, stockIndex, ltp) {
            const stock = shareholders[shareholderName].stocks[stockIndex];
            stock.ltp = ltp;
            stock.marketValue = stock.quantity * ltp;
            stock.profitLoss = stock.marketValue - (stock.purchasePrice * stock.quantity);
            displayPortfolio(shareholderName);
        }
        // Open Sell Stock Popup
    sellStockBtn.addEventListener('click', function() {
        if (stock.stockname === "") {
            alert("Please add a stock first.");
        } else {
            sellStockPopup.style.display = 'flex';
        }
    });
    
        // Existing code...
    
    



    // Sidebar Toggle
    sidebarToggle.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('collapsed');
    });

    // Theme Toggle
    document.getElementById('themeToggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });
    //dropdown
    profileIcon.addEventListener('mouseenter', () => {
        dropdownBox.classList.add('show-dropdown');
    });
    
    profileIcon.addEventListener('mouseleave', () => {
        setTimeout(() => {
            dropdownBox.classList.remove('show-dropdown');
        }, 300);  // Slight delay before hiding for smooth experience
    });
    
    dropdownBox.addEventListener('mouseenter', () => {
        dropdownBox.classList.add('show-dropdown');
    });
    
    dropdownBox.addEventListener('mouseleave', () => {
        dropdownBox.classList.remove('show-dropdown');
    });
});
