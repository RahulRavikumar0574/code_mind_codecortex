// test_repo/main_with_errors.js

var unusedVar = 42    // Fails 'no-unused-vars' and missing semicolon
function myFunc(){
console.log("Hello World") // Improper indentation and missing semicolon
}

myFunc()
