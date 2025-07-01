'use strict';

class Tokenizer {
    constructor(textQueue) {
        this.textQueue = textQueue;
        this.tokenQueue = [];
        this.quoteBlockLevel = 0;
        this.lastestToken;
        this.temporaryCursor = 0;
        this.temporaryInlineMarks = [];
        this.confirmedInlineMarks = [];
        this.temporaryBlockMarks = [];
        this.confirmedBlockMarks = []; 
        this.stackOfAllMark = [];
        this.temporaryBlockStack = [];
        this.tokenizeRules = new TokenizeRules();
        this.BlockLevelRules = this.tokenizeRules.PublicRulesOfBlock
        this.inLineRules = this.tokenizeRules.PublicRulesOfInline
        this.sequenceNumber = 0;
        this.listLevel = 0;
        this.matchKeyWordCheck();
        return this.tokenQueue;
    }

    generateToken({type, state, cursor, value}) {
        this.sequenceNumber++;
        this.lastestToken = {
            type: type,
            state: state,
            cursor: cursor,
            sequenceNumber: this.sequenceNumber,
            value: value,
        }
        return this.lastestToken;
    }

    searchMatchRule (targetRules) {
        for (let rule of targetRules) {
            if (this.textQueue.isMatchTarget(rule.mdKeyWord) && rule.mdKeyWord !== ""){
                return rule;
            }
        }
        const defaultRule = targetRules.find(rule =>(rule.mdKeyWord === ""));
        return defaultRule;
    }


    topPriorityRulesCheck = () => {
        this.tokenizeRules.RuleOfBlockQuote.checkFunction(this)
        if (this.tokenizeRules.RuleOfUnOrderedList.checkFunction(this)) {
            return true;
        }
        return false;
    }

    matchKeyWordCheck() {
        const defaultRule = this.tokenizeRules.defaultRuleOfBlock;
        while (this.textQueue.isReadable()) {
            if (this.topPriorityRulesCheck()) {
                continue;
            }
            const checkStartCursor = this.textQueue.currentCursor;
            const matchRule = this.searchMatchRule(this.BlockLevelRules);
            const checkResult = matchRule.checkFunction(this);
            if (!checkResult) {
                this.textQueue.currentCursor = checkStartCursor;
                defaultRule.checkFunction(this, defaultRule)
            }
        }
       
        this.tokenizeRules.closeAlltemporaryBlocks(this, this.temporaryBlockStack);
        this.tokenQueue.sort((a, b) => {
            if (a.sequenceNumber !== b.sequenceNumber){
                return a.sequenceNumber - b.sequenceNumber;
            }
        });

        this.tokenQueue.sort((a, b) => {
            if (a.sequenceNumber !== b.sequenceNumber){
                return a.sequenceNumber - b.sequenceNumber;
            }
        });

        return;
    }

    searchStack({targetStack, targetMark}) {
        for (let i = targetStack.length - 1; i >= 0; i--) {
            if (targetStack[i].type === targetMark) {
                return i;
            }
        }
        return undefined;
    }    

    tokenizeInLine() {
        this.temporaryInlineMarks = [];
        this.confirmedInlineMarks = [];
        
        const startCursor = this.textQueue.currentCursor;
        while (this.textQueue.isReadable() && !this.textQueue.isMatchTarget("\n")){
            const matchRule = this.searchMatchRule(this.inLineRules);
            if (matchRule) {
                const lastMarkOftemporaryStack = this.temporaryInlineMarks.at(-1);
                if (lastMarkOftemporaryStack) {
                    if (lastMarkOftemporaryStack.type === "escape" && lastMarkOftemporaryStack.nextCursor === this.textQueue.currentCursor) {
                        this.confirmedInlineMarks.push(this.temporaryInlineMarks.pop())
                        this.textQueue.incrementCursor();
                        continue;                    
                    }
                }
                const checkStartCursor = this.textQueue.currentCursor;
                const checkResult = matchRule.checkFunction(this, matchRule)
                if (!checkResult) {
                    this.textQueue.currentCursor = checkStartCursor + 1;
                }
                continue;
            }
            this.textQueue.incrementCursor();
        }

        this.confirmedInlineMarks.sort((a, b) => a.cursor - b.cursor);    

        let i = 0;
        const aiueoInlineStack = []

        while (i < this.confirmedInlineMarks.length) {
            const checkMark = this.confirmedInlineMarks[i];
            if (checkMark.type === "inLineCode" && checkMark.state === "open") {
                aiueoInlineStack.push(checkMark);
                i++;

                i = i + this.confirmedInlineMarks.slice(i).findIndex(mark => mark.type === "inLineCode" && mark.state === "close");
                continue;
            }
            aiueoInlineStack.push(checkMark);
            i++;
        }
        
        const inLineProcessingTarget = this.textQueue.text.slice(startCursor, this.textQueue.currentCursor);
        const targetQueue = new TextQueue(inLineProcessingTarget);
        this.generateInlineToken(aiueoInlineStack, targetQueue, startCursor);
        return;
    }

    
    generateInlineToken = (aiueoInlineStack, targetQueue, startCursor) => {
        let currentCursor = startCursor;
        let textBuffer = "";
        let temporaryCursor = startCursor;
        let i = 0;
        const cursorDifference = startCursor
        while (true) {
            if (!targetQueue.isReadable()) {
                while (i < aiueoInlineStack.length) {
                    this.tokenQueue.push(this.generateToken({
                        type: aiueoInlineStack[i].type,
                        state: aiueoInlineStack[i].state,
                        cursor: aiueoInlineStack[i].cursor,
                        value: ""                      
                    }))
                    i++;
                }
                break;
            }
            if (!aiueoInlineStack[i]) {
                let makeText = targetQueue.text.slice(targetQueue.currentCursor, targetQueue.endOfCursor)
                this.tokenQueue.push(this.generateToken({
                    type: "text",
                    state: "none",
                    cursor: temporaryCursor,
                    value: makeText.join(""),
                }));                
                break;
            }

            if (aiueoInlineStack[i].cursor === currentCursor){
                if (textBuffer) {
                    this.tokenQueue.push(this.generateToken({
                        type: "text",
                        state: "none",
                        cursor: temporaryCursor,
                        value: textBuffer,
                    }));
                } 
                this.tokenQueue.push(this.generateToken({
                    type: aiueoInlineStack[i].type,
                    state: aiueoInlineStack[i].state,
                    cursor: aiueoInlineStack[i].cursor,
                    value: ""                      
                }))
                currentCursor = aiueoInlineStack[i].nextCursor;
                i++;
                textBuffer = "";
                temporaryCursor = currentCursor;
                targetQueue.currentCursor = currentCursor - cursorDifference;
                continue;
            }
            textBuffer += targetQueue.read();
            targetQueue.incrementCursor();
            currentCursor++;
        }
        return true;
    }
}