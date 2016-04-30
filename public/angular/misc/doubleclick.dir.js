(function() {
    'use strict';

    angular
        .module('misc')
        .directive('doubleClick', doubleClick);

    function doubleClick($document) {
        return {
            restrict: 'A',
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
                        if (bIsTargeted === true){
                            $scope.$eval(attr.doubleClick);
                        }else{
                            elem.removeClass(warningClass);
                            elem.addClass(dangerClass); 
                        }

                        bIsTargeted = !bIsTargeted;
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