# TRASH  Stack ♻️

A low-code, framework-optional stack made of recyled parts.

* __TailwindCSS__ - everyone knows what this is.
* __Razor__ - HTML API with the power of xplatform C# behind it. None of that Blazor SPA complexity or JS neutering.
* __Htmx__ - htmx.org, HTML attributes that give your entire UI the ability to call APIs. Low-code, low-JS.
* __Alpine__ - for animations, toggles, and anything that HTMX, svelte or Razor cannot do.
* __*S*velte (*optional*)__ - custom, reusable ui components (optionally powered by tailwindcss)


## Installation


...


## Running Locally

...


## Deploy to Railway

...


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
