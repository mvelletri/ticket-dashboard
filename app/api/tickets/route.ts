import { NextResponse } from "next/server";
import { getSheetRows } from "@/lib/google-sheets";

export async function GET() {
  try {
    const tickets = await getSheetRows();

    return NextResponse.json({
      success: true,
      total: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, error: "Erro ao buscar dados da planilha" },
      { status: 500 }
    );
  }
}