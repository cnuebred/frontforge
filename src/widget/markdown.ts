export const text_to_markdown = (text: string): string => {
    if (!text) return '';

    text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    text = text
        .replace(/(?<!\\)^###### (.*$)/gim, '<h6>$1</h6>')
        .replace(/(?<!\\)^##### (.*$)/gim, '<h5>$1</h5>')
        .replace(/(?<!\\)^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/(?<!\\)^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/(?<!\\)^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/(?<!\\)^# (.*$)/gim, '<h1>$1</h1>');

    text = text.replace(/(?<!\\)\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
        const cleanUrl = url.trim().toLowerCase();
        if (cleanUrl.startsWith('javascript:') || cleanUrl.startsWith('data:') || cleanUrl.startsWith('vbscript:')) {
            return `<a href="#" class="text-danger" title="Zablokowano niebezpieczny link">${label}</a>`;
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });

    text = text
        .replace(/(?<!\\)```([\S\s]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/(?<!\\)`([^`]+)`/g, '<code>$1</code>') 
        .replace(/(?<!\\)\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/(?<!\\)\*(.*?)\*/g, '<i>$1</i>')
        .replace(/(?<!\\)__(.*?)__/g, '<u>$1</u>')
        .replace(/(?<!\\)~~(.*?)~~/g, '<s>$1</s>');

    text = text.replace(/\n/g, '<br>');

    text = text.replace(/\\([_*`~[\]()#])/g, '$1');

    return text;
}