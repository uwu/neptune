![neptune](https://github.com/uwu/neptune/raw/master/assets/banner.svg)

## what is neptune?
neptune was an experimental client mod for TIDAL that provides a simple plugin and theme system.

i have no interest in maintaining software that nobody wants to contribute to. if you want to make your own thing, i highly prefer that you commit to it.

## screenshot(s)
![a screenshot of the neptune settings tab](https://github.com/uwu/neptune/raw/master/assets/neptune-screenshot.png)

## how can i install neptune?
you can download the neptune installer [here](https://github.com/uwu/neptune-installer/releases).

### NixOS

> [!WARNING]
> TIDAL-HIFI right now is colliding with neptune when trying to login
>
> create a nix-shell with tidal-hifi and login once, after that you can use the neptune package

you install this package as an overlay

add as an input in your flakes:
```nix 
  inputs = {
    neptune = {
      url = "github.com:uwu/neptune";
      inputs.nixpkgs.follows = "nixpkgs";
    }
  };
```

configure your package system to use this overlay:
```nix
nixpkgs.overlays = [ inputs.neptune.overlays.default ];
```

and then just add neptune as a package:
```nix
enivronment.systemPackages = [ pkgs.neptune ];
```

After that you can find TIDAL-HIFI as program in your system

## developing plugins for neptune
neptune exfiltrates every single action one can do in TIDAL into an easily accessible API found on `window.neptune.actions`.

TIDAL is built on [Redux](https://redux.js.org) and neptune's actions are simply exfiltrated Redux actions, which are explained in [this document](https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow#actions) on Redux's website.

neptune includes full type definitions for all of TIDAL's actions.

To get the global Redux store's state, you can use `window.neptune.store.getState()`. The return value of `getState()` will change as a direct result of actions.

To intercept and subscribe to actions, you can use `window.neptune.intercept("category/ACTION_NAME", ([payload]) => {})`, with the first argument being the name (or an array of names) of the action(s) to subscribe to, and the second argument being a function that gets called upon that action being ran. If you return `true` the action will automatically be cancelled.

A template for making neptune plugins is available [here](https://github.com/uwu/neptune-template).
