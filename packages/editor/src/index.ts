import { loadTypes } from "./language/type_loader.js"


interface Foo {
    bar: string
}

export function testCore() {
    loadTypes()
    console.log("hello there!")
}
