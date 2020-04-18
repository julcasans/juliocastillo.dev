---
layout: post.njk
author: Julio Castillo Anselmi
categories: LitElement

title: PolymerElement is dead, long live LitElement!
description: Introduction to LitElement. It is on my series about lit-html and LitElement.
tags: ['post', 'lit-html', 'LitElement', 'webdev', 'javascript']
series: LitElement

date: 2019-11-20

image: /assets/img/litelement.webp
---
Hello my friends! We've finally reached the main subject of this series: **LitElement**.

# A new class to rule web components

To understand what **LitElement** is and what it does for us, we will return to where we left in the previous post. Let's remember what we did last time, we used **lit-html** to create a web component capable of re-rendering when the value of a component's property changed.

To achieve that, we had to create a class with a constructor that was responsible for creating the shadow DOM and reflecting the values ​​of the HTML attributes to the component properties. Then, to get the component re-render every time a property changes we had to write a setter for each one of them and call the **lit-html** `render` function inside that setter.
And last but not least, we had to write code in order to keep HTML properties and attributes in sync.

All this results in repetitive code that increases according to the number of properties that the component has. To create a better developer experience, the **Polymer** team thought that it would be good to have a class that handles all this burden for us. As well as they made **PolymerElement**, but this time they had to evolve and take advantage of their wonderful **lit-html**, so it wouldn't be a new version of **PolymerElement**, it had to be totally new, and so they created **LitElement**.

**LitElement** not only frees us from repetitive code, it also makes **lit-html** rendering even more efficient by making it happen asynchronously.

So, **LitElement** is a lightweight class to create web components. It handles for us all the repetitive code needed to:
- use shadow DOM
- keep in sync HTML attributes and component properties
- efficiently render (using **lit-html**) the component every time a property changes

Let's see the minimal code that a **LitElement** needs:

```javascript
// Import the LitElement base class and html helper function
import { LitElement, html } from 'lit-element';
// Import other element if it needed
import 'package-name/other-element.js';

// Extend the LitElement base class
class MyElement extends LitElement {

  /**
   * Implement `render` to define a template for your element.
   *
   * You must provide an implementation of `render` for any element
   * that uses LitElement as a base class.
   */
  render() {
    /**
     * `render` must return a lit-html `TemplateResult`.
     *
     * To create a `TemplateResult`, tag a JavaScript template literal
     * with the `html` helper function:
     */
    return html`
      <!-- template content -->
      <p>A paragraph</p>
      <other-element></other-element>
    `;
  }
}

// Register the new element with the browser.
customElements.define('my-element', MyElement);
```

As you've seen the only requirement is to implement the `render` function that draws the component's UI. This function must return a `TemplateResult` and that is because it will call the `render` function provided by **lit-html** (notice we also import the `html` function). This is very important because everything that we've seen in [previous posts](https://dev.to/julcasans/lit-html-templates-from-zero-to-hero-2afm) of **lit-html** applies to **LitElement**.

We could summarize **LitElement** in a very simplistic formula:
> `LitElement` = `lit-html` + `shadow DOM` + `auto async render`

# LitElement's render function

