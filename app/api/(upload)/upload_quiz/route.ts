import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Extract data from the request body
    const { topic, desc, selectedCourses, dueDate, duration, questions } =
      await request.json();

    // Validation: Check required fields
    if (
      !topic ||
      !desc ||
      !dueDate ||
      !(selectedCourses?.length > 0) ||
      !duration
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!questions || questions.length < 1) {
      return NextResponse.json(
        { error: "At least one question is required" },
        { status: 400 }
      );
    }

    await query({
      query: "BEGIN;",
      values: [],
    });

    // Insert quiz details into the quiz table
    const quizInsertQuery = `
      INSERT INTO quiz (q_topic, q_desc, q_upload_date, q_due_date, q_time) 
      VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4) RETURNING q_id;
    `;
    const quizValues = [topic, desc, dueDate, duration || null];
    const quizResult = await query({
      query: quizInsertQuery,
      values: quizValues,
    });

    if (!quizResult || quizResult.length === 0) {
      throw new Error("Failed to insert quiz");
    }

    const quizId = quizResult[0].q_id;

    // Insert questions into the `questions` table
    const questionsInsertQuery = `
        INSERT INTO questions (question, ques_opt_A, ques_opt_B, ques_opt_C, ques_opt_D, ques_correct_opt, q_id) 
        VALUES ${[...questions.keys()]
          .map(
            (index) =>
              `($${index * 7 + 1}, $${index * 7 + 2}, $${index * 7 + 3}, $${
                index * 7 + 4
              }, $${index * 7 + 5}, $${index * 7 + 6}, $${index * 7 + 7})`
          )
          .join(", ")}
      `;

    const questionValues = questions.flatMap(
      (q: {
        question: string;
        optA: string;
        optB: string;
        optC: string;
        optD: string;
        correctOpt: string;
      }) => [q.question, q.optA, q.optB, q.optC, q.optD, q.correctOpt, quizId]
    );

    await query({ query: questionsInsertQuery, values: questionValues });

    // Insert course relations into the quiz_course table
    const courseInsertQuery =
      `
      INSERT INTO quiz_course (q_id, c_id) VALUES ` +
      [...selectedCourses.keys()]
        .map((index) => `($1, $${index + 2})`)
        .join(", ") +
      `;`;

    const courseValues = [quizId, ...selectedCourses];
    await query({ query: courseInsertQuery, values: courseValues });

    await query({
      query: "COMMIT;",
      values: [],
    });

    return NextResponse.json({ success: true, quizId });
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      { error: "Failed to insert quiz data" },
      { status: 500 }
    );
  }
}
