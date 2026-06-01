import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { artifacts, exhibitions } from '../src/content';

type IssueLevel = 'error' | 'warn';
type Issue = { level: IssueLevel; message: string };

function uniqCheck(values: string[], label: string): Issue[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) dup.add(v);
    seen.add(v);
  }
  return dup.size
    ? [{ level: 'error', message: `${label} 存在重复：${Array.from(dup).join(', ')}` }]
    : [];
}

function main() {
  const issues: Issue[] = [];

  // 1) ID 唯一性
  issues.push(...uniqCheck(artifacts.map((a) => a.id), 'Artifact ID'));
  issues.push(...uniqCheck(exhibitions.map((e) => e.id), 'Exhibition ID'));
  issues.push(
    ...uniqCheck(
      exhibitions.flatMap((e) => e.units.map((u) => u.id)),
      'Unit ID'
    )
  );

  // 2) 字段必填（可按需改为 warn）
  for (const a of artifacts) {
    if (!a.title?.trim()) issues.push({ level: 'warn', message: `artifact ${a.id} title 为空（建议补齐）` });
    if (!a.description?.trim()) issues.push({ level: 'warn', message: `artifact ${a.id} description 为空` });
    if (!a.source?.trim()) issues.push({ level: 'warn', message: `artifact ${a.id} source 为空` });
    if (!a.imageUrls?.length) issues.push({ level: 'warn', message: `artifact ${a.id} imageUrls 为空（将使用 fallback）` });
  }

  // 3) 图片存在性：/import/* 必须存在 public/import/*
  const publicImportDir = path.resolve(process.cwd(), 'public', 'import');
  for (const a of artifacts) {
    for (const url of a.imageUrls ?? []) {
      if (!url) continue;
      if (!url.startsWith('/import/')) continue;
      const filename = url.replace('/import/', '');
      const filePath = path.join(publicImportDir, filename);
      if (!existsSync(filePath)) {
        issues.push({
          level: 'error',
          message: `artifact ${a.id} 引用图片不存在：${url}（应位于 public/import/${filename}）`
        });
      }
    }
  }

  // 4) 引用完整性：unit.artifacts 的 id 必须在 artifacts 表中存在
  const artifactIdSet = new Set(artifacts.map((a) => a.id));
  for (const ex of exhibitions) {
    for (const u of ex.units) {
      for (const a of u.artifacts) {
        if (!artifactIdSet.has(a.id)) {
          issues.push({
            level: 'error',
            message: `exhibition ${ex.id} unit ${u.id} 引用了不存在的 artifact：${a.id}`
          });
        }
      }
    }
  }

  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');

  if (errors.length === 0 && warns.length === 0) {
    console.log('✅ 内容校验通过：未发现问题');
    return;
  }

  if (errors.length) {
    console.log(`\n❌ Errors (${errors.length})`);
    for (const e of errors) console.log(`- ${e.message}`);
  }
  if (warns.length) {
    console.log(`\n⚠️  Warnings (${warns.length})`);
    for (const w of warns) console.log(`- ${w.message}`);
  }

  process.exit(errors.length ? 1 : 0);
}

main();
