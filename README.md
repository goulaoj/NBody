# N-Body Gravitational Simulation

A numerical simulation of gravitational dynamics, implemented in C++ and deployed as an interactive browser application using WebAssembly.

**[Try the simulation live](https://goulaoj.github.io/NBody/)**

## Overview

This project explores the dynamics of gravitational systems by numerically solving the equations of motion for interacting bodies in two dimensions.

The simulation calculates the gravitational acceleration of each body due to the others and evolves their positions and velocities over time. The browser interface allows users to modify initial conditions and observe how these changes affect the resulting trajectories.

The live demonstration is configured around the **Kepler two-body problem**, using Earth–Moon parameters as its initial conditions.

## Features

- **Gravitational dynamics:** Computes the mutual gravitational forces between bodies with configurable masses and initial conditions.
- **Numerical integration:** Implements the fourth-order Runge–Kutta (RK4) method to integrate the equations of motion.
- **Interactive simulation:** Adjust initial positions, velocities, masses, the gravitational constant and the time step directly in the browser.
- **Energy calculations:** Computes kinetic, potential and total mechanical energy.
- **Angular momentum:** Calculates the system's total angular momentum.
- **Web deployment:** Runs the C++ simulation in the browser through WebAssembly, with a JavaScript interface.





## Physics and numerical methods

The simulation models a system of gravitationally interacting bodies by numerically integrating Newton's equations of motion.

The gravitational acceleration of each body is calculated from the positions and masses of the remaining bodies. The equations of motion are integrated using the **fourth-order Runge–Kutta (RK4) method**, a standard numerical method for solving ordinary differential equations.

The simulation also calculates the system's total mechanical energy, combining kinetic and gravitational potential energy, as well as its angular momentum. These quantities provide useful diagnostics for studying the system's dynamical evolution and the numerical behaviour of the simulation.



## Implementation

The project combines C++ for the numerical simulation with JavaScript and WebAssembly for browser execution.

| Component | Purpose |
|---|---|
| `NBody.cpp` / `NBody.h` | Gravitational dynamics and physical quantities |
| `ODEsolver.cpp` / `ODEsolver.h` | Numerical integration using RK4 |
| `ODEpoint.cpp` / `ODEpoint.h` | Representation of the system state |
| `app.js` | Browser interface |
| `index.html` | Web application structure |
| `nbody.js` / `nbody.wasm` | JavaScript/WebAssembly runtime and compiled simulation |

## How to use

1. Open the [live simulation](https://goulaoj.github.io/NBody/).
2. Modify the initial conditions for the two bodies, including their masses, positions and velocities.
3. Adjust the gravitational constant and time step if desired.
4. Select **Start** to run the simulation and **Pause** to stop it.
5. Use the available controls to center the view, follow either body, reset the simulation or inspect the energy.

## Technologies

- **C++** — numerical simulation and gravitational dynamics
- **JavaScript** — interactive browser interface
- **WebAssembly (Emscripten)** — execution of the compiled C++ code in the browser
- **HTML** — web application structure

## Purpose

This project combines classical mechanics, numerical methods and software development to make gravitational dynamics accessible through an interactive simulation.

It was developed as a computational physics project and serves as an exploration of numerical integration, dynamical systems and the implementation of scientific simulations for the web.
