document.addEventListener('DOMContentLoaded', function() {
    // Menu functionality
    const menuItems = document.querySelectorAll('.menu-item');
    const contentSections = document.querySelectorAll('.content-section');

    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSectionId = this.getAttribute('data-target');
            contentSections.forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(targetSectionId).style.display = 'block';
        });
    });

    // Variables
    const addStockBtn = document.getElementById('addStock');
    const shareholderSelect = document.getElementById('shareholderSelect');
    const portfolioBody = document.getElementById('portfolioBody');
    const addStockPopup = document.getElementById('addStockPopup');
    const addShareholderPopup = document.getElementById('addShareholderPopup');
    const confirmPopup = document.getElementById('confirmPopup');
    const newShareholderBtn = document.getElementById('addShareholder');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const confirmBtn = document.getElementById('confirmBtn');
    const shareholders={};

    
    let currentStock = null;

    // Popup handling for adding stock
    addStockBtn.addEventListener('click', function() {
        if (shareholderSelect.value === "") {
            alert("Please select a shareholder first.");
        } else {
            addStockPopup.style.display = 'flex';
        }
    });

    // Close Popups
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
    // Display portfolio
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

        updateDashboardValues(totalMarketValue, totalPurchaseValue, totalProfitLoss);
        
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
        document.getElementById('dailyGain').textContent = `$${(totalProfitLoss).toFixed(2)}%`;
    }

    // Function to dynamically update stock values when LTP is entered
    function updateStockValues(shareholderName, stockIndex, ltp) {
        const portfolio = shareholders[shareholderName];
        const stock = portfolio.stocks[stockIndex];

        if (ltp && ltp > 0) {
            stock.ltp = ltp;

            const marketValue = ltp * stock.quantity;
            const purchaseValue = stock.purchasePrice * stock.quantity;
            const profitLoss = marketValue - purchaseValue;
            

            // Update the row values in the table
            const row = portfolioBody.querySelectorAll('tr')[stockIndex];
            row.querySelector('.market-value').textContent = marketValue.toFixed(2);
            row.querySelector('.profit-loss').textContent = profitLoss.toFixed(2);

            // Recalculate the dashboard totals
            let totalMarketValue = 0;
            let totalPurchaseValue = 0;
            let totalProfitLoss = 0;

            portfolio.stocks.forEach(stock => {
                const marketValue = stock.ltp ? stock.ltp * stock.quantity : 0;
                const purchaseValue = stock.purchasePrice * stock.quantity;
                totalMarketValue += marketValue;
                totalPurchaseValue += purchaseValue;
                totalProfitLoss += (marketValue - purchaseValue);
            });

            updateDashboardValues(totalMarketValue, totalPurchaseValue, totalProfitLoss);
        }
    }

    // Function to handle LTP input changes in real-time
    function handleLtpInput(shareholderName, stockIndex) {
        const input = document.querySelector(`.ltp-input[data-stock-index="${stockIndex}"]`);
        
        // Add event listener for dynamic updates
        input.addEventListener('input', function () {
            const ltp = parseFloat(input.value);
            if (!isNaN(ltp)) {
                updateStockValues(shareholderName, stockIndex, ltp);
            }
        });
    }
    // Function to display portfolio for a shareholder
function displayPortfolio(shareholderName) {
    const portfolio = shareholders[shareholderName];
    portfolioBody.innerHTML = ''; // Clear the existing table rows

    portfolio.stocks.forEach((stock, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index+1}</td>
            <td>${stock.stockName}</td>
            <td>${stock.purchasePrice}</td>
            <td>${stock.quantity}</td>
            <td>${stock.purchaseValue=stock.quantity*stock.purchasePrice}</td>
            <td><input class="ltp-input" data-stock-index="${index}" type="number" step="0.01" placeholder="Enter LTP"></td>
            <td class="market-value">${stock.ltp ? (stock.ltp * stock.quantity).toFixed(2) : '0.00'}</td>
            <td class="profit-loss">${stock.ltp ? ((stock.ltp * stock.quantity) - (stock.purchasePrice * stock.quantity)).toFixed(2) : '0.00'}</td>
            <td>
                <button onclick="editStock('${shareholderName}', ${index})">Edit</button>
                <button onclick="removeStock('${shareholderName}', ${index})">Remove</button>
            </td>
        `;
        portfolioBody.appendChild(row);

        // Add real-time LTP update event listener
        handleLtpInput(shareholderName, index);
    });
}
    function editStock(shareholderName, stockIndex) {
        const stock = shareholders[shareholderName].stocks[stockIndex];
        document.getElementById('stockName').value = stock.stockName;
        document.getElementById('purchasePrice').value = stock.purchasePrice;
        document.getElementById('quantity').value = stock.quantity;
        currentStock = stock; 
        addStockPopup.style.display = 'flex';
    }

    // Remove stock
    function removeStock(shareholderName, stockIndex) {
        shareholders[shareholderName].stocks.splice(stockIndex, 1);
        displayPortfolio(shareholderName);
    }

    // Add Shareholder Popup
    newShareholderBtn.addEventListener('click', function() {
        addShareholderPopup.style.display = 'flex';
    });

    // Add Shareholder
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

    // Sidebar Toggle
    sidebarToggle.addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('collapsed');
    });

    // Theme Toggle
    document.getElementById('themeToggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
    });

});

    