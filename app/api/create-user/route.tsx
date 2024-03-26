import type { NextApiRequest } from "next";
import { NextResponse } from 'next/server'

export async function POST(
  req: NextApiRequest,
) {
  const { name, email, password } = req.body;
  const user = { name, email, password };

  return NextResponse.json(user, { status: 201 }); // Respond with a 201 status code for resource creation
}
