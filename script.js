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
        this.parenthesesCount = 0;  // Add this line
        this.initialize();
    }

    initialize() {
        this.buttons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('disabled')) return;
                
                const value = button.dataset.value;

                if (value === '1/x') {
                    // Check if the current input can have an inverse applied to it
                    if (this.currentInput === 'Error') {
                        return; // Don't apply inverse to an error
                    }
                    
                    // Check if the current value is zero
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
                            // Equation present, inverse only the last number (currentInput)
                            let currentValue;
                            
                            // Handle π and e constants
                            if (this.currentInput === 'π') {
                                currentValue = Math.PI;
                            } else if (this.currentInput === 'e') {
                                currentValue = Math.E;
                            } else {
                                currentValue = parseFloat(this.currentInput);
                            }
                            
                            if (currentValue !== 0) {
                                let inverseValue = 1 / currentValue;
                                // Use scientific notation if the number is very small
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
                            // No equation, inverse the whole display
                            let valueToInvert;
                            
                            // Handle π and e constants
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

    handleInput(value) {
        // Clear error state if present
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
            // Changed '^' to '**' to match the button's data-value
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

    // Add this new method for factorial
    // Combined method for handling factorial UI and calculation
    handleFactorial(n) {
        // If called with no arguments, handle the UI interaction
        if (arguments.length === 0) {
            // Check if the current input can have a factorial applied to it
            if (this.currentInput === 'Error') {
                return; // Don't add factorial to an error
            }
            
            // Check if the current input is a valid number or constant
            const lastChar = this.displayString.slice(-1);
            if (isNaN(parseInt(lastChar)) && lastChar !== 'π' && lastChar !== 'e' && lastChar !== ')') {
                this.displayString = 'Error';
                this.currentInput = 'Error';
                this.updateDisplay();
                return;
            }
            
            if (this.equalsJustPressed) {
                // Don't clear when equals was just pressed, just update the display
                this.equalsJustPressed = false;
                document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
                this.display.classList.remove('result');
                // Add factorial to the current result
                this.displayString += '!';
                this.currentInput += '!';
            } else {
                // Add factorial symbol to display
                this.displayString += '!';
                this.currentInput += '!';
            }
            
            this.updateDisplay();
            
            // Disable the factorial button after use until a new number is entered
            const factorialButton = document.querySelector('button[data-value="!"]');
            factorialButton.classList.add('disabled');
            return;
        }
        
        // Rest of the factorial calculation logic remains the same
        if (n < 0) throw new Error('Cannot calculate factorial of negative numbers');
        if (n > 170) return Infinity; // JavaScript can't handle larger factorials
        if (n === 0 || n === 1) return 1;
        
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    evaluateExpression(expression) {
        // Check for invalid factorial operations
        const invalidFactorialPattern = /[+\-×÷\^]\s*!/;
        if (invalidFactorialPattern.test(expression) || expression.startsWith('!')) {
            throw new Error('Invalid factorial operation');
        }
        
        // Process factorial operations
        expression = expression.replace(/(\d+)!/g, (match, number) => {
            return this.handleFactorial(parseInt(number));
        });
        
        // Handle factorial for constants
        expression = expression.replace(/π!/g, () => {
            return this.handleFactorial(Math.floor(Math.PI));
        });
        
        expression = expression.replace(/e!/g, () => {
            return this.handleFactorial(Math.floor(Math.E));
        });
        
        // Add this new code to handle factorials for expressions with decimal points
        expression = expression.replace(/(\d+\.\d+)!/g, (match, number) => {
            return this.handleFactorial(Math.floor(parseFloat(number)));
        });
        
        // NEW: Handle complex factorial expressions like 6×2!
        expression = expression.replace(/(\d+)×(\d+)!/g, (match, num1, num2) => {
            return num1 * this.handleFactorial(parseInt(num2));
        });
        
        // NEW: Handle other complex factorial expressions
        expression = expression.replace(/\(([^)]+)\)!/g, (match, subExpr) => {
            try {
                // Evaluate the sub-expression inside parentheses first
                const subResult = this.evaluateExpression(subExpr);
                return this.handleFactorial(Math.floor(subResult));
            } catch (error) {
                throw new Error('Invalid factorial expression');
            }
        });
        
        // Process square root functions
        expression = expression.replace(/√\(([^)]+)\)/g, (match, number) => {
            const value = parseFloat(number);
            if (value < 0) throw new Error('Invalid square root input');
            return Math.sqrt(value);
        });
        
        // Process logarithm functions
        expression = expression.replace(/log\(([^)]+)\)/g, (match, number) => {
            const value = parseFloat(number);
            if (value <= 0) throw new Error('Invalid logarithm input');
            return Math.log10(value);
        });
        
        expression = expression.replace(/ln\(([^)]+)\)/g, (match, number) => {
            const value = parseFloat(number);
            if (value <= 0) throw new Error('Invalid logarithm input');
            return Math.log(value);
        });
        
        // Replace display operators and constants with JavaScript operators
        expression = expression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**')
            .replace(/π/g, 'Math.PI')
            .replace(/e(?![0-9a-z(])/g, 'Math.E');
        
        try {
            const result = new Function('Math', 'return ' + expression)(Math);
            return parseFloat(result.toFixed(8));
        } catch (error) {
            throw new Error('Invalid Expression');
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
            // Check if we're inside a function like sqrt, log, ln
            const isInsideFunction = this.displayString.endsWith('(');
            
            if (this.currentInput === '0' && number !== '.') {
                this.currentInput = number;
                // Only replace the display if we're not inside a function
                if (!isInsideFunction) {
                    this.displayString = number;
                } else {
                    this.displayString += number;
                }
            } else {
                if (number === '.' && this.currentInput.includes('.')) return;
                this.currentInput += number;
                // Only replace the display if we're not inside a function and at the start
                if (this.displayString === '0' && !isInsideFunction) {
                    this.displayString = number;
                } else {
                    this.displayString += number;
                }
            }
        }
        this.updateDisplay();

        // Enable 1/x button when number is pressed
        const inverseButton = document.querySelector('button[data-value="1/x"]');
        inverseButton.classList.remove('disabled');
        
        // Enable factorial button when number is pressed
        const factorialButton = document.querySelector('button[data-value="!"]');
        factorialButton.classList.remove('disabled');
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
                              operator === '**' ? '^' :
                              operator;
        
        // Replace operator if last character is already an operator
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
    
        // Disable 1/x button when operator is pressed
        const inverseButton = document.querySelector('button[data-value="1/x"]');
        inverseButton.classList.add('disabled');
        
        // Disable factorial button when operator is pressed
        const factorialButton = document.querySelector('button[data-value="!"]');
        factorialButton.classList.add('disabled');
    }

    // Add this new method
    handleParentheses(value) {
        if (value === '(') {
            if (this.equalsJustPressed) {
                this.handleClear();
                this.equalsJustPressed = false;
            }
            
            // Add multiplication operator only if there's a non-zero number before the opening parenthesis
            if (this.displayString !== '0' && 
                (!isNaN(this.displayString.slice(-1)) || this.displayString.slice(-1) === ')')) {
                this.handleOperator('*');
            } else if (this.displayString === '0') {
                // Replace the initial zero instead of multiplying
                this.displayString = '(';
                this.currentInput = '0';
                this.parenthesesCount++;
                this.updateDisplay();
                
                // Disable factorial button when open parenthesis is pressed
                const factorialButton = document.querySelector('button[data-value="!"]');
                factorialButton.classList.add('disabled');
                return;
            }
            
            this.parenthesesCount++;
            this.displayString += '(';
            this.currentInput = '0';
            this.updateDisplay();
            
            // Disable factorial button when open parenthesis is pressed
            const factorialButton = document.querySelector('button[data-value="!"]');
            factorialButton.classList.add('disabled');
        } else if (value === ')') {
            if (this.parenthesesCount > 0 && !this.waitingForSecondOperand) {
                this.parenthesesCount--;
                this.displayString += ')';
                this.updateDisplay();
                
                // Enable factorial button when closing parenthesis is pressed
                const factorialButton = document.querySelector('button[data-value="!"]');
                factorialButton.classList.remove('disabled');
            } else if (this.displayString.includes('log(') || this.displayString.includes('ln(') || this.displayString.includes('√(')) {
                // Handle closing parenthesis for logarithm and square root functions
                if (!this.displayString.endsWith(')')) {
                    this.displayString += ')';
                    this.updateDisplay();
                    
                    // Enable factorial button when closing parenthesis is pressed
                    const factorialButton = document.querySelector('button[data-value="!"]');
                    factorialButton.classList.remove('disabled');
                }
            }
        }
    }
    
    handleClear() {
        this.currentInput = '0';
        this.displayString = '0';
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecondOperand = false;
        this.parenthesesCount = 0;
        this.updateDisplay();
    }

    handleEquals() {
        // Check if we have any special functions in the expression
        const hasSpecialFunction = this.displayString.includes('√(') || 
                                  this.displayString.includes('log(') || 
                                  this.displayString.includes('ln(');
        
        // Check if we have a factorial in the expression
        const hasFactorial = this.displayString.includes('!');
        
        if (hasFactorial) {
            try {
                // Process the factorial expression
                let result;
                
                // NEW: Handle complex expressions with factorial
                if (this.displayString.includes('×') || 
                    this.displayString.includes('÷') || 
                    this.displayString.includes('+') || 
                    this.displayString.includes('-') || 
                    this.displayString.includes('^')) {
                    
                    // Use evaluateExpression for complex expressions with factorial
                    result = this.evaluateExpression(this.displayString);
                } else if (this.currentInput.endsWith('!')) {
                    // Get the number part without the factorial symbol
                    const numberPart = this.currentInput.slice(0, -1);
                    let value;
                    
                    // Handle constants
                    if (numberPart === 'π') {
                        value = Math.PI;
                    } else if (numberPart === 'e') {
                        value = Math.E;
                    } else {
                        value = parseFloat(numberPart);
                    }
                    
                    // Calculate the factorial
                    result = this.handleFactorial(Math.floor(value));
                } else {
                    // Use evaluateExpression for other expressions with factorial
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
                
                // Enable factorial button after calculation
                const factorialButton = document.querySelector('button[data-value="!"]');
                factorialButton.classList.remove('disabled');
                
                // Enable 1/x button after calculation
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
        
        // Rest of the existing handleEquals method
        if (this.parenthesesCount === 0 && !this.displayString.includes('×') && 
            !this.displayString.includes('÷') && !this.displayString.includes('+') && 
            !this.displayString.includes('-') && !this.displayString.includes('^') && 
            !hasSpecialFunction) {
            // If the current input contains π or e, we need to evaluate it
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
                
                // Enable factorial button after calculation
                const factorialButton = document.querySelector('button[data-value="!"]');
                factorialButton.classList.remove('disabled');
                
                // Enable 1/x button after calculation
                const inverseButton = document.querySelector('button[data-value="1/x"]');
                inverseButton.classList.remove('disabled');
                
                this.updateDisplay();
            }
        } else {
            try {
                // Always use evaluateExpression for complex expressions to ensure BODMAS rules
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
                
                // Enable factorial button after calculation
                const factorialButton = document.querySelector('button[data-value="!"]');
                factorialButton.classList.remove('disabled');
                
                // Enable 1/x button after calculation
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

        // New check for operator at the end after backspace
        const lastChar = this.displayString.slice(-1);
        const operatorMap = {'×': '*', '÷': '/', '+': '+', '-': '-', '%': '%'};
        if (Object.keys(operatorMap).includes(lastChar)) {
            this.operator = operatorMap[lastChar];
            this.waitingForSecondOperand = true;
            this.currentInput = this.firstOperand.toString();
        }
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

 

    // Add the missing handleLogarithm method
    handleLogarithm(type) {
        if (this.equalsJustPressed) {
            this.handleClear();
            this.equalsJustPressed = false;
            document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
            this.display.classList.remove('result');
        }
        
        // Add logarithm symbol to display
        if (this.currentInput === '0' && this.displayString === '0') {
            this.displayString = type + '(';
        } else {
            // Check if the last character is a digit, closing parenthesis, constant, or factorial
            const lastChar = this.displayString.slice(-1);
            if (!isNaN(parseInt(lastChar)) || lastChar === ')' || lastChar === 'π' || lastChar === 'e' || lastChar === '!') {
                // Implicit multiplication - add multiplication operator
                this.displayString += '×' + type + '(';
            } else {
                this.displayString += type + '(';
            }
        }
        
        this.parenthesesCount++; // Increment parentheses count for the opening parenthesis
        this.currentInput = '0'; // Reset current input for what comes inside the log
        this.waitingForSecondOperand = false;
        this.updateDisplay();
        
        // Disable factorial button when logarithm is pressed
        const factorialButton = document.querySelector('button[data-value="!"]');
        factorialButton.classList.add('disabled');
    }

    handleSquareRoot() {
        if (this.equalsJustPressed) {
            this.handleClear();
            this.equalsJustPressed = false;
            document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
            this.display.classList.remove('result');
        }
        
        // Add square root symbol to display instead of calculating immediately
        if (this.currentInput === '0' && this.displayString === '0') {
            this.displayString = '√(';
        } else {
            // If there's already a value, treat it as multiplication: number × √(...)
            // Check if the last character is a digit or closing parenthesis
            const lastChar = this.displayString.slice(-1);
            if (!isNaN(parseInt(lastChar)) || lastChar === ')' || lastChar === 'π' || lastChar === 'e') {
                // Implicit multiplication - add multiplication operator
                this.displayString += '×√(';
            } else {
                this.displayString += '√(';
            }
        }
        
        this.parenthesesCount++; // Increment parentheses count for the opening parenthesis
        this.currentInput = '0'; // Reset current input for what comes inside the sqrt
        this.waitingForSecondOperand = false;
        this.updateDisplay();
        
        // Disable factorial button when square root is pressed
        const factorialButton = document.querySelector('button[data-value="!"]');
        factorialButton.classList.add('disabled');
    }

    handleTrigonometry(type) {
        if (this.equalsJustPressed) {
            this.handleClear();
            this.equalsJustPressed = false;
            document.querySelector('button[data-value="backspace"]').classList.remove('disabled');
            this.display.classList.remove('result');
        }
        
        const value = parseFloat(this.currentInput);
        let result;
        
        // Convert to radians if needed
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
        
        // If we're at the start or after an operator, replace the current input
        if (this.currentInput === '0' || this.waitingForSecondOperand) {
            this.currentInput = symbol;
            if (this.waitingForSecondOperand) {
                this.displayString += symbol;
                this.waitingForSecondOperand = false;
            } else {
                this.displayString = symbol;
            }
        } else {
            // Otherwise, treat as multiplication (e.g., 5π means 5*π)
            this.handleOperator('*');
            this.currentInput = symbol;
            this.displayString += symbol;
            this.waitingForSecondOperand = false;
        }
        
        this.updateDisplay();
        
        // Enable 1/x button when a constant is pressed, just like with numbers
        const inverseButton = document.querySelector('button[data-value="1/x"]');
        inverseButton.classList.remove('disabled');
        
        // Enable factorial button when a constant is pressed
        const factorialButton = document.querySelector('button[data-value="!"]');
        factorialButton.classList.remove('disabled');
    }

    calculate() {
        // Convert π and e to their actual values if they appear in currentInput
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
            popup.textContent = 'You are now in Expanded Mode';
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
