
export const text_to_markdown = (text: string): string => {
    text = text
        .replace(/(?<!\\)\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/(?<!\\)\*(.*?)\*/g, '<i>$1</i>')
        .replace(/(?<!\\)```([\S\s]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/(?<!\\)`(.*?)`/g, '<code>$1</code>')
        .replace(/(?<!\\)__(.*?)__/g, '<u>$1</u>')
        .replace(/(?<!\\)~~(.*?)~~/g, '<s>$1</s>')
        .replace(/(?<!\\)^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/(?<!\\)^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/(?<!\\)^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/(?<!\\)^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/(?<!\\)^##### (.*$)/gim, '<h5>$1</h5>')
        .replace(/(?<!\\)^###### (.*$)/gim, '<h6>$1</h6>')
        .replace(/(?<!\\)\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/\\([_*`~[\]()])/g, '$1');

    return text;
}