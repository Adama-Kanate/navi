import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function isTableMissingError(code?: string) {
  // Postgres undefined_table: https://www.postgresql.org/docs/current/errcodes-appendix.html
  return code === "42P01";
}

function isColumnMissingError(code?: string) {
  // Postgres undefined_column.
  return code === "42703";
}

type DeletePlanStep = {
  table: string;
  userColumns: string[];
  optional: boolean;
};

async function deleteRowsForUser(
  adminSupabase: SupabaseClient,
  userId: string,
  step: DeletePlanStep
) {
  console.log(`[delete-account] deleting table=${step.table} userId=${userId}`);

  let sawColumnMismatch = false;
  let lastErrorMessage = "";

  for (const column of step.userColumns) {
    const { error } = await adminSupabase.from(step.table).delete().eq(column, userId);

    if (!error) {
      console.log(`[delete-account] ok table=${step.table} column=${column}`);
      return { ok: true as const };
    }

    lastErrorMessage = error.message;

    if (isTableMissingError(error.code)) {
      console.warn(`[delete-account] skip table=${step.table} reason=missing_table`);
      return { ok: true as const };
    }

    if (isColumnMissingError(error.code)) {
      sawColumnMismatch = true;
      console.warn(
        `[delete-account] column mismatch table=${step.table} tried=${column}, trying next candidate`
      );
      continue;
    }

    if (step.optional) {
      console.warn(
        `[delete-account] optional table failed table=${step.table} column=${column} code=${error.code || "unknown"} message=${error.message}`
      );
      return { ok: true as const };
    }

    console.error(
      `[delete-account] failed table=${step.table} column=${column} code=${error.code || "unknown"} message=${error.message}`
    );
    return {
      ok: false as const,
      status: 500,
      body: {
        error: `Failed to delete rows in ${step.table}.`,
        details: error.message,
      },
    };
  }

  if (sawColumnMismatch) {
    if (step.optional) {
      console.warn(
        `[delete-account] optional table skipped table=${step.table} reason=no_matching_user_reference_column`
      );
      return { ok: true as const };
    }

    console.error(
      `[delete-account] required table failed table=${step.table} reason=no_matching_user_reference_column`
    );
    return {
      ok: false as const,
      status: 500,
      body: {
        error: `Failed to delete rows in ${step.table}.`,
        details: `No matching user reference column found. Last error: ${lastErrorMessage}`,
      },
    };
  }

  // Defensive fallback: should never happen, but keep a clear server response.
  return {
    ok: false as const,
    status: 500,
    body: {
      error: `Failed to delete rows in ${step.table}.`,
      details: "Unknown deletion state.",
    },
  };
}

async function handleDeleteAccount() {
  try {
    const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseAnonKey = getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

    const cookieStore = await cookies();

    // This client uses request cookies to securely identify the currently authenticated user.
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Service-role client is only used on the server to perform privileged deletes.
    const adminSupabase = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1) Delete app rows first (children -> parent-ish) to reduce FK risk before auth deletion.
    //    user_plans is treated as optional because some deployments do not have/use it.
    const deletePlan: DeletePlanStep[] = [
      { table: "plan_tasks", userColumns: ["user_id"], optional: false },
      { table: "user_active_paths", userColumns: ["user_id"], optional: false },
      { table: "user_plans", userColumns: ["user_id", "profile_id", "id"], optional: true },
      // profiles in this project is typically keyed by id = auth user id.
      { table: "profiles", userColumns: ["id", "user_id"], optional: false },
    ];

    for (const step of deletePlan) {
      const result = await deleteRowsForUser(adminSupabase, userId, step);
      if (!result.ok) {
        return NextResponse.json(result.body, { status: result.status });
      }
    }

    // 2) Delete the auth user last.
    console.log(`[delete-account] deleting auth user userId=${userId}`);
    const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error(
        `[delete-account] failed auth deletion userId=${userId} code=${deleteUserError.code || "unknown"} message=${deleteUserError.message}`
      );
      return NextResponse.json(
        { error: "Failed to delete auth user.", details: deleteUserError.message },
        { status: 500 }
      );
    }

    console.log(`[delete-account] success userId=${userId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  return handleDeleteAccount();
}

// Optional alias for clients that call POST endpoints for destructive actions.
export async function POST() {
  return handleDeleteAccount();
}
