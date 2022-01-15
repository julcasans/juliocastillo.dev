---
layout: post.njk
author: Julio Castillo Anselmi
categories: LitElement

title: "LitElement in depth: the update lifecycle"
description: One key feature of LitElement is that it renders asynchronously to ensure efficiency and good performance. Let's see how the update process works...
tags: ['post', 'lit-html', 'LitElement', 'webdev', 'javascript']
series: LitElement

date: 2020-03-07

image: /assets/img/litelement-depth.webp
---

> 📣 **UPDATE!** 📣
> _Now lit-html and LitElement are unified under [Lit](https://lit.dev/)._
> _I'm writing new posts about **Lit**, meanwhile you can:_
> * _read this post because the principles are the same_
> * _upgrade your code with this [guide] (https://lit.dev/docs/releases/upgrade/)_
> * _visit *Lit* site to know what's new_

> _You can also use [lit-html standalone](https://lit.dev/docs/libraries/standalone-templates/)_

Although **lit-html** is very efficient rendering, it is better to render only when necessary. That is why **LitElement** differs the re-rendering of the UI by batching the property updates. In other words, re-rendering is done asynchronously to ensure efficiency and good performance. Let's see how the update process works.

Recall from the previous post that all the properties defined in the `properties` getter become properties "controlled" by **LitElement**.

For each property defined in the `properties` getter, **LitElement** will generate:

* a `hasChanged` function
* a setter and a getter
* an observed attribute
* a `fromAttribute` function 
* a `toAttribute` function

In particular, we are interested in the `hasChanged` function and the setters because they play an important role in the update life cycle.

Almost all the "magic" is based on the setter that causes the component to be re-rendered when the property changes. First, it checks if the property has changed (invoking the `hasChanged` function) and, if that is the case, it will make a rendering request.
Also, if the property is reflected in an attribute, the setter will update the observed attribute using the `toAttribute` function.

In the **LitElement** class we find the following methods that participate in the update of the UI:

* requestUpdate
* performUpdate
* shouldUpdate
* update
* render
* firstUpdated
* updated
* updateComplete

Now that we have seen the main pieces involved in the re-rendering, we will go into detail on how this process occurs.

# The update cycle in action

Imagine you have a function with this piece of code:

```javascript
const el = document.querySelector('#myElement');
el.title = 'Movements'; //previous value was 'No title'
el.icon = 'book.ico'; //previous value was undefined
await el.updateComplete;
```

* 1\. The `title` property setter is executed. This setter calls `hasChanged` function of the `title` property. As it has changed, it returns `true` and in that case it calls `performUpdate`, a method of the **LitElement** class. This method verifies if there is a previous request pending, in that case it does nothing. If there isn't, it will create a micro-task (a promise) to execute the rendering. This is **LitElement**'s way of asynchronously executing the `render` method and batch property changes.
* 2\. We continue with the following line. Now the `icon` property setter  is executed. The setter calls `hasChanged` function, which returns `true`, so it calls the` performUpdate` method, but as a UI update operation is already pending, it does nothing else.
* 3\. Finally, our code is awaiting for the `updateComplete` promise to be resolved, that will occur when the update cycle is over.
* 4\. Now that there are no tasks on the stack, it is time to execute the micro task that was scheduled (in the step 1). It does the following:
* 4.1\. It invokes `shouldUpdate`, another method of the **LitElement** class. This method receives the properties that have changed and their old values. The purpose of this method is to evaluate all the batched changes that have occurred and based on that decide whether or not the update should be done. By default it returns `true`, but **LitElement** gives us this hook in case we want to put a special logic to avoid the update. Following our example, `shouldUpdate` receives `title => 'No title'`, `icon => undefined` and returns `true`, so the update continues.
* 4.2\. It executes the `update` method of the **LitElement** class. Here the changes are reflected to the attributes to maintain synchrony between properties and attributes (only for those properties defined with `reflect`). Then it calls the `render` method.
* 4.2.1\. The `render` function is executed, the DOM is updated.
* 4.2.2\. If it is the first time the component is rendered, the `firstUpdated` method will be executed. It's a hook that **LitElement** gives us to over-write if we need to do initialization tasks once the component is rendered.
* 4.2.3\. Then the `updated` method of the **LitElement** class is executed. This is another hook. Unlike `firstUpdated`, this method will always be called after every rendering.
* 4.2.4\. The `updateComplete` promise get resolved.


![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/tamasjwt0m9p9uak4sbi.png)

> 👉 All the properties defined in the `properties` getter become properties "controlled" by LitElement and any update of their values ​​will cause a rendering. This is why we should put there only the properties that affect the visual representation of the component: those that we have used in the template.
For example, if we have a `debug` property that is used to indicate if traces are written by `console.log`, changing this property should not cause an UI update.

## Live example

To understand it better, I have made this very silly component. The important part is that I have traced each method of the update lifecycle.

{ % stackblitz litelement-update-cycle % }

* When the component is rendered the first time you can find among the traces that there is an invocation to the `firstUpdated` method.

* I have traced the `_requestUpdate` and `_enqueueUpdate` methods that are private methods of `UpdatingElement` which is the class of which `LitElement` class extends. Although these methods are not an "official" part of the update lifecycle, seeing how **LitElement** uses them internally helps to understand the update process. We can see that `_requestUpdate` is called for every property that changes but `_enqueueUpdate` it's called only once: with the first property that changed. When there's an update process pending, `_enqueueUpdate` is not invoked again.

* The first time you press the button, it will update the `title` and `icon` properties. At this moment the component will be already rendered so you won't find a call to `firstUpdate`.

* The second time you press the button, it will update again the `title` and `icon` properties with the same values it did before. As the property values have no changes, the update cycle is not triggered.

* I have included the source code of the `UpdatingElement` class because I think you can understand it and see in detail how the UI update process is implemented.

# requestUpdate

Sometimes it may be necessary to manually trigger the re-rendering cycle. It is not enough to invoke the `render` method, because as we have seen, the process is much more complex. For these cases, **LitElement** provides the `requestUpdate` method that will trigger the whole lifecycle update.

A typical case where we should invoke `requestUpdate` is when we define our own setter and we want that a change in the property to cause a re-rendering. As we have seen before, for each controlled property **LitElement** generates a setter that evaluates whether the property has changed and if so, it updates the UI. But when we write our own setter, we lose the setter that would be generated by **LitElement**, because of this, we have to do by ourselves what **LitElement** does. We should do:

```javascript
set title(value) {
  if (this._title !=== value) {
    const oldValue = this._title;
    this._title = value;
    this.requestUpdate('title', oldValue); // Called from within a custom property setter
  }
}
```

> 👉 When we invoke `requestUpdate` from a setter we must pass the property name and the old value as arguments. On the other hand, if we force a re-render from elsewhere, `requestUpdate` has no arguments.

# This is the end

With this last topic about the UI update lifecycle we complete the basics of **LitElement**. You already have the fundamental knowledge to continue your path in **lit-html** and **LitElement**.

To go deeper in these libraries I highly recommend reading the official documentation. It's It is very clear, concise and very well organized. In addition, each topic is accompanied by a live example in [Stackblitz](https://lit.dev/playground/).

* [Lit documentation](https://lit.dev/docs/) 

I also suggest you read the source code of **lit-html** and **LitElement**. It is relatively short, well documented and with what you already know you will not find it difficult to understand. This way everything will be much clearer.

* [Lit source code](https://github.com/lit/lit)

Last but not least, two important contributions from the community: 

* [awesome-lit-html](https://github.com/web-padawan/awesome-lit-html) - A wonderful collection of resources made by [@serhiikulykov](https://twitter.com/serhiikulykov).
* [open-wc](https://open-wc.org/) - Web component recommendations with a bunch of powerful and battle-tested setup for sharing open source web components.


# Last words...

With this post I finish my series on LitElement. I hope you found it useful and enjoyed it as much as I did writing it. Thank you for having come this far! ❤️