---
layout: post.njk
author: Julio Castillo Anselmi
categories: LitElement

title: lit-html templates from zero to hero
description: All about writing templates using lit-html. It is the the second post of a series about lit-html and LitElement.
tags: ['post', 'lit-html', 'LitElement', 'webdev', 'javascript']
series: LitElement

date: 2019-06-17

image: /assets/img/hero-lit-html.webp
---

> 📣 **UPDATE!** 📣
> _Now lit-html and LitElement are unified under [Lit](https://lit.dev/)._
> _I'm writing new posts about **Lit**, meanwhile you can:_
> * _read this post because the principles are the same_
> * _upgrade your code with this [guide] (https://lit.dev/docs/releases/upgrade/)_
> * _visit *Lit* site to know what's new_

> _You can also use [lit-html standalone](https://lit.dev/docs/libraries/standalone-templates/)_

After a very smooth introduction to `lit-html`, I will go hard and get my hands dirty. I will show you how to write templates so this will be a session full of code!

> I know you are here because you want to learn `LitElement`, so you read this title and find out that we continue with `lit-html`. The reason why I've structured these sessions this way is because `lit-html` is the basis for `LitElement` and also because I want you to see the great potential and versatility of `lit-html` by itself, probably the perfect match for a small or medium project. I assure you that everything you learn about `lit-html` will be used in `LitElement`. Be patient, we will arrive soon.


## Writing templates

☝️Remember from last post: templates are written using tagged template literals. We tag the template literal with the `html` function provided by `lit-html`. This function returns a `TemplateResult` object. 
`render` is the other function provided by `lit-html`. `render` receives a `TemplateResult` object and renders it into the DOM.

This is a very simple example:

```javascript
// import functions from lit-html library
import {html, render} from 'lit-html';

// define the template as function that takes the data
// and returns a TemplateResult object
const template = name => {
  return html`
    <p>Hello ${name}</p>
  `;
};

// node where the template will be rendered
const mainNode = document.getElementById('main');

// render the template
render(template('Silvia'), mainNode);

// render the template again with different data
render(template('Benjamin'), mainNode);
```

The dynamic parts of a template are JavaScript expressions that are binded with values. `TemplateResult` supports bindings of certain data types that we will see now. 


### Supported bindings

* **Text**: An expression that is resolved as text can be used as the text content of a node. Be aware that an empty string ('') in a text binding will render an empty text node.

* **Attribute**: an expression that returns a text can be used as the value of an attribute. When an attribute behaves like a boolean (it is present or not) we denote it with the name of the attribute preceded by `?`. The value of the expression must be boolean, if it is `true` `lit-html` puts the attribute and if it is `false` it removes it.

* **Property**: An expression can also be binded to a JavaScript node's property. We write the property name with a `.` at the beginning. In that case, the type of expression must match the type of the property (it could be any type even a complex object).

* **Event**: An expression can be the handler of an event. For this we write the event name preceded by `@` and in this case we have several alternatives for the binding.

  * _Global handler function_: the expression resolves to a global function that will handle the event.

  * _Inline function_: the expression resolves to an inline function.

  * _Instance function_: the expression resolves to a function that belongs to your object.

  * _Event listener object_: the expression returns an object that _must have_ a function named `clickHandler`.

* **HTML node element**: the expression can return a DOM node.

* **TemplateResult**: the expression can be another `TemplateResult` object. This makes it possible to have composition of nested templates.

* **Iterable of `TemplateResult` objects**: expressions that returns an array or iterables of `TemplateResult` objects.

* **Promise**: the expression can return a promise that must be resolved returning a valid binding value.

```javascript
// Text binding
html`<p>${someText}</p>`;
html`<div>${capitalize(user.name, user.firstName)}</div>`;

/**** Given theses variables and values... **************

let someText = 'Lorem ipsum';
let user = { name : 'JEN', firstName: 'MONROE' };  

***** The code above will render... *********************

<p>Lore ipsum</p>
<div>Jen Monroe</div>
*********************************************************/


// Attribute binding
html`<div class=${classList}>Stylish text.</div>`;

/**** Given these variables and values... *****************

let classList = ['main', 'required', 'modern'].join(' ');

***** The code above will render... ***********************

<div class="main required modern">Stylish text.</div>
***********************************************************/


// Attribute binding (boolean)
html`<input type="submit" ?disabled=${formWithErrors} value="Submit">
     <span ?hidden=${!formWithErrors}>Form has errors!</span>`;


/**** Given these variables and values... *****************

let formWithErrors = true;

***** The code above will render... ***********************

<input type="submit" disabled value="Submit">`;
<span>Form has errors!</span>`
***********************************************************/


// Property binding
html`<custom-list .items=${users} id="user-list"></custom-list>`;

/**** Given these variables and values... *****************

const users = ['Diego', 'Ana', 'Laura', 'Piero'];
const customList = document.getElementById('user-list');
console.log(customList.items);

***** The code above will show in console *****************

 ["Diego", "Ana", "Laura", "Piero"]

***********************************************************/


// Event binding to a global handler function
html`<button @click=${handleClick}>Click Me!</button>`; 


// Event binding to an inline function
html`<button @click=${()=>console.log('clicked')}>Click Me!</button>`; 


// Event binding to an instance function
html`<button @click=${this.handleClick}>Click Me!</button>`;


// Event binding to listener object
html`<button @click=${clickHandler}>Click Me!</button>`;

const clickHandler = {
  handleEvent(e) { console.log('clicked!'); }
};


// Binding to a DOM node
const h1 = document.createElement('h1');
h1.textContent = 'Chapter 1'
const page = html`${h1}<p>Once upon a time...</p>`;

/***** The code above will render... **********************

<h1>Chapter 1</h1>
<p>Once upon a time...</p>
***********************************************************/


// Binding to a TemplateResult object
const header = html`<h1>Chapter 1</h1>`;
const article = html`<article>${header}<p>Once upon a time...</p></article>`;

/***** The code above will render... **********************

<article>
  <h1>Chapter 1</h1>
  <p>Once upon a time...</p>
</article>
***********************************************************/


// Binding to arrays/iterables
const items = [1, 2, 3];
const listItems = items.map(i => html`<li>${2*i}</li>`);
const template = html`<ul>${listItems}</ul>`;

/***** The code above will render... **********************

<ul>
 <li>2</li>
 <li>4</li>
 <li>6</li>
</ul>
***********************************************************/


// Binding to a promise
const text = fetch(url).then(response => response.text());
const page = () => html`<p>${text}</p>`;

/***********************************************************
Let's say that after some seconds the fetch operation 
resolves with a the string 'some text...'

Until the promise is resolved, the code above will render
<p></p> 

Once the promise is resolved, it will render...
<p>some text...</p>

***********************************************************/
```

### Composition

One consequence of having bindings to expressions that return `TemplateResult` objects is that by composition we can create templates using other templates. The composition allows:
* Create a complex template using simpler templates.
* Refactor a complex template by diving it into simpler templates.
* Reuse of templates (the use of JavaScript modules makes reuse much easier, for example, a module of common templates, partial templates, etc.)

```javascript
const header = data => html`
    <h1>${data.title}<h1>
    ${data.subtitle ? html`<h2>${data.subtitle}<h2>` : ''}`;


const main = data => html`<p>${makeParagraph(data.text)}</p>`;

const composedTemplate = data => html`
    ${header(data)}
    ${main(data)}`;
```

### Conditionals
A template can have parts that are only visible if a condition is met, or it could have parts that are represented in different ways depending on one or more conditions. These behaviors can be expressed using conditional expressions such as the ternary operator `?` or conditional structures such as the `if` or `switch-case` statements.

```javascript
// using ternary operator
const main = data => html`
    ${data.text ?
        html`<p>${data.text}</p>` :
        html`<img src=${data.image}></img>`}`;

// using if
const main = data => {
    if (data.text) {
        return html`<p>${data.text}</p>` :
    } else {
        return html`<img src=${data.image}></img>`;
    }
}

// using switch-case
const main = data => {
    switch (data.screenSize) {
    case 's':
        return html`<img src="${data.image}-small.png"></img>`;
    case 'm':
        return html`<img src="${data.image}-medium.png"></img>`;
    case 'l':
        return html`<img src="${data.image}-medium.png"></img>
                    <img src="${data.logo}.png"></img>`;
    default:
        return html`<p>${data.text}</p>`;
    }
}

```

### Iterations

It is very common for a part of a template to be repeated with different values. Think of a list, where the part that paints each item is always the same but with different values. For these cases we have already seen that it is possible to make a binding to expressions that return iterables from `TemplateResult` objects. This is the way we can repeat parts or blocks in a template.


```javascript
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Staurday', 'Sunday'];

// loops with arrays
html`<ul>${weekDays.map((day) => html`<li>${day}</li>`)}</ul>`;

// loop statement (better if DOM node update is cheap)
const itemTemplates = [];
for (const day of weekDays) {
  itemTemplates.push(html`<li>${day}</li>`);
}
html`<ul>${itemTemplates}</ul>`;

/*************************************
* We'll see the use of directives 
* in a future post !!
*************************************/
// repeat directive (better if moving DOM node is cheap)
html`<ul>${repeat(weekDays, day => day /*id*/, (day, index) => html`<li>${day}</li>`)}</ul>`;
```

## Setting things up

`lit-html` is distributed as a `npm` package so to install it run the command:
 
```shell
npm install --save lit-html
```

`lit-html` uses JavaScript modules therefore to use the `html` and `render` functions we have to import them from the module.

At the moment, browsers don't import ES6 modules using the short syntax:

```javascript
import {html, render} from 'lit-html'
```

We should write the full path to the module

```javascript
import {html, render} from './node_modules/lit-html/lit-html.js'
```

But if you want to use the short syntax you can use a built tool such as Webpack or you can install the Polymer command line tool that can handle the short syntax import when it serves the application. 

With Polymer CLI:
```shell
## install it
npm install -g polymer-cli

## use it
polymer serve
```

You're ready to start coding! I strongly recommend you to experiment and try your own examples. The best way to learn is by doing!


## Conclusion

As we have seen, a template is pure JavaScript code so any expression and valid structure of the language can be used inside the template. There are so many ways to define a template that is only limited by the preferences or styles of each developer. The result is that the templates turn out to be tremendously expressive and because it is just JavaScript you don't need to learn nothing new.