The `render` function has a great importance in **LitElement** because it defines how the component will look. When you see the defined template you should understand how the component will be painted in every situation. There's no other place where the component's UI can be modified or updated. And what is more, whenever a property changes (the component's state changes) **LitElement** will call the `render` function to update the component representation. So it turns out that the UI is expressed as function of the component's state.

> UI = f(state)

According to this functional approach the template should be written as a pure function of the properties of the component, such that:

* It doesn't change the status of the component
* It has no side effects
* It only depends on the properties of the component
* It always returns the same value if the properties have not changed

This results in a great developer experience because you don't need to worry about how to update the component when something has changed. It will be re-rendered according to the new state and the performance impact of the rendering action has no value due to the efficiency of **lit-html** plus the asynchronous optimization added by **LitElement**.

Without this solution, we would have rendered the component once (the first time) and would have written additional code to update some part of the component for each possible state change and, in general, this code would have had many conditions and considerations. In the long run, updating the visual representation depending on the changes in the state of the component becomes an arduous task and a lot of code to maintain.

Also in the re-render approach, the component's UI is defined declaratively and in one place. The classic approach (update UI parts) is imperative and the logic is distributed in many functions.

# Our first LitElement component

Do you remember the `<password-checker>` component that we created with **lit-html** in the previous post?

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

Now let's see how that component is implemented using **LitElement**.


```javascript
import { LitElement, html } from 'lit-element';

class PasswordChecker extends LitElement {
  static get properties() {
    return {
      password: String
    }
  }

  isValid(passwd) {
    const re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}/;
    return re.test(passwd);
  }

  render() {
    return html`
      <span>Your password is <strong>${this.isValid(this.password) ? 'valid 👍' : 'INVALID 👎'}</strong></span>
      ${this.isValid(this.password) ?
        html`<div>Strength: <progress value=${this.password.length-3} max="5"</progress></div>` : ``}`;

  }
}

customElements.define('password-checker', PasswordChecker);
```

The first thing to notice is that there is no constructor. We don't need it in this case. We don't need to add a *shadow root* because **LitElement** does that for us. When **LitElement** renders a component, it calls **lit-html**'s `render` function and that function expects an argument that is a node where to paint the component. **LitElement** creates the **shadow root** for the component and passes it to the **lit-html**'s `render` function. It's very similar to what we did in the `update` function of the **lit-html** version.
If for whatever reason we don't want our component to use shadow DOM, we can overwrite the `createRenderRoot` function and return a `this` value.

```javascript
createRenderRoot() {
  return this;
}
```

Although **LitElement** does many things for us, it also lets us customize the default behaviour by overriding some functions. We'll see that **LitElement** is very flexible.


## Properties and update

Our **lit-html** version of `<password-checker>` had a setter for the property `password` and in that function we updated the HTML attribute and invoked the `render` function. **LitElement** does the same thing for us. _All the brilliance things happens when we define the getter function `properties`_:

```javascript
  static get properties() {
    return {
      password: String
    }
  }
```

Every property that is defined inside this function will be controlled by **LitElement** so that a change of its value will cause the component to be re-rendered.
Thus for each declared property **LitElement** will provide:

* an observed attribute
* accessors
* `hasChanged` function
* `fromAttribute` function
* `toAttribute` function

Let's see in detail what they are:

### Observed attribute
Suppose your component has a property called `birthYear`, you will be able to use the attribute `birthyear` in the markup

```html
<my-comp birthyear="1973">
```

and **LitElement** will assign that value to the property but it previously converts the `String` value to the property's type (`Number` in this case) using the `fromAttribute` function.

👉 Notice that, by default, the attribute's name is the property's name in lowercase. You can change it by using the `attribute` key in the property definition:

```javascript
static get properties() {
  return {
    birthYear: {
      type: Number,
      // the observed attribute will be birth-year instead of birthyear
      attribute: 'birth-year'
    }
  }
}
```

Although by default **LitElement** passes values from attributes to properties, the opposite is not true. If you want a change in a property value to be reflected in HTML attribute you must explicitly tell so using the key `reflect`.

```javascript
static get properties() {
  return {
    birthYear: {
      type: Number,
      // the observed attribute will be birth-year instead of birthyear
      attribute: 'birth-year'
      reflect: true
    }
  }
}
```

### hasChanged
It's a function that checks if the new value is different from the previous value. In that case it returns `true`.

⚠️ Be careful with values that are objects or arrays because the comparison is made at top level, it doesn't do a shallow comparison, so if you evaluate `obj1 === obj2` you're comparing references. In that cases you should override `hasChanged` to do the proper comparison.

### fromAttribute
It is the function that converts the `String` value of the observed attribute to the real type of the property. You can provide your custom converter by overriding `fromAttribute`.

### toAttribute
It is the function used to convert the property value into a `String` value so that it can be assigned to the observed attribute in the markup code (HTML). This function is used by **LitElement** when the property has been set to `reflect`.
If you need a custom converter, then override `toAttribute`.

### Accessors
**LitElement** generates accessors, a *getter* and a *setter*, for declared properties. In the *setter* relies almost all the _'magic'_ that causes the component to be re-rendered when a property changes. First it checks if the property has changed (invoke `hasChanged` function) and if that's the case, then it will trigger an UI update.
Also if, the property is reflected to an attribute, the setter will update the observed attribute using the function `toAttribute`.

If you provide your own *getter* or *setter* or both, then **LitElement** won't create any accessor for that property. Just keep in mind that if you write your own setter and you want that a change causes a re-render, you'll have to make the same things that ** LitElement ** 's getter does.
You can also avoid auto-generated getter and setter using the key `noAccessor`.

```javascript
static get properties() {
  return { birthYear: { type: Number, noAccessor: true } };
}
```

I summarize these points in an example:
```javascript
// properties getter
static get properties() {
  return {
    // by default, every declared property: 
    //  - has an observed attribute,
    //  - when the attribute changes, it updates the property
    //  - has a getter and a setter
    //  - changes in value triggers a render update
    //  - has a default hasChanged function
    //  - has default converters: fromAttribute, toAttribute
    //  - all of this can be customized
    firstName: { type: String }, // type is the minimum required information
    lastName:  { type: String,
                 attribute: 'last-name'
               },
    enrolled:  { type: Boolean },
    address:   { type: Object,
                 reflect: false,
                 noAccessor: true,
                 hasChanged(newValue, oldValue) {
                    return newValue.zipCode != oldValue.zipCode;
                 }
               },
    age:       {
                 converter: {
                   toAttribute(value) {
                     return String(value);
                   }
                   fromAttribute(value) {
                     return Number(value);
                   }
                }
    }
  };
}
```

As last remarks, we observe that the `properties` getter is very similar to the `properties` getter that we used in **PolymerElement** but the **LitElement** version lacks the following features:

### initial value
In **PolymerElement**'s `properties` getter we can assign an initial value to a property, but that's not possible in **LitElement**, we must do that in the constructor.

```javascript
// PolymerElement 
static get properties() {
  return { birthYear: { type: Number, value: 1973 } };
}

// LitElement
constructor() {
  super(); // Don't forget to call super() !!!
  this.birthYear = 1973;
}
```

### observed properties
**LitElement** has no observed attributes. You can use a setter to perform actions when the property changes.

```javascript
// PolymerElement 
static get properties() {
  return { birthYear: { type: Number, observer: '_yearChanged' } };
}

// LitElement
set birthYear(value) {
  // Code to check if property hasChanged
  // and request UI update should go here
  // ...
  this._birthYear = value;  // private _birthYear with getter birthYear
  this._yearChanged();
}
```

### computed properties
**LitElement** doesn't have computed properties. To achieve the same result use getters.

```javascript
// PolymerElement 
static get properties() {
  return { birthYear: { type: Number },
           age: { type: Number, computed: '_computeAge(birthYear)' }
 };
}

// LitElement
get age() {
  return (new Date()).getFullYear() - this.birthYear;
}
```

Well, we've had enough already.
So far the first part about **LitElement**. In the next post I will tell you in detail how is the asynchronous rendering process and the life cycle of a **LitElement** component.
See you!