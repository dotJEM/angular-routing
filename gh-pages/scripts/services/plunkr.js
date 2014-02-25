/// <reference path="../_references.d.ts" />
angular.module('dotjem.routing.pages').service('plunkr', [
    '$document', function ($document) {
        function post(fields) {
            var form = angular.element('<form style="display: none;" method="post" action="http://plnkr.co/edit/?p=preview" target="_blank"></form>');
            angular.forEach(fields, function (value, name) {
                var input = angular.element('<input type="hidden" name="' + name + '">');
                input.attr('value', value);
                form.append(input);
            });
            $document.find('body').append(form);
            form[0].submit();
            form.remove();
        }

        return function (files, tags) {
            var postData = {};

            angular.forEach(files, function (file) {
                postData['files[' + file.name + ']'] = file.source;
            });

            angular.forEach(tags, function (tag, index) {
                postData['tags[' + index + ']'] = tag;
            });

            postData.private = true;
            postData.description = 'AngularJS Example Plunkr';

            post(postData);
        };
    }
]);
//# sourceMappingURL=plunkr.js.map
