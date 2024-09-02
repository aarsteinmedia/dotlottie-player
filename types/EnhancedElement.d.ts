export default class EnhancedElement extends HTMLElement {
    [key: symbol]: unknown;
    constructor();
    static observedProperties: (keyof EnhancedElement)[];
    connectedCallback(): void;
}
