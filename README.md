# Butler WhatsApp

## CLI Tool

### Send WhatsApp messages for local development:

```bash
npx tsx src/cli/test.ts <phone_number> <message>
```

Example:
```bash
npx tsx src/cli/test.ts "16266160365" "Hello from CLI!"
```

### Test message handling logic:

```bash
npx tsx src/cli/test-handle-message.ts <user_id> <message>
```

Example:
```bash
npx tsx src/cli/test-handle-message.ts "1234567890" "Hello, this is a test message!"
``` 