const fs = require('fs')
const path = require('path')

const bundlePath = path.resolve(__dirname, '../packages/angular/dist/angular.bundle.js')
const bundle = fs.readFileSync(bundlePath, 'utf8')

const bootstrapMarker = 'platformBrowserDynamic().bootstrapModule(AppModule)'
const bootstrapFunctionMarker = 'function bootstrapStratusAngular()'
const scheduledBootstrapMarker = 'setTimeout(() => bootstrapStratusAngular());'
const requiredBeforeBootstrap = [
  'System.register(["@angular/cdk/a11y"',
  'System.register(["@angular/forms", "@angular/core", "froala-editor"]',
  'System.register(["@angular/core", "@stratusjs/angular/froala/editor/froala-editor.directive"]'
]

const bootstrapIndex = bundle.indexOf(bootstrapMarker)
const bootstrapFunctionIndex = bundle.indexOf(bootstrapFunctionMarker)
const scheduledBootstrapIndex = bundle.indexOf(scheduledBootstrapMarker)

if (bootstrapIndex === -1) {
  console.error(`Missing Angular bootstrap marker in ${bundlePath}`)
  process.exit(1)
}

if (bootstrapFunctionIndex === -1) {
  console.error(`Missing delayed Angular bootstrap function in ${bundlePath}`)
  process.exit(1)
}

if (scheduledBootstrapIndex === -1) {
  console.error(`Angular bootstrap must be scheduled after bundle registration in ${bundlePath}`)
  process.exit(1)
}

if (bootstrapIndex < bootstrapFunctionIndex || bootstrapIndex > scheduledBootstrapIndex) {
  console.error(`Angular bootstrap must only run from the delayed bootstrap function in ${bundlePath}`)
  process.exit(1)
}

for (const marker of requiredBeforeBootstrap) {
  const markerIndex = bundle.indexOf(marker)

  if (markerIndex === -1) {
    console.error(`Missing expected Angular bundle module marker: ${marker}`)
    process.exit(1)
  }
}

console.log('Angular bundle order is valid.')
