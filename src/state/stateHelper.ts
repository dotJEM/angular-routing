/// <reference path="stateWrapper.ts" />
/// <reference path="stateFactory.ts" />


module ui.routing {
    //TODO: Implement as Angular Provider.
    export class StateRules {
        private static nameValidation = /^\w+(\.\w+)*?$/;

        public static validateName(name: string) {
            if (StateRules.nameValidation.test(name))
                return;

            throw new Error("Invalid name: '" + name + "'.");
        }
      
    }

    export class StateBrowser {
        constructor(private root: IStateClass ) {

        }

        public resolve(origin, path): IStateClass {
            var match = path.match('^\\$node\\(([-+]?\\d+)\\)$'),
                selected = origin,
                sections: string[];

            if (match) {
                selected = this.selectSibling(Number(match[1]), selected);
            } else {
                sections = path.split('/');
                forEach(sections, (sec) => {
                    selected = this.select(origin, sec, selected);
                });
            }

            if (selected === this.root)
                throw new Error("Path expression out of bounds.");

            return selected && extend({}, selected.self) || undefined;
        }

        private selectSibling(index: number, selected: IStateClass): IStateClass {
            var children = [],
                currentIndex;

            forEach(selected.parent.children, (child) => {
                children.push(child);

                if (selected.fullname === child.fullname)
                    currentIndex = children.length - 1;
            });

            while (index < 0)
                index += children.length

            index = (currentIndex + index) % children.length;
            return children[index];
        }

        private select(origin, exp: string, selected: IStateClass): IStateClass {
            //TODO: Support full naming...

            if (exp === '.') {
                if (origin !== selected)
                    throw new Error("Invalid path expression. Can only define '.' i the beginning of an expression.");

                return selected;
            }

            if (exp === '..') {
                if (isUndefined(selected.parent))
                    throw new Error("Path expression out of bounds.");

                return selected.parent;
            }

            if (exp === '') {
                if (origin !== selected)
                    throw new Error("Invalid path expression.");

                return this.root;
            }

            var match = exp.match('^\\[(-?\\d+)\\]$');
            if (match) {
                var index = Number(match[1]),
                    children = [];

                forEach(selected.children, (child) => {
                    children.push(child);
                });

                if (Math.abs(index) >= children.length) {
                    throw new Error("Index out of bounds, index selecter must not exeed child count or negative childcount")
                }

                return index < 0 ? children[children.length + index] : children[index];
            }

            if (exp in selected.children) {
                return selected.children[exp];
            }

            throw new Error("Could find state for the lookup path.");
        }

    }
}