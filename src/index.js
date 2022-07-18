import { ref } from "./reactive/ref";
import { effect } from "./reactive/effect";
import { computed } from "./reactive/computed";

const num = window.num = ref(0);
const c = window.c = computed({
    get(){
        return num.value * 2;
    },
    set(newVal){
        num.value = newVal / 2;
    }
})
