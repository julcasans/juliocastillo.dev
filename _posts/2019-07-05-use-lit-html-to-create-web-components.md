---
layout: post
author: "Julio Castillo Anselmi"
categories: LitElement

title: Use lit-html to create web components (à la React)
published: true
description: Create ultra-fast web components using lit-html and the React approach. It is on my series about lit-html and LitElement.
tags: lit-html, LitElement, webdev, javascript
series: LitElement
image: lit-html-web-components.webp
---

This post was going to be about directives in `lit-html`, which is the way we can extend the library but I didn't want to keep delaying the arrival to our central theme of the series that is `LitElement`. So I decided to leave the directives for later and enter the doors of `LitElement`. I'm going to show you how to create web components using `lit-html` and we'll see how we get to `LitElement` from there. Let's get started!

# The idea

We are going to build a web component using only `lit-html` but with a similar approach to **React**, that is, we'll have a declarative template that defines exactly how the component UI is for its entire state and we'll also make that when a component property changes, a new rendering will update its UI.

To define the UI, instead of JSX, we'll use template literals and the `html` tag as we have seen in previous posts.
We also know that `lit-html` is super efficient rendering so we won't have any issues if we invoke the `render` function every time a property changes.

The component that we will create will be very simple at a visual and functional level. Do not expect us to make a mega component, not for now. In this publication we want to focus on the basic concepts for creating web components.

So our component will be a password checker: a component that given a password it tells if it is valid or invalid and if it is valid it also tells us how strong it is.

The rules that apply are these:
* The password is valid if:
 - it has at least 4
 - It has at least one lower case letter.
 - It has at least one capital letter.
 - it has at least one digit
* If it is valid, a bar that measures its strength is shown.
* If it is invalid, the strength bar is not shown.

**Valid password example**
```html
<password-checker password="aB1sgX4"></password-checker>
```
![](https://thepracticaldev.s3.amazonaws.com/i/p4zm3aests24r5uac9rc.png)

**Invalid password example**
```html
<password-checker password="aB1"></password-checker>
```
![](https://thepracticaldev.s3.amazonaws.com/i/v5faempe21zjwzu3o0ri.png)


# The code

We create a `password-checker.js` file and in the first line we'll import the `html` and `render` functions from `lit-html`:

```javascript
import { html, render } from 'lit-html';
```

Then, as we do with any other web component, we create a class that:
1. extends `HTMLElement`. 
2. has a constructor that creates the component's shadow DOM.

Also, our component has a property to keep the password and it should be initialized with the value defined by the user in the HTML file, as we can see here: `<password-checker password="aB1">`. We do that in the last line of the constructor.

```javascript
class PasswordChecker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.password = this.getAttribute('password');
  }

```

Now let's think of the visual representation and define the template:

```javascript
  template() {
    return html`
      <span>Your password is <strong>${this.isValid(this.password) ? 
            'valid 👍' : 'INVALID 👎'}</strong></span>
      ${this.isValid(this.password) ? 
        html`<div>Strength: <progress value=${this.password.length-3} max="5"</progress></div>` : ``}`;
          
  }
```

The template uses a conditional expression to show the strength bar only if the password is valid. Also note that the property `password` is the essential part of the template, its value defines how the component is presented. Any change to the `password` property has to trigger an UI update causing a re-rendering of the component. How can we achieve that?

It's easy, we create a setter for the `password` property so that when updating its value we force an update of the component. We also want the `password` attribute of the HTML element to have the new value. This is the code:

```javascript
  set password(value) {
    this._password = value;
    this.setAttribute('password', value);
    this.update();
  }

  get password() { return this._password; }

  update() {
    render(this.template(), this.shadowRoot, {eventContext: this});
  }
```

As we define a setter we also define a getter.
The `update` function invokes the `render` function that will cause the component's UI to be updated. 

👉 The point to remark here is that we call the `render` function passing the *shadowRoot* of the component so that the template goes inside the component's shadow DOM. The third argument has the context that will be used in the event handlers (if there were). So we can have in our template something like this: 
`<button @click=${this.start}>Start</button>`. The `this` in `@click=${this.start}` has the context passed in the `eventContext` property. If we don't pass the context, `this.start` will fail.

Finally we register the web component:

```javascript
customElements.define('password-checker', PasswordChecker);
```

The final code, all together is like this:
```javascript
import { html, render } from 'lit-html';

class PasswordChecker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.password = this.getAttribute('password');
  }
  
  get password() { return this._password; }

  set password(value) {
    this._password = value;
    this.setAttribute('password', value);
    this.update();
  }

  update() {
    render(this.template(), this.shadowRoot, {eventContext: this});
  }

  isValid(passwd) { 
    const re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}/;
    return re.test(passwd);
  }
    
  template() {
    return html`
      <span>Your password is <strong>${this.isValid(this.password) ? 'valid 👍' : 'INVALID 👎'}</strong></span>
      ${this.isValid(this.password) ? 
        html`<div>Strength: <progress value=${this.password.length-3} max="5"</progress></div>` : ``}`;
          
  }
}

customElements.define('password-checker', PasswordChecker);
```


# Recap

This is the recipe we have used to create web components *à la* React.

1. Import `html` and `render` from `lit-html`.
2. Create a class that extends HTMLElement.
3. Write a constructor that:
 - creates the shadow DOM.
 - initializes properties from values in the HTML tag.
4. Write the template for the components UI.
5. Write an update function that calls `render`.
6. For every property that a value change requires an update of the UI:
 - write a setter that updates the UI and synchronizes the property with its related HTML attribute.
 - Write a getter.
7. Register the component. 


# Live on Glitch

You can see the code and play with it on my Glitch page.
--
{  % glitch handy-train %  }
--


# Final thoughts

### Similar to React but not like React

The approach we used to create the component is similar to React but it is not exactly the same. We could say that the way we define the template it's the same but with a different implementation: React uses `JSX`, a language that must be processed to generate JavaScript code, and `lit-html` is based on JavaScript features so it doesn't require extra processing.
The part in which they differ is in the update of the UI: React updates the component when we make a call to the `setState` function and in our approach the update occurs 'automatically' when a property changes. It may seem a very subtle difference but it will be more evident when we see this same idea in `LitElement`.

### lit-html in the real world

Previously we have seen that `lit-html` doesn't require a component model and therefore we can use it in a variety of projects even mixing it with other frameworks and libraries. And now we have just seen that with this library we can implement web components which makes it even more powerful and easier to integrate into other projects.

There are several projects that use `lit-hmtl`. I leave here some of them. The source of this information is this fantastic collection of resources on `lit-html` that I recommend you take a look: [Awesome lit-html](https://github.com/web-padawan/awesome-lit-html).

Of course I also recommend [the official `lit-html` documentation](https://lit-html.polymer-project.org/guide) that is clear and complete.

Some projects based on `lit-html`
* [Fit-html](https://github.com/Festify/fit-html)
* [GluonJs](https://github.com/ruphin/gluonjs)
* [ui5 WebComponents](https://github.com/SAP/ui5-webcomponents)

### LitElement is coming...
Finally, in the next post I'll talk about `LitElement`! See you soon.