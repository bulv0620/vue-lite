import { compile } from './compiler/compile';
import {
  createApp,
  render,
  h,
  Text,
  Fragment,
  nextTick,
  renderList,
  withModel,
  resolveComponent
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
  compile,
  renderList,
  withModel,
  resolveComponent
});