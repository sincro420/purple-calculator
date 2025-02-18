class Calculator {
    constructor() {
        this.display = document.querySelector('.display');
        this.buttons = document.querySelectorAll('button');
        this.currentInput = '0';
        this.displayString = '0';
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecondOperand = false;
        this.equalsJustPressed = false;
        this.initialize();
    }

    initialize() {
        this.buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.dataset.value;

                if (value === '1/x') {
                    if (this.displayString !== '0') {
                        this.displayString = (1 / parseFloat(this.displayString)).toString();
                    } else {
                        this.displayString = 'Error'; // Or handle division by zero as needed
                    }
                    this.equalsJustPressed = true;
                    document.querySelector('button[data-value="backspace"]').classList.add('disabled');
                    this.display.classList.add('result');
                    this.display.textContent = this.displayString;
                    this.updateDisplay();
                } else if (value === 'clear') {
                    this.equalsJustPressed = false;
                    document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
                    this.display.classList.remove('result');
                    this.handleClear();
                } else {
                    this.handleInput(value);
                }
            });
        });
    }

    handleInput(value) {
        if (value >= '0' && value <= '9' || value === '.') {
            if (this.equalsJustPressed) {
                this.handleClear();
                this.equalsJustPressed = false;
                document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
                this.display.classList.remove('result');
            }
            this.handleNumber(value);
        } else if (['+', '-', '*', '/', '%'].includes(value)) {
            this.equalsJustPressed = false;
            document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
            this.display.classList.remove('result');
            if (value === '%') {
                this.handlePercentage();
            } else {
                this.handleOperator(value);
            }
        } else if (value === '=') {
            this.handleEquals();
        } else if (value === 'clear') {
            this.equalsJustPressed = false;
            document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
            this.display.classList.remove('result');
            this.handleClear();
        } else if (value === 'backspace') {
            if (!this.equalsJustPressed) {
                this.handleBackspace();
            }
        }
    }

    handleNumber(number) {
        if (this.waitingForSecondOperand) {
            if (this.operator === null) {
                this.currentInput = number;
                this.displayString = number;
            } else {
                this.currentInput = number;
                this.displayString += number;
            }
            this.waitingForSecondOperand = false;
        } else {
            if (this.currentInput === '0' && number !== '.') {
                this.currentInput = number;
                this.displayString = number;
            } else {
                if (number === '.' && this.currentInput.includes('.')) return;
                this.currentInput += number;
                this.displayString = this.displayString === '0' ? number : this.displayString + number;
            }
        }
        this.updateDisplay();
    }

    handleOperator(operator) {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.firstOperand === null) {
            this.firstOperand = inputValue;
        } else if (this.operator && !this.waitingForSecondOperand) {
            // Only calculate if we have a second operand
            const result = this.calculate();
            this.firstOperand = result;
            // Don't update currentInput or displayString here
        }
        
        const displayOperator = operator === '*' ? '×' : 
                              operator === '/' ? '÷' : 
                              operator;
        
        this.operator = operator;
        this.displayString += displayOperator;
        this.waitingForSecondOperand = true;
        this.updateDisplay();
    }

    handleEquals() {
        if (this.operator && !this.waitingForSecondOperand) {
            const result = this.calculate();
            this.currentInput = `${result}`;
            this.displayString = this.currentInput;
            this.operator = null;
            this.firstOperand = null;
            this.waitingForSecondOperand = true;
            this.equalsJustPressed = true;
            
            const backspaceButton = document.querySelector('button[data-value="backspace"]');
            backspaceButton.classList.add('disabled');
            
            this.display.classList.add('result');
            
            this.updateDisplay();
        }
    }

    handleClear() {
        this.currentInput = '0';
        this.displayString = '0';
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecondOperand = false;
        this.updateDisplay();
    }

    handleBackspace() {
        if (this.waitingForSecondOperand) {
            // If last character was an operator, remove it and reset operator state
            this.displayString = this.displayString.slice(0, -1);
            this.operator = null;
            this.waitingForSecondOperand = false;
            this.currentInput = this.firstOperand.toString();
            this.updateDisplay();
            return;
        }

        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
            this.displayString = this.displayString.slice(0, -1);
        } else {
            this.currentInput = '0';
            this.displayString = this.displayString.length > 1 ? this.displayString.slice(0, -1) : '0';
        }
        this.updateDisplay();
    }

    handlePercentage() {
        if (this.currentInput === '0' || this.waitingForSecondOperand) return;
        
        const currentValue = parseFloat(this.currentInput);
        let result;
        
        if (this.operator && this.firstOperand !== null) {
            // Calculate percentage of the first operand
            result = (this.firstOperand * currentValue) / 100;
        } else {
            // Simple percentage calculation
            result = currentValue / 100;
        }
        
        this.currentInput = `${result}`;
        this.displayString = `${result}`;
        
        if (this.operator) {
            // If we're in the middle of an operation, show the full expression
            const displayOperator = this.operator === '*' ? '×' : 
                                  this.operator === '/' ? '÷' : 
                                  this.operator;
            this.displayString = this.firstOperand + displayOperator + result;
        }
        
        this.updateDisplay();
    }

    calculate() {
        const secondOperand = parseFloat(this.currentInput);
        
        switch(this.operator) {
            case '+':
                return this.firstOperand + secondOperand;
            case '-':
                return this.firstOperand - secondOperand;
            case '*':
                return this.firstOperand * secondOperand;
            case '/':
                return secondOperand === 0 ? 'Error' : this.firstOperand / secondOperand;
            default:
                return secondOperand;
        }
    }

    updateDisplay() {
        if (this.displayString.length > 10) {
            this.display.style.fontSize = '1.5rem';
        } else {
            this.display.style.fontSize = '2.5rem';
        }
        this.display.textContent = this.displayString;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
    document.querySelector('.expand').addEventListener('click', function() {
        const calculator = document.querySelector('.calculator');
        const buttonsGrid = document.querySelector('.buttons');
        const scientificButtons = document.querySelectorAll('.scientific');
        const isExpanded = this.getAttribute('data-expanded') === 'true';
        
        if (!isExpanded) {
            calculator.classList.add('expanded');
            buttonsGrid.classList.add('expanded');
            scientificButtons.forEach(button => button.classList.remove('hidden'));
            this.setAttribute('data-expanded', 'true');
            
            // Add popup notification
            const popup = document.createElement('div');
            popup.className = 'popup';
            popup.textContent = 'Expanded mode is not functional yet';
            document.body.appendChild(popup);
            
            // Remove popup after 3 seconds
            setTimeout(() => {
                popup.classList.add('fade-out');
                setTimeout(() => popup.remove(), 500);
            }, 3000);
        } else {
            calculator.classList.remove('expanded');
            buttonsGrid.classList.remove('expanded');
            scientificButtons.forEach(button => button.classList.add('hidden'));
            this.setAttribute('data-expanded', 'false');
        }
    });

    document.querySelector('button[data-value="backspace"]').addEventListener('mousedown', function() {
        if (this.classList.contains('disabled')) {
            this.classList.add('animating');
            setTimeout(() => {
                this.classList.remove('animating');
            }, 500);
        }
    });
});
