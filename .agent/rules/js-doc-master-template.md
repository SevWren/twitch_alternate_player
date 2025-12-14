---
trigger: always_on
---

**Mandatory Documentation Standards**

When generating documentation for this codebase, you **MUST** adhere to the following **JSDoc Master Template** rules to ensure compatibility with VS Code's IntelliSense features (hover information, navigation, and type checking).

#### **1. Formatting & Translation**
*   **English Aliases:** All functions, classes, and modules must include a markdown header and an `@alias` tag providing the English translation of the Russian name.
    *   *Format:* `**ENGLISH:** EnglishName(param1, param2)`
*   **Parameter Translation:** In `@param` tags, the Russian parameter name must be followed by its English equivalent in **bold parentheses**.
    *   *Format:* `@param {Type} russianName - (**englishName**) Description`

#### **2. Linking & Navigation**
*   **Symbol Linking:** ALL references to other functions, classes, or variables within descriptions must use the `{@link SymbolName}` syntax. Do not use plain text for code symbols.
*   **Dependency Links:** All `@dependencies` entries must use relative file paths formatted specifically for VS Code navigation: `[`filename:line`](./filename#Lline)`.

#### **3. Type Definitions**
*   **Complex Objects:** Use `@typedef` to define the structure of complex objects (like video segments or configuration objects) *before* the function that uses them.
*   **Strict Typing:** Every `@param` and `@returns` tag must include a specific type `{Type}`. Use `{void}` if a function does not return a value.

#### **4. External References**
*   Use the `@see` tag to link to official documentation (MDN, Chrome Developers) for any browser APIs used (e.g., `localStorage`, `chrome.runtime`, `navigator`).

---

### **Master Template Examples**

**For Functions:**
```javascript
/**
 * **ENGLISH:** `EnglishFunctionName(param1, param2)`
 * 
 * @alias EnglishFunctionName
 * @purpose [High-level summary of WHY this function exists]
 * @description [Detailed explanation of logic, using {@link LinkedSymbol} for references]
 * 
 * @param {Type} russianParam1 - (**englishParam1**) [Description]
 * @param {Type} [russianParam2] - (**englishParam2**) [Optional Description]
 * @returns {Type} [Description]
 * 
 * @example
 * // Example usage
 * RussianFunction(val1, val2);
 * 
 * @dependencies
 * - [`file.js:10`](./file.js#L10)
 */
function RussianFunction(...) { ... }
```

**For Modules (IIFE):**
```javascript
/**
 * **ENGLISH:** `EnglishModuleName` (Module)
 * 
 * @alias EnglishModuleName
 * @purpose [Summary of module responsibility]
 * @description [Detailed explanation of internal state and logic]
 * @exports
 * - {@link ExportedFunction1} (EnglishName1)
 * - {@link ExportedFunction2} (EnglishName2)
 */
const RussianModule = (() => { ... })();
```

**For Classes:**
```javascript
/**
 * **ENGLISH:** `EnglishClassName` (Class)
 * 
 * @alias EnglishClassName
 * @purpose [What this object represents]
 * @description [Lifecycle details]
 */
class RussianClassName { ... }
```