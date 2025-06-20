export default abstract class PropertyCallbackElement extends HTMLElement {
    constructor();
    connectedCallback(): void;
    propertyChangedCallback(_name: string, _oldValue: unknown, _value: unknown): void;
}
