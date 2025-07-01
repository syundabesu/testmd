'use strict';

class ConvertHtmlTree {
    constructor(tokenQueue) {
        this.convertRuleOfParagraph = {type: "paragraph", convertFunction: this.ParagraphRule, }        
        this.convertRuleOfHeadingOne = {type: "heading1", convertFunction: this.headingOneRule,}
        this.convertRuleOfHeadingTwo = {type: "heading2", convertFunction: this.headingTwoRule,}
        this.convertRuleOfHeadingThree = {type: "heading3", convertFunction: this.headingThreeRule,}
        this.convertRuleOfHeadingFour = {type: "heading4", convertFunction: this.headingFourRule,}
        this.convertRuleOfHeadingFive = {type: "heading5", convertFunction: this.headingFiveRule,}
        this.convertRuleOfHeadingSix = {type: "heading6", convertFunction: this.headingSixRule,}
        this.convertRuleOfHorizon = {type: "horizon", convertFunction: this.horizonRule,}
        this.convertRuleOfInLineCode = {type: "inLineCode", convertFunction: this.inLineCodeRule,}
        this.convertRuleOfStrongAndItalic = {type: "strongAndItalic", convertFunction: this.strongAndItalicRule,}
        this.convertRuleOfStrong = {type: "strong", convertFunction: this.strongRule,}
        this.convertRuleOfItalic = {type: "italic", convertFunction: this.italicRule,}
        this.convertRuleOfDelete = {type: "delete", convertFunction: this.deletetRule,}
        this.convertRuleOfUnOrderedList = {type: "unOrderedList", convertFunction: this.unOrderedListRule,}
        this.convertRuleOfListItem = {type: "listItem", convertFunction: this.listItemRule,}
        this.convertRuleOfBlockQuote = {type: "blockQuote", convertFunction: this.blockQuoteRule,}
        this.convertRuleOfescape = {type: "escape", convertFunction: this.escapeRule,}
        this.convertRuleOfLineBreakOfInLine = {type: "lineBreakOfInLine", convertFunction: this.lineBreakRule,}
        this.convertRuleOfLineBreak = {type: "lineBreak", convertFunction: this.lineBreakRule,}
        this.convertRuleOfNoteTips = {type: "noteTips", convertFunction: this.noteTipsRule,}
        this.convertRuleOfNoteCaution = {type: "noteCaution", convertFunction: this.noteCautionRule,}
        this.convertRuleOfNoteImportant = {type: "noteImportant", convertFunction: this.noteImportantRule,}
        this.convertRuleOfUrlLink = {type: "urlLink", convertFunction: this.urlLinkRule,}
        this.convertRuleOfImageLink = {type: "imageLink", convertFunction: this.imageLinkRule,}
        this.convertRuleOfAccordion = {type: "accordion", convertFunction: this.accordionRule,}
        this.convertRuleOfBlockCode = {type: "blockCode", convertFunction: this.blockCodeRule,}
        this.convertRuleOfConversationOfRightSide = {type: "conversationOfRightSide", convertFunction: this.conversationOfRightSideRule,}
        this.convertRuleOfConversationOfLeftSide = {type: "conversationOfLeftSide", convertFunction: this.conversationOfLeftSideRule,}
        this.convertRuleOfText = {type: "text", convertFunction: this.textRule,}

        this.convertRules = [
            this.convertRuleOfParagraph,
            this.convertRuleOfescape,
            this.convertRuleOfHeadingOne,
            this.convertRuleOfHeadingTwo,
            this.convertRuleOfHeadingThree,
            this.convertRuleOfHeadingFour,
            this.convertRuleOfHeadingFive,
            this.convertRuleOfHeadingSix,
            this.convertRuleOfHorizon,
            this.convertRuleOfLineBreakOfInLine,
            this.convertRuleOfLineBreak,
            this.convertRuleOfInLineCode,
            this.convertRuleOfStrongAndItalic,
            this.convertRuleOfStrong,
            this.convertRuleOfItalic,
            this.convertRuleOfDelete,
            this.convertRuleOfUnOrderedList,
            this.convertRuleOfListItem,
            this.convertRuleOfNoteTips,
            this.convertRuleOfNoteCaution,
            this.convertRuleOfNoteImportant,
            this.convertRuleOfUrlLink,
            this.convertRuleOfImageLink,
            this.convertRuleOfAccordion,
            this.convertRuleOfBlockCode,
            this.convertRuleOfConversationOfRightSide,
            this.convertRuleOfConversationOfLeftSide,
            this.convertRuleOfBlockQuote,
            this.convertRuleOfText,
        ]

        this.tokenQueue = tokenQueue;
        this.htmlTree = document.createElement("div");
        this.htmlTree.className = "markdown-body";
        this.nodeStack = [{node: this.htmlTree, type: "root", sequenceNumber: 0}];
        this.sequenceNumber = 1;
        this.index = 0;
    }


