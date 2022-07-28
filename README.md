# vue-lite
A simplified version of Vue that implements some parts of Vue's core module.

In order to figure out what the vue3 has done for us,  I learned some content about the vue3 source code from the Internet and books, and created this simplified version of vue (the main content is from HcySunYang, he is a very powerful vue developer). In this simplified version of vue, I have discarded a lot of content, especially in the compiler module. It can already run some samples successfully, although I still need to make some adjustments to the code.

This is a good sample for learning vue3 source code.



# How to run

Enter the following in the terminal:

```shell
npm install
npm run dev
```

Then you can see the demo page.



# How to build

First of all, you need to modify the ```mode``` in ```webpack.config.js```.

```js
module.exports = {
    mode: 'development',
    // omit other content...
}
```

Then, enter the following in the terminal:

```shell
npm run build
```

You will find the output file in the dist directory.

