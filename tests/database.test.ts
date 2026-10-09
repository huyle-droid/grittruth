import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, it, expect } from "vitest";
let db: PGlite;
const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222",
  campaign = "33333333-3333-4333-8333-333333333333";
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema public,auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;insert into auth.users values('${a}'),('${b}');`,
  );
  await db.exec(readFileSync("supabase/migrations/001_initial.sql", "utf8"));
  await db.exec(
    readFileSync("supabase/migrations/002_field_limits.sql", "utf8"),
  );
  await db.exec(
    `insert into public.campaigns(id,user_id,name) values('${campaign}','${a}','Owner campaign');insert into public.brands(user_id,name,category,audience,personality,tone) values('${a}','Owner brand','Goods','Independent people','Grounded','Direct');`,
  );
}, 30000);
afterAll(async () => {
  await db.close();
});
async function asUser(id: string) {
  await db.exec(
    `reset role;set role authenticated;select set_config('request.jwt.claim.sub','${id}',false);`,
  );
}
it("owner can read their brand; other users cannot", async () => {
  await asUser(a);
  expect((await db.query("select * from public.brands")).rows).toHaveLength(1);
  await asUser(b);
  expect((await db.query("select * from public.brands")).rows).toHaveLength(0);
});
it("cross-user insert is denied by the database", async () => {
  await asUser(b);
  await expect(
    db.exec(
      `insert into public.drafts(user_id,title,type,content,source) values('${a}','Stolen','Ad copy','No access','edited')`,
    ),
  ).rejects.toThrow();
});
it("cross-user update and delete affect no rows", async () => {
  await asUser(b);
  expect(
    (
      await db.query(
        `update public.campaigns set name='Changed' where id='${campaign}' returning id`,
      )
    ).rows,
  ).toHaveLength(0);
  expect(
    (
      await db.query(
        `delete from public.campaigns where id='${campaign}' returning id`,
      )
    ).rows,
  ).toHaveLength(0);
  await asUser(a);
  expect(
    (await db.query<{ name: string }>("select name from public.campaigns"))
      .rows[0].name,
  ).toBe("Owner campaign");
});
it("cannot attach a draft to another user's campaign", async () => {
  await asUser(b);
  await expect(
    db.exec(
      `insert into public.drafts(user_id,campaign_id,title,type,content,source) values('${b}','${campaign}','Bad link','Ad copy','Test','edited')`,
    ),
  ).rejects.toThrow();
});
it("anonymous database access is denied", async () => {
  await db.exec("reset role;set role anon;");
  await expect(db.query("select * from public.brands")).rejects.toThrow();
  await expect(
    db.query("select public.consume_generation()"),
  ).rejects.toThrow();
});
it("daily quota is atomic and cannot be reset through direct table access", async () => {
  await asUser(a);
  for (let i = 0; i < 30; i++) {
    expect(
      (
        await db.query<{ allowed: boolean }>(
          "select public.consume_generation() as allowed",
        )
      ).rows[0].allowed,
    ).toBe(true);
  }
  expect(
    (
      await db.query<{ allowed: boolean }>(
        "select public.consume_generation() as allowed",
      )
    ).rows[0].allowed,
  ).toBe(false);
  await expect(
    db.exec("delete from public.generation_usage"),
  ).rejects.toThrow();
  await asUser(b);
  expect(
    (
      await db.query<{ allowed: boolean }>(
        "select public.consume_generation() as allowed",
      )
    ).rows[0].allowed,
  ).toBe(true);
});
it("campaign deletion cascades only to its own drafts", async () => {
  await asUser(a);
  await db.exec(
    `insert into public.drafts(user_id,campaign_id,title,type,content,source) values('${a}','${campaign}','Saved','Ad copy','Test','edited');delete from public.campaigns where id='${campaign}';`,
  );
  expect((await db.query("select * from public.drafts")).rows).toHaveLength(0);
});

it("database rejects oversized brand data through direct access", async () => {
  await asUser(a);
  await expect(
    db.query("update public.brands set context=$1 where user_id=$2", [
      "x".repeat(3001),
      a,
    ]),
  ).rejects.toThrow();
});
