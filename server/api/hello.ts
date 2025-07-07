export default function handler(req: any, res: any) {
  res.status(200).json({
    message: 'Hello from Mantaevert API!',
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method
  });
}