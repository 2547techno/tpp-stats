export function compileGQL(str, variables) {
    return {
        query: str,
        variables
    }
}