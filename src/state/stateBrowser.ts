/// <reference path="state.ts" />

class StateBrowser {
    private nameRegex = new RegExp('^\\w+(\\.\\w+)+$');
    private siblingRegex = new RegExp('^\\$node\\(([-+]?\\d+)\\)$');
    private indexRegex = new RegExp('^\\[(-?\\d+)\\]$');
    
    constructor(private root: State) {
    }

    public lookup(fullname: string, stop?: number) {
        var current = this.root,
            names = fullname.split('.'),
            i = names[0] === 'root' ? 1 : 0,
            stop = isDefined(stop) ? stop : 0;

        for (; i < names.length - stop; i++) {
            if (!(names[i] in current.children))
                throw Error("Could not locate '" + names[i] + "' under '" + current.fullname + "'.");

            current = current.children[names[i]];
        }
        return current;
    }

    public resolve(origin, path): State {
        var siblingSelector = this.siblingRegex.exec(path),// path.match(this.siblingRegex),
            //nameSelector = this.nameRegex.test(path),
            selected = origin,
            sections: string[];

        if (siblingSelector) {
            selected = this.selectSibling(Number(siblingSelector[1]), selected);
        } else if (this.nameRegex.test(path)) {
            //Note: This enables us to select a state using a full name rather than a select expression.
            //      but as a special case, the "nameRegex" will not match singular names as 'statename'
            //      because that is also a valid relative lookup.
            //      
            //      instead we force the user to use '/statename' if he really wanted to look up a state
            //      from the root.

            selected = this.lookup(path);
        } else {
            sections = path.split('/');
            forEach(sections, (sec) => {
                selected = this.select(origin, sec, selected);
            });
        }

        if (selected === this.root)
            throw Error(errors.expressionOutOfBounds);

        return selected && extend({}, selected.self) || undefined;
    }

    private selectSibling(index: number, selected: State): State {
        var children = [],
            currentIndex = 0;

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

    private select(origin, exp: string, selected: State): State {
        if (exp === '.') {
            if (origin !== selected)
                throw Error(errors.invalidBrowserPathExpression);

            return selected;
        }

        if (exp === '..') {
            if (isUndefined(selected.parent))
                throw Error(errors.expressionOutOfBounds);

            return selected.parent;
        }

        if (exp === '') {
            if (origin !== selected)
                throw Error(errors.invalidBrowserPathExpression);

            return this.root;
        }

        var match = this.indexRegex.exec(exp);// exp.match(this.indexRegex);
        if (match) {
            var index = Number(match[1]),
                children = [];

            forEach(selected.children, (child) => {
                children.push(child);
            });

            if (Math.abs(index) >= children.length) {
                throw Error(errors.expressionOutOfBounds)
            }

            return index < 0 ? children[children.length + index] : children[index];
        }

        if (exp in selected.children) {
            return selected.children[exp];
        }

        throw Error(errors.couldNotFindStateForPath);
    }

}