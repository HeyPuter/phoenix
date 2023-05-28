export class ParserRegistry {
    constructor () {
        this.parsers_ = {};
    }
    register (id, parser) {
        this.parsers_[id] = parser;
    }
    get parsers () {
        return this.parsers_;
    }
}
