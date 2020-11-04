# gPrime

![Github Actions Status](https://github.com/GenealogyCollective/gprime/workflows/Build/badge.svg)

This is an open source genealogy project built on top of JupyterLab
and Gramps. The goal is to make an excellent, modern, genealogy program
that works on the web.

![gPrime Screenshot](docs/gprime.png)

gPrime uses Gramps for all of the underlying data structures, data bases,
view, and model data. However, it will take advantage of Gramps sqlite
database directly where it can for speed.

gPrime is a JupyterLab extension. This extension is composed of a
Python package named `gprime_server` for the server extension and a
NPM package named `gprime` for the frontend extension.

To use gPrime you will need:

1. a working installation of [gramps](https://gramps-project.org/blog/)
2. a working installation of JupyterLab 3.0

First use Gramps to import or otherwise enter your genealogy
data. Make sure you have your `GRAMPS_RESOURCES` environment variable
defined.

3. Install gprime from git

```
pip install git+https://github.com:GenealogyCollective/gprime
```

## Requirements

* JupyterLab >= 3.0
* gramps >= 5.1

## Install

```bash
pip install gprime_server
```

## Troubleshooting

If you are seeing the frontend extension, but it is not working, check
that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled, but you are not seeing
the frontend extension, check the frontend extension is installed:

```bash
jupyter labextension list
```


## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the gprime_server directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Uninstall

```bash
pip uninstall gprime_server
jupyter labextension uninstall gprime
```
