class Calculator {
    // Initialize calculator state and UI elements
    constructor() {
        this.display = document.querySelector('.display');
        this.buttons = document.querySelectorAll('button');
        this.currentInput = '0';
        this.displayString = '0';
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecondOperand = false;
        this.equalsJustPressed = false;
        this.parenthesesCount = 0;
        this.initialize();
    }

    initialize() {
        this.buttons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('disabled')) return;
                
                const value = button.dataset.value;

                // Handle inverse (1/x) operation
                if (value === '1/x') {
                    if (this.currentInput === 'Error') {
                        return;
                    }
                    
                    let currentValue;
                    if (this.currentInput === 'π') {
                        currentValue = Math.PI;
                    } else if (this.currentInput === 'e') {
                        currentValue = Math.E;
                    } else {
                        currentValue = parseFloat(this.currentInput);
                    }
                    
                    if (currentValue === 0) {
                        this.displayString = 'Error';
                        this.currentInput = 'Error';
                        this.display.textContent = this.displayString;
                        return;
                    }
                    
                    if (this.displayString !== '0') {
                        let displayValue = this.displayString;
                        if (this.operator && this.firstOperand !== null && this.waitingForSecondOperand === false) {
                            let currentValue;
                            
                            if (this.currentInput === 'π') {
                                currentValue = Math.PI;
                            } else if (this.currentInput === 'e') {
                                currentValue = Math.E;
                            } else {
                                currentValue = parseFloat(this.currentInput);
                            }
                            
                            if (currentValue !== 0) {
                                let inverseValue = 1 / currentValue;
                                if (Math.abs(inverseValue) < 0.000001) {
                                    inverseValue = inverseValue.toExponential(8);
                                } else {
                                    inverseValue = inverseValue.toFixed(8).replace(/\.?0+$/, '');
                                }
                                const startIdx = this.displayString.length - this.currentInput.length;
                                displayValue = this.displayString.substring(0, startIdx) + inverseValue;
                                this.currentInput = inverseValue;
                                this.displayString = displayValue;
                            } else {
                                this.displayString = 'Error';
                                this.currentInput = 'Error';
                            }
                        } else {
                            let valueToInvert;
                            
                            if (displayValue === 'π') {
                                valueToInvert = Math.PI;
                            } else if (displayValue === 'e') {
                                valueToInvert = Math.E;
                            } else {
                                valueToInvert = parseFloat(displayValue);
                            }
                            
                            let inverseValue = 1 / valueToInvert;
                            if (Math.abs(inverseValue) < 0.000001) {
                                displayValue = inverseValue.toExponential(8);
                            } else {
                                displayValue = inverseValue.toFixed(8).replace(/\.?0+$/, '');
                            }
                            this.currentInput = displayValue;
                            this.displayString = displayValue;
                            this.equalsJustPressed = true;
                            document.querySelector('button[data-value="backspace"]').classList.add('disabled');
                            this.display.classList.add('result');
                        }
                        this.display.textContent = this.displayString;
                        this.updateDisplay();
                    } else {
                        this.displayString = 'Error';
                        this.display.textContent = this.displayString;
                    }
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
    // Main input handler that routes different calculator inputs to appropriate handlers
    handleInput(value) {
        if (this.currentInput === 'Error' && value !== '!' && value !== '1/x'){
            this.handleClear();
        }

        if (value === '(' || value === ')') {
            this.handleParentheses(value);
        } else if (value >= '0' && value <= '9' || value === '.') {
            if (this.equalsJustPressed) {
                this.handleClear();
                this.equalsJustPressed = false;
                document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
                this.display.classList.remove('result');
            }
            this.handleNumber(value);
        } else if (['+', '-', '*', '/', '%', '**'].includes(value)) {
            this.equalsJustPressed = false;
            document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
            this.display.classList.remove('result');
            if (value === '%') {
                this.handlePercentage();
            } else {
                this.handleOperator(value);
            }
        } else if (value === 'log' || value === 'ln') {
            this.handleLogarithm(value);
        } else if (value === 'sqrt') {
            this.handleSquareRoot();
        } else if (value === '!') {
            this.handleFactorial();
        } else if (value === 'sin' || value === 'cos' || value === 'tan') {
            this.handleTrigonometry(value);
        } else if (value === 'pi' || value === 'e') {
            this.handleConstant(value);
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

    // Handles factorial operations for both UI updates and actual calculations
    handleFactorial(n) {
        if (arguments.length === 0) {
            if (this.currentInput === 'Error') {
                return;
            }
            
            const lastChar = this.displayString.slice(-1);
            if (isNaN(parseInt(lastChar)) && lastChar !== 'π' && lastChar !== 'e' && lastChar !== ')') {
                this.displayString = 'Error';
                this.currentInput = 'Error';
                this.updateDisplay();
                return;
            }
            
            if (this.equalsJustPressed) {
                this.equalsJustPressed = false;
                document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
                this.display.classList.remove('result');
                this.displayString += '!';
                this.currentInput += '!';
            } else {
                this.displayString += '!';
                this.currentInput += '!';
            }
            
            this.updateDisplay();
            
            const factorialButton = document.querySelector('button[data-value="!"]');
            factorialButton.classList.add('disabled');
            return;
        }
        
        if (n < 0) throw new Error('Cannot calculate factorial of negative numbers');
        if (n > 170) return Infinity;
        if (n === 0 || n === 1) return 1;
        
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    // Evaluates complex mathematical expressions with support for special functions
    evaluateExpression(expression) {
        // Check for invalid factorial patterns
        const invalidFactorialPattern = /[+\-×÷\^]\s*!/;
        if (invalidFactorialPattern.test(expression) || expression.startsWith('!')) {
            throw new Error('Invalid factorial operation');
        }
        
        // Validate factorial prefix
        const invalidFactorialPrefixPattern = /([^0-9)])\!/g;
        if (invalidFactorialPrefixPattern.test(expression)) {
            throw new Error('Invalid factorial operation');
        }
        
        // Handle factorial for regular numbers
        expression = expression.replace(/(\d+)!/g, (match, number) => {
            return this.handleFactorial(parseInt(number));
        });
        
        // Handle factorial for π
        expression = expression.replace(/π!/g, () => {
            return this.handleFactorial(Math.floor(Math.PI));
        });
        
        // Handle factorial for e
        expression = expression.replace(/e!/g, () => {
            return this.handleFactorial(Math.floor(Math.E));
        });
        
        // Handle factorial for decimal numbers
        expression = expression.replace(/(\d+\.\d+)!/g, (match, number) => {
            return this.handleFactorial(Math.floor(parseFloat(number)));
        });
        
        // Handle factorial with multiplication
        expression = expression.replace(/(\d+)×(\d+)!/g, (match, num1, num2) => {
            return num1 * this.handleFactorial(parseInt(num2));
        });
        
        // Handle factorial for parenthesized expressions
        expression = expression.replace(/\(([^)]+)\)!/g, (match, subExpr) => {
            try {
                const subResult = this.evaluateExpression(subExpr);
                return this.handleFactorial(Math.floor(subResult));
            } catch (error) {
                throw new Error('Invalid factorial expression');
            }
        });
        
        // Handle square root operations
        expression = expression.replace(/√\(([^)]+)\)/g, (match, number) => {
            const value = parseFloat(number);
            if (value < 0) throw new Error('Invalid square root input');
            return Math.sqrt(value);
        });
        
        // Handle base-10 logarithm
        expression = expression.replace(/log\(([^)]+)\)/g, (match, number) => {
            const value = parseFloat(number);
            if (value <= 0) throw new Error('Invalid logarithm input');
            return Math.log10(value);
        });
        
        // Handle natural logarithm
        expression = expression.replace(/ln\(([^)]+)\)/g, (match, number) => {
            const value = parseFloat(number);
            if (value <= 0) throw new Error('Invalid logarithm input');
            return Math.log(value);
        });
        
