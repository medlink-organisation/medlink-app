import { __decorate } from "tslib";
import { Component, Input } from '@angular/core';
let AlertComponent = class AlertComponent {
    variant = 'default';
    title = '';
};
__decorate([
    Input()
], AlertComponent.prototype, "variant", void 0);
__decorate([
    Input()
], AlertComponent.prototype, "title", void 0);
AlertComponent = __decorate([
    Component({
        selector: 'app-alert',
        templateUrl: './alert.component.html',
        standalone: false
    })
], AlertComponent);
export { AlertComponent };
