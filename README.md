# Move Compiler Service

Standalone microservice for compiling Move bytecode with custom token names.

## Why This Exists

Vercel serverless functions don't have `sui` CLI, so we run a separate service with Sui installed.

## Local Development

```bash
npm install
npm start
# Service runs on http://localhost:3001
```

## Test It

```bash
curl -X POST http://localhost:3001/compile \
  -H "Content-Type: application/json" \
  -d '{"symbol":"BOB"}'
```

## Deploy to Railway

1. Push this folder to a Git repo
2. Create new Railway project
3. Link the repo
4. Railway will auto-detect Dockerfile and deploy
5. Copy the public URL (e.g., `https://move-compiler.up.railway.app`)
6. Set `MOVE_COMPILER_URL` env var in Vercel to that URL

## Environment Variables

None required! Service auto-detects Sui CLI.

## API

### POST /compile
Request:
```json
{
  "symbol": "BOB"
}
```

Response:
```json
{
  "success": true,
  "bytecode": [161, 28, 235, ...],
  "moduleName": "bob",
  "structName": "BOB",
  "size": 572
}
```

### GET /health
Returns service status and Sui CLI path.
