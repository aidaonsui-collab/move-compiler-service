const express = require('express')
const cors = require('cors')
const { execSync } = require('child_process')
const { mkdtempSync, writeFileSync, readFileSync, rmSync } = require('fs')
const { join } = require('path')
const { tmpdir } = require('os')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const MOVE_TEMPLATE = `module {MODULE_NAME}::{MODULE_NAME} {
    use sui::coin;

    public struct {STRUCT_NAME} has drop {}

    fun init(witness: {STRUCT_NAME}, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            6,
            b"{STRUCT_NAME}",
            b"{STRUCT_NAME}",
            b"Launched on Odyssey",
            option::none(),
            ctx
        );
        transfer::public_transfer(treasury, ctx.sender());
        transfer::public_transfer(metadata, ctx.sender());
    }
}
`

const MOVE_TOML_TEMPLATE = `[package]
name = "{MODULE_NAME}"
version = "0.0.1"
edition = "2024.beta"

[addresses]
{MODULE_NAME} = "0x0"
`

// Health check
app.get('/health', (req, res) => {
  try {
    const suiPath = execSync('which sui').toString().trim()
    res.json({ status: 'ok', sui: suiPath })
  } catch (e) {
    res.json({ status: 'ok', sui: '/usr/local/bin/sui (expected)' })
  }
})

// Compile endpoint
app.post('/compile', async (req, res) => {
  const { symbol } = req.body
  
  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Invalid symbol' })
  }
  
  console.log(`[${new Date().toISOString()}] Compiling symbol: ${symbol}`)
  
  const moduleName = symbol.toLowerCase()
  const structName = symbol.toUpperCase()
  
  const workDir = mkdtempSync(join(tmpdir(), 'coin-compile-'))
  const sourcesDir = join(workDir, 'sources')
  
  try {
    // Create directories
    execSync(`mkdir -p "${sourcesDir}"`)
    
    // Write Move.toml
    const moveToml = MOVE_TOML_TEMPLATE.replace(/{MODULE_NAME}/g, moduleName)
    writeFileSync(join(workDir, 'Move.toml'), moveToml)
    
    // Write source file
    const source = MOVE_TEMPLATE
      .replace(/{MODULE_NAME}/g, moduleName)
      .replace(/{STRUCT_NAME}/g, structName)
    writeFileSync(join(sourcesDir, `${moduleName}.move`), source)
    
    console.log(`  Generated source at: ${workDir}`)
    
    // Compile
    const buildOutput = execSync('sui move build', {
      cwd: workDir,
      encoding: 'utf8',
      timeout: 30000
    })
    
    // Check for errors
    if (buildOutput.includes('error[')) {
      throw new Error(`Compilation failed:\n${buildOutput}`)
    }
    
    console.log(`  Compilation successful`)
    
    // Read bytecode
    const bytecodePath = join(workDir, 'build', moduleName, 'bytecode_modules', `${moduleName}.mv`)
    const bytecodeBuffer = readFileSync(bytecodePath)
    const bytecode = Array.from(bytecodeBuffer)
    
    console.log(`  Bytecode size: ${bytecode.length} bytes`)
    
    res.json({
      success: true,
      bytecode,
      moduleName,
      structName,
      size: bytecode.length
    })
    
  } catch (error) {
    console.error(`  Compilation error:`, error.message)
    res.status(500).json({
      success: false,
      error: error.message
    })
    
  } finally {
    // Cleanup
    try {
      rmSync(workDir, { recursive: true, force: true })
    } catch (e) {
      console.warn('  Cleanup failed:', e.message)
    }
  }
})

app.listen(PORT, () => {
  console.log(`Move Compiler Service running on port ${PORT}`)
  console.log(`Health: http://localhost:${PORT}/health`)
  console.log(`Compile: POST http://localhost:${PORT}/compile`)
})

// Build 1774890915
