System.register(["@angular/core", "stratus", "lodash", "stratus.services.registry"], function (exports_1, context_1) {
    "use strict";
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, Stratus, _, localDir, AppComponent;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (Stratus_1) {
                Stratus = Stratus_1;
            },
            function (_1) {
                _ = _1;
            },
            function (_2) {
            }
        ],
        execute: function () {
            localDir = '/assets/1/0/bundles/sitetheorystratus/stratus/src/angular';
            AppComponent = class AppComponent {
                constructor() {
                    this.title = 's2-content-module-edit';
                    Stratus.Instances[_.uniqueId('s2_app_component_')] = this;
                }
            };
            AppComponent = __decorate([
                core_1.Component({
                    selector: 's2-content-module-edit',
                    templateUrl: `${localDir}/app.component.html`,
                    providers: [],
                }),
                __metadata("design:paramtypes", [])
            ], AppComponent);
            exports_1("AppComponent", AppComponent);
        }
    };
});