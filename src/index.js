import { h, createApp } from "./runtime";
import { ref } from "./reactive";
import { parse } from "./compiler";

const t = `<div id="foo" v-if="ok">hello {{name}}</div>`

console.log(parse(t));