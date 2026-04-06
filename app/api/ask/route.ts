export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  return Response.json({
    result: "ask api working",
  })
}