    tokenToHtml = () => {

        while (this.index < this.tokenQueue.length) {
            if (this.tokenQueue[this.index].state === "close") {
                                
                const currentTokenType = this.tokenQueue[this.index].type;
                const nodeSequenceNumber = this.currentNode.sequenceNumber;
                while (nodeSequenceNumber === this.currentNode.sequenceNumber) {
                    this.childNode = this.nodeStack.pop();
                    this.currentNode.node.append(this.childNode.node) 
                }
                this.index++;
                continue;
            }

            let rule = this.convertRules.find((rule)=> rule.type === this.tokenQueue[this.index].type)
            rule.convertFunction();
            this.index++;
            this.sequenceNumber++;
        }
        return this.htmlTree;
    }
    pushNodeToStack = (element, nodeType) => {
        this.nodeStack.push({node: element, type: nodeType, sequenceNumber: this.sequenceNumber, });
    }
    get currentNode() {
        return this.nodeStack.at(-1);
    }

    blockWithTitleRule = ({nodeType, baseElement, titleElement, contentsElement}) => {
        this.index++;
        let speakerName = this.tokenQueue[this.index].value;
        let cursor = this.tokenQueue[this.index].cursor;
    
        this.index++;
        
        let newConversationBaseElement = document.createElement(baseElement.tag);
        newConversationBaseElement.dataset.pos = cursor;
        newConversationBaseElement.setAttribute(baseElement.attribute.name, baseElement.attribute.value);

        this.pushNodeToStack(newConversationBaseElement, nodeType);
        
        let newSpeakerNameElement = document.createElement(titleElement.tag);
        newSpeakerNameElement.dataset.pos = cursor;
        newSpeakerNameElement.setAttribute(titleElement.attribute.name, titleElement.attribute.value);
        
        newSpeakerNameElement.appendChild(document.createTextNode(speakerName));
        newConversationBaseElement.appendChild(newSpeakerNameElement);
    
        let newConversationContentsElement = document.createElement(contentsElement.tag);
        newConversationContentsElement.dataset.pos = cursor;
        newConversationContentsElement.setAttribute(contentsElement.attribute.name, contentsElement.attribute.value);
        
        this.pushNodeToStack(newConversationContentsElement, nodeType);
    }
    noteTipsRule = () => {
        const nodeType = this.convertRuleOfNoteTips.type;        
        const baseElement = {tag: "div", attribute: {name: "class", value: "note-tips-base"}}
        const titleElement = {tag: "div", attribute: {name: "class", value: "note-tips-title"}}
        const contentsElement = {tag: "div", attribute: {name: "class", value: "markdown-alert markdown-alert-note"}}
        return this.blockWithTitleRule({nodeType: nodeType, baseElement: baseElement, titleElement: titleElement, contentsElement: contentsElement});
    }
    noteCautionRule = () => {
        const nodeType = this.convertRuleOfNoteCaution.type;
        const baseElement = {tag: "div", attribute: {name: "class", value: "note-caution-base"}}
        const titleElement = {tag: "div", attribute: {name: "class", value: "note-caution-title"}}
        const contentsElement = {tag: "div", attribute: {name: "class", value: "markdown-alert markdown-alert-caution"}}
        return this.blockWithTitleRule({nodeType: nodeType, baseElement: baseElement, titleElement: titleElement, contentsElement: contentsElement});
    }
    noteImportantRule = () => {
        const nodeType = this.convertRuleOfNoteImportant.type;
        const baseElement = {tag: "div", attribute: {name: "class", value: "note-important-base"}}
        const titleElement = {tag: "div", attribute: {name: "class", value: "note-important-title"}}
        const contentsElement = {tag: "div", attribute: {name: "class", value: "markdown-alert markdown-alert-important"}}
        return this.blockWithTitleRule({nodeType: nodeType, baseElement: baseElement, titleElement: titleElement, contentsElement: contentsElement});
    }
    conversationOfRightSideRule = () => {
        const nodeType = this.convertRuleOfConversationOfRightSide.type
        const baseElement = {tag: "div", attribute: {name: "class", value: "conversation-of-right-side-base"}}
        const titleElement = {tag: "div", attribute: {name: "class", value: "conversation-of-right-side-title"}}
        const contentsElement = {tag: "div", attribute: {name: "class", value: "markdown-conversation-of-right-side"}}
        return this.blockWithTitleRule({nodeType: nodeType, baseElement: baseElement, titleElement: titleElement, contentsElement: contentsElement});        
    }
    conversationOfLeftSideRule = () => {
        const nodeType = this.convertRuleOfConversationOfLeftSide.type
        const baseElement = {tag: "div", attribute: {name: "class", value: "conversation-of-left-side-base"}}
        const titleElement = {tag: "div", attribute: {name: "class", value: "conversation-of-left-side-title"}}
        const contentsElement = {tag: "div", attribute: {name: "class", value: "markdown-conversation-of-left-side"}}
        return this.blockWithTitleRule({nodeType: nodeType, baseElement: baseElement, titleElement: titleElement, contentsElement: contentsElement});
    }
    blockCodeRule = () => {
        const nodeType = this.convertRuleOfBlockCode.type;
        const baseElement = {tag: "pre", attribute: {name: "class", value: "blockcode-base"}};
        const titleElement = {tag: "div", attribute: {name: "class", value: "blockcode-title"}};
        const contentsElement = {tag: "code", attribute: {name: "class", value: "blockcode-text"}};
        return this.blockWithTitleRule({nodeType: nodeType, baseElement: baseElement, titleElement: titleElement, contentsElement: contentsElement});
    }



