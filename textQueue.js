'use strict';
class TextQueue {
    constructor(inputText){
        this.text = Array.from(inputText);
        this.currentCursor = 0;
        this.endOfCursor = this.text.length;
        this.temporaryCursor = 0;
     }

    getRange(start, end) {
       return this.text.slice(start, end + 1);
    }
    isMatchTarget(targetChar, relative=0) {
        const start = this.currentCursor + relative
        const end = start + targetChar.length; 
        if (this.text.slice(start, end).join("") === targetChar) {
            return true;
        }
        return false;
    }
    isReadable(relative=0) {
        const readCursor = this.#calcReadCursor(relative);
        if (0 <= readCursor && readCursor < this.endOfCursor) {
            return true; 
        }
        return false;
    }
    read(relative=0) {
        const readCursor = this.#calcReadCursor(relative);
        if (this.isReadable()) {
            return this.text[readCursor]; 
        }
        return "OutOfQueue";
    }
    readAhead(relative) {
        if (this.isReadable(relative)) {
            const readCursor = this.#calcReadCursor(relative)
            return this.text[readCursor]; 
        }
        return "OutOfQueue";        
    }
    readBhind(relative) {
        if (this.isReadable(relative)) {
            const readCursor = this.#calcReadCursor(-(relative))
            return this.text[readCursor]; 
        }
        return "OutOfQueue";            
    }
    #calcReadCursor(relative){
        return this.currentCursor + relative;
    }
    incrementCursor (i=1) { 
        if (typeof i !== 'number' || i <= 0) {
            throw new Error("i must be a positive number");
        }
        this.currentCursor += i;
    }
    decrementCursor (i=1) { 
        if (typeof i !== 'number' || i <= 0) {
            throw new Error("i must be a positive number");
        }
        this.currentCursor -= i;
    }
}
