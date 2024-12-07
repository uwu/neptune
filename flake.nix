{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };

  outputs = inputs:
    let
      neptuneOverlay = final: prev: 

      let
        neptune-src = prev.fetchzip {
          url = "https://github.com/uwu/neptune/archive/refs/heads/master.zip";
          sha256 = "sha256-6aFIQyZwlqaiyVpZa9CVj3Hf94BJRSAKHEQl5QH/Xvw=";
        };
      in

      {
        # Use the already existing package tidal-hifi and inject neptune in it
        tidal-hifi = prev.tidal-hifi.overrideAttrs (old: {
          # Patch neptune into tidal-hifi
          installPhase = old.installPhase or "" + ''
            cp -r ${neptune-src}/injector/ $out/opt/tidal-hifi/resources/app/
            mv $out/opt/tidal-hifi/resources/app.asar $out/opt/tidal-hifi/resources/original.asar
            
          '';
        });

        # declare a new package named neptune that uses the new tidal-hifi
        neptune = final.tidal-hifi;
      };

      system = "x86_64-linux"; # This setting is based on my system, change if needed

      # The Module Configuration
      module = 
      { isNixOsModule ? false, ... }:
      { config, lib, pkgs, ... }:
      with lib;
      let
        cfg = config.programs.neptune;
      in {
        options.programs.neptune = {
          enable = mkEnableOption "Wheter or not to enable the experimental TIDAL client neptune";
          package = mkOption {
            type = types.package;
            default = pkgs.neptune;
            example = pkgs.tidal-hifi; # Wont be able to use plugins/themes
          };

          plugins = mkOption {
            type = (types.listOf types.strMatching "(https?://(?:www.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\s]{2,}|https?://(?:www.|(?!www))[a-zA-Z0-9]+.[^\s]{2,}|www.[a-zA-Z0-9]+.[^\s]{2,})"); # Only Accept URLs
            default = [];
            example = [
              "https://inrixia.github.io/neptune-plugins/DiscordRPC" # Discord RPC
              "https://inrixia.github.io/neptune-plugins/TidalTags" # Tag System for bitrate
            ];
          };

          themes = mkOption {
            type = (types.listOf types.strMatching "(https?://(?:www.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\s]{2,}|https?://(?:www.|(?!www))[a-zA-Z0-9]+.[^\s]{2,}|www.[a-zA-Z0-9]+.[^\s]{2,})"); # Only Accept URLs
            default = [];
            example = [
              "https://raw.githubusercontent.com/Inrixia/neptune-plugins/refs/heads/master/themes/blur.css" # Blur Theme
            ];
          };
        };

        config = mkIf cfg.enable {
          # Install package if it is a NixOsModule for NixOS or if it is a home-manager module, for home-manager
          environment.systemPackages = if isNixOsModule then [ cfg.package ] else []; 
          home.packages = if isNixOsModule then [ ] else [ cfg.package ]; 


        };
      };

    in {

      # Testing the overlay/package
      devShells."${system}".default = let
        pkgs = import inputs.nixpkgs { 
          inherit system; 
          overlays = [ neptuneOverlay ];
        };
        in pkgs.mkShell {
          packages = [ pkgs.neptune ];
          shellHook = '' ${pkgs.neptune}/bin/tidal-hifi ''; # Activating the package/overlay
        };
    };
}
