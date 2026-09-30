with open('server/server.ts', 'r') as f:
    content = f.read()

content = content.replace("app.get(\"/api/listings/:id/photos\", async (req: Request, res: Response) => {", "app.get(\"/api/listings/:id/photos\", async (req, res) => {")

with open('server/server.ts', 'w') as f:
    f.write(content)
