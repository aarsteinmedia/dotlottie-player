export default abstract class PropertyCallbackElement extends HTMLElement {
    constructor();
    connectedCallback(): Promise<void>;
    propertyChangedCallback(_name: string, _oldValue: unknown, _value: unknown): void;
}
