import { compile } from './compiler/compile';
import {
  createApp,
  render,
  h,
  Text,
  Fragment,
  nextTick
} from './runtime';
import { reactive, ref, computed, effect } from './reactive';

export const VueLite = (window.VueLite = {
  createApp,
  render,
  h,
  Text,
  Fragment,
  nextTick,
  reactive,
  ref,
  computed,
  effect,
  compile
});