    ParagraphRule = () => {
        this.generalConvertRule(["p"])
    }
    headingOneRule = () => {
        this.generalConvertRule(["h1"])
    }
    headingTwoRule = () => {
        this.generalConvertRule(["h2"])
    }
    headingThreeRule = () => {
        this.generalConvertRule(["h3"])
    }
    headingFourRule = () => {
        this.generalConvertRule(["h4"])
    }
    headingFiveRule = () => {
        this.generalConvertRule(["h5"])
    }
    headingSixRule = () => {
        this.generalConvertRule(["h6"])
    }
    horizonRule = () => {
        this.generalConvertRule(["hr"])
    }
    inLineCodeRule = () => {
        this.generalConvertRule(["code"])
    }
    strongAndItalicRule = () => {
        this.generalConvertRule(["em", "strong"])
    }
    strongRule = () => {
        this.generalConvertRule(["strong"])
    }
    italicRule = () => {
        this.generalConvertRule(["em"])
    }
    deletetRule = () => {
        this.generalConvertRule(["del"])
    }
    unOrderedListRule = () => {
        this.generalConvertRule(["ul"])
    }
    listItemRule = () => {
        this.generalConvertRule(["li"])
    }
    blockQuoteRule = () => {
        this.generalConvertRule(["blockquote"])
    }
    generalConvertRule = (tags) => {
        for (const tag of tags) {
            let newElement = document.createElement(tag);
            newElement.dataset.pos = this.tokenQueue[this.index].cursor;
            this.pushNodeToStack(newElement, this.tokenQueue[this.index].type);
        }
    }


    accordionRule = () => {
        this.index++;
        let sumaryText = this.tokenQueue[this.index].value;
        let cursor = this.tokenQueue[this.index].cursor;

        this.index++;

        let newDetailElement = document.createElement("details");
        newDetailElement.dataset.pos = cursor;
        newDetailElement.setAttribute("open", "");

        this.pushNodeToStack(newDetailElement, this.convertRuleOfAccordion.type);

        let newSummaryElement = document.createElement("summary");
        newSummaryElement.dataset.pos = cursor;
        newSummaryElement.appendChild(document.createTextNode(sumaryText));

        newDetailElement.appendChild(newSummaryElement);
    }
    imageLinkRule = () => {
        this.index++;
        this.index++;

        let linkText = this.tokenQueue[this.index].value;
        let cursor = this.tokenQueue[this.index].cursor;

        this.index++;
        this.index++;

        let linkUrl = this.tokenQueue[this.index].value

        let newAnchorElement = document.createElement("a");
        newAnchorElement.dataset.pos = cursor;
        newAnchorElement.setAttribute("href", linkUrl);
        this.pushNodeToStack(newAnchorElement, this.convertRuleOfImageLink.type);

        let newImageElement = document.createElement("img");
        newImageElement.dataset.pos = cursor;
        newImageElement.setAttribute("src", linkUrl);
        newImageElement.setAttribute("alt", linkText);
        this.pushNodeToStack(newImageElement, this.convertRuleOfImageLink.type);       
    }
    urlLinkRule = () => {
        this.index++;

        let linkText = this.tokenQueue[this.index].value;
        let cursor = this.tokenQueue[this.index].cursor;

        this.index++;
        this.index++;
        let linkUrl = this.tokenQueue[this.index].value

        let newElement = document.createElement("a");
        newElement.dataset.pos = cursor;
        newElement.setAttribute("href", linkUrl);
        newElement.setAttribute("rel", "nofollow noopener");
        this.pushNodeToStack(newElement, this.convertRuleOfUrlLink.type);
        this.currentNode.node.appendChild(document.createTextNode(linkText));
    }
    textRule = () => {
        this.currentNode.node.appendChild(document.createTextNode(this.tokenQueue[this.index].value));
    }    
    lineBreakRule = () => {
        this.currentNode.node.appendChild(document.createElement("br"));
    }
    escapeRule = () => {
        return;
    }

}


