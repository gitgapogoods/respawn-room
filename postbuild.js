import fs from 'fs'
import path from 'path'
const distClient = path.join(process.cwd(), 'dist', 'client')
const assetsDir = path.join(distClient, 'assets')
const files = fs.readdirSync(assetsDir)
const mainJs = files.find(f => f.startsWith('main-') && f.endsWith('.js'))
const appCss = files.find(f => f.startsWith('app-') && f.endsWith('.css'))
if (mainJs && appCss) {
  const indexPath = path.join(distClient, 'index.html')
  let indexContent = fs.readFileSync(indexPath, 'utf-8')
  indexContent = indexContent.replace(
    '<script type="module" src="/src/main.tsx"></script>',
    `<script type="module" crossorigin src="/assets/${mainJs}"></script><link rel="stylesheet" crossorigin href="/assets/${appCss}">`
  )
  fs.writeFileSync(indexPath, indexContent)
}