        // Replace mathematical symbols with JavaScript operators
        expression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**')
            .replace(/π/g, 'Math.PI')
            .replace(/e(?![0-9a-z(])/g, 'Math.E');
        
        // Evaluate the final expression
        try {
            const result = new Function('Math', 'return ' + expression)(Math);
            return parseFloat(result.toFixed(8));
        } catch (error) {
            throw new Error('Invalid Expression');
        }
    }
    
    // Handles numeric input including decimal points
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
            const isInsideFunction = this.displayString.endsWith('(');
            
            if (this.currentInput === '0' && number !== '.') {
                this.currentInput = number;
                if (!isInsideFunction) {
                    this.displayString = number;
                } else {
                    this.displayString += number;
                }
            } else {
                if (number === '.' && this.currentInput.includes('.')) return;
                this.currentInput += number;
                if (this.displayString === '0' && !isInsideFunction) {
                    this.displayString = number;
                } else {
                    this.displayString += number;
                }
            }
        }
        this.updateDisplay();

        const inverseButton = document.querySelector('button[data-value="1/x"]');
        inverseButton.classList.remove('disabled');
        
        const factorialButton = document.querySelector('button[data-value="!"]');
        factorialButton.classList.remove('disabled');
    }

    // Processes mathematical operators (+, -, *, /, **, %)
    handleOperator(operator) {
        const inputValue = parseFloat(this.currentInput);
        
        if (this.firstOperand === null) {
            this.firstOperand = inputValue;
        } else if (this.operator && !this.waitingForSecondOperand) {
            const result = this.calculate();
            this.firstOperand = result;
        }
        
        const displayOperator = operator === '*' ? '×' : 
                              operator === '/' ? '÷' : 
                              operator === '**' ? '^' :
                              operator;
        
        const lastChar = this.displayString.slice(-1);
        const operators = ['×', '÷', '+', '-', '%', '^'];
        if (operators.includes(lastChar)) {
            this.displayString = this.displayString.slice(0, -1) + displayOperator;
        } else {
            this.displayString += displayOperator;
        }
        
        this.operator = operator;
        this.waitingForSecondOperand = true;
        this.updateDisplay();
    
        const inverseButton = document.querySelector('button[data-value="1/x"]');
        inverseButton.classList.add('disabled');
        
        const factorialButton = document.querySelector('button[data-value="!"]');
        factorialButton.classList.add('disabled');
    }

    // Manages opening and closing parentheses for grouping expressions
    handleParentheses(value) {
        if (value === '(') {
            if (this.equalsJustPressed) {
                this.handleClear();
                this.equalsJustPressed = false;
            }
            
            if (this.displayString !== '0' && 
                (!isNaN(this.displayString.slice(-1)) || this.displayString.slice(-1) === ')')) {
                this.handleOperator('*');
            } else if (this.displayString === '0') {
                this.displayString = '(';
                this.currentInput = '0';
                this.parenthesesCount++;
                this.updateDisplay();
                
                const factorialButton = document.querySelector('button[data-value="!"]');
                factorialButton.classList.add('disabled');
                return;
            }
            
            this.parenthesesCount++;
            this.displayString += '(';
            this.currentInput = '0';
            this.updateDisplay();
            
            const factorialButton = document.querySelector('button[data-value="!"]');
            factorialButton.classList.add('disabled');
        } else if (value === ')') {
            if (this.parenthesesCount > 0 && !this.waitingForSecondOperand) {
                this.parenthesesCount--;
                this.displayString += ')';
                this.updateDisplay();
                
                const factorialButton = document.querySelector('button[data-value="!"]');
                factorialButton.classList.remove('disabled');
            } else if (this.displayString.includes('log(') || this.displayString.includes('ln(') || this.displayString.includes('√(')) {
                if (!this.displayString.endsWith(')')) {
                    this.displayString += ')';
                    this.updateDisplay();
                    
                    const factorialButton = document.querySelector('button[data-value="!"]');
                    factorialButton.classList.remove('disabled');
                }
            }
        }
    }
    
    // Resets calculator to initial state
    handleClear() {
        this.currentInput = '0';
        this.displayString = '0';
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecondOperand = false;
        this.parenthesesCount = 0;
        this.updateDisplay();
    }

    // Evaluates the current expression and displays result
    handleEquals() {
        const hasSpecialFunction = this.displayString.includes('√(') || 
                                  this.displayString.includes('log(') || 
                                  this.displayString.includes('ln(');
        
        const hasFactorial = this.displayString.includes('!');
        
        if (hasFactorial) {
            try {
                let result;
                
                if (this.displayString.includes('×') || 
                    this.displayString.includes('÷') || 
                    this.displayString.includes('+') || 
                    this.displayString.includes('-') || 
                    this.displayString.includes('^')) {
                    
                    result = this.evaluateExpression(this.displayString);
                } else if (this.currentInput.endsWith('!')) {
                    const numberPart = this.currentInput.slice(0, -1);
                    let value;
                    
                    if (numberPart === 'π') {
                        value = Math.PI;
                    } else if (numberPart === 'e') {
                        value = Math.E;
                    } else {
                        value = parseFloat(numberPart);
                    }
                    
                    result = this.handleFactorial(Math.floor(value));
                } else {
                    result = this.evaluateExpression(this.displayString);
                }
                
                this.currentInput = result.toString();
                this.displayString = result.toString();
                this.operator = null;
                this.firstOperand = null;
                this.waitingForSecondOperand = true;
                this.equalsJustPressed = true;
                
                document.querySelector('button[data-value="backspace"]').classList.add('disabled');
                this.display.classList.add('result');
                const factorialButton = document.querySelector('button[data-value="!"]');
                factorialButton.classList.remove('disabled');
                const inverseButton = document.querySelector('button[data-value="1/x"]');
                inverseButton.classList.remove('disabled');
                this.updateDisplay();
                return;
            } catch (error) {
                this.displayString = 'Error';
                this.currentInput = 'Error';
                this.updateDisplay();
            }
        }
        
        if (this.parenthesesCount === 0 && !this.displayString.includes('×') && 
            !this.displayString.includes('÷') && !this.displayString.includes('+') && 
            !this.displayString.includes('-') && !this.displayString.includes('^') && 
            !hasSpecialFunction) {
            if (this.currentInput === 'π' || this.currentInput === 'e') {
                const value = this.currentInput === 'π' ? Math.PI : Math.E;
                this.currentInput = value.toString();
                this.displayString = this.currentInput;
                this.updateDisplay();
            }
            
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
                const factorialButton = document.querySelector('button[data-value="!"]');
                factorialButton.classList.remove('disabled');
                const inverseButton = document.querySelector('button[data-value="1/x"]');
                inverseButton.classList.remove('disabled');
                this.updateDisplay();
            }
        } else {
            try {
                let result = this.evaluateExpression(this.displayString);
                if (result === Infinity || isNaN(result)) {
                    this.displayString = 'Error';
                    this.currentInput = 'Error';
                } else {
                    this.currentInput = result.toString();
                    this.displayString = result.toString();
                }
                this.parenthesesCount = 0;
                this.operator = null;
                this.firstOperand = null;
                this.waitingForSecondOperand = true;
                this.equalsJustPressed = true;
                const backspaceButton = document.querySelector('button[data-value="backspace"]');
                backspaceButton.classList.add('disabled');
                this.display.classList.add('result');
                const factorialButton = document.querySelector('button[data-value="!"]');
                factorialButton.classList.remove('disabled');
                const inverseButton = document.querySelector('button[data-value="1/x"]');
                inverseButton.classList.remove('disabled');
                this.updateDisplay();
            } catch (error) {
                this.displayString = 'Error';
                this.currentInput = 'Error';
                this.updateDisplay();
            }
        }
    }

    // Handles deletion of the last entered character
    handleBackspace() {
        if (this.waitingForSecondOperand) {
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

        const lastChar = this.displayString.slice(-1);
        const operatorMap = {'×': '*', '÷': '/', '+': '+', '-': '-', '%': '%'};
        if (Object.keys(operatorMap).includes(lastChar)) {
            this.operator = operatorMap[lastChar];
            this.waitingForSecondOperand = true;
            this.currentInput = this.firstOperand.toString();
        }
    }
    // Handles percentage calculations
    handlePercentage() {
        if (this.currentInput === '0' || this.waitingForSecondOperand) return;
        
        const currentValue = parseFloat(this.currentInput);
        let result;
        
        if (this.operator && this.firstOperand !== null) {
            result = (this.firstOperand * currentValue) / 100;
        } else {
            result = currentValue / 100;
        }
        
        this.currentInput = `${result}`;
        this.displayString = `${result}`;
        
        if (this.operator) {
            const displayOperator = this.operator === '*' ? '×' : 
                                  this.operator === '/' ? '÷' : 
                                  this.operator;
            this.displayString = this.firstOperand + displayOperator + result;
        }
        
        this.updateDisplay();
    }

    // Handles logarithm operations (log, ln)
    handleLogarithm(type) {
        if (this.equalsJustPressed) {
            this.handleClear();
            this.equalsJustPressed = false;
            document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
            this.display.classList.remove('result');
        }
        
        if (this.currentInput === '0' && this.displayString === '0') {
            this.displayString = type + '(';
        } else {
            const lastChar = this.displayString.slice(-1);
            if (!isNaN(parseInt(lastChar)) || lastChar === ')' || lastChar === 'π' || lastChar === 'e' || lastChar === '!') {
                this.displayString += '×' + type + '(';
            } else {
                this.displayString += type + '(';
            }
        }
        
        this.parenthesesCount++;
        this.currentInput = '0';
        this.waitingForSecondOperand = false;
        this.updateDisplay();
        
        const factorialButton = document.querySelector('button[data-value="!"]');
        factorialButton.classList.add('disabled');
    }

    // Processes square root operations
    handleSquareRoot() {
        if (this.equalsJustPressed) {
            this.handleClear();
            this.equalsJustPressed = false;
            document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
            this.display.classList.remove('result');
        }
        
        if (this.currentInput === '0' && this.displayString === '0') {
            this.displayString = '√(';
        } else {
            const lastChar = this.displayString.slice(-1);
            if (!isNaN(parseInt(lastChar)) || lastChar === ')' || lastChar === 'π' || lastChar === 'e') {
                this.displayString += '×√(';
            } else {
                this.displayString += '√(';
            }
        }
        
        this.parenthesesCount++;
        this.currentInput = '0';
        this.waitingForSecondOperand = false;
        this.updateDisplay();
        
        const factorialButton = document.querySelector('button[data-value="!"]');
        factorialButton.classList.add('disabled');
    }

    // Handles trigonometric calculations (sin, cos, tan)
    handleTrigonometry(type) {
        if (this.equalsJustPressed) {
            this.handleClear();
            this.equalsJustPressed = false;
            document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
            this.display.classList.remove('result');
        }
        
        const value = parseFloat(this.currentInput);
        let result;
        
        const radians = value * (Math.PI / 180);
        
        if (type === 'sin') {
            result = Math.sin(radians);
        } else if (type === 'cos') {
            result = Math.cos(radians);
        } else if (type === 'tan') {
            result = Math.tan(radians);
        }
        
        if (Math.abs(result) < 0.000001) {
            result = result.toExponential(8);
        } else {
            result = result.toFixed(8).replace(/\.?0+$/, '');
        }
        
        this.currentInput = result;
        this.displayString = result;
        this.equalsJustPressed = true;
        document.querySelector('button[data-value="backspace"]').classList.add('disabled');
        this.display.classList.add('result');
        this.updateDisplay();
    }

    // Manages mathematical constants (π, e)
    handleConstant(type) {
        if (this.equalsJustPressed) {
            this.handleClear();
            this.equalsJustPressed = false;
            document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
            this.display.classList.remove('result');
        }
        
        let symbol;
        if (type === 'pi') {
            symbol = 'π';
        } else if (type === 'e') {
            symbol = 'e';
        }
        
        if (this.currentInput === '0' || this.waitingForSecondOperand) {
            this.currentInput = symbol;
            if (this.waitingForSecondOperand) {
                this.displayString += symbol;
                this.waitingForSecondOperand = false;
            } else {
                this.displayString = symbol;
            }
        } else {
            this.handleOperator('*');
            this.currentInput = symbol;
            this.displayString += symbol;
            this.waitingForSecondOperand = false;
        }
        
        this.updateDisplay();
        
        const inverseButton = document.querySelector('button[data-value="1/x"]');
        inverseButton.classList.remove('disabled');
        
        const factorialButton = document.querySelector('button[data-value="!"]');
        factorialButton.classList.remove('disabled');
    }

    // Performs basic arithmetic calculations
    calculate() {
        let secondOperandStr = this.currentInput;
        if (secondOperandStr === 'π') {
            secondOperandStr = Math.PI.toString();
        } else if (secondOperandStr === 'e') {
            secondOperandStr = Math.E.toString();
        }
        
        const secondOperand = parseFloat(secondOperandStr);
        
        switch(this.operator) {
            case '+':
                return this.firstOperand + secondOperand;
            case '-':
                return this.firstOperand - secondOperand;
            case '*':
                return this.firstOperand * secondOperand;
            case '/':
                return secondOperand === 0 ? 'Error' : this.firstOperand / secondOperand;
            case '**':
                return Math.pow(this.firstOperand, secondOperand);
            default:
                return secondOperand;
        }
    }

    // Updates calculator display and adjusts font size
    updateDisplay() {
        if (this.displayString.length > 10) {
            this.display.style.fontSize = '1.5rem';
        } else {
            this.display.style.fontSize = '2.5rem';
        }
        this.display.textContent = this.displayString;
    }
}

// Initialize calculator and setup event listeners
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
            
            const popup = document.createElement('div');
            popup.className = 'popup';
            popup.textContent = 'You are now in Expanded Mode';
            document.body.appendChild(popup);
            
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
