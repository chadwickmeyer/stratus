//     Stratus.Components.Search.js 1.0

//     Copyright (c) 2016 by Sitetheory, All Rights Reserved
//
//     All information contained herein is, and remains the
//     property of Sitetheory and its suppliers, if any.
//     The intellectual and technical concepts contained herein
//     are proprietary to Sitetheory and its suppliers and may be
//     covered by U.S. and Foreign Patents, patents in process,
//     and are protected by trade secret or copyright law.
//     Dissemination of $scope information or reproduction of $scope
//     material is strictly forbidden unless prior written
//     permission is obtained from Sitetheory.
//
//     For full details and documentation:
//     http://docs.sitetheory.io

// Stratus Search Component
// ------------------------

// Define AMD, Require.js, or Contextual Scope
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['stratus', 'angular', 'stratus.services.registry', 'angular-material'], factory);
    } else {
        factory(root.Stratus);
    }
}(this, function (Stratus) {

    // This component handles searching to filter a collection
    Stratus.Components.Search = {
        bindings: {
            ngModel: '=',
            target: '@'
        },
        controller: function ($scope, $attrs, registry) {
            Stratus.Instances[_.uniqueId('search')] = $scope;
            Stratus.Internals.CssLoader(Stratus.BaseUrl + 'sitetheorystratus/stratus/components/search' + (Stratus.Environment.get('production') ? '.min' : '') + '.css');
            $scope.collection = ($scope.$parent && $scope.$parent.collection) ? $scope.$parent.collection : null;
            $scope.query = '';
            /**
             $scope.$watch('query', function (query) {
                console.log('query:', query);
             });
             console.log('attributes:', $attrs.ngModel);
             $scope.registry = new registry();
             $scope.registry.fetch('Media', $scope);
             /**/
        },
        templateUrl: Stratus.BaseUrl + 'sitetheorystratus/stratus/components/search' + (Stratus.Environment.get('production') ? '.min' : '') + '.html'
    };
}));