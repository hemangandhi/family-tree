with import <nixpkgs> {};

stdenv.mkDerivation {
  name = "family-tree-env";
  buildInputs = [
    emacs26Packages.editorconfig
    emacs26Packages.company
    emacs26Packages.eglot
    emacs26Packages.cargo
    # ng editor
    emacs26Packages.ng2-mode
    # JS deps
    nodejs-12_x
    yarn
    nodePackages."@angular/cli"
  ];
}
