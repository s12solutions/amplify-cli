import path from 'path';

export default function isChildPath(child: string, parent: string): boolean {
    if (child === parent) {
        return false;
    }
    const parentTokens = parent.split(path.sep).filter(i => i.length);
    return parentTokens.every((t, i) => child.split(path.sep)[i] === t);
}