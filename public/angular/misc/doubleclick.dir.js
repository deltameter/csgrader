(function() {
    'use strict';

    angular
        .module('misc')
        .directive('doubleClick', doubleClick);

    function doubleClick($document) {
        return {
            restrict: 'A',
            scope: {
                doubleClick: '&'
            },
            link: function($scope, elem, attr) {
                var classes = attr.doubleClickClass.split(' ');
                var warningClass = classes[0], dangerClass = classes[1];
                //requires 2 clicks to activate callback. bIsTargeted muse be true
                var bIsTargeted = false;

                //add the inital warning class
                elem.addClass(warningClass);

                var checkClick = function(event){
                    if(!elem[0].contains(event.target)){
                        if (bIsTargeted){
                            elem.removeClass(dangerClass);
                            elem.addClass(warningClass); 
                        }
                        bIsTargeted = false;
                    }else{
                        if (bIsTargeted){
                            $scope.doubleClick();
                            $scope.$apply();
                        }

                        bIsTargeted = !bIsTargeted;

                        elem.removeClass(bIsTargeted ? warningClass : dangerClass);
                        elem.addClass(bIsTargeted ? dangerClass : warningClass); 
                    }
                }

                $document.on('click', checkClick);

                $scope.$on('$destroy', function() {
                    $document.off('click', checkClick);
                });
            }
        };
    }
})();