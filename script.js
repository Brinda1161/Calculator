 document.addEventListener('DOMContentLoaded', function() {
            // DOM elements
            const calculationDisplay = document.querySelector('.calculation');
            const resultDisplay = document.querySelector('.result');
            const buttons = document.querySelectorAll('button');
            const historyPanel = document.querySelector('.history-panel');
            const historyList = document.querySelector('.history-list');
            const historyBtn = document.querySelector('.history-btn');
            const closeHistoryBtn = document.querySelector('.close-history');
            const clearHistoryBtn = document.querySelector('.clear-history');
            
            // Calculator state
            let currentInput = '0';
            let calculation = '';
            let result = null;
            let lastOperator = null;
            let waitingForOperand = false;
            let calculationHistory = [];
            
            // Load history from localStorage
            if (localStorage.getItem('calcHistory')) {
                calculationHistory = JSON.parse(localStorage.getItem('calcHistory'));
                updateHistoryDisplay();
            }
            
            // Format number for display
            function formatDisplay(value) {
                const stringValue = String(value);
                if (stringValue.length > 10) {
                    return parseFloat(value).toExponential(5);
                }
                return stringValue;
            }
            
            // Update display
            function updateDisplay() {
                resultDisplay.textContent = formatDisplay(currentInput);
                calculationDisplay.textContent = calculation;
            }
            
            // Reset calculator
            function resetCalculator() {
                currentInput = '0';
                calculation = '';
                result = null;
                lastOperator = null;
                waitingForOperand = false;
                updateDisplay();
            }
            
            // Calculate result
            function calculate() {
                if (lastOperator === null || waitingForOperand) return;
                
                const inputValue = parseFloat(currentInput);
                
                if (result === null) {
                    result = inputValue;
                } else {
                    switch (lastOperator) {
                        case '+':
                            result += inputValue;
                            break;
                        case '-':
                            result -= inputValue;
                            break;
                        case '×':
                            result *= inputValue;
                            break;
                        case '÷':
                            if (inputValue === 0) {
                                result = 'Error';
                            } else {
                                result /= inputValue;
                            }
                            break;
                        case '%':
                            result %= inputValue;
                            break;
                    }
                }
                
                // Add to history
                if (result !== 'Error') {
                    const historyEntry = {
                        calculation: calculation,
                        result: result
                    };
                    calculationHistory.unshift(historyEntry);
                    if (calculationHistory.length > 10) calculationHistory.pop();
                    localStorage.setItem('calcHistory', JSON.stringify(calculationHistory));
                    updateHistoryDisplay();
                }
                
                currentInput = String(result);
                calculation += ` =`;
                lastOperator = null;
                waitingForOperand = true;
            }
            
            // Input digit
            function inputDigit(digit) {
                if (waitingForOperand) {
                    currentInput = digit;
                    waitingForOperand = false;
                } else {
                    currentInput = currentInput === '0' ? digit : currentInput + digit;
                }
                updateDisplay();
            }
            
            // Input decimal
            function inputDecimal() {
                if (waitingForOperand) {
                    currentInput = '0.';
                    waitingForOperand = false;
                } else if (!currentInput.includes('.')) {
                    currentInput += '.';
                }
                updateDisplay();
            }
            
            // Handle operator
            function handleOperator(nextOperator) {
                const inputValue = parseFloat(currentInput);
                
                if (result === null) {
                    result = inputValue;
                } else if (lastOperator && !waitingForOperand) {
                    calculate();
                    if (result === 'Error') return;
                }
                
                calculation = result + ' ' + nextOperator + ' ';
                lastOperator = nextOperator;
                waitingForOperand = true;
                updateDisplay();
            }
            
            // Toggle sign
            function toggleSign() {
                currentInput = String(-parseFloat(currentInput));
                updateDisplay();
            }
            
            // Calculate percentage
            function calculatePercentage() {
                const inputValue = parseFloat(currentInput);
                currentInput = String(inputValue / 100);
                updateDisplay();
            }
            
            // Backspace
            function backspace() {
                if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
                    currentInput = '0';
                } else {
                    currentInput = currentInput.slice(0, -1);
                }
                updateDisplay();
            }
            
            // Update history display
            function updateHistoryDisplay() {
                historyList.innerHTML = '';
                calculationHistory.forEach(item => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'history-item';
                    historyItem.innerHTML = `
                        <div class="history-calculation">${item.calculation}</div>
                        <div class="history-result">${formatDisplay(item.result)}</div>
                    `;
                    historyList.appendChild(historyItem);
                });
            }
            
            // Event listeners for buttons
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const buttonText = button.textContent;
                    
                    if (button.classList.contains('function')) {
                        switch (buttonText) {
                            case 'C':
                                resetCalculator();
                                break;
                            case '±':
                                toggleSign();
                                break;
                            case '%':
                                calculatePercentage();
                                break;
                            case '⌫':
                                backspace();
                                break;
                        }
                    } else if (button.classList.contains('operator')) {
                        if (currentInput === 'Error') resetCalculator();
                        handleOperator(buttonText);
                    } else if (button.classList.contains('equals')) {
                        if (currentInput === 'Error') resetCalculator();
                        calculate();
                        updateDisplay();
                    } else {
                        if (currentInput === 'Error') resetCalculator();
                        if (buttonText === '.') {
                            inputDecimal();
                        } else {
                            inputDigit(buttonText);
                        }
                    }
                });
            });
            
            // History panel controls
            historyBtn.addEventListener('click', () => {
                historyPanel.classList.add('show');
            });
            
            closeHistoryBtn.addEventListener('click', () => {
                historyPanel.classList.remove('show');
            });
            
            clearHistoryBtn.addEventListener('click', () => {
                calculationHistory = [];
                localStorage.removeItem('calcHistory');
                updateHistoryDisplay();
            });
            
            // Keyboard support
            document.addEventListener('keydown', event => {
                if (event.key >= '0' && event.key <= '9') {
                    inputDigit(event.key);
                } else if (event.key === '.') {
                    inputDecimal();
                } else if (event.key === '+' || event.key === '-' || event.key === '*' || event.key === '/') {
                    let operator;
                    switch (event.key) {
                        case '+': operator = '+'; break;
                        case '-': operator = '-'; break;
                        case '*': operator = '×'; break;
                        case '/': operator = '÷'; break;
                    }
                    handleOperator(operator);
                } else if (event.key === 'Enter' || event.key === '=') {
                    event.preventDefault();
                    calculate();
                    updateDisplay();
                } else if (event.key === 'Escape') {
                    resetCalculator();
                } else if (event.key === 'Backspace') {
                    backspace();
                } else if (event.key === '%') {
                    calculatePercentage();
                }
            });
            
            // Initialize display
            updateDisplay();
        });