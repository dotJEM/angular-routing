interface shCore {
    autoloader: shAutoLoader;
    config: shConfig;
    defaults: any[];
    vars: any;

    highlight(globalParams?, element?);
    all();
}

interface shConfig { 
    bloggerMode?: boolean;
    strings?: any;
    stripBrs?: boolean;
    tagName?: string;
}

interface shAutoLoader {
    apply(eh: any, args: string[]);
}

declare var XRegExp;
declare var SyntaxHighlighter: shCore;

        