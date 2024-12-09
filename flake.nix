{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };

  outputs = inputs:
    let
      neptuneOverlay = final: prev: 
        let
          neptune-src = prev.fetchzip {
            url = "https://github.com/uwu/neptune/archive/548f93b.zip";
            sha256 = "sha256-oI/bRjL6zjsaA8p8QTeJEB5k+SXkJqSJ/hEAltDenok=";
          };
        in
        {
          # Use the already existing package tidal-hifi and inject neptune in it
          tidal-hifi = prev.tidal-hifi.overrideAttrs (old: {
            
            # Patch neptune into tidal-hifi
            # Needing to override the full thing to get everything from the install phase
            installPhase = ''
              runHook preInstall

              mkdir -p "$out/bin"
              cp -R "opt" "$out"
              cp -R "usr/share" "$out/share"
              chmod -R g-w "$out"

              cp -r ${neptune-src}/injector/ $out/opt/tidal-hifi/resources/app/
              mv $out/opt/tidal-hifi/resources/app.asar $out/opt/tidal-hifi/resources/original.asar
              
              runHook postInstall

            '';
          });

          # declare a new package named neptune that uses the new tidal-hifi
          neptune = final.tidal-hifi;
        };
      
      system = "x86_64-linux"; # This setting is based on my system, change if needed

      # The Module Configuration
      # Disclaimer: There is no module configuration yet, because I dont have a solution myself, to get access to the InnoDB

    in {
      # Overlay used by other flakes
      overlays.default = neptuneOverlay;

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
