/// <reference path="../testcommon.ts" />
/// <reference path="../../src/state/state.ts" />
/// <reference path="../../src/state/stateBrowser.ts" />
describe('state.stateBrowser', function () {
    'use strict';
    //Note: This line below is to be able to run the test cases both on the build output as well
    //      as the raw source, this is because the solution is wrapped in a function on build.
    //      It is a bit of a mess though which I am not to fond of, but will have to do for now.
    //var nui = typeof dotjem !== 'undefined' ? dotjem.ui : ui;
    var test = typeof dotjem !== 'undefined' ? dotjem : {
        StateBrowser: StateBrowser
    };
    var mod = angular.mock['module'];
    var inject = angular.mock.inject;
    beforeEach(mod('ui.routing', function () {
        return function () {
        };
    }));
    describe('lookup', function () {
        it('"first" succeeds.', function () {
            inject(function () {
                var browser = new test.StateBrowser({
                    children: {
                        'first': {
                            msg: "find me"
                        },
                        'second': {
                        }
                    }
                });
                var result = browser.lookup('first');
                expect(result.msg).toBe("find me");
            });
        });
        it('"first.second" succeeds.', function () {
            inject(function () {
                var browser = new test.StateBrowser({
                    children: {
                        'first': {
                            children: {
                                'second': {
                                    msg: 'find me'
                                }
                            }
                        }
                    }
                });
                var result = browser.lookup('first.second');
                expect(result.msg).toBe("find me");
            });
        });
        it('"first.second.third" succeeds.', function () {
            inject(function () {
                var browser = new test.StateBrowser({
                    children: {
                        'first': {
                            children: {
                                'second': {
                                    children: {
                                        'third': {
                                            msg: 'find me'
                                        }
                                    }
                                }
                            }
                        },
                        second: {
                        }
                    }
                });
                var result = browser.lookup('first.second.third');
                expect(result.msg).toBe("find me");
            });
        });
        it('"second.second" succeeds.', function () {
            inject(function () {
                var browser = new test.StateBrowser({
                    children: {
                        'first': {
                            children: {
                                'second': {
                                }
                            }
                        },
                        second: {
                            children: {
                                'second': {
                                    msg: 'find me'
                                }
                            }
                        }
                    }
                });
                var result = browser.lookup('second.second');
                expect(result.msg).toBe("find me");
            });
        });
        it('"nan" fails.', function () {
            inject(function () {
                var browser = new test.StateBrowser({
                    fullname: 'root',
                    children: {
                    }
                });
                expect(function () {
                    browser.lookup('nan');
                }).toThrow("Could not locate 'nan' under 'root'.");
            });
        });
        it('"first.nan" fails.', function () {
            inject(function () {
                var browser = new test.StateBrowser({
                    fullname: 'root',
                    children: {
                        'first': {
                            fullname: 'root.first',
                            children: {
                            }
                        }
                    }
                });
                expect(function () {
                    browser.lookup('first.nan');
                }).toThrow("Could not locate 'nan' under 'root.first'.");
            });
        });
        it('"first.nan" fails.', function () {
            inject(function () {
                var browser = new test.StateBrowser({
                    fullname: 'root',
                    children: {
                        'first': {
                            fullname: 'root.first',
                            children: {
                            }
                        }
                    }
                });
                expect(function () {
                    browser.lookup('first.nan.other');
                }).toThrow("Could not locate 'nan' under 'root.first'.");
            });
        });
    });
    describe('resolve', function () {
        var root;
        var browser;
        function buildChildArray(p, prefix, count, forEach) {
            var children = {
            };
            for(var i = 1; i <= count; i++) {
                var child = {
                };
                child.name = prefix + i;
                child.fullname = p.fullname + '.' + child.name;
                child.self = {
                };
                child.self.fullname = child.fullname;
                forEach(child);
                children[prefix + i] = child;
            }
            return children;
        }
        beforeEach(mod('ui.routing', function () {
            root = {
            };
            root.fullname = 'root';
            root.children = buildChildArray(root, 'state', 3, function (child) {
                child.children = buildChildArray(child, 'top', 3, function (child1) {
                    child1.children = buildChildArray(child1, 'mid', 3, function (child2) {
                        child2.children = buildChildArray(child2, 'bot', 3, function (child3) {
                        });
                    });
                });
            });
            browser = new test.StateBrowser(root);
        }));
        describe('at root', function () {
            it('resolve state1', function () {
                inject(function () {
                    expect(browser.resolve(root, 'state1').fullname).toBe('root.state1');
                });
            });
            it('resolve state1.top2', function () {
                inject(function () {
                    expect(browser.resolve(root, 'state1.top2').fullname).toBe('root.state1.top2');
                });
            });
            it('resolve ./state1', function () {
                inject(function () {
                    expect(browser.resolve(root, './state1').fullname).toBe('root.state1');
                });
            });
            it('resolve /state1', function () {
                inject(function () {
                    expect(browser.resolve(root, '/state1').fullname).toBe('root.state1');
                });
            });
            it('resolve state1/top3', function () {
                inject(function () {
                    expect(browser.resolve(root, 'state1/top3').fullname).toBe('root.state1.top3');
                });
            });
            it('resolve state1/top3/mid2/bot1', function () {
                inject(function () {
                    expect(browser.resolve(root, 'state1/top3/mid2/bot1').fullname).toBe('root.state1.top3.mid2.bot1');
                });
            });
            it('resolve [0] returns root.state1', function () {
                inject(function () {
                    expect(browser.resolve(root, '[0]').fullname).toBe('root.state1');
                });
            });
            it('resolve [-1]', function () {
                inject(function () {
                    expect(browser.resolve(root, '[-1]').fullname).toBe('root.state3');
                });
            });
            it('resolve [-2]', function () {
                inject(function () {
                    expect(browser.resolve(root, '[-2]').fullname).toBe('root.state2');
                });
            });
            it('resolve [1]', function () {
                inject(function () {
                    expect(browser.resolve(root, '[1]').fullname).toBe('root.state2');
                });
            });
            it('resolve [1]', function () {
                inject(function () {
                    expect(browser.resolve(root, 'state1/[1]').fullname).toBe('root.state1.top2');
                });
            });
        });
        describe('at root', function () {
            it('lookup top1', function () {
                inject(function () {
                    expect(browser.resolve(root.children.state1, 'top1').fullname).toBe('root.state1.top1');
                });
            });
            it('lookup state1.top2', function () {
                inject(function () {
                    expect(browser.resolve(root.children.state1, 'state1.top2').fullname).toBe('root.state1.top2');
                });
            });
            //it('lookup ./top1', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("./top1");
            //        expect(state.$fullname).toBe('root.state1.top1');
            //    });
            //});
            //it('lookup top3/mid2', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("top3/mid2");
            //        expect(state.$fullname).toBe('root.state1.top3.mid2');
            //    });
            //});
            //it('lookup top3/mid2/bot1', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("top3/mid2/bot1");
            //        expect(state.$fullname).toBe('root.state1.top3.mid2.bot1');
            //    });
            //});
            //it('lookup [0]', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("[0]");
            //        expect(state.$fullname).toBe('root.state1.top1');
            //    });
            //});
            //it('lookup [-1]', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("[-1]");
            //        expect(state.$fullname).toBe('root.state1.top3');
            //    });
            //});
            //it('lookup [-2]', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("[-2]");
            //        expect(state.$fullname).toBe('root.state1.top2');
            //    });
            //});
            //it('lookup [1]', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("[1]");
            //        expect(state.$fullname).toBe('root.state1.top2');
            //    });
            //});
            //it('lookup .', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup(".");
            //        expect(state.$fullname).toBe('root.state1');
            //    });
            //});
            //it('lookup ../state2', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("../state2");
            //        expect(state.$fullname).toBe('root.state2');
            //    });
            //});
            //it('lookup ../state2/top2', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("../state2/top2");
            //        expect(state.$fullname).toBe('root.state2.top2');
            //    });
            //});
            //it('lookup /state2', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("/state2");
            //        expect(state.$fullname).toBe('root.state2');
            //    });
            //});
            //it('lookup $node(1)', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("$node(1)");
            //        expect(state.$fullname).toBe('root.state2');
            //    });
            //});
            //it('lookup $node(-1)', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("$node(-1)");
            //        expect(state.$fullname).toBe('root.state3');
            //    });
            //});
            //it('lookup $node(5)', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("$node(5)");
            //        expect(state.$fullname).toBe('root.state3');
            //    });
            //});
            //it('lookup $node(-7)', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        var state = $state.lookup("$node(-7)");
            //        expect(state.$fullname).toBe('root.state3');
            //    });
            //});
            //it('lookup .. throws error', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        expect(function () { $state.lookup(".."); })
            //            .toThrow();
            //    });
            //});
            //it('lookup ../.. throws error', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        expect(function () { $state.lookup("../.."); })
            //            .toThrow();
            //    });
            //});
            //it('lookup fubar throws error', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        expect(function () { $state.lookup("fubar"); })
            //            .toThrow();
            //    });
            //});
            //it('lookup top3/fubar throws error', function () {
            //    inject(function ($location, $route, $state: ui.routing.IStateService) {
            //        goto(target);
            //        expect(function () { $state.lookup("top3/fubar"); })
            //            .toThrow();
            //    });
            //});
                    });
    });
});
