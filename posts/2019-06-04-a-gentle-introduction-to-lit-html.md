---
layout: post.njk
author: Julio Castillo Anselmi
categories: LitElement

title: A gentle introduction to lit-html
description: An overview of the basics concepts of lit-html library It is the first post of a serie about lit-html and LitElement.
tags: ['post', 'lit-html', 'LitElement', 'webdev', 'javascript']
series: LitElement

date: 2019-06-04

image: /assets/img/gentle.webp
---

Hello! I start my blog with a series of `LitElement` entries. I'll start with the most basic concepts and then I'll go deeper into the details of the use of this library. As `LitElement` is based on `lit-html` the first step will be the study of `lit-html`. I hope you like it and find it useful.

`lit-html` is an HTML templating library made by the Polymer team. This library stands out for being simple, very small, extremely efficient in terms of speed and use of resources, and all this is because it is based on web standards.

A very important point to note is that `lit-html` doesn't define any component model and therefore can be used in any project with other frameworks or libraries.

## So what is a template?
Think of a payment receipt, it's a pice of paper that has written words and spaces to fill in. It has a text part that is always the same and other parts that can vary. It could be something like this:

```
Date: ___/___/___
Received from ___________, the amount of $__________
for _____________________________________________
Received by: __________________
```

This template can be printed and used many times filling in the blanks with the data of each payment.

## And what is an HTML template?
Think of a piece of HTML code that has some parts to fill in, the content of those parts can change but the rest remains always the same, so the HTML code has static parts and dynamic parts (the gaps to fill in).

If the above receipt template had been written using HTML it could be:

```html
<div>
  <p>Date: <span> ______</span></p>
  <p>Received from <span> ______ </span>, 
     the amount of <span> $ ______ </span> </p>
  <p> for <span> _______ </span></p>
  <p> Received by: <span> _______ </span></p>
</div>
```

`lit-html` lets you define an HTML template like the one above so that it can be rendered and reused with different values in the dynamic parts. This is not something new, there are other libraries like MoustacheJS or HandlebarJS that do the same, but `lit-html` is special because it does it in a very, very efficient way. Why so efficient? Well, the usual approach is to parse the template and then render the HTML in a DOM node  with the new values in the changing parts. Every time the dynamic parts change, a parsing and rendering process is needed. The cost of re-rendering the DOM is high because it replaces the old node with the new node. `lit-html` is efficient because it doesn't parse the template and it only renders the HTML in the DOM once, just the first time. It also remembers where the dynamic parts are so that when a value of these parts changes `lit-html` just has to directly access that part and update the value in the DOM (normally it will be just text content, although it could also be a node).

`lit-html` is extremely efficient because it uses features of the web platform that are implemented natively in browsers. These characteristics are:
* Tagged template literals of JavaScript.
* HTML template tag.

The use of these features makes the library small and fast because it doesn't need to implement the parsing of the string templates. It's done by JavaScript natively.

The creation of the DOM represented by the template is also efficient, since it does so through the `<template>` tag, cloning its content.
Therefore, using what the platform offers, `lit-html` doesn't have to resort to the use of ad-hoc languages like JSX that requires extra processing, nor create complex solutions like a virtual DOM.

## How to define a template?
Too many words so far, let's see how a template is defined in `lit-html`.

```javascript
html`
  <div>
    <p>Date: <span>${data.date}</span></p>
    <p>Received from <span>${data.title} ${data.name} ${data.surname} 
    </span>, the amount of <span> ${data.amount}</span> </p>
    <p> for <span> ${data.concept} </span></p>
    <p> Received by: <span> ${data.receiver} </span></p>
  </div>`
```

Here we have a template literal tagged with a function called `html`. This is one of the two functions provided by `lit-html`.
As I said before, `lit-html` uses tagged template literals to define a template. These strings contain normal HTML code, there is nothing special, except for the tag function and the marks with `${}`.

Enclosed in `${}` are JavaScript expressions that when interpolated are replaced by the results of evaluating them. Also, when JavaScript finds a tagged template literal it processes the string (kind of parsing task) and pass it to the tag function. As you can see, it's all pure JavaScript's work, there's no need for anything else (I mean, not like JSX).

That's what a template in `lit-html` looks like. To make it useful we can define a function that takes the data that will be applied inside the template literal and it will return a `ResultTemplate` object (it is what the `html` tag function produces but we don't need to go into detail now, I'll talk about it in a future post).

```javascript
const receiptTemplate = (data) => html`
<div>
  <p>Date: <span>${data.date}</span></p>
  <p>Received from <span>${data.title} ${data.name} ${data.surname} 
  </span>, the amount of <span> ${data.amount}</span> </p>
  <p> for <span> ${data.concept} </span></p>
  <p> Received by: <span> ${data.receiver} </span></p>
</div>`
```

Now that we have the template definition we can use it many times with different values.

```javascript
receiptTemplate(myData);
receiptTemplate(otherData);
```

## What about rendering the template?
We have seen how to define a template, now we'll see how to render it. This is the easiest part. For this we'll use the other function provided by `lit-html`: the `render` function.

`render` requires two mandatory arguments: the first is the `TemplateResult` object to render and the second is the DOM node where the template will be placed. The third argument is optional and is an object that contains additional options (for now you do not have to know this).

```javascript
const templateResult = receiptTemplate(myData);
render(templateResult, document.getElementById('mainContent'));
```

## Recap

* `lit-html` is a simple, modern, safe, small and fast HTML templating library for JavaScript.
* It can be used in any project.
* It's based on web standards.
* It's framework agnostic.
* It provides two functions: `html` and `render`.
* `html` is used as a tag in front of the template literal that defines the HTML template.
* `html` returns a `TemplateResult` object.
* `render` is the function used to render the template in the DOM.
* `render` receives a `TemplateResult` object and a node where to place the template.

This is all the basic, minimum and elementary you should know to use this modern library. In the next post I will show you how to install `lit-html` and explain in detail how to write complex templates. Until next time!