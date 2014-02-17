/// <reference path="../_references.d.ts" />

interface IScriptLoaderService {
    LoadScript(url: string);
}

angular.module('dotjem.routing.pages').service('scriptLoader', [<any>
    function (): IScriptLoaderService {
        var $service: any = {};
        var loaded = {};

        $service.LoadScript = function (url: string) {
            if (!(url in loaded)) {
                $.ajax(url, {
                    dataType: "script",
                    success: () => { loaded[url] = url; },
                    async: false,
                    cache: true
                });
            }
        }

        return $service;
    }]);