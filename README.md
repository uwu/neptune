![neptune](https://github.com/uwu/neptune/raw/master/assets/banner.svg)

## what is neptune?
neptune is an experimental client mod for TIDAL that provides a simple plugin and theme system.

## screenshot(s)
![a screenshot of the neptune settings tab](https://github.com/uwu/neptune/raw/master/assets/neptune-screenshot.png)

## how can i install neptune?

### windows
you can download the neptune installer [here](https://github.com/uwu/neptune-installer/releases).

### linux
this depends on where your package manager installs Tidal.

- the `tidal-hifi` AUR package: `cd /opt/tidal-hifi/resources`
- the flatpak: `cd "$(flatpak info --show-location com.mastermindzh.tidal-hifi)/files/lib/tidal-hifi/resources/"`

Make sure that Tidal isn't running before doing this

```sh
# cd /opt/tidal-hifi/resources
# git clone https://github.com/uwu/neptune
# mv app.asar original.asar
# cp -r neptune/injector ./app
```

Launch Tidal, click on the 3 dots next to your name, and you should see the neptune menu.

## developing plugins for neptune
neptune exfiltrates every single action one can do in TIDAL into an easily accessible API found on `window.neptune.actions`.

TIDAL is built on [Redux](https://redux.js.org) and neptune's actions are simply exfiltrated Redux actions, which are explained in [this document](https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow#actions) on Redux's website.

neptune includes full type definitions for all of TIDAL's actions.

To get the global Redux store's state, you can use `window.neptune.store.getState()`. The return value of `getState()` will change as a direct result of actions.

To intercept and subscribe to actions, you can use `window.neptune.intercept("category/ACTION_NAME", ([payload]) => {})`, with the first argument being the name (or an array of names) of the action(s) to subscribe to, and the second argument being a function that gets called upon that action being ran. If you return `true` the action will automatically be cancelled.

A template for making neptune plugins is available [here](https://github.com/uwu/neptune-installer).
