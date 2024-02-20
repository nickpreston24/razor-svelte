# TRASH  Stack ♻️

For those who love Low-code and C#/.NET, here's the stack for you!

> TRASH Stack is a low-code, framework-optional unicorn stack for .NET.
> *(... or at least 90% of a 🦄)*.

* 🌬️ __TailwindCSS__ - everyone knows what this is.
* 🔌 __Razor__ - HTML API with the power of xplatform C# behind it. None of that Blazor SPA complexity or JS neutering.
* 🌲 __Alpine__ - for animations, toggles, and anything that HTMX, svelte or Razor cannot do. 
* 🎻 __Svelte (*optional*)__ - custom, reusable ui components (optionally powered by tailwindcss)
* 🌩️ __Htmx__ - htmx.org, HTML attributes that give your entire UI the ability to call APIs. Low-code, low-JS.


## Installation

`yarn build`

## Running Locally

`yarn dev`

## Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/MORdhr?referralCode=oRsYwt)


### Options
* daisyui - best tailwindcss prefabs, for a quick, reliable and pretty UI.
* Any of the AlpineJS plugins
* (Your Backend Here) - Just use C# like normal, inside a razor API call and return the HTML result!  Simple.


## How I built this

1. [Followed this guide + repo](https://khalidabuhakmeh.com/add-svelte-to-aspnet-core-projects)
2. Got a basic build going with a `Counter.svelte`
3. Next is
   Tailwind: [Tailwind+Svelte](https://medium.com/@mdwikycahyo/how-to-set-up-svelte-using-vite-and-tailwind-css-617040ebccec)
4. Used this [fix](https://github.com/rollup/rollup/issues/4446) to get rollup and yarn to cooperate.
5. Finally, trying to deploy to Railway.app.


## Questions


1. 🤔 What Database or API should I use?

   Anything you want, really.  
   
2. What was the inspiration for this?
3. 
   I created TRASH Stack to try and maximize the potential of HTML and C#, without alienating people who want to still right SPA's but are Blazor-shy (me being one of them).

   
   Credit to Khalid AbuHakMeh for his [blog post on adding Svelte to aps.net core projecs](https://khalidabuhakmeh.com/add-svelte-to-aspnet-core-projects) like Razor Pages.  I really only combined that and some of his HTMX and some alpinejs for fun.


4.  How do I use this?

    With as much abuse to HTMX as you can possibly muster, while using Svelte for code-resuse.

    The whole point of the TRASH Stack is to have to write less frontend and more backend.

    For example, I suggest injecting Singleton Services you write in C# directly into a Partial View:
   
   ```@inject ILoveMyCustomTRASHService svc_that_does_stuff```
   
   The `@inject` keyword allows you to instantly do mundane things like read JSON configs, or provide company-specific support for [other things you wish .NET would support](https://github.com/nickpreston24/code-mechanic/blob/master/Extensions/Types/EnumExtensions.cs) like better Enums.

   Personally, I like using Singleton services to parse and cache things like curls and api endpoints that are a bore to write out by hand, but you can use it as a template for whatver killer app you want! Just use Razor Pages' integrated API endpoints to make calls to your backend and watch how easy your work becomes.  No more JSON-juggling in the UI, no more APIs that only serve to pump out JSON!

