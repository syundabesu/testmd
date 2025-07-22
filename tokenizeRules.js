class TokenizeRules {
    constructor () {
        this.RuleOfEscape = {mdKeyWord: "\\", type: "escape", isBlockLevel: true, checkFunction: this.escapeCheck, }
        this.RuleOfParagraph = {mdKeyWord: "", type: "paragraph", isBlockLevel: true, checkFunction: this.paragraphCheck, }
        this.RuleOfBlockQuote = {mdKeyWord: ">", type: "blockQuote", isBlockLevel: false, checkFunction: this.blockQuotecheck, }
        this.RuleOfLineBreakOfInLine = {mdKeyWord: "\n", type: "lineBreakOfInLine", isBlockLevel: false, checkFunction: this.LineBreakOfInLinecheck, }
        this.RuleOfLineBreak = {mdKeyWord: "\n\n", type: "lineBreak", isBlockLevel: true, checkFunction: this.lineBreakCheck}
        this.RuleOfDelete = {mdKeyWord: "~~", type: "delete", isBlockLevel: false, checkFunction: this.deleteCheck, }
        this.RuleOfInLineCode = {mdKeyWord: "`", type: "inLineCode", isBlockLevel: false, checkFunction: this.inLineCodeCheck, }
        this.RuleOfBlockCode = {mdKeyWord: "```", type: "blockCode", isBlockLevel: true, checkFunction: this.blockCodeCheck, }
        this.RuleOfStrong = {mdKeyWord: "**", type: "strong", isBlockLevel: false, checkFunction: this.strongCheck}
        this.RuleOfItalic = {mdKeyWord: "*", type: "italic", isBlockLevel: false, checkFunction: this.italicCheck}
        this.RuleOfStrongAndItalic = {mdKeyWord: "***", type: "strongAndItalic", isBlockLevel: false, checkFunction: this.strongAndItalicCheck}
        this.RuleOfHeadingOne = {mdKeyWord: "# ", type: "heading1", isBlockLevel: true, checkFunction: this.headingOneCheck}
        this.RuleOfHeadingTwo = {mdKeyWord: "## ", type: "heading2", isBlockLevel: true, checkFunction: this.headingTwoCheck}
        this.RuleOfHeadingThree = {mdKeyWord: "### ", type: "heading3", isBlockLevel: true, checkFunction: this.headingThreeCheck}
        this.RuleOfHeadingFour = {mdKeyWord: "#### ", type: "heading4", isBlockLevel: true, checkFunction: this.headingFourCheck}
        this.RuleOfHeadingFive = {mdKeyWord: "##### ", type: "heading5", isBlockLevel: true, checkFunction: this.headingFiveCheck}
        this.RuleOfHeadingSix = {mdKeyWord: "###### ", type: "heading6", isBlockLevel: true, checkFunction: this.headingSixCheck}
        this.RuleOfNoteTips = {mdKeyWord: ":::tips>", type: "noteTips", isBlockLevel: true, checkFunction: this.noteTipsCheck}
        this.RuleOfNoteImportant = {mdKeyWord: ":::important>", type: "noteImportant", isBlockLevel: true, checkFunction: this.noteImportantCheck}
        this.RuleOfNoteCaution = {mdKeyWord: ":::caution>", type: "noteCaution", isBlockLevel: true, checkFunction: this.noteCautionCheck}
        this.RuleOfUnOrderedList = {mdKeyWord: "- ", type: "unOrderedList", isBlockLevel: true, checkFunction: this.unOrderedListCheck, }
        this.RuleOfTabList = {mdKeyWord: "- ", type: "tabList", isBlockLevel: true, checkFunction: this.tabListCheck, }        
        //this.RuleOfUrlLink = {mdKeyWord: "[", type: "urlLink", isBlockLevel: false, checkFunction: this.urlLinkCheck, }
        //this.RuleOfImageLink = {mdKeyWord: "!", type: "imageLink", isBlockLevel: false, checkFunction: this.imageLinkCheck, }
        this.RuleOfaccordion = {mdKeyWord: "+++", type: "accordion", isBlockLevel: true, checkFunction: this.accordionCheck, }
        this.RuleOfConversationOfRightSide = {mdKeyWord: "===>", type: "conversationOfRightSide", isBlockLevel: true, checkFunction: this.conversationOfRightSideCheck, }
        this.RuleOfConversationOfLeftSide = {mdKeyWord: "<===", type: "conversationOfLeftSide", isBlockLevel: true, checkFunction: this.conversationOfLeftSideCheck, }
        this.RuleOfHorizon = {mdKeyWord: "---", type: "horizon", isBlockLevel: true, checkFunction: this.horizonCheck, }
        this.RuleOfListItem = {mdKeyWord: "- ", type: "listItem", isBlockLevel: true, checkFunction: this.listCheck, }

        this.KeyWordOfhyphen = "-";
        this.KeyWordOfLinkTextEnd = "](";
        this.KeyWordOfLinkEnd = ")";

        this.PublicRulesOfBlock = [
            this.RuleOfParagraph,
            this.RuleOfLineBreak,
            this.RuleOfHeadingOne,
            this.RuleOfHeadingTwo,
            this.RuleOfHeadingThree,
            this.RuleOfHeadingFour,
            this.RuleOfHeadingFive,
            this.RuleOfHeadingSix,
            this.RuleOfNoteTips,
            this.RuleOfNoteImportant,
            this.RuleOfNoteCaution,
            this.RuleOfHorizon,
            this.RuleOfaccordion,
            this.RuleOfBlockCode,
            this.RuleOfConversationOfRightSide,
            this.RuleOfConversationOfLeftSide,
        ]
        this.PublicRulesOfInline = [
            this.RuleOfLineBreakOfInLine,
            this.RuleOfDelete,
            this.RuleOfInLineCode,
            this.RuleOfStrong,
            this.RuleOfItalic,
            this.RuleOfStrongAndItalic,
            //this.RuleOfUrlLink,
            //this.RuleOfImageLink,
            this.RuleOfEscape,
        ]
        
        this.PublicRulesOfBlock.sort((a, b) => b.mdKeyWord.length - a.mdKeyWord.length)
        this.PublicRulesOfInline.sort((a, b) => b.mdKeyWord.length - a.mdKeyWord.length)

        this.defaultRuleOfBlock = this.RuleOfParagraph;

        

        this.serialNumber = 0;
    }

    escapeCheck = (self) => {
        self.temporaryInlineMarks.push({type: this.RuleOfEscape.type, state: "none", cursor: self.textQueue.currentCursor, nextCursor: self.textQueue.currentCursor + this.RuleOfEscape.mdKeyWord.length})
        self.textQueue.incrementCursor()
        return true;
    }

    blockQuotecheck = (self) => {
        const currentQuoteBlockLevel = self.quoteBlockLevel;
        self.quoteBlockLevel = 0;
        let checkStartCursor = self.textQueue.currentCursor;
        while (self.textQueue.isMatchTarget(">")) {
            self.quoteBlockLevel++;
            self.textQueue.incrementCursor();
        }
        const quoteBlockLevelChange = self.quoteBlockLevel - currentQuoteBlockLevel;
        if (1 <= quoteBlockLevelChange) {
            this.closeAllUnorderListAndItmeList(self);
            let setCursor = checkStartCursor;
            for (let i=0; i <quoteBlockLevelChange; i++) {
                self.temporaryBlockStack.push(self.generateToken({
                    type: this.RuleOfBlockQuote.type,
                    state: "open",
                    cursor: setCursor++,
                }));
            }
            return true;             
        }
        if (quoteBlockLevelChange <= -1) {
            const closingCount = Math.abs(quoteBlockLevelChange);
            for (let i=0; i < closingCount; i++) {
                this.closeSpecificRangeBlocks(self, self.temporaryBlockStack, this.RuleOfBlockQuote.type);
            }
            self.listLevel = 0;
            return true;
        }
        return true;
    }
    closeAllUnorderListAndItmeList = (self) => {
        while (true) {
            if (0 === self.listLevel) {
                break;
            }
            this.closeSpecificRangeBlocks(self, self.temporaryBlockStack, this.RuleOfListItem.type)
            this.closeSpecificRangeBlocks(self, self.temporaryBlockStack, this.RuleOfUnOrderedList.type)
            self.listLevel--;
        }
        return false;
    }

    unOrderedListCheck = (self) => {
        let currentListLevel = 0;
        let relativecurrentCheckCursor = 0;
        while (self.textQueue.isMatchTarget(this.RuleOfListItem.mdKeyWord, relativecurrentCheckCursor)) {
            currentListLevel++;
            relativecurrentCheckCursor += this.RuleOfUnOrderedList.mdKeyWord.length;
        }
        if (currentListLevel === 0) {
            this.closeAllUnorderListAndItmeList(self);
            return false;
        }
        if (self.listLevel === 0) {
            self.temporaryBlockStack.push(self.generateToken({
                type: this.RuleOfUnOrderedList.type,
                state: "open",
                cursor: self.textQueue.currentCursor,
            }));
        }
        if (0 < self.listLevel) {
            this.closeSpecificRangeBlocks(self, self.temporaryBlockStack, this.RuleOfListItem.type)
        }        
        let openListCount = currentListLevel;
        while (true) {
            self.temporaryBlockStack.push(self.generateToken({
                type: this.RuleOfListItem.type,
                state: "open",
                cursor: self.textQueue.currentCursor,
            }));
            if (openListCount === 1) {
                break;
            } else {
                self.temporaryBlockStack.push(self.generateToken({
                    type: this.RuleOfUnOrderedList.type,
                    state: "open",
                    cursor: self.textQueue.currentCursor,
                }));    
            }
            openListCount--;
        }
        self.textQueue.incrementCursor(relativecurrentCheckCursor);
        self.tokenizeInLine();

        let closeListCount = currentListLevel;
        while (1 < closeListCount) {
            this.closeSpecificRangeBlocks(self, self.temporaryBlockStack, this.RuleOfListItem.type)
            this.closeSpecificRangeBlocks(self, self.temporaryBlockStack, this.RuleOfUnOrderedList.type)
            closeListCount--;
        }
        self.textQueue.incrementCursor();
        self.listLevel = currentListLevel;
        return true;
    }


    blockCodeCheck = (self) => {
        self.textQueue.temporaryCursor = self.textQueue.currentCursor;
        self.textQueue.incrementCursor(this.RuleOfBlockCode.mdKeyWord.length)

        let speakerName = ""
        while (self.textQueue.isReadable() && !self.textQueue.isMatchTarget(this.RuleOfLineBreakOfInLine.mdKeyWord)) {
            speakerName += self.textQueue.read();
            self.textQueue.incrementCursor();
        }
        
        self.tokenQueue.push(self.generateToken({
            type: this.RuleOfBlockCode.type,
            state: "open",
            cursor: self.textQueue.temporaryCursor,
            value: "",
        }));

        self.tokenQueue.push(self.generateToken({
            type: "text",
            state: "none",
            cursor: self.textQueue.temporaryCursor + this.RuleOfBlockCode.mdKeyWord.length,
            value: speakerName,
        })); 
        self.tokenQueue.push(self.generateToken({
            type: "speakerNameEnd",
            state: "none",
            cursor: self.textQueue.temporaryCursor + this.RuleOfBlockCode.mdKeyWord.length + speakerName.length,
            value: "",
        }))

        self.textQueue.incrementCursor();
        const textStartCursor = self.textQueue.currentCursor;
        const keyWordOfBlockCodeClose = this.RuleOfBlockCode.mdKeyWord + this.RuleOfLineBreakOfInLine.mdKeyWord;
        let textInCodeBlock = "";
        
        let isbeggingOfLine = true;
        while (self.textQueue.isReadable()) {
            if (isbeggingOfLine) {
                if (0 < self.quoteBlockLevel) {
                    let nextBlockQuoteLevel = 0;
    
                    while (self.textQueue.isMatchTarget(this.RuleOfBlockQuote.mdKeyWord, nextBlockQuoteLevel)) {
                        nextBlockQuoteLevel++;
                    }
                    if (nextBlockQuoteLevel < self.quoteBlockLevel) {
                        break;
                    }
                    self.textQueue.incrementCursor(nextBlockQuoteLevel);
                    const differenceOfBlockQuoteLevel = nextBlockQuoteLevel - self.quoteBlockLevel;
                    textInCodeBlock += this.RuleOfBlockQuote.mdKeyWord.repeat(differenceOfBlockQuoteLevel)
                    if (self.textQueue.isMatchTarget(keyWordOfBlockCodeClose)){
                        self.textQueue.incrementCursor(keyWordOfBlockCodeClose.length);
                        break;
                    }
                    isbeggingOfLine = false;
                    continue;
                }
                if (self.textQueue.isMatchTarget(keyWordOfBlockCodeClose)){
                    self.textQueue.incrementCursor(keyWordOfBlockCodeClose.length);
                    break;
                }
            }
            isbeggingOfLine = false;
            if (self.textQueue.isMatchTarget(this.RuleOfLineBreakOfInLine.mdKeyWord)) {
                isbeggingOfLine = true;
            }
            textInCodeBlock += self.textQueue.read();
            self.textQueue.incrementCursor();
        }
        self.tokenQueue.push(self.generateToken({
            type: "text",
            state: "none",
            cursor: textStartCursor,
            value: textInCodeBlock,
        }));

        self.tokenQueue.push(self.generateToken({
            type: this.RuleOfBlockCode.type,
            state: "close",
            cursor: self.textQueue.currentCursor,
            value: "",
        }));
        return true;
    }


    blockWithTitleCheck = (self, ruleOfBlockWithTitle) => {
        self.textQueue.temporaryCursor = self.textQueue.currentCursor;
        self.textQueue.incrementCursor(ruleOfBlockWithTitle.mdKeyWord.length)

        let speakerName = ""
        while (self.textQueue.isReadable() && !self.textQueue.isMatchTarget(this.RuleOfLineBreakOfInLine.mdKeyWord)) {
            speakerName += self.textQueue.read();
            self.textQueue.incrementCursor();
        }

        const accordionStart = self.searchStack({targetStack: self.temporaryBlockStack, targetMark: ruleOfBlockWithTitle.type})
        if (accordionStart === undefined) {
            self.textQueue.incrementCursor();            
            self.temporaryBlockStack.push(self.generateToken({
                type: ruleOfBlockWithTitle.type,
                state: "open",
                cursor: self.textQueue.temporaryCursor,
                value: "",
            }))

            self.tokenQueue.push(self.generateToken({
                type: "text",
                state: "none",
                cursor: self.textQueue.temporaryCursor,
                value: speakerName,
            })); 
            self.tokenQueue.push(self.generateToken({
                type: "speakerNameEnd",
                state: "none",
                cursor: self.textQueue.temporaryCursor + ruleOfBlockWithTitle.mdKeyWord.length + speakerName.length + 1,
            }))
            return true;
        }
        
        if (speakerName) {
            return false;
        }
        this.closeSpecificRangeBlocks(self, self.temporaryBlockStack, ruleOfBlockWithTitle.type);
        self.textQueue.incrementCursor();
        return true;
    }
    accordionCheck = (self) => {
        return this.blockWithTitleCheck(self, this.RuleOfaccordion);
    }
    conversationOfRightSideCheck = (self) => {
        return this.blockWithTitleCheck(self, this.RuleOfConversationOfRightSide);
    }
    conversationOfLeftSideCheck = (self) => {
        return this.blockWithTitleCheck(self, this.RuleOfConversationOfLeftSide);
    }
    noteTipsCheck = (self) => {
        return this.blockWithTitleCheck(self, this.RuleOfNoteTips);
    }
    noteImportantCheck = (self) => {
        return this.blockWithTitleCheck(self, this.RuleOfNoteImportant);
    }
    noteCautionCheck = (self) => {
        return this.blockWithTitleCheck(self, this.RuleOfNoteCaution);
    }   



    paragraphCheck = (self) => {
        const latestComfirmedToken = self.tokenQueue.at(-1);
        if (latestComfirmedToken !== undefined
            && latestComfirmedToken.sequenceNumber === self.sequenceNumber
            && latestComfirmedToken.type ===this. RuleOfParagraph.type
            ) {
                self.tokenQueue.pop();
                this.LineBreakOfInLinecheck(self);
        } else {
            self.tokenQueue.push(self.generateToken({
                    type: this.RuleOfParagraph.type,
                    state: "open",
                    cursor: self.textQueue.currentCursor,
                })
            )
        }
        self.tokenizeInLine();
        self.textQueue.temporaryCursor = self.textQueue.currentCursor;
        self.textQueue.incrementCursor();
        self.tokenQueue.push(self.generateToken({
                type: this.RuleOfParagraph.type,
                state: "close",
                cursor: self.textQueue.currentCursor,
            })
        )
        return true;
    }
    horizonCheck = (self) => {
        let horizonStartCursor = self.textQueue.currentCursor;
        self.textQueue.incrementCursor(this.RuleOfHorizon.mdKeyWord.length)
        if (!self.textQueue.isMatchTarget(this.RuleOfLineBreakOfInLine.mdKeyWord)) {
            return false;
        }
        self.tokenQueue.push(self.generateToken({
            type: this.RuleOfHorizon.type,
            state: "open",
            cursor: horizonStartCursor,
            value: "",
        }))
        self.tokenQueue.push(self.generateToken({
            type: this.RuleOfHorizon.type,
            state: "close",
            cursor: self.textQueue.currentCursor,
            value: "",
        }))
        self.textQueue.incrementCursor();
        return true;    
    }
    headingOneCheck = (self) => {
        return this.headingTypeProccessing(self, this.RuleOfHeadingOne);
    }
    headingTwoCheck = (self) => {
        return this.headingTypeProccessing(self, this.RuleOfHeadingTwo);
    }    
    headingThreeCheck = (self) => {
        return this.headingTypeProccessing(self, this.RuleOfHeadingThree);
    }
    headingFourCheck = (self) => {
        return this.headingTypeProccessing(self, this.RuleOfHeadingFour);
    }
    headingFiveCheck = (self) => {
        return this.headingTypeProccessing(self, this.RuleOfHeadingFive);
    }
    headingSixCheck = (self) => {
        return this.headingTypeProccessing(self, this.RuleOfHeadingSix);
    }
    headingTypeProccessing = (self, ruleOfHeading) => {
        self.tokenQueue.push(self.generateToken({
            type: ruleOfHeading.type,
            state: "open",
            cursor: self.textQueue.currentCursor,
            value: "",
        }));    

        self.textQueue.incrementCursor(ruleOfHeading.mdKeyWord.length);
        self.tokenizeInLine()

        self.tokenQueue.push(self.generateToken({
            type: ruleOfHeading.type,
            state: "close",
            cursor: self.textQueue.currentCursor,
            value: "",
        }));    

        self.textQueue.incrementCursor();
        return true;
    }
    lineBreakCheck = (self) => {
        self.tokenQueue.push(self.generateToken({
            type: this.RuleOfLineBreak.type,
            state: "none",
            cursor: self.textQueue.currentCursor,
            value: "",
        }));          
        self.textQueue.incrementCursor();
        return true;
    }



    imageLinkCheck = (self) => {
        let imageLinkStartCursor = self.textQueue.currentCursor;
        self.textQueue.incrementCursor(this.RuleOfImageLink.mdKeyWord.length);
        
        let imageLinkNextCursor = self.textQueue.currentCursor;
        const preparationTokenOfImageLink = {
            type: this.RuleOfImageLink.type,
            state: "open",
            cursor: imageLinkStartCursor,
            nextCursor: imageLinkNextCursor,
            serialNumber: this.serialNumber++,
        }

        if (this.urlLinkCheck(self)) {
            self.confirmedInlineMarks.push(preparationTokenOfImageLink);
            
            let imageLinkEndCursor = self.textQueue.currentCursor;
            self.textQueue.incrementCursor();
            self.confirmedInlineMarks.push({
                type: this.RuleOfImageLink.type,
                state: "close",
                cursor: imageLinkEndCursor,
                nextCursor: self.textQueue.currentCursor,
                serialNumber: this.serialNumber++,
            })
            return true;
        }

        return false;
    }
    urlLinkCheck = (self) => {
        let linkText = ""
        let checkFlag = false;
        let linkStartCursor = self.textQueue.currentCursor;

        self.textQueue.incrementCursor(this.RuleOfUrlLink.mdKeyWord.length);
        let linkTextStartCursor = self.textQueue.currentCursor;

        while (self.textQueue.isReadable() && !self.textQueue.isMatchTarget(this.RuleOfLineBreakOfInLine)){
            if (self.textQueue.isMatchTarget(this.KeyWordOfLinkTextEnd)) {
                checkFlag = true;
                break;
            }
            linkText += self.textQueue.read();
            self.textQueue.incrementCursor();
        }

        if (!(checkFlag && linkText)) {
            return false;
        }        

        let linkMiddleStartCursor = self.textQueue.currentCursor;

        self.textQueue.incrementCursor(this.KeyWordOfLinkTextEnd.length);
        let linkContentsStartCursor = self.textQueue.currentCursor;
        checkFlag = false;
        let linkUrl = "";
        while (self.textQueue.isReadable() && !self.textQueue.isMatchTarget(this.RuleOfLineBreakOfInLine)){
            if (self.textQueue.isMatchTarget(this.KeyWordOfLinkEnd)) {

                checkFlag = true;
                break;
            }
            linkUrl += self.textQueue.read();
            self.textQueue.incrementCursor();
        }

        if (!(checkFlag && linkUrl)) {
            return false;
        }

        let linkContentsEndCursor = self.textQueue.currentCursor;
        self.textQueue.incrementCursor(this.KeyWordOfLinkEnd.length);

        self.confirmedInlineMarks.push({
            type: this.RuleOfUrlLink.type,
            state: "open",
            cursor: linkStartCursor,
            nextCursor: linkTextStartCursor,
            serialNumber: this.serialNumber++,
        })        

    
        self.confirmedInlineMarks.push({
            type: "markOflinkStart",
            state: "none",
            cursor: linkMiddleStartCursor,
            nextCursor: linkContentsStartCursor,
            serialNumber: this.serialNumber++,
        })            

        self.confirmedInlineMarks.push({
            type: this.RuleOfUrlLink.type,
            state: "close",
            cursor: linkContentsEndCursor,
            nextCursor: self.textQueue.currentCursor,
            serialNumber: this.serialNumber++,
        })

        return true;
    
    }
    LineBreakOfInLinecheck = (self) =>  {
        self.tokenQueue.push(self.generateToken({
            type: this.RuleOfLineBreakOfInLine.type,
            state: "none",              
            cursor: self.textQueue.currentCursor,
            value:"",
        }))
        return true;
    }
    deleteCheck = (self) => {
        return this.generalCheckerOfInLine(self, this.RuleOfDelete);
    }
    strongCheck = (self) => {
        return this.generalCheckerOfInLine(self, this.RuleOfStrong);
    }
    italicCheck = (self) => {
        return this.generalCheckerOfInLine(self, this.RuleOfItalic);
    }
    strongAndItalicCheck = (self) => {
        return this.generalCheckerOfInLine(self, this.RuleOfStrongAndItalic);
    }
    inLineCodeCheck = (self) => {
        return this.generalCheckerOfInLine(self, this.RuleOfInLineCode);
    }
    generalCheckerOfInLine = (self, ruleOfInLine) => {
        const mdKeyWord = ruleOfInLine.mdKeyWord;
        const mdType = ruleOfInLine.type;  
        const startCursor = self.searchStack({targetStack: self.temporaryInlineMarks, targetMark: mdType});
        if (startCursor === undefined) {
            if (!(self.textQueue.read(1) === " ") && !(self.textQueue.read(1) === "　")) {
                self.temporaryInlineMarks.push({type: mdType, cursor: self.textQueue.currentCursor})                        
                self.textQueue.incrementCursor(mdKeyWord.length);
                return true;
            }
            return false;
        }
        if (!(self.textQueue.read(-1) === " ") && !(self.textQueue.read(-1) === "　")) {
            self.confirmedInlineMarks.push({type: mdType, state: "open", cursor: self.temporaryInlineMarks[startCursor].cursor, nextCursor: self.temporaryInlineMarks[startCursor].cursor + mdKeyWord.length,});
            self.confirmedInlineMarks.push({type: mdType, state: "close", cursor: self.textQueue.currentCursor, nextCursor: self.textQueue.currentCursor + mdKeyWord.length});     
            
            const countOfDeleteElements = self.temporaryInlineMarks.length - startCursor;
            self.temporaryInlineMarks.splice(startCursor, countOfDeleteElements);
            self.textQueue.incrementCursor(mdKeyWord.length);
            return true;
        }
        if (!(self.textQueue.read(1) === " ") && !(self.textQueue.read(1) === "　")) {
            self.temporaryInlineMarks.push({type: mdType, cursor: self.textQueue.currentCursor})                        
            self.textQueue.incrementCursor(mdKeyWord.length);
            return true;
        }
        return false;
    }


    closeAlltemporaryBlocks = (self, targetStack) => {
        while (targetStack.length) {
            const token = targetStack.pop();
            self.tokenQueue.push(token)
            self.tokenQueue.push(self.generateToken({
                type: token.type,
                state: "close",
                cursor: self.textQueue.currentCursor,
                value: "",
            }))
        }
    }
    closeSpecificRangeBlocks = (self, targetStack, targetType) => {
        const closeTarget = self.searchStack({targetStack: targetStack, targetMark: targetType})
        if (closeTarget === undefined){
            return false;
        } else {
            const deleteStackCount = targetStack.length - closeTarget
            const closeRange = targetStack.splice(- deleteStackCount, deleteStackCount);
            this.closeAlltemporaryBlocks(self, closeRange)
            return true;
        }
    }
}




