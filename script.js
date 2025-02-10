class Calculator {
    constructor() {
        this.display = document.querySelector('.display');
        this.buttons = document.querySelectorAll('button');
        this.currentInput = '0';
        this.displayString = '0';
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecondOperand = false;
        this.initialize();
    }

    initialize() {
        this.buttons.forEach(button => {
            button.addEventListener('click', () => this.handleInput(button.dataset.value));
        });
    }

    handleInput(value) {
        if (value >= '0' && value <= '9' || value === '.') {
            this.handleNumber(value);
        } else if (['+', '-', '*', '/', '%'].includes(value)) {
            if (value === '%') {
                this.handlePercentage();
            } else {
                this.handleOperator(value);
            }
        } else if (value === '=') {
            this.handleEquals();
        } else if (value === 'clear') {
            this.handleClear();
        } else if (value === 'backspace') {
            this.handleBackspace();
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
        
        // If we're waiting for second operand (i.e., last input was an operator)
        // just replace the last operator in the display
        if (this.waitingForSecondOperand) {
            this.displayString = this.displayString.slice(0, -1);
        }
        
        this.operator = operator;
        const displayOperator = operator === '*' ? '×' : 
                              operator === '/' ? '÷' : 
                              operator;
        
        if (!this.waitingForSecondOperand) {
            this.displayString += displayOperator;
        } else {
            this.displayString += displayOperator;
        }
        
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
        if (this.currentInput === '0') return;
        
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
            const parts = this.displayString.split(this.operator);
            this.displayString = this.firstOperand + this.operator + result;
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
});