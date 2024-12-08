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
