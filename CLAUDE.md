# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript library that provides utilities for working with discriminated unions in React Hook Form. The library offers type-safe form handling when working with forms that have different shapes based on discriminant values.

## Build and Development

- **Build**: `bunchee` - Uses bunchee to bundle the library
- **Package manager**: pnpm (based on pnpm-lock.yaml presence)
- **Module type**: ES module with dual CJS/ESM exports

## Core Architecture

The library exports two main utilities:

### `useFormTypeguard` (src/useFormTypegurard.ts)
A React hook that provides runtime type checking for discriminated union forms. It:
- Takes a form and a discriminant object
- Returns a type guard that narrows the form type based on discriminant values
- Uses `useWatch` from react-hook-form for reactive updates
- Leverages es-toolkit for object manipulation and flattening

### `createDiscriminatedFormCtx` (src/createDiscriminatedFormCtx.ts)
A factory function that creates typed form context hooks for discriminated forms:
- Generic over form values and discriminant key
- Returns a hook that provides type-safe access to form context based on discriminant value
- Uses React Hook Form's `useFormContext` internally

## TypeScript Configuration

- Strict mode enabled with comprehensive type checking
- Target: ES2022 with bundler module resolution
- Configured for library development with verbatim module syntax
- Unused locals/parameters checking enabled

## Dependencies

- **Peer dependencies**: React (16.8+) and react-hook-form (7.61+)
- **Runtime dependencies**: es-toolkit for utility functions
- **Dev dependencies**: type-fest for advanced TypeScript types
- **Bundler**: bunchee for dual CJS/ESM output

The library is designed as a lightweight utility package that extends react-hook-form's capabilities for discriminated union scenarios.