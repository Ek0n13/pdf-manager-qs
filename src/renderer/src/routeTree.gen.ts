/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SkataImport } from './routes/skata'
import { Route as ViewPathModalImport } from './routes/view.$path.modal'

// Create Virtual Routes

const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const SkataRoute = SkataImport.update({
  id: '/skata',
  path: '/skata',
  getParentRoute: () => rootRoute,
} as any)

const IndexLazyRoute = IndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const ViewPathModalRoute = ViewPathModalImport.update({
  id: '/view/$path/modal',
  path: '/view/$path/modal',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/skata': {
      id: '/skata'
      path: '/skata'
      fullPath: '/skata'
      preLoaderRoute: typeof SkataImport
      parentRoute: typeof rootRoute
    }
    '/view/$path/modal': {
      id: '/view/$path/modal'
      path: '/view/$path/modal'
      fullPath: '/view/$path/modal'
      preLoaderRoute: typeof ViewPathModalImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/skata': typeof SkataRoute
  '/view/$path/modal': typeof ViewPathModalRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/skata': typeof SkataRoute
  '/view/$path/modal': typeof ViewPathModalRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/skata': typeof SkataRoute
  '/view/$path/modal': typeof ViewPathModalRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/skata' | '/view/$path/modal'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/skata' | '/view/$path/modal'
  id: '__root__' | '/' | '/skata' | '/view/$path/modal'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  SkataRoute: typeof SkataRoute
  ViewPathModalRoute: typeof ViewPathModalRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  SkataRoute: SkataRoute,
  ViewPathModalRoute: ViewPathModalRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/skata",
        "/view/$path/modal"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/skata": {
      "filePath": "skata.tsx"
    },
    "/view/$path/modal": {
      "filePath": "view.$path.modal